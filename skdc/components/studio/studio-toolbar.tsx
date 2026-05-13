"use client";

import * as React from "react";
import {
  Undo2,
  Redo2,
  Camera as CameraIcon,
  Share2,
  Sparkles,
  Box,
  ArrowDown,
  ArrowRight,
  Footprints,
  RotateCcw,
} from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";
import type { CameraPreset, TimeOfDay } from "./studio-types";

const BORDER = "rgba(255,255,255,0.08)";

const TIME_LABELS: Record<TimeOfDay, string> = {
  morning: "studio.time.morning",
  noon: "studio.time.noon",
  sunset: "studio.time.sunset",
  night: "studio.time.night",
};

const TIME_EMOJI: Record<TimeOfDay, string> = {
  morning: "🌅",
  noon: "☀️",
  sunset: "🌇",
  night: "🌙",
};

const CAMERA_DEFS: Array<{
  id: CameraPreset;
  labelKey: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "perspective", labelKey: "studio.camera.perspective", Icon: Box },
  { id: "top", labelKey: "studio.camera.top", Icon: ArrowDown },
  { id: "front", labelKey: "studio.camera.front", Icon: ArrowRight },
  { id: "walk", labelKey: "studio.camera.walk", Icon: Footprints },
];

export interface StudioToolbarProps {
  camera: CameraPreset;
  onCamera: (c: CameraPreset) => void;
  time: TimeOfDay;
  onSnapshot: () => void;
  onShare: () => void;
  onPhotoreal: () => void;
}

export function StudioToolbar({
  camera,
  onCamera,
  time,
  onSnapshot,
  onShare,
  onPhotoreal,
}: StudioToolbarProps) {
  const { t } = useI18n();

  return (
    <div
      className="absolute left-0 right-0 top-9 z-[49] flex h-12 items-center gap-2 px-3"
      style={{
        background: "rgba(12,12,16,0.6)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <div className="flex gap-[2px]">
        <TBtn aria-label="undo">
          <Undo2 className="h-3.5 w-3.5" />
        </TBtn>
        <TBtn aria-label="redo">
          <Redo2 className="h-3.5 w-3.5" />
        </TBtn>
      </div>

      <VSep />

      <div className="flex gap-[2px]">
        {CAMERA_DEFS.map(({ id, labelKey, Icon }) => (
          <TBtn
            key={id}
            active={camera === id}
            onClick={() => onCamera(id)}
            aria-label={t(labelKey)}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{t(labelKey)}</span>
          </TBtn>
        ))}
        <TBtn onClick={() => onCamera("perspective")} aria-label={t("studio.camera.reset")}>
          <RotateCcw className="h-3.5 w-3.5" />
          <span>{t("studio.camera.reset")}</span>
        </TBtn>
      </div>

      <VSep />

      <PillTag>
        {TIME_EMOJI[time]} {t(TIME_LABELS[time])}
      </PillTag>
      <PillTag>PBR Real-time</PillTag>
      <PillTag>FPS: 60</PillTag>

      <div className="ms-auto flex gap-1.5">
        <TBtn onClick={onSnapshot}>
          <CameraIcon className="h-3.5 w-3.5" />
          <span>{t("studio.snapshot")}</span>
        </TBtn>
        <TBtn onClick={onShare}>
          <Share2 className="h-3.5 w-3.5" />
          <span>{t("studio.share")}</span>
        </TBtn>
        <button
          type="button"
          onClick={onPhotoreal}
          className="inline-flex items-center gap-1.5 rounded-[9px] border-0 px-3.5 py-1.5 text-[12px] font-bold"
          style={{
            background: "linear-gradient(135deg, #fff, #f1f1f1)",
            color: "#050507",
            boxShadow: "0 4px 14px -4px rgba(255,255,255,0.3)",
          }}
        >
          <Sparkles className="h-3.5 w-3.5" />
          {t("studio.photoreal")}
        </button>
      </div>
    </div>
  );
}

function TBtn({
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
        "inline-flex items-center gap-1.5 rounded-lg border-0 px-2.5 py-1.5 text-[12px] font-[inherit] transition-colors",
        active
          ? "text-white"
          : "text-white/55 hover:bg-white/5 hover:text-white",
      )}
      style={
        active
          ? {
              background:
                "linear-gradient(135deg, var(--theme-stop-1, #a78bfa), var(--theme-stop-2, #f0abfc))",
            }
          : { background: "transparent" }
      }
    >
      {children}
    </button>
  );
}

function VSep() {
  return (
    <span
      aria-hidden
      className="mx-1 inline-block h-[22px] w-px"
      style={{ background: BORDER }}
    />
  );
}

function PillTag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] text-white/55"
      style={{
        background: "rgba(255,255,255,0.04)",
        borderColor: BORDER,
      }}
    >
      {children}
    </span>
  );
}
