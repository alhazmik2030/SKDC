"use client";

import * as React from "react";
import {
  Box,
  ArrowDown,
  ArrowRight,
  Footprints,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";
import type { CameraPreset, TimeOfDay } from "./studio-types";

const BORDER = "rgba(255,255,255,0.08)";
const GLASS_STRONG = "rgba(8,8,12,0.92)";

const CAMERA_DEFS: Array<{
  id: CameraPreset | "reset";
  labelKey: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "perspective", labelKey: "studio.camera.perspective", Icon: Box },
  { id: "hero", labelKey: "studio.camera.hero", Icon: Sparkles },
  { id: "top", labelKey: "studio.camera.top", Icon: ArrowDown },
  { id: "front", labelKey: "studio.camera.front", Icon: ArrowRight },
  { id: "walk", labelKey: "studio.camera.walk", Icon: Footprints },
  { id: "reset", labelKey: "studio.camera.reset", Icon: RotateCcw },
];

const TIME_DEFS: Array<{ id: TimeOfDay; emoji: string; labelKey: string }> = [
  { id: "morning", emoji: "🌅", labelKey: "studio.time.morning" },
  { id: "noon", emoji: "☀️", labelKey: "studio.time.noon" },
  { id: "sunset", emoji: "🌇", labelKey: "studio.time.sunset" },
  { id: "night", emoji: "🌙", labelKey: "studio.time.night" },
];

export interface StudioBottomBarProps {
  camera: CameraPreset;
  onCamera: (c: CameraPreset) => void;
  time: TimeOfDay;
  onTime: (t: TimeOfDay) => void;
}

export function StudioBottomBar({
  camera,
  onCamera,
  time,
  onTime,
}: StudioBottomBarProps) {
  const { t } = useI18n();

  return (
    <div
      className="absolute bottom-9 left-1/2 z-[50] flex -translate-x-1/2 gap-2"
    >
      <Pill>
        {CAMERA_DEFS.map(({ id, labelKey, Icon }) => {
          const isReset = id === "reset";
          const isActive = !isReset && camera === id;
          return (
            <CamBtn
              key={id}
              active={isActive}
              onClick={() =>
                isReset ? onCamera("perspective") : onCamera(id as CameraPreset)
              }
              aria-label={t(labelKey)}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t(labelKey)}</span>
            </CamBtn>
          );
        })}
      </Pill>

      <Pill>
        {TIME_DEFS.map(({ id, emoji, labelKey }) => (
          <CamBtn
            key={id}
            active={time === id}
            onClick={() => onTime(id)}
            aria-label={t(labelKey)}
          >
            <span>{emoji}</span>
          </CamBtn>
        ))}
      </Pill>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex gap-[2px] rounded-xl border p-[3px]"
      style={{
        background: GLASS_STRONG,
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderColor: BORDER,
        boxShadow: "0 14px 40px -14px rgba(0,0,0,0.6)",
      }}
    >
      {children}
    </div>
  );
}

function CamBtn({
  children,
  active = false,
  onClick,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      {...rest}
      className={cn(
        "inline-flex cursor-pointer items-center gap-1 rounded-lg border-0 px-3 py-1.5 font-[inherit] text-[11px] transition-colors",
        active
          ? "text-white"
          : "text-white/55 hover:bg-white/5 hover:text-white",
      )}
      style={
        active
          ? {
              background:
                "linear-gradient(135deg, var(--theme-stop-3, #38bdf8), var(--theme-stop-1, #a78bfa))",
            }
          : { background: "transparent" }
      }
    >
      {children}
    </button>
  );
}
