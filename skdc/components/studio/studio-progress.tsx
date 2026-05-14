"use client";

import Link from "next/link";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";

export type StudioStep = "shape" | "walls" | "assembly" | "studio";

type StepDef = {
  key: StudioStep;
  href: (projectId: string) => string;
  labelKey: string;
  descKey: string;
  /** Logical position (1-indexed). Used for completion comparison. */
  index: number;
};

const STEPS: StepDef[] = [
  {
    key: "shape",
    index: 1,
    href: (id) => `/dashboard/projects/${id}/studio/shape`,
    labelKey: "studio.wizard.step1.label",
    descKey: "studio.wizard.step1.desc",
  },
  {
    key: "walls",
    index: 2,
    href: (id) => `/dashboard/projects/${id}/studio/walls`,
    labelKey: "studio.wizard.step2.label",
    descKey: "studio.wizard.step2.desc",
  },
  {
    key: "assembly",
    index: 3,
    href: (id) => `/dashboard/projects/${id}/studio/assembly`,
    labelKey: "studio.wizard.step3.label",
    descKey: "studio.wizard.step3.desc",
  },
  {
    key: "studio",
    index: 4,
    href: (id) => `/dashboard/projects/${id}/studio`,
    labelKey: "studio.wizard.step4.label",
    descKey: "studio.wizard.step4.desc",
  },
];

export function StudioProgress({
  projectId,
  current,
  completed,
}: {
  projectId: string;
  current: StudioStep;
  /** Set of step keys the user has completed (drives the green check mark). */
  completed: StudioStep[];
}) {
  const { t, dir } = useI18n();
  const rtl = dir === "rtl";
  const Chevron = rtl ? ChevronLeft : ChevronRight;
  const currentIndex = STEPS.find((s) => s.key === current)?.index ?? 1;

  return (
    <nav
      aria-label={t("studio.wizard.progressAria")}
      className="mb-6 flex items-center gap-1 overflow-x-auto rounded-2xl border border-border bg-card/40 p-2 backdrop-blur-md"
    >
      {STEPS.map((step, i) => {
        const isCurrent = step.key === current;
        const isCompleted = completed.includes(step.key);
        const isReachable = isCompleted || step.index <= currentIndex;
        const showSeparator = i < STEPS.length - 1;

        const inner = (
          <span
            className={[
              "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors",
              isCurrent
                ? "text-white shadow-lg"
                : isCompleted
                  ? "text-foreground hover:bg-white/5"
                  : isReachable
                    ? "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    : "cursor-not-allowed text-muted-foreground/40",
            ].join(" ")}
            style={
              isCurrent
                ? {
                    background:
                      "linear-gradient(135deg, var(--theme-stop-1,#a78bfa) 0%, var(--theme-stop-2,#f0abfc) 50%, var(--theme-stop-3,#38bdf8) 100%)",
                    boxShadow:
                      "0 8px 24px -8px var(--theme-halo,rgba(167,139,250,0.55))",
                  }
                : undefined
            }
          >
            <span
              className={[
                "grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold",
                isCurrent
                  ? "bg-white/25"
                  : isCompleted
                    ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/50"
                    : "bg-white/5 ring-1 ring-border",
              ].join(" ")}
            >
              {isCompleted && !isCurrent ? (
                <Check className="h-3 w-3" />
              ) : (
                step.index
              )}
            </span>
            <span className="hidden whitespace-nowrap sm:inline">
              {t(step.labelKey)}
            </span>
          </span>
        );

        return (
          <div key={step.key} className="flex items-center gap-1">
            {isReachable && !isCurrent ? (
              <Link href={step.href(projectId)} aria-current={undefined}>
                {inner}
              </Link>
            ) : (
              <div aria-current={isCurrent ? "step" : undefined}>{inner}</div>
            )}
            {showSeparator ? (
              <Chevron className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
