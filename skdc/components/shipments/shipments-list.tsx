"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Ship,
  Trash2,
  Pencil,
  ArrowRight,
  Container,
  Package,
  Calendar,
} from "lucide-react";
import type { Shipment } from "@prisma/client";
import { ShipmentStatus } from "@prisma/client";
import { ShipmentFormDialog } from "./shipment-form-dialog";
import { EmptyState } from "@/components/dashboard/empty-state";
import { deleteShipment } from "@/lib/actions/shipments";
import { useI18n } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";

export type ShipmentRow = Shipment & {
  _count: { items: number };
};

/**
 * Tailwind classnames per status. Kept as a static map so JIT picks them up
 * (dynamic class strings get purged).
 */
const STATUS_CLASSES: Record<ShipmentStatus, string> = {
  PLANNED:
    "bg-muted text-muted-foreground ring-1 ring-inset ring-muted-foreground/20",
  IN_PRODUCTION:
    "bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-400/30",
  READY_TO_SHIP:
    "bg-cyan-500/15 text-cyan-300 ring-1 ring-inset ring-cyan-400/30",
  IN_TRANSIT:
    "bg-blue-500/15 text-blue-300 ring-1 ring-inset ring-blue-400/30",
  AT_CUSTOMS:
    "bg-violet-500/15 text-violet-300 ring-1 ring-inset ring-violet-400/30",
  DELIVERED:
    "bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-400/30",
  CANCELLED:
    "bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-400/30",
};

const STATUS_KEYS: Record<ShipmentStatus, string> = {
  PLANNED: "shipment.status.PLANNED",
  IN_PRODUCTION: "shipment.status.IN_PRODUCTION",
  READY_TO_SHIP: "shipment.status.READY_TO_SHIP",
  IN_TRANSIT: "shipment.status.IN_TRANSIT",
  AT_CUSTOMS: "shipment.status.AT_CUSTOMS",
  DELIVERED: "shipment.status.DELIVERED",
  CANCELLED: "shipment.status.CANCELLED",
};

const MODE_KEYS = {
  SEA_FCL: "shipment.mode.SEA_FCL",
  SEA_LCL: "shipment.mode.SEA_LCL",
  AIR: "shipment.mode.AIR",
  ROAD: "shipment.mode.ROAD",
} as const;

export function ShipmentsList({ shipments }: { shipments: ShipmentRow[] }) {
  const { t, locale } = useI18n();
  const [isPending, startTransition] = React.useTransition();
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const dateFmt = React.useMemo(
    () =>
      new Intl.DateTimeFormat(
        locale === "ar" ? "ar-SA" : locale === "zh" ? "zh-CN" : "en-US",
        { year: "numeric", month: "short", day: "numeric" },
      ),
    [locale],
  );

  if (shipments.length === 0) {
    return (
      <ShipmentFormDialog
        trigger={
          <div>
            <EmptyState
              icon={Ship}
              titleKey="empty.shipments.title"
              descriptionKey="empty.shipments.description"
              ctaLabelKey="empty.shipments.cta"
              onCta={() => {}}
            />
          </div>
        }
      />
    );
  }

  const onDelete = (id: string, reference: string) => {
    if (!confirm(t("common.deleteConfirm").replace("{name}", reference))) {
      return;
    }
    setPendingId(id);
    startTransition(async () => {
      try {
        await deleteShipment(id);
        toast.success(t("toast.shipment.deleted"));
      } catch (err) {
        toast.error((err as Error).message || t("toast.deleteFailed"));
      } finally {
        setPendingId(null);
      }
    });
  };

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {shipments.map((shipment, i) => {
        const eta = shipment.estimatedArrival ?? shipment.actualArrival;
        return (
          <motion.div
            key={shipment.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.4) }}
            className="glass group relative flex flex-col overflow-hidden rounded-2xl border border-border p-5 transition-colors hover:border-violet-400/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[var(--theme-stop-1,#a78bfa)] to-[var(--theme-stop-3,#38bdf8)] text-background">
                  <Container className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <Link
                    href={`/dashboard/shipments/${shipment.id}`}
                    className="block truncate font-semibold transition-colors hover:text-violet-200"
                    dir="ltr"
                  >
                    {shipment.reference}
                  </Link>
                  <div className="truncate text-xs text-muted-foreground">
                    {t(MODE_KEYS[shipment.mode])}
                    {shipment.carrier ? ` · ${shipment.carrier}` : ""}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <ShipmentFormDialog
                  shipment={{
                    id: shipment.id,
                    reference: shipment.reference,
                    mode: shipment.mode,
                    carrier: shipment.carrier,
                    trackingNumber: shipment.trackingNumber,
                    containerNumber: shipment.containerNumber,
                    originFactory: shipment.originFactory,
                    originCity: shipment.originCity,
                    destPort: shipment.destPort,
                    destCity: shipment.destCity,
                    estimatedDeparture: shipment.estimatedDeparture,
                    estimatedArrival: shipment.estimatedArrival,
                    totalValue: shipment.totalValue,
                    shippingCost: shipment.shippingCost,
                    customsDuty: shipment.customsDuty,
                    currency: shipment.currency,
                    notes: shipment.notes,
                  }}
                  trigger={
                    <button
                      type="button"
                      aria-label={t("a11y.edit")}
                      className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  }
                />
                <button
                  type="button"
                  aria-label={t("a11y.delete")}
                  disabled={isPending && pendingId === shipment.id}
                  onClick={() => onDelete(shipment.id, shipment.reference)}
                  className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-3">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                  STATUS_CLASSES[shipment.status],
                )}
              >
                {t(STATUS_KEYS[shipment.status])}
              </span>
            </div>

            <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="truncate" dir="ltr">
                  {shipment.originCity ?? shipment.originCountry}
                </span>
                <ArrowRight className="h-3 w-3 shrink-0" />
                <span className="truncate" dir="ltr">
                  {shipment.destCity ?? shipment.destPort ?? shipment.destCountry}
                </span>
              </div>
              {eta ? (
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span dir="ltr">{dateFmt.format(new Date(eta))}</span>
                </div>
              ) : null}
              <div className="flex items-center gap-2">
                <Package className="h-3 w-3" />
                <span>{shipment._count.items}</span>
              </div>
            </div>

            <div className="mt-4">
              <Link
                href={`/dashboard/shipments/${shipment.id}`}
                className="inline-flex items-center gap-1 text-xs font-medium text-violet-200 transition-colors hover:text-violet-100"
              >
                {t("common.open")}
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
