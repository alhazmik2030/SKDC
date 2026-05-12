"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import {
  createApiToken as createApiTokenLib,
  listApiTokens as listApiTokensLib,
  revokeApiToken as revokeApiTokenLib,
  type ApiTokenRecord,
} from "@/lib/api-tokens";

const CreateTokenInput = z.object({
  name: z.string().min(1, "اسم المفتاح مطلوب").max(60, "الاسم طويل جداً"),
});

export type ListedToken = Omit<ApiTokenRecord, "hash" | "userId">;

function stripSecrets(record: ApiTokenRecord): ListedToken {
  // Hash is sensitive; userId is irrelevant for the UI list.
  const { hash: _hash, userId: _userId, ...rest } = record;
  void _hash;
  void _userId;
  return rest;
}

export async function listTokens(): Promise<ListedToken[]> {
  const { workspace } = await getCurrentWorkspace();
  const records = await listApiTokensLib(workspace.id);
  return records.map(stripSecrets);
}

export async function createToken(raw: unknown): Promise<{
  token: string;
  record: ListedToken;
}> {
  const { workspace, user } = await getCurrentWorkspace();
  const parsed = CreateTokenInput.parse(raw);
  const { token, record } = await createApiTokenLib({
    workspaceId: workspace.id,
    userId: user.id,
    name: parsed.name,
  });
  revalidatePath("/dashboard/settings");
  return { token, record: stripSecrets(record) };
}

export async function revokeToken(id: string): Promise<{ ok: true }> {
  const { workspace } = await getCurrentWorkspace();
  await revokeApiTokenLib(id, workspace.id);
  revalidatePath("/dashboard/settings");
  return { ok: true };
}
