"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { TemplateCategory, Prisma } from "@prisma/client";
import { requireWorkspaceId } from "@/lib/auth-helpers";

const TemplateInput = z.object({
  name: z.string().min(2).max(120),
  category: z.nativeEnum(TemplateCategory),
  imageUrl: z.string().url().optional().nullable().or(z.literal("")),
  defaultWidth: z.coerce.number().positive().max(10_000),
  defaultHeight: z.coerce.number().positive().max(10_000),
  defaultDepth: z.coerce.number().positive().max(10_000),
  options: z.record(z.string(), z.unknown()).optional().default({}),
});

export type TemplateInputType = z.infer<typeof TemplateInput>;

/** Lists global + workspace-scoped templates the user can use. */
export async function listTemplates() {
  const workspaceId = await requireWorkspaceId();
  return db.template.findMany({
    where: { OR: [{ workspaceId: null }, { workspaceId }] },
    orderBy: [{ workspaceId: "asc" }, { category: "asc" }, { name: "asc" }],
  });
}

/** Creates a custom template owned by the current workspace. */
export async function createWorkspaceTemplate(raw: unknown) {
  const workspaceId = await requireWorkspaceId();
  const parsed = TemplateInput.parse(raw);
  const template = await db.template.create({
    data: {
      workspaceId,
      name: parsed.name,
      category: parsed.category,
      imageUrl: parsed.imageUrl || null,
      defaultWidth: parsed.defaultWidth,
      defaultHeight: parsed.defaultHeight,
      defaultDepth: parsed.defaultDepth,
      options: (parsed.options ?? {}) as Prisma.InputJsonValue,
    },
  });
  revalidatePath("/dashboard/templates");
  return template;
}

export async function deleteWorkspaceTemplate(id: string) {
  const workspaceId = await requireWorkspaceId();
  const existing = await db.template.findFirst({ where: { id, workspaceId } });
  if (!existing) throw new Error("NOT_FOUND_OR_GLOBAL");
  await db.template.delete({ where: { id } });
  revalidatePath("/dashboard/templates");
  return { ok: true };
}
