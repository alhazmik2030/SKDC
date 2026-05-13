"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";

export interface CopyTextProps {
  value: string;
  className?: string;
}

/**
 * Small inline "copyable" chip. Used for tracking number / container number.
 * Clipboard API is async; we use a 1.4s success flash without state libraries.
 */
export function CopyText({ value, className }: CopyTextProps) {
  const { t } = useI18n();
  const [copied, setCopied] = React.useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — silent no-op.
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={t("common.copy")}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-muted/30 px-2 py-1 font-mono text-xs transition-colors hover:bg-muted/60",
        className,
      )}
    >
      <span dir="ltr" className="truncate">
        {value}
      </span>
      {copied ? (
        <Check className="h-3 w-3 shrink-0 text-emerald-300" />
      ) : (
        <Copy className="h-3 w-3 shrink-0 text-muted-foreground" />
      )}
    </button>
  );
}
