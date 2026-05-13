"use client";

import { motion } from "framer-motion";
import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Mail, Sparkles, Lock, Eye, EyeOff } from "lucide-react";

import { Magnetic } from "@/components/effects/magnetic";
import { useI18n } from "@/components/i18n-provider";

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const { t } = useI18n();
  const router = useRouter();
  const search = useSearchParams();
  const callbackUrl = search.get("from") || "/dashboard";

  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const schema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .min(1, t("auth.errors.emailRequired"))
          .email(t("auth.errors.emailInvalid")),
        password: z.string().min(1, t("auth.errors.passwordRequired")),
      }),
    [t],
  );

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit({ email, password }: FormValues) {
    setSubmitting(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });
      if (res?.error) {
        toast.error(t("auth.signIn.invalidCredentials"));
      } else if (res?.ok) {
        toast.success(t("auth.signIn.welcomeBack"));
        router.push(callbackUrl);
      }
    } catch {
      toast.error(t("common.unexpectedError"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } catch {
      setGoogleLoading(false);
      toast.error(t("auth.signIn.errorGoogle"));
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
        <div
          className="pointer-events-none absolute -top-24 left-1/2 -z-0 h-48 w-72 -translate-x-1/2"
          style={{
            background:
              "radial-gradient(ellipse, var(--theme-halo, rgba(167,139,250,0.35)) 0%, transparent 70%)",
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
              {t("auth.signIn.tagline")}
            </div>
            <h1 className="text-4xl font-black leading-tight tracking-tight md:text-5xl">
              <span className="text-gradient-aurora">{t("auth.signIn.title")}</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t("auth.signIn.subtitle")}
            </p>
          </motion.div>

          {/* Google Sign-in (top) */}
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            onClick={handleGoogle}
            disabled={googleLoading || submitting}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] text-sm font-medium text-foreground transition-colors hover:border-white/20 hover:bg-white/[0.06] disabled:opacity-60"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon className="h-5 w-5" />
            )}
            {t("auth.continueGoogle")}
          </motion.button>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <span className="text-xs text-muted-foreground">{t("auth.signIn.orPassword")}</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs font-medium text-muted-foreground">
                {t("auth.signIn.emailLabel")}
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  dir="ltr"
                  autoComplete="email"
                  placeholder={t("auth.signIn.emailPlaceholder")}
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 pr-10 text-base text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-violet-400/50 focus:bg-white/[0.05] focus:ring-2 focus:ring-violet-400/20"
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-xs font-medium text-muted-foreground">
                {t("auth.signIn.passwordLabel")}
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  dir="ltr"
                  autoComplete="current-password"
                  placeholder={t("auth.signIn.passwordPlaceholder")}
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 pl-10 pr-10 text-base text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-violet-400/50 focus:bg-white/[0.05] focus:ring-2 focus:ring-violet-400/20"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? t("auth.signIn.passwordHide") : t("auth.signIn.passwordShow")}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400">{errors.password.message}</p>
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
                    {t("auth.signIn.submitting")}
                  </>
                ) : (
                  <>
                    {t("auth.signIn.submit")}
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  </>
                )}
              </button>
            </Magnetic>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 text-center text-sm text-muted-foreground"
          >
            {t("auth.signIn.noAccount")}{" "}
            <Link
              href="/sign-up"
              className="font-semibold text-foreground transition-colors hover:text-violet-300"
            >
              {t("auth.signIn.signUpLink")}
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
