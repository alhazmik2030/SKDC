import Link from "next/link";
import { Users, Plus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";

export default function CustomersPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Customers"
        title="العملاء"
        description="إدارة قاعدة عملاء ورشتك وربط المشاريع بهم."
        action={
          <Link
            href="#"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-white to-white/90 px-5 py-2.5 text-sm font-semibold text-background shadow-lg shadow-violet-500/20 transition-transform hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            إضافة عميل
          </Link>
        }
      />

      <EmptyState
        icon={Users}
        title="لا يوجد عملاء بعد"
        description="ابدأ بإضافة أول عميل لربط مشاريعك به وإصدار الفواتير لاحقاً."
        ctaLabel="إضافة أول عميل"
        ctaHref="#"
      />
    </div>
  );
}
