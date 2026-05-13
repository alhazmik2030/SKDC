"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { ShipmentStatus } from "@prisma/client";
import { useI18n } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";

// The vertical order of statuses for the timeline. CANCELLED is shown
// separately if it's the active status (it doesn't belong on the happy path).
const FLOW: ShipmentStatus[] = [
  ShipmentStatus.PLANNED,
  ShipmentStatus.IN_PRODUCTION,
  ShipmentStatus.READY_TO_SHIP,
  ShipmentStatus.IN_TRANSIT,
  ShipmentStatus.AT_CUSTOMS,
  ShipmentStatus.DELIVERED,
];

const STATUS_KEYS: Record<ShipmentStatus, string> = {
  PLANNED: "shipment.status.PLANNED",
  IN_PRODUCTION: "shipment.status.IN_PRODUCTION",
  READY_TO_SHIP: "shipment.status.READY_TO_SHIP",
  IN_TRANSIT: "shipment.status.IN_TRANSIT",
  AT_CUSTOMS: "shipment.status.AT_CUSTOMS",
  DELIVERED: "shipment.status.DELIVERED",
  CANCELLED: "shipment.status.CANCELLED",
};

export interface ShipmentStatusTimelineProps {
  status: ShipmentStatus;
  estimatedDeparture: Date | null;
  actualDeparture: Date | null;
  estimatedArrival: Date | null;
  actualArrival: Date | null;
}

export function ShipmentStatusTimeline({
  status,
  estimatedDeparture,
  actualDeparture,
  estimatedArrival,
  actualArrival,
}: ShipmentStatusTimelineProps) {
  const { t, locale } = useI18n();
  const dateFmt = React.useMemo(
    () =>
      new Intl.DateTimeFormat(
        locale === "ar" ? "ar-SA" : locale === "zh" ? "zh-CN" : "en-US",
        { year: "numeric", month: "short", day: "numeric" },
      ),
    [locale],
  );

  if (status === ShipmentStatus.CANCELLED) {
    return (
      <div className="rounded-xl bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-200 ring-1 ring-inset ring-rose-400/30">
        {t("shipment.status.CANCELLED")}
      </div>
    );
  }

  const currentIdx = FLOW.indexOf(status);

  return (
    <ol className="relative space-y-5">
      {FLOW.map((s, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        const upcoming = idx > currentIdx;

        const dateForStep =
          s === ShipmentStatus.IN_TRANSIT
            ? actualDeparture ?? estimatedDeparture
            : s === ShipmentStatus.DELIVERED
              ? actualArrival ?? estimatedArrival
              : null;

        return (
          <li key={s} className="relative flex items-start gap-3">
            {/* Connector */}
            {idx < FLOW.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "absolute top-7 h-[calc(100%-0.25rem)] w-px",
                  // RTL puts the dot on the right; LTR on the left.
                  "ltr:left-3 rtl:right-3",
                  done
                    ? "bg-gradient-to-b from-violet-400/60 to-fuchsia-400/40"
                    : "bg-border",
                )}
              />
            ) : null}

            <motion.span
              initial={false}
              animate={{ scale: active ? 1.1 : 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className={cn(
                "relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold",
                done && "bg-violet-500/90 text-white shadow-lg shadow-violet-500/30",
                active &&
                  "bg-gradient-to-br from-[var(--theme-stop-1,#a78bfa)] to-[var(--theme-stop-3,#38bdf8)] text-white shadow-lg shadow-violet-500/40 ring-2 ring-violet-300/40 ring-offset-2 ring-offset-background",
                upcoming &&
                  "border border-border bg-muted/40 text-muted-foreground",
              )}
            >
              {done ? <Check className="h-3 w-3" /> : idx + 1}
            </motion.span>

            <div className="min-w-0 pt-0.5">
              <div
                className={cn(
                  "text-sm font-medium",
                  upcoming && "text-muted-foreground",
                )}
              >
                {t(STATUS_KEYS[s])}
              </div>
              {dateForStep ? (
                <div className="mt-0.5 text-xs text-muted-foreground" dir="ltr">
                  {dateFmt.format(new Date(dateForStep))}
                </div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
