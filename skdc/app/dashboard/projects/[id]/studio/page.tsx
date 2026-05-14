import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireWorkspaceId } from "@/lib/auth-helpers";
import { listTemplates } from "@/lib/actions/templates";
import { listGlbTemplates } from "@/lib/actions/templates-glb";
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
  const workspaceId = await requireWorkspaceId();

  const [project, templates, glbTemplates] = await Promise.all([
    db.project.findFirst({
      where: { id, workspaceId },
      include: {
        customer: true,
        design: {
          include: {
            walls: { orderBy: { orderIndex: "asc" } },
          },
        },
      },
    }),
    listTemplates(),
    listGlbTemplates(),
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

  const walls = project.design?.walls ?? [];
  const shape = project.design?.shape ?? null;
  const island = {
    hasIsland: project.design?.hasIsland ?? false,
    width: project.design?.islandWidth ?? null,
    depth: project.design?.islandDepth ?? null,
    x: project.design?.islandX ?? null,
    z: project.design?.islandZ ?? null,
  };

  return (
    <StudioShell
      project={{ id: project.id, name: project.name }}
      templates={templates}
      glbTemplates={glbTemplates}
      initialDesign={initialDesign}
      initialRoom={initialRoom}
      walls={walls}
      shape={shape}
      island={island}
    />
  );
}
