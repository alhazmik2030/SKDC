"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, MailCheck } from "lucide-react";

export default function VerifyRequestPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md"
    >
      <div className="glass relative overflow-hidden rounded-3xl p-10 text-center shadow-[0_60px_120px_-30px_rgba(56,189,248,0.4)]">
        {/* Aurora glow */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 -z-0 h-48 w-72 -translate-x-1/2"
          style={{
            background:
              "radial-gradient(ellipse, rgba(56,189,248,0.35) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        <div className="relative z-10">
          {/* Animated mail icon */}
          <div className="mb-6 flex justify-center">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 14,
                delay: 0.15,
              }}
              className="relative"
            >
              {/* Pulsing halo */}
              <motion.div
                className="absolute inset-0 -z-10"
                style={{
                  background:
                    "radial-gradient(circle, rgba(56,189,248,0.5) 0%, transparent 70%)",
                  filter: "blur(20px)",
                }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-violet-400 to-fuchsia-400 shadow-2xl shadow-sky-500/40">
                <MailCheck className="h-10 w-10 text-background" />
              </div>
            </motion.div>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-4xl font-black tracking-tight md:text-5xl"
          >
            <span className="text-gradient-aurora">تحقق من بريدك</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mx-auto mt-4 max-w-sm text-balance text-sm leading-relaxed text-muted-foreground"
          >
            أرسلنا لك رابط الدخول، انقر عليه لإكمال التسجيل.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="mt-8 rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-xs leading-relaxed text-muted-foreground"
          >
            <span className="block font-semibold text-foreground">نصيحة</span>
            <span className="mt-1 block">
              لم تجد البريد؟ تفقّد مجلد الرسائل غير المرغوبة، أو حاول مجدداً
              بعد دقيقة.
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-8 flex flex-col items-center gap-3"
          >
            <Link
              href="/sign-in"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-sky-300"
            >
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              العودة إلى تسجيل الدخول
            </Link>
            <Link
              href="/"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              العودة إلى الصفحة الرئيسية
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
