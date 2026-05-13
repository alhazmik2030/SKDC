"use client";

import * as React from "react";
import type { Template } from "@prisma/client";
import { Box, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n-provider";

const CATEGORY_COLOR: Record<string, string> = {
  LOWER_CABINET: "#a78bfa",
  UPPER_CABINET: "#38bdf8",
  CORNER: "#f0abfc",
  TALL_CABINET: "#fbbf24",
  DRAWER: "#10b981",
  APPLIANCE: "#fb7185",
  ACCESSORY: "#22d3ee",
};

export function TemplatePalette({
  templates,
  onAdd,
}: {
  templates: Template[];
  onAdd: (template: Template) => void;
}) {
  const { t } = useI18n();
  const [filter, setFilter] = React.useState<string>("ALL");

  const categories = React.useMemo(() => {
    const set = new Set<string>(["ALL"]);
    templates.forEach((t) => set.add(t.category));
    return Array.from(set);
  }, [templates]);

  const filtered = filter === "ALL" ? templates : templates.filter((t) => t.category === filter);

  return (
    <div className="flex h-full flex-col">
      {/* Filter chips */}
      <div className="mb-3 flex flex-wrap gap-1 px-1">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-[10px] transition-all",
              filter === c
                ? "border-violet-400/50 bg-violet-500/20 text-foreground"
                : "border-border bg-white/[0.02] text-muted-foreground hover:bg-white/5",
            )}
          >
            {c === "ALL" ? t("template.category.ALL") : t(`template.category.${c}`)}
          </button>
        ))}
      </div>

      {/* Template list — scrollable */}
      <div className="flex-1 space-y-1.5 overflow-y-auto px-1 pb-2">
        {filtered.map((tpl) => (
          <motion.button
            key={tpl.id}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAdd(tpl)}
            className="group flex w-full items-center gap-2 rounded-lg border border-border bg-white/[0.02] p-2 text-right transition-colors hover:border-violet-400/40"
          >
            <div
              className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-background"
              style={{ background: CATEGORY_COLOR[tpl.category] ?? "#a78bfa" }}
            >
              <Box className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium">{tpl.name}</div>
              <div className="truncate font-mono text-[10px] text-muted-foreground">
                {tpl.defaultWidth}×{tpl.defaultDepth}
              </div>
            </div>
            <Plus className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </motion.button>
        ))}
        {filtered.length === 0 ? (
          <div className="px-2 py-8 text-center text-xs text-muted-foreground">
            {t("empty.templates.category")}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function getCategoryColor(category: string): string {
  return CATEGORY_COLOR[category] ?? "#a78bfa";
}
