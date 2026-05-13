import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Sparkles, Box } from "lucide-react";
import { getProject } from "@/lib/actions/projects";
import { listTemplates } from "@/lib/actions/templates";
import { DesignerShell } from "@/components/designer/designer-shell";
import type { DesignerState } from "@/components/designer/types";

export const dynamic = "force-dynamic";

export default async function ProjectDesignerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, templates] = await Promise.all([getProject(id), listTemplates()]);
  if (!project) notFound();

  const initialDesign =
    (project.design?.data as DesignerState | null | undefined) ?? null;
  const initialRoom = {
    width: project.roomWidth ?? undefined,
    depth: project.roomDepth ?? undefined,
    height: project.roomHeight ?? undefined,
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-violet-300">
            Designer · 2D
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            <span className="text-gradient">{project.name}</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/projects/${project.id}/3d`}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground"
          >
            <Box className="h-4 w-4" />
            معاينة 3D
          </Link>
          <Link
            href={`/dashboard/projects/${project.id}/studio`}
            className="group relative inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.03]"
            style={{
              background:
                "linear-gradient(135deg, var(--theme-stop-1,#a78bfa) 0%, var(--theme-stop-2,#f0abfc) 50%, var(--theme-stop-3,#38bdf8) 100%)",
              boxShadow:
                "0 14px 35px -12px var(--theme-halo, rgba(167,139,250,0.6))",
            }}
          >
            <Sparkles className="h-4 w-4" />
            افتح الاستديو الجديد
          </Link>
          <Link
            href={`/dashboard/projects/${project.id}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowRight className="h-4 w-4" />
            المشروع
          </Link>
        </div>
      </div>

      <DesignerShell
        projectId={project.id}
        initialDesign={initialDesign}
        initialRoom={{
          width: initialRoom.width ?? undefined,
          depth: initialRoom.depth ?? undefined,
          height: initialRoom.height ?? undefined,
        }}
        templates={templates}
      />
    </div>
  );
}
