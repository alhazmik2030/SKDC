"use client";

import * as React from "react";
import { FactoryTrustGrade } from "@prisma/client";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n-provider";

const GRADE_CLASSES: Record<FactoryTrustGrade, string> = {
  A: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/40",
  B: "bg-sky-500/15 text-sky-300 ring-sky-400/40",
  C: "bg-amber-500/15 text-amber-300 ring-amber-400/40",
  D: "bg-rose-500/15 text-rose-300 ring-rose-400/40",
  UNRATED: "bg-muted text-muted-foreground ring-muted-foreground/30",
};

const FALLBACK_LABEL: Record<FactoryTrustGrade, string> = {
  A: "موثوق ممتاز",
  B: "موثوق",
  C: "متوسط",
  D: "حذر",
  UNRATED: "غير مُقيّم",
};

/**
 * Large letter badge. Score is shown as a small footer when present.
 * The `size` prop controls visual scale on cards (sm) vs. detail headers (lg).
 */
export function TrustGrade({
  grade,
  score,
  className,
  size = "md",
}: {
  grade: FactoryTrustGrade;
  score?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const { t } = useI18n();
  const key = `trust.${grade}`;
  const txt = t(key);
  const label = txt === key ? FALLBACK_LABEL[grade] : txt;

  const letter = grade === FactoryTrustGrade.UNRATED ? "—" : grade;
  const dims =
    size === "lg"
      ? "h-16 w-16 text-3xl"
      : size === "md"
        ? "h-12 w-12 text-2xl"
        : "h-9 w-9 text-base";

  return (
    <div
      className={cn("flex flex-col items-center gap-0.5", className)}
      title={
        typeof score === "number"
          ? `${label} · ${score.toFixed(1)}/100`
          : label
      }
    >
      <div
        className={cn(
          "grid place-items-center rounded-xl font-black ring-1 ring-inset",
          dims,
          GRADE_CLASSES[grade],
        )}
      >
        {letter}
      </div>
      {typeof score === "number" && grade !== FactoryTrustGrade.UNRATED ? (
        <span className="font-mono text-[10px] text-muted-foreground" dir="ltr">
          {score.toFixed(1)}
        </span>
      ) : null}
    </div>
  );
}
