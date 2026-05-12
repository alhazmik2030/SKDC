"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { MaterialType } from "@prisma/client";
import { requireWorkspaceId } from "@/lib/auth-helpers";

const MaterialInput = z.object({
  name: z.string().min(2, "الاسم مطلوب").max(120),
  type: z.nativeEnum(MaterialType),
  color: z.string().max(40).optional().nullable(),
  thicknessMm: z.coerce.number().positive().max(200),
  pricePerM2: z.coerce.number().nonnegative().max(1_000_000),
});

export type MaterialInputType = z.infer<typeof MaterialInput>;

export async function listMaterials() {
  const workspaceId = await requireWorkspaceId();
  return db.material.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createMaterial(raw: unknown) {
  const workspaceId = await requireWorkspaceId();
  const parsed = MaterialInput.parse(raw);
  const material = await db.material.create({
    data: { workspaceId, ...parsed, color: parsed.color || null },
  });
  revalidatePath("/dashboard/materials");
  return material;
}

export async function updateMaterial(id: string, raw: unknown) {
  const workspaceId = await requireWorkspaceId();
  const parsed = MaterialInput.parse(raw);
  const existing = await db.material.findFirst({ where: { id, workspaceId } });
  if (!existing) throw new Error("NOT_FOUND");
  const material = await db.material.update({
    where: { id },
    data: { ...parsed, color: parsed.color || null },
  });
  revalidatePath("/dashboard/materials");
  return material;
}

export async function deleteMaterial(id: string) {
  const workspaceId = await requireWorkspaceId();
  const existing = await db.material.findFirst({ where: { id, workspaceId } });
  if (!existing) throw new Error("NOT_FOUND");
  await db.material.delete({ where: { id } });
  revalidatePath("/dashboard/materials");
  return { ok: true };
}
