import { createHash, randomBytes } from "crypto";
import { db } from "@/lib/db";

const PREFIX_VISIBLE = 12;
const TOKEN_PREFIX = "skdc_";

export type ApiTokenRecord = {
  id: string;
  workspaceId: string;
  userId: string;
  name: string;
  prefix: string;
  hash: string;
  lastUsedAt: Date | null;
  createdAt: Date;
  revokedAt: Date | null;
};

type DbWithTokens = {
  apiToken: {
    create: (args: { data: Omit<ApiTokenRecord, "id" | "createdAt" | "lastUsedAt" | "revokedAt"> & { lastUsedAt?: null; revokedAt?: null } }) => Promise<ApiTokenRecord>;
    findUnique: (args: { where: { hash: string } }) => Promise<ApiTokenRecord | null>;
    findMany: (args: { where: Record<string, unknown>; orderBy?: Record<string, "asc" | "desc"> }) => Promise<ApiTokenRecord[]>;
    update: (args: { where: { id: string }; data: Partial<ApiTokenRecord> }) => Promise<ApiTokenRecord>;
    delete: (args: { where: { id: string } }) => Promise<ApiTokenRecord>;
  };
};

function tokens() {
  return (db as unknown as DbWithTokens).apiToken;
}

export function generateRawToken(): string {
  return TOKEN_PREFIX + randomBytes(24).toString("base64url");
}

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function extractPrefix(raw: string): string {
  return raw.slice(0, PREFIX_VISIBLE);
}

/**
 * Creates a new API token. Stores only the hash; returns the plaintext exactly once.
 */
export async function createApiToken(params: {
  workspaceId: string;
  userId: string;
  name: string;
}): Promise<{ token: string; record: ApiTokenRecord }> {
  const token = generateRawToken();
  const record = await tokens().create({
    data: {
      workspaceId: params.workspaceId,
      userId: params.userId,
      name: params.name.trim() || "Untitled",
      prefix: extractPrefix(token),
      hash: hashToken(token),
    },
  });
  return { token, record };
}

/**
 * Verifies a Bearer token from the Authorization header.
 * Returns the workspaceId on success, or null if invalid/revoked.
 * Also bumps lastUsedAt as a side effect.
 */
export async function verifyBearerToken(authHeader: string | null): Promise<{
  workspaceId: string;
  userId: string;
  tokenId: string;
} | null> {
  if (!authHeader) return null;
  const m = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  const raw = m[1].trim();
  if (!raw.startsWith(TOKEN_PREFIX)) return null;

  const hash = hashToken(raw);
  const record = await tokens().findUnique({ where: { hash } });
  if (!record || record.revokedAt) return null;

  // Best-effort lastUsedAt — don't await failures
  tokens()
    .update({ where: { id: record.id }, data: { lastUsedAt: new Date() } })
    .catch(() => {});

  return {
    workspaceId: record.workspaceId,
    userId: record.userId,
    tokenId: record.id,
  };
}

export async function listApiTokens(workspaceId: string): Promise<ApiTokenRecord[]> {
  return tokens().findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });
}

export async function revokeApiToken(id: string, workspaceId: string): Promise<void> {
  await tokens().update({
    where: { id },
    data: { revokedAt: new Date() },
  });
  // (workspaceId is for caller-side authorization check; we keep update narrow.)
  void workspaceId;
}
