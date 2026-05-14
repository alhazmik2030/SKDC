import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireWorkspaceId } from "@/lib/auth-helpers";
import { PageHeader } from "@/components/dashboard/page-header";
import { StudioProgress } from "@/components/studio/studio-progress";
import { ShapePicker } from "@/components/studio/shape-picker";

export const dynamic = "force-dynamic";

export default async function StudioShapePage({
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
      roomWidth: true,
      roomDepth: true,
      roomHeight: true,
      design: { select: { shape: true } },
    },
  });
  if (!project) notFound();

  return (
    <div>
      <PageHeader
        eyebrow="Studio · Step 1"
        title={`اختر شكل المطبخ — ${project.name}`}
        description="هذا الشكل يحدّد عدد الجدران (A → B → C → D باتجاه عقارب الساعة) والجزيرة إن وُجدت."
      />

      <StudioProgress projectId={id} current="shape" completed={[]} />

      <ShapePicker
        projectId={id}
        initialShape={project.design?.shape ?? null}
        initialRoom={{
          width: project.roomWidth,
          depth: project.roomDepth,
          height: project.roomHeight,
        }}
      />
    </div>
  );
}
