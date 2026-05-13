import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Receipt, Scissors, Box, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { getProject } from "@/lib/actions/projects";
import { listProjectInvoices } from "@/lib/actions/invoices";
import { ExportButtons } from "@/components/projects/export-buttons";
import { InvoiceActions } from "@/components/projects/invoice-actions";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  const invoices = await listProjectInvoices(id);

  return (
    <div>
      <PageHeader
        eyebrow="Project"
        title={project.name}
        description={
          project.customer ? `العميل: ${project.customer.name}` : "بدون عميل مرتبط"
        }
        action={
          <Link
            href="/dashboard/projects"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← المشاريع
          </Link>
        }
      />

      {/* ===== Studio Mode — featured CTA ===== */}
      <Link
        href={`/dashboard/projects/${project.id}/studio`}
        className="group relative mb-6 flex items-center gap-5 overflow-hidden rounded-3xl p-7 text-white shadow-2xl transition-transform hover:scale-[1.01]"
        style={{
          background:
            "linear-gradient(135deg, var(--theme-stop-1,#a78bfa) 0%, var(--theme-stop-2,#f0abfc) 45%, var(--theme-stop-3,#38bdf8) 100%)",
          boxShadow:
            "0 30px 60px -20px var(--theme-halo, rgba(167,139,250,0.55))",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 15% 50%, rgba(255,255,255,0.35), transparent 60%)",
          }}
        />
        <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/20 backdrop-blur">
          <Sparkles className="h-8 w-8" />
        </div>
        <div className="relative flex-1">
          <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-0.5 text-[11px] font-bold backdrop-blur">
            ✨ جديد
          </div>
          <h3 className="text-xl font-black tracking-tight md:text-2xl">
            افتح ستوديو التصميم الاحترافي
          </h3>
          <p className="mt-1 text-sm text-white/85">
            تجربة Photoreal مع HDRI + ACES + PBR materials + 12 خامة واقعية + كاميرا متعددة الزوايا + AI commands.
          </p>
        </div>
        <ArrowLeft className="relative h-7 w-7 shrink-0 transition-transform group-hover:-translate-x-2" />
      </Link>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link
          href={`/dashboard/projects/${project.id}/3d`}
          className="glass group flex flex-col items-start gap-3 rounded-2xl p-6 transition-colors hover:border-fuchsia-400/40"
        >
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 shadow-lg">
            <Box className="h-6 w-6 text-background" />
          </div>
          <div>
            <h3 className="text-base font-bold">معاينة 3D ✨</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              تفاعلية — الأبواب تفتح، LED، زجاج.
            </p>
          </div>
          <span className="mt-auto inline-flex items-center gap-1 text-xs text-fuchsia-200">
            افتح المعاينة
            <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
          </span>
        </Link>

        <div className="glass flex flex-col items-start gap-3 rounded-2xl p-6">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg">
            <Receipt className="h-6 w-6 text-background" />
          </div>
          <div>
            <h3 className="text-base font-bold">الفواتير</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              إصدار فاتورة بعد إكمال التصميم.
            </p>
          </div>
          <span className="mt-auto text-xs text-muted-foreground italic">
            متاح قريباً
          </span>
        </div>

        <div className="glass flex flex-col items-start gap-3 rounded-2xl p-6">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
            <Scissors className="h-6 w-6 text-background" />
          </div>
          <div>
            <h3 className="text-base font-bold">تصدير للماكينات</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              DXF, G-Code, CSV, JSON للماكينات المختلفة.
            </p>
          </div>
          <span className="mt-auto text-xs text-muted-foreground italic">
            انزل للأسفل ↓
          </span>
        </div>
      </div>

      {/* Room dims */}
      {project.roomWidth || project.roomDepth || project.roomHeight ? (
        <div className="glass mt-8 rounded-2xl p-6">
          <h3 className="mb-3 font-bold text-gradient">أبعاد الغرفة</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <Dim label="العرض" value={project.roomWidth} />
            <Dim label="العمق" value={project.roomDepth} />
            <Dim label="الارتفاع" value={project.roomHeight} />
          </div>
        </div>
      ) : null}

      {project.notes ? (
        <div className="glass mt-4 rounded-2xl p-6">
          <h3 className="mb-2 text-sm font-bold text-muted-foreground">ملاحظات</h3>
          <p className="whitespace-pre-wrap text-sm">{project.notes}</p>
        </div>
      ) : null}

      {/* Invoices */}
      <div className="glass mt-8 rounded-2xl p-6">
        <InvoiceActions projectId={project.id} invoices={invoices} />
      </div>

      {/* Export section */}
      <div className="glass mt-4 rounded-2xl p-6">
        <h3 className="mb-1 text-lg font-bold text-gradient">تصدير للماكينات</h3>
        <p className="mb-5 text-xs text-muted-foreground">
          صدّر التصميم بصيغة تطابق ماكينتك. الإصدارات الجاهزة: DXF (Beam Saw عام)، G-Code (CNC عام)، CSV، JSON.
        </p>
        <ExportButtons projectId={project.id} />
      </div>
    </div>
  );
}

function Dim({ label, value }: { label: string; value: number | null }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono text-lg font-semibold">
        {value ? `${value} مم` : "—"}
      </div>
    </div>
  );
}
