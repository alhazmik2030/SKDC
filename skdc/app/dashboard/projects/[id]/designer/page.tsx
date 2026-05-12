import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
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
        <Link
          href={`/dashboard/projects/${project.id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="h-4 w-4" />
          المشروع
        </Link>
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
