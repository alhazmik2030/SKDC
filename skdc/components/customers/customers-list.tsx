"use client";

import * as React from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Trash2, Pencil, Users } from "lucide-react";
import type { Customer } from "@prisma/client";
import { CustomerFormDialog } from "./customer-form-dialog";
import { EmptyState } from "@/components/dashboard/empty-state";
import { deleteCustomer } from "@/lib/actions/customers";
import { useI18n } from "@/components/i18n-provider";

export function CustomersList({ customers }: { customers: Customer[] }) {
  const { t } = useI18n();
  const [isPending, startTransition] = React.useTransition();
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  if (customers.length === 0) {
    return (
      <CustomerFormDialog
        trigger={
          <div>
            <EmptyState
              icon={Users}
              titleKey="empty.customers.title"
              descriptionKey="empty.customers.description"
              ctaLabelKey="empty.customers.cta"
              onCta={() => {}}
            />
          </div>
        }
      />
    );
  }

  const onDelete = (id: string, name: string) => {
    if (!confirm(t("common.deleteConfirm").replace("{name}", name))) return;
    setPendingId(id);
    startTransition(async () => {
      try {
        await deleteCustomer(id);
        toast.success(t("toast.customer.deleted"));
      } catch (err) {
        toast.error((err as Error).message || t("toast.deleteFailed"));
      } finally {
        setPendingId(null);
      }
    });
  };

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {customers.map((customer, i) => (
        <motion.div
          key={customer.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.4) }}
          className="glass group relative overflow-hidden rounded-2xl border border-border p-5 transition-colors hover:border-violet-400/40"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[var(--theme-stop-1,#a78bfa)] to-[var(--theme-stop-3,#38bdf8)] font-bold text-background">
                {customer.name.charAt(0)}
              </div>
              <div>
                <div className="font-semibold">{customer.name}</div>
                {customer.email ? (
                  <div className="text-xs text-muted-foreground">{customer.email}</div>
                ) : null}
              </div>
            </div>
            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <CustomerFormDialog
                customer={{
                  id: customer.id,
                  name: customer.name,
                  phone: customer.phone,
                  email: customer.email,
                  address: customer.address,
                  notes: customer.notes,
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
                disabled={isPending && pendingId === customer.id}
                onClick={() => onDelete(customer.id, customer.name)}
                className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
            {customer.phone ? (
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3" />
                <span dir="ltr">{customer.phone}</span>
              </div>
            ) : null}
            {customer.email ? (
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3" />
                <span dir="ltr" className="truncate">
                  {customer.email}
                </span>
              </div>
            ) : null}
            {customer.address ? (
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{customer.address}</span>
              </div>
            ) : null}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
