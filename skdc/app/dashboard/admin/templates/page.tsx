import { redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { listAllGlbTemplates } from "@/lib/actions/templates-glb";
import { PageHeader } from "@/components/dashboard/page-header";
import { AdminGlbTemplatesPanel } from "@/components/admin/admin-glb-templates-panel";

export const dynamic = "force-dynamic";

/**
 * Admin-only library manager for the GLB template pipeline.
 *
 * Why a separate page from `/dashboard/templates`: that page manages the
 * procedural (resizable) templates, while this one manages the heavy GLB
 * model library sourced from Sketchfab + factory libraries. The two stay
 * separate in the DB schema (KitchenTemplate vs Template) so a future
 * "library marketplace" can live on this one without touching the
 * workshop-custom workflow.
 */
export default async function AdminGlbTemplatesPage() {
  let role: string;
  try {
    const { role: r } = await getCurrentWorkspace();
    role = r;
  } catch {
    redirect("/dashboard");
  }

  if (role !== "OWNER" && role !== "ADMIN") {
    redirect("/dashboard");
  }

  const templates = await listAllGlbTemplates();

  return (
    <div dir="rtl">
      <PageHeader
        eyebrow="Admin"
        title="مكتبة قوالب GLB"
        description="إدارة الموديلات الجاهزة (Sketchfab + مكتبة المصنع) التي تظهر في الاستديو."
      />

      <AdminGlbTemplatesPanel templates={templates} />
    </div>
  );
}
