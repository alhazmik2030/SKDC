"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Clock,
  Globe2,
  Package,
  Pencil,
  Trash2,
} from "lucide-react";
import type { Factory } from "@prisma/client";
import { FactoryVerificationStatus } from "@prisma/client";
import { FactoryFormDialog } from "./factory-form-dialog";
import { VerificationBadge } from "./verification-badge";
import { TrustGrade } from "./trust-grade";
import { EmptyState } from "@/components/dashboard/empty-state";
import { deleteFactory } from "@/lib/actions/factories";
import { useI18n } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";

export type FactoryRow = Factory & {
  _count: { orders: number; documents: number };
};

type TabValue = "all" | "verified" | "pending" | "suspended";

const TAB_FILTERS: Record<TabValue, (f: FactoryRow) => boolean> = {
  all: () => true,
  verified: (f) =>
    f.verificationStatus === FactoryVerificationStatus.VERIFIED,
  pending: (f) =>
    f.verificationStatus === FactoryVerificationStatus.PENDING ||
    f.verificationStatus === FactoryVerificationStatus.UNVERIFIED,
  suspended: (f) =>
    f.verificationStatus === FactoryVerificationStatus.SUSPENDED ||
    f.verificationStatus === FactoryVerificationStatus.REJECTED,
};

const COUNTRY_FLAG: Record<string, string> = {
  CN: "🇨🇳",
  SA: "🇸🇦",
  TR: "🇹🇷",
  IT: "🇮🇹",
  DE: "🇩🇪",
  EG: "🇪🇬",
  AE: "🇦🇪",
};

export function FactoriesList({ factories }: { factories: FactoryRow[] }) {
  const { t, locale } = useI18n();
  const [tab, setTab] = React.useState<TabValue>("all");
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

  if (factories.length === 0) {
    return (
      <FactoryFormDialog
        trigger={
          <div>
            <EmptyState
              icon={Building2}
              titleKey="empty.factories.title"
              descriptionKey="empty.factories.description"
              ctaLabelKey="empty.factories.cta"
              onCta={() => {}}
            />
          </div>
        }
      />
    );
  }

  const filtered = factories.filter(TAB_FILTERS[tab]);

  const onDelete = (id: string, name: string) => {
    if (!confirm(t("common.deleteConfirm").replace("{name}", name))) return;
    setPendingId(id);
    startTransition(async () => {
      try {
        await deleteFactory(id);
        toast.success(t("toast.factory.deleted"));
      } catch (err) {
        toast.error((err as Error).message || t("toast.deleteFailed"));
      } finally {
        setPendingId(null);
      }
    });
  };

  return (
    <div>
      {/* ===== Tabs ===== */}
      <div className="mb-6 inline-flex rounded-2xl bg-white/[0.03] p-1 ring-1 ring-inset ring-border">
        {(
          [
            { v: "all" as const, k: "factory.tabs.all" },
            { v: "verified" as const, k: "factory.tabs.verified" },
            { v: "pending" as const, k: "factory.tabs.pending" },
            { v: "suspended" as const, k: "factory.tabs.suspended" },
          ]
        ).map((it) => (
          <button
            key={it.v}
            type="button"
            onClick={() => setTab(it.v)}
            className={cn(
              "rounded-xl px-3 py-1.5 text-xs font-medium transition-colors",
              tab === it.v
                ? "bg-gradient-to-br from-[var(--theme-stop-1,#a78bfa)] to-[var(--theme-stop-3,#38bdf8)] text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t(it.k)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {t("factory.empty.filter")}
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.4) }}
              className="glass group relative flex flex-col overflow-hidden rounded-2xl border border-border p-5 transition-colors hover:border-violet-400/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[var(--theme-stop-1,#a78bfa)] to-[var(--theme-stop-3,#38bdf8)] text-lg">
                    {COUNTRY_FLAG[f.country] ?? "🏭"}
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/factories/${f.id}`}
                      className="block truncate font-semibold transition-colors hover:text-violet-200"
                    >
                      {f.name}
                    </Link>
                    {f.nameLocal ? (
                      <div className="truncate text-xs text-muted-foreground">
                        {f.nameLocal}
                      </div>
                    ) : null}
                  </div>
                </div>

                <TrustGrade
                  grade={f.trustGrade}
                  score={f.trustScore}
                  size="sm"
                />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <VerificationBadge status={f.verificationStatus} />
                {f.city ? (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Globe2 className="h-3 w-3" />
                    <span dir="ltr">
                      {f.city}
                      {f.country ? `, ${f.country}` : ""}
                    </span>
                  </span>
                ) : null}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <Metric
                  icon={Clock}
                  label={t("factory.metric.leadTime")}
                  value={f.leadTimeDays ? `${f.leadTimeDays} ${t("common.days")}` : "—"}
                />
                <Metric
                  icon={Package}
                  label={t("factory.metric.totalOrders")}
                  value={String(f._count.orders)}
                />
                <Metric
                  icon={Building2}
                  label={t("factory.metric.documents")}
                  value={String(f._count.documents)}
                />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground" dir="ltr">
                  {dateFmt.format(new Date(f.createdAt))}
                </span>
                <div className="flex items-center gap-1">
                  <FactoryFormDialog
                    factory={{
                      id: f.id,
                      name: f.name,
                      nameLocal: f.nameLocal,
                      legalName: f.legalName,
                      taxId: f.taxId,
                      contactName: f.contactName,
                      contactNameLocal: f.contactNameLocal,
                      contactPhone: f.contactPhone,
                      contactEmail: f.contactEmail,
                      wechatId: f.wechatId,
                      whatsappNumber: f.whatsappNumber,
                      city: f.city,
                      province: f.province,
                      country: f.country,
                      addressLine: f.addressLine,
                      preferredFormat: f.preferredFormat,
                      channel: f.channel,
                      endpoint: f.endpoint,
                      leadTimeDays: f.leadTimeDays,
                      paymentTerms: f.paymentTerms,
                      notes: f.notes,
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
                    disabled={isPending && pendingId === f.id}
                    onClick={() => onDelete(f.id, f.name)}
                    className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <Link
                    href={`/dashboard/factories/${f.id}`}
                    className="grid h-7 w-7 place-items-center rounded-lg text-violet-200 transition-colors hover:bg-white/5"
                    aria-label={t("common.open")}
                  >
                    <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white/[0.02] p-2 text-center">
      <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-0.5 font-mono text-xs font-semibold">{value}</div>
    </div>
  );
}
