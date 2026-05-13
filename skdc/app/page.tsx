"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Box,
  Scissors,
  Globe2,
  Zap,
  Image as ImageIcon,
  Bot,
  Cloud,
  Layers,
} from "lucide-react";
import { AuroraBackground } from "@/components/effects/aurora-background";
import { Magnetic } from "@/components/effects/magnetic";
import { Reveal } from "@/components/effects/reveal";
import { TiltCard } from "@/components/effects/tilt-card";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/components/i18n-provider";

export default function LandingPage() {
  const { t } = useI18n();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-6 left-1/2 z-50 -translate-x-1/2">
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="glass flex items-center gap-2 rounded-full px-2 py-2 shadow-2xl"
        >
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-1.5 text-sm font-bold tracking-wide"
          >
            <div className="relative h-6 w-6">
              <div
                className="absolute inset-0 rounded-md"
                style={{
                  background:
                    "linear-gradient(135deg, var(--theme-stop-1, #c084fc) 0%, var(--theme-stop-2, #f0abfc) 50%, var(--theme-stop-3, #38bdf8) 100%)",
                }}
              />
              <div className="absolute inset-[2px] rounded-[5px] bg-background" />
              <div
                className="absolute inset-[5px] rounded-sm"
                style={{
                  background:
                    "linear-gradient(135deg, var(--theme-stop-1, #c084fc) 0%, var(--theme-stop-3, #38bdf8) 100%)",
                }}
              />
            </div>
            SKDC
          </Link>
          <div className="hidden gap-1 md:flex">
            {[
              { label: t("landing.nav.features"), href: "#features" },
              { label: t("landing.nav.how"), href: "#how" },
              { label: t("landing.nav.pricing"), href: "#pricing" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <LanguageSwitcher variant="compact" />
          <Magnetic strength={0.2}>
            <Link
              href="/sign-in"
              className="rounded-full bg-gradient-to-br from-white to-white/80 px-5 py-2 text-sm font-semibold text-background shadow-lg transition-transform hover:scale-105"
              style={{
                boxShadow:
                  "0 10px 15px -3px var(--theme-halo, rgba(167,139,250,0.25)), 0 4px 6px -4px var(--theme-halo, rgba(167,139,250,0.25))",
              }}
            >
              {t("landing.nav.startFree")}
            </Link>
          </Magnetic>
        </motion.div>
      </nav>

      {/* ===== HERO ===== */}
      <section
        ref={heroRef}
        className="relative flex min-h-screen items-center justify-center px-6 pt-32"
      >
        <AuroraBackground />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 mx-auto max-w-5xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm backdrop-blur-md"
            style={{
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: "color-mix(in srgb, var(--theme-stop-1, #c084fc) 30%, transparent)",
              backgroundColor:
                "color-mix(in srgb, var(--theme-stop-1, #c084fc) 10%, transparent)",
              color: "var(--theme-stop-1, #c084fc)",
            }}
          >
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                style={{ backgroundColor: "var(--theme-stop-1, #c084fc)" }}
              />
              <span
                className="relative inline-flex h-2 w-2 rounded-full"
                style={{ backgroundColor: "var(--theme-stop-1, #c084fc)" }}
              />
            </span>
            {t("landing.hero.badge")}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6 text-[clamp(48px,8vw,104px)] font-black leading-[1.05] tracking-tight"
          >
            <span className="text-gradient">{t("landing.hero.titleLine1")}</span>
            <br />
            <span className="text-gradient-aurora">{t("landing.hero.titleLine2")}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mx-auto mb-10 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground md:text-xl"
          >
            {t("landing.hero.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Magnetic>
              <Link
                href="/sign-in"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-br from-white to-white/90 px-7 py-3.5 text-base font-semibold text-background shadow-2xl transition-transform hover:scale-[1.02]"
                style={{
                  boxShadow:
                    "0 25px 50px -12px var(--theme-halo, rgba(167,139,250,0.30))",
                }}
              >
                <span className="relative z-10">{t("landing.ctaPrimary")}</span>
                <ArrowLeft className="relative z-10 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </Link>
            </Magnetic>
            <Magnetic>
              <Link
                href="#features"
                className="glass inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 text-base font-medium transition-colors hover:bg-white/10"
              >
                {t("landing.ctaSecondary")}
              </Link>
            </Magnetic>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-20"
          >
            <TiltCard className="mx-auto max-w-4xl">
              <div
                className="glass rounded-3xl p-2"
                style={{
                  boxShadow:
                    "0 60px 120px -30px var(--theme-halo, rgba(167,139,250,0.40))",
                }}
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-gradient-to-br from-card to-background">
                  <div className="flex items-center gap-2 border-b border-border/50 bg-background/50 px-4 py-3 backdrop-blur-sm">
                    <span className="h-3 w-3 rounded-full bg-red-500/70" />
                    <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
                    <span className="h-3 w-3 rounded-full bg-green-500/70" />
                    <div className="mr-4 flex-1 rounded-md bg-white/5 px-3 py-1 text-center text-xs text-muted-foreground">
                      {t("landing.mockup.url")}
                    </div>
                  </div>
                  <div className="grid h-full grid-cols-[200px_1fr_240px] gap-2 p-3">
                    <div className="space-y-2">
                      <div className="text-[10px] text-muted-foreground">
                        {t("landing.mockup.templates")}
                      </div>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <motion.div
                          key={i}
                          className="aspect-square rounded-lg bg-gradient-to-br from-white/[0.05] to-white/[0.02] ring-1 ring-white/5"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1 + i * 0.05 }}
                        />
                      ))}
                    </div>
                    <div
                      className="relative overflow-hidden rounded-xl"
                      style={{
                        background:
                          "linear-gradient(135deg, color-mix(in srgb, var(--theme-stop-1, #c084fc) 10%, transparent) 0%, hsl(var(--background)) 50%, color-mix(in srgb, var(--theme-stop-3, #38bdf8) 10%, transparent) 100%)",
                      }}
                    >
                      <div className="absolute inset-0 grid-bg opacity-30" />
                      <motion.div
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 1.2, duration: 0.6 }}
                      >
                        <div className="text-xs text-muted-foreground">
                          {t("landing.mockup.editor3d")}
                        </div>
                      </motion.div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-[10px] text-muted-foreground">
                        {t("landing.mockup.properties")}
                      </div>
                      {[1, 2, 3, 4].map((i) => (
                        <motion.div
                          key={i}
                          className="h-6 rounded bg-white/[0.04]"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1 + i * 0.07 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TiltCard>
          </motion.div>
        </motion.div>
      </section>

      {/* ===== STATS ===== */}
      <section className="relative border-y border-border/50 bg-card/30 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { num: "11", label: t("landing.stats.db") },
              { num: "3", label: t("landing.stats.languages") },
              { num: "95%", label: t("landing.stats.accuracy") },
              { num: "∞", label: t("landing.stats.designs") },
            ].map((stat, i) => (
              <Reveal key={stat.label} delay={i * 0.1}>
                <div className="text-center">
                  <div className="font-mono text-4xl font-bold text-gradient-aurora md:text-5xl">
                    {stat.num}
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="relative py-32">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mx-auto mb-20 max-w-3xl text-center">
              <span
                className="font-mono text-xs uppercase tracking-[0.2em]"
                style={{ color: "var(--theme-stop-1, #c084fc)" }}
              >
                {t("landing.features.eyebrow")}
              </span>
              <h2 className="mt-4 text-5xl font-bold leading-tight tracking-tight md:text-6xl">
                <span className="text-gradient">{t("landing.features.titleLine1")}</span>
                <br />
                <span className="text-gradient-aurora">{t("landing.features.titleLine2")}</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Box,
                title: t("landing.feature.editor.title"),
                desc: t("landing.feature.editor.desc"),
                color: "from-violet-400 to-fuchsia-400",
              },
              {
                icon: Layers,
                title: t("landing.feature.library.title"),
                desc: t("landing.feature.library.desc"),
                color: "from-sky-400 to-cyan-400",
              },
              {
                icon: Scissors,
                title: t("landing.feature.cutting.title"),
                desc: t("landing.feature.cutting.desc"),
                color: "from-emerald-400 to-teal-400",
              },
              {
                icon: Bot,
                title: t("landing.feature.ai.title"),
                desc: t("landing.feature.ai.desc"),
                color: "from-amber-400 to-orange-400",
              },
              {
                icon: ImageIcon,
                title: t("landing.feature.image.title"),
                desc: t("landing.feature.image.desc"),
                color: "from-pink-400 to-rose-400",
              },
              {
                icon: Globe2,
                title: t("landing.feature.langs.title"),
                desc: t("landing.feature.langs.desc"),
                color: "from-indigo-400 to-violet-400",
              },
            ].map((feature, i) => (
              <Reveal key={feature.title} delay={i * 0.08}>
                <TiltCard intensity={8}>
                  <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card/50 p-7 backdrop-blur-sm transition-colors hover:border-[var(--theme-stop-1,#c084fc)]/40">
                    <div
                      className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} shadow-lg`}
                    >
                      <feature.icon className="h-6 w-6 text-background" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
                    <div
                      className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-100"
                      style={{
                        background:
                          "radial-gradient(circle, color-mix(in srgb, var(--theme-stop-1, #c084fc) 20%, transparent) 0%, transparent 70%)",
                      }}
                    />
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" className="relative overflow-hidden border-t border-border/50 py-32">
        <AuroraBackground />
        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mx-auto mb-20 max-w-3xl text-center">
              <span
                className="font-mono text-xs uppercase tracking-[0.2em]"
                style={{ color: "var(--theme-stop-3, #38bdf8)" }}
              >
                {t("landing.how.eyebrow")}
              </span>
              <h2 className="mt-4 text-5xl font-bold tracking-tight md:text-6xl">
                <span className="text-gradient">{t("landing.how.titleLine1")}</span>{" "}
                <span className="text-gradient-aurora">{t("landing.how.titleLine2")}</span>
              </h2>
              <p className="mt-6 text-lg text-muted-foreground">{t("landing.how.subtitle")}</p>
            </div>
          </Reveal>

          <div className="grid gap-4 md:grid-cols-4">
            {[
              {
                num: "01",
                title: t("landing.how.step1.title"),
                desc: t("landing.how.step1.desc"),
              },
              {
                num: "02",
                title: t("landing.how.step2.title"),
                desc: t("landing.how.step2.desc"),
              },
              {
                num: "03",
                title: t("landing.how.step3.title"),
                desc: t("landing.how.step3.desc"),
              },
              {
                num: "04",
                title: t("landing.how.step4.title"),
                desc: t("landing.how.step4.desc"),
              },
            ].map((step, i) => (
              <Reveal key={step.num} delay={i * 0.1} direction="up">
                <div className="glass relative h-full rounded-2xl p-6">
                  <div className="font-mono text-5xl font-bold text-gradient-aurora">{step.num}</div>
                  <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative py-32">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal direction="scale">
            <div
              className="relative overflow-hidden rounded-[2rem] border border-border p-12 text-center md:p-20"
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in srgb, var(--theme-stop-1, #c084fc) 10%, transparent) 0%, hsl(var(--card)) 50%, color-mix(in srgb, var(--theme-stop-3, #38bdf8) 10%, transparent) 100%)",
              }}
            >
              <AuroraBackground />
              <div className="relative z-10">
                <Sparkles
                  className="mx-auto mb-6 h-12 w-12"
                  style={{ color: "var(--theme-stop-1, #c084fc)" }}
                />
                <h2 className="text-balance text-4xl font-bold tracking-tight md:text-6xl">
                  <span className="text-gradient">{t("landing.cta.titleLine1")}</span>
                  <br />
                  <span className="text-gradient-aurora">{t("landing.cta.titleLine2")}</span>
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
                  {t("landing.cta.subtitle")}
                </p>
                <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                  <Magnetic>
                    <Link
                      href="/sign-in"
                      className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-white to-white/90 px-8 py-4 font-bold text-background shadow-2xl transition-transform hover:scale-105"
                      style={{
                        boxShadow:
                          "0 25px 50px -12px var(--theme-halo, rgba(167,139,250,0.30))",
                      }}
                    >
                      <Zap className="h-5 w-5" />
                      {t("landing.cta.button")}
                      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    </Link>
                  </Magnetic>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative overflow-hidden border-t border-border/50">
        {/* Subtle aurora glow */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute left-1/2 top-0 h-40 w-[80%] -translate-x-1/2 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse at center, var(--theme-halo, rgba(167, 139, 250, 0.25)), transparent 60%)",
              filter: "blur(40px)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-16">
          {/* Founder card */}
          <Reveal direction="scale">
            <div className="mx-auto mb-12 max-w-2xl">
              <div className="glass relative overflow-hidden rounded-2xl p-8 text-center">
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(135deg, color-mix(in srgb, var(--theme-stop-1, #c084fc) 5%, transparent) 0%, transparent 50%, color-mix(in srgb, var(--theme-stop-3, #38bdf8) 5%, transparent) 100%)",
                  }}
                />
                <div className="relative">
                  <div className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-300">
                    {t("landing.footer.founder")}
                  </div>

                  {/* Saudi flag above the name */}
                  <div className="mt-5 flex justify-center">
                    <div className="relative inline-flex h-10 w-16 items-center justify-center overflow-hidden rounded-md shadow-lg shadow-emerald-500/30 ring-1 ring-emerald-400/30">
                      <span className="text-3xl leading-none">🇸🇦</span>
                    </div>
                  </div>

                  <div className="relative mt-6 inline-block">
                    {/* Halo glow behind the name */}
                    <div
                      className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-32 w-64"
                      style={{
                        background:
                          "radial-gradient(ellipse, rgba(16, 185, 129, 0.45) 0%, rgba(110, 231, 183, 0.25) 40%, transparent 70%)",
                        filter: "blur(30px)",
                        animation: "name-halo 4s ease-in-out infinite",
                      }}
                    />
                    {/* The shining name in Saudi green */}
                    <div className="text-shine-saudi text-4xl font-black tracking-tight md:text-5xl">
                      {t("landing.footer.founderName")}
                    </div>
                    {/* Sparkle decorations in green */}
                    <Sparkles className="absolute -right-6 -top-2 h-4 w-4 animate-pulse text-emerald-300" />
                    <Sparkles
                      className="absolute -left-6 -bottom-1 h-3 w-3 animate-pulse text-emerald-200"
                      style={{ animationDelay: "1s" }}
                    />
                  </div>

                  <div className="mt-8 font-mono text-xs text-muted-foreground">
                    {t("landing.footer.foundedOn")}
                  </div>
                  <div
                    className="mx-auto mt-6 h-px w-24"
                    style={{
                      background:
                        "linear-gradient(to right, transparent, color-mix(in srgb, var(--theme-stop-1, #c084fc) 50%, transparent), transparent)",
                    }}
                  />
                  <div className="mt-6 text-sm italic leading-relaxed text-muted-foreground">
                    &ldquo;{t("landing.footer.quote")}&rdquo;
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Bottom bar */}
          <div className="flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 text-sm text-muted-foreground md:flex-row">
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              <span>
                <span className="font-bold text-foreground">SKDC</span> © 2026
                — {t("landing.footer.copyright")}
              </span>
            </div>
            <div className="font-mono text-xs">{t("landing.footer.madeIn")}</div>
          </div>
        </div>
      </footer>
    </main>
  );
}
