"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import type { Template, TemplateCategory } from "@prisma/client";
import { cn } from "@/lib/utils";

interface TemplatePreview3DProps {
  template: Pick<Template, "name" | "category" | "defaultWidth" | "defaultHeight" | "defaultDepth">;
  /** Optional: pause auto-rotation when the parent says so (e.g. when out of viewport). */
  paused?: boolean;
  /** Optional class for sizing the wrapper. */
  className?: string;
}

interface CategoryStyle {
  color: string;
  metalness: number;
  roughness: number;
}

const CATEGORY_PALETTE: Record<TemplateCategory, CategoryStyle> = {
  LOWER_CABINET: { color: "#c9a27a", metalness: 0.05, roughness: 0.55 },
  UPPER_CABINET: { color: "#dcb98b", metalness: 0.05, roughness: 0.5 },
  CORNER: { color: "#7a8a99", metalness: 0.2, roughness: 0.45 },
  TALL_CABINET: { color: "#6b4e36", metalness: 0.05, roughness: 0.55 },
  DRAWER: { color: "#aab3bd", metalness: 0.7, roughness: 0.35 },
  APPLIANCE: { color: "#2c2f36", metalness: 0.9, roughness: 0.2 },
  ACCESSORY: { color: "#9ca3af", metalness: 0.2, roughness: 0.5 },
};

const Skeleton = (): React.ReactElement => (
  <div
    aria-hidden
    className="h-full w-full animate-pulse"
    style={{
      background:
        "linear-gradient(135deg, var(--theme-stop-1,#a78bfa) 0%, var(--theme-stop-2,#f0abfc) 50%, var(--theme-stop-3,#38bdf8) 100%)",
      opacity: 0.18,
    }}
  />
);

const TemplateScene = dynamic(
  () => import("./template-preview-3d.scene").then((m) => m.TemplateScene),
  { ssr: false, loading: () => <Skeleton /> },
);

export function TemplatePreview3D(props: TemplatePreview3DProps): React.JSX.Element {
  const { template, paused, className } = props;
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      className={cn("relative aspect-[4/3] w-full overflow-hidden", className)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <TemplateScene
        category={template.category}
        width={template.defaultWidth}
        height={template.defaultHeight}
        depth={template.defaultDepth}
        paused={paused ?? false}
        interactive={hovered}
      />
    </div>
  );
}

export { CATEGORY_PALETTE };
export type { TemplatePreview3DProps };
