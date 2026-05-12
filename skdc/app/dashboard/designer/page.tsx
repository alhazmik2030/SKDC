"use client";

import { motion } from "framer-motion";
import { PenTool, Sparkles, Box, Bot } from "lucide-react";
import { AuroraBackground } from "@/components/effects/aurora-background";
import { Magnetic } from "@/components/effects/magnetic";
import { Reveal } from "@/components/effects/reveal";

const FEATURES = [
  { icon: Box, label: "محرر 3D متطور" },
  { icon: PenTool, label: "سحب وإفلات + لصق ذكي" },
  { icon: Bot, label: "AI مدمج (MCP)" },
];

export default function DesignerPage() {
  return (
    <div className="relative -mx-6 -my-8 min-h-[calc(100vh-4rem)] overflow-hidden md:-mx-10 md:-my-10">
      <AuroraBackground />
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center justify-center px-6 py-20 text-center">
        <Reveal direction="scale">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-200 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            قادم في المرحلة 2 من الـ Roadmap
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="mb-6 text-5xl font-black leading-tight tracking-tight md:text-7xl"
          >
            <span className="text-gradient">محرر التصميم</span>
            <br />
            <span className="text-gradient-aurora">قادم قريباً</span>
          </motion.h1>
        </Reveal>

        <Reveal delay={0.25}>
          <p className="mx-auto mb-12 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground">
            محرر 3D متطور بالكامل في المتصفح. سحب وإفلات للوحدات، لصق ذكي،
            دوران 45°، ومساعد AI يفهم أوامرك النصية.
          </p>
        </Reveal>

        <Reveal delay={0.4}>
          <div className="mb-12 flex flex-wrap justify-center gap-3">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"
              >
                <f.icon className="h-4 w-4 text-violet-300" />
                {f.label}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.55}>
          <Magnetic>
            <button
              type="button"
              className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-white to-white/90 px-7 py-3.5 text-base font-semibold text-background shadow-2xl shadow-violet-500/30 transition-transform hover:scale-[1.02]"
            >
              <Sparkles className="h-4 w-4" />
              تنبيه عند الإطلاق
            </button>
          </Magnetic>
        </Reveal>
      </div>
    </div>
  );
}
