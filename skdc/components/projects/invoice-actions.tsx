"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, Receipt, Plus, Trash2, ArrowLeft } from "lucide-react";
import type { Invoice } from "@prisma/client";
import { generateInvoiceForProject, deleteInvoice } from "@/lib/actions/invoices";
import { useI18n } from "@/components/i18n-provider";

export function InvoiceActions({
  projectId,
  invoices,
}: {
  projectId: string;
  invoices: Invoice[];
}) {
  const { t } = useI18n();
  const [isPending, startTransition] = React.useTransition();
  const [pendingDelete, setPendingDelete] = React.useState<string | null>(null);

  const onGenerate = () => {
    startTransition(async () => {
      try {
        const invoice = await generateInvoiceForProject(projectId);
        toast.success(
          t("invoice.toasts.created").replace("{number}", invoice.number),
        );
      } catch (err) {
        const msg = (err as Error).message;
        if (msg === "DESIGN_HAS_NO_UNITS") {
          toast.error(t("invoice.errors.noUnits"));
        } else {
          toast.error(msg || t("invoice.toasts.createFailed"));
        }
      }
    });
  };

  const onDelete = (id: string, number: string) => {
    if (!confirm(t("invoice.confirm.delete").replace("{number}", number))) return;
    setPendingDelete(id);
    startTransition(async () => {
      try {
        await deleteInvoice(id);
        toast.success(t("invoice.toasts.deleted"));
      } catch (err) {
        toast.error((err as Error).message || t("toast.deleteFailed"));
      } finally {
        setPendingDelete(null);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gradient">
            {t("invoice.section.title")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t("invoice.section.subtitle")}
          </p>
        </div>
        <motion.button
          type="button"
          onClick={onGenerate}
          disabled={isPending}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 px-4 py-2 text-sm font-semibold text-background shadow-md disabled:opacity-60"
        >
          {isPending && !pendingDelete ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {isPending && !pendingDelete
            ? t("invoice.actions.autoGenerating")
            : t("invoice.actions.new")}
        </motion.button>
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white/[0.02] px-6 py-8 text-center text-sm text-muted-foreground">
          <Receipt className="mx-auto mb-2 h-8 w-8 opacity-50" />
          {t("invoice.empty")}
        </div>
      ) : (
        <div className="space-y-2">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="glass flex items-center justify-between gap-3 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-emerald-400/80 to-teal-500/80">
                  <Receipt className="h-5 w-5 text-background" />
                </div>
                <div>
                  <div className="font-mono text-sm font-semibold">{inv.number}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(inv.createdAt).toLocaleDateString("ar-SA")}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-left">
                  <div className="font-mono text-lg font-bold">
                    {inv.total.toFixed(2)}{" "}
                    <span className="text-xs">{t("invoice.currency.sar")}</span>
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {inv.status}
                  </div>
                </div>
                <Link
                  href={`/dashboard/invoices/${inv.id}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"
                >
                  {t("invoice.actions.viewPrint")}
                  <ArrowLeft className="h-3 w-3" />
                </Link>
                <button
                  type="button"
                  onClick={() => onDelete(inv.id, inv.number)}
                  disabled={pendingDelete === inv.id}
                  aria-label={t("a11y.delete")}
                  className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
