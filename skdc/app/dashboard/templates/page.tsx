import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { TemplatesGrid } from "@/components/templates/templates-grid";
import { listTemplates } from "@/lib/actions/templates";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const templates = await listTemplates();

  return (
    <div>
      <PageHeader
        eyebrow="Templates"
        title="القوالب"
        description="مكتبة قوالب جاهزة + إمكانية بناء قوالب خاصة بورشتك. كل قالب قابل للتخصيص قبل الدمج."
        action={
          <Link
            href="/dashboard/templates/new"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-white to-white/90 px-5 py-2.5 text-sm font-semibold text-background shadow-lg shadow-violet-500/20 transition-transform hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            قالب مخصص
          </Link>
        }
      />

      <TemplatesGrid templates={templates} />
    </div>
  );
}
