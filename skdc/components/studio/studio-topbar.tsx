"use client";

import * as React from "react";
import Link from "next/link";
import { X, Save, Loader2 } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";

const GLASS_BG = "rgba(12,12,16,0.78)";
const BORDER = "rgba(255,255,255,0.08)";

export interface StudioTopbarProps {
  projectId: string;
  lastSavedAt: number | null;
  isSaving: boolean;
}

export function StudioTopbar({
  projectId,
  lastSavedAt,
  isSaving,
}: StudioTopbarProps) {
  const { t } = useI18n();

  const lastSavedLabel = React.useMemo(() => {
    if (isSaving) return t("studio.saving");
    if (!lastSavedAt) return "—";
    const seconds = Math.floor((Date.now() - lastSavedAt) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  }, [lastSavedAt, isSaving, t]);

  return (
    <div
      className="absolute left-0 right-0 top-0 z-[50] flex h-9 items-center gap-3 px-3"
      style={{
        background: GLASS_BG,
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <span
        className="text-[13px] font-black"
        style={{
          background:
            "linear-gradient(135deg, var(--theme-stop-1, #a78bfa), var(--theme-stop-3, #38bdf8))",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {t("studio.title")}
      </span>

      <MenuItem label={t("studio.menu.file")} />
      <MenuItem label={t("studio.menu.edit")} />
      <MenuItem label={t("studio.menu.view")} />
      <MenuItem label={t("studio.menu.camera")} />
      <MenuItem label={t("studio.menu.lighting")} />
      <MenuItem label={t("studio.menu.render")} />
      <MenuItem label={t("studio.menu.help")} />

      <div className="ms-auto flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1 rounded-full border px-3 py-[3px] text-[11px] text-white/55"
          style={{
            background: "rgba(255,255,255,0.04)",
            borderColor: BORDER,
          }}
        >
          {isSaving ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Save className="h-3 w-3" />
          )}
          {t("studio.lastSaved")}: {lastSavedLabel}
        </span>

        <Link
          href={`/dashboard/projects/${projectId}`}
          className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[12px] font-semibold"
          style={{
            color: "#fda4af",
            background: "rgba(244,63,94,0.18)",
            borderColor: "rgba(244,63,94,0.4)",
          }}
        >
          <X className="h-3.5 w-3.5" />
          {t("studio.exit")}
        </Link>
      </div>
    </div>
  );
}

function MenuItem({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="cursor-pointer rounded-md px-2 py-[5px] text-[12px] text-white/55 transition-colors hover:bg-white/5 hover:text-white"
    >
      {label}
    </button>
  );
}
