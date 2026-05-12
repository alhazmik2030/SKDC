import Link from "next/link";
import { Layers, Plus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";

export default function MaterialsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Materials"
        title="الخامات"
        description="إدارة خاماتك وأسعارها — HPL، UVLACK، MELAMIN، MDF، POLYLACK، خشب طبيعي."
        action={
          <Link
            href="#"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-white to-white/90 px-5 py-2.5 text-sm font-semibold text-background shadow-lg shadow-violet-500/20 transition-transform hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            إضافة خامة
          </Link>
        }
      />

      <div className="mb-4 text-center text-xs text-muted-foreground">
        💡 خامات افتراضية متاحة في ورشتك التجريبية (12 خامة جاهزة).
      </div>

      <EmptyState
        icon={Layers}
        title="ابدأ بتخصيص خاماتك"
        description="أضف خامات ورشتك مع الأسعار والسماكات لتسريع التسعير التلقائي."
        ctaLabel="إضافة خامة"
        ctaHref="#"
      />
    </div>
  );
}
