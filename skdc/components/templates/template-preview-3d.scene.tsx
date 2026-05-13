"use client";

import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls, RoundedBox } from "@react-three/drei";
import type { Group } from "three";
import type { TemplateCategory } from "@prisma/client";
import { CATEGORY_PALETTE } from "./template-preview-3d";

interface TemplateSceneProps {
  category: TemplateCategory;
  width: number;
  height: number;
  depth: number;
  paused: boolean;
  interactive: boolean;
}

/** Map raw mm dimensions to a normalized [w, h, d] tuple whose largest side ≈ 1. */
function normalizeDimensions(w: number, h: number, d: number): [number, number, number] {
  const max = Math.max(w, h, d, 1);
  return [w / max, h / max, d / max];
}

function CabinetBody({
  category,
  size,
  paused,
}: {
  category: TemplateCategory;
  size: [number, number, number];
  paused: boolean;
}): React.ReactElement {
  const group = React.useRef<Group>(null);
  const style = CATEGORY_PALETTE[category];
  const [w, h, d] = size;
  const frontZ = d / 2 + 0.001;

  useFrame((_, delta) => {
    if (!paused && group.current) {
      group.current.rotation.y += delta * 0.4;
    }
  });

  // Front decoration depending on category
  const front = React.useMemo(() => {
    if (category === "DRAWER") {
      // 3 horizontal drawer divisions
      const divisions = 3;
      const gap = h / divisions;
      return Array.from({ length: divisions - 1 }, (_, i) => (
        <mesh key={`drw-${i}`} position={[0, h / 2 - gap * (i + 1), frontZ]}>
          <boxGeometry args={[w * 0.92, 0.008, 0.004]} />
          <meshStandardMaterial color="#2b2f36" metalness={0.6} roughness={0.4} />
        </mesh>
      ));
    }
    if (category === "APPLIANCE") {
      // Thin horizontal slot (oven-style) on the front face
      return (
        <mesh position={[0, h * 0.15, frontZ]}>
          <boxGeometry args={[w * 0.82, 0.05, 0.006]} />
          <meshStandardMaterial color="#0b0c10" metalness={0.4} roughness={0.6} />
        </mesh>
      );
    }
    // Default: subtle vertical split line implying a door pair
    return (
      <mesh position={[0, 0, frontZ]}>
        <boxGeometry args={[0.006, h * 0.94, 0.004]} />
        <meshStandardMaterial color="#1f1f23" metalness={0.3} roughness={0.6} />
      </mesh>
    );
  }, [category, w, h, frontZ]);

  return (
    <group ref={group}>
      <RoundedBox args={[w, h, d]} radius={0.02} smoothness={4} castShadow receiveShadow>
        {category === "APPLIANCE" ? (
          <meshPhysicalMaterial
            color={style.color}
            metalness={style.metalness}
            roughness={style.roughness}
            clearcoat={0.6}
            clearcoatRoughness={0.2}
          />
        ) : (
          <meshStandardMaterial
            color={style.color}
            metalness={style.metalness}
            roughness={style.roughness}
          />
        )}
      </RoundedBox>
      {front}
      {/* Handle hint for non-drawer/appliance: a small knob on the front */}
      {category !== "DRAWER" && category !== "APPLIANCE" ? (
        <mesh position={[w * 0.32, -h * 0.05, frontZ + 0.01]}>
          <sphereGeometry args={[0.015, 16, 16]} />
          <meshStandardMaterial color="#e5e7eb" metalness={0.8} roughness={0.25} />
        </mesh>
      ) : null}
    </group>
  );
}

export function TemplateScene(props: TemplateSceneProps): React.ReactElement {
  const { category, width, height, depth, paused, interactive } = props;
  const size = React.useMemo(
    () => normalizeDimensions(width, height, depth),
    [width, height, depth],
  );

  return (
    <Canvas
      camera={{ position: [1.6, 1.2, 1.6], fov: 35 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      dpr={[1, 2]}
    >
      <React.Suspense fallback={null}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[2.5, 3, 2]} intensity={1.1} castShadow />
        <directionalLight position={[-1.5, -1, 1]} intensity={0.25} />
        <CabinetBody category={category} size={size} paused={paused} />
        <ContactShadows
          position={[0, -size[1] / 2 - 0.01, 0]}
          opacity={0.4}
          blur={2}
          scale={5}
          far={2}
        />
        <Environment preset="city" />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={interactive && !paused}
          autoRotateSpeed={0.6}
          enabled={!paused}
          enableRotate={interactive}
          target={[0, 0, 0]}
        />
      </React.Suspense>
    </Canvas>
  );
}
