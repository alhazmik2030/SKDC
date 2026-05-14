import { notFound, redirect } from "next/navigation";
import { getProject } from "@/lib/actions/projects";
import { listTemplates } from "@/lib/actions/templates";
import { StudioShell } from "@/components/studio/studio-shell";
import type { DesignerState } from "@/components/designer/types";

export const dynamic = "force-dynamic";

export default async function StudioPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ skipWizard?: string }>;
}) {
  const { id } = await params;
  const { skipWizard } = await searchParams;
  const [project, templates] = await Promise.all([
    getProject(id),
    listTemplates(),
  ]);
  if (!project) notFound();

  // Wizard gate: if no shape has been set yet, route to Step 1.
  // `?skipWizard=1` lets power-users bypass (used by the Step 4 progress link).
  if (!project.design?.shape && !skipWizard) {
    redirect(`/dashboard/projects/${id}/studio/shape`);
  }

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
