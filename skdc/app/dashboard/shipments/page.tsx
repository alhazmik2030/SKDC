import { PageHeader } from "@/components/dashboard/page-header";
import { ShipmentFormDialogLazy as ShipmentFormDialog } from "@/components/shipments/shipment-form-dialog-lazy";
import { ShipmentsList } from "@/components/shipments/shipments-list";
import { listShipments } from "@/lib/actions/shipments";

export const dynamic = "force-dynamic";

export default async function ShipmentsPage() {
  const shipments = await listShipments();

  return (
    <div>
      <PageHeader
        eyebrowKey="page.shipments.eyebrow"
        titleKey="page.shipments.title"
        descriptionKey="page.shipments.description"
        action={shipments.length > 0 ? <ShipmentFormDialog /> : undefined}
      />

      <ShipmentsList shipments={shipments} />
    </div>
  );
}
