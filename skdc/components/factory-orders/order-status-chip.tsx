"use client";

import * as React from "react";
import { FactoryOrderStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n-provider";

const STATUS_CLASSES: Record<FactoryOrderStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground ring-1 ring-inset ring-muted-foreground/20",
  SUBMITTED: "bg-sky-500/15 text-sky-300 ring-1 ring-inset ring-sky-400/30",
  ACKNOWLEDGED:
    "bg-violet-500/15 text-violet-300 ring-1 ring-inset ring-violet-400/30",
  QUOTED: "bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-400/30",
  ACCEPTED:
    "bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-400/30",
  IN_PRODUCTION:
    "bg-blue-500/15 text-blue-300 ring-1 ring-inset ring-blue-400/30",
  QC_PASSED: "bg-teal-500/15 text-teal-300 ring-1 ring-inset ring-teal-400/30",
  READY_TO_SHIP:
    "bg-cyan-500/15 text-cyan-300 ring-1 ring-inset ring-cyan-400/30",
  SHIPPED: "bg-indigo-500/15 text-indigo-300 ring-1 ring-inset ring-indigo-400/30",
  COMPLETED:
    "bg-emerald-600/20 text-emerald-200 ring-1 ring-inset ring-emerald-400/40",
  CANCELLED: "bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-400/30",
  DISPUTED:
    "bg-orange-500/15 text-orange-300 ring-1 ring-inset ring-orange-400/30",
};

const FALLBACK_LABEL: Record<FactoryOrderStatus, string> = {
  DRAFT: "مسودة",
  SUBMITTED: "مُرسل",
  ACKNOWLEDGED: "وصل المصنع",
  QUOTED: "تسعير",
  ACCEPTED: "مقبول",
  IN_PRODUCTION: "قيد التصنيع",
  QC_PASSED: "اجتاز الفحص",
  READY_TO_SHIP: "جاهز للشحن",
  SHIPPED: "تم الشحن",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغى",
  DISPUTED: "نزاع",
};

export function OrderStatusChip({
  status,
  className,
}: {
  status: FactoryOrderStatus;
  className?: string;
}) {
  const { t } = useI18n();
  const key = `factoryOrder.status.${status}`;
  const txt = t(key);
  const label = txt === key ? FALLBACK_LABEL[status] : txt;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
        STATUS_CLASSES[status],
        className,
      )}
    >
      {label}
    </span>
  );
}
