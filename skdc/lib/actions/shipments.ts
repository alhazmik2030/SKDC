"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { ShipmentMode, ShipmentStatus } from "@prisma/client";
import { requireWorkspaceId } from "@/lib/auth-helpers";

// ---------------------------------------------------------------------------
// Zod schemas (defined inside module — matching project convention).
// ---------------------------------------------------------------------------

const optionalDate = z
  .union([z.string(), z.date(), z.null()])
  .optional()
  .transform((v) => {
    if (!v) return null;
    if (v instanceof Date) return v;
    const trimmed = v.trim();
    if (!trimmed) return null;
    const d = new Date(trimmed);
    return Number.isNaN(d.getTime()) ? null : d;
  });

const ShipmentInput = z.object({
  reference: z.string().min(1, "reference required").max(80),
  mode: z.nativeEnum(ShipmentMode).default("SEA_FCL"),
  carrier: z.string().max(120).optional().nullable(),
  trackingNumber: z.string().max(120).optional().nullable(),
  containerNumber: z.string().max(40).optional().nullable(),

  originFactory: z.string().max(200).optional().nullable(),
  originCity: z.string().max(120).optional().nullable(),
  originCountry: z.string().max(4).default("CN"),
  destPort: z.string().max(160).optional().nullable(),
  destCity: z.string().max(120).optional().nullable(),
  destCountry: z.string().max(4).default("SA"),

  status: z.nativeEnum(ShipmentStatus).default("PLANNED"),
  estimatedDeparture: optionalDate,
  actualDeparture: optionalDate,
  estimatedArrival: optionalDate,
  actualArrival: optionalDate,

  totalValue: z.coerce.number().nonnegative().optional().nullable(),
  shippingCost: z.coerce.number().nonnegative().optional().nullable(),
  customsDuty: z.coerce.number().nonnegative().optional().nullable(),
  currency: z.string().min(3).max(8).default("USD"),

  notes: z.string().max(4000).optional().nullable(),
});

export type ShipmentInputType = z.infer<typeof ShipmentInput>;

const ShipmentItemInput = z.object({
  description: z.string().min(1).max(500),
  qty: z.coerce.number().int().positive().default(1),
  unitValue: z.coerce.number().nonnegative().optional().nullable(),
  weightKg: z.coerce.number().nonnegative().optional().nullable(),
  volumeM3: z.coerce.number().nonnegative().optional().nullable(),
  projectId: z.string().cuid().optional().nullable().or(z.literal("")),
  customerId: z.string().cuid().optional().nullable().or(z.literal("")),
  notes: z.string().max(2000).optional().nullable(),
});

export type ShipmentItemInputType = z.infer<typeof ShipmentItemInput>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function nullable<T>(v: T | undefined | null | ""): T | null {
  if (v === undefined || v === null || v === "") return null;
  return v as T;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function listShipments() {
  const workspaceId = await requireWorkspaceId();
  return db.shipment.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { items: true } },
    },
  });
}

export async function getShipment(id: string) {
  const workspaceId = await requireWorkspaceId();
  return db.shipment.findFirst({
    where: { id, workspaceId },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
        include: {
          project: { select: { id: true, name: true } },
          customer: { select: { id: true, name: true } },
        },
      },
    },
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createShipment(raw: unknown) {
  const workspaceId = await requireWorkspaceId();
  const parsed = ShipmentInput.parse(raw);
  const shipment = await db.shipment.create({
    data: {
      workspaceId,
      reference: parsed.reference,
      mode: parsed.mode,
      carrier: nullable(parsed.carrier),
      trackingNumber: nullable(parsed.trackingNumber),
      containerNumber: nullable(parsed.containerNumber),
      originFactory: nullable(parsed.originFactory),
      originCity: nullable(parsed.originCity),
      originCountry: parsed.originCountry,
      destPort: nullable(parsed.destPort),
      destCity: nullable(parsed.destCity),
      destCountry: parsed.destCountry,
      status: parsed.status,
      estimatedDeparture: parsed.estimatedDeparture ?? null,
      actualDeparture: parsed.actualDeparture ?? null,
      estimatedArrival: parsed.estimatedArrival ?? null,
      actualArrival: parsed.actualArrival ?? null,
      totalValue: parsed.totalValue ?? null,
      shippingCost: parsed.shippingCost ?? null,
      customsDuty: parsed.customsDuty ?? null,
      currency: parsed.currency,
      notes: nullable(parsed.notes),
    },
  });
  revalidatePath("/dashboard/shipments");
  return shipment;
}

export async function updateShipment(id: string, raw: unknown) {
  const workspaceId = await requireWorkspaceId();
  const parsed = ShipmentInput.parse(raw);

  const existing = await db.shipment.findFirst({ where: { id, workspaceId } });
  if (!existing) throw new Error("NOT_FOUND");

  const shipment = await db.shipment.update({
    where: { id },
    data: {
      reference: parsed.reference,
      mode: parsed.mode,
      carrier: nullable(parsed.carrier),
      trackingNumber: nullable(parsed.trackingNumber),
      containerNumber: nullable(parsed.containerNumber),
      originFactory: nullable(parsed.originFactory),
      originCity: nullable(parsed.originCity),
      originCountry: parsed.originCountry,
      destPort: nullable(parsed.destPort),
      destCity: nullable(parsed.destCity),
      destCountry: parsed.destCountry,
      status: parsed.status,
      estimatedDeparture: parsed.estimatedDeparture ?? null,
      actualDeparture: parsed.actualDeparture ?? null,
      estimatedArrival: parsed.estimatedArrival ?? null,
      actualArrival: parsed.actualArrival ?? null,
      totalValue: parsed.totalValue ?? null,
      shippingCost: parsed.shippingCost ?? null,
      customsDuty: parsed.customsDuty ?? null,
      currency: parsed.currency,
      notes: nullable(parsed.notes),
    },
  });
  revalidatePath("/dashboard/shipments");
  revalidatePath(`/dashboard/shipments/${id}`);
  return shipment;
}

/**
 * Updates only the status. Auto-stamps actualDeparture when crossing into
 * IN_TRANSIT and actualArrival when reaching DELIVERED — unless the caller
 * passes an explicit dateOverride.
 */
export async function updateShipmentStatus(
  id: string,
  status: ShipmentStatus,
  dateOverride?: Date | string | null,
) {
  const workspaceId = await requireWorkspaceId();
  const existing = await db.shipment.findFirst({ where: { id, workspaceId } });
  if (!existing) throw new Error("NOT_FOUND");

  const now =
    dateOverride instanceof Date
      ? dateOverride
      : dateOverride
        ? new Date(dateOverride)
        : new Date();

  const data: {
    status: ShipmentStatus;
    actualDeparture?: Date | null;
    actualArrival?: Date | null;
  } = { status };

  if (status === ShipmentStatus.IN_TRANSIT && !existing.actualDeparture) {
    data.actualDeparture = now;
  }
  if (status === ShipmentStatus.DELIVERED && !existing.actualArrival) {
    data.actualArrival = now;
  }

  const shipment = await db.shipment.update({ where: { id }, data });
  revalidatePath("/dashboard/shipments");
  revalidatePath(`/dashboard/shipments/${id}`);
  return shipment;
}

export async function deleteShipment(id: string) {
  const workspaceId = await requireWorkspaceId();
  const existing = await db.shipment.findFirst({ where: { id, workspaceId } });
  if (!existing) throw new Error("NOT_FOUND");
  await db.shipment.delete({ where: { id } });
  revalidatePath("/dashboard/shipments");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Item mutations
// ---------------------------------------------------------------------------

export async function addItemToShipment(shipmentId: string, raw: unknown) {
  const workspaceId = await requireWorkspaceId();
  const parsed = ShipmentItemInput.parse(raw);

  const shipment = await db.shipment.findFirst({
    where: { id: shipmentId, workspaceId },
  });
  if (!shipment) throw new Error("NOT_FOUND");

  // If a projectId is provided, verify it belongs to the same workspace.
  const projectId = nullable(parsed.projectId);
  if (projectId) {
    const project = await db.project.findFirst({
      where: { id: projectId, workspaceId },
      select: { id: true },
    });
    if (!project) throw new Error("PROJECT_NOT_FOUND");
  }

  const customerId = nullable(parsed.customerId);
  if (customerId) {
    const customer = await db.customer.findFirst({
      where: { id: customerId, workspaceId },
      select: { id: true },
    });
    if (!customer) throw new Error("CUSTOMER_NOT_FOUND");
  }

  const item = await db.shipmentItem.create({
    data: {
      shipmentId,
      projectId,
      customerId,
      description: parsed.description,
      qty: parsed.qty,
      unitValue: parsed.unitValue ?? null,
      weightKg: parsed.weightKg ?? null,
      volumeM3: parsed.volumeM3 ?? null,
      notes: nullable(parsed.notes),
    },
  });

  revalidatePath(`/dashboard/shipments/${shipmentId}`);
  return item;
}

export async function removeItemFromShipment(itemId: string) {
  const workspaceId = await requireWorkspaceId();
  // Verify ownership through the parent shipment.
  const item = await db.shipmentItem.findUnique({
    where: { id: itemId },
    include: { shipment: { select: { workspaceId: true, id: true } } },
  });
  if (!item || item.shipment.workspaceId !== workspaceId) {
    throw new Error("NOT_FOUND");
  }
  await db.shipmentItem.delete({ where: { id: itemId } });
  revalidatePath(`/dashboard/shipments/${item.shipment.id}`);
  return { ok: true };
}
