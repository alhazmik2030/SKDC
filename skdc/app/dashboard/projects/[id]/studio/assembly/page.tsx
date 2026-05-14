import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { db } from "@/lib/db";
import { requireWorkspaceId } from "@/lib/auth-helpers";
import { PageHeader } from "@/components/dashboard/page-header";
import { StudioProgress } from "@/components/studio/studio-progress";

export const dynamic = "force-dynamic";

export default async function StudioAssemblyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workspaceId = await requireWorkspaceId();
  const project = await db.project.findFirst({
    where: { id, workspaceId },
    select: {
      id: true,
      name: true,
      design: {
        select: {
          shape: true,
          walls: {
            select: { id: true, label: true, length: true },
            orderBy: { orderIndex: "asc" },
          },
        },
      },
    },
  });
  if (!project) notFound();
  if (!project.design?.shape) {
    redirect(`/dashboard/projects/${id}/studio/shape`);
  }

  const walls = project.design.walls;

  return (
    <div>
      <PageHeader
        eyebrow="Studio · Step 3"
        title={`جمّع الوحدات — ${project.name}`}
        description="اختر جدارًا واسحب القوالب عليه. يدعم القياسات الدقيقة + التراجع بـ Ctrl+Z."
      />

      <StudioProgress
        projectId={id}
        current="assembly"
        completed={["shape", "walls"]}
      />

      <div className="glass relative overflow-hidden rounded-3xl p-10 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2"
          style={{
            background:
              "radial-gradient(ellipse, var(--theme-halo,rgba(167,139,250,0.35)) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div className="relative mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[var(--theme-stop-1,#a78bfa)] via-[var(--theme-stop-2,#f0abfc)] to-[var(--theme-stop-3,#38bdf8)] shadow-2xl">
          <Sparkles className="h-7 w-7 text-background" />
        </div>
        <h2 className="relative text-xl font-black">
          <span className="text-gradient-aurora">واجهة التجميع جاهزة قريبًا</span>
        </h2>
        <p className="relative mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          يمكنك الآن الدخول مباشرة إلى استديو 3D للتصميم. واجهة التجميع المتقدمة
          (Elevation view لكل جدار) قيد البناء وستحلّ هنا تلقائيًا.
        </p>

        {walls.length > 0 ? (
          <div className="relative mt-5 flex flex-wrap justify-center gap-2 text-xs">
            {walls.map((w) => (
              <span
                key={w.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/[0.03] px-3 py-1 text-muted-foreground"
              >
                <span className="grid h-4 w-4 place-items-center rounded-full bg-white/10 text-[10px] font-bold text-foreground">
                  {w.label}
                </span>
                <span className="tabular-nums">{Math.round(w.length)} مم</span>
              </span>
            ))}
          </div>
        ) : null}

        <div className="relative mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/dashboard/projects/${id}/studio/walls`}
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-white/[0.03] px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 rotate-180" />
            رجوع لضبط الجدران
          </Link>
          <Link
            href={`/dashboard/projects/${id}/studio?skipWizard=1`}
            className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02]"
            style={{
              background:
                "linear-gradient(135deg, var(--theme-stop-1,#a78bfa) 0%, var(--theme-stop-2,#f0abfc) 50%, var(--theme-stop-3,#38bdf8) 100%)",
              boxShadow:
                "0 16px 36px -14px var(--theme-halo,rgba(167,139,250,0.6))",
            }}
          >
            <Sparkles className="h-4 w-4" />
            افتح استديو 3D الآن
          </Link>
        </div>
      </div>
    </div>
  );
}
