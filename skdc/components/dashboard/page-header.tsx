"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  eyebrow,
  action,
  className,
}: PageHeaderProps) {
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
        {eyebrow ? (
          <div className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-violet-300">
            {eyebrow}
          </div>
        ) : null}
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          <span className="text-gradient">{title}</span>
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </motion.div>
  );
}
