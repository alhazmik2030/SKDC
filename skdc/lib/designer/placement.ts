/**
 * Smart placement + snap helpers for the Studio.
 *
 * Two problems this solves:
 *   1. "All cabinets land at (100, 100)" — new units now place themselves
 *      next to the last one on the same wall (a "row" along the front wall
 *      for lower/appliance categories, an offset row for uppers).
 *   2. "Cabinets overlap" — drag movement now snaps to adjacent edges
 *      (magnetic) and refuses to drop a unit on top of another one.
 *
 * Coordinates are room-space top-down mm: x grows along the front wall,
 * y grows into the room. Each unit anchors at its top-left corner with
 * (x, y) being the corner closest to wall A (front).
 */

import type { DesignerUnit, DesignerRoom } from "@/components/designer/types";

/** Mouse drag must come within this many mm of an edge to snap to it. */
export const SNAP_THRESHOLD = 80;

/** Light vertical wallet — keep this much depth-gap between upper rows. */
const ROW_GAP = 0;

/** Lower cabinets / appliances live in the "lower" row (against wall A). */
const LOWER_CATEGORIES = new Set([
  "LOWER_CABINET",
  "APPLIANCE",
  "SINK",
  "DRAWER",
  "CORNER",
  "ACCESSORY",
]);

const UPPER_CATEGORIES = new Set(["UPPER_CABINET"]);
const TALL_CATEGORIES = new Set(["TALL_CABINET"]);

export type UnitShape = {
  id: string;
  x: number;
  y: number;
  width: number;
  depth: number;
  category: string;
};

/**
 * Pick a free slot for a brand-new unit. We lay lower-row units left to
 * right starting from x=0, push uppers to the same x and y=0 as well
 * (their height already separates them in 3D), and drop talls past the
 * end of the lower row.
 *
 * If the room runs out of frontage we wrap to a second row spaced by the
 * deepest unit so far (so the cabinets stack toward the back wall instead
 * of stacking on top of one another).
 */
export function findFreeSpot(
  existing: DesignerUnit[],
  next: { width: number; depth: number; category: string },
  room: DesignerRoom,
): { x: number; y: number } {
  const cat = next.category;
  const row = pickRowFilter(cat);

  // Find peers — units in the same logical row.
  const peers = existing.filter((u) => row(u.category));
  if (peers.length === 0) return { x: 0, y: 0 };

  // Sort by x to find the rightmost edge.
  const sorted = [...peers].sort((a, b) => a.x + a.width - (b.x + b.width));
  const last = sorted[sorted.length - 1];
  const rightEdge = last.x + last.width;

  // Wrap to a second row when we run out of frontage.
  if (rightEdge + next.width > room.width) {
    const deepest = peers.reduce((m, u) => Math.max(m, u.depth), 0);
    return { x: 0, y: deepest + ROW_GAP };
  }

  return { x: rightEdge, y: last.y };
}

function pickRowFilter(category: string): (other: string) => boolean {
  if (UPPER_CATEGORIES.has(category)) return (o) => UPPER_CATEGORIES.has(o);
  if (TALL_CATEGORIES.has(category)) return (o) => TALL_CATEGORIES.has(o);
  if (LOWER_CATEGORIES.has(category)) return (o) => LOWER_CATEGORIES.has(o);
  return (o) => o === category;
}

/**
 * Pull a dragged position toward the nearest wall edge or adjacent unit
 * edge (magnetic snap). Also rejects positions that would overlap another
 * unit by sliding the dragged unit to the nearest non-overlapping spot
 * along the snap axis.
 *
 * Returns the corrected (x, y) corner-anchored mm.
 */
export function snapPosition(
  dragged: UnitShape,
  others: UnitShape[],
  room: DesignerRoom,
  proposed: { x: number; y: number },
): { x: number; y: number; snappedTo?: string } {
  let x = proposed.x;
  let y = proposed.y;
  let snappedTo: string | undefined;

  const w = dragged.width;
  const d = dragged.depth;

  // ---- Snap to room walls (only if close enough) ----
  if (Math.abs(x) < SNAP_THRESHOLD) {
    x = 0;
    snappedTo = "wall-left";
  } else if (Math.abs(x + w - room.width) < SNAP_THRESHOLD) {
    x = room.width - w;
    snappedTo = "wall-right";
  }
  if (Math.abs(y) < SNAP_THRESHOLD) {
    y = 0;
    snappedTo = "wall-front";
  } else if (Math.abs(y + d - room.depth) < SNAP_THRESHOLD) {
    y = room.depth - d;
    snappedTo = "wall-back";
  }

  // ---- Snap to adjacent units (edge-to-edge), then enforce no-overlap ----
  for (const o of others) {
    if (o.id === dragged.id) continue;

    const oLeft = o.x;
    const oRight = o.x + o.width;
    const oTop = o.y;
    const oBottom = o.y + o.depth;

    const verticallyOverlapping = !(y + d <= oTop || y >= oBottom);
    const horizontallyOverlapping = !(x + w <= oLeft || x >= oRight);

    // X-axis edge snaps (only when vertical ranges overlap so they're
    // really side-by-side neighbours).
    if (verticallyOverlapping) {
      if (Math.abs(x + w - oLeft) < SNAP_THRESHOLD) {
        x = oLeft - w;
        snappedTo = `unit:${o.id}`;
      } else if (Math.abs(x - oRight) < SNAP_THRESHOLD) {
        x = oRight;
        snappedTo = `unit:${o.id}`;
      }
    }
    // Y-axis edge snaps
    if (horizontallyOverlapping) {
      if (Math.abs(y + d - oTop) < SNAP_THRESHOLD) {
        y = oTop - d;
        snappedTo = `unit:${o.id}`;
      } else if (Math.abs(y - oBottom) < SNAP_THRESHOLD) {
        y = oBottom;
        snappedTo = `unit:${o.id}`;
      }
    }
  }

  // ---- Final overlap resolution: if the new spot overlaps anyone, push
  // the dragged unit to the closest non-overlapping edge of the offender.
  for (const o of others) {
    if (o.id === dragged.id) continue;
    if (!boxesOverlap({ x, y, width: w, depth: d }, o)) continue;

    // Choose the cheapest axis to escape along.
    const pushRight = o.x + o.width - x;        // how far right to clear
    const pushLeft = x + w - o.x;               // how far left
    const pushDown = o.y + o.depth - y;
    const pushUp = y + d - o.y;
    const min = Math.min(pushRight, pushLeft, pushDown, pushUp);

    if (min === pushRight) x = o.x + o.width;
    else if (min === pushLeft) x = o.x - w;
    else if (min === pushDown) y = o.y + o.depth;
    else y = o.y - d;
  }

  // ---- Clamp inside the room ----
  x = Math.max(0, Math.min(x, room.width - w));
  y = Math.max(0, Math.min(y, room.depth - d));

  return { x: Math.round(x), y: Math.round(y), snappedTo };
}

function boxesOverlap(
  a: { x: number; y: number; width: number; depth: number },
  b: { x: number; y: number; width: number; depth: number },
): boolean {
  return !(
    a.x + a.width <= b.x ||
    a.x >= b.x + b.width ||
    a.y + a.depth <= b.y ||
    a.y >= b.y + b.depth
  );
}
