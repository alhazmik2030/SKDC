"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw, Home } from "lucide-react";

/**
 * Global route error boundary.
 * Lightweight (no framer-motion) — matches the premium aurora aesthetic
 * using CSS-only blobs + theme vars + theme-stop gradients.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[SKDC] route error:", error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 text-foreground">
      {/* Static aurora glow (no JS) */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div
          className="absolute left-1/2 top-1/3 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, var(--theme-stop-1, rgba(167,139,250,0.45)) 0%, transparent 70%)",
            filter: "blur(90px)",
          }}
        />
        <div
          className="absolute right-1/4 top-2/3 h-[480px] w-[480px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, var(--theme-stop-3, rgba(56,189,248,0.32)) 0%, transparent 70%)",
            filter: "blur(90px)",
          }}
        />
        <div className="absolute inset-0 bg-noise opacity-[0.015] mix-blend-overlay" />
      </div>

      <div className="glass relative z-10 mx-auto w-full max-w-xl rounded-3xl p-10 text-center shadow-2xl">
        <div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{
            background:
              "linear-gradient(135deg, var(--theme-stop-1, #c084fc) 0%, var(--theme-stop-2, #f0abfc) 50%, var(--theme-stop-3, #38bdf8) 100%)",
          }}
        >
          <AlertTriangle className="h-8 w-8 text-background" strokeWidth={2.2} />
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          <span className="text-gradient-aurora">حدث خطأ غير متوقع</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground" dir="ltr">
          Something went wrong on our end.
        </p>

        <p className="mt-6 text-base text-foreground/85" dir="rtl">
          واجهنا مشكلة أثناء عرض هذه الصفحة. حاول مرة أخرى أو ارجع إلى الصفحة
          الرئيسية.
        </p>

        {error?.digest ? (
          <p
            className="mt-4 inline-block rounded-full border border-border bg-card/40 px-3 py-1 font-mono text-[11px] text-muted-foreground"
            dir="ltr"
          >
            ref: {error.digest}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={() => reset()}
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:scale-[1.02] hover:opacity-90"
          >
            <RotateCw className="h-4 w-4 transition group-hover:rotate-180" />
            <span>إعادة المحاولة</span>
            <span className="opacity-60" dir="ltr">
              · Reload
            </span>
          </button>
          <Link
            href="/"
            className="glass inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-white/10"
          >
            <Home className="h-4 w-4" />
            <span>الصفحة الرئيسية</span>
            <span className="opacity-60" dir="ltr">
              · Go home
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
