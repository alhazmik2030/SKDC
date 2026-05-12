"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import type { DesignerState, DesignerUnit } from "@/components/designer/types";
import { Unit3D } from "./unit-3d";

const MM = 0.001;

export interface Scene3DProps {
  design: DesignerState;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  ambientLightOn?: boolean;
}

export function Scene3D({
  design,
  selectedId,
  onSelect,
  ambientLightOn = true,
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
    >
      <SceneContents
        design={design}
        selectedId={selectedId}
        onSelect={onSelect}
        roomW={roomW}
        roomD={roomD}
        roomH={roomH}
        ambientLightOn={ambientLightOn}
      />
    </Canvas>
  );
}

function SceneContents({
  design,
  selectedId,
  onSelect,
  roomW,
  roomD,
  roomH,
  ambientLightOn,
}: {
  design: DesignerState;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  roomW: number;
  roomD: number;
  roomH: number;
  ambientLightOn: boolean;
}) {
  return (
    <>
      {/* === Lighting === */}
      {ambientLightOn ? <ambientLight intensity={0.5} /> : <ambientLight intensity={0.05} />}
      <directionalLight
        position={[roomW * 0.6, roomH * 1.5, roomD * 0.4]}
        intensity={ambientLightOn ? 1.5 : 0.3}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={20}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[roomW * 0.3, roomH * 0.85, roomD * 0.3]} intensity={0.6} color="#fff8e7" />

      {/* === Room walls (open back so we can see inside) === */}
      <RoomShell width={roomW} depth={roomD} height={roomH} />

      {/* === Floor grid === */}
      <Grid
        position={[roomW / 2, 0, roomD / 2]}
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

      {/* === Contact shadows under units === */}
      <ContactShadows
        position={[roomW / 2, 0.001, roomD / 2]}
        opacity={0.4}
        scale={Math.max(roomW, roomD) * 1.5}
        blur={2}
        far={1}
      />

      {/* === Units === */}
      {design.units.map((unit: DesignerUnit) => (
        <Unit3D
          key={unit.id}
          unit={unit}
          options={extractOptions(unit)}
          selected={unit.id === selectedId}
          onSelect={onSelect}
        />
      ))}

      {/* === Environment for nice reflections on appliances/glass === */}
      <Environment preset="warehouse" />

      {/* === Camera controls === */}
      <OrbitControls
        target={[roomW / 2, roomH / 4, roomD / 2]}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={1}
        maxDistance={20}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
}

function RoomShell({ width, depth, height }: { width: number; depth: number; height: number }) {
  const wallColor = "#f5f1ea";
  const floorColor = "#d4c8b8";
  const wallThickness = 0.05;
  return (
    <group>
      {/* Floor */}
      <mesh
        receiveShadow
        position={[width / 2, -wallThickness / 2, depth / 2]}
      >
        <boxGeometry args={[width, wallThickness, depth]} />
        <meshStandardMaterial color={floorColor} roughness={0.7} />
      </mesh>
      {/* Back wall */}
      <mesh
        receiveShadow
        position={[width / 2, height / 2, -wallThickness / 2]}
      >
        <boxGeometry args={[width, height, wallThickness]} />
        <meshStandardMaterial color={wallColor} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      {/* Left wall */}
      <mesh
        receiveShadow
        position={[-wallThickness / 2, height / 2, depth / 2]}
      >
        <boxGeometry args={[wallThickness, height, depth]} />
        <meshStandardMaterial color={wallColor} roughness={0.85} side={THREE.DoubleSide} />
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

  return {
    doors: doors > 0 ? doors : 2, // default to 2 doors
    drawers,
    hasGlass,
    glassTint: hasGlass ? "smoked" : undefined,
    led: hasLed ? { enabled: true, color: "#fff8e7" } : undefined,
  };
}
