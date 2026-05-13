"use client";

import * as React from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Edges, Html } from "@react-three/drei";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { DesignerUnit } from "@/components/designer/types";
import {
  buildFallbackMaterial,
  getPresetById,
  presetIdForUnit,
} from "@/lib/designer/materials";

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
  }, [unit.color, unit.category, selected]);
}

/**
 * Procedural 3D cabinet — built from primitive boxes, no GLB files needed.
 * Supports door open/close animation, LED groove glow, glass shelves.
 */
export function Unit3D({ unit, options, selected, onSelect }: Unit3DProps) {
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
  const py = h / 2; // bottom-anchored — sits on floor
  const pz = unit.y * MM;

  return (
    <group
      position={[px + w / 2, py, pz + d / 2]}
      rotation={[0, ((unit.rotation ?? 0) * Math.PI) / 180, 0]}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onSelect?.(unit.id);
      }}
    >
      {/* === APPLIANCE: render with metallic look + placeholder mesh === */}
      {isAppliance ? (
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
  const isFridge = type?.includes("fridge");
  const isOven = type === "oven" || type === "microwave";
  const isHob = type === "cooktop" || type === "hob";

  // Brushed-steel appliance body. Anisotropy is supported on
  // MeshPhysicalMaterial in three r158+ (we're on r184) and gives a much
  // more convincing brushed-metal highlight.
  const bodyMaterial = React.useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color: selected ? 0xa78bfa : isHob ? 0x0a0a0a : 0xd4d4d4,
      metalness: 0.85,
      roughness: 0.2,
      clearcoat: 0.3,
      clearcoatRoughness: 0.18,
      envMapIntensity: 1.4,
    });
    // Anisotropy reads as horizontal "grain" on stainless steel.
    if ("anisotropy" in m) {
      (m as THREE.MeshPhysicalMaterial).anisotropy = 0.4;
      (m as THREE.MeshPhysicalMaterial).anisotropyRotation = 0;
    }
    return m;
  }, [selected, isHob]);

  const ovenGlass = React.useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: 0x1a1a2e,
        transparent: true,
        opacity: 0.7,
        roughness: 0.05,
        metalness: 0.4,
        clearcoat: 0.8,
        clearcoatRoughness: 0.05,
        envMapIntensity: 1.5,
      }),
    [],
  );

  return (
    <group>
      <mesh geometry={getRoundedGeo(width, height, depth, BODY_EDGE_RADIUS, EDGE_SMOOTHNESS)}>
        <primitive object={bodyMaterial} attach="material" />
        <Edges color={selected ? "#fff" : "#666"} />
      </mesh>
      {/* Oven door window */}
      {isOven ? (
        <mesh position={[0, 0, depth / 2 + 0.005]}>
          <boxGeometry args={[width * 0.7, height * 0.55, 0.005]} />
          <primitive object={ovenGlass} attach="material" />
        </mesh>
      ) : null}
      {/* Fridge handle */}
      {isFridge ? (
        <ChromeHandle
          position={[width / 2 - 0.04, 0, depth / 2 + 0.01]}
          size={[0.02, height * 0.7, 0.02]}
        />
      ) : null}
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
