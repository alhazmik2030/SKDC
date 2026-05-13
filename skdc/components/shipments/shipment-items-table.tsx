"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Trash2, Package } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import { removeItemFromShipment } from "@/lib/actions/shipments";

export interface ShipmentItemRow {
  id: string;
  description: string;
  qty: number;
  unitValue: number | null;
  weightKg: number | null;
  volumeM3: number | null;
  project: { id: string; name: string } | null;
  customer: { id: string; name: string } | null;
}

export interface ShipmentItemsTableProps {
  items: ShipmentItemRow[];
  currency: string;
}

export function ShipmentItemsTable({
  items,
  currency,
}: ShipmentItemsTableProps) {
  const { t, locale } = useI18n();
  const [isPending, startTransition] = React.useTransition();
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const numberFmt = React.useMemo(
    () =>
      new Intl.NumberFormat(
        locale === "ar" ? "ar-SA" : locale === "zh" ? "zh-CN" : "en-US",
      ),
    [locale],
  );

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/20 px-6 py-10 text-center">
        <Package className="h-5 w-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {t("shipment.items.empty")}
        </p>
      </div>
    );
  }

  const onDelete = (id: string, description: string) => {
    if (!confirm(t("common.deleteConfirm").replace("{name}", description))) {
      return;
    }
    setPendingId(id);
    startTransition(async () => {
      try {
        await removeItemFromShipment(id);
        toast.success(t("toast.shipmentItem.removed"));
      } catch (err) {
        toast.error((err as Error).message || t("toast.deleteFailed"));
      } finally {
        setPendingId(null);
      }
    });
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-border/60">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-start font-medium">
              {t("form.shipmentItem.descriptionLabel")}
            </th>
            <th className="px-3 py-2 text-start font-medium">
              {t("form.shipmentItem.customer")}
            </th>
            <th className="px-3 py-2 text-start font-medium">
              {t("form.shipmentItem.project")}
            </th>
            <th className="px-3 py-2 text-end font-medium">
              {t("form.shipmentItem.qty")}
            </th>
            <th className="px-3 py-2 text-end font-medium">
              {t("form.shipmentItem.unitValue")} ({currency})
            </th>
            <th className="w-10 px-3 py-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {items.map((item) => (
            <tr key={item.id} className="transition-colors hover:bg-muted/20">
              <td className="px-3 py-2">
                <div className="font-medium">{item.description}</div>
              </td>
              <td className="px-3 py-2 text-muted-foreground">
                {item.customer ? item.customer.name : "—"}
              </td>
              <td className="px-3 py-2">
                {item.project ? (
                  <Link
                    href={`/dashboard/projects/${item.project.id}`}
                    className="text-violet-200 transition-colors hover:text-violet-100"
                  >
                    {item.project.name}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-3 py-2 text-end font-mono" dir="ltr">
                {numberFmt.format(item.qty)}
              </td>
              <td className="px-3 py-2 text-end font-mono" dir="ltr">
                {item.unitValue != null ? numberFmt.format(item.unitValue) : "—"}
              </td>
              <td className="px-3 py-2 text-end">
                <button
                  type="button"
                  aria-label={t("a11y.delete")}
                  disabled={isPending && pendingId === item.id}
                  onClick={() => onDelete(item.id, item.description)}
                  className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
