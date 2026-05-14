"use client";

import * as React from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Grid,
  Environment,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";
import type { DesignerState, DesignerUnit } from "@/components/designer/types";
import { Unit3D } from "./unit-3d";
import { Walls3D, type IslandRender } from "./walls-3d";
import { worldPlacement, type WallData } from "@/lib/designer/wall-geometry";

export type SceneCameraPreset = "perspective" | "top" | "front" | "walk" | "hero";

const MM = 0.001;

export type TimeOfDay = "morning" | "noon" | "sunset" | "night";

/**
 * Time-of-day lighting presets.
 *
 * `sunDir` is a unit-ish direction the sun points from (relative to room
 * centre). The actual world position is computed by multiplying with the
 * room scale inside `SceneContents`, so the sun always sits comfortably
 * outside the room regardless of room size.
 *
 * `envPreset` values must match drei's bundled HDRIs (they ship inside
 * `@react-three/drei` — no network fetch required).
 */
type EnvPreset =
  | "apartment"
  | "city"
  | "sunset"
  | "night"
  | "warehouse";

interface TodPreset {
  sunDir: [number, number, number];
  sunColor: string;
  sunIntensity: number;
  envPreset: EnvPreset;
  envIntensity: number;
  hemiSky: string;
  hemiGround: string;
  hemiIntensity: number;
  /** Night mode adds counter spotlights to compensate for the dim sun. */
  counterSpots: boolean;
}

const TOD_PRESETS: Record<TimeOfDay, TodPreset> = {
  morning: {
    sunDir: [-1.4, 0.45, 0.6],
    sunColor: "#ffd6a8",
    sunIntensity: 1.4,
    envPreset: "apartment",
    envIntensity: 0.7,
    hemiSky: "#fff1dc",
    hemiGround: "#3a2818",
    hemiIntensity: 0.25,
    counterSpots: false,
  },
  noon: {
    sunDir: [0.25, 1.6, 0.4],
    sunColor: "#fffaf0",
    sunIntensity: 2.2,
    envPreset: "city",
    envIntensity: 1.0,
    hemiSky: "#fffaf0",
    hemiGround: "#3a2818",
    hemiIntensity: 0.25,
    counterSpots: false,
  },
  sunset: {
    sunDir: [1.5, 0.35, 0.5],
    sunColor: "#ff9a4a",
    sunIntensity: 1.6,
    envPreset: "sunset",
    envIntensity: 1.2,
    hemiSky: "#ffb98a",
    hemiGround: "#2a1a10",
    hemiIntensity: 0.2,
    counterSpots: false,
  },
  night: {
    sunDir: [0.2, 1.4, 0.3],
    sunColor: "#7da3c8",
    sunIntensity: 0.1,
    envPreset: "night",
    envIntensity: 0.3,
    hemiSky: "#1a2438",
    hemiGround: "#0a0c14",
    hemiIntensity: 0.15,
    counterSpots: true,
  },
};

export interface Scene3DProps {
  design: DesignerState;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  ambientLightOn?: boolean;
  /**
   * Time of day for the lighting rig. Defaults to "noon" — bright, neutral
   * daylight suitable for showcasing materials and finishes.
   */
  timeOfDay?: TimeOfDay;
  /**
   * Custom walls from the wizard. When provided, replaces the generic
   * RoomShell with each wall positioned at its angle and length, plus
   * window/door cutouts. Wall-bound units (Unit.wallId set) are placed
   * relative to their wall.
   */
  walls?: WallData[];
  island?: IslandRender | null;
  /**
   * Hide walls + floor for clean product shots. Wall-bound units stay in
   * place since their world transform was already computed from the wall
   * geometry — they keep their position even without the wall visible.
   */
  hideWalls?: boolean;
  /**
   * Active camera preset. The scene animates the perspective camera + orbit
   * target whenever this changes so the designer can flip between hero shot,
   * top-down, front, walk-through, etc.
   */
  cameraPreset?: SceneCameraPreset;
  /**
   * When this number changes, the scene captures the current canvas as a PNG
   * and invokes onSnapshot with the data URL. Treat it like a "request id" —
   * incrementing it triggers exactly one snapshot.
   */
  snapshotRequest?: number;
  onSnapshot?: (dataUrl: string) => void;
  /**
   * Callback fired when the user drags a unit on the XZ plane via the
   * TransformControls gizmo. Receives the dragged unit's id and its new
   * top-down room-space coordinates in mm.
   */
  onUnitTransform?: (unitId: string, next: { x: number; y: number }) => void;
}

export function Scene3D({
  design,
  selectedId,
  onSelect,
  ambientLightOn = true,
  timeOfDay = "noon",
  walls,
  island,
  hideWalls = false,
  cameraPreset = "perspective",
  snapshotRequest,
  onSnapshot,
  onUnitTransform,
}: Scene3DProps) {
  const roomW = design.room.width * MM;
  const roomD = design.room.depth * MM;
  const roomH = design.room.height * MM;

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [roomW * 0.9, roomH * 1.1, roomD * 1.2], fov: 50 }}
      onPointerMissed={() => onSelect(null)}
      gl={{
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
        antialias: true,
        powerPreference: "high-performance",
        // Required so `gl.domElement.toDataURL()` returns a non-blank PNG when
        // the user clicks the Snapshot button.
        preserveDrawingBuffer: true,
      }}
    >
      <SceneContents
        design={design}
        selectedId={selectedId}
        onSelect={onSelect}
        roomW={roomW}
        roomD={roomD}
        roomH={roomH}
        ambientLightOn={ambientLightOn}
        timeOfDay={timeOfDay}
        walls={walls}
        island={island}
        hideWalls={hideWalls}
        cameraPreset={cameraPreset}
        snapshotRequest={snapshotRequest}
        onSnapshot={onSnapshot}
        onUnitTransform={onUnitTransform}
      />
    </Canvas>
  );
}

// Camera positions per preset, in units of room dimensions (m). Each tuple is
// [posX, posY, posZ, targetX, targetY, targetZ] in fractions of (roomW, roomH,
// roomD). Hero shot is a 30°-elevation 45°-azimuth isometric 3/4.
const CAM_PRESETS: Record<
  SceneCameraPreset,
  { pos: [number, number, number]; target: [number, number, number] }
> = {
  perspective: { pos: [0.9, 1.1, 1.2], target: [0.5, 0.25, 0.5] },
  hero:        { pos: [1.4, 1.4, 1.4], target: [0.5, 0.35, 0.5] },
  top:         { pos: [0.5, 2.5, 0.5], target: [0.5, 0.0, 0.5] },
  front:       { pos: [0.5, 0.5, 2.0], target: [0.5, 0.3, 0.5] },
  walk:        { pos: [0.5, 0.6, 0.6], target: [0.5, 0.4, 0.0] },
};

function CameraDriver({
  preset,
  roomW,
  roomH,
  roomD,
}: {
  preset: SceneCameraPreset;
  roomW: number;
  roomH: number;
  roomD: number;
}) {
  const { camera, controls } = useThree();
  React.useEffect(() => {
    const cfg = CAM_PRESETS[preset];
    const px = cfg.pos[0] * roomW;
    const py = cfg.pos[1] * roomH;
    const pz = cfg.pos[2] * roomD;
    const tx = cfg.target[0] * roomW;
    const ty = cfg.target[1] * roomH;
    const tz = cfg.target[2] * roomD;
    camera.position.set(px, py, pz);
    camera.lookAt(tx, ty, tz);
    camera.updateProjectionMatrix();
    // OrbitControls keeps its own target; sync it so the next drag pivots
    // around the intended look-at.
    const ctrl = controls as
      | { target?: THREE.Vector3; update?: () => void }
      | null
      | undefined;
    if (ctrl?.target) {
      ctrl.target.set(tx, ty, tz);
      ctrl.update?.();
    }
  }, [preset, camera, controls, roomW, roomH, roomD]);
  return null;
}

function SnapshotDriver({
  requestId,
  onCapture,
}: {
  requestId: number | undefined;
  onCapture: ((url: string) => void) | undefined;
}) {
  const { gl, scene, camera } = useThree();
  const lastReq = React.useRef<number | undefined>(undefined);
  React.useEffect(() => {
    if (requestId == null || requestId === lastReq.current || !onCapture) return;
    lastReq.current = requestId;
    // Render once with no transparency so the screenshot has a solid bg, then
    // pull the data URL straight off the canvas.
    gl.render(scene, camera);
    try {
      const url = gl.domElement.toDataURL("image/png");
      onCapture(url);
    } catch (e) {
      console.error("Snapshot failed:", e);
    }
  }, [requestId, gl, scene, camera, onCapture]);
  return null;
}

function SceneContents({
  design,
  selectedId,
  onSelect,
  roomW,
  roomD,
  roomH,
  ambientLightOn,
  timeOfDay,
  walls,
  island,
  hideWalls,
  cameraPreset,
  snapshotRequest,
  onSnapshot,
  onUnitTransform,
}: {
  design: DesignerState;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  roomW: number;
  roomD: number;
  roomH: number;
  ambientLightOn: boolean;
  timeOfDay: TimeOfDay;
  walls?: WallData[];
  island?: IslandRender | null;
  hideWalls: boolean;
  cameraPreset: SceneCameraPreset;
  snapshotRequest?: number;
  onSnapshot?: (dataUrl: string) => void;
  onUnitTransform?: (unitId: string, next: { x: number; y: number }) => void;
}) {
  const tod = TOD_PRESETS[timeOfDay];
  const useWizardWalls = !!(walls && walls.length > 0);

  // Lookup map so each wall-bound unit can find its wall in O(1).
  const wallById = React.useMemo(() => {
    const map = new Map<string, WallData>();
    if (walls) for (const w of walls) map.set(w.id, w);
    return map;
  }, [walls]);

  // Place the sun a comfortable distance outside the room so the shadow
  // camera's orthographic frustum (configured below) covers the whole
  // footprint without clipping.
  const sunDistance = Math.max(roomW, roomD, roomH) * 2.2;
  const sunX = roomW / 2 + tod.sunDir[0] * sunDistance;
  const sunY = tod.sunDir[1] * sunDistance;
  const sunZ = roomD / 2 + tod.sunDir[2] * sunDistance;

  // When the legacy `ambientLightOn` flag is off the user explicitly asked
  // for a darker preview — dim everything proportionally rather than
  // killing the new time-of-day rig entirely.
  const dimFactor = ambientLightOn ? 1 : 0.2;

  return (
    <>
      {/* === Hemispheric fill (sky/ground bounce) === */}
      <hemisphereLight
        intensity={tod.hemiIntensity * dimFactor}
        color={tod.hemiSky}
        groundColor={tod.hemiGround}
      />

      {/* === Sun (key directional light with high-quality shadows) === */}
      <directionalLight
        position={[sunX, sunY, sunZ]}
        intensity={tod.sunIntensity * dimFactor}
        color={tod.sunColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0005}
        shadow-camera-far={20}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />

      {/* === Night-only: counter spotlights to compensate for dim sun === */}
      {tod.counterSpots ? (
        <>
          <spotLight
            position={[roomW * 0.3, roomH * 0.95, roomD * 0.55]}
            target-position={[roomW * 0.3, roomH * 0.6, roomD * 0.55]}
            angle={0.55}
            penumbra={0.6}
            intensity={4.5}
            distance={6}
            color="#fff1cc"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-bias={-0.0005}
          />
          <spotLight
            position={[roomW * 0.75, roomH * 0.95, roomD * 0.55]}
            target-position={[roomW * 0.75, roomH * 0.6, roomD * 0.55]}
            angle={0.55}
            penumbra={0.6}
            intensity={4.5}
            distance={6}
            color="#fff1cc"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-bias={-0.0005}
          />
        </>
      ) : null}

      {/* === Room walls + parquet floor ===
          When walls from the wizard are provided, render those instead of
          the generic two-wall shell. Falls back to the legacy shell only
          for projects that haven't run the wizard yet. */}
      {hideWalls ? null : useWizardWalls ? (
        <Walls3D
          walls={walls!}
          island={island ?? null}
          room={{
            width: design.room.width,
            depth: design.room.depth,
            height: design.room.height,
          }}
        />
      ) : (
        <>
          <RoomShell width={roomW} depth={roomD} height={roomH} />
          <WindowGlow
            width={roomW}
            depth={roomD}
            height={roomH}
            timeOfDay={timeOfDay}
          />
        </>
      )}

      {/* === Floor grid (kept for designer affordance) === */}
      <Grid
        position={[roomW / 2, 0.0005, roomD / 2]}
        args={[roomW, roomD]}
        cellSize={0.1}
        cellThickness={0.5}
        cellColor="#444"
        sectionSize={1}
        sectionThickness={1.5}
        sectionColor="#666"
        fadeDistance={20}
        infiniteGrid={false}
      />

      {/* === Soft AO-like ground shadow under the kitchen === */}
      <React.Suspense fallback={null}>
        <ContactShadows
          position={[roomW / 2, 0.002, roomD / 2]}
          opacity={0.5}
          scale={12}
          blur={2.5}
          far={4}
          resolution={1024}
          color="#000"
        />
      </React.Suspense>

      {/* === Units === */}
      {design.units.map((unit: DesignerUnit) => {
        // Wall-bound units: compute world transform from their wall.
        let overrideTransform:
          | { position: [number, number, number]; rotationY: number }
          | undefined;
        if (unit.wallId) {
          const wall = wallById.get(unit.wallId);
          if (wall) {
            const offsetCentre =
              (unit.wallOffset ?? 0) + unit.width / 2;
            const baseHeight =
              unit.baseHeight ??
              (unit.category === "UPPER_CABINET" ? 1400 : 0);
            const floorCentre = baseHeight + unit.height / 2;
            const placement = worldPlacement(wall, offsetCentre, floorCentre);
            // Push the unit toward the interior by half its depth so the
            // back panel sits flush against the wall.
            const pushDist = (unit.depth * MM) / 2;
            overrideTransform = {
              position: [
                placement.position[0] +
                  placement.interiorNormal[0] * pushDist,
                placement.position[1],
                placement.position[2] +
                  placement.interiorNormal[2] * pushDist,
              ],
              rotationY: placement.rotationY,
            };
          }
        }
        return (
          <Unit3D
            key={unit.id}
            unit={unit}
            options={extractOptions(unit)}
            selected={unit.id === selectedId}
            onSelect={onSelect}
            overrideTransform={overrideTransform}
            onTransform={onUnitTransform ? (next) => onUnitTransform(unit.id, next) : undefined}
          />
        );
      })}

      {/* === HDRI environment (drei-bundled, no network) === */}
      <React.Suspense fallback={null}>
        <Environment
          preset={tod.envPreset}
          environmentIntensity={tod.envIntensity * dimFactor}
        />
      </React.Suspense>

      {/* === Camera controls === */}
      <OrbitControls
        makeDefault
        target={[roomW / 2, roomH / 4, roomD / 2]}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={1}
        maxDistance={20}
        enableDamping
        dampingFactor={0.08}
      />
      <CameraDriver
        preset={cameraPreset}
        roomW={roomW}
        roomH={roomH}
        roomD={roomD}
      />
      <SnapshotDriver
        requestId={snapshotRequest}
        onCapture={onSnapshot}
      />
    </>
  );
}

/**
 * Bright emissive plane on the back wall, simulating a window. The strong
 * emissive value (2.5 with a warm colour) is what the post-processing
 * bloom pass keys off of — it appears as a glowing rectangle even before
 * bloom is wired up.
 */
function WindowGlow({
  width,
  depth: _depth,
  height,
  timeOfDay,
}: {
  width: number;
  depth: number;
  height: number;
  timeOfDay: TimeOfDay;
}) {
  // Window roughly 40% of wall width, 45% of wall height, vertically
  // centred slightly above the counter line.
  const winW = width * 0.4;
  const winH = height * 0.45;
  const winY = height * 0.55;

  // Tint the "sky" outside the window based on time of day.
  const skyColor =
    timeOfDay === "sunset"
      ? "#ff8a3a"
      : timeOfDay === "morning"
        ? "#ffd8a8"
        : timeOfDay === "night"
          ? "#1a2540"
          : "#fff6e0";

  const emissiveIntensity = timeOfDay === "night" ? 0.4 : 2.5;

  return (
    <mesh position={[width / 2, winY, 0.001]}>
      <planeGeometry args={[winW, winH]} />
      <meshStandardMaterial
        color={skyColor}
        emissive={skyColor}
        emissiveIntensity={emissiveIntensity}
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function RoomShell({
  width,
  depth,
  height,
}: {
  width: number;
  depth: number;
  height: number;
}) {
  const wallColor = "#f1ebe1"; // PBR plaster — slightly warm off-white
  const floorColor = "#c9a87a"; // light parquet wood
  const wallThickness = 0.05;
  return (
    <group>
      {/* Floor — PBR parquet-style wood with subtle clearcoat */}
      <mesh
        receiveShadow
        position={[width / 2, -wallThickness / 2, depth / 2]}
      >
        <boxGeometry args={[width, wallThickness, depth]} />
        <meshPhysicalMaterial
          color={floorColor}
          roughness={0.55}
          metalness={0}
          clearcoat={0.3}
          clearcoatRoughness={0.4}
          reflectivity={0.35}
        />
      </mesh>
      {/* Back wall — PBR plaster */}
      <mesh
        receiveShadow
        position={[width / 2, height / 2, -wallThickness / 2]}
      >
        <boxGeometry args={[width, height, wallThickness]} />
        <meshPhysicalMaterial
          color={wallColor}
          roughness={0.85}
          metalness={0}
          sheen={0.05}
          sheenColor="#fff5e8"
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Left wall — PBR plaster */}
      <mesh
        receiveShadow
        position={[-wallThickness / 2, height / 2, depth / 2]}
      >
        <boxGeometry args={[wallThickness, height, depth]} />
        <meshPhysicalMaterial
          color={wallColor}
          roughness={0.85}
          metalness={0}
          sheen={0.05}
          sheenColor="#fff5e8"
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function extractOptions(unit: DesignerUnit) {
  // The design.units may include `options` from when AI added them or from
  // explicit user actions. The base DesignerUnit doesn't carry options yet,
  // so we infer defaults based on category for now.
  const category = unit.category;
  if (category === "APPLIANCE") {
    const label = unit.templateName.toLowerCase();
    let appliance = "other";
    if (label.includes("فرن")) appliance = "oven";
    else if (label.includes("ميكروويف")) appliance = "microwave";
    else if (label.includes("ثلاج") && label.includes("side")) appliance = "fridge-sbs";
    else if (label.includes("ثلاج")) appliance = "fridge";
    else if (label.includes("شفاط")) appliance = "hood";
    else if (label.includes("صحون")) appliance = "dishwasher";
    else if (label.includes("كهربائي") || label.includes("cooktop")) appliance = "cooktop";
    else if (label.includes("غاز") || label.includes("hob")) appliance = "hob";
    return { appliance };
  }

  const name = unit.templateName;
  const doors =
    name.includes("ضلفة واحدة") || name.includes("ضلفه ضلفه")
      ? 1
      : name.includes("ضلفتين") || name.includes("ضلفه واحده")
        ? 2
        : 0;
  const drawers =
    name.includes("درج واحد") || name.includes("درجين")
      ? name.includes("درجين") ? 2 : 1
      : name.includes("ثلاثة أدراج")
        ? 3
        : name.includes("أربعة أدراج")
          ? 4
          : 0;
  const hasGlass = name.includes("زجاج");
  const hasLed = false; // future: per-unit toggle

  // Why: only assign doors when the unit name explicitly mentions doors
  // (ضلفة/ضلفتين/ضلفه). A drawer unit must NOT get a default 2-door overlay —
  // that's what was making drawers visually swing like doors when clicked.
  // If neither doors nor drawers are detected, fall back to a single door so
  // the cabinet still looks finished rather than a hollow box.
  const inferredDoors = doors > 0 ? doors : drawers === 0 ? 1 : 0;

  return {
    doors: inferredDoors,
    drawers,
    hasGlass,
    glassTint: hasGlass ? "smoked" : undefined,
    led: hasLed ? { enabled: true, color: "#fff8e7" } : undefined,
  };
}
