"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Mail, Sparkles } from "lucide-react";

import { Magnetic } from "@/components/effects/magnetic";

const schema = z.object({
  email: z
    .string()
    .min(1, "البريد الإلكتروني مطلوب")
    .email("صيغة البريد الإلكتروني غير صحيحة"),
});

type FormValues = z.infer<typeof schema>;

export default function SignInPage() {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  async function onSubmit({ email }: FormValues) {
    setSubmitting(true);
    try {
      const res = await signIn("email", {
        email,
        redirect: false,
        callbackUrl: "/dashboard",
      });
      if (res?.error) {
        toast.error("تعذّر إرسال رابط الدخول، حاول مرة أخرى.");
      } else {
        toast.success("تحقق من بريدك الإلكتروني");
        window.location.href = "/verify-request";
      }
    } catch {
      toast.error("حدث خطأ غير متوقع.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md"
    >
      <div className="glass relative overflow-hidden rounded-3xl p-8 shadow-[0_60px_120px_-30px_rgba(167,139,250,0.4)] md:p-10">
        {/* Decorative aurora glow inside card */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 -z-0 h-48 w-72 -translate-x-1/2"
          style={{
            background:
              "radial-gradient(ellipse, rgba(167,139,250,0.35) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        <div className="relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-200 backdrop-blur-md">
              <Sparkles className="h-3 w-3" />
              مرحباً بعودتك
            </div>
            <h1 className="text-4xl font-black leading-tight tracking-tight md:text-5xl">
              <span className="text-gradient-aurora">سجّل دخولك</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              أدخل بريدك الإلكتروني وسنرسل لك رابط دخول آمن.
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-xs font-medium text-muted-foreground"
              >
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  dir="ltr"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 pr-10 text-base text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-violet-400/50 focus:bg-white/[0.05] focus:ring-2 focus:ring-violet-400/20"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <Magnetic strength={0.15} className="!block w-full">
              <button
                type="submit"
                disabled={submitting}
                className="group relative inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br from-white to-white/90 text-base font-bold text-background shadow-2xl shadow-violet-500/30 transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جارٍ الإرسال…
                  </>
                ) : (
                  <>
                    أرسل رابط الدخول
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  </>
                )}
              </button>
            </Magnetic>
          </motion.form>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="my-6 flex items-center gap-3"
          >
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <span className="text-xs text-muted-foreground">أو</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </motion.div>

          {/* Google OAuth placeholder */}
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onClick={() => toast("قريباً", { description: "تسجيل الدخول بـ Google" })}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] text-sm font-medium text-foreground transition-colors hover:border-white/20 hover:bg-white/[0.06]"
          >
            <GoogleIcon className="h-5 w-5" />
            متابعة باستخدام Google
          </motion.button>

          {/* Sign-up link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 text-center text-sm text-muted-foreground"
          >
            ليس لديك حساب؟{" "}
            <Link
              href="/sign-up"
              className="font-semibold text-foreground transition-colors hover:text-violet-300"
            >
              أنشئ حساباً جديداً
            </Link>
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}

function GoogleIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.92h5.46c-.24 1.4-1.69 4.1-5.46 4.1-3.29 0-5.97-2.72-5.97-6.07S8.71 6.08 12 6.08c1.87 0 3.13.79 3.85 1.48l2.63-2.53C16.9 3.55 14.66 2.6 12 2.6 6.86 2.6 2.7 6.76 2.7 11.9s4.16 9.3 9.3 9.3c5.37 0 8.93-3.77 8.93-9.08 0-.61-.07-1.08-.16-1.55H12z"
      />
    </svg>
  );
}
