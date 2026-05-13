"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentWorkspace, requireWorkspaceId } from "@/lib/auth-helpers";

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const DOC_KINDS = [
  "BUSINESS_LICENSE",
  "COMMERCIAL_REGISTRATION",
  "FACTORY_AUDIT",
  "PHOTO",
  "OTHER",
] as const;

const DocumentInput = z.object({
  kind: z.enum(DOC_KINDS).default("OTHER"),
  title: z.string().min(2, "عنوان المستند مطلوب").max(200),
  fileUrl: z.string().min(2).max(1000),
  fileSize: z.coerce.number().int().nonnegative().optional().nullable(),
});

export type FactoryDocumentInputType = z.infer<typeof DocumentInput>;

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function listDocuments(factoryId: string) {
  const workspaceId = await requireWorkspaceId();
  // Confirm the factory belongs to this workspace before exposing documents.
  const factory = await db.factory.findFirst({
    where: { id: factoryId, workspaceId },
    select: { id: true },
  });
  if (!factory) throw new Error("NOT_FOUND");
  return db.factoryDocument.findMany({
    where: { factoryId },
    orderBy: { uploadedAt: "desc" },
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/**
 * STUB: real file upload to R2/S3 happens client-side; this action records the
 * resulting URL. If you need a server-managed upload, swap this for a presigned
 * URL flow before calling addDocument().
 */
export async function addDocument(factoryId: string, raw: unknown) {
  const workspaceId = await requireWorkspaceId();
  const { user } = await getCurrentWorkspace();
  const parsed = DocumentInput.parse(raw);

  const factory = await db.factory.findFirst({
    where: { id: factoryId, workspaceId },
    select: { id: true },
  });
  if (!factory) throw new Error("NOT_FOUND");

  const doc = await db.factoryDocument.create({
    data: {
      factoryId,
      kind: parsed.kind,
      title: parsed.title,
      fileUrl: parsed.fileUrl,
      fileSize: parsed.fileSize ?? null,
      uploadedBy: user.id,
    },
  });

  revalidatePath(`/dashboard/factories/${factoryId}`);
  return doc;
}

export async function deleteDocument(id: string) {
  const workspaceId = await requireWorkspaceId();
  const doc = await db.factoryDocument.findUnique({
    where: { id },
    include: { factory: { select: { id: true, workspaceId: true } } },
  });
  if (!doc || doc.factory.workspaceId !== workspaceId) {
    throw new Error("NOT_FOUND");
  }
  await db.factoryDocument.delete({ where: { id } });
  revalidatePath(`/dashboard/factories/${doc.factory.id}`);
  return { ok: true };
}
