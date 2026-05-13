"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ExternalLink, Paperclip, User } from "lucide-react";
import type { FactoryOrderEvent } from "@prisma/client";
import { OrderStatusChip } from "./order-status-chip";
import { useI18n } from "@/components/i18n-provider";

type SnapshotItem = {
  description?: string;
  qty?: number;
  notes?: string | null;
};

export function OrderTimeline({ events }: { events: FactoryOrderEvent[] }) {
  const { t, locale } = useI18n();

  const dateFmt = React.useMemo(
    () =>
      new Intl.DateTimeFormat(
        locale === "ar" ? "ar-SA" : locale === "zh" ? "zh-CN" : "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        },
      ),
    [locale],
  );

  if (events.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
        {t("factoryOrder.timeline.empty")}
      </p>
    );
  }

  return (
    <ol className="relative space-y-5 ps-5">
      {/* Vertical rail */}
      <span
        aria-hidden
        className="absolute inset-y-1 start-2 w-px bg-border/60"
      />
      {events.map((event, i) => {
        const items = parseSnapshot(event.itemsSnapshot);
        return (
          <motion.li
            key={event.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.2) }}
            className="relative"
          >
            <span
              aria-hidden
              className="absolute start-[-22px] top-1.5 grid h-4 w-4 place-items-center rounded-full bg-gradient-to-br from-[var(--theme-stop-1,#a78bfa)] to-[var(--theme-stop-3,#38bdf8)] ring-4 ring-background"
            />
            <div className="glass rounded-2xl border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <OrderStatusChip status={event.status} />
                <time
                  className="font-mono text-[11px] text-muted-foreground"
                  dir="ltr"
                  dateTime={new Date(event.occurredAt).toISOString()}
                >
                  {dateFmt.format(new Date(event.occurredAt))}
                </time>
              </div>

              {event.actorLabel || event.actorUserId ? (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>
                    {event.actorLabel ??
                      (event.actorUserId ? t("factoryOrder.actor.user") : "—")}
                  </span>
                </div>
              ) : null}

              {event.note ? (
                <p className="mt-2 whitespace-pre-wrap text-sm">
                  {event.note}
                </p>
              ) : null}

              {items.length > 0 ? (
                <div className="mt-3 space-y-1 rounded-xl bg-white/[0.02] p-2.5 text-xs">
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                    {t("factoryOrder.timeline.items")}
                  </div>
                  {items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2">
                      <span className="truncate">{it.description ?? "—"}</span>
                      {it.qty != null ? (
                        <span className="font-mono text-muted-foreground" dir="ltr">
                          × {it.qty}
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}

              {event.attachmentUrl ? (
                <a
                  href={event.attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs text-violet-200 hover:text-violet-100"
                >
                  <Paperclip className="h-3 w-3" />
                  {t("factoryOrder.timeline.attachment")}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : null}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}

function parseSnapshot(value: unknown): SnapshotItem[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as SnapshotItem[];
  return [];
}
