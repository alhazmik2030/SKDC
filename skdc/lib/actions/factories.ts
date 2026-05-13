"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  FactoryChannel,
  FactoryTrustGrade,
  FactoryVerificationStatus,
  MachineFormat,
  Prisma,
} from "@prisma/client";
import { getCurrentWorkspace, requireWorkspaceId } from "@/lib/auth-helpers";

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const FactoryInput = z.object({
  name: z.string().min(2, "اسم المصنع مطلوب").max(200),
  nameLocal: z.string().max(200).optional().nullable(),
  legalName: z.string().max(200).optional().nullable(),
  taxId: z.string().max(80).optional().nullable(),

  contactName: z.string().max(120).optional().nullable(),
  contactNameLocal: z.string().max(120).optional().nullable(),
  contactPhone: z.string().max(40).optional().nullable(),
  contactEmail: z
    .string()
    .max(160)
    .optional()
    .nullable()
    .or(z.literal(""))
    .refine(
      (v) => !v || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v),
      "بريد غير صحيح",
    ),
  wechatId: z.string().max(80).optional().nullable(),
  whatsappNumber: z.string().max(40).optional().nullable(),

  city: z.string().max(120).optional().nullable(),
  province: z.string().max(120).optional().nullable(),
  country: z.string().min(2).max(4).default("CN"),
  addressLine: z.string().max(300).optional().nullable(),

  preferredFormat: z.nativeEnum(MachineFormat).default("DXF"),
  channel: z.nativeEnum(FactoryChannel).default("EMAIL"),
  endpoint: z.string().max(500).optional().nullable(),

  leadTimeDays: z.coerce.number().int().nonnegative().max(365).optional().nullable(),
  paymentTerms: z.string().max(300).optional().nullable(),
  notes: z.string().max(4000).optional().nullable(),
});

export type FactoryInputType = z.infer<typeof FactoryInput>;

const VerificationNote = z.object({
  note: z.string().max(2000).optional().nullable(),
});

const RejectionReason = z.object({
  reason: z.string().min(2, "سبب الرفض مطلوب").max(2000),
});

const SuspendReason = z.object({
  reason: z.string().min(2, "سبب الإيقاف مطلوب").max(2000),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function nullable<T>(v: T | undefined | null | ""): T | null {
  if (v === undefined || v === null || v === "") return null;
  return v as T;
}

function gradeFromScore(score: number): FactoryTrustGrade {
  if (score >= 95) return FactoryTrustGrade.A;
  if (score >= 85) return FactoryTrustGrade.B;
  if (score >= 70) return FactoryTrustGrade.C;
  return FactoryTrustGrade.D;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function listFactories(options?: { verifiedOnly?: boolean }) {
  const workspaceId = await requireWorkspaceId();
  const where: Prisma.FactoryWhereInput = { workspaceId };
  if (options?.verifiedOnly) {
    where.verificationStatus = FactoryVerificationStatus.VERIFIED;
  }
  return db.factory.findMany({
    where,
    orderBy: [{ verificationStatus: "asc" }, { createdAt: "desc" }],
    include: {
      _count: { select: { orders: true, documents: true } },
    },
  });
}

export async function getFactory(id: string) {
  const workspaceId = await requireWorkspaceId();
  const factory = await db.factory.findFirst({
    where: { id, workspaceId },
    include: {
      documents: { orderBy: { uploadedAt: "desc" } },
      _count: { select: { orders: true } },
    },
  });
  if (!factory) return null;

  // Pull a few recent orders for display in the detail page.
  const recentOrders = await db.factoryOrder.findMany({
    where: { factoryId: id, workspaceId },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      reference: true,
      status: true,
      createdAt: true,
      shippedAt: true,
      completedAt: true,
    },
  });

  return { ...factory, recentOrders };
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createFactory(raw: unknown) {
  const workspaceId = await requireWorkspaceId();
  const parsed = FactoryInput.parse(raw);

  const factory = await db.factory.create({
    data: {
      workspaceId,
      name: parsed.name,
      nameLocal: nullable(parsed.nameLocal),
      legalName: nullable(parsed.legalName),
      taxId: nullable(parsed.taxId),
      contactName: nullable(parsed.contactName),
      contactNameLocal: nullable(parsed.contactNameLocal),
      contactPhone: nullable(parsed.contactPhone),
      contactEmail: nullable(parsed.contactEmail),
      wechatId: nullable(parsed.wechatId),
      whatsappNumber: nullable(parsed.whatsappNumber),
      city: nullable(parsed.city),
      province: nullable(parsed.province),
      country: parsed.country,
      addressLine: nullable(parsed.addressLine),
      preferredFormat: parsed.preferredFormat,
      channel: parsed.channel,
      endpoint: nullable(parsed.endpoint),
      leadTimeDays: parsed.leadTimeDays ?? null,
      paymentTerms: nullable(parsed.paymentTerms),
      notes: nullable(parsed.notes),
      verificationStatus: FactoryVerificationStatus.UNVERIFIED,
      trustGrade: FactoryTrustGrade.UNRATED,
    },
  });
  revalidatePath("/dashboard/factories");
  return factory;
}

export async function updateFactory(id: string, raw: unknown) {
  const workspaceId = await requireWorkspaceId();
  const parsed = FactoryInput.parse(raw);

  const existing = await db.factory.findFirst({ where: { id, workspaceId } });
  if (!existing) throw new Error("NOT_FOUND");

  const factory = await db.factory.update({
    where: { id },
    data: {
      name: parsed.name,
      nameLocal: nullable(parsed.nameLocal),
      legalName: nullable(parsed.legalName),
      taxId: nullable(parsed.taxId),
      contactName: nullable(parsed.contactName),
      contactNameLocal: nullable(parsed.contactNameLocal),
      contactPhone: nullable(parsed.contactPhone),
      contactEmail: nullable(parsed.contactEmail),
      wechatId: nullable(parsed.wechatId),
      whatsappNumber: nullable(parsed.whatsappNumber),
      city: nullable(parsed.city),
      province: nullable(parsed.province),
      country: parsed.country,
      addressLine: nullable(parsed.addressLine),
      preferredFormat: parsed.preferredFormat,
      channel: parsed.channel,
      endpoint: nullable(parsed.endpoint),
      leadTimeDays: parsed.leadTimeDays ?? null,
      paymentTerms: nullable(parsed.paymentTerms),
      notes: nullable(parsed.notes),
    },
  });
  revalidatePath("/dashboard/factories");
  revalidatePath(`/dashboard/factories/${id}`);
  return factory;
}

export async function submitForVerification(id: string) {
  const workspaceId = await requireWorkspaceId();
  const existing = await db.factory.findFirst({ where: { id, workspaceId } });
  if (!existing) throw new Error("NOT_FOUND");

  const factory = await db.factory.update({
    where: { id },
    data: { verificationStatus: FactoryVerificationStatus.PENDING },
  });
  revalidatePath("/dashboard/factories");
  revalidatePath(`/dashboard/factories/${id}`);
  return factory;
}

export async function markVerified(id: string, raw: unknown) {
  const { user, role } = await getCurrentWorkspace();
  if (role !== "OWNER" && role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  const workspaceId = await requireWorkspaceId();
  const parsed = VerificationNote.parse(raw ?? {});
  const existing = await db.factory.findFirst({ where: { id, workspaceId } });
  if (!existing) throw new Error("NOT_FOUND");

  const factory = await db.factory.update({
    where: { id },
    data: {
      verificationStatus: FactoryVerificationStatus.VERIFIED,
      verifiedAt: new Date(),
      verifiedBy: user.id,
      verificationNote: nullable(parsed.note),
    },
  });
  revalidatePath("/dashboard/factories");
  revalidatePath(`/dashboard/factories/${id}`);
  return factory;
}

export async function markRejected(id: string, raw: unknown) {
  const { role } = await getCurrentWorkspace();
  if (role !== "OWNER" && role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  const workspaceId = await requireWorkspaceId();
  const parsed = RejectionReason.parse(raw);
  const existing = await db.factory.findFirst({ where: { id, workspaceId } });
  if (!existing) throw new Error("NOT_FOUND");

  const factory = await db.factory.update({
    where: { id },
    data: {
      verificationStatus: FactoryVerificationStatus.REJECTED,
      verificationNote: parsed.reason,
    },
  });
  revalidatePath("/dashboard/factories");
  revalidatePath(`/dashboard/factories/${id}`);
  return factory;
}

export async function suspendFactory(id: string, raw: unknown) {
  const { role } = await getCurrentWorkspace();
  if (role !== "OWNER" && role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  const workspaceId = await requireWorkspaceId();
  const parsed = SuspendReason.parse(raw);
  const existing = await db.factory.findFirst({ where: { id, workspaceId } });
  if (!existing) throw new Error("NOT_FOUND");

  const factory = await db.factory.update({
    where: { id },
    data: {
      verificationStatus: FactoryVerificationStatus.SUSPENDED,
      verificationNote: parsed.reason,
      isActive: false,
    },
  });
  revalidatePath("/dashboard/factories");
  revalidatePath(`/dashboard/factories/${id}`);
  return factory;
}

export async function reactivateFactory(id: string) {
  const { role } = await getCurrentWorkspace();
  if (role !== "OWNER" && role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  const workspaceId = await requireWorkspaceId();
  const existing = await db.factory.findFirst({ where: { id, workspaceId } });
  if (!existing) throw new Error("NOT_FOUND");

  // Reactivating returns to VERIFIED if previously verified, otherwise UNVERIFIED.
  const nextStatus = existing.verifiedAt
    ? FactoryVerificationStatus.VERIFIED
    : FactoryVerificationStatus.UNVERIFIED;

  const factory = await db.factory.update({
    where: { id },
    data: {
      verificationStatus: nextStatus,
      isActive: true,
    },
  });
  revalidatePath("/dashboard/factories");
  revalidatePath(`/dashboard/factories/${id}`);
  return factory;
}

/**
 * Recomputes trustScore + trustGrade from the factory's performance counters.
 *
 *   onTimeRatio   = onTimeDeliveries / totalOrders
 *   qualityRatio  = 1 - (qualityIssues / totalOrders)
 *   commScore     = 0.9 (stub — wire to WhatsApp/email response time later)
 *   trustScore    = (onTimeRatio * 0.5 + qualityRatio * 0.4 + commScore * 0.1) * 100
 *   trustGrade    = A (≥95) / B (≥85) / C (≥70) / D otherwise
 *
 * A factory with zero orders stays UNRATED so the badge doesn't lie about
 * untested vendors.
 */
export async function recomputeTrustGrade(id: string) {
  const workspaceId = await requireWorkspaceId();
  const factory = await db.factory.findFirst({ where: { id, workspaceId } });
  if (!factory) throw new Error("NOT_FOUND");

  if (factory.totalOrders === 0) {
    const updated = await db.factory.update({
      where: { id },
      data: { trustScore: 0, trustGrade: FactoryTrustGrade.UNRATED },
    });
    revalidatePath(`/dashboard/factories/${id}`);
    return updated;
  }

  const onTimeRatio = factory.onTimeDeliveries / factory.totalOrders;
  const qualityRatio = Math.max(
    0,
    1 - factory.qualityIssues / factory.totalOrders,
  );
  const communicationScore = 0.9; // STUB: response-time signal not yet wired
  const trustScore =
    (onTimeRatio * 0.5 + qualityRatio * 0.4 + communicationScore * 0.1) * 100;
  const grade = gradeFromScore(trustScore);

  const updated = await db.factory.update({
    where: { id },
    data: {
      trustScore: Math.round(trustScore * 10) / 10,
      trustGrade: grade,
    },
  });
  revalidatePath(`/dashboard/factories/${id}`);
  return updated;
}

export async function deleteFactory(id: string) {
  const workspaceId = await requireWorkspaceId();
  const existing = await db.factory.findFirst({ where: { id, workspaceId } });
  if (!existing) throw new Error("NOT_FOUND");

  // Schema has onDelete: Restrict on FactoryOrder.factoryId — let Prisma
  // throw P2003 if there are live orders rather than silently leaving them.
  await db.factory.delete({ where: { id } });
  revalidatePath("/dashboard/factories");
  return { ok: true };
}
