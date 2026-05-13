import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, FileText, Globe2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { T } from "@/components/i18n-text";
import { OrderStatusChip } from "@/components/factory-orders/order-status-chip";
import { OrderTimeline } from "@/components/factory-orders/order-timeline";
import { AdvanceStatusButton } from "@/components/factory-orders/advance-status-button";
import { VerificationBadge } from "@/components/factories/verification-badge";
import { getFactoryOrder } from "@/lib/actions/factory-orders";

export const dynamic = "force-dynamic";

type FileEntry = {
  type?: string;
  format?: string;
  url?: string;
  generatedAt?: string;
};

export default async function FactoryOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getFactoryOrder(id);
  if (!order) notFound();

  const files = parseFiles(order.files);

  return (
    <div>
      <PageHeader
        eyebrowKey="page.factoryOrders.eyebrow"
        title={order.reference}
        description={order.factory.name}
        action={
          <Link
            href="/dashboard/factory-orders"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            <T k="nav.factoryOrders" />
          </Link>
        }
      />

      {/* Status row */}
      <div className="-mt-4 mb-6 flex flex-wrap items-center gap-3">
        <OrderStatusChip status={order.status} />
        <VerificationBadge status={order.factory.verificationStatus} />
        <Link
          href={`/dashboard/factories/${order.factory.id}`}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <Building2 className="h-3 w-3" />
          {order.factory.name}
        </Link>
        <Link
          href={`/dashboard/projects/${order.project.id}`}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <FileText className="h-3 w-3" />
          {order.project.name}
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* ===== Timeline (left, spans 2) ===== */}
        <section className="glass rounded-2xl p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-gradient">
              <T k="factoryOrder.timeline.title" />
            </h2>
            <AdvanceStatusButton orderId={order.id} status={order.status} />
          </div>
          <OrderTimeline events={order.events} />
        </section>

        {/* ===== Right column: costs + files ===== */}
        <div className="space-y-4">
          <section className="glass rounded-2xl p-6">
            <h2 className="mb-4 text-sm font-bold text-gradient">
              <T k="factoryOrder.section.cost" />
            </h2>
            <div className="space-y-3 text-sm">
              <CostRow
                labelKey="factoryOrder.cost.factoryQuote"
                value={order.factoryQuote}
                currency={order.factoryCurrency}
              />
              <CostRow
                labelKey="factoryOrder.cost.workshopBudget"
                value={order.workshopBudget}
                currency={order.factoryCurrency}
              />
              <div className="border-t border-border/60 pt-3">
                <CostRow
                  labelKey="factoryOrder.cost.accepted"
                  value={order.acceptedAmount}
                  currency={order.factoryCurrency}
                  emphasis
                />
              </div>
              <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                <Globe2 className="h-3 w-3" />
                <span dir="ltr">{order.factoryCurrency}</span>
              </div>
            </div>
          </section>

          <section className="glass rounded-2xl p-6">
            <h2 className="mb-4 text-sm font-bold text-gradient">
              <T k="factoryOrder.section.files" />
            </h2>
            {files.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground">
                <T k="factoryOrder.files.empty" />
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {files.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-2 rounded-xl bg-white/[0.02] p-2"
                  >
                    <span className="font-mono text-xs">
                      {f.format ?? f.type ?? "—"}
                    </span>
                    {f.url ? (
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-violet-200 hover:text-violet-100"
                      >
                        <T k="common.open" />
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
            {/* STUB: file generation runs through the Machine adapter framework
                (existing MachineExport pipeline) — wire it up to push artifacts
                into FactoryOrder.files when the order is SUBMITTED. */}
          </section>

          {order.shipmentId ? (
            <section className="glass rounded-2xl p-6">
              <div className="text-xs text-muted-foreground">
                <T k="factoryOrder.section.linkedShipment" />
              </div>
              <Link
                href={`/dashboard/shipments/${order.shipmentId}`}
                className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-violet-200 hover:text-violet-100"
                dir="ltr"
              >
                {order.shipmentId}
              </Link>
            </section>
          ) : null}
        </div>
      </div>

      {order.notes ? (
        <section className="glass mt-4 rounded-2xl p-6">
          <h3 className="mb-2 text-sm font-bold text-muted-foreground">
            <T k="common.notes" />
          </h3>
          <p className="whitespace-pre-wrap text-sm">{order.notes}</p>
        </section>
      ) : null}
    </div>
  );
}

function parseFiles(value: unknown): FileEntry[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as FileEntry[];
  return [];
}

function CostRow({
  labelKey,
  value,
  currency,
  emphasis,
}: {
  labelKey: string;
  value: number | null;
  currency: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span
        className={
          emphasis ? "font-semibold" : "text-xs text-muted-foreground"
        }
      >
        <T k={labelKey} />
      </span>
      <span
        className={
          emphasis
            ? "font-mono text-base font-bold text-gradient"
            : "font-mono text-sm"
        }
        dir="ltr"
      >
        {value != null ? `${value.toLocaleString()} ${currency}` : "—"}
      </span>
    </div>
  );
}
