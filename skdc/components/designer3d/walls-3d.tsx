"use client";

import * as React from "react";
import * as THREE from "three";
import {
  wallPanels,
  worldPlacement,
  type WallData,
} from "@/lib/designer/wall-geometry";

const MM = 0.001;

export interface IslandRender {
  hasIsland: boolean;
  width: number | null;
  depth: number | null;
  x: number | null;
  z: number | null;
  height?: number;
}

export interface Walls3DProps {
  walls: WallData[];
  island?: IslandRender | null;
  /** Room dims in mm — used for the floor footprint. */
  room: { width: number; depth: number; height: number };
}

export function Walls3D({ walls, island, room }: Walls3DProps) {
  const roomW = room.width * MM;
  const roomD = room.depth * MM;

  return (
    <group>
      <Floor width={roomW} depth={roomD} />
      {walls.map((wall) => (
        <WallMesh key={wall.id} wall={wall} />
      ))}
      {island?.hasIsland ? <Island data={island} room={room} /> : null}
    </group>
  );
}

function Floor({ width, depth }: { width: number; depth: number }) {
  const t = 0.05;
  return (
    <mesh receiveShadow position={[width / 2, -t / 2, depth / 2]}>
      <boxGeometry args={[width, t, depth]} />
      <meshPhysicalMaterial
        color="#c9a87a"
        roughness={0.55}
        metalness={0}
        clearcoat={0.3}
        clearcoatRoughness={0.4}
        reflectivity={0.35}
      />
    </mesh>
  );
}

function WallMesh({ wall }: { wall: WallData }) {
  const panels = wallPanels(wall);
  const thicknessM = wall.thickness * MM;

  return (
    <group>
      {panels.map((p, i) => {
        const centreOffset = p.offset + p.width / 2;
        const centreFloor = p.baseHeight + p.height / 2;
        const { position, rotationY } = worldPlacement(
          wall,
          centreOffset,
          centreFloor,
        );
        return (
          <mesh
            key={`${wall.id}-p${i}`}
            position={position}
            rotation={[0, rotationY, 0]}
            receiveShadow
            castShadow
          >
            <boxGeometry
              args={[p.width * MM, p.height * MM, thicknessM]}
            />
            <meshPhysicalMaterial
              color="#f1ebe1"
              roughness={0.85}
              metalness={0}
              sheen={0.05}
              sheenColor="#fff5e8"
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}

      {wall.hasWindow &&
      wall.windowOffset != null &&
      wall.windowWidth != null &&
      wall.windowHeight != null &&
      wall.windowSill != null ? (
        <WindowGlass wall={wall} />
      ) : null}
    </group>
  );
}

function WindowGlass({ wall }: { wall: WallData }) {
  const winW = (wall.windowWidth ?? 1200) * MM;
  const winH = (wall.windowHeight ?? 1000) * MM;
  const { position, rotationY } = worldPlacement(
    wall,
    (wall.windowOffset ?? 0) + (wall.windowWidth ?? 0) / 2,
    (wall.windowSill ?? 0) + (wall.windowHeight ?? 0) / 2,
  );

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Glass pane — emissive for that bright-window feel */}
      <mesh>
        <planeGeometry args={[winW, winH]} />
        <meshPhysicalMaterial
          color="#a8d5ff"
          transmission={0.7}
          opacity={0.85}
          transparent
          roughness={0.05}
          metalness={0}
          thickness={0.02}
          ior={1.5}
          emissive="#fff8e0"
          emissiveIntensity={1.4}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Window frame — thin border */}
      <WindowFrame width={winW} height={winH} />
    </group>
  );
}

function WindowFrame({ width, height }: { width: number; height: number }) {
  const t = 0.025; // frame thickness in m
  const d = 0.02; // frame depth
  const mat = (
    <meshPhysicalMaterial
      color="#2a2a30"
      roughness={0.4}
      metalness={0.2}
    />
  );
  return (
    <group>
      {/* top */}
      <mesh position={[0, height / 2 - t / 2, d / 2]}>
        <boxGeometry args={[width, t, d]} />
        {mat}
      </mesh>
      {/* bottom */}
      <mesh position={[0, -height / 2 + t / 2, d / 2]}>
        <boxGeometry args={[width, t, d]} />
        {mat}
      </mesh>
      {/* left */}
      <mesh position={[-width / 2 + t / 2, 0, d / 2]}>
        <boxGeometry args={[t, height, d]} />
        {mat}
      </mesh>
      {/* right */}
      <mesh position={[width / 2 - t / 2, 0, d / 2]}>
        <boxGeometry args={[t, height, d]} />
        {mat}
      </mesh>
      {/* middle vertical mullion */}
      <mesh position={[0, 0, d / 2]}>
        <boxGeometry args={[t * 0.6, height, d]} />
        {mat}
      </mesh>
    </group>
  );
}

function Island({
  data,
  room,
}: {
  data: IslandRender;
  room: { height: number };
}) {
  const w = (data.width ?? 1800) * MM;
  const d = (data.depth ?? 900) * MM;
  const h = 0.9; // 900mm — standard counter height
  const x = (data.x ?? 0) * MM + w / 2;
  const z = (data.z ?? 0) * MM + d / 2;

  return (
    <group position={[x, 0, z]}>
      {/* Body (base cabinet block) */}
      <mesh position={[0, (h - 0.04) / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h - 0.04, d]} />
        <meshPhysicalMaterial
          color="#3a3a40"
          roughness={0.35}
          metalness={0.1}
          clearcoat={0.5}
          clearcoatRoughness={0.25}
        />
      </mesh>
      {/* Counter top — slight overhang */}
      <mesh position={[0, h - 0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[w + 0.04, 0.04, d + 0.04]} />
        <meshPhysicalMaterial
          color="#e8e4dc"
          roughness={0.15}
          metalness={0.05}
          clearcoat={0.9}
          clearcoatRoughness={0.06}
          reflectivity={0.5}
        />
      </mesh>
      {/* Toe-kick */}
      <mesh position={[0, 0.05, d / 2 - 0.04]}>
        <boxGeometry args={[w * 0.97, 0.1, 0.005]} />
        <meshStandardMaterial color="#1a1a1e" roughness={0.7} />
      </mesh>
    </group>
  );
}
