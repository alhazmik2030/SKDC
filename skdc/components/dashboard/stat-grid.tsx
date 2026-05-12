"use client";

import { FolderKanban, Users, Receipt, Pen, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/effects/reveal";
import { TiltCard } from "@/components/effects/tilt-card";
import type { DashboardStats } from "@/lib/actions/dashboard-stats";

type StatItem = {
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
};

export function StatGrid({ stats }: { stats: DashboardStats }) {
  const items: StatItem[] = [
    {
      icon: FolderKanban,
      label: "مشاريع نشطة",
      value: stats.activeProjects,
      color: "from-violet-400 to-fuchsia-400",
    },
    {
      icon: Users,
      label: "عملاء",
      value: stats.customers,
      color: "from-sky-400 to-cyan-400",
    },
    {
      icon: Receipt,
      label: "فواتير صادرة",
      value: stats.invoices,
      color: "from-emerald-400 to-teal-400",
    },
    {
      icon: Pen,
      label: "تصاميم محفوظة",
      value: stats.designs,
      color: "from-amber-400 to-orange-400",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((stat, i) => (
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
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-gradient-to-br from-violet-400/15 to-transparent opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
            </div>
          </TiltCard>
        </Reveal>
      ))}
    </div>
  );
}
