"use client";

import Link from "next/link";
import { Users, Plus, Sparkles, ArrowLeft, Activity, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/effects/reveal";
import { Magnetic } from "@/components/effects/magnetic";
import { useI18n } from "@/components/i18n-provider";

type Action = {
  href: string;
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
};

const QUICK_ACTIONS: Action[] = [
  {
    href: "/dashboard/projects",
    icon: Plus,
    titleKey: "dashboard.quickActions.newProject.title",
    descKey: "dashboard.quickActions.newProject.subtitle",
  },
  {
    href: "/dashboard/customers",
    icon: Users,
    titleKey: "dashboard.quickActions.newCustomer.title",
    descKey: "dashboard.quickActions.newCustomer.subtitle",
  },
  {
    href: "/dashboard/templates",
    icon: Sparkles,
    titleKey: "dashboard.quickActions.exploreTemplates.title",
    descKey: "dashboard.quickActions.exploreTemplates.subtitle",
  },
];

export function QuickActions() {
  const { t, dir } = useI18n();
  const ArrowIcon = ArrowLeft;
  return (
    <section className="mt-14">
      <Reveal>
        <h2 className="mb-6 text-xl font-bold tracking-tight">
          <span className="text-gradient">{t("dashboard.quickActions.title")}</span>
        </h2>
      </Reveal>
      <div className="grid gap-4 md:grid-cols-3">
        {QUICK_ACTIONS.map((action, i) => (
          <Reveal key={action.href} delay={i * 0.1}>
            <Magnetic strength={0.15}>
              <Link
                href={action.href}
                className="glass group relative flex h-full items-center gap-4 overflow-hidden rounded-2xl p-5 transition-all hover:border-[var(--theme-stop-1,#a78bfa)]/40"
              >
                <div
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-xl shadow-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--theme-stop-1,#a78bfa) 0%, var(--theme-stop-3,#38bdf8) 100%)",
                    boxShadow:
                      "0 10px 25px -10px var(--theme-halo, rgba(167,139,250,0.5))",
                  }}
                >
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{t(action.titleKey)}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{t(action.descKey)}</div>
                </div>
                <ArrowIcon
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:text-foreground ${
                    dir === "rtl" ? "group-hover:-translate-x-1" : "group-hover:translate-x-1 rotate-180"
                  }`}
                />
              </Link>
            </Magnetic>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function RecentActivityPlaceholder() {
  const { t } = useI18n();
  // Two keys we don't strictly need in the dict yet; fall back to literals via t().
  const noActivity = t("dashboard.recent.empty");
  const subline = t("dashboard.recent.emptySub");
  return (
    <section className="mt-14">
      <Reveal>
        <h2 className="mb-6 text-xl font-bold tracking-tight">
          <span className="text-gradient">{t("dashboard.recent.title")}</span>
        </h2>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="glass relative flex flex-col items-center justify-center rounded-2xl px-8 py-16 text-center">
          <Activity className="mb-4 h-10 w-10 text-muted-foreground" />
          <div className="text-base font-medium text-muted-foreground">{noActivity}</div>
          <div className="mt-2 max-w-md text-sm text-muted-foreground/70">{subline}</div>
        </div>
      </Reveal>
    </section>
  );
}
