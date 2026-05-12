"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { requireWorkspaceId } from "@/lib/auth-helpers";
import type { DesignerState, DesignerUnit } from "@/components/designer/types";

const TAX_RATE = 0.15; // 15% VAT (KSA)
const MARGIN_RATE = 0.3; // 30% workshop margin over material cost
const DEFAULT_PRICE_PER_M2 = 250; // SAR fallback

export interface InvoiceLineItem {
  label: string;
  category: string;
  quantity: number;
  widthMm: number;
  depthMm: number;
  heightMm: number;
  surfaceM2: number;
  unitPrice: number;
  total: number;
}

function estimateUnitPrice(unit: DesignerUnit, pricePerM2: number): InvoiceLineItem {
  // Estimate surface: ~5 panels per unit (sides x2, top, bottom, back)
  // Excludes APPLIANCE (just placement reference, no manufacturing).
  const w = unit.width / 1000;
  const d = unit.depth / 1000;
  const h = unit.height / 1000;

  let surface = 0;
  if (unit.category !== "APPLIANCE") {
    surface = 2 * h * d + 2 * w * d + w * h; // 2 sides + top+bottom + back
  }

  const materialCost = surface * pricePerM2;
  const total = materialCost * (1 + MARGIN_RATE);

  return {
    label: unit.templateName,
    category: unit.category,
    quantity: 1,
    widthMm: unit.width,
    depthMm: unit.depth,
    heightMm: unit.height,
    surfaceM2: Math.round(surface * 100) / 100,
    unitPrice: Math.round(total * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

/**
 * Generates (or refreshes) an invoice for a project based on its design data.
 * The invoice is auto-numbered: INV-{year}-{seq}.
 */
export async function generateInvoiceForProject(projectId: string) {
  const workspaceId = await requireWorkspaceId();

  const project = await db.project.findFirst({
    where: { id: projectId, workspaceId },
    include: { design: true, customer: true, workspace: true },
  });
  if (!project) throw new Error("PROJECT_NOT_FOUND");

  const design = (project.design?.data ?? { units: [] }) as DesignerState;
  if (!Array.isArray(design.units) || design.units.length === 0) {
    throw new Error("DESIGN_HAS_NO_UNITS");
  }

  // Determine a default material price from the workspace's first non-glass material.
  const defaultMaterial = await db.material.findFirst({
    where: { workspaceId, type: { not: "GLASS" } },
    orderBy: { createdAt: "asc" },
  });
  const pricePerM2 = defaultMaterial?.pricePerM2 || DEFAULT_PRICE_PER_M2;

  const lineItems: InvoiceLineItem[] = design.units.map((u) => estimateUnitPrice(u, pricePerM2));
  const subtotal = lineItems.reduce((sum, l) => sum + l.total, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  // Build next invoice number: INV-{year}-{seq for this project}
  const year = new Date().getFullYear();
  const existingCount = await db.invoice.count({ where: { projectId } });
  const number = `INV-${year}-${String(existingCount + 1).padStart(4, "0")}`;

  const invoice = await db.invoice.create({
    data: {
      projectId,
      number,
      status: "DRAFT",
      subtotal: Math.round(subtotal * 100) / 100,
      discount: 0,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
      currency: "SAR",
      lineItems: lineItems as unknown as Prisma.InputJsonValue,
      issuedAt: new Date(),
    },
  });

  revalidatePath(`/dashboard/projects/${projectId}`);
  return invoice;
}

export async function listProjectInvoices(projectId: string) {
  const workspaceId = await requireWorkspaceId();
  const project = await db.project.findFirst({ where: { id: projectId, workspaceId } });
  if (!project) throw new Error("PROJECT_NOT_FOUND");
  return db.invoice.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInvoiceForPrint(id: string) {
  const workspaceId = await requireWorkspaceId();
  const invoice = await db.invoice.findFirst({
    where: { id, project: { workspaceId } },
    include: {
      project: {
        include: { customer: true, workspace: true },
      },
    },
  });
  if (!invoice) throw new Error("NOT_FOUND");
  return invoice;
}

export async function deleteInvoice(id: string) {
  const workspaceId = await requireWorkspaceId();
  const invoice = await db.invoice.findFirst({
    where: { id, project: { workspaceId } },
  });
  if (!invoice) throw new Error("NOT_FOUND");
  await db.invoice.delete({ where: { id } });
  revalidatePath(`/dashboard/projects/${invoice.projectId}`);
  return { ok: true };
}
