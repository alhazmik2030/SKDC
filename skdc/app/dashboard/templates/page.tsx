"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Box, Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { Reveal } from "@/components/effects/reveal";
import { cn } from "@/lib/utils";

const FILTERS = [
  { id: "all", label: "الكل" },
  { id: "LOWER_CABINET", label: "سفلية" },
  { id: "UPPER_CABINET", label: "علوية" },
  { id: "CORNER", label: "أركان" },
  { id: "TALL_CABINET", label: "دواليب" },
  { id: "APPLIANCE", label: "أجهزة" },
  { id: "ACCESSORY", label: "إكسسوارات" },
];

export default function TemplatesPage() {
  const [active, setActive] = React.useState<string>("all");

  return (
    <div>
      <PageHeader
        eyebrow="Templates"
        title="القوالب"
        description="35 قالب جاهز من الوحدات السفلية، العلوية، الأركان، الأجهزة، الإكسسوارات. كل قالب قابل للتخصيص قبل الدمج."
        action={
          <Link
            href="#"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-white to-white/90 px-5 py-2.5 text-sm font-semibold text-background shadow-lg shadow-violet-500/20 transition-transform hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            قالب مخصص
          </Link>
        }
      />

      {/* Filter chips */}
      <div className="mb-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setActive(f.id)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-all",
              active === f.id
                ? "border-violet-400/50 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-foreground shadow-md shadow-violet-500/20"
                : "border-border bg-white/[0.02] text-muted-foreground hover:border-violet-400/30 hover:bg-white/5 hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Skeleton grid (will be replaced with real data) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Reveal key={i} delay={i * 0.05}>
            <motion.div className="glass group relative aspect-[4/5] cursor-pointer overflow-hidden rounded-2xl transition-all hover:border-violet-400/40">
              {/* Image placeholder */}
              <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-violet-500/10 via-card to-sky-500/10">
                <div className="absolute inset-0 grid-bg opacity-40" />
                <div className="absolute inset-0 grid place-items-center">
                  <Box className="h-12 w-12 text-muted-foreground/40 transition-transform group-hover:scale-110" />
                </div>
              </div>
              {/* Info */}
              <div className="space-y-2 p-4">
                <div className="h-3 w-3/4 animate-pulse rounded bg-white/[0.06]" />
                <div className="h-2 w-1/2 animate-pulse rounded bg-white/[0.04]" />
              </div>
            </motion.div>
          </Reveal>
        ))}
      </div>

      <div className="mt-10 text-center text-xs text-muted-foreground">
        💡 القوالب الـ 35 المدخلة في قاعدة البيانات راح تظهر هنا بعد ربط الـ API (Phase 3).
      </div>
    </div>
  );
}
