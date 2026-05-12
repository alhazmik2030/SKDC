import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pen, Receipt, Scissors } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { getProject } from "@/lib/actions/projects";
import { ExportButtons } from "@/components/projects/export-buttons";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

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

      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href={`/dashboard/projects/${project.id}/designer`}
          className="glass group flex flex-col items-start gap-3 rounded-2xl p-6 transition-colors hover:border-violet-400/40"
        >
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[var(--theme-stop-1,#a78bfa)] to-[var(--theme-stop-3,#38bdf8)] shadow-lg">
            <Pen className="h-6 w-6 text-background" />
          </div>
          <div>
            <h3 className="text-base font-bold">فتح المحرر 2D</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              صمم المطبخ بسحب الوحدات على Canvas.
            </p>
          </div>
          <span className="mt-auto inline-flex items-center gap-1 text-xs text-violet-200">
            ابدأ التصميم
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

      {/* Export section */}
      <div className="glass mt-8 rounded-2xl p-6">
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
