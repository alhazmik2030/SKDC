"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Box, Plus, Trash2, Sparkles } from "lucide-react";
import type { Template, TemplateCategory } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/effects/reveal";
import { deleteWorkspaceTemplate } from "@/lib/actions/templates";
import { useI18n } from "@/components/i18n-provider";

export function TemplatesGrid({ templates }: { templates: Template[] }) {
  const { t } = useI18n();
  const [active, setActive] = React.useState<TemplateCategory | "ALL">("ALL");
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [, startTransition] = React.useTransition();

  const FILTERS = React.useMemo<{ id: TemplateCategory | "ALL"; label: string }[]>(
    () => [
      { id: "ALL", label: t("template.category.ALL") },
      { id: "LOWER_CABINET", label: t("template.category.LOWER_CABINET") },
      { id: "UPPER_CABINET", label: t("template.category.UPPER_CABINET") },
      { id: "CORNER", label: t("template.category.CORNER") },
      { id: "TALL_CABINET", label: t("template.category.TALL_CABINET") },
      { id: "APPLIANCE", label: t("template.category.APPLIANCE") },
      { id: "ACCESSORY", label: t("template.category.ACCESSORY") },
    ],
    [t],
  );

  const filtered =
    active === "ALL" ? templates : templates.filter((tpl) => tpl.category === active);

  const counts = React.useMemo(() => {
    const c: Record<string, number> = { ALL: templates.length };
    for (const tpl of templates) c[tpl.category] = (c[tpl.category] ?? 0) + 1;
    return c;
  }, [templates]);

  const onDelete = (id: string, name: string) => {
    if (!confirm(t("common.deleteConfirm").replace("{name}", name))) return;
    setPendingId(id);
    startTransition(async () => {
      try {
        await deleteWorkspaceTemplate(id);
        toast.success(t("toast.template.deleted"));
      } catch (err) {
        toast.error((err as Error).message || t("toast.deleteFailed"));
      } finally {
        setPendingId(null);
      }
    });
  };

  return (
    <>
      {/* Filter chips */}
      <div className="mb-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setActive(f.id)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-all",
              active === f.id
                ? "border-violet-400/50 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-foreground shadow-md shadow-violet-500/20"
                : "border-border bg-white/[0.02] text-muted-foreground hover:border-violet-400/30 hover:bg-white/5 hover:text-foreground",
            )}
          >
            {f.label}
            {counts[f.id] ? (
              <span className="mr-1.5 rounded-full bg-white/5 px-2 py-0.5 text-[10px]">
                {counts[f.id]}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl px-8 py-16 text-center text-muted-foreground">
          {t("empty.templates.category")}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((template, i) => {
            const isCustom = !!template.workspaceId;
            return (
              <Reveal key={template.id} delay={Math.min(i * 0.03, 0.3)}>
                <motion.div
                  whileHover={{ y: -2 }}
                  className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card/50 transition-colors hover:border-violet-400/40"
                >
                  {/* Image / placeholder */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-violet-500/10 via-card to-sky-500/10">
                    <div className="absolute inset-0 grid-bg opacity-40" />
                    <div className="absolute inset-0 grid place-items-center">
                      <Box className="h-12 w-12 text-muted-foreground/40 transition-transform group-hover:scale-110" />
                    </div>
                    {/* Badge */}
                    <div className="absolute right-2 top-2">
                      {isCustom ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-200 ring-1 ring-emerald-400/30">
                          <Sparkles className="h-3 w-3" />
                          {t("template.badge.custom")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold text-violet-200 ring-1 ring-violet-400/30">
                          {t("template.badge.global")}
                        </span>
                      )}
                    </div>
                    {/* Delete button (custom only) */}
                    {isCustom ? (
                      <button
                        type="button"
                        aria-label={t("a11y.delete")}
                        disabled={pendingId === template.id}
                        onClick={() => onDelete(template.id, template.name)}
                        className="absolute bottom-2 right-2 grid h-7 w-7 place-items-center rounded-lg bg-rose-500/10 text-rose-300 opacity-0 backdrop-blur-sm transition-opacity hover:bg-rose-500/20 group-hover:opacity-100 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="line-clamp-2 text-sm font-semibold">{template.name}</div>
                    <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                      {template.defaultWidth}×{template.defaultHeight}×{template.defaultDepth} مم
                    </div>
                  </div>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      )}

      <div className="mt-12 text-center">
        <Link
          href="/dashboard/templates/new"
          className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-5 py-2 text-sm text-violet-200 transition-colors hover:bg-violet-500/20"
        >
          <Plus className="h-4 w-4" />
          {t("template.custom.cta")}
        </Link>
      </div>
    </>
  );
}
