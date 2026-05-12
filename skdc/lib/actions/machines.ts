"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { MachineCategory, MachineFormat, MachineChannel, Prisma } from "@prisma/client";
import { requireWorkspaceId } from "@/lib/auth-helpers";

const MachineInput = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  manufacturer: z.string().min(2, "اسم المُصنع مطلوب"),
  model: z.string().optional().nullable(),
  adapterId: z.string().min(1, "اختر adapter"),
  category: z.nativeEnum(MachineCategory),
  preferredFormat: z.nativeEnum(MachineFormat),
  channel: z.nativeEnum(MachineChannel).default("FILE_DOWNLOAD"),
  endpoint: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type MachineInputType = z.input<typeof MachineInput>;

export async function listMachines() {
  const workspaceId = await requireWorkspaceId();
  return db.machine.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createMachine(raw: unknown) {
  const workspaceId = await requireWorkspaceId();
  const parsed = MachineInput.parse(raw);
  const machine = await db.machine.create({
    data: {
      workspaceId,
      ...parsed,
      model: parsed.model || null,
      endpoint: parsed.endpoint || null,
      notes: parsed.notes || null,
      credentials: {} as Prisma.InputJsonValue,
    },
  });
  revalidatePath("/dashboard/settings");
  return machine;
}

export async function updateMachine(id: string, raw: unknown) {
  const workspaceId = await requireWorkspaceId();
  const parsed = MachineInput.parse(raw);
  const existing = await db.machine.findFirst({ where: { id, workspaceId } });
  if (!existing) throw new Error("NOT_FOUND");
  const machine = await db.machine.update({
    where: { id },
    data: {
      ...parsed,
      model: parsed.model || null,
      endpoint: parsed.endpoint || null,
      notes: parsed.notes || null,
    },
  });
  revalidatePath("/dashboard/settings");
  return machine;
}

export async function deleteMachine(id: string) {
  const workspaceId = await requireWorkspaceId();
  const existing = await db.machine.findFirst({ where: { id, workspaceId } });
  if (!existing) throw new Error("NOT_FOUND");
  await db.machine.delete({ where: { id } });
  revalidatePath("/dashboard/settings");
  return { ok: true };
}
