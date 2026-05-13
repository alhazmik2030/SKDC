"use client";

import * as React from "react";
import * as THREE from "three";

// ============================================================
// Types
// ============================================================
export type SinkVariant =
  | "single-undermount"
  | "double-undermount"
  | "single-topmount"
  | "farmhouse";

export type FaucetVariant =
  | "single-handle"
  | "pull-out"
  | "tall-arc"
  | "matte-black";

export interface SinkFaucetProps {
  /** Top of countertop centre — scene-meters. */
  position: [number, number, number];
  sink?: SinkVariant;
  faucet?: FaucetVariant;
}

// ============================================================
// Shared materials (module-level — single instance each)
// ============================================================
const STAINLESS_MAT = new THREE.MeshPhysicalMaterial({
  color: "#c9ccd0",
  metalness: 0.9,
  roughness: 0.25,
  clearcoat: 0.3,
  clearcoatRoughness: 0.2,
});

const CHROME_MAT = new THREE.MeshPhysicalMaterial({
  color: "#dfe2e6",
  metalness: 0.95,
  roughness: 0.18,
  clearcoat: 0.5,
  clearcoatRoughness: 0.1,
});

const MATTE_BLACK_MAT = new THREE.MeshPhysicalMaterial({
  color: "#181818",
  metalness: 0.7,
  roughness: 0.5,
  clearcoat: 0.1,
  clearcoatRoughness: 0.4,
});

const PORCELAIN_MAT = new THREE.MeshPhysicalMaterial({
  color: "#f6f3ec",
  metalness: 0.0,
  roughness: 0.2,
  clearcoat: 0.5,
  clearcoatRoughness: 0.1,
});

// ============================================================
// Sink dimensions per variant (in meters)
// ============================================================
interface SinkSpec {
  outerW: number;
  outerD: number;
  outerH: number; // depth of basin below counter top
  rimAbove: number; // how high the rim sits above the counter
  basins: 1 | 2;
  material: "stainless" | "porcelain";
}

const SINK_SPECS: Record<SinkVariant, SinkSpec> = {
  "single-undermount": {
    outerW: 0.6,
    outerD: 0.42,
    outerH: 0.22,
    rimAbove: 0,
    basins: 1,
    material: "stainless",
  },
  "double-undermount": {
    outerW: 0.84,
    outerD: 0.44,
    outerH: 0.22,
    rimAbove: 0,
    basins: 2,
    material: "stainless",
  },
  "single-topmount": {
    outerW: 0.62,
    outerD: 0.44,
    outerH: 0.2,
    rimAbove: 0.012,
    basins: 1,
    material: "stainless",
  },
  farmhouse: {
    outerW: 0.76,
    outerD: 0.48,
    outerH: 0.26,
    rimAbove: 0.04,
    basins: 1,
    material: "porcelain",
  },
};

// ============================================================
// Sink primitive — built as a thin-walled box per compartment.
// ============================================================
function SinkMesh({ spec }: { spec: SinkSpec }): React.JSX.Element {
  const wall = 0.006; // 6mm metal wall
  const compartmentW = spec.basins === 2 ? (spec.outerW - wall) / 2 : spec.outerW;
  const mat = spec.material === "porcelain" ? PORCELAIN_MAT : STAINLESS_MAT;

  // Origin (0,0,0) of this group is at the TOP rim center of the sink.
  // Basin floor sits at y = -outerH.
  const basinIndices: number[] = spec.basins === 2 ? [-1, 1] : [0];

  return (
    <group>
      {/* Optional rim above counter (top-mount + farmhouse) */}
      {spec.rimAbove > 0 ? (
        <mesh
          position={[0, spec.rimAbove / 2, 0]}
          material={mat}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[spec.outerW + 0.02, spec.rimAbove, spec.outerD + 0.02]}
          />
        </mesh>
      ) : null}

      {basinIndices.map((side) => {
        const cx = side === 0 ? 0 : side * (compartmentW / 2 + wall / 2);
        const innerW = compartmentW - wall * 2;
        const innerD = spec.outerD - wall * 2;
        const innerH = spec.outerH - wall;

        return (
          <group key={side} position={[cx, 0, 0]}>
            {/* Basin floor */}
            <mesh
              position={[0, -spec.outerH + wall / 2, 0]}
              material={mat}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[innerW, wall, innerD]} />
            </mesh>
            {/* Front wall */}
            <mesh
              position={[0, -innerH / 2, spec.outerD / 2 - wall / 2]}
              material={mat}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[compartmentW, innerH, wall]} />
            </mesh>
            {/* Back wall */}
            <mesh
              position={[0, -innerH / 2, -spec.outerD / 2 + wall / 2]}
              material={mat}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[compartmentW, innerH, wall]} />
            </mesh>
            {/* Left wall */}
            <mesh
              position={[-compartmentW / 2 + wall / 2, -innerH / 2, 0]}
              material={mat}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[wall, innerH, innerD]} />
            </mesh>
            {/* Right wall */}
            <mesh
              position={[compartmentW / 2 - wall / 2, -innerH / 2, 0]}
              material={mat}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[wall, innerH, innerD]} />
            </mesh>
            {/* Drain disc (small dark circle at bottom) */}
            <mesh
              position={[0, -spec.outerH + wall + 0.001, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <circleGeometry args={[0.035, 24]} />
              <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.4} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ============================================================
// Faucet — curved arm built from a Tube along a CatmullRom curve.
// The curve approximates a cubic Bezier shape with control points
// that produce the desired arc per variant.
// ============================================================
interface FaucetSpec {
  baseHeight: number; // cylinder base
  baseRadius: number;
  pipeRadius: number;
  archHeight: number; // peak of the arc
  reach: number; // how far forward (+Z) the spout reaches
  material: THREE.MeshPhysicalMaterial;
  pullOut: boolean; // visual seam at spout
  handleStyle: "lever" | "round";
}

const FAUCET_SPECS: Record<FaucetVariant, FaucetSpec> = {
  "single-handle": {
    baseHeight: 0.05,
    baseRadius: 0.022,
    pipeRadius: 0.011,
    archHeight: 0.22,
    reach: 0.18,
    material: CHROME_MAT,
    pullOut: false,
    handleStyle: "lever",
  },
  "pull-out": {
    baseHeight: 0.05,
    baseRadius: 0.024,
    pipeRadius: 0.013,
    archHeight: 0.24,
    reach: 0.2,
    material: CHROME_MAT,
    pullOut: true,
    handleStyle: "lever",
  },
  "tall-arc": {
    baseHeight: 0.06,
    baseRadius: 0.024,
    pipeRadius: 0.012,
    archHeight: 0.34,
    reach: 0.22,
    material: CHROME_MAT,
    pullOut: false,
    handleStyle: "round",
  },
  "matte-black": {
    baseHeight: 0.05,
    baseRadius: 0.022,
    pipeRadius: 0.011,
    archHeight: 0.22,
    reach: 0.18,
    material: MATTE_BLACK_MAT,
    pullOut: false,
    handleStyle: "lever",
  },
};

/**
 * Build the curved faucet pipe.
 * Approximation: a CatmullRomCurve3 through 5 sampled points along a
 * conceptual cubic Bezier (start at base top → up → arc apex → forward → spout).
 * TubeGeometry then sweeps a circular cross-section along the curve.
 */
function buildFaucetCurve(spec: FaucetSpec): THREE.CatmullRomCurve3 {
  const start = new THREE.Vector3(0, spec.baseHeight, 0);
  // Apex of the arc — directly above base
  const apex = new THREE.Vector3(0, spec.baseHeight + spec.archHeight, 0);
  // Mid-rise point — between start and apex
  const rise = new THREE.Vector3(
    0,
    spec.baseHeight + spec.archHeight * 0.55,
    spec.reach * 0.05,
  );
  // Forward sweep — leaving the apex toward the spout
  const sweep = new THREE.Vector3(
    0,
    spec.baseHeight + spec.archHeight * 0.85,
    spec.reach * 0.55,
  );
  // Spout tip
  const tip = new THREE.Vector3(
    0,
    spec.baseHeight + spec.archHeight * 0.6,
    spec.reach,
  );

  return new THREE.CatmullRomCurve3([start, rise, apex, sweep, tip], false, "catmullrom", 0.5);
}

function Faucet({ spec }: { spec: FaucetSpec }): React.JSX.Element {
  const curve = React.useMemo(() => buildFaucetCurve(spec), [spec]);
  const tubeGeom = React.useMemo(
    () => new THREE.TubeGeometry(curve, 32, spec.pipeRadius, 12, false),
    [curve, spec.pipeRadius],
  );

  React.useEffect(() => {
    return () => {
      tubeGeom.dispose();
    };
  }, [tubeGeom]);

  // Spout tip position — last point on curve, used to place spout head & seam.
  const tipPoint = curve.getPointAt(1);

  return (
    <group>
      {/* Cylindrical base on counter */}
      <mesh
        position={[0, spec.baseHeight / 2, 0]}
        material={spec.material}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[spec.baseRadius, spec.baseRadius * 1.1, spec.baseHeight, 24]} />
      </mesh>

      {/* Curved pipe (tube along the Bezier-approximation curve) */}
      <mesh geometry={tubeGeom} material={spec.material} castShadow receiveShadow />

      {/* Spout head — small cylinder cap pointing down at the tip */}
      <mesh
        position={[tipPoint.x, tipPoint.y - 0.018, tipPoint.z]}
        material={spec.material}
        castShadow
        receiveShadow
      >
        <cylinderGeometry
          args={[spec.pipeRadius * 1.4, spec.pipeRadius * 1.6, 0.036, 18]}
        />
      </mesh>

      {/* Pull-out seam: a slim ring just above the spout head */}
      {spec.pullOut ? (
        <mesh
          position={[tipPoint.x, tipPoint.y + 0.002, tipPoint.z]}
          material={spec.material}
          castShadow
        >
          <torusGeometry args={[spec.pipeRadius * 1.5, 0.002, 8, 18]} />
        </mesh>
      ) : null}

      {/* Handle — lever (sits at the side of the base) or round knob */}
      {spec.handleStyle === "lever" ? (
        <group position={[spec.baseRadius + 0.005, spec.baseHeight + 0.02, 0]}>
          {/* Hinge knuckle */}
          <mesh
            rotation={[0, 0, Math.PI / 2]}
            material={spec.material}
            castShadow
            receiveShadow
          >
            <cylinderGeometry args={[0.012, 0.012, 0.022, 16]} />
          </mesh>
          {/* Lever arm extending up-and-out */}
          <mesh
            position={[0.035, 0.03, 0]}
            rotation={[0, 0, Math.PI / 5]}
            material={spec.material}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.08, 0.014, 0.014]} />
          </mesh>
        </group>
      ) : (
        <mesh
          position={[0, spec.baseHeight + 0.025, 0]}
          material={spec.material}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[spec.baseRadius * 0.9, spec.baseRadius * 0.9, 0.03, 20]} />
        </mesh>
      )}
    </group>
  );
}

// ============================================================
// Composite component
// ============================================================
export function SinkFaucet(props: SinkFaucetProps): React.JSX.Element {
  const { position, sink = "single-undermount", faucet = "single-handle" } = props;

  const sinkSpec = SINK_SPECS[sink];
  const faucetSpec = FAUCET_SPECS[faucet];

  // Sink hangs below the counter top. The passed `position` is the centre
  // of the counter surface. The faucet stands at the back edge of the sink.
  const faucetOffsetZ = -sinkSpec.outerD / 2 - 0.04; // ~4cm behind sink centre line

  return (
    <group position={position}>
      {/* Sink — group origin already at counter top centre */}
      <SinkMesh spec={sinkSpec} />
      {/* Faucet — sits on top of counter, behind the sink */}
      <group position={[0, sinkSpec.rimAbove, faucetOffsetZ]}>
        <Faucet spec={faucetSpec} />
      </group>
    </group>
  );
}
