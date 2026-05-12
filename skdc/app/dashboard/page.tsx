"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  FolderKanban,
  Users,
  Receipt,
  Pen,
  Plus,
  Sparkles,
  ArrowLeft,
  Activity,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Reveal } from "@/components/effects/reveal";
import { TiltCard } from "@/components/effects/tilt-card";
import { Magnetic } from "@/components/effects/magnetic";

const STATS = [
  { icon: FolderKanban, label: "مشاريع نشطة", value: "0", color: "from-violet-400 to-fuchsia-400" },
  { icon: Users, label: "عملاء", value: "0", color: "from-sky-400 to-cyan-400" },
  { icon: Receipt, label: "فواتير صادرة", value: "0", color: "from-emerald-400 to-teal-400" },
  { icon: Pen, label: "تصاميم محفوظة", value: "0", color: "from-amber-400 to-orange-400" },
];

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
    desc: "35 قالب جاهز للاستخدام",
  },
];

export default function DashboardHome() {
  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title="مرحباً بك في SKDC"
        description="نظرة سريعة على ورشتك. ابدأ بإضافة عميل أو إنشاء مشروع جديد."
      />

      {/* ===== Stats Grid ===== */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 0.08}>
            <TiltCard intensity={6}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-colors hover:border-violet-400/40">
                <div
                  className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}
                >
                  <stat.icon className="h-5 w-5 text-background" />
                </div>
                <div className="font-mono text-3xl font-bold text-gradient-aurora">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
                <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-gradient-to-br from-violet-400/15 to-transparent opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>

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
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {action.desc}
                    </div>
                  </div>
                  <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-1 group-hover:text-foreground" />
                </Link>
              </Magnetic>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== Recent Activity ===== */}
      <section className="mt-14">
        <Reveal>
          <h2 className="mb-6 text-xl font-bold tracking-tight">
            <span className="text-gradient">النشاط الأخير</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="glass relative flex flex-col items-center justify-center rounded-2xl px-8 py-16 text-center">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10"
              style={{
                background:
                  "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(167, 139, 250, 0.10), transparent 60%)",
              }}
            />
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

      {/* ===== Motion divider ===== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="mt-16 h-px w-full bg-gradient-to-r from-transparent via-violet-400/30 to-transparent"
      />
    </div>
  );
}
