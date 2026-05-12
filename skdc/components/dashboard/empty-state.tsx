"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCta?: () => void;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  ctaHref,
  onCta,
  className,
}: EmptyStateProps) {
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
      {/* Aurora glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(167, 139, 250, 0.18), transparent 60%)",
        }}
      />

      {/* Icon */}
      <div className="relative mb-6">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 rounded-2xl opacity-60 blur-2xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(167, 139, 250, 0.6), rgba(56, 189, 248, 0.6))",
          }}
        />
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-sky-500 shadow-lg shadow-violet-500/30">
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>

      <h3 className="text-2xl font-bold tracking-tight text-gradient-aurora">
        {title}
      </h3>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>

      {(ctaLabel && ctaHref) || (ctaLabel && onCta) ? (
        <div className="mt-8">
          {ctaHref ? (
            <Link
              href={ctaHref}
              className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-white to-white/90 px-6 py-3 text-sm font-semibold text-background shadow-2xl shadow-violet-500/20 transition-transform hover:scale-[1.02]"
            >
              {ctaLabel}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onCta}
              className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-white to-white/90 px-6 py-3 text-sm font-semibold text-background shadow-2xl shadow-violet-500/20 transition-transform hover:scale-[1.02]"
            >
              {ctaLabel}
            </button>
          )}
        </div>
      ) : null}
    </motion.div>
  );
}
