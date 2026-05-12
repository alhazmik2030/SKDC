"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireWorkspaceId } from "@/lib/auth-helpers";
import { loadAdapter, findAdapter } from "@/lib/machines";
import type { CutPlan, CutPiece, NestedSheet } from "@/lib/machines";
import type { DesignerState, DesignerUnit } from "@/components/designer/types";

/**
 * Convert the canvas DesignerState into the canonical CutPlan.
 *
 * This is a minimal, deterministic mapper. Each unit becomes 3 cut pieces
 * (top/bottom/side panels) — a placeholder for the real BOM expansion which
 * will come in Phase 5+ (proper unit-to-pieces formulas + nesting).
 */
function designToCutPlan(args: {
  projectId: string;
  projectName: string;
  workspaceId: string;
  workspaceName: string;
  design: DesignerState;
  defaultMaterialId: string;
}): CutPlan {
  const pieces: CutPiece[] = [];

  for (const unit of args.design.units) {
    pieces.push(...unitToPieces(unit, args.defaultMaterialId));
  }

  // Single-sheet placement: no nesting yet — emit one sheet per piece.
  const sheets: NestedSheet[] = pieces.map((p, i) => ({
    sheetId: `S${(i + 1).toString().padStart(3, "0")}`,
    stock: {
      materialId: p.materialId,
      thickness: p.thickness,
      width: 1220,
      length: 2440,
    },
    placements: [
      {
        pieceId: p.id,
        x: 10,
        y: 10,
        rotation: 0,
      },
    ],
  }));

  return {
    projectId: args.projectId,
    projectName: args.projectName,
    workspaceId: args.workspaceId,
    workspaceName: args.workspaceName,
    createdAt: new Date().toISOString(),
    pieces,
    sheets,
    totals: {
      pieceCount: pieces.length,
      sheetCount: sheets.length,
      edgeBandingMeters: 0,
      boreCount: 0,
      estimatedWastePercent: 0,
    },
  };
}

function unitToPieces(unit: DesignerUnit, materialId: string): CutPiece[] {
  // Minimal BOM: side × 2, top, bottom, back (placeholder).
  const t = 18; // mm — typical panel thickness
  return [
    {
      id: `${unit.id}-side-L`,
      label: `${unit.templateName} — جنب أيسر`,
      length: unit.height,
      width: unit.depth,
      thickness: t,
      materialId,
      grain: "LENGTH",
      quantity: 1,
      sourceUnitId: unit.id,
    },
    {
      id: `${unit.id}-side-R`,
      label: `${unit.templateName} — جنب أيمن`,
      length: unit.height,
      width: unit.depth,
      thickness: t,
      materialId,
      grain: "LENGTH",
      quantity: 1,
      sourceUnitId: unit.id,
    },
    {
      id: `${unit.id}-top`,
      label: `${unit.templateName} — علوي`,
      length: unit.width - t * 2,
      width: unit.depth,
      thickness: t,
      materialId,
      grain: "WIDTH",
      quantity: 1,
      sourceUnitId: unit.id,
    },
    {
      id: `${unit.id}-bottom`,
      label: `${unit.templateName} — سفلي`,
      length: unit.width - t * 2,
      width: unit.depth,
      thickness: t,
      materialId,
      grain: "WIDTH",
      quantity: 1,
      sourceUnitId: unit.id,
    },
    {
      id: `${unit.id}-back`,
      label: `${unit.templateName} — ظهر`,
      length: unit.width,
      width: unit.height,
      thickness: 4,
      materialId,
      grain: "NONE",
      quantity: 1,
      sourceUnitId: unit.id,
    },
  ];
}

/**
 * Generate an export for a project using the specified adapter.
 * Returns the encoded contents + records a MachineExport row for audit.
 */
export async function generateExport(args: { projectId: string; adapterId: string }) {
  const workspaceId = await requireWorkspaceId();

  const project = await db.project.findFirst({
    where: { id: args.projectId, workspaceId },
    include: { design: true, workspace: { select: { name: true } } },
  });
  if (!project) throw new Error("PROJECT_NOT_FOUND");

  const entry = findAdapter(args.adapterId);
  if (!entry) throw new Error("ADAPTER_NOT_FOUND");
  if (entry.status === "PLANNED") {
    throw new Error("ADAPTER_NOT_IMPLEMENTED");
  }

  const adapter = await loadAdapter(args.adapterId);

  // Find a default material for this workspace (first one).
  const defaultMaterial = await db.material.findFirst({
    where: { workspaceId },
    orderBy: { createdAt: "asc" },
  });
  const defaultMaterialId = defaultMaterial?.id ?? "unspecified";

  const design = (project.design?.data ?? { units: [], room: { width: 0, depth: 0, height: 0 } }) as DesignerState;

  const plan = designToCutPlan({
    projectId: project.id,
    projectName: project.name,
    workspaceId,
    workspaceName: project.workspace.name,
    design,
    defaultMaterialId,
  });

  const encoded = await adapter.encode(plan);

  // Record audit log.
  await db.machineExport.create({
    data: {
      projectId: project.id,
      adapterId: args.adapterId,
      format: adapter.outputFormat,
      status: "READY",
      filename: encoded.filename,
      meta: {
        pieceCount: plan.pieces.length,
        sheetCount: plan.sheets.length,
      },
    },
  });

  revalidatePath(`/dashboard/projects/${project.id}`);

  return {
    filename: encoded.filename,
    mimeType: encoded.mimeType,
    contents:
      typeof encoded.contents === "string"
        ? encoded.contents
        : Buffer.from(encoded.contents).toString("base64"),
    isBase64: typeof encoded.contents !== "string",
    totals: plan.totals,
  };
}

export async function listProjectExports(projectId: string) {
  const workspaceId = await requireWorkspaceId();
  // Verify ownership
  const project = await db.project.findFirst({ where: { id: projectId, workspaceId } });
  if (!project) throw new Error("NOT_FOUND");
  return db.machineExport.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}
