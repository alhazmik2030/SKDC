import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireWorkspaceId } from "@/lib/auth-helpers";
import { PageHeader } from "@/components/dashboard/page-header";
import { StudioProgress } from "@/components/studio/studio-progress";
import { WallAssembly } from "@/components/studio/wall-assembly";
import { listTemplates } from "@/lib/actions/templates";
import type { DesignerState } from "@/components/designer/types";

export const dynamic = "force-dynamic";

const DEFAULT_DIMS = { width: 4000, depth: 3000, height: 2700 };

export default async function StudioAssemblyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workspaceId = await requireWorkspaceId();
  const [project, templates] = await Promise.all([
    db.project.findFirst({
      where: { id, workspaceId },
      select: {
        id: true,
        name: true,
        roomWidth: true,
        roomDepth: true,
        roomHeight: true,
        design: {
          select: {
            shape: true,
            data: true,
            walls: { orderBy: { orderIndex: "asc" } },
          },
        },
      },
    }),
    listTemplates(),
  ]);
  if (!project) notFound();
  if (!project.design?.shape) {
    redirect(`/dashboard/projects/${id}/studio/shape`);
  }
  const walls = project.design.walls;
  if (walls.length === 0) {
    redirect(`/dashboard/projects/${id}/studio/walls`);
  }

  const initialDesign = (project.design.data as DesignerState | null) ?? null;
  const roomDims = {
    width: project.roomWidth ?? DEFAULT_DIMS.width,
    depth: project.roomDepth ?? DEFAULT_DIMS.depth,
    height: project.roomHeight ?? DEFAULT_DIMS.height,
  };

  return (
    <div>
      <PageHeader
        eyebrow="Studio · Step 3"
        title={`جمّع الوحدات — ${project.name}`}
        description="اختر جدارًا من الأعلى، ثم أضف القوالب من اللوحة الجانبية. اسحب الوحدات لتحريكها على الجدار. حفظ تلقائي + Ctrl+Z للتراجع + Delete للحذف."
      />

      <StudioProgress
        projectId={id}
        current="assembly"
        completed={["shape", "walls"]}
      />

      <WallAssembly
        projectId={id}
        walls={walls}
        templates={templates}
        initialDesign={initialDesign}
        roomDims={roomDims}
      />
    </div>
  );
}
