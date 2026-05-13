"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n-provider";

type EmptyStateProps = {
  icon: LucideIcon;
  /** Either pass a literal string or an i18n key via *Key. */
  title?: string;
  titleKey?: string;
  description?: string;
  descriptionKey?: string;
  ctaLabel?: string;
  ctaLabelKey?: string;
  ctaHref?: string;
  onCta?: () => void;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  titleKey,
  description,
  descriptionKey,
  ctaLabel,
  ctaLabelKey,
  ctaHref,
  onCta,
  className,
}: EmptyStateProps) {
  const { t } = useI18n();
  const titleText = titleKey ? t(titleKey) : (title ?? "");
  const descriptionText = descriptionKey ? t(descriptionKey) : (description ?? "");
  const ctaText = ctaLabelKey ? t(ctaLabelKey) : ctaLabel;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "glass relative mx-auto flex max-w-2xl flex-col items-center overflow-hidden rounded-3xl px-8 py-16 text-center",
        className,
      )}
    >
      {/* Aurora ambient — driven by active theme. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, var(--theme-halo, rgba(167,139,250,0.18)), transparent 60%)",
        }}
      />

      {/* Icon */}
      <div className="relative mb-6">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 rounded-2xl opacity-60 blur-2xl"
          style={{
            background:
              "linear-gradient(135deg, var(--theme-stop-1,#a78bfa) 0%, var(--theme-stop-3,#38bdf8) 100%)",
          }}
        />
        <div
          className="grid h-16 w-16 place-items-center rounded-2xl text-white shadow-lg"
          style={{
            background:
              "linear-gradient(135deg, var(--theme-stop-1,#a78bfa) 0%, var(--theme-stop-3,#38bdf8) 100%)",
            boxShadow:
              "0 18px 40px -10px var(--theme-halo, rgba(167,139,250,0.35))",
          }}
        >
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>

      <h3 className="text-2xl font-bold tracking-tight text-gradient-aurora">
        {titleText}
      </h3>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        {descriptionText}
      </p>

      {ctaText && (ctaHref || onCta) ? (
        <div className="mt-8">
          {ctaHref ? (
            <Link
              href={ctaHref}
              className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-white to-white/90 px-6 py-3 text-sm font-semibold text-background shadow-2xl shadow-violet-500/20 transition-transform hover:scale-[1.02]"
            >
              {ctaText}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onCta}
              className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-white to-white/90 px-6 py-3 text-sm font-semibold text-background shadow-2xl shadow-violet-500/20 transition-transform hover:scale-[1.02]"
            >
              {ctaText}
            </button>
          )}
        </div>
      ) : null}
    </motion.div>
  );
}
