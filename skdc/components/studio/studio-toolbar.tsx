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
  Wand2,
  Layers,
  Eye,
  EyeOff,
  Palette,
} from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";
import type { CameraPreset, TimeOfDay } from "./studio-types";

const BORDER = "rgba(255,255,255,0.08)";

const TIME_DEFS: Array<{ id: TimeOfDay; emoji: string; labelKey: string }> = [
  { id: "morning", emoji: "🌅", labelKey: "studio.time.morning" },
  { id: "noon", emoji: "☀️", labelKey: "studio.time.noon" },
  { id: "sunset", emoji: "🌇", labelKey: "studio.time.sunset" },
  { id: "night", emoji: "🌙", labelKey: "studio.time.night" },
];

const CAMERA_DEFS: Array<{
  id: CameraPreset;
  labelKey: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "perspective", labelKey: "studio.camera.perspective", Icon: Box },
  { id: "hero", labelKey: "studio.camera.hero", Icon: Wand2 },
  { id: "top", labelKey: "studio.camera.top", Icon: ArrowDown },
  { id: "front", labelKey: "studio.camera.front", Icon: ArrowRight },
  { id: "walk", labelKey: "studio.camera.walk", Icon: Footprints },
];

export interface StudioToolbarProps {
  camera: CameraPreset;
  onCamera: (c: CameraPreset) => void;
  time: TimeOfDay;
  onTime?: (t: TimeOfDay) => void;
  onSnapshot: () => void;
  onShare: () => void;
  onPhotoreal: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  wallsPanelOpen?: boolean;
  onToggleWalls?: () => void;
  wallsCount?: number;
  hideWalls?: boolean;
  onToggleHideWalls?: () => void;
  materialsPickerOpen?: boolean;
  onToggleMaterials?: () => void;
}

export function StudioToolbar({
  camera,
  onCamera,
  time,
  onTime,
  onSnapshot,
  onShare,
  onPhotoreal,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  wallsPanelOpen = false,
  onToggleWalls,
  wallsCount = 0,
  hideWalls = false,
  onToggleHideWalls,
  materialsPickerOpen = false,
  onToggleMaterials,
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
        <TBtn
          aria-label={t("studio.undo")}
          title={t("studio.undo")}
          onClick={onUndo}
          disabled={!canUndo || !onUndo}
        >
          <Undo2 className="h-3.5 w-3.5" />
        </TBtn>
        <TBtn
          aria-label={t("studio.redo")}
          title={t("studio.redo")}
          onClick={onRedo}
          disabled={!canRedo || !onRedo}
        >
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

      {/* Scene-level toggles — previously floating pills on the right edge of
          the canvas, now anchored in the toolbar so they're discoverable. */}
      <div className="flex gap-[2px]">
        <TBtn
          active={wallsPanelOpen}
          onClick={onToggleWalls}
          aria-label="الجدران"
          title="الجدران"
        >
          <Layers className="h-3.5 w-3.5" />
          <span>الجدران</span>
          {wallsCount > 0 ? (
            <span
              className="ms-1 grid h-4 min-w-[16px] place-items-center rounded-full px-1 text-[9px] font-black"
              style={{
                background: wallsPanelOpen
                  ? "rgba(255,255,255,0.25)"
                  : "rgba(167,139,250,0.20)",
                color: wallsPanelOpen ? "#fff" : "#e0d4ff",
              }}
            >
              {wallsCount}
            </span>
          ) : null}
        </TBtn>
        <TBtn
          active={hideWalls}
          onClick={onToggleHideWalls}
          aria-label={hideWalls ? "إظهار الجدران" : "إخفاء الجدران"}
          title={hideWalls ? "إظهار الجدران" : "إخفاء الجدران للقطة نظيفة"}
        >
          {hideWalls ? (
            <EyeOff className="h-3.5 w-3.5" />
          ) : (
            <Eye className="h-3.5 w-3.5" />
          )}
          <span>{hideWalls ? "إظهار" : "إخفاء"}</span>
        </TBtn>
        <TBtn
          active={materialsPickerOpen}
          onClick={onToggleMaterials}
          aria-label="مكتبة الخامات"
          title="مكتبة الخامات"
        >
          <Palette className="h-3.5 w-3.5" />
          <span>خامات</span>
        </TBtn>
      </div>

      <VSep />

      {/* Time-of-day — interactive (was duplicated in StudioBottomBar). */}
      <div className="flex gap-[2px]">
        {TIME_DEFS.map(({ id, emoji, labelKey }) => (
          <TBtn
            key={id}
            active={time === id}
            onClick={() => onTime?.(id)}
            aria-label={t(labelKey)}
            title={t(labelKey)}
          >
            <span>{emoji}</span>
          </TBtn>
        ))}
      </div>

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
  disabled,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      {...rest}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border-0 px-2.5 py-1.5 text-[12px] font-[inherit] transition-colors",
        active
          ? "text-white"
          : "text-white/55 hover:bg-white/5 hover:text-white",
        disabled && "cursor-not-allowed opacity-35 hover:bg-transparent hover:text-white/55",
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

