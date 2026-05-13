"use client";

import * as React from "react";
import { useI18n } from "@/components/i18n-provider";

const BORDER = "rgba(255,255,255,0.08)";

export interface StudioStatusBarProps {
  unitsCount: number;
  selectedName: string | null;
  estimate: number;
}

export function StudioStatusBar({
  unitsCount,
  selectedName,
  estimate,
}: StudioStatusBarProps) {
  const { t, locale } = useI18n();

  const formatted = React.useMemo(() => {
    try {
      return new Intl.NumberFormat(locale, {
        maximumFractionDigits: 0,
      }).format(estimate);
    } catch {
      return String(estimate);
    }
  }, [estimate, locale]);

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-[40] flex h-7 items-center gap-3.5 px-3 text-[11px] text-white/55"
      style={{
        background: "rgba(12,12,16,0.78)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: `1px solid ${BORDER}`,
      }}
    >
      <span
        className="inline-block h-[7px] w-[7px] rounded-full"
        style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e" }}
      />
      <span>{t("studio.status.connected")}</span>
      <span>·</span>
      <span>
        {unitsCount} {t("studio.status.units")}
      </span>
      {selectedName ? (
        <>
          <span>·</span>
          <span>{selectedName}</span>
        </>
      ) : null}

      <span className="ms-auto">{t("studio.status.estimate")}:</span>
      <span
        className="font-bold"
        style={{ color: "var(--theme-stop-2, #f0abfc)" }}
      >
        {formatted} ر.س
      </span>
      <span>·</span>
      <span style={{ color: "var(--theme-stop-1, #a78bfa)" }}>⚡ WebGL</span>
      <span>·</span>
      <span>FPS: 60</span>
    </div>
  );
}
