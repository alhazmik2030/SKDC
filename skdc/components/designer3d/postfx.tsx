"use client";

// Usage (inside <Canvas>):
// <KitchenPostFX exposure={1.0} bloomIntensity={0.6} />

import * as React from "react";
import { Suspense } from "react";
import {
  EffectComposer,
  Bloom,
  SSAO,
  // ToneMapping,
  Vignette,
  BrightnessContrast,
  HueSaturation,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

export interface KitchenPostFXProps {
  /** Lower for night/atmospheric. Default 1.0. */
  exposure?: number;
  /** Disable on low-end devices to save performance. */
  enabled?: boolean;
  /** Increased bloom for night/sunset modes. */
  bloomIntensity?: number;
}

/**
 * Postprocessing stack tuned for a realistic interior kitchen scene.
 *
 * Must be rendered INSIDE an R3F <Canvas>. The `exposure` prop is reserved
 * for future per-effect exposure tuning; tone-mapping exposure itself is
 * normally configured on the WebGL renderer in the parent <Canvas>.
 */
export function KitchenPostFX({
  exposure: _exposure = 1.0,
  enabled = true,
  bloomIntensity = 0.4,
}: KitchenPostFXProps): React.JSX.Element | null {
  // Reference the param so TS/ESLint stay quiet until consumers wire it up
  // to a custom tone-mapping pass.
  void _exposure;

  if (!enabled) return null;

  return (
    <Suspense fallback={null}>
      <EffectComposer multisampling={4}>
        {/* 1. SSAO — soft contact shadows everywhere */}
        <SSAO
          blendFunction={BlendFunction.MULTIPLY}
          samples={16}
          radius={0.4}
          intensity={25}
          bias={0.025}
          worldDistanceThreshold={0}
          worldDistanceFalloff={0}
          worldProximityThreshold={0}
          worldProximityFalloff={0}
        />

        {/* 2. Bloom — only on bright emissives (windows + LEDs) */}
        <Bloom
          intensity={bloomIntensity}
          luminanceThreshold={0.9}
          luminanceSmoothing={0.025}
          mipmapBlur
        />

        {/*
         * 3. ToneMapping — usually redundant when the parent <Canvas> sets
         *    ACES on the WebGL renderer (gl={{ toneMapping: ACESFilmicToneMapping }}).
         *    Re-enable here only if the renderer-level tone mapping is disabled.
         *
         * <ToneMapping
         *   blendFunction={BlendFunction.NORMAL}
         *   mode={ToneMappingMode.ACES_FILMIC}
         * />
         */}

        {/* 4. HueSaturation — slight saturation boost for cinematic feel */}
        <HueSaturation hue={0} saturation={0.08} />

        {/* 5. BrightnessContrast — gentle contrast lift */}
        <BrightnessContrast brightness={0} contrast={0.05} />

        {/* 6. Vignette — subtle framing */}
        <Vignette darkness={0.35} offset={0.5} eskil={false} />
      </EffectComposer>
    </Suspense>
  );
}

export default KitchenPostFX;
