"use client";

/**
 * RoomScene — pure presentational R3F component.
 *
 * Renders a `RoomLayout` (walls, floor, window opening + glass, window-light)
 * with no coupling to the designer's editing state. Drop it inside an existing
 * <Canvas> (this component returns a `<group>`, not a Canvas).
 *
 * All input is in millimetres — internally we convert to metres using MM so
 * the scale matches the rest of `scene.tsx`.
 */

import * as React from "react";
import { ContactShadows, Environment, Plane } from "@react-three/drei";
import * as THREE from "three";
import type { RoomFloor, RoomLayout, WallSegment } from "@/lib/designer/room-shapes";
import { segmentAngle, segmentLength } from "@/lib/designer/room-shapes";

const MM = 0.001;
const WALL_COLOR = "#f1ebe1";
const SUN_COLOR = "#fff4d8";

interface FloorMaterial {
  color: string;
  roughness: number;
  metalness?: number;
}

const FLOOR_MATERIALS: Record<RoomFloor, FloorMaterial> = {
  TILES: { color: "#d8d4cc", roughness: 0.45 },
  WOOD: { color: "#b08a5b", roughness: 0.7 },
  MARBLE: { color: "#ece8e1", roughness: 0.15, metalness: 0.05 },
};

export interface RoomSceneProps {
  layout: RoomLayout;
  theme?: { ambient?: number };
}

export function RoomScene({ layout, theme }: RoomSceneProps): React.JSX.Element {
  const ambient = theme?.ambient ?? 0.35;
  const widthM = layout.width * MM;
  const depthM = layout.depth * MM;
  const heightM = layout.height * MM;

  // The first wall with a window drives our "sun" direction. If no window
  // exists we still render the rest of the scene (no sun light).
  const windowWall = layout.walls.find((w) => w.hasWindow);

  return (
    <group>
      {/* === Ambient + sun lighting === */}
      <ambientLight intensity={ambient} />
      {windowWall ? <WindowSunLight layout={layout} wall={windowWall} /> : null}

      {/* === Floor === */}
      <Floor layout={layout} />

      {/* === Walls (and window glass) === */}
      {layout.walls.map((wall, i) => (
        <WallView
          key={`wall-${i}`}
          wall={wall}
          roomHeight={layout.height}
        />
      ))}

      {/* === Island plate (centre of room) when applicable === */}
      {layout.island ? (
        <IslandPlate layout={layout} />
      ) : null}

      {/* === Soft contact shadow beneath the whole footprint === */}
      <ContactShadows
        position={[widthM / 2, 0.001, depthM / 2]}
        opacity={0.35}
        scale={Math.max(widthM, depthM) * 1.5}
        blur={2.2}
        far={Math.max(0.5, heightM * 0.5)}
      />

      {/* === Async environment map for soft reflections === */}
      <React.Suspense fallback={null}>
        <Environment preset="apartment" />
      </React.Suspense>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* Floor                                                                       */
/* -------------------------------------------------------------------------- */

function Floor({ layout }: { layout: RoomLayout }) {
  const widthM = layout.width * MM;
  const depthM = layout.depth * MM;
  const mat = FLOOR_MATERIALS[layout.floor];
  return (
    <Plane
      args={[widthM, depthM]}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[widthM / 2, 0, depthM / 2]}
      receiveShadow
    >
      <meshStandardMaterial
        color={mat.color}
        roughness={mat.roughness}
        metalness={mat.metalness ?? 0}
      />
    </Plane>
  );
}

/* -------------------------------------------------------------------------- */
/* Walls                                                                       */
/* -------------------------------------------------------------------------- */

function WallView({
  wall,
  roomHeight,
}: {
  wall: WallSegment;
  roomHeight: number;
}) {
  if (wall.hasWindow && wall.windowWidth && wall.windowHeight !== undefined) {
    return <WallWithWindow wall={wall} roomHeight={roomHeight} />;
  }
  return <SolidWall wall={wall} />;
}

interface WallSlabProps {
  /** Length of the slab along the wall direction, mm. */
  length: number;
  /** Height of the slab, mm. */
  height: number;
  /** Thickness of the slab, mm. */
  thickness: number;
  /** Vertical centre Y in mm (slab is centred on this). */
  centerYMm: number;
  /** Offset from the wall's `start` along the wall direction, mm — for the centre of the slab. */
  alongOffsetMm: number;
  /** The owning wall (used to derive position + rotation). */
  wall: WallSegment;
}

/**
 * Render a single rectangular wall slab oriented along the wall direction.
 * The wall is built as a box; "thickness" extends inward (toward room interior),
 * not centred on the segment line — kitchens look better when walls hug the
 * outer footprint instead of straddling it.
 */
function WallSlab({
  length,
  height,
  thickness,
  centerYMm,
  alongOffsetMm,
  wall,
}: WallSlabProps) {
  const angle = segmentAngle(wall);
  // Direction along the wall.
  const dirX = Math.cos(angle);
  const dirZ = Math.sin(angle);
  // Inward normal (rotate dir by +90° around Y): (dz, -dx). For our axes a
  // segment running along +X (back wall) yields inward normal (0,+1) -> +Z.
  const normalX = -dirZ;
  const normalZ = dirX;

  // Centre point of the slab along the wall line.
  const baseX = wall.start.x + dirX * alongOffsetMm;
  const baseZ = wall.start.z + dirZ * alongOffsetMm;
  // Shift inward by half the thickness so the outer face sits on the segment.
  const cx = (baseX + normalX * (thickness / 2)) * MM;
  const cz = (baseZ + normalZ * (thickness / 2)) * MM;
  const cy = centerYMm * MM;

  return (
    <mesh position={[cx, cy, cz]} rotation={[0, -angle, 0]} castShadow receiveShadow>
      <boxGeometry args={[length * MM, height * MM, thickness * MM]} />
      <meshStandardMaterial color={WALL_COLOR} roughness={0.85} side={THREE.DoubleSide} />
    </mesh>
  );
}

function SolidWall({ wall }: { wall: WallSegment }) {
  const length = segmentLength(wall);
  return (
    <WallSlab
      wall={wall}
      length={length}
      height={wall.height}
      thickness={wall.thickness}
      centerYMm={wall.height / 2}
      alongOffsetMm={length / 2}
    />
  );
}

/**
 * Render a wall that has a window: emits three slabs (left, right, lintel/sill)
 * around the opening and a glass plane filling the hole. We don't actually
 * subtract geometry — this is the cheapest visually-correct approximation.
 */
function WallWithWindow({
  wall,
  roomHeight,
}: {
  wall: WallSegment;
  roomHeight: number;
}) {
  const length = segmentLength(wall);
  const offset = wall.windowOffset ?? 0;
  const winW = wall.windowWidth ?? 0;
  const winH = wall.windowHeight ?? 0;
  const sill = wall.windowSillHeight ?? 0;
  const wallH = wall.height;

  const leftLen = Math.max(0, offset);
  const rightStart = offset + winW;
  const rightLen = Math.max(0, length - rightStart);
  const sillLen = winW;
  const headerH = Math.max(0, wallH - (sill + winH));

  // Slabs around the opening.
  const slabs: React.ReactNode[] = [];
  if (leftLen > 0) {
    slabs.push(
      <WallSlab
        key="left"
        wall={wall}
        length={leftLen}
        height={wallH}
        thickness={wall.thickness}
        centerYMm={wallH / 2}
        alongOffsetMm={leftLen / 2}
      />,
    );
  }
  if (rightLen > 0) {
    slabs.push(
      <WallSlab
        key="right"
        wall={wall}
        length={rightLen}
        height={wallH}
        thickness={wall.thickness}
        centerYMm={wallH / 2}
        alongOffsetMm={rightStart + rightLen / 2}
      />,
    );
  }
  if (sill > 0) {
    slabs.push(
      <WallSlab
        key="sill"
        wall={wall}
        length={sillLen}
        height={sill}
        thickness={wall.thickness}
        centerYMm={sill / 2}
        alongOffsetMm={offset + winW / 2}
      />,
    );
  }
  if (headerH > 0) {
    slabs.push(
      <WallSlab
        key="header"
        wall={wall}
        length={sillLen}
        height={headerH}
        thickness={wall.thickness}
        centerYMm={sill + winH + headerH / 2}
        alongOffsetMm={offset + winW / 2}
      />,
    );
  }

  return (
    <group>
      {slabs}
      <WindowGlass wall={wall} roomHeight={roomHeight} />
    </group>
  );
}

/**
 * Thin glass pane spanning the window opening. The pane sits in the middle of
 * the wall thickness so both interior and exterior see it.
 */
function WindowGlass({
  wall,
  roomHeight: _roomHeight,
}: {
  wall: WallSegment;
  roomHeight: number;
}) {
  const offset = wall.windowOffset ?? 0;
  const winW = wall.windowWidth ?? 0;
  const winH = wall.windowHeight ?? 0;
  const sill = wall.windowSillHeight ?? 0;
  const angle = segmentAngle(wall);
  const dirX = Math.cos(angle);
  const dirZ = Math.sin(angle);
  const normalX = -dirZ;
  const normalZ = dirX;

  // Centre of the opening along the wall line.
  const alongMm = offset + winW / 2;
  const baseX = wall.start.x + dirX * alongMm;
  const baseZ = wall.start.z + dirZ * alongMm;
  // Pane sits at the centre of the wall thickness.
  const cx = (baseX + normalX * (wall.thickness / 2)) * MM;
  const cz = (baseZ + normalZ * (wall.thickness / 2)) * MM;
  const cy = (sill + winH / 2) * MM;

  return (
    <Plane
      args={[winW * MM, winH * MM]}
      position={[cx, cy, cz]}
      // Plane faces +Z by default; rotate it so its normal aligns with the
      // wall's inward normal.
      rotation={[0, -angle, 0]}
    >
      <meshPhysicalMaterial
        color="#dceaf2"
        transmission={0.85}
        roughness={0.05}
        thickness={0.5}
        ior={1.5}
        transparent
        opacity={0.4}
        side={THREE.DoubleSide}
      />
    </Plane>
  );
}

/* -------------------------------------------------------------------------- */
/* Window sun-light                                                            */
/* -------------------------------------------------------------------------- */

function WindowSunLight({
  layout,
  wall,
}: {
  layout: RoomLayout;
  wall: WallSegment;
}) {
  const offset = wall.windowOffset ?? 0;
  const winW = wall.windowWidth ?? 0;
  const winH = wall.windowHeight ?? 0;
  const sill = wall.windowSillHeight ?? 0;

  const angle = segmentAngle(wall);
  const dirX = Math.cos(angle);
  const dirZ = Math.sin(angle);
  // Outward normal = inverse of the inward normal we use for walls.
  const outwardX = dirZ;
  const outwardZ = -dirX;

  // Anchor at the window centre.
  const alongMm = offset + winW / 2;
  const winCenterXmm = wall.start.x + dirX * alongMm;
  const winCenterZmm = wall.start.z + dirZ * alongMm;
  const winCenterYmm = sill + winH / 2;

  // Stand the light a few metres outside the window, elevated a touch above
  // the opening to simulate mid-morning sun.
  const standOffMm = 3000;
  const lx = (winCenterXmm + outwardX * standOffMm) * MM;
  const lz = (winCenterZmm + outwardZ * standOffMm) * MM;
  const ly = (winCenterYmm + 1200) * MM;

  const widthM = layout.width * MM;
  const depthM = layout.depth * MM;
  const heightM = layout.height * MM;
  const shadowExtent = Math.max(widthM, depthM);

  return (
    <directionalLight
      position={[lx, ly, lz]}
      target-position={[
        winCenterXmm * MM,
        (winCenterYmm - 200) * MM,
        winCenterZmm * MM,
      ]}
      intensity={1.6}
      color={SUN_COLOR}
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-near={0.1}
      shadow-camera-far={shadowExtent * 4 + heightM * 2}
      shadow-camera-left={-shadowExtent}
      shadow-camera-right={shadowExtent}
      shadow-camera-top={shadowExtent}
      shadow-camera-bottom={-shadowExtent}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Island                                                                      */
/* -------------------------------------------------------------------------- */

function IslandPlate({ layout }: { layout: RoomLayout }) {
  if (!layout.island) return null;
  const { width, depth, height } = layout.island;
  const cx = (layout.width / 2) * MM;
  const cz = (layout.depth / 2) * MM;
  const cy = (height / 2) * MM;
  return (
    <mesh position={[cx, cy, cz]} castShadow receiveShadow>
      <boxGeometry args={[width * MM, height * MM, depth * MM]} />
      <meshStandardMaterial color="#e7e0d4" roughness={0.55} />
    </mesh>
  );
}
