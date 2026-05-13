import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  FileText,
  Globe2,
  Mail,
  MessageCircle,
  Package,
  Phone,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { T } from "@/components/i18n-text";
import { VerificationBadge } from "@/components/factories/verification-badge";
import { TrustGrade } from "@/components/factories/trust-grade";
import { OrderStatusChip } from "@/components/factory-orders/order-status-chip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFactory } from "@/lib/actions/factories";

export const dynamic = "force-dynamic";

export default async function FactoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const factory = await getFactory(id);
  if (!factory) notFound();

  const onTimePct =
    factory.totalOrders > 0
      ? Math.round((factory.onTimeDeliveries / factory.totalOrders) * 100)
      : null;

  return (
    <div>
      <PageHeader
        eyebrowKey="page.factories.eyebrow"
        title={factory.name}
        description={factory.nameLocal ?? undefined}
        action={
          <Link
            href="/dashboard/factories"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            <T k="nav.factories" />
          </Link>
        }
      />

      <div className="-mt-4 mb-6 flex flex-wrap items-center gap-3">
        <VerificationBadge status={factory.verificationStatus} size="md" />
        <TrustGrade
          grade={factory.trustGrade}
          score={factory.trustScore}
          size="md"
        />
        {factory.city ? (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Globe2 className="h-3 w-3" />
            <span dir="ltr">
              {factory.city}
              {factory.country ? `, ${factory.country}` : ""}
            </span>
          </span>
        ) : null}
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">
            <T k="factory.tab.profile" />
          </TabsTrigger>
          <TabsTrigger value="documents">
            <T k="factory.tab.documents" />
          </TabsTrigger>
          <TabsTrigger value="orders">
            <T k="factory.tab.orders" />
          </TabsTrigger>
          <TabsTrigger value="performance">
            <T k="factory.tab.performance" />
          </TabsTrigger>
        </TabsList>

        {/* ===== Profile ===== */}
        <TabsContent value="profile">
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="glass rounded-2xl p-6">
              <h2 className="mb-4 text-sm font-bold text-gradient">
                <T k="factory.section.contact" />
              </h2>
              <div className="space-y-3 text-sm">
                <Row
                  icon={Building2}
                  label={<T k="form.factory.contactName" />}
                  value={factory.contactName}
                />
                <Row
                  icon={Phone}
                  label={<T k="form.factory.contactPhone" />}
                  value={factory.contactPhone}
                  dir="ltr"
                />
                <Row
                  icon={Mail}
                  label={<T k="form.factory.contactEmail" />}
                  value={factory.contactEmail}
                  dir="ltr"
                />
                <Row
                  icon={MessageCircle}
                  label={<T k="form.factory.wechatId" />}
                  value={factory.wechatId}
                  dir="ltr"
                />
                <Row
                  icon={MessageCircle}
                  label={<T k="form.factory.whatsappNumber" />}
                  value={factory.whatsappNumber}
                  dir="ltr"
                />
              </div>
            </section>

            <section className="glass rounded-2xl p-6">
              <h2 className="mb-4 text-sm font-bold text-gradient">
                <T k="factory.section.capabilities" />
              </h2>
              <div className="space-y-3 text-sm">
                <Row
                  icon={FileText}
                  label={<T k="form.factory.preferredFormat" />}
                  value={factory.preferredFormat}
                />
                <Row
                  icon={Globe2}
                  label={<T k="form.factory.channel" />}
                  value={factory.channel}
                />
                <Row
                  icon={CheckCircle2}
                  label={<T k="form.factory.leadTimeDays" />}
                  value={factory.leadTimeDays?.toString() ?? null}
                />
                <Row
                  icon={CheckCircle2}
                  label={<T k="form.factory.paymentTerms" />}
                  value={factory.paymentTerms}
                />
                <Row
                  icon={FileText}
                  label={<T k="form.factory.endpoint" />}
                  value={factory.endpoint}
                  dir="ltr"
                />
              </div>
            </section>
          </div>

          {factory.addressLine || factory.notes ? (
            <section className="glass mt-4 rounded-2xl p-6">
              {factory.addressLine ? (
                <p className="text-sm">
                  <span className="text-muted-foreground">
                    <T k="form.factory.addressLine" />:
                  </span>{" "}
                  {factory.addressLine}
                </p>
              ) : null}
              {factory.notes ? (
                <p className="mt-2 whitespace-pre-wrap text-sm">
                  {factory.notes}
                </p>
              ) : null}
            </section>
          ) : null}
        </TabsContent>

        {/* ===== Documents ===== */}
        <TabsContent value="documents">
          <section className="glass rounded-2xl p-6">
            {factory.documents.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                <T k="factory.documents.empty" />
              </p>
            ) : (
              <ul className="divide-y divide-border/60">
                {factory.documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-500/15 text-violet-300">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium hover:text-violet-200"
                        >
                          {doc.title}
                        </a>
                        <div className="text-xs text-muted-foreground">
                          {doc.kind}
                        </div>
                      </div>
                    </div>
                    <time
                      dateTime={new Date(doc.uploadedAt).toISOString()}
                      className="font-mono text-xs text-muted-foreground"
                      dir="ltr"
                    >
                      {new Date(doc.uploadedAt).toISOString().slice(0, 10)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
            {/* STUB: file upload UI (R2/S3 presigned URL) — wire up via
                addDocument() server action once the upload pipeline lands. */}
          </section>
        </TabsContent>

        {/* ===== Orders ===== */}
        <TabsContent value="orders">
          <section className="glass rounded-2xl p-6">
            {factory.recentOrders.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                <T k="factory.orders.empty" />
              </p>
            ) : (
              <ul className="divide-y divide-border/60">
                {factory.recentOrders.map((o) => (
                  <li
                    key={o.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div>
                      <Link
                        href={`/dashboard/factory-orders/${o.id}`}
                        className="font-mono text-sm hover:text-violet-200"
                        dir="ltr"
                      >
                        {o.reference}
                      </Link>
                      <div className="text-[11px] text-muted-foreground">
                        {new Date(o.createdAt).toISOString().slice(0, 10)}
                      </div>
                    </div>
                    <OrderStatusChip status={o.status} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </TabsContent>

        {/* ===== Performance ===== */}
        <TabsContent value="performance">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <PerfCard
              icon={Package}
              label={<T k="factory.perf.totalOrders" />}
              value={String(factory.totalOrders)}
            />
            <PerfCard
              icon={CheckCircle2}
              label={<T k="factory.perf.onTime" />}
              value={onTimePct == null ? "—" : `${onTimePct}%`}
            />
            <PerfCard
              icon={TrendingUp}
              label={<T k="factory.perf.qualityIssues" />}
              value={String(factory.qualityIssues)}
            />
            <PerfCard
              icon={TrendingUp}
              label={<T k="factory.perf.score" />}
              value={factory.trustScore.toFixed(1)}
            />
          </div>
          {/* STUB: communication response-time metric will be wired up when
              WhatsApp/email auto-thread tracking is added. */}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  dir,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: React.ReactNode;
  value: string | null;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/[0.03] text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] text-muted-foreground">{label}</div>
        <div className="truncate font-medium" dir={dir}>
          {value || "—"}
        </div>
      </div>
    </div>
  );
}

function PerfCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: React.ReactNode;
  value: string;
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="mt-2 font-mono text-2xl font-bold text-gradient" dir="ltr">
        {value}
      </div>
    </div>
  );
}
