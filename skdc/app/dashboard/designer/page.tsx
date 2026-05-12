import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, FolderOpen, PenTool, Plus, Sparkles } from "lucide-react";
import { listProjects } from "@/lib/actions/projects";
import { PageHeader } from "@/components/dashboard/page-header";

export const dynamic = "force-dynamic";

export default async function DesignerEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ pick?: string }>;
}) {
  const { pick } = await searchParams;
  const projects = await listProjects();

  // Fast path — one project + no "pick" flag → open it directly.
  if (projects.length === 1 && !pick) {
    redirect(`/dashboard/projects/${projects[0].id}/designer`);
  }

  // No projects yet — guide the user to create one.
  if (projects.length === 0) {
    return (
      <div>
        <PageHeader
          eyebrowKey="page.designer.eyebrow"
          titleKey="page.designer.title"
          descriptionKey="page.designer.description"
        />
        <div className="glass relative overflow-hidden rounded-3xl p-10 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2"
            style={{
              background:
                "radial-gradient(ellipse, var(--theme-halo, rgba(167,139,250,0.35)) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
          <div className="relative mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[var(--theme-stop-1,#a78bfa)] via-[var(--theme-stop-2,#f0abfc)] to-[var(--theme-stop-3,#38bdf8)] shadow-2xl">
            <PenTool className="h-7 w-7 text-background" />
          </div>
          <h2 className="relative text-2xl font-black">
            <span className="text-gradient-aurora">لا يوجد مشروع للتصميم بعد</span>
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            المحرر يفتح داخل أي مشروع. أنشئ مشروعك الأول (يستغرق دقيقة)
            وستعود لهنا تلقائياً للتصميم.
          </p>
          <div className="relative mt-6 flex justify-center">
            <Link
              href="/dashboard/projects"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-white to-white/90 px-6 py-3 text-sm font-semibold text-background shadow-2xl shadow-violet-500/30 transition-transform hover:scale-[1.02]"
            >
              <Plus className="h-4 w-4" />
              إنشاء مشروع جديد
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Multiple projects — let the user pick which one to design.
  return (
    <div>
      <PageHeader
        eyebrowKey="page.designer.eyebrow"
        titleKey="page.designer.picker.title"
        descriptionKey="page.designer.picker.description"
        action={
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-white/[0.02] px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
            مشروع جديد
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/dashboard/projects/${project.id}/designer`}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card/40 p-5 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-[var(--theme-stop-1,#a78bfa)]/40 hover:shadow-lg hover:shadow-[var(--theme-halo,rgba(167,139,250,0.35))]"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-30 transition-opacity group-hover:opacity-60"
              style={{
                background:
                  "radial-gradient(circle, var(--theme-halo, rgba(167,139,250,0.4)) 0%, transparent 70%)",
                filter: "blur(20px)",
              }}
            />
            <div className="relative">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--theme-stop-1,#a78bfa)]/10 px-2.5 py-0.5 text-[10px] font-medium text-[var(--theme-stop-1,#a78bfa)] ring-1 ring-[var(--theme-stop-1,#a78bfa)]/30">
                <FolderOpen className="h-3 w-3" />
                {project.status}
              </div>
              <h3 className="line-clamp-2 text-base font-bold">{project.name}</h3>
              {project.customer ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  العميل: {project.customer.name}
                </p>
              ) : null}
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {project.roomWidth && project.roomDepth
                    ? `${project.roomWidth}×${project.roomDepth} مم`
                    : "بدون أبعاد بعد"}
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-foreground transition-colors group-hover:text-[var(--theme-stop-1,#a78bfa)]">
                  <Sparkles className="h-3 w-3" />
                  افتح المحرر
                  <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
