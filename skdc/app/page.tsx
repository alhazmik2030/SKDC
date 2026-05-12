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

export default function LandingPage() {
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
              <div className="absolute inset-0 rounded-md bg-gradient-to-br from-violet-400 via-fuchsia-400 to-sky-400" />
              <div className="absolute inset-[2px] rounded-[5px] bg-background" />
              <div className="absolute inset-[5px] rounded-sm bg-gradient-to-br from-violet-400 to-sky-400" />
            </div>
            SKDC
          </Link>
          <div className="hidden gap-1 md:flex">
            {[
              { label: "المميزات", href: "#features" },
              { label: "كيف يعمل", href: "#how" },
              { label: "الأسعار", href: "#pricing" },
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
          <Magnetic strength={0.2}>
            <Link
              href="/sign-in"
              className="rounded-full bg-gradient-to-br from-white to-white/80 px-5 py-2 text-sm font-semibold text-background shadow-lg shadow-violet-500/20 transition-transform hover:scale-105"
            >
              ابدأ مجاناً
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
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-200 backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-400" />
            </span>
            منتج عربي حديث · سحابي 100%
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6 text-[clamp(48px,8vw,104px)] font-black leading-[1.05] tracking-tight"
          >
            <span className="text-gradient">صمّم مطبخك</span>
            <br />
            <span className="text-gradient-aurora">بذكاء سحابي</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mx-auto mb-10 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground md:text-xl"
          >
            منصة سحابية ذكية لتصميم المطابخ بقوالب جاهزة قابلة للتعديل، توليد
            فاتورة ومخطط قص تلقائياً، ودعم العربية والإنجليزية والصينية.
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
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-br from-white to-white/90 px-7 py-3.5 text-base font-semibold text-background shadow-2xl shadow-violet-500/30 transition-transform hover:scale-[1.02]"
              >
                <span className="relative z-10">جرّب مجاناً</span>
                <ArrowLeft className="relative z-10 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </Link>
            </Magnetic>
            <Magnetic>
              <Link
                href="#features"
                className="glass inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 text-base font-medium transition-colors hover:bg-white/10"
              >
                شاهد العرض
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
              <div className="glass rounded-3xl p-2 shadow-[0_60px_120px_-30px_rgba(167,139,250,0.4)]">
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-gradient-to-br from-card to-background">
                  <div className="flex items-center gap-2 border-b border-border/50 bg-background/50 px-4 py-3 backdrop-blur-sm">
                    <span className="h-3 w-3 rounded-full bg-red-500/70" />
                    <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
                    <span className="h-3 w-3 rounded-full bg-green-500/70" />
                    <div className="mr-4 flex-1 rounded-md bg-white/5 px-3 py-1 text-center text-xs text-muted-foreground">
                      skdc.app/editor/villa-kitchen-01
                    </div>
                  </div>
                  <div className="grid h-full grid-cols-[200px_1fr_240px] gap-2 p-3">
                    <div className="space-y-2">
                      <div className="text-[10px] text-muted-foreground">القوالب</div>
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
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-500/10 via-background to-sky-500/10">
                      <div className="absolute inset-0 grid-bg opacity-30" />
                      <motion.div
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 1.2, duration: 0.6 }}
                      >
                        <div className="text-xs text-muted-foreground">محرر 3D</div>
                      </motion.div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-[10px] text-muted-foreground">الخصائص</div>
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
              { num: "11", label: "جدول قاعدة بيانات" },
              { num: "3", label: "لغات مدعومة" },
              { num: "95%", label: "دقة صورة→تصميم" },
              { num: "∞", label: "تصاميم لكل ورشة" },
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
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-violet-300">
                المميزات
              </span>
              <h2 className="mt-4 text-5xl font-bold leading-tight tracking-tight md:text-6xl">
                <span className="text-gradient">كل ما تحتاجه</span>
                <br />
                <span className="text-gradient-aurora">في منصة واحدة</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Box, title: "محرر 3D ذكي", desc: "سحب وإفلات، دوران، لصق ذكي. كل شي من المتصفح بدون SketchUp.", color: "from-violet-400 to-fuchsia-400" },
              { icon: Layers, title: "مكتبة قوالب", desc: "وحدات سفلية، علوية، أركان، إكسسوارات. قابلة للتعديل قبل الدمج.", color: "from-sky-400 to-cyan-400" },
              { icon: Scissors, title: "Cutting Diagram", desc: "مخطط قص تلقائي يقلل الهدر ويسرّع التصنيع في الورشة.", color: "from-emerald-400 to-teal-400" },
              { icon: Bot, title: "مساعد AI مدمج", desc: "اكتب 'صمم مطبخ ركن 4×3 مودرن أبيض' وشاهد التنفيذ في ثوان.", color: "from-amber-400 to-orange-400" },
              { icon: ImageIcon, title: "صورة → تصميم", desc: "ارفع صورة لمطبخ أو رسم يدوي، الذكاء يحوّلها لتصميم 3D.", color: "from-pink-400 to-rose-400" },
              { icon: Globe2, title: "3 لغات", desc: "العربية (RTL) + الإنجليزية + الصينية. للسوق المحلي والعالمي.", color: "from-indigo-400 to-violet-400" },
            ].map((feature, i) => (
              <Reveal key={feature.title} delay={i * 0.08}>
                <TiltCard intensity={8}>
                  <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card/50 p-7 backdrop-blur-sm transition-colors hover:border-violet-400/40">
                    <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} shadow-lg`}>
                      <feature.icon className="h-6 w-6 text-background" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
                    <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-gradient-to-br from-violet-400/20 to-transparent opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
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
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-sky-300">كيف يعمل</span>
              <h2 className="mt-4 text-5xl font-bold tracking-tight md:text-6xl">
                <span className="text-gradient">من فكرة</span>{" "}
                <span className="text-gradient-aurora">إلى ورشة</span>
              </h2>
              <p className="mt-6 text-lg text-muted-foreground">في 4 خطوات سريعة، تصميم احترافي جاهز للتصنيع.</p>
            </div>
          </Reveal>

          <div className="grid gap-4 md:grid-cols-4">
            {[
              { num: "01", title: "اختر قالب", desc: "من مكتبة الوحدات الجاهزة." },
              { num: "02", title: "خصّص الأبعاد", desc: "عدّل بحسب أبعاد العميل." },
              { num: "03", title: "ولّد التقارير", desc: "فاتورة + مخطط قص + قائمة قطع." },
              { num: "04", title: "أرسل للورشة", desc: "PDF احترافي جاهز للتصنيع." },
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
            <div className="relative overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-violet-500/10 via-card to-sky-500/10 p-12 text-center md:p-20">
              <AuroraBackground />
              <div className="relative z-10">
                <Sparkles className="mx-auto mb-6 h-12 w-12 text-violet-300" />
                <h2 className="text-balance text-4xl font-bold tracking-tight md:text-6xl">
                  <span className="text-gradient">جاهز للبدء؟</span>
                  <br />
                  <span className="text-gradient-aurora">ابنِ مطبخك الأول مجاناً</span>
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
                  بدون بطاقة ائتمان. بدون تثبيت. كل شي يعمل من المتصفح.
                </p>
                <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                  <Magnetic>
                    <Link
                      href="/sign-in"
                      className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-white to-white/90 px-8 py-4 font-bold text-background shadow-2xl shadow-violet-500/30 transition-transform hover:scale-105"
                    >
                      <Zap className="h-5 w-5" />
                      ابدأ التصميم الآن
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
                "radial-gradient(ellipse at center, rgba(167, 139, 250, 0.25), transparent 60%)",
              filter: "blur(40px)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-16">
          {/* Founder card */}
          <Reveal direction="scale">
            <div className="mx-auto mb-12 max-w-2xl">
              <div className="glass relative overflow-hidden rounded-2xl p-8 text-center">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-sky-500/5" />
                <div className="relative">
                  <div className="font-mono text-xs uppercase tracking-[0.3em] text-violet-300">
                    Founder · المؤسس
                  </div>
                  <div className="mt-3 text-3xl font-bold tracking-tight text-gradient-aurora md:text-4xl">
                    خالد الحازمي
                  </div>
                  <div className="mt-2 font-mono text-xs text-muted-foreground">
                    تأسيس · 15 مايو 2026 · الرياض، المملكة العربية السعودية
                  </div>
                  <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />
                  <div className="mt-6 text-sm italic leading-relaxed text-muted-foreground">
                    &ldquo;صناعة منتج تقني عربي بمعايير عالمية&rdquo;
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
                — Smart Kitchen Design Cloud
              </span>
            </div>
            <div className="font-mono text-xs">
              صُنع في المملكة العربية السعودية 🇸🇦
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
