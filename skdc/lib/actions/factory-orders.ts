"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  FactoryOrderStatus,
  FactoryVerificationStatus,
  Prisma,
  ShipmentMode,
  ShipmentStatus,
} from "@prisma/client";
import { getCurrentWorkspace, requireWorkspaceId } from "@/lib/auth-helpers";
import { recomputeTrustGrade } from "@/lib/actions/factories";

// ---------------------------------------------------------------------------
// Zod schemas
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

const ItemSnapshotItem = z.object({
  description: z.string().min(1).max(500),
  qty: z.coerce.number().int().positive().default(1),
  notes: z.string().max(500).optional().nullable(),
});

const FactoryOrderInput = z.object({
  factoryId: z.string().cuid(),
  projectId: z.string().cuid(),
  reference: z.string().min(1, "المرجع مطلوب").max(80),
  factoryQuote: z.coerce.number().nonnegative().optional().nullable(),
  factoryCurrency: z.string().min(3).max(8).default("USD"),
  workshopBudget: z.coerce.number().nonnegative().optional().nullable(),
  acceptedAmount: z.coerce.number().nonnegative().optional().nullable(),
  estimatedDelivery: optionalDate,
  notes: z.string().max(4000).optional().nullable(),
});

export type FactoryOrderInputType = z.infer<typeof FactoryOrderInput>;

const EventInput = z.object({
  status: z.nativeEnum(FactoryOrderStatus),
  note: z.string().max(4000).optional().nullable(),
  actorLabel: z.string().max(200).optional().nullable(),
  itemsSnapshot: z.array(ItemSnapshotItem).optional().nullable(),
  attachmentUrl: z.string().max(1000).optional().nullable(),
  occurredAt: optionalDate,
});

export type EventInputType = z.infer<typeof EventInput>;

const QuoteInput = z.object({
  amount: z.coerce.number().nonnegative(),
  currency: z.string().min(3).max(8).default("USD"),
  note: z.string().max(2000).optional().nullable(),
});

const StatusUpdateInput = z.object({
  note: z.string().max(4000).optional().nullable(),
  itemsSnapshot: z.array(ItemSnapshotItem).optional().nullable(),
  attachmentUrl: z.string().max(1000).optional().nullable(),
});

const CancelInput = z.object({
  reason: z.string().min(2, "سبب الإلغاء مطلوب").max(2000),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function nullable<T>(v: T | undefined | null | ""): T | null {
  if (v === undefined || v === null || v === "") return null;
  return v as T;
}

/**
 * Maps a status to the FactoryOrder column that should be stamped when it's
 * reached. Centralizes the "every status has its own timestamp" rule.
 */
function timestampColumnFor(
  status: FactoryOrderStatus,
): keyof Prisma.FactoryOrderUpdateInput | null {
  switch (status) {
    case FactoryOrderStatus.SUBMITTED:
      return "submittedAt";
    case FactoryOrderStatus.ACKNOWLEDGED:
      return "acknowledgedAt";
    case FactoryOrderStatus.QUOTED:
      return "quotedAt";
    case FactoryOrderStatus.ACCEPTED:
      return "acceptedAt";
    case FactoryOrderStatus.IN_PRODUCTION:
      return "productionStartAt";
    case FactoryOrderStatus.QC_PASSED:
      return "qcPassedAt";
    case FactoryOrderStatus.READY_TO_SHIP:
      return "readyToShipAt";
    case FactoryOrderStatus.SHIPPED:
      return "shippedAt";
    case FactoryOrderStatus.COMPLETED:
      return "completedAt";
    default:
      return null;
  }
}

/**
 * After-event hook: updates Factory.totalOrders / onTimeDeliveries /
 * qualityIssues and re-grades. Called by appendEvent for relevant statuses.
 */
async function updateFactoryMetrics(
  factoryId: string,
  status: FactoryOrderStatus,
  order: { actualDelivery: Date | null; estimatedDelivery: Date | null },
) {
  const updates: Prisma.FactoryUpdateInput = {};
  let mutated = false;

  if (status === FactoryOrderStatus.COMPLETED) {
    updates.totalOrders = { increment: 1 };
    mutated = true;
    if (
      order.actualDelivery &&
      order.estimatedDelivery &&
      order.actualDelivery.getTime() <= order.estimatedDelivery.getTime()
    ) {
      updates.onTimeDeliveries = { increment: 1 };
    }
  } else if (status === FactoryOrderStatus.DISPUTED) {
    updates.qualityIssues = { increment: 1 };
    mutated = true;
  }

  if (!mutated) return;
  await db.factory.update({ where: { id: factoryId }, data: updates });
  await recomputeTrustGrade(factoryId);
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function listFactoryOrders(options?: {
  factoryId?: string;
  projectId?: string;
  status?: FactoryOrderStatus;
}) {
  const workspaceId = await requireWorkspaceId();
  const where: Prisma.FactoryOrderWhereInput = { workspaceId };
  if (options?.factoryId) where.factoryId = options.factoryId;
  if (options?.projectId) where.projectId = options.projectId;
  if (options?.status) where.status = options.status;

  return db.factoryOrder.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      factory: {
        select: {
          id: true,
          name: true,
          country: true,
          trustGrade: true,
          verificationStatus: true,
        },
      },
      project: { select: { id: true, name: true } },
      _count: { select: { events: true } },
    },
  });
}

export async function getFactoryOrder(id: string) {
  const workspaceId = await requireWorkspaceId();
  return db.factoryOrder.findFirst({
    where: { id, workspaceId },
    include: {
      factory: true,
      project: { select: { id: true, name: true } },
      events: { orderBy: { occurredAt: "asc" } },
    },
  });
}

// ---------------------------------------------------------------------------
// Generic event appender — used by ALL state transitions below.
// ---------------------------------------------------------------------------

/**
 * Centralized status transition. Records an event, stamps the matching
 * timestamp column, optionally updates factory metrics, and revalidates the
 * affected pages. All other transition helpers delegate here.
 */
export async function appendEvent(orderId: string, raw: unknown) {
  const { user } = await getCurrentWorkspace();
  const workspaceId = await requireWorkspaceId();
  const parsed = EventInput.parse(raw);

  const order = await db.factoryOrder.findFirst({
    where: { id: orderId, workspaceId },
  });
  if (!order) throw new Error("NOT_FOUND");

  const occurredAt = parsed.occurredAt ?? new Date();

  // Build the order update — every status has its own column.
  const orderUpdates: Prisma.FactoryOrderUpdateInput = { status: parsed.status };
  const tsCol = timestampColumnFor(parsed.status);
  if (tsCol) {
    (orderUpdates as Record<string, unknown>)[tsCol] = occurredAt;
  }
  // COMPLETED → record actualDelivery if not already set
  if (parsed.status === FactoryOrderStatus.COMPLETED && !order.actualDelivery) {
    orderUpdates.actualDelivery = occurredAt;
  }

  const itemsJson =
    (parsed.itemsSnapshot ?? []) as unknown as Prisma.InputJsonValue;

  const [, updatedOrder] = await db.$transaction([
    db.factoryOrderEvent.create({
      data: {
        orderId,
        status: parsed.status,
        occurredAt,
        actorUserId: user.id,
        actorLabel: nullable(parsed.actorLabel),
        note: nullable(parsed.note),
        itemsSnapshot: itemsJson,
        attachmentUrl: nullable(parsed.attachmentUrl),
      },
    }),
    db.factoryOrder.update({
      where: { id: orderId },
      data: orderUpdates,
    }),
  ]);

  // Post-event metric updates — uses the JUST-updated order to read
  // actualDelivery vs estimatedDelivery for COMPLETED.
  await updateFactoryMetrics(order.factoryId, parsed.status, {
    actualDelivery: updatedOrder.actualDelivery,
    estimatedDelivery: updatedOrder.estimatedDelivery,
  });

  revalidatePath("/dashboard/factory-orders");
  revalidatePath(`/dashboard/factory-orders/${orderId}`);
  revalidatePath(`/dashboard/factories/${order.factoryId}`);
  return updatedOrder;
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/**
 * Creates a DRAFT order. GUARD: factory must be VERIFIED — workshops can't
 * send orders to unverified vendors.
 */
export async function createFactoryOrder(raw: unknown) {
  const workspaceId = await requireWorkspaceId();
  const parsed = FactoryOrderInput.parse(raw);

  const factory = await db.factory.findFirst({
    where: { id: parsed.factoryId, workspaceId },
  });
  if (!factory) throw new Error("FACTORY_NOT_FOUND");
  if (factory.verificationStatus !== FactoryVerificationStatus.VERIFIED) {
    throw new Error("FACTORY_NOT_VERIFIED");
  }
  if (!factory.isActive) {
    throw new Error("FACTORY_INACTIVE");
  }

  const project = await db.project.findFirst({
    where: { id: parsed.projectId, workspaceId },
  });
  if (!project) throw new Error("PROJECT_NOT_FOUND");

  const order = await db.factoryOrder.create({
    data: {
      workspaceId,
      factoryId: parsed.factoryId,
      projectId: parsed.projectId,
      reference: parsed.reference,
      factoryQuote: parsed.factoryQuote ?? null,
      factoryCurrency: parsed.factoryCurrency,
      workshopBudget: parsed.workshopBudget ?? null,
      acceptedAmount: parsed.acceptedAmount ?? null,
      estimatedDelivery: parsed.estimatedDelivery ?? null,
      notes: nullable(parsed.notes),
      status: FactoryOrderStatus.DRAFT,
    },
  });

  revalidatePath("/dashboard/factory-orders");
  return order;
}

export async function updateFactoryOrder(id: string, raw: unknown) {
  const workspaceId = await requireWorkspaceId();
  const parsed = FactoryOrderInput.parse(raw);
  const existing = await db.factoryOrder.findFirst({ where: { id, workspaceId } });
  if (!existing) throw new Error("NOT_FOUND");

  const order = await db.factoryOrder.update({
    where: { id },
    data: {
      reference: parsed.reference,
      factoryQuote: parsed.factoryQuote ?? null,
      factoryCurrency: parsed.factoryCurrency,
      workshopBudget: parsed.workshopBudget ?? null,
      acceptedAmount: parsed.acceptedAmount ?? null,
      estimatedDelivery: parsed.estimatedDelivery ?? null,
      notes: nullable(parsed.notes),
    },
  });
  revalidatePath("/dashboard/factory-orders");
  revalidatePath(`/dashboard/factory-orders/${id}`);
  return order;
}

export async function submitFactoryOrder(id: string, raw?: unknown) {
  const parsed = StatusUpdateInput.parse(raw ?? {});
  return appendEvent(id, {
    status: FactoryOrderStatus.SUBMITTED,
    note: parsed.note ?? null,
    itemsSnapshot: parsed.itemsSnapshot ?? [],
    attachmentUrl: parsed.attachmentUrl ?? null,
  });
}

export async function recordQuote(id: string, raw: unknown) {
  const workspaceId = await requireWorkspaceId();
  const parsed = QuoteInput.parse(raw);
  const existing = await db.factoryOrder.findFirst({ where: { id, workspaceId } });
  if (!existing) throw new Error("NOT_FOUND");

  await db.factoryOrder.update({
    where: { id },
    data: {
      factoryQuote: parsed.amount,
      factoryCurrency: parsed.currency,
    },
  });

  return appendEvent(id, {
    status: FactoryOrderStatus.QUOTED,
    note: parsed.note ?? `سعر المصنع: ${parsed.amount} ${parsed.currency}`,
  });
}

export async function acceptQuote(id: string, raw?: unknown) {
  const workspaceId = await requireWorkspaceId();
  const parsed = StatusUpdateInput.parse(raw ?? {});
  const existing = await db.factoryOrder.findFirst({ where: { id, workspaceId } });
  if (!existing) throw new Error("NOT_FOUND");

  // Lock in the accepted amount from the latest quote.
  if (existing.factoryQuote != null) {
    await db.factoryOrder.update({
      where: { id },
      data: { acceptedAmount: existing.factoryQuote },
    });
  }

  return appendEvent(id, {
    status: FactoryOrderStatus.ACCEPTED,
    note: parsed.note ?? null,
    itemsSnapshot: parsed.itemsSnapshot ?? [],
    attachmentUrl: parsed.attachmentUrl ?? null,
  });
}

/**
 * Generic status recorder for production-side stages: ACKNOWLEDGED,
 * IN_PRODUCTION, QC_PASSED, READY_TO_SHIP, COMPLETED, DISPUTED.
 */
export async function recordStatus(
  id: string,
  newStatus: FactoryOrderStatus,
  raw?: unknown,
) {
  const parsed = StatusUpdateInput.parse(raw ?? {});
  return appendEvent(id, {
    status: newStatus,
    note: parsed.note ?? null,
    itemsSnapshot: parsed.itemsSnapshot ?? [],
    attachmentUrl: parsed.attachmentUrl ?? null,
  });
}

/**
 * Marks an order as SHIPPED. If `shipmentId` is provided, links to that
 * existing Shipment; otherwise creates a stub Shipment row so the workshop
 * gets a tracking record immediately.
 */
export async function markShipped(
  id: string,
  shipmentId?: string | null,
  raw?: unknown,
) {
  const workspaceId = await requireWorkspaceId();
  const parsed = StatusUpdateInput.parse(raw ?? {});
  const order = await db.factoryOrder.findFirst({
    where: { id, workspaceId },
    include: { factory: true },
  });
  if (!order) throw new Error("NOT_FOUND");

  let linkedShipmentId = shipmentId ?? order.shipmentId ?? null;

  if (linkedShipmentId) {
    const exists = await db.shipment.findFirst({
      where: { id: linkedShipmentId, workspaceId },
      select: { id: true },
    });
    if (!exists) {
      throw new Error("SHIPMENT_NOT_FOUND");
    }
  } else {
    // Auto-create a stub Shipment carrying the factory origin info.
    const stub = await db.shipment.create({
      data: {
        workspaceId,
        reference: `SH-${order.reference}`,
        mode: ShipmentMode.SEA_FCL,
        status: ShipmentStatus.READY_TO_SHIP,
        originFactory: order.factory.name,
        originCity: order.factory.city,
        originCountry: order.factory.country,
        currency: order.factoryCurrency,
        totalValue: order.acceptedAmount ?? order.factoryQuote ?? null,
        notes: `إنشاء تلقائي من طلب المصنع ${order.reference}`,
      },
    });
    linkedShipmentId = stub.id;
  }

  await db.factoryOrder.update({
    where: { id },
    data: { shipmentId: linkedShipmentId },
  });

  await appendEvent(id, {
    status: FactoryOrderStatus.SHIPPED,
    note: parsed.note ?? `تم ربط الشحنة ${linkedShipmentId}`,
    itemsSnapshot: parsed.itemsSnapshot ?? [],
    attachmentUrl: parsed.attachmentUrl ?? null,
  });

  revalidatePath("/dashboard/shipments");
  return { ok: true, shipmentId: linkedShipmentId };
}

export async function cancelOrder(id: string, raw: unknown) {
  const parsed = CancelInput.parse(raw);
  return appendEvent(id, {
    status: FactoryOrderStatus.CANCELLED,
    note: parsed.reason,
  });
}

export async function deleteFactoryOrder(id: string) {
  const workspaceId = await requireWorkspaceId();
  const existing = await db.factoryOrder.findFirst({ where: { id, workspaceId } });
  if (!existing) throw new Error("NOT_FOUND");
  if (existing.status !== FactoryOrderStatus.DRAFT) {
    throw new Error("CANNOT_DELETE_NON_DRAFT");
  }
  await db.factoryOrder.delete({ where: { id } });
  revalidatePath("/dashboard/factory-orders");
  return { ok: true };
}
