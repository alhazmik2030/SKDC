"use client";

import * as React from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, ArrowRight } from "lucide-react";
import { ShipmentStatus } from "@prisma/client";
import { updateShipmentStatus } from "@/lib/actions/shipments";
import { useI18n } from "@/components/i18n-provider";

const NEXT_STATUS: Partial<Record<ShipmentStatus, ShipmentStatus>> = {
  [ShipmentStatus.PLANNED]: ShipmentStatus.IN_PRODUCTION,
  [ShipmentStatus.IN_PRODUCTION]: ShipmentStatus.READY_TO_SHIP,
  [ShipmentStatus.READY_TO_SHIP]: ShipmentStatus.IN_TRANSIT,
  [ShipmentStatus.IN_TRANSIT]: ShipmentStatus.AT_CUSTOMS,
  [ShipmentStatus.AT_CUSTOMS]: ShipmentStatus.DELIVERED,
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

export interface ShipmentStatusButtonProps {
  shipmentId: string;
  status: ShipmentStatus;
}

export function ShipmentStatusButton({
  shipmentId,
  status,
}: ShipmentStatusButtonProps) {
  const { t } = useI18n();
  const [isPending, startTransition] = React.useTransition();

  const next = NEXT_STATUS[status];
  if (!next) return null;

  const onClick = () => {
    const msg = t("shipment.status.advanceConfirm")
      .replace("{from}", t(STATUS_KEYS[status]))
      .replace("{to}", t(STATUS_KEYS[next]));
    if (!confirm(msg)) return;

    startTransition(async () => {
      try {
        await updateShipmentStatus(shipmentId, next);
        toast.success(t("toast.shipment.statusUpdated"));
      } catch (err) {
        toast.error((err as Error).message || t("common.unexpectedError"));
      }
    });
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={isPending}
      whileTap={{ scale: 0.97 }}
      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-[var(--theme-stop-1,#a78bfa)] to-[var(--theme-stop-3,#38bdf8)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-opacity disabled:opacity-60"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ArrowRight className="h-4 w-4" />
      )}
      {t("shipment.status.advance")}: {t(STATUS_KEYS[next])}
    </motion.button>
  );
}
