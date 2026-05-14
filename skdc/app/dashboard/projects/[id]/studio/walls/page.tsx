import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireWorkspaceId } from "@/lib/auth-helpers";
import { PageHeader } from "@/components/dashboard/page-header";
import { StudioProgress } from "@/components/studio/studio-progress";
import { WallCalibrator } from "@/components/studio/wall-calibrator";

export const dynamic = "force-dynamic";

export default async function StudioWallsPage({
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
          id: true,
          shape: true,
          walls: { orderBy: { orderIndex: "asc" } },
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
        eyebrow="Studio · Step 2"
        title={`اضبط الجدران — ${project.name}`}
        description="عدّل طول كل جدار وضع النوافذ والأبواب. التعديلات تُحفظ تلقائيًا. Ctrl+Z للتراجع."
      />

      <StudioProgress projectId={id} current="walls" completed={["shape"]} />

      <WallCalibrator projectId={id} initialWalls={walls} />
    </div>
  );
}
