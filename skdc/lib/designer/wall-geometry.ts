/**
 * Wall geometry helpers for the 3D scene.
 *
 * Bridges the database `RoomWall` rows (mm, room-space XZ plane, anchored at
 * (0,0)) to Three.js world coordinates (m, Y-up). Provides:
 *   - `wallPanels()`: splits a wall into rectangular panels around any
 *     window/door openings, so the back face of the wall can be rendered
 *     without CSG. Each panel is described in 2D wall-space (offset along
 *     length × distance from floor).
 *   - `worldPlacement()`: computes the world transform (position + Y-rotation)
 *     for a point on a wall at a given offset and floor-height, plus the
 *     interior unit-normal direction so units can be pushed flush against
 *     the wall.
 *
 * The wall direction convention matches `SHAPE_PRESETS` in
 * `lib/actions/walls.ts`: A=front (south), B=right, C=back, D=left, taken
 * clockwise when looking down at the floor. Interior side is to the LEFT of
 * the wall's forward direction (i.e. rotated +90° from forward).
 */

/** Subset of RoomWall fields we actually need for geometry. */
export type WallData = {
  id: string;
  label: string;
  orderIndex: number;
  length: number;
  height: number;
  thickness: number;
  startX: number;
  startZ: number;
  endX: number;
  endZ: number;
  angleDeg: number;
  hasWindow: boolean;
  windowOffset: number | null;
  windowWidth: number | null;
  windowHeight: number | null;
  windowSill: number | null;
  hasDoor: boolean;
  doorOffset: number | null;
  doorWidth: number | null;
  doorHeight: number | null;
};

/** Single rectangular panel of wall material, in wall-local 2D coordinates. */
export type WallPanel = {
  /** Distance along the wall from its start (mm). */
  offset: number;
  /** Distance from the floor (mm). */
  baseHeight: number;
  /** Panel width along the wall (mm). */
  width: number;
  /** Panel height (mm). */
  height: number;
};

type Opening = {
  /** Offset along wall in mm (left edge). */
  x: number;
  /** Width in mm. */
  w: number;
  /** Bottom edge from floor in mm. */
  y: number;
  /** Height in mm. */
  h: number;
};

const MIN_PANEL = 1; // mm — drop slivers smaller than this so we don't render zero-area meshes

/**
 * Split a wall into a set of rectangular panels that cover the wall except
 * the window/door cutouts. For each opening we emit up to 3 panels around
 * it (above, below, plus left/right strips between openings). Slivers
 * smaller than MIN_PANEL are dropped.
 */
export function wallPanels(wall: WallData): WallPanel[] {
  const L = wall.length;
  const H = wall.height;

  const openings: Opening[] = [];
  if (
    wall.hasWindow &&
    wall.windowOffset != null &&
    wall.windowWidth != null &&
    wall.windowHeight != null &&
    wall.windowSill != null
  ) {
    openings.push({
      x: clamp(wall.windowOffset, 0, L),
      w: clamp(wall.windowWidth, 0, L),
      y: clamp(wall.windowSill, 0, H),
      h: clamp(wall.windowHeight, 0, H),
    });
  }
  if (
    wall.hasDoor &&
    wall.doorOffset != null &&
    wall.doorWidth != null &&
    wall.doorHeight != null
  ) {
    openings.push({
      x: clamp(wall.doorOffset, 0, L),
      w: clamp(wall.doorWidth, 0, L),
      y: 0,
      h: clamp(wall.doorHeight, 0, H),
    });
  }

  if (openings.length === 0) {
    return [{ offset: 0, baseHeight: 0, width: L, height: H }];
  }

  openings.sort((a, b) => a.x - b.x);

  const panels: WallPanel[] = [];
  let cursor = 0;

  for (const op of openings) {
    // Clamp opening to wall bounds.
    const opLeft = clamp(op.x, 0, L);
    const opRight = clamp(op.x + op.w, 0, L);
    const opBottom = clamp(op.y, 0, H);
    const opTop = clamp(op.y + op.h, 0, H);

    if (opLeft > cursor + MIN_PANEL) {
      // Full-height panel between the previous cursor and this opening.
      panels.push({
        offset: cursor,
        baseHeight: 0,
        width: opLeft - cursor,
        height: H,
      });
    }

    // Strip below the opening.
    if (opBottom > MIN_PANEL && opRight > opLeft + MIN_PANEL) {
      panels.push({
        offset: opLeft,
        baseHeight: 0,
        width: opRight - opLeft,
        height: opBottom,
      });
    }

    // Strip above the opening.
    if (H - opTop > MIN_PANEL && opRight > opLeft + MIN_PANEL) {
      panels.push({
        offset: opLeft,
        baseHeight: opTop,
        width: opRight - opLeft,
        height: H - opTop,
      });
    }

    cursor = Math.max(cursor, opRight);
  }

  if (L - cursor > MIN_PANEL) {
    panels.push({
      offset: cursor,
      baseHeight: 0,
      width: L - cursor,
      height: H,
    });
  }

  return panels;
}

/**
 * Compute the world placement for a point on a wall.
 *
 * @param wall    The wall.
 * @param offset  Distance along the wall from its start (mm).
 * @param floorH  Distance from floor (mm).
 * @returns       World-space position (m), Y-rotation in radians (for
 *                meshes whose local +X axis runs along the wall), and the
 *                interior unit-normal in world space.
 */
export function worldPlacement(
  wall: WallData,
  offset: number,
  floorH: number,
): {
  position: [number, number, number];
  rotationY: number;
  /** Unit vector in XZ plane pointing INTO the room from this wall. */
  interiorNormal: [number, number, number];
  /** Unit vector in XZ plane pointing along the wall (start → end). */
  forward: [number, number, number];
} {
  const MM = 0.001;
  const angle = (wall.angleDeg * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  // Wall start point in world space.
  const sx = wall.startX * MM;
  const sz = wall.startZ * MM;

  // Forward direction along the wall (start → end).
  const fx = cos;
  const fz = sin;

  // Interior normal: rotate forward by -90° so for wall A (angle 0, forward
  // +X) we get +Z (into the room). For B (angle 90, forward +Z) we get -X.
  // Etc. Matches SHAPE_PRESETS where the room interior is on the right when
  // walking clockwise.
  const nx = sin;
  const nz = -cos;

  const px = sx + fx * offset * MM;
  const py = floorH * MM;
  const pz = sz + fz * offset * MM;

  return {
    position: [px, py, pz],
    // In three.js Y rotation: a mesh with local +X axis along world +X has
    // rotationY = 0. Wall A goes along +X (angle 0) ⇒ rotationY = 0.
    // For wall B (angleDeg 90, world direction +Z) we need rotationY = -PI/2
    // so the local +X axis points to world +Z.
    rotationY: -angle,
    interiorNormal: [nx, 0, nz],
    forward: [fx, 0, fz],
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
