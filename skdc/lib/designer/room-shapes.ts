/**
 * Room shapes for the SKDC kitchen designer.
 *
 * Pure utility module — NO React, NO three.js, NO DOM. Provides the canonical
 * room-shape catalogue + a deterministic `buildRoomLayout` that turns a shape
 * + dimensions into wall segments (with optional window slot) and an optional
 * island plate.
 *
 * Coordinate system (room-local, millimetres):
 *   - Origin at the bottom-back-LEFT corner of the floor footprint.
 *   - +X runs along the back wall to the right.
 *   - +Z runs from the back wall toward the front (the open side).
 *   - +Y is up.
 *
 * This matches the existing 3D scene which treats the room as occupying the
 * positive octant from (0,0,0) to (width, height, depth).
 */

export type RoomShape =
  | "SINGLE_WALL"
  | "L_SHAPE"
  | "U_SHAPE"
  | "CLOSED"
  | "ISLAND";

export type RoomFloor = "TILES" | "WOOD" | "MARBLE";

export interface WallSegment {
  /** Start point on the floor plan, in mm, room-local. */
  start: { x: number; z: number };
  /** End point on the floor plan, in mm, room-local. */
  end: { x: number; z: number };
  /** Wall height in mm (top of wall measured from floor). */
  height: number;
  /** Wall thickness in mm. Defaults to 100. */
  thickness: number;
  /** True when this wall carries a window opening. */
  hasWindow?: boolean;
  /** Distance from the wall segment's `start` to the window's left edge, mm. */
  windowOffset?: number;
  /** Window opening width along the wall, mm. */
  windowWidth?: number;
  /** Window opening height, mm. */
  windowHeight?: number;
  /** Distance from floor to the bottom of the window opening, mm. */
  windowSillHeight?: number;
}

export interface RoomLayout {
  /** Overall footprint width (along X), mm. */
  width: number;
  /** Overall footprint depth (along Z), mm. */
  depth: number;
  /** Wall height, mm. */
  height: number;
  shape: RoomShape;
  floor: RoomFloor;
  /** Wall segments in canonical per-shape order (see DEFAULT_WINDOW_WALL_INDEX). */
  walls: WallSegment[];
  /** Only present when shape === "ISLAND". Centred plate in mm. */
  island?: { width: number; depth: number; height: number };
}

/** Default sensible kitchen dimensions in mm. */
export const DEFAULT_ROOM = {
  width: 4000,
  depth: 3000,
  height: 2700,
  floor: "TILES" as RoomFloor,
};

/** Default wall thickness in mm. */
export const DEFAULT_WALL_THICKNESS = 100;

/** Default window opening dimensions in mm. */
export const DEFAULT_WINDOW = {
  width: 1200,
  height: 900,
  sillHeight: 900,
};

/**
 * Per-shape index of the wall that owns the window by default.
 * For every shape we ship, this is the BACK wall (index 0) — the wall that
 * sits against z = 0 and runs along the +X axis.
 */
export const DEFAULT_WINDOW_WALL_INDEX: Record<RoomShape, number> = {
  SINGLE_WALL: 0,
  L_SHAPE: 0,
  U_SHAPE: 0,
  CLOSED: 0,
  ISLAND: 0,
};

interface BuildRoomLayoutInput {
  shape: RoomShape;
  width: number;
  depth: number;
  height: number;
  floor: RoomFloor;
  /**
   * Override the default window. `wallIndex` refers to the order in which the
   * walls are emitted by the shape (see comments above each shape below).
   */
  window?: {
    wallIndex: number;
    offset?: number;
    width?: number;
    height?: number;
    sillHeight?: number;
  };
}

/**
 * Build a complete `RoomLayout` for the requested shape. Pure function — same
 * input always yields the same output, no side effects.
 */
export function buildRoomLayout(input: BuildRoomLayoutInput): RoomLayout {
  const { shape, width, depth, height, floor } = input;
  const t = DEFAULT_WALL_THICKNESS;

  // Build the canonical wall list per shape. Each shape documents its walls.
  let walls: WallSegment[];
  switch (shape) {
    case "SINGLE_WALL": {
      // 1 wall:
      //   [0] back wall: (0,0) -> (width,0)
      walls = [makeWall({ x: 0, z: 0 }, { x: width, z: 0 }, height, t)];
      break;
    }
    case "L_SHAPE": {
      // 2 walls:
      //   [0] back wall: (0,0) -> (width,0)
      //   [1] left wall: (0,0) -> (0,depth)
      walls = [
        makeWall({ x: 0, z: 0 }, { x: width, z: 0 }, height, t),
        makeWall({ x: 0, z: 0 }, { x: 0, z: depth }, height, t),
      ];
      break;
    }
    case "U_SHAPE": {
      // 3 walls:
      //   [0] back wall:  (0,0)     -> (width,0)
      //   [1] left wall:  (0,0)     -> (0,depth)
      //   [2] right wall: (width,0) -> (width,depth)
      walls = [
        makeWall({ x: 0, z: 0 }, { x: width, z: 0 }, height, t),
        makeWall({ x: 0, z: 0 }, { x: 0, z: depth }, height, t),
        makeWall({ x: width, z: 0 }, { x: width, z: depth }, height, t),
      ];
      break;
    }
    case "CLOSED": {
      // 4 walls (room is fully enclosed):
      //   [0] back wall:   (0,0)     -> (width,0)
      //   [1] left wall:   (0,0)     -> (0,depth)
      //   [2] right wall:  (width,0) -> (width,depth)
      //   [3] front wall:  (0,depth) -> (width,depth)
      walls = [
        makeWall({ x: 0, z: 0 }, { x: width, z: 0 }, height, t),
        makeWall({ x: 0, z: 0 }, { x: 0, z: depth }, height, t),
        makeWall({ x: width, z: 0 }, { x: width, z: depth }, height, t),
        makeWall({ x: 0, z: depth }, { x: width, z: depth }, height, t),
      ];
      break;
    }
    case "ISLAND": {
      // 4 walls + a centred island plate (kitchen-island standard).
      //   [0] back wall:   (0,0)     -> (width,0)
      //   [1] left wall:   (0,0)     -> (0,depth)
      //   [2] right wall:  (width,0) -> (width,depth)
      //   [3] front wall:  (0,depth) -> (width,depth)
      walls = [
        makeWall({ x: 0, z: 0 }, { x: width, z: 0 }, height, t),
        makeWall({ x: 0, z: 0 }, { x: 0, z: depth }, height, t),
        makeWall({ x: width, z: 0 }, { x: width, z: depth }, height, t),
        makeWall({ x: 0, z: depth }, { x: width, z: depth }, height, t),
      ];
      break;
    }
    default: {
      // Exhaustive guard — TS will flag any missing case.
      const _exhaustive: never = shape;
      throw new Error(`Unknown room shape: ${String(_exhaustive)}`);
    }
  }

  // Apply the window. For SINGLE_WALL we still allow a window (it is the
  // single back wall). Use either the user-supplied hint or the shape default.
  const targetIndex = input.window?.wallIndex ?? DEFAULT_WINDOW_WALL_INDEX[shape];
  if (targetIndex >= 0 && targetIndex < walls.length) {
    const wall = walls[targetIndex];
    const segLength = segmentLength(wall);
    const winWidth = clamp(
      input.window?.width ?? DEFAULT_WINDOW.width,
      200,
      Math.max(200, segLength - 200),
    );
    const winHeight = input.window?.height ?? DEFAULT_WINDOW.height;
    const sill = input.window?.sillHeight ?? DEFAULT_WINDOW.sillHeight;
    // Centre horizontally if no explicit offset is supplied.
    const centeredOffset = Math.max(0, (segLength - winWidth) / 2);
    const offset = clamp(
      input.window?.offset ?? centeredOffset,
      0,
      Math.max(0, segLength - winWidth),
    );
    walls[targetIndex] = {
      ...wall,
      hasWindow: true,
      windowOffset: offset,
      windowWidth: winWidth,
      windowHeight: winHeight,
      windowSillHeight: sill,
    };
  }

  const layout: RoomLayout = {
    width,
    depth,
    height,
    shape,
    floor,
    walls,
  };

  if (shape === "ISLAND") {
    layout.island = {
      width: 1800,
      depth: 900,
      height: 900,
    };
  }

  return layout;
}

/** Length of a wall segment on the floor plan, in mm. */
export function segmentLength(wall: WallSegment): number {
  const dx = wall.end.x - wall.start.x;
  const dz = wall.end.z - wall.start.z;
  return Math.sqrt(dx * dx + dz * dz);
}

/** Angle (radians) of the wall segment in the XZ plane, measured from +X. */
export function segmentAngle(wall: WallSegment): number {
  return Math.atan2(wall.end.z - wall.start.z, wall.end.x - wall.start.x);
}

function makeWall(
  start: { x: number; z: number },
  end: { x: number; z: number },
  height: number,
  thickness: number,
): WallSegment {
  return { start, end, height, thickness };
}

function clamp(value: number, min: number, max: number): number {
  if (max < min) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}
