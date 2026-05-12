import { PageHeader } from "@/components/dashboard/page-header";
import { MaterialFormDialog } from "@/components/materials/material-form-dialog";
import { MaterialsList } from "@/components/materials/materials-list";
import { listMaterials } from "@/lib/actions/materials";

export const dynamic = "force-dynamic";

export default async function MaterialsPage() {
  const materials = await listMaterials();

  return (
    <div>
      <PageHeader
        eyebrowKey="page.materials.eyebrow"
        titleKey="page.materials.title"
        descriptionKey="page.materials.description"
        action={materials.length > 0 ? <MaterialFormDialog /> : undefined}
      />

      <MaterialsList materials={materials} />
    </div>
  );
}
