/**
 * Shared shell-level types for the Studio mode.
 * Kept in a plain `.ts` (no JSX) so server boundaries don't matter.
 */

import type { TemplateCategory } from "@prisma/client";

export type CameraPreset = "perspective" | "top" | "front" | "walk" | "hero";
export type TimeOfDay = "morning" | "noon" | "sunset" | "night";

/** Categories surfaced in the right-side rail. Matches Prisma TemplateCategory. */
export type StudioCategory = TemplateCategory;
