import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Container,
  Globe2,
  MapPin,
  Truck,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { T } from "@/components/i18n-text";
import { ShipmentStatusTimeline } from "@/components/shipments/shipment-status-timeline";
import { ShipmentStatusButton } from "@/components/shipments/shipment-status-button";
import { ShipmentItemsTable } from "@/components/shipments/shipment-items-table";
import { ShipmentItemDialog } from "@/components/shipments/shipment-item-dialog";
import { CopyText } from "@/components/shipments/copy-text";
import { getShipment } from "@/lib/actions/shipments";
import { listProjects } from "@/lib/actions/projects";
import { listCustomers } from "@/lib/actions/customers";

export const dynamic = "force-dynamic";

const MODE_KEYS = {
  SEA_FCL: "shipment.mode.SEA_FCL",
  SEA_LCL: "shipment.mode.SEA_LCL",
  AIR: "shipment.mode.AIR",
  ROAD: "shipment.mode.ROAD",
} as const;

export default async function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const shipment = await getShipment(id);
  if (!shipment) notFound();

  // Pulled in parallel; only used by the "Add item" dialog.
  const [projects, customers] = await Promise.all([
    listProjects(),
    listCustomers(),
  ]);

  return (
    <div>
      <PageHeader
        eyebrowKey="page.shipments.eyebrow"
        title={shipment.reference}
        description={shipment.carrier ?? undefined}
        action={
          <Link
            href="/dashboard/shipments"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            <T k="nav.shipments" />
          </Link>
        }
      />

      {/* Tracking / container chips */}
      {shipment.trackingNumber || shipment.containerNumber ? (
        <div className="-mt-4 mb-6 flex flex-wrap items-center gap-2">
          {shipment.trackingNumber ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <T k="form.shipment.trackingNumber" />:{" "}
              <CopyText value={shipment.trackingNumber} />
            </span>
          ) : null}
          {shipment.containerNumber ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <T k="form.shipment.containerNumber" />:{" "}
              <CopyText value={shipment.containerNumber} />
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* ===== Timeline + Status advance ===== */}
        <section className="glass rounded-2xl p-6 lg:col-span-1">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-gradient">
              <T k="shipment.timeline.title" />
            </h2>
          </div>
          <ShipmentStatusTimeline
            status={shipment.status}
            estimatedDeparture={shipment.estimatedDeparture}
            actualDeparture={shipment.actualDeparture}
            estimatedArrival={shipment.estimatedArrival}
            actualArrival={shipment.actualArrival}
          />
          <div className="mt-5">
            <ShipmentStatusButton
              shipmentId={shipment.id}
              status={shipment.status}
            />
          </div>
        </section>

        {/* ===== Origin / Destination ===== */}
        <section className="glass rounded-2xl p-6 lg:col-span-1">
          <h2 className="mb-4 text-sm font-bold text-gradient">
            <T k="shipment.tab.logistics" />
          </h2>

          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-300">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">
                  <T k="form.shipment.originFactory" />
                </div>
                <div className="truncate font-medium">
                  {shipment.originFactory ?? "—"}
                </div>
                <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span dir="ltr">
                    {[shipment.originCity, shipment.originCountry]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-300">
                <Container className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">
                  <T k="form.shipment.destPort" />
                </div>
                <div className="truncate font-medium">
                  {shipment.destPort ?? "—"}
                </div>
                <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span dir="ltr">
                    {[shipment.destCity, shipment.destCountry]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-500/15 text-violet-300">
                <Truck className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">
                  <T k="form.shipment.mode" />
                </div>
                <div className="font-medium">
                  <T k={MODE_KEYS[shipment.mode]} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Cost breakdown ===== */}
        <section className="glass rounded-2xl p-6 lg:col-span-1">
          <h2 className="mb-4 text-sm font-bold text-gradient">
            <T k="shipment.tab.cost" />
          </h2>
          <div className="space-y-3 text-sm">
            <CostRow
              labelKey="form.shipment.totalValue"
              value={shipment.totalValue}
              currency={shipment.currency}
            />
            <CostRow
              labelKey="form.shipment.shippingCost"
              value={shipment.shippingCost}
              currency={shipment.currency}
            />
            <CostRow
              labelKey="form.shipment.customsDuty"
              value={shipment.customsDuty}
              currency={shipment.currency}
            />
            <div className="border-t border-border/60 pt-3">
              <CostRow
                labelKey="shipment.cost.total"
                value={sumCosts(
                  shipment.totalValue,
                  shipment.shippingCost,
                  shipment.customsDuty,
                )}
                currency={shipment.currency}
                emphasis
              />
            </div>
            <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
              <Globe2 className="h-3 w-3" />
              <span dir="ltr">{shipment.currency}</span>
            </div>
          </div>
        </section>
      </div>

      {/* ===== Items ===== */}
      <section className="glass mt-6 rounded-2xl p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-gradient">
            <T k="shipment.items.title" />
          </h2>
          <ShipmentItemDialog
            shipmentId={shipment.id}
            projects={projects.map((p) => ({ id: p.id, name: p.name }))}
            customers={customers.map((c) => ({ id: c.id, name: c.name }))}
          />
        </div>

        <ShipmentItemsTable
          currency={shipment.currency}
          items={shipment.items.map((item) => ({
            id: item.id,
            description: item.description,
            qty: item.qty,
            unitValue: item.unitValue,
            weightKg: item.weightKg,
            volumeM3: item.volumeM3,
            project: item.project,
            customer: item.customer,
          }))}
        />
      </section>

      {shipment.notes ? (
        <section className="glass mt-4 rounded-2xl p-6">
          <h3 className="mb-2 text-sm font-bold text-muted-foreground">
            <T k="common.notes" />
          </h3>
          <p className="whitespace-pre-wrap text-sm">{shipment.notes}</p>
        </section>
      ) : null}
    </div>
  );
}

function sumCosts(...vals: (number | null)[]): number | null {
  const present = vals.filter((v): v is number => typeof v === "number");
  if (present.length === 0) return null;
  return present.reduce((a, b) => a + b, 0);
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
