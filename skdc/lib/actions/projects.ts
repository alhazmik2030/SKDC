"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { ProjectStatus, DesignStyle } from "@prisma/client";
import { requireWorkspaceId } from "@/lib/auth-helpers";

const ProjectInput = z.object({
  name: z.string().min(2).max(120),
  customerId: z.string().cuid().optional().nullable().or(z.literal("")),
  status: z.nativeEnum(ProjectStatus).default("DRAFT"),
  designStyle: z.nativeEnum(DesignStyle).optional().nullable(),
  roomWidth: z.coerce.number().positive().max(20_000).optional().nullable(),
  roomDepth: z.coerce.number().positive().max(20_000).optional().nullable(),
  roomHeight: z.coerce.number().positive().max(10_000).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export type ProjectInputType = z.infer<typeof ProjectInput>;

export async function listProjects() {
  const workspaceId = await requireWorkspaceId();
  return db.project.findMany({
    where: { workspaceId },
    include: { customer: { select: { id: true, name: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getProject(id: string) {
  const workspaceId = await requireWorkspaceId();
  return db.project.findFirst({
    where: { id, workspaceId },
    include: { customer: true, design: true },
  });
}

export async function createProject(raw: unknown) {
  const workspaceId = await requireWorkspaceId();
  const parsed = ProjectInput.parse(raw);
  const project = await db.project.create({
    data: {
      workspaceId,
      name: parsed.name,
      customerId: parsed.customerId || null,
      status: parsed.status,
      designStyle: parsed.designStyle ?? null,
      roomWidth: parsed.roomWidth ?? null,
      roomDepth: parsed.roomDepth ?? null,
      roomHeight: parsed.roomHeight ?? null,
      notes: parsed.notes || null,
      design: { create: { data: {} } },
    },
    include: { design: true },
  });
  revalidatePath("/dashboard/projects");
  return project;
}

export async function updateProject(id: string, raw: unknown) {
  const workspaceId = await requireWorkspaceId();
  const parsed = ProjectInput.parse(raw);
  const existing = await db.project.findFirst({ where: { id, workspaceId } });
  if (!existing) throw new Error("NOT_FOUND");

  const project = await db.project.update({
    where: { id },
    data: {
      name: parsed.name,
      customerId: parsed.customerId || null,
      status: parsed.status,
      designStyle: parsed.designStyle ?? null,
      roomWidth: parsed.roomWidth ?? null,
      roomDepth: parsed.roomDepth ?? null,
      roomHeight: parsed.roomHeight ?? null,
      notes: parsed.notes || null,
    },
  });
  revalidatePath("/dashboard/projects");
  return project;
}

export async function deleteProject(id: string) {
  const workspaceId = await requireWorkspaceId();
  const existing = await db.project.findFirst({ where: { id, workspaceId } });
  if (!existing) throw new Error("NOT_FOUND");
  await db.project.delete({ where: { id } });
  revalidatePath("/dashboard/projects");
  return { ok: true };
}

/** Save the 2D/3D design data JSON for a project. */
export async function saveDesign(projectId: string, data: unknown) {
  const workspaceId = await requireWorkspaceId();
  const project = await db.project.findFirst({ where: { id: projectId, workspaceId } });
  if (!project) throw new Error("NOT_FOUND");
  await db.design.upsert({
    where: { projectId },
    create: { projectId, data: data as object },
    update: { data: data as object },
  });
  revalidatePath(`/dashboard/projects/${projectId}`);
  return { ok: true };
}
