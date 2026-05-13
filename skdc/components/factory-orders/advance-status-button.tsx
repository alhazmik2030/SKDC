"use client";

import * as React from "react";
import { toast } from "sonner";
import { ChevronRight, Loader2, Ship } from "lucide-react";
import { FactoryOrderStatus } from "@prisma/client";
import {
  acceptQuote,
  markShipped,
  recordStatus,
  recordQuote,
  cancelOrder,
} from "@/lib/actions/factory-orders";
import { useI18n } from "@/components/i18n-provider";

/**
 * Decides which status comes next given the current one. Returns null for
 * terminal states (COMPLETED / CANCELLED / DISPUTED).
 */
function nextStatus(current: FactoryOrderStatus): FactoryOrderStatus | null {
  switch (current) {
    case FactoryOrderStatus.SUBMITTED:
      return FactoryOrderStatus.ACKNOWLEDGED;
    case FactoryOrderStatus.ACKNOWLEDGED:
      return FactoryOrderStatus.QUOTED;
    case FactoryOrderStatus.QUOTED:
      return FactoryOrderStatus.ACCEPTED;
    case FactoryOrderStatus.ACCEPTED:
      return FactoryOrderStatus.IN_PRODUCTION;
    case FactoryOrderStatus.IN_PRODUCTION:
      return FactoryOrderStatus.QC_PASSED;
    case FactoryOrderStatus.QC_PASSED:
      return FactoryOrderStatus.READY_TO_SHIP;
    case FactoryOrderStatus.READY_TO_SHIP:
      return FactoryOrderStatus.SHIPPED;
    case FactoryOrderStatus.SHIPPED:
      return FactoryOrderStatus.COMPLETED;
    default:
      return null;
  }
}

export function AdvanceStatusButton({
  orderId,
  status,
}: {
  orderId: string;
  status: FactoryOrderStatus;
}) {
  const { t } = useI18n();
  const [isPending, startTransition] = React.useTransition();
  const next = nextStatus(status);

  const onAdvance = () => {
    if (!next) return;
    const noteLabel = t("factoryOrder.event.advancePrompt");
    const note = prompt(noteLabel) ?? undefined;

    startTransition(async () => {
      try {
        if (next === FactoryOrderStatus.QUOTED) {
          // Capture the quote amount inline so we don't ship a half-recorded state.
          const amountStr = prompt(t("factoryOrder.event.quotePrompt"));
          if (!amountStr) return;
          const amount = Number(amountStr);
          if (!Number.isFinite(amount) || amount < 0) {
            toast.error(t("common.invalidNumber"));
            return;
          }
          await recordQuote(orderId, { amount, currency: "USD", note });
        } else if (next === FactoryOrderStatus.ACCEPTED) {
          await acceptQuote(orderId, { note });
        } else if (next === FactoryOrderStatus.SHIPPED) {
          await markShipped(orderId, null, { note });
        } else {
          await recordStatus(orderId, next, { note });
        }
        toast.success(t("toast.factoryOrder.advanced"));
      } catch (err) {
        toast.error((err as Error).message || t("common.unexpectedError"));
      }
    });
  };

  const onCancel = () => {
    const reason = prompt(t("factoryOrder.event.cancelPrompt"));
    if (!reason) return;
    startTransition(async () => {
      try {
        await cancelOrder(orderId, { reason });
        toast.success(t("toast.factoryOrder.cancelled"));
      } catch (err) {
        toast.error((err as Error).message || t("common.unexpectedError"));
      }
    });
  };

  const onShip = () => {
    const note = prompt(t("factoryOrder.event.shipNotePrompt")) ?? undefined;
    startTransition(async () => {
      try {
        const res = await markShipped(orderId, null, { note });
        toast.success(
          t("toast.factoryOrder.shippedLinked").replace(
            "{id}",
            res.shipmentId ?? "",
          ),
        );
      } catch (err) {
        toast.error((err as Error).message || t("common.unexpectedError"));
      }
    });
  };

  const terminal =
    status === FactoryOrderStatus.COMPLETED ||
    status === FactoryOrderStatus.CANCELLED ||
    status === FactoryOrderStatus.DISPUTED;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {next ? (
        <button
          type="button"
          onClick={onAdvance}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[var(--theme-stop-1,#a78bfa)] to-[var(--theme-stop-3,#38bdf8)] px-4 py-2 text-sm font-semibold text-background shadow-md transition-opacity disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          )}
          {t("factoryOrder.action.advance")}
        </button>
      ) : null}

      {status === FactoryOrderStatus.READY_TO_SHIP ||
      status === FactoryOrderStatus.QC_PASSED ? (
        <button
          type="button"
          onClick={onShip}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition-colors hover:bg-cyan-500/20 disabled:opacity-60"
        >
          <Ship className="h-4 w-4" />
          {t("factoryOrder.action.markShipped")}
        </button>
      ) : null}

      {!terminal ? (
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-200 transition-colors hover:bg-rose-500/20 disabled:opacity-60"
        >
          {t("factoryOrder.action.cancel")}
        </button>
      ) : null}
    </div>
  );
}
