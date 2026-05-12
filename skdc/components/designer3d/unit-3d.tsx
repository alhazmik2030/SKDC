"use client";

import * as React from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Edges, Html } from "@react-three/drei";
import * as THREE from "three";
import type { DesignerUnit } from "@/components/designer/types";

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

  const doors = options?.doors ?? 0;
  const drawers = options?.drawers ?? 0;
  const isAppliance = unit.category === "APPLIANCE";
  const isGlass = !!options?.hasGlass;
  const hasLed = !!options?.led?.enabled;
  const ledColor = options?.led?.color ?? "#a78bfa";

  const bodyColor = selected ? "#a78bfa" : unit.color || "#888";
  const facadeColor = selected ? "#c084fc" : darken(unit.color || "#cdcdcd", 0.1);

  // World position: from mm (room coords, top-down) to scene coords (Y up).
  // unit.x = X in room, unit.y = Z in scene, unit z stacks vertically (placeholder).
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
          <CabinetBody width={w} height={h} depth={d} color={bodyColor} panel={panel} />

          {/* === Drawers (front faces stacked) === */}
          {drawers > 0 ? (
            <DrawerStack
              width={w}
              height={h}
              depth={d}
              count={drawers}
              color={facadeColor}
              panel={panel}
            />
          ) : null}

          {/* === Doors (only when no drawers above OR doors specified) === */}
          {doors > 0 && drawers === 0 ? (
            <DoorPair
              width={w}
              height={h}
              depth={d}
              doors={doors}
              color={facadeColor}
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

      {/* Label on top (HTML overlay) */}
      <Html
        position={[0, h / 2 + 0.05, 0]}
        center
        style={{
          pointerEvents: "none",
          color: selected ? "#fff" : "rgba(255,255,255,0.6)",
          fontSize: "10px",
          background: "rgba(0,0,0,0.5)",
          padding: "2px 6px",
          borderRadius: "4px",
          whiteSpace: "nowrap",
        }}
      >
        {unit.templateName}
      </Html>
    </group>
  );
}

// ============================================================
// Sub-components
// ============================================================

function CabinetBody({
  width,
  height,
  depth,
  color,
  panel,
}: {
  width: number;
  height: number;
  depth: number;
  color: string;
  panel: number;
}) {
  return (
    <group>
      {/* Left side */}
      <mesh position={[-width / 2 + panel / 2, 0, 0]}>
        <boxGeometry args={[panel, height, depth]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Right side */}
      <mesh position={[width / 2 - panel / 2, 0, 0]}>
        <boxGeometry args={[panel, height, depth]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Top */}
      <mesh position={[0, height / 2 - panel / 2, 0]}>
        <boxGeometry args={[width - 2 * panel, panel, depth]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, -height / 2 + panel / 2, 0]}>
        <boxGeometry args={[width - 2 * panel, panel, depth]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Back */}
      <mesh position={[0, 0, -depth / 2 + panel / 4]}>
        <boxGeometry args={[width - 2 * panel, height - 2 * panel, panel / 2]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
    </group>
  );
}

function DoorPair({
  width,
  height,
  depth,
  doors,
  color,
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
  color: string;
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
              <mesh position={[-pivotX, 0, 0]}>
                <boxGeometry args={[doorWidth, doorHeight, doorThickness]} />
                {isGlass && tintHex ? (
                  <meshPhysicalMaterial
                    color={tintHex}
                    transparent
                    opacity={0.45}
                    roughness={0.1}
                    transmission={0.85}
                    thickness={0.5}
                  />
                ) : (
                  <meshStandardMaterial
                    color={color}
                    roughness={0.4}
                    metalness={0.05}
                  />
                )}
              </mesh>
              {/* Handle */}
              <mesh
                position={[
                  -pivotX + (isLeft ? doorWidth / 2 - 0.03 : -doorWidth / 2 + 0.03),
                  0,
                  doorThickness / 2 + 0.005,
                ]}
              >
                <boxGeometry args={[0.012, 0.08, 0.012]} />
                <meshStandardMaterial color="#888" metalness={0.9} roughness={0.2} />
              </mesh>
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
  color,
  panel,
}: {
  width: number;
  height: number;
  depth: number;
  count: number;
  color: string;
  panel: number;
}) {
  const drawerHeight = (height - 2 * panel - 0.004 - (count - 1) * 0.002) / count;
  const drawerWidth = width - 2 * panel - 0.004;
  const frontZ = depth / 2 + panel / 4;

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const y = height / 2 - panel - drawerHeight / 2 - i * (drawerHeight + 0.002);
        return (
          <group key={i} position={[0, y, frontZ]}>
            <mesh>
              <boxGeometry args={[drawerWidth, drawerHeight, panel * 0.9]} />
              <meshStandardMaterial color={color} roughness={0.4} />
            </mesh>
            {/* Drawer handle */}
            <mesh position={[0, 0, panel * 0.45 + 0.005]}>
              <boxGeometry args={[drawerWidth * 0.4, 0.012, 0.012]} />
              <meshStandardMaterial color="#888" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        );
      })}
    </>
  );
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

  return (
    <group>
      <mesh>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={selected ? "#a78bfa" : isHob ? "#0a0a0a" : "#d4d4d4"}
          metalness={0.85}
          roughness={0.2}
        />
        <Edges color={selected ? "#fff" : "#666"} />
      </mesh>
      {/* Oven door window */}
      {isOven ? (
        <mesh position={[0, 0, depth / 2 + 0.005]}>
          <boxGeometry args={[width * 0.7, height * 0.55, 0.005]} />
          <meshPhysicalMaterial
            color="#1a1a2e"
            transparent
            opacity={0.7}
            roughness={0.05}
            metalness={0.4}
          />
        </mesh>
      ) : null}
      {/* Fridge handle */}
      {isFridge ? (
        <mesh position={[width / 2 - 0.04, 0, depth / 2 + 0.01]}>
          <boxGeometry args={[0.02, height * 0.7, 0.02]} />
          <meshStandardMaterial color="#999" metalness={0.95} roughness={0.1} />
        </mesh>
      ) : null}
    </group>
  );
}

// ============================================================
// Animation hook — smoothly opens/closes doors
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

function darken(hex: string, amount: number): string {
  const c = new THREE.Color(hex);
  c.multiplyScalar(1 - amount);
  return `#${c.getHexString()}`;
}
