import { PageHeader } from "@/components/dashboard/page-header";
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog";
import { CustomersList } from "@/components/customers/customers-list";
import { listCustomers } from "@/lib/actions/customers";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await listCustomers();

  return (
    <div>
      <PageHeader
        eyebrow="Customers"
        title="العملاء"
        description="إدارة قاعدة عملاء ورشتك وربط المشاريع بهم."
        action={customers.length > 0 ? <CustomerFormDialog /> : undefined}
      />

      <CustomersList customers={customers} />
    </div>
  );
}
