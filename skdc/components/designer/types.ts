/**
 * 2D Designer Canvas — data model.
 *
 * Stored as Design.data JSON in DB. Independent of Prisma — pure types so
 * the designer can be hydrated/saved without runtime deps on @prisma/client.
 */

export type DesignerUnit = {
  /** Local id within the design (not the same as Unit.id from DB yet). */
  id: string;
  /** Template id (from Template table) — null = freeform. */
  templateId: string | null;
  templateName: string;
  category: string;
  /** Position on canvas (in mm, in plan-view = top-down). */
  x: number;
  y: number;
  /** Dimensions in mm. */
  width: number;   // along X (room width)
  depth: number;   // along Y (room depth)
  height: number;  // vertical (kitchen unit height), not used in 2D plan but kept for invoice
  rotation: 0 | 90 | 180 | 270;
  /** Visual color (theme-aware later). */
  color: string;
  /**
   * Wall binding — set by the Assembly step.
   * `wallId` matches a `RoomWall.id`; `wallOffset` is the distance in mm from
   * the wall's start point along its length. Free-floating units (e.g. the
   * island) leave both undefined and rely on `x`/`y` instead.
   */
  wallId?: string | null;
  wallOffset?: number | null;
  /** Height from floor to bottom of the unit (mm). 0 for base cabinets. */
  baseHeight?: number;
};

export type DesignerRoom = {
  width: number;   // mm
  depth: number;   // mm
  height: number;  // mm
};

export type DesignerState = {
  version: 1;
  room: DesignerRoom;
  units: DesignerUnit[];
};

export const DEFAULT_ROOM: DesignerRoom = {
  width: 4000,
  depth: 3000,
  height: 2700,
};

export const EMPTY_DESIGN: DesignerState = {
  version: 1,
  room: DEFAULT_ROOM,
  units: [],
};
