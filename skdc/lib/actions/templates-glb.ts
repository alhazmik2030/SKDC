"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireWorkspaceId, getCurrentWorkspace } from "@/lib/auth-helpers";

/**
 * GLB template library — high-detail Sketchfab / model-library assets that
 * the designer can drop into the 3D scene. Sits next to the procedural
 * `Template` model (boxy resizable cabinets) — both feed the same palette.
 *
 * These are global (not workspace-scoped) so every workshop sees the same
 * library; only OWNER/ADMIN members of the workspace can register a new one.
 */

// The category union matches `DesignerUnit.category` and the Studio rail.
const GLB_CATEGORIES = [
  "LOWER_CABINET",
  "UPPER_CABINET",
  "CORNER",
  "TALL_CABINET",
  "DRAWER",
  "APPLIANCE",
  "ACCESSORY",
] as const;

const CreateInput = z.object({
  name: z.string().min(2).max(120),
  nameAr: z.string().max(120).optional().nullable().or(z.literal("")),
  description: z.string().max(2000).optional().nullable().or(z.literal("")),
  category: z.enum(GLB_CATEGORIES),
  glbUrl: z.string().url(),
  glbSizeBytes: z.coerce.number().int().min(1),
  triangleCount: z.coerce.number().int().min(1),
  thumbnailUrl: z.string().url().optional().nullable().or(z.literal("")),
  defaultWidth: z.coerce.number().int().positive().max(10_000),
  defaultHeight: z.coerce.number().int().positive().max(10_000),
  defaultDepth: z.coerce.number().int().positive().max(10_000),
  license: z.string().max(120).optional().default("CC-BY-4.0"),
  attribution: z.string().max(500).optional().nullable().or(z.literal("")),
  sourceUrl: z.string().url().optional().nullable().or(z.literal("")),
  published: z.boolean().optional().default(true),
  featured: z.boolean().optional().default(false),
});

export type CreateGlbTemplateInput = z.infer<typeof CreateInput>;

const UpdateInput = CreateInput.partial();
export type UpdateGlbTemplateInput = z.infer<typeof UpdateInput>;

/** Throws unless the caller is an OWNER/ADMIN of any workspace. */
async function requireAdmin() {
  const { role } = await getCurrentWorkspace();
  if (role !== "OWNER" && role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
}

/**
 * Lists published GLB templates, optionally filtered by category.
 * Anyone signed in to a workspace can read this.
 */
export async function listGlbTemplates(opts?: { category?: string }) {
  await requireWorkspaceId();
  return db.kitchenTemplate.findMany({
    where: {
      published: true,
      ...(opts?.category ? { category: opts.category } : {}),
    },
    orderBy: [{ featured: "desc" }, { category: "asc" }, { name: "asc" }],
  });
}

/** Admin-only listing — includes unpublished templates for management. */
export async function listAllGlbTemplates() {
  await requireAdmin();
  return db.kitchenTemplate.findMany({
    orderBy: [{ createdAt: "desc" }],
  });
}

export async function getGlbTemplate(id: string) {
  await requireWorkspaceId();
  return db.kitchenTemplate.findUnique({ where: { id } });
}

export async function createGlbTemplate(raw: unknown) {
  await requireAdmin();
  const parsed = CreateInput.parse(raw);
  const tpl = await db.kitchenTemplate.create({
    data: {
      name: parsed.name,
      nameAr: parsed.nameAr || null,
      description: parsed.description || null,
      category: parsed.category,
      glbUrl: parsed.glbUrl,
      glbSizeBytes: parsed.glbSizeBytes,
      triangleCount: parsed.triangleCount,
      thumbnailUrl: parsed.thumbnailUrl || null,
      defaultWidth: parsed.defaultWidth,
      defaultHeight: parsed.defaultHeight,
      defaultDepth: parsed.defaultDepth,
      license: parsed.license ?? "CC-BY-4.0",
      attribution: parsed.attribution || null,
      sourceUrl: parsed.sourceUrl || null,
      published: parsed.published ?? true,
      featured: parsed.featured ?? false,
    },
  });
  revalidatePath("/dashboard/admin/templates");
  return tpl;
}

export async function updateGlbTemplate(id: string, raw: unknown) {
  await requireAdmin();
  const parsed = UpdateInput.parse(raw);
  const tpl = await db.kitchenTemplate.update({
    where: { id },
    data: {
      ...(parsed.name !== undefined ? { name: parsed.name } : {}),
      ...(parsed.nameAr !== undefined ? { nameAr: parsed.nameAr || null } : {}),
      ...(parsed.description !== undefined
        ? { description: parsed.description || null }
        : {}),
      ...(parsed.category !== undefined ? { category: parsed.category } : {}),
      ...(parsed.glbUrl !== undefined ? { glbUrl: parsed.glbUrl } : {}),
      ...(parsed.glbSizeBytes !== undefined
        ? { glbSizeBytes: parsed.glbSizeBytes }
        : {}),
      ...(parsed.triangleCount !== undefined
        ? { triangleCount: parsed.triangleCount }
        : {}),
      ...(parsed.thumbnailUrl !== undefined
        ? { thumbnailUrl: parsed.thumbnailUrl || null }
        : {}),
      ...(parsed.defaultWidth !== undefined
        ? { defaultWidth: parsed.defaultWidth }
        : {}),
      ...(parsed.defaultHeight !== undefined
        ? { defaultHeight: parsed.defaultHeight }
        : {}),
      ...(parsed.defaultDepth !== undefined
        ? { defaultDepth: parsed.defaultDepth }
        : {}),
      ...(parsed.license !== undefined ? { license: parsed.license } : {}),
      ...(parsed.attribution !== undefined
        ? { attribution: parsed.attribution || null }
        : {}),
      ...(parsed.sourceUrl !== undefined
        ? { sourceUrl: parsed.sourceUrl || null }
        : {}),
      ...(parsed.published !== undefined ? { published: parsed.published } : {}),
      ...(parsed.featured !== undefined ? { featured: parsed.featured } : {}),
    },
  });
  revalidatePath("/dashboard/admin/templates");
  return tpl;
}

/** Soft-delete: just unpublish the template so it disappears from palettes
 *  but remains queryable by existing designs that reference its URL. */
export async function deleteGlbTemplate(id: string) {
  await requireAdmin();
  const tpl = await db.kitchenTemplate.update({
    where: { id },
    data: { published: false },
  });
  revalidatePath("/dashboard/admin/templates");
  return tpl;
}
