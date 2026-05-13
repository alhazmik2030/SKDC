import { PageHeader } from "@/components/dashboard/page-header";
import { FactoryFormDialogLazy as FactoryFormDialog } from "@/components/factories/factory-form-dialog-lazy";
import { FactoriesList } from "@/components/factories/factories-list";
import { listFactories } from "@/lib/actions/factories";

export const dynamic = "force-dynamic";

export default async function FactoriesPage() {
  const factories = await listFactories();

  return (
    <div>
      <PageHeader
        eyebrowKey="page.factories.eyebrow"
        titleKey="page.factories.title"
        descriptionKey="page.factories.description"
        action={factories.length > 0 ? <FactoryFormDialog /> : undefined}
      />

      <FactoriesList factories={factories} />
    </div>
  );
}
