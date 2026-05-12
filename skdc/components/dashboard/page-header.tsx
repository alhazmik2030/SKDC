"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n-provider";

type PageHeaderProps = {
  /** Literal title — shown verbatim. Prefer titleKey for i18n. */
  title?: string;
  /** i18n key — looked up via t() so the title follows the active locale. */
  titleKey?: string;
  description?: string;
  descriptionKey?: string;
  eyebrow?: string;
  eyebrowKey?: string;
  action?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  titleKey,
  description,
  descriptionKey,
  eyebrow,
  eyebrowKey,
  action,
  className,
}: PageHeaderProps) {
  const { t } = useI18n();
  const titleText = titleKey ? t(titleKey) : (title ?? "");
  const descriptionText = descriptionKey ? t(descriptionKey) : description;
  const eyebrowText = eyebrowKey ? t(eyebrowKey) : eyebrow;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "flex flex-col items-start justify-between gap-4 pb-8 md:flex-row md:items-end",
        className,
      )}
    >
      <div>
        {eyebrowText ? (
          <div
            className="mb-2 font-mono text-xs uppercase tracking-[0.2em]"
            style={{ color: "var(--theme-stop-1, #c4b5fd)" }}
          >
            {eyebrowText}
          </div>
        ) : null}
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          <span className="text-gradient">{titleText}</span>
        </h1>
        {descriptionText ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {descriptionText}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </motion.div>
  );
}
