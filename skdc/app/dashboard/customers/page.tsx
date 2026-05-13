import { PageHeader } from "@/components/dashboard/page-header";
import { CustomerFormDialogLazy as CustomerFormDialog } from "@/components/customers/customer-form-dialog-lazy";
import { CustomersList } from "@/components/customers/customers-list";
import { listCustomers } from "@/lib/actions/customers";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await listCustomers();

  return (
    <div>
      <PageHeader
        eyebrowKey="page.customers.eyebrow"
        titleKey="page.customers.title"
        descriptionKey="page.customers.description"
        action={customers.length > 0 ? <CustomerFormDialog /> : undefined}
      />

      <CustomersList customers={customers} />
    </div>
  );
}
