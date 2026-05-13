"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Loader2, Sun, Moon, Eye, Lightbulb, Maximize2 } from "lucide-react";
import Link from "next/link";
import type { DesignerState, DesignerRoom } from "@/components/designer/types";
import { EMPTY_DESIGN } from "@/components/designer/types";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n-provider";

function SceneLoader() {
  const { t } = useI18n();
  return (
    <div className="grid h-full place-items-center text-sm text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin" />
      <span className="mt-2">{t("designer3d.loading")}</span>
    </div>
  );
}

const Scene3D = dynamic(() => import("./scene").then((m) => m.Scene3D), {
  ssr: false,
  loading: () => <SceneLoader />,
});

export function Designer3DShell({
  projectId,
  initialDesign,
  initialRoom,
}: {
  projectId: string;
  initialDesign: DesignerState | null;
  initialRoom: Partial<DesignerRoom>;
}) {
  const { t } = useI18n();
  const design: DesignerState = React.useMemo(() => {
    if (initialDesign && Array.isArray(initialDesign.units)) {
      return {
        ...EMPTY_DESIGN,
        ...initialDesign,
        room: { ...EMPTY_DESIGN.room, ...initialDesign.room, ...initialRoom },
      };
    }
    return { ...EMPTY_DESIGN, room: { ...EMPTY_DESIGN.room, ...initialRoom } };
  }, [initialDesign, initialRoom]);

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [lightsOn, setLightsOn] = React.useState(true);

  return (
    <div className="flex h-[calc(100vh-9rem)] overflow-hidden rounded-2xl border border-border bg-[#0a0a0a]">
      {/* Toolbar */}
      <div className="glass absolute right-4 top-24 z-10 flex flex-col gap-1 rounded-2xl border border-border bg-card/70 p-1.5 backdrop-blur-xl">
        <ToolbarButton
          icon={lightsOn ? Sun : Moon}
          active={lightsOn}
          onClick={() => setLightsOn((v) => !v)}
          label={lightsOn ? t("designer3d.lightsOff") : t("designer3d.lightsOn")}
        />
        <ToolbarButton icon={Lightbulb} label="LED" />
        <ToolbarButton icon={Eye} label={t("designer3d.view")} />
        <ToolbarButton icon={Maximize2} label={t("designer3d.fullscreen")} />
      </div>

      {/* Info badge */}
      <div className="glass absolute left-4 top-24 z-10 rounded-2xl border border-border bg-card/70 p-3 backdrop-blur-xl">
        <div className="font-mono text-xs uppercase tracking-wider text-violet-300">
          3D Designer · Live
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {design.units.length} {t("designer.unitsCount")} · {design.room.width}×
          {design.room.depth}×{design.room.height} مم
        </div>
        <div className="mt-2 text-[10px] leading-relaxed text-muted-foreground/70">
          {t("designer3d.tip")}
        </div>
      </div>

      {/* Back to Studio link */}
      <Link
        href={`/dashboard/projects/${projectId}/studio`}
        className="glass absolute bottom-4 left-4 z-10 inline-flex items-center gap-2 rounded-xl border border-border bg-card/70 px-3 py-2 text-xs text-muted-foreground backdrop-blur-xl hover:text-foreground"
      >
        ← {t("designer3d.backToStudio")}
      </Link>

      {/* The 3D scene */}
      <div className="absolute inset-0">
        <Scene3D
          design={design}
          selectedId={selectedId}
          onSelect={setSelectedId}
          ambientLightOn={lightsOn}
        />
      </div>
    </div>
  );
}

function ToolbarButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-lg transition-colors",
        active
          ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-md"
          : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
