/**
 * SKDC MCP Tools — server-side tool implementations.
 *
 * These tools allow an AI (Claude / ChatGPT / Cursor) to operate on the
 * authenticated user's workspace via the MCP protocol. Each tool is a thin
 * wrapper around an existing server action — no business logic duplication.
 *
 * Auth model: the MCP server validates a bearer token (issued by our auth
 * provider) and resolves it to a user → workspace. All operations are
 * workspace-scoped.
 */

import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

// ---------- Tool schemas ----------

export const ListTemplatesInput = z.object({
  category: z
    .enum([
      "LOWER_CABINET",
      "UPPER_CABINET",
      "CORNER",
      "TALL_CABINET",
      "DRAWER",
      "APPLIANCE",
      "ACCESSORY",
    ])
    .optional()
    .describe("Optional category filter"),
});

export const ListCustomersInput = z.object({
  search: z.string().optional().describe("Optional search by name"),
});

export const CreateCustomerInput = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const CreateProjectInput = z.object({
  name: z.string().min(2),
  customerId: z.string().optional().describe("Optional customer to link"),
  roomWidth: z.number().positive().optional().describe("Room width in mm"),
  roomDepth: z.number().positive().optional().describe("Room depth in mm"),
  roomHeight: z.number().positive().optional().describe("Room height in mm"),
  notes: z.string().optional(),
});

export const AddUnitToProjectInput = z.object({
  projectId: z.string(),
  templateId: z.string().describe("Template to instantiate"),
  x: z.number().describe("X position in mm (room coordinates)"),
  y: z.number().describe("Y position in mm"),
  overrideWidth: z.number().positive().optional(),
  overrideHeight: z.number().positive().optional(),
  overrideDepth: z.number().positive().optional(),
});

export const ExportProjectInput = z.object({
  projectId: z.string(),
  adapterId: z
    .enum(["generic-beamsaw-dxf", "generic-cnc-gcode", "generic-csv", "generic-json"])
    .describe("Machine adapter to use for export"),
});

// ---------- Tool implementations (workspace-scoped) ----------

export async function listTemplatesTool(
  workspaceId: string,
  input: z.infer<typeof ListTemplatesInput>,
) {
  const templates = await db.template.findMany({
    where: {
      OR: [{ workspaceId: null }, { workspaceId }],
      ...(input.category ? { category: input.category } : {}),
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
  return templates.map((t) => ({
    id: t.id,
    name: t.name,
    category: t.category,
    dimensions: {
      width: t.defaultWidth,
      height: t.defaultHeight,
      depth: t.defaultDepth,
    },
    options: t.options,
    isCustom: !!t.workspaceId,
  }));
}

export async function listCustomersTool(
  workspaceId: string,
  input: z.infer<typeof ListCustomersInput>,
) {
  const customers = await db.customer.findMany({
    where: {
      workspaceId,
      ...(input.search
        ? { name: { contains: input.search, mode: "insensitive" } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return customers;
}

export async function createCustomerTool(
  workspaceId: string,
  input: z.infer<typeof CreateCustomerInput>,
) {
  return db.customer.create({
    data: {
      workspaceId,
      name: input.name,
      phone: input.phone ?? null,
      email: input.email ?? null,
      address: input.address ?? null,
      notes: input.notes ?? null,
    },
  });
}

export async function createProjectTool(
  workspaceId: string,
  input: z.infer<typeof CreateProjectInput>,
) {
  return db.project.create({
    data: {
      workspaceId,
      name: input.name,
      customerId: input.customerId ?? null,
      roomWidth: input.roomWidth ?? null,
      roomDepth: input.roomDepth ?? null,
      roomHeight: input.roomHeight ?? null,
      notes: input.notes ?? null,
      design: { create: { data: {} } },
    },
    include: { design: true },
  });
}

export async function addUnitToProjectTool(
  workspaceId: string,
  input: z.infer<typeof AddUnitToProjectInput>,
) {
  const project = await db.project.findFirst({
    where: { id: input.projectId, workspaceId },
    include: { design: true },
  });
  if (!project) throw new Error("PROJECT_NOT_FOUND");

  const template = await db.template.findFirst({
    where: { id: input.templateId, OR: [{ workspaceId: null }, { workspaceId }] },
  });
  if (!template) throw new Error("TEMPLATE_NOT_FOUND");

  const current = (project.design?.data ?? { units: [] }) as {
    units: Array<Record<string, unknown>>;
    room?: { width: number; depth: number; height: number };
  };

  const newUnit = {
    id: `u_${Math.random().toString(36).slice(2, 10)}`,
    templateId: template.id,
    templateName: template.name,
    category: template.category,
    x: input.x,
    y: input.y,
    width: input.overrideWidth ?? template.defaultWidth,
    depth: input.overrideDepth ?? template.defaultDepth,
    height: input.overrideHeight ?? template.defaultHeight,
    rotation: 0,
    color: "#a78bfa",
  };

  const nextData = {
    ...current,
    units: [...(current.units ?? []), newUnit],
  };

  const dataInput = nextData as unknown as Prisma.InputJsonValue;
  await db.design.upsert({
    where: { projectId: project.id },
    create: { projectId: project.id, data: dataInput },
    update: { data: dataInput },
  });

  return { ok: true, unitId: newUnit.id, unitCount: nextData.units.length };
}

export async function listProjectsTool(workspaceId: string) {
  return db.project.findMany({
    where: { workspaceId },
    include: { customer: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });
}
