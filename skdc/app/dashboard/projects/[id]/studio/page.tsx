import { notFound } from "next/navigation";
import { getProject } from "@/lib/actions/projects";
import { listTemplates } from "@/lib/actions/templates";
import { StudioShell } from "@/components/studio/studio-shell";
import type { DesignerState } from "@/components/designer/types";

export const dynamic = "force-dynamic";

export default async function StudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, templates] = await Promise.all([
    getProject(id),
    listTemplates(),
  ]);
  if (!project) notFound();

  const initialDesign =
    (project.design?.data as DesignerState | null | undefined) ?? null;
  const initialRoom = {
    width: project.roomWidth ?? undefined,
    depth: project.roomDepth ?? undefined,
    height: project.roomHeight ?? undefined,
  };

  return (
    <StudioShell
      project={{ id: project.id, name: project.name }}
      templates={templates}
      initialDesign={initialDesign}
      initialRoom={initialRoom}
    />
  );
}
