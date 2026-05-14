"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { RoomShape } from "@prisma/client";
import { requireWorkspaceId } from "@/lib/auth-helpers";

/**
 * Wall geometry presets per shape — used when a designer first picks a shape.
 * Naming: A=front, B=right, C=back, D=left, clockwise. Room space is the
 * X (width) × Z (depth) plane, with the room's anchor at (0,0).
 */
const SHAPE_PRESETS: Record<
  RoomShape,
  (w: number, d: number, h: number) => Array<{
    label: string;
    orderIndex: number;
    length: number;
    height: number;
    startX: number;
    startZ: number;
    endX: number;
    endZ: number;
    angleDeg: number;
  }>
> = {
  SINGLE_WALL: (w, _d, h) => [
    { label: "A", orderIndex: 0, length: w, height: h,
      startX: 0, startZ: 0, endX: w, endZ: 0, angleDeg: 0 },
  ],
  TWO_WALL: (w, d, h) => [
    { label: "A", orderIndex: 0, length: w, height: h,
      startX: 0, startZ: 0, endX: w, endZ: 0, angleDeg: 0 },
    { label: "C", orderIndex: 2, length: w, height: h,
      startX: w, startZ: d, endX: 0, endZ: d, angleDeg: 180 },
  ],
  L_SHAPE: (w, d, h) => [
    { label: "A", orderIndex: 0, length: w, height: h,
      startX: 0, startZ: 0, endX: w, endZ: 0, angleDeg: 0 },
    { label: "B", orderIndex: 1, length: d, height: h,
      startX: w, startZ: 0, endX: w, endZ: d, angleDeg: 90 },
  ],
  U_SHAPE: (w, d, h) => [
    { label: "A", orderIndex: 0, length: w, height: h,
      startX: 0, startZ: 0, endX: w, endZ: 0, angleDeg: 0 },
    { label: "B", orderIndex: 1, length: d, height: h,
      startX: w, startZ: 0, endX: w, endZ: d, angleDeg: 90 },
    { label: "C", orderIndex: 2, length: w, height: h,
      startX: w, startZ: d, endX: 0, endZ: d, angleDeg: 180 },
  ],
  CLOSED: (w, d, h) => [
    { label: "A", orderIndex: 0, length: w, height: h,
      startX: 0, startZ: 0, endX: w, endZ: 0, angleDeg: 0 },
    { label: "B", orderIndex: 1, length: d, height: h,
      startX: w, startZ: 0, endX: w, endZ: d, angleDeg: 90 },
    { label: "C", orderIndex: 2, length: w, height: h,
      startX: w, startZ: d, endX: 0, endZ: d, angleDeg: 180 },
    { label: "D", orderIndex: 3, length: d, height: h,
      startX: 0, startZ: d, endX: 0, endZ: 0, angleDeg: 270 },
  ],
  ISLAND: (w, d, h) =>
    SHAPE_PRESETS.CLOSED(w, d, h),
  CUSTOM: () => [],
};

const DEFAULT_ROOM = { width: 4000, depth: 3000, height: 2700 };

const WallUpdateInput = z.object({
  label: z.string().min(1).max(4).optional(),
  length: z.coerce.number().positive().max(20_000).optional(),
  height: z.coerce.number().positive().max(10_000).optional(),
  thickness: z.coerce.number().positive().max(500).optional(),
  hasWindow: z.boolean().optional(),
  windowOffset: z.coerce.number().nonnegative().optional().nullable(),
  windowWidth: z.coerce.number().positive().optional().nullable(),
  windowHeight: z.coerce.number().positive().optional().nullable(),
  windowSill: z.coerce.number().nonnegative().optional().nullable(),
  hasDoor: z.boolean().optional(),
  doorOffset: z.coerce.number().nonnegative().optional().nullable(),
  doorWidth: z.coerce.number().positive().optional().nullable(),
  doorHeight: z.coerce.number().positive().optional().nullable(),
  wallMaterial: z.string().optional().nullable(),
});

const ShapeInput = z.object({
  shape: z.nativeEnum(RoomShape),
  hasIsland: z.boolean().optional(),
  islandWidth: z.coerce.number().positive().optional(),
  islandDepth: z.coerce.number().positive().optional(),
  islandX: z.coerce.number().optional(),
  islandZ: z.coerce.number().optional(),
});

/**
 * Resolve a design by projectId, scoped to the current workspace.
 * Throws if the project doesn't belong to the user's workspace.
 */
async function resolveDesign(projectId: string) {
  const workspaceId = await requireWorkspaceId();
  const project = await db.project.findFirst({
    where: { id: projectId, workspaceId },
    select: { id: true, roomWidth: true, roomDepth: true, roomHeight: true },
  });
  if (!project) throw new Error("NOT_FOUND");
  let design = await db.design.findUnique({
    where: { projectId },
    select: { id: true, shape: true },
  });
  if (!design) {
    const created = await db.design.create({
      data: { projectId, data: {} },
      select: { id: true, shape: true },
    });
    design = created;
  }
  return { project, design };
}

/**
 * Sets (or changes) the room shape on a project's design and regenerates the
 * walls from the shape preset using the project's room dimensions.
 *
 * Idempotent in spirit but destructive on walls: switching shapes wipes the
 * existing wall set. The caller is expected to confirm with the user first.
 */
export async function setRoomShape(projectId: string, raw: unknown) {
  const { project, design } = await resolveDesign(projectId);
  const parsed = ShapeInput.parse(raw);

  const w = project.roomWidth ?? DEFAULT_ROOM.width;
  const d = project.roomDepth ?? DEFAULT_ROOM.depth;
  const h = project.roomHeight ?? DEFAULT_ROOM.height;

  const wallsToCreate = SHAPE_PRESETS[parsed.shape](w, d, h);

  await db.$transaction([
    db.roomWall.deleteMany({ where: { designId: design.id } }),
    db.design.update({
      where: { id: design.id },
      data: {
        shape: parsed.shape,
        hasIsland: parsed.shape === "ISLAND" ? true : parsed.hasIsland ?? false,
        islandWidth: parsed.islandWidth ?? (parsed.shape === "ISLAND" ? 1800 : null),
        islandDepth: parsed.islandDepth ?? (parsed.shape === "ISLAND" ? 900 : null),
        islandX: parsed.islandX ?? (parsed.shape === "ISLAND" ? w / 2 : null),
        islandZ: parsed.islandZ ?? (parsed.shape === "ISLAND" ? d / 2 : null),
      },
    }),
    ...wallsToCreate.map((wall) =>
      db.roomWall.create({
        data: {
          designId: design.id,
          label: wall.label,
          orderIndex: wall.orderIndex,
          length: wall.length,
          height: wall.height,
          startX: wall.startX,
          startZ: wall.startZ,
          endX: wall.endX,
          endZ: wall.endZ,
          angleDeg: wall.angleDeg,
        },
      }),
    ),
  ]);

  revalidatePath(`/dashboard/projects/${projectId}/studio`);
  return { ok: true, wallsCreated: wallsToCreate.length };
}

export async function listWalls(projectId: string) {
  const { design } = await resolveDesign(projectId);
  return db.roomWall.findMany({
    where: { designId: design.id },
    orderBy: { orderIndex: "asc" },
  });
}

export async function getWall(wallId: string) {
  const workspaceId = await requireWorkspaceId();
  return db.roomWall.findFirst({
    where: {
      id: wallId,
      design: { project: { workspaceId } },
    },
  });
}

export async function updateWall(wallId: string, raw: unknown) {
  const workspaceId = await requireWorkspaceId();
  const parsed = WallUpdateInput.parse(raw);

  // Workspace-scope guard
  const existing = await db.roomWall.findFirst({
    where: { id: wallId, design: { project: { workspaceId } } },
    select: { id: true, designId: true, design: { select: { project: { select: { id: true } } } } },
  });
  if (!existing) throw new Error("NOT_FOUND");

  const updated = await db.roomWall.update({
    where: { id: wallId },
    data: parsed,
  });

  if (existing.design.project.id) {
    revalidatePath(`/dashboard/projects/${existing.design.project.id}/studio`);
  }
  return updated;
}

export async function setIsland(
  projectId: string,
  data: { hasIsland: boolean; width?: number; depth?: number; x?: number; z?: number },
) {
  const { design } = await resolveDesign(projectId);
  await db.design.update({
    where: { id: design.id },
    data: {
      hasIsland: data.hasIsland,
      islandWidth: data.hasIsland ? data.width ?? 1800 : null,
      islandDepth: data.hasIsland ? data.depth ?? 900 : null,
      islandX: data.hasIsland ? data.x ?? null : null,
      islandZ: data.hasIsland ? data.z ?? null : null,
    },
  });
  revalidatePath(`/dashboard/projects/${projectId}/studio`);
  return { ok: true };
}

export async function getDesignShape(projectId: string) {
  const { design } = await resolveDesign(projectId);
  return db.design.findUnique({
    where: { id: design.id },
    select: {
      shape: true,
      hasIsland: true,
      islandWidth: true,
      islandDepth: true,
      islandX: true,
      islandZ: true,
    },
  });
}
