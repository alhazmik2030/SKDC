import Link from "next/link";
import { ArrowRight, Building2, Calendar, ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { T } from "@/components/i18n-text";
import { EmptyState } from "@/components/dashboard/empty-state";
import { OrderStatusChip } from "@/components/factory-orders/order-status-chip";
import { SubmitOrderDialog } from "@/components/factory-orders/submit-order-dialog";
import { listFactoryOrders } from "@/lib/actions/factory-orders";
import { listFactories } from "@/lib/actions/factories";
import { listProjects } from "@/lib/actions/projects";

export const dynamic = "force-dynamic";

export default async function FactoryOrdersPage() {
  const [orders, verifiedFactories, projects] = await Promise.all([
    listFactoryOrders(),
    listFactories({ verifiedOnly: true }),
    listProjects(),
  ]);

  const factoryOptions = verifiedFactories.map((f) => ({
    id: f.id,
    name: f.name,
    country: f.country,
    preferredFormat: f.preferredFormat,
    channel: f.channel,
  }));

  const projectOptions = projects.map((p) => ({ id: p.id, name: p.name }));

  return (
    <div>
      <PageHeader
        eyebrowKey="page.factoryOrders.eyebrow"
        titleKey="page.factoryOrders.title"
        descriptionKey="page.factoryOrders.description"
        action={
          orders.length > 0 ? (
            <SubmitOrderDialog
              factories={factoryOptions}
              projects={projectOptions}
            />
          ) : undefined
        }
      />

      {orders.length === 0 ? (
        <SubmitOrderDialog
          factories={factoryOptions}
          projects={projectOptions}
          trigger={
            <div>
              <EmptyState
                icon={ClipboardList}
                titleKey="empty.factoryOrders.title"
                descriptionKey="empty.factoryOrders.description"
                ctaLabelKey="empty.factoryOrders.cta"
                onCta={() => {}}
              />
            </div>
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/dashboard/factory-orders/${order.id}`}
              className="glass group relative flex flex-col overflow-hidden rounded-2xl border border-border p-5 transition-colors hover:border-violet-400/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-mono text-sm font-semibold" dir="ltr">
                    {order.reference}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <Building2 className="h-3 w-3 shrink-0" />
                    <span className="truncate">{order.factory.name}</span>
                  </div>
                </div>
                <OrderStatusChip status={order.status} />
              </div>

              <div className="mt-3 truncate text-xs text-muted-foreground">
                <T k="form.factoryOrder.project" />:{" "}
                <span className="text-foreground">{order.project.name}</span>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span dir="ltr">
                    {new Date(order.createdAt).toISOString().slice(0, 10)}
                  </span>
                </span>
                {order.estimatedDelivery ? (
                  <span className="font-mono" dir="ltr">
                    ETA{" "}
                    {new Date(order.estimatedDelivery).toISOString().slice(0, 10)}
                  </span>
                ) : null}
              </div>

              <div className="mt-3 flex items-center justify-end text-xs text-violet-200">
                <T k="common.open" />
                <ArrowRight className="ms-1 h-3 w-3 rtl:rotate-180" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
