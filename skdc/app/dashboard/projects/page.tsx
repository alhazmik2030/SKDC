"use client";

import Link from "next/link";
import { FolderKanban, Plus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";

export default function ProjectsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Projects"
        title="المشاريع"
        description="إدارة كل مشاريع التصميم الخاصة بعملائك — من المسودة إلى التصنيع."
        action={
          <Link
            href="#"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-white to-white/90 px-5 py-2.5 text-sm font-semibold text-background shadow-lg shadow-violet-500/20 transition-transform hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            مشروع جديد
          </Link>
        }
      />

      <EmptyState
        icon={FolderKanban}
        title="لا يوجد مشاريع بعد"
        description="ابدأ مشروعك الأول باختيار عميل وتحديد أبعاد المطبخ، ثم اسحب الوحدات من المكتبة."
        ctaLabel="إنشاء أول مشروع"
        ctaHref="#"
      />
    </div>
  );
}
