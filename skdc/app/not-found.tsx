import Link from "next/link";
import { cookies } from "next/headers";
import { Compass, Home, LogIn } from "lucide-react";

type Locale = "ar" | "en" | "zh";

const COPY: Record<
  Locale,
  {
    code: string;
    title: string;
    body: string;
    home: string;
    signIn: string;
  }
> = {
  ar: {
    code: "404",
    title: "الصفحة غير موجودة",
    body: "ربما تم نقل الصفحة، أو أن الرابط الذي اتبعته لم يعد صالحًا. لا تقلق — يمكنك دائمًا العودة إلى البداية.",
    home: "العودة إلى الرئيسية",
    signIn: "تسجيل الدخول",
  },
  en: {
    code: "404",
    title: "Page not found",
    body: "The page may have moved, or the link you followed is no longer valid. You can always head back to the start.",
    home: "Back to home",
    signIn: "Sign in",
  },
  zh: {
    code: "404",
    title: "页面未找到",
    body: "该页面可能已被移动，或者您所跟踪的链接已失效。您可以随时返回首页。",
    home: "返回首页",
    signIn: "登录",
  },
};

async function detectLocale(): Promise<Locale> {
  try {
    const store = await cookies();
    const raw = store.get("locale")?.value ?? store.get("NEXT_LOCALE")?.value;
    if (raw === "en" || raw === "zh" || raw === "ar") return raw;
  } catch {
    // headers/cookies unavailable in some build contexts — fall through
  }
  return "ar";
}

export default async function NotFound() {
  const locale = await detectLocale();
  const t = COPY[locale];
  const isRtl = locale === "ar";

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 text-foreground"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Static aurora glow */}
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
          className="absolute left-1/4 bottom-0 h-[480px] w-[480px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, var(--theme-stop-2, rgba(240,171,252,0.30)) 0%, transparent 70%)",
            filter: "blur(90px)",
          }}
        />
        <div
          className="absolute right-1/4 top-1/2 h-[420px] w-[420px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, var(--theme-stop-3, rgba(56,189,248,0.30)) 0%, transparent 70%)",
            filter: "blur(90px)",
          }}
        />
        <div className="absolute inset-0 bg-noise opacity-[0.015] mix-blend-overlay" />
      </div>

      <div className="glass relative z-10 mx-auto w-full max-w-2xl rounded-3xl p-10 text-center shadow-2xl">
        <div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{
            background:
              "linear-gradient(135deg, var(--theme-stop-1, #c084fc) 0%, var(--theme-stop-2, #f0abfc) 50%, var(--theme-stop-3, #38bdf8) 100%)",
          }}
        >
          <Compass className="h-8 w-8 text-background" strokeWidth={2.2} />
        </div>

        <p
          className="font-mono text-sm tracking-[0.4em] text-muted-foreground"
          dir="ltr"
        >
          {t.code}
        </p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl">
          <span className="text-gradient-aurora">{t.title}</span>
        </h1>
        {locale !== "en" ? (
          <p className="mt-2 text-xs text-muted-foreground" dir="ltr">
            {COPY.en.title}
          </p>
        ) : null}

        <p className="mx-auto mt-6 max-w-md text-base text-foreground/85">
          {t.body}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:scale-[1.02] hover:opacity-90"
          >
            <Home className="h-4 w-4" />
            <span>{t.home}</span>
          </Link>
          <Link
            href="/sign-in"
            className="glass inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-white/10"
          >
            <LogIn className="h-4 w-4" />
            <span>{t.signIn}</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
