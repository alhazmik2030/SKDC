import Link from "next/link";
import { Users, Plus, Sparkles, ArrowLeft, Activity } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatGrid } from "@/components/dashboard/stat-grid";
import { Reveal } from "@/components/effects/reveal";
import { Magnetic } from "@/components/effects/magnetic";
import { getDashboardStats } from "@/lib/actions/dashboard-stats";

export const dynamic = "force-dynamic";

const QUICK_ACTIONS = [
  {
    href: "/dashboard/projects",
    icon: Plus,
    title: "إنشاء مشروع جديد",
    desc: "ابدأ تصميم مطبخ لعميل",
  },
  {
    href: "/dashboard/customers",
    icon: Users,
    title: "إضافة عميل",
    desc: "أضف عميل لقاعدة بياناتك",
  },
  {
    href: "/dashboard/templates",
    icon: Sparkles,
    title: "استكشاف القوالب",
    desc: "35 قالب جاهز + قوالب مخصصة",
  },
];

export default async function DashboardHome() {
  const stats = await getDashboardStats();

  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title="مرحباً بك في SKDC"
        description="نظرة سريعة على ورشتك. ابدأ بإضافة عميل أو إنشاء مشروع جديد."
      />

      <StatGrid stats={stats} />

      {/* ===== Quick Actions ===== */}
      <section className="mt-14">
        <Reveal>
          <h2 className="mb-6 text-xl font-bold tracking-tight">
            <span className="text-gradient">الإجراءات السريعة</span>
          </h2>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-3">
          {QUICK_ACTIONS.map((action, i) => (
            <Reveal key={action.href} delay={i * 0.1}>
              <Magnetic strength={0.15}>
                <Link
                  href={action.href}
                  className="glass group relative flex h-full items-center gap-4 overflow-hidden rounded-2xl p-5 transition-all hover:border-violet-400/40"
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-sky-500 shadow-lg shadow-violet-500/30">
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{action.title}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{action.desc}</div>
                  </div>
                  <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-1 group-hover:text-foreground" />
                </Link>
              </Magnetic>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== Recent Activity (placeholder) ===== */}
      <section className="mt-14">
        <Reveal>
          <h2 className="mb-6 text-xl font-bold tracking-tight">
            <span className="text-gradient">النشاط الأخير</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="glass relative flex flex-col items-center justify-center rounded-2xl px-8 py-16 text-center">
            <Activity className="mb-4 h-10 w-10 text-muted-foreground" />
            <div className="text-base font-medium text-muted-foreground">
              لا يوجد نشاط حديث بعد
            </div>
            <div className="mt-2 max-w-md text-sm text-muted-foreground/70">
              عند إنشاء مشاريع وإصدار فواتير، ستظهر هنا.
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
