"use client";

import * as React from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Edges, Html, TransformControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { DesignerUnit } from "@/components/designer/types";
import {
  buildFallbackMaterial,
  getPresetById,
  presetIdForUnit,
} from "@/lib/designer/materials";
import {
  getLibraryMaterial,
  type LibraryMaterial,
} from "@/lib/designer/material-library";

const MM = 0.001; // convert mm → meters for Three.js scene units

type UnitOptions = {
  doors?: number;
  drawers?: number;
  shelves?: number;
  hasGlass?: boolean;
  glassTint?: string;
  glassFinish?: string;
  led?: { enabled?: boolean; color?: string };
  appliance?: string;
};

interface Unit3DProps {
  unit: DesignerUnit;
  options?: UnitOptions;
  selected?: boolean;
  onSelect?: (id: string) => void;
  /**
   * Optional world transform override. When present, the unit ignores its
   * own (x, y, rotation) and uses these values instead. Used by Scene3D to
   * place wall-bound units along their wall.
   */
  overrideTransform?: {
    position: [number, number, number];
    rotationY: number;
  };
  /**
   * Callback when the user drags the unit on the XZ plane. Returns the new
   * top-down room-space (corner-anchored mm). StudioShell then snaps it
   * against walls + neighbours and applies the result.
   */
  onTransform?: (next: { x: number; y: number; baseHeight?: number }) => void;
}

const GLASS_TINT_COLORS: Record<string, string> = {
  clear: "#e6f0ff",
  bronze: "#7a5230",
  smoked: "#3a3a3a",
  "milky-white": "#f0f0f0",
  black: "#0a0a0a",
  green: "#3d7a5a",
  blue: "#3d6e7a",
};

// ============================================================
// Rounded geometry cache — RoundedBoxGeometry is moderately expensive
// (subdivision math runs in the constructor) and a typical kitchen reuses
// the same dimensions many times. Keyed by w/h/d/radius/smoothness.
// ============================================================
const roundedGeoCache = new Map<string, RoundedBoxGeometry>();
function getRoundedGeo(
  w: number,
  h: number,
  d: number,
  radius: number,
  smoothness = 2,
): RoundedBoxGeometry {
  // Round to 0.1 mm so floating-point chatter doesn't blow the cache.
  const k = `${w.toFixed(4)}|${h.toFixed(4)}|${d.toFixed(4)}|${radius.toFixed(4)}|${smoothness}`;
  let geo = roundedGeoCache.get(k);
  if (!geo) {
    // RoundedBoxGeometry refuses radius >= half of the shortest side.
    const safeRadius = Math.min(radius, Math.min(w, h, d) / 2 - 0.0001);
    geo = new RoundedBoxGeometry(w, h, d, smoothness, Math.max(safeRadius, 0.0001));
    roundedGeoCache.set(k, geo);
  }
  return geo;
}

// ============================================================
// Material resolution — preset-aware with safe fallbacks.
// ============================================================
function buildLibraryMaterial(entry: LibraryMaterial): THREE.MeshPhysicalMaterial {
  const m = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(entry.color),
    roughness: entry.roughness,
    metalness: entry.metalness,
    envMapIntensity: 1.2,
  });
  if (entry.clearcoat != null) m.clearcoat = entry.clearcoat;
  if (entry.clearcoatRoughness != null)
    m.clearcoatRoughness = entry.clearcoatRoughness;
  if (entry.sheen != null) {
    m.sheen = entry.sheen;
    m.sheenColor = new THREE.Color("#ffffff");
  }
  return m;
}

function useUnitMaterials(unit: DesignerUnit, selected?: boolean) {
  return React.useMemo(() => {
    // Selection override: keep the chunky purple body but still PBR so it
    // catches HDRI reflections.
    if (selected) {
      const sel = new THREE.MeshPhysicalMaterial({
        color: 0xa78bfa,
        roughness: 0.4,
        metalness: 0.1,
        clearcoat: 0.3,
        envMapIntensity: 1.2,
      });
      const facade = new THREE.MeshPhysicalMaterial({
        color: 0xc084fc,
        roughness: 0.3,
        metalness: 0.1,
        clearcoat: 0.4,
        envMapIntensity: 1.2,
      });
      return { body: sel, facade, presetId: "__selected__" };
    }

    // Library override — the new expanded material picker wins over the
    // legacy color-based heuristic when the designer has explicitly applied
    // a finish.
    if (unit.materialId) {
      const entry = getLibraryMaterial(unit.materialId);
      if (entry) {
        const body = buildLibraryMaterial(entry);
        const facade = buildLibraryMaterial(entry);
        // Slight body/facade differentiation so doors read as the "feature".
        body.envMapIntensity = (body.envMapIntensity ?? 1) * 0.9;
        return { body, facade, presetId: `lib:${entry.id}` };
      }
    }

    const presetId = presetIdForUnit(unit);
    const preset = getPresetById(presetId);

    if (preset) {
      const body = preset.build(THREE);
      const facade = preset.build(THREE);
      // Slightly tone down body envmap so doors read as the "feature" surface.
      body.envMapIntensity = (body.envMapIntensity ?? 1) * 0.9;
      return { body, facade, presetId };
    }

    // Unknown color → tinted fallback so we never flat-shade.
    const fallback = buildFallbackMaterial(unit.color || "#cdcdcd");
    return { body: fallback, facade: fallback.clone(), presetId: "__fallback__" };
  }, [unit.color, unit.category, unit.materialId, selected]);
}

/**
 * Procedural 3D cabinet — built from primitive boxes, no GLB files needed.
 * Supports door open/close animation, LED groove glow, glass shelves.
 */
export function Unit3D({ unit, options, selected, onSelect, overrideTransform, onTransform }: Unit3DProps) {
  const w = unit.width * MM;
  const h = unit.height * MM;
  const d = unit.depth * MM;
  const panel = 18 * MM;

  // Door state — toggle on click
  const [doorsOpen, setDoorsOpen] = React.useState(false);
  const doorAngle = useDoorAnimation(doorsOpen);

  // Drawer state — slides out instead of swinging
  const [drawersOpen, setDrawersOpen] = React.useState(false);
  const drawerSlide = useDrawerAnimation(drawersOpen);

  const doors = options?.doors ?? 0;
  const drawers = options?.drawers ?? 0;
  const isAppliance = unit.category === "APPLIANCE";
  const isGlass = !!options?.hasGlass;
  const hasLed = !!options?.led?.enabled;
  const ledColor = options?.led?.color ?? "#a78bfa";

  const { body: bodyMaterial, facade: facadeMaterial } = useUnitMaterials(unit, selected);

  // World position: from mm (room coords, top-down) to scene coords (Y up).
  const px = unit.x * MM;
  // baseHeight raises the unit off the floor (upper cabinets typically 1400 mm
  // up; the user can also lift any unit via the Y handle on TransformControls).
  const py = (unit.baseHeight ?? 0) * MM + h / 2;
  const pz = unit.y * MM;

  // Wall-bound units (set via the Assembly step) ignore (x, y, rotation) and
  // come positioned by Scene3D using the wall's geometry instead.
  const groupPosition: [number, number, number] = overrideTransform
    ? overrideTransform.position
    : [px + w / 2, py, pz + d / 2];
  const groupRotation: [number, number, number] = overrideTransform
    ? [0, overrideTransform.rotationY, 0]
    : [0, ((unit.rotation ?? 0) * Math.PI) / 180, 0];

  // If the unit has a GLB URL we render the imported model (auto-scaled to
  // the unit's box) instead of the procedural cabinet/appliance branches.
  // The procedural renderer stays the default — GLB rendering is purely
  // additive so existing kitchens are unaffected.
  const hasGlb = !!unit.glbUrl;

  // Group node for the drag gizmo. We mirror the ref into state so the
  // controls re-render once the mesh has actually mounted.
  const [groupNode, setGroupNode] = React.useState<THREE.Group | null>(null);

  return (
    <>
    <group
      ref={(g: THREE.Group | null) => setGroupNode(g)}
      position={groupPosition}
      rotation={groupRotation}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onSelect?.(unit.id);
      }}
    >
      {hasGlb ? (
        <React.Suspense fallback={<LoadingProxy width={w} height={h} depth={d} />}>
          <GLBUnit url={unit.glbUrl!} width={w} height={h} depth={d} />
        </React.Suspense>
      ) : isAppliance ? (
        /* === APPLIANCE: render with metallic look + placeholder mesh === */
        <ApplianceBox width={w} height={h} depth={d} type={options?.appliance} selected={selected} />
      ) : (
        <>
          {/* === Cabinet body (sides + top + bottom + back) === */}
          <CabinetBody
            width={w}
            height={h}
            depth={d}
            material={bodyMaterial}
            panel={panel}
          />

          {/* === Drawers (front faces stacked, slide-out animation) === */}
          {drawers > 0 ? (
            <DrawerStack
              width={w}
              height={h}
              depth={d}
              count={drawers}
              material={facadeMaterial}
              panel={panel}
              slide={drawerSlide}
              onTogglePointerDown={(e: ThreeEvent<MouseEvent>) => {
                e.stopPropagation();
                setDrawersOpen((v) => !v);
              }}
            />
          ) : null}

          {/* === Doors (only when no drawers above OR doors specified) === */}
          {doors > 0 && drawers === 0 ? (
            <DoorPair
              width={w}
              height={h}
              depth={d}
              doors={doors}
              material={facadeMaterial}
              panel={panel}
              isGlass={isGlass}
              glassTint={options?.glassTint}
              angle={doorAngle}
              onTogglePointerDown={(e: ThreeEvent<MouseEvent>) => {
                e.stopPropagation();
                setDoorsOpen((v) => !v);
              }}
            />
          ) : null}

          {/* === LED groove under the unit (subtle glow) === */}
          {hasLed ? <LedStrip width={w} depth={d} color={ledColor} /> : null}
        </>
      )}

      {/* Selection outline */}
      {selected ? (
        <mesh>
          <boxGeometry args={[w + 0.01, h + 0.01, d + 0.01]} />
          <meshBasicMaterial color="#a78bfa" wireframe transparent opacity={0.6} />
        </mesh>
      ) : null}

      {/* Label — shown ONLY when this unit is selected, to keep the scene clean. */}
      {selected ? (
        <Html
          position={[0, h / 2 + 0.05, 0]}
          center
          style={{
            pointerEvents: "none",
            color: "#fff",
            fontSize: "10px",
            background: "rgba(0,0,0,0.7)",
            padding: "2px 6px",
            borderRadius: "4px",
            whiteSpace: "nowrap",
            backdropFilter: "blur(4px)",
          }}
        >
          {unit.templateName}
        </Html>
      ) : null}
    </group>
    {selected && groupNode && onTransform ? (
      <TransformControls
        object={groupNode}
        mode="translate"
        showY={true}
        size={0.6}
        onObjectChange={() => {
          const p = groupNode.position;
          // Clamp Y to keep the unit from sinking below the floor.
          if (p.y < h / 2) {
            p.y = h / 2;
            groupNode.position.set(p.x, p.y, p.z);
          }
          const newX = Math.round((p.x - w / 2) / MM);
          const newY = Math.round((p.z - d / 2) / MM);
          const newBaseH = Math.round((p.y - h / 2) / MM);
          onTransform({ x: newX, y: newY, baseHeight: newBaseH });
        }}
      />
    ) : null}
    </>
  );
}

// ============================================================
// Sub-components
// ============================================================

// Edge radius for rounded cabinet panels — 4 mm reads as a "softly broken"
// machined edge, which is what real factory-finished cabinets look like.
const BODY_EDGE_RADIUS = 0.004;
const DOOR_EDGE_RADIUS = 0.004;
const DRAWER_EDGE_RADIUS = 0.001; // 1 mm bevel — subtle
const EDGE_SMOOTHNESS = 2;

function CabinetBody({
  width,
  height,
  depth,
  material,
  panel,
}: {
  width: number;
  height: number;
  depth: number;
  material: THREE.Material;
  panel: number;
}) {
  // The back panel is structural, not visible from the front — keep it flat &
  // a touch rougher so it doesn't pull HDRI reflections oddly.
  const backMaterial = React.useMemo(() => {
    const m = (material as THREE.MeshPhysicalMaterial).clone();
    m.roughness = Math.min(1, ((material as THREE.MeshPhysicalMaterial).roughness ?? 0.5) + 0.2);
    m.clearcoat = 0;
    return m;
  }, [material]);

  return (
    <group>
      {/* Left side */}
      <mesh
        position={[-width / 2 + panel / 2, 0, 0]}
        geometry={getRoundedGeo(panel, height, depth, BODY_EDGE_RADIUS, EDGE_SMOOTHNESS)}
        material={material}
      />
      {/* Right side */}
      <mesh
        position={[width / 2 - panel / 2, 0, 0]}
        geometry={getRoundedGeo(panel, height, depth, BODY_EDGE_RADIUS, EDGE_SMOOTHNESS)}
        material={material}
      />
      {/* Top */}
      <mesh
        position={[0, height / 2 - panel / 2, 0]}
        geometry={getRoundedGeo(width - 2 * panel, panel, depth, BODY_EDGE_RADIUS, EDGE_SMOOTHNESS)}
        material={material}
      />
      {/* Bottom */}
      <mesh
        position={[0, -height / 2 + panel / 2, 0]}
        geometry={getRoundedGeo(width - 2 * panel, panel, depth, BODY_EDGE_RADIUS, EDGE_SMOOTHNESS)}
        material={material}
      />
      {/* Back */}
      <mesh
        position={[0, 0, -depth / 2 + panel / 4]}
        geometry={getRoundedGeo(
          width - 2 * panel,
          height - 2 * panel,
          panel / 2,
          BODY_EDGE_RADIUS,
          EDGE_SMOOTHNESS,
        )}
        material={backMaterial}
      />
    </group>
  );
}

function DoorPair({
  width,
  height,
  depth,
  doors,
  material,
  panel,
  isGlass,
  glassTint,
  angle,
  onTogglePointerDown,
}: {
  width: number;
  height: number;
  depth: number;
  doors: number;
  material: THREE.Material;
  panel: number;
  isGlass: boolean;
  glassTint?: string;
  angle: number;
  onTogglePointerDown: (e: ThreeEvent<MouseEvent>) => void;
}) {
  const doorWidth = (width - 2 * panel - 0.004) / doors;
  const doorHeight = height - 2 * panel - 0.004;
  const doorThickness = panel * 0.9;
  const frontZ = depth / 2 + panel / 4;

  const tintHex = glassTint ? GLASS_TINT_COLORS[glassTint] ?? "#c8e0ff" : null;

  // Glass override — built once per tint.
  const glassMaterial = React.useMemo<THREE.MeshPhysicalMaterial | null>(() => {
    if (!isGlass || !tintHex) return null;
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(tintHex),
      transparent: true,
      opacity: 0.45,
      roughness: 0.08,
      metalness: 0.0,
      transmission: 0.85,
      thickness: 0.5,
      clearcoat: 0.5,
      clearcoatRoughness: 0.05,
      envMapIntensity: 1.4,
    });
  }, [isGlass, tintHex]);

  const doorMaterial = glassMaterial ?? material;
  const doorGeo = getRoundedGeo(doorWidth, doorHeight, doorThickness, DOOR_EDGE_RADIUS, EDGE_SMOOTHNESS);

  return (
    <>
      {Array.from({ length: doors }).map((_, i) => {
        // Hinge: left door swings left (-angle), right door swings right (+angle)
        const isLeft = i === 0;
        const hingeX = isLeft
          ? -width / 2 + panel + 0.002
          : width / 2 - panel - 0.002 - doorWidth;
        const swingAngle = isLeft ? -angle : angle;
        const pivotX = isLeft ? -doorWidth / 2 : doorWidth / 2;

        return (
          <group
            key={i}
            position={[hingeX + (isLeft ? doorWidth / 2 : doorWidth / 2), 0, frontZ]}
            onPointerDown={onTogglePointerDown}
          >
            <group rotation={[0, swingAngle, 0]} position={[pivotX, 0, 0]}>
              <mesh
                position={[-pivotX, 0, 0]}
                geometry={doorGeo}
                material={doorMaterial}
              />
              {/* Handle — chrome */}
              <ChromeHandle
                position={[
                  -pivotX + (isLeft ? doorWidth / 2 - 0.03 : -doorWidth / 2 + 0.03),
                  0,
                  doorThickness / 2 + 0.005,
                ]}
                size={[0.012, 0.08, 0.012]}
              />
            </group>
          </group>
        );
      })}
    </>
  );
}

function DrawerStack({
  width,
  height,
  depth,
  count,
  material,
  panel,
  slide,
  onTogglePointerDown,
}: {
  width: number;
  height: number;
  depth: number;
  count: number;
  material: THREE.Material;
  panel: number;
  slide: number;
  onTogglePointerDown: (e: ThreeEvent<MouseEvent>) => void;
}) {
  const drawerHeight = (height - 2 * panel - 0.004 - (count - 1) * 0.002) / count;
  const drawerWidth = width - 2 * panel - 0.004;
  const frontZ = depth / 2 + panel / 4;
  // Slide forward up to ~80% of the cabinet depth when fully open.
  const maxSlide = depth * 0.8;

  // Drawer box body — rough painted MDF look.
  const boxMaterial = React.useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: 0x3a2a1a,
        roughness: 0.85,
        metalness: 0.0,
        clearcoat: 0.05,
        envMapIntensity: 0.8,
      }),
    [],
  );

  const drawerGeo = getRoundedGeo(drawerWidth, drawerHeight, panel * 0.9, DRAWER_EDGE_RADIUS, EDGE_SMOOTHNESS);

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const y = height / 2 - panel - drawerHeight / 2 - i * (drawerHeight + 0.002);
        return (
          <group
            key={i}
            position={[0, y, frontZ + slide * maxSlide]}
            onPointerDown={onTogglePointerDown}
          >
            <mesh geometry={drawerGeo} material={material} />
            {/* Drawer body — visible when slid out */}
            {slide > 0.05 ? (
              <mesh position={[0, 0, -depth * 0.4]}>
                <boxGeometry
                  args={[drawerWidth * 0.95, drawerHeight * 0.85, depth * 0.78]}
                />
                <primitive object={boxMaterial} attach="material" />
              </mesh>
            ) : null}
            {/* Drawer handle — chrome bar */}
            <ChromeHandle
              position={[0, 0, panel * 0.45 + 0.005]}
              size={[drawerWidth * 0.4, 0.012, 0.012]}
            />
          </group>
        );
      })}
    </>
  );
}

/** Chrome handle — shared PBR material across all instances for batching. */
const chromeMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xcfcfcf,
  metalness: 0.95,
  roughness: 0.18,
  clearcoat: 0.3,
  clearcoatRoughness: 0.1,
  envMapIntensity: 1.5,
});

function ChromeHandle({
  position,
  size,
}: {
  position: [number, number, number];
  size: [number, number, number];
}) {
  const geo = getRoundedGeo(size[0], size[1], size[2], Math.min(size[1], size[2]) * 0.45, 2);
  return <mesh position={position} geometry={geo} material={chromeMaterial} />;
}

function LedStrip({ width, depth, color }: { width: number; depth: number; color: string }) {
  return (
    <group position={[0, -depth * 0 - 0.05, 0]}>
      {/* Visible strip mesh */}
      <mesh position={[0, -0.01, depth / 2 - 0.02]}>
        <boxGeometry args={[width - 0.04, 0.006, 0.008]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.2}
          toneMapped={false}
        />
      </mesh>
      {/* Soft light spilling forward */}
      <pointLight
        position={[0, -0.01, depth / 2 + 0.1]}
        intensity={0.4}
        color={color}
        distance={0.8}
        decay={2}
      />
    </group>
  );
}

function ApplianceBox({
  width,
  height,
  depth,
  type,
  selected,
}: {
  width: number;
  height: number;
  depth: number;
  type?: string;
  selected?: boolean;
}) {
  const isFridgeSbs = type === "fridge-sbs";
  const isFridge = type === "fridge" || isFridgeSbs;
  const isDishwasher = type === "dishwasher";
  const isOven = type === "oven";
  const isMicrowave = type === "microwave";
  const isHood = type === "hood";
  const isHob = type === "cooktop" || type === "hob";

  const bodyMaterial = React.useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color: selected ? 0xa78bfa : isHob ? 0x0a0a0a : 0xd4d4d4,
      metalness: 0.85,
      roughness: 0.22,
      clearcoat: 0.3,
      clearcoatRoughness: 0.18,
      envMapIntensity: 1.4,
    });
    if ("anisotropy" in m) {
      (m as THREE.MeshPhysicalMaterial).anisotropy = 0.4;
      (m as THREE.MeshPhysicalMaterial).anisotropyRotation = 0;
    }
    return m;
  }, [selected, isHob]);

  const blackGlass = React.useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: 0x0a0a14,
        roughness: 0.05,
        metalness: 0.4,
        clearcoat: 0.9,
        clearcoatRoughness: 0.04,
        envMapIntensity: 1.8,
      }),
    [],
  );

  const indicatorMaterial = React.useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x4fc3f7,
        emissive: 0x4fc3f7,
        emissiveIntensity: 1.8,
        toneMapped: false,
      }),
    [],
  );

  // Specialised renderers for the common appliances.
  if (isDishwasher) {
    return (
      <Dishwasher
        width={width}
        height={height}
        depth={depth}
        bodyMaterial={bodyMaterial}
        panelMaterial={blackGlass}
        indicatorMaterial={indicatorMaterial}
      />
    );
  }

  if (isOven) {
    return (
      <Oven
        width={width}
        height={height}
        depth={depth}
        bodyMaterial={bodyMaterial}
        glassMaterial={blackGlass}
        indicatorMaterial={indicatorMaterial}
      />
    );
  }

  if (isMicrowave) {
    return (
      <Microwave
        width={width}
        height={height}
        depth={depth}
        bodyMaterial={bodyMaterial}
        glassMaterial={blackGlass}
      />
    );
  }

  if (isHood) {
    return (
      <Hood
        width={width}
        height={height}
        depth={depth}
        bodyMaterial={bodyMaterial}
      />
    );
  }

  if (isHob) {
    return (
      <Hob
        width={width}
        height={height}
        depth={depth}
        bodyMaterial={bodyMaterial}
        glassMaterial={blackGlass}
      />
    );
  }

  if (isFridge) {
    return (
      <Fridge
        width={width}
        height={height}
        depth={depth}
        sideBySide={isFridgeSbs}
        bodyMaterial={bodyMaterial}
        indicatorMaterial={indicatorMaterial}
      />
    );
  }

  // Generic fallback box.
  return (
    <group>
      <mesh
        geometry={getRoundedGeo(
          width,
          height,
          depth,
          BODY_EDGE_RADIUS,
          EDGE_SMOOTHNESS,
        )}
      >
        <primitive object={bodyMaterial} attach="material" />
        <Edges color={selected ? "#fff" : "#666"} />
      </mesh>
    </group>
  );
}

function Dishwasher({
  width,
  height,
  depth,
  bodyMaterial,
  panelMaterial,
  indicatorMaterial,
}: {
  width: number;
  height: number;
  depth: number;
  bodyMaterial: THREE.Material;
  panelMaterial: THREE.Material;
  indicatorMaterial: THREE.Material;
}) {
  const frontZ = depth / 2;
  const controlH = 0.06;
  return (
    <group>
      {/* Body */}
      <mesh
        geometry={getRoundedGeo(width, height, depth, BODY_EDGE_RADIUS, EDGE_SMOOTHNESS)}
      >
        <primitive object={bodyMaterial} attach="material" />
      </mesh>
      {/* Front door panel — slightly recessed brushed steel */}
      <mesh position={[0, -controlH / 2, frontZ + 0.001]}>
        <boxGeometry args={[width * 0.95, height - controlH * 1.5, 0.002]} />
        <primitive object={bodyMaterial} attach="material" />
      </mesh>
      {/* Top control panel — black glass strip */}
      <mesh position={[0, height / 2 - controlH / 2, frontZ + 0.002]}>
        <boxGeometry args={[width * 0.95, controlH, 0.002]} />
        <primitive object={panelMaterial} attach="material" />
      </mesh>
      {/* Indicator LEDs */}
      <mesh position={[width * 0.3, height / 2 - controlH / 2, frontZ + 0.004]}>
        <boxGeometry args={[0.006, 0.006, 0.001]} />
        <primitive object={indicatorMaterial} attach="material" />
      </mesh>
      <mesh position={[width * 0.32, height / 2 - controlH / 2, frontZ + 0.004]}>
        <boxGeometry args={[0.006, 0.006, 0.001]} />
        <primitive object={indicatorMaterial} attach="material" />
      </mesh>
      {/* Handle — long horizontal pull near the top */}
      <ChromeHandle
        position={[0, height / 2 - controlH - 0.04, frontZ + 0.015]}
        size={[width * 0.7, 0.022, 0.022]}
      />
      {/* Brand badge spot */}
      <mesh position={[0, -height * 0.05, frontZ + 0.004]}>
        <boxGeometry args={[width * 0.18, 0.012, 0.001]} />
        <meshStandardMaterial color="#888" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Oven({
  width,
  height,
  depth,
  bodyMaterial,
  glassMaterial,
  indicatorMaterial,
}: {
  width: number;
  height: number;
  depth: number;
  bodyMaterial: THREE.Material;
  glassMaterial: THREE.Material;
  indicatorMaterial: THREE.Material;
}) {
  const frontZ = depth / 2;
  const controlH = 0.09;
  const doorH = height - controlH - 0.02;
  return (
    <group>
      <mesh
        geometry={getRoundedGeo(width, height, depth, BODY_EDGE_RADIUS, EDGE_SMOOTHNESS)}
      >
        <primitive object={bodyMaterial} attach="material" />
      </mesh>
      {/* Top control band */}
      <mesh position={[0, height / 2 - controlH / 2, frontZ + 0.001]}>
        <boxGeometry args={[width * 0.95, controlH, 0.003]} />
        <primitive object={bodyMaterial} attach="material" />
      </mesh>
      {/* Display panel */}
      <mesh position={[0, height / 2 - controlH / 2, frontZ + 0.005]}>
        <boxGeometry args={[width * 0.35, controlH * 0.5, 0.001]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      {/* Display LED */}
      <mesh position={[0, height / 2 - controlH / 2, frontZ + 0.007]}>
        <boxGeometry args={[width * 0.18, 0.012, 0.001]} />
        <primitive object={indicatorMaterial} attach="material" />
      </mesh>
      {/* Knobs */}
      {[-0.32, -0.18, 0.18, 0.32].map((kx, i) => (
        <mesh
          key={i}
          position={[width * kx, height / 2 - controlH / 2, frontZ + 0.012]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.012, 0.014, 0.012, 24]} />
          <meshStandardMaterial color="#222" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      {/* Door — black glass */}
      <mesh position={[0, -controlH / 2, frontZ + 0.003]}>
        <boxGeometry args={[width * 0.92, doorH, 0.005]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      {/* Door bezel */}
      <mesh position={[0, -controlH / 2, frontZ + 0.005]}>
        <boxGeometry args={[width * 0.94, doorH + 0.01, 0.001]} />
        <primitive object={bodyMaterial} attach="material" />
      </mesh>
      {/* Handle */}
      <ChromeHandle
        position={[0, -controlH / 2 + doorH / 2 - 0.04, frontZ + 0.02]}
        size={[width * 0.85, 0.022, 0.025]}
      />
    </group>
  );
}

function Microwave({
  width,
  height,
  depth,
  bodyMaterial,
  glassMaterial,
}: {
  width: number;
  height: number;
  depth: number;
  bodyMaterial: THREE.Material;
  glassMaterial: THREE.Material;
}) {
  const frontZ = depth / 2;
  const ctrlW = width * 0.28;
  const doorW = width - ctrlW - 0.02;
  return (
    <group>
      <mesh
        geometry={getRoundedGeo(width, height, depth, BODY_EDGE_RADIUS, EDGE_SMOOTHNESS)}
      >
        <primitive object={bodyMaterial} attach="material" />
      </mesh>
      {/* Door window on left half */}
      <mesh position={[-width / 2 + doorW / 2 + 0.005, 0, frontZ + 0.002]}>
        <boxGeometry args={[doorW - 0.04, height * 0.7, 0.002]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      {/* Control panel on right side */}
      <mesh position={[width / 2 - ctrlW / 2 - 0.005, 0, frontZ + 0.002]}>
        <boxGeometry args={[ctrlW - 0.01, height * 0.85, 0.002]} />
        <primitive object={bodyMaterial} attach="material" />
      </mesh>
      {/* Buttons grid */}
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => (
          <mesh
            key={`${row}-${col}`}
            position={[
              width / 2 - ctrlW + 0.012 + col * 0.018,
              -height * 0.15 + row * 0.025,
              frontZ + 0.004,
            ]}
          >
            <boxGeometry args={[0.012, 0.012, 0.001]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        )),
      )}
      {/* Handle on the door */}
      <ChromeHandle
        position={[
          -width / 2 + doorW - 0.015,
          0,
          frontZ + 0.012,
        ]}
        size={[0.015, height * 0.6, 0.018]}
      />
    </group>
  );
}

function Hood({
  width,
  height,
  depth,
  bodyMaterial,
}: {
  width: number;
  height: number;
  depth: number;
  bodyMaterial: THREE.Material;
}) {
  // Hood = chimney style: a tapered box.
  const baseH = height * 0.4;
  const chimneyH = height - baseH;
  return (
    <group>
      {/* Lower extraction box */}
      <mesh position={[0, -height / 2 + baseH / 2, 0]}>
        <boxGeometry args={[width, baseH, depth * 0.7]} />
        <primitive object={bodyMaterial} attach="material" />
      </mesh>
      {/* Chimney — narrower */}
      <mesh position={[0, -height / 2 + baseH + chimneyH / 2, 0]}>
        <boxGeometry args={[width * 0.35, chimneyH, depth * 0.35]} />
        <primitive object={bodyMaterial} attach="material" />
      </mesh>
      {/* Bottom filter grille */}
      <mesh position={[0, -height / 2 + 0.002, 0]}>
        <boxGeometry args={[width * 0.9, 0.002, depth * 0.6]} />
        <meshStandardMaterial color="#1a1a1e" metalness={0.5} roughness={0.6} />
      </mesh>
      {/* Control bar */}
      <mesh position={[0, -height / 2 + baseH * 0.3, depth / 2 * 0.35 + 0.002]}>
        <boxGeometry args={[width * 0.45, 0.012, 0.001]} />
        <meshStandardMaterial color="#0a0a14" metalness={0.4} roughness={0.2} />
      </mesh>
    </group>
  );
}

function Hob({
  width,
  height,
  depth,
  bodyMaterial,
  glassMaterial,
}: {
  width: number;
  height: number;
  depth: number;
  bodyMaterial: THREE.Material;
  glassMaterial: THREE.Material;
}) {
  return (
    <group>
      {/* Body — slim plate */}
      <mesh>
        <boxGeometry args={[width, height, depth]} />
        <primitive object={bodyMaterial} attach="material" />
      </mesh>
      {/* Glass top */}
      <mesh position={[0, height / 2 + 0.001, 0]}>
        <boxGeometry args={[width * 0.98, 0.004, depth * 0.95]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>
      {/* 4 burners — circles */}
      {[
        [-width * 0.25, depth * 0.2],
        [width * 0.25, depth * 0.2],
        [-width * 0.25, -depth * 0.2],
        [width * 0.25, -depth * 0.2],
      ].map(([bx, bz], i) => (
        <mesh
          key={i}
          position={[bx, height / 2 + 0.003, bz]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[Math.min(width, depth) * 0.07, Math.min(width, depth) * 0.10, 32]} />
          <meshStandardMaterial color="#222" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function Fridge({
  width,
  height,
  depth,
  sideBySide,
  bodyMaterial,
  indicatorMaterial,
}: {
  width: number;
  height: number;
  depth: number;
  sideBySide: boolean;
  bodyMaterial: THREE.Material;
  indicatorMaterial: THREE.Material;
}) {
  const frontZ = depth / 2;

  if (sideBySide) {
    // Two full-height doors
    const halfW = width / 2;
    return (
      <group>
        <mesh
          geometry={getRoundedGeo(width, height, depth, BODY_EDGE_RADIUS, EDGE_SMOOTHNESS)}
        >
          <primitive object={bodyMaterial} attach="material" />
        </mesh>
        {/* Left door */}
        <mesh position={[-halfW / 2, 0, frontZ + 0.001]}>
          <boxGeometry args={[halfW - 0.01, height - 0.02, 0.002]} />
          <primitive object={bodyMaterial} attach="material" />
        </mesh>
        {/* Right door */}
        <mesh position={[halfW / 2, 0, frontZ + 0.001]}>
          <boxGeometry args={[halfW - 0.01, height - 0.02, 0.002]} />
          <primitive object={bodyMaterial} attach="material" />
        </mesh>
        {/* Door handles — long vertical */}
        <ChromeHandle
          position={[-halfW / 4, 0, frontZ + 0.012]}
          size={[0.02, height * 0.65, 0.022]}
        />
        <ChromeHandle
          position={[halfW / 4, 0, frontZ + 0.012]}
          size={[0.02, height * 0.65, 0.022]}
        />
        {/* Display panel on left door (water/ice) */}
        <mesh position={[-halfW / 2, height * 0.22, frontZ + 0.004]}>
          <boxGeometry args={[halfW * 0.6, height * 0.18, 0.001]} />
          <meshPhysicalMaterial
            color={0x0a0a14}
            roughness={0.05}
            metalness={0.4}
          />
        </mesh>
        <mesh position={[-halfW / 2, height * 0.22, frontZ + 0.006]}>
          <boxGeometry args={[halfW * 0.3, 0.014, 0.001]} />
          <primitive object={indicatorMaterial} attach="material" />
        </mesh>
      </group>
    );
  }

  // Standard fridge with freezer on bottom
  const freezerH = height * 0.32;
  const fridgeH = height - freezerH - 0.01;
  return (
    <group>
      <mesh
        geometry={getRoundedGeo(width, height, depth, BODY_EDGE_RADIUS, EDGE_SMOOTHNESS)}
      >
        <primitive object={bodyMaterial} attach="material" />
      </mesh>
      {/* Upper fridge door */}
      <mesh position={[0, freezerH / 2, frontZ + 0.001]}>
        <boxGeometry args={[width - 0.02, fridgeH, 0.002]} />
        <primitive object={bodyMaterial} attach="material" />
      </mesh>
      {/* Lower freezer drawer */}
      <mesh position={[0, -height / 2 + freezerH / 2 + 0.002, frontZ + 0.001]}>
        <boxGeometry args={[width - 0.02, freezerH - 0.005, 0.002]} />
        <primitive object={bodyMaterial} attach="material" />
      </mesh>
      {/* Fridge handle */}
      <ChromeHandle
        position={[0, freezerH / 2 + fridgeH * 0.2, frontZ + 0.012]}
        size={[width * 0.65, 0.022, 0.022]}
      />
      {/* Freezer handle */}
      <ChromeHandle
        position={[0, -height / 2 + freezerH * 0.6, frontZ + 0.012]}
        size={[width * 0.65, 0.022, 0.022]}
      />
      {/* Divider line */}
      <mesh position={[0, freezerH / 2 - fridgeH / 2 - 0.005, frontZ + 0.003]}>
        <boxGeometry args={[width - 0.01, 0.003, 0.001]} />
        <meshStandardMaterial color="#1a1a1e" />
      </mesh>
    </group>
  );
}

// ============================================================
// Animation hooks
// ============================================================
function useDoorAnimation(open: boolean) {
  const target = React.useRef(0);
  const [angle, setAngle] = React.useState(0);

  React.useEffect(() => {
    target.current = open ? Math.PI / 2.2 : 0;
  }, [open]);

  useFrame((_, delta) => {
    setAngle((cur) => {
      const diff = target.current - cur;
      if (Math.abs(diff) < 0.001) return target.current;
      return cur + diff * Math.min(delta * 6, 1);
    });
  });

  return angle;
}

/** Drawer slide animation — returns a 0..1 progress that the drawer multiplies
 *  against its max slide distance. Smooth ease toward the target. */
function useDrawerAnimation(open: boolean) {
  const target = React.useRef(0);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    target.current = open ? 1 : 0;
  }, [open]);

  useFrame((_, delta) => {
    setProgress((cur) => {
      const diff = target.current - cur;
      if (Math.abs(diff) < 0.002) return target.current;
      return cur + diff * Math.min(delta * 6, 1);
    });
  });

  return progress;
}

// ============================================================
// GLB model renderer
// ============================================================
/**
 * Renders an imported GLB asset auto-scaled to (width × height × depth) in
 * meters. The model's bounding box is measured once on first load, then we
 * apply per-axis scale factors so the asset always fits the unit's slot.
 *
 * We deliberately CLONE the GLB scene so each unit instance has its own
 * transform graph — drei's `useGLTF` caches the parsed asset, so multiple
 * units referencing the same URL share GPU memory but get independent
 * transforms.
 */
function GLBUnit({
  url,
  width,
  height,
  depth,
}: {
  url: string;
  width: number;
  height: number;
  depth: number;
}) {
  const gltf = useGLTF(url);
  // Clone so concurrent units can hold the same parsed asset without
  // stepping on each other's transforms.
  const scene = React.useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  // Measure the cloned scene's bounding box and compute the scale that
  // makes it fit exactly inside (width × height × depth). We also recenter
  // the model so it sits on the floor with its base aligned to y=0 in
  // local space.
  const { scale, offset } = React.useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    // Avoid division by zero on degenerate axes.
    const sx = size.x > 1e-6 ? width / size.x : 1;
    const sy = size.y > 1e-6 ? height / size.y : 1;
    const sz = size.z > 1e-6 ? depth / size.z : 1;

    // Offset to recenter horizontally + sit bottom on Y=0. The wrapping
    // <group> already places (0,0,0) at the unit centre, so we translate
    // by -center.x/-center.z to centre, and by (size.y/2 - center.y) so
    // the bottom of the bbox lands on y=0 in local space.
    return {
      scale: [sx, sy, sz] as [number, number, number],
      offset: [-center.x, size.y / 2 - center.y, -center.z] as [
        number,
        number,
        number,
      ],
    };
  }, [scene, width, height, depth]);

  // Castshadow + receiveshadow for every mesh so the model integrates with
  // the existing lighting rig.
  React.useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const m = child as THREE.Mesh;
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });
  }, [scene]);

  return (
    <group position={[0, -height / 2, 0]}>
      <group scale={scale} position={offset}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

/** Lightweight placeholder while the GLB is still streaming in. */
function LoadingProxy({
  width,
  height,
  depth,
}: {
  width: number;
  height: number;
  depth: number;
}) {
  return (
    <mesh>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color="#222831" transparent opacity={0.35} />
    </mesh>
  );
}
