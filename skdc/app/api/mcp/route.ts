/**
 * SKDC MCP HTTP endpoint (JSON-RPC 2.0).
 *
 * Implements a minimal subset of the Model Context Protocol over Streamable
 * HTTP, sufficient for Claude Desktop / Cursor to:
 *   - initialize
 *   - tools/list
 *   - tools/call
 *
 * Auth: the bearer token here is a placeholder. In production we'll wire
 * proper OAuth 2.1 with PKCE per MCP spec. For now we accept the user's
 * NextAuth session via cookies (works when the AI runs in same browser).
 *
 * Tools exposed:
 *   - list_templates       (read)
 *   - list_customers       (read)
 *   - list_projects        (read)
 *   - create_customer      (write)
 *   - create_project       (write)
 *   - add_unit_to_project  (write)
 *
 * Use `claude mcp add --transport http skdc https://skdc.vercel.app/api/mcp`
 * to connect (after auth wiring).
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { verifyBearerToken } from "@/lib/api-tokens";
import {
  ListTemplatesInput,
  ListCustomersInput,
  CreateCustomerInput,
  CreateProjectInput,
  AddUnitToProjectInput,
  listTemplatesTool,
  listCustomersTool,
  createCustomerTool,
  createProjectTool,
  addUnitToProjectTool,
  listProjectsTool,
} from "@/lib/mcp/skdc-tools";

const PROTOCOL_VERSION = "2025-06-18";

// ---------- Tool registry ----------
type ToolDef = {
  name: string;
  description: string;
  inputSchema: z.ZodTypeAny;
  /** Returns plain JSON content the AI will read. */
  run: (workspaceId: string, input: unknown) => Promise<unknown>;
};

const TOOLS: ToolDef[] = [
  {
    name: "list_templates",
    description:
      "List all kitchen unit templates (global + workspace-custom). Optionally filter by category.",
    inputSchema: ListTemplatesInput,
    run: (ws, input) =>
      listTemplatesTool(ws, ListTemplatesInput.parse(input ?? {})),
  },
  {
    name: "list_customers",
    description: "List customers in the current workspace.",
    inputSchema: ListCustomersInput,
    run: (ws, input) =>
      listCustomersTool(ws, ListCustomersInput.parse(input ?? {})),
  },
  {
    name: "list_projects",
    description: "List projects in the current workspace.",
    inputSchema: z.object({}).optional(),
    run: (ws) => listProjectsTool(ws),
  },
  {
    name: "create_customer",
    description: "Create a new customer (workspace-scoped).",
    inputSchema: CreateCustomerInput,
    run: (ws, input) =>
      createCustomerTool(ws, CreateCustomerInput.parse(input)),
  },
  {
    name: "create_project",
    description:
      "Create a new kitchen design project. Optionally link to a customer and set room dimensions.",
    inputSchema: CreateProjectInput,
    run: (ws, input) =>
      createProjectTool(ws, CreateProjectInput.parse(input)),
  },
  {
    name: "add_unit_to_project",
    description:
      "Add a unit (instantiated from a template) to a project's design at position (x, y) in mm. Optionally override dimensions.",
    inputSchema: AddUnitToProjectInput,
    run: (ws, input) =>
      addUnitToProjectTool(ws, AddUnitToProjectInput.parse(input)),
  },
];

// Convert Zod to a JSON Schema-ish object (MCP requires JSON Schema).
function zodToJsonSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape as Record<string, z.ZodTypeAny>;
    const properties: Record<string, unknown> = {};
    const required: string[] = [];
    for (const [key, value] of Object.entries(shape)) {
      properties[key] = zodToJsonSchema(value);
      if (!(value instanceof z.ZodOptional) && !(value instanceof z.ZodDefault)) {
        required.push(key);
      }
    }
    return {
      type: "object",
      properties,
      required: required.length ? required : undefined,
    };
  }
  if (schema instanceof z.ZodString) return { type: "string" };
  if (schema instanceof z.ZodNumber) return { type: "number" };
  if (schema instanceof z.ZodBoolean) return { type: "boolean" };
  if (schema instanceof z.ZodEnum) {
    const opts = (schema as unknown as { options: string[] }).options;
    return { type: "string", enum: opts };
  }
  if (schema instanceof z.ZodOptional) return zodToJsonSchema((schema as z.ZodOptional<z.ZodTypeAny>).unwrap());
  if (schema instanceof z.ZodDefault) return zodToJsonSchema((schema as z.ZodDefault<z.ZodTypeAny>).removeDefault());
  return { type: "object" };
}

// ---------- JSON-RPC handler ----------
type JsonRpcRequest = {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
};

async function handleRpc(req: JsonRpcRequest, workspaceId: string) {
  switch (req.method) {
    case "initialize":
      return {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: {
          name: "skdc-mcp",
          version: "0.1.0",
        },
      };

    case "tools/list":
      return {
        tools: TOOLS.map((t) => ({
          name: t.name,
          description: t.description,
          inputSchema: zodToJsonSchema(t.inputSchema),
        })),
      };

    case "tools/call": {
      const { name, arguments: args } = (req.params ?? {}) as {
        name: string;
        arguments: unknown;
      };
      const tool = TOOLS.find((t) => t.name === name);
      if (!tool) {
        throw rpcError(-32601, `Tool not found: ${name}`);
      }
      const result = await tool.run(workspaceId, args);
      return {
        content: [
          {
            type: "text",
            text:
              typeof result === "string"
                ? result
                : JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    case "ping":
      return {};

    case "notifications/initialized":
      return null; // notifications don't return

    default:
      throw rpcError(-32601, `Method not found: ${req.method}`);
  }
}

function rpcError(code: number, message: string) {
  const err = new Error(message) as Error & { rpcCode?: number };
  err.rpcCode = code;
  return err;
}

// ---------- HTTP handlers ----------
export async function POST(request: NextRequest) {
  // Try Bearer token first (programmatic clients), then fall back to NextAuth session
  // (works when the AI runs in the user's browser).
  let workspaceId: string | null = null;
  const bearer = await verifyBearerToken(request.headers.get("authorization"));
  if (bearer) {
    workspaceId = bearer.workspaceId;
  } else {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          error: { code: -32000, message: "Unauthorized" },
          id: null,
        },
        { status: 401 },
      );
    }
    try {
      const ws = await getCurrentWorkspace();
      workspaceId = ws.workspace.id;
    } catch (e) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          error: { code: -32000, message: (e as Error).message },
          id: null,
        },
        { status: 403 },
      );
    }
  }

  let body: JsonRpcRequest | JsonRpcRequest[];
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        error: { code: -32700, message: "Parse error" },
        id: null,
      },
      { status: 400 },
    );
  }

  // Support batch
  const batch = Array.isArray(body) ? body : [body];
  const ws = workspaceId as string;
  const responses = await Promise.all(
    batch.map(async (req) => {
      try {
        const result = await handleRpc(req, ws);
        if (result === null) return null; // notification — no response
        return { jsonrpc: "2.0", id: req.id ?? null, result };
      } catch (err) {
        const code = (err as { rpcCode?: number }).rpcCode ?? -32603;
        return {
          jsonrpc: "2.0",
          id: req.id ?? null,
          error: { code, message: (err as Error).message },
        };
      }
    }),
  );

  const filtered = responses.filter(Boolean);
  if (filtered.length === 0) {
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json(Array.isArray(body) ? filtered : filtered[0]);
}

export async function GET() {
  // MCP HTTP transport optionally supports GET for SSE — we don't use it here.
  return NextResponse.json(
    {
      name: "skdc-mcp",
      version: "0.1.0",
      protocol: PROTOCOL_VERSION,
      transport: "http-jsonrpc",
      note: "POST JSON-RPC 2.0 requests to this endpoint with a valid session cookie.",
    },
    { status: 200 },
  );
}
