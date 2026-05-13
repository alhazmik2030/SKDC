"use client";

import * as React from "react";
import {
  CheckCircle2,
  Clock,
  ShieldOff,
  ShieldQuestion,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { FactoryVerificationStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n-provider";

type StatusMeta = {
  classes: string;
  icon: LucideIcon;
  fallback: string;
};

const STATUS_META: Record<FactoryVerificationStatus, StatusMeta> = {
  UNVERIFIED: {
    classes: "bg-muted text-muted-foreground ring-1 ring-inset ring-muted-foreground/20",
    icon: ShieldQuestion,
    fallback: "غير موثق",
  },
  PENDING: {
    classes: "bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-400/30",
    icon: Clock,
    fallback: "قيد المراجعة",
  },
  VERIFIED: {
    classes:
      "bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-400/30",
    icon: CheckCircle2,
    fallback: "موثّق",
  },
  REJECTED: {
    classes: "bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-400/30",
    icon: XCircle,
    fallback: "مرفوض",
  },
  SUSPENDED: {
    classes: "bg-slate-500/15 text-slate-300 ring-1 ring-inset ring-slate-400/30",
    icon: ShieldOff,
    fallback: "موقوف",
  },
};

export function VerificationBadge({
  status,
  className,
  size = "sm",
}: {
  status: FactoryVerificationStatus;
  className?: string;
  size?: "sm" | "md";
}) {
  const { t } = useI18n();
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  const key = `verification.${status}`;
  const text = t(key);
  // useI18n returns the key itself if it's missing — fall back to Arabic.
  const label = text === key ? meta.fallback : text;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        size === "md" ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-[11px]",
        meta.classes,
        className,
      )}
    >
      <Icon className={cn(size === "md" ? "h-3.5 w-3.5" : "h-3 w-3")} />
      {label}
    </span>
  );
}
