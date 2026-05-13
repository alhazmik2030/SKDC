"use client";

/**
 * Top-level error boundary that fires when the root layout itself crashes.
 * Must render its own <html>/<body> shell.
 * Tailwind / fonts / theme vars may not be available — everything is inline.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, 'Cairo', sans-serif",
          color: "#fafafa",
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          position: "relative",
          overflow: "hidden",
          WebkitFontSmoothing: "antialiased",
        }}
      >
        {/* Aurora glow — hard-coded gradient, no Tailwind */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 30%, rgba(167,139,250,0.35) 0%, transparent 55%), radial-gradient(circle at 75% 70%, rgba(56,189,248,0.28) 0%, transparent 55%), radial-gradient(circle at 25% 70%, rgba(236,72,153,0.22) 0%, transparent 55%)",
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            maxWidth: "520px",
            padding: "40px 32px",
            borderRadius: "24px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.10)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              margin: "0 auto 20px",
              width: "60px",
              height: "60px",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg, #c084fc 0%, #f0abfc 50%, #38bdf8 100%)",
              color: "#0a0a0a",
              fontSize: "28px",
              fontWeight: 800,
            }}
          >
            !
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              background:
                "linear-gradient(135deg, #c084fc 0%, #f0abfc 35%, #38bdf8 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              WebkitTextFillColor: "transparent",
            }}
          >
            خطأ جسيم في النظام
          </h1>
          <p
            dir="ltr"
            style={{
              margin: "6px 0 0",
              fontSize: "13px",
              color: "rgba(250,250,250,0.55)",
            }}
          >
            A critical error occurred.
          </p>

          <p
            style={{
              margin: "24px 0 0",
              fontSize: "15px",
              lineHeight: 1.7,
              color: "rgba(250,250,250,0.85)",
            }}
          >
            تعذّر تحميل التطبيق. يرجى إعادة المحاولة، وإذا استمرت المشكلة فقد
            تساعدنا إعادة تحميل الصفحة بالكامل.
          </p>

          {error?.digest ? (
            <p
              dir="ltr"
              style={{
                display: "inline-block",
                marginTop: "16px",
                padding: "4px 12px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                fontSize: "11px",
                color: "rgba(250,250,250,0.6)",
              }}
            >
              ref: {error.digest}
            </p>
          ) : null}

          <div
            style={{
              marginTop: "28px",
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => reset()}
              style={{
                cursor: "pointer",
                appearance: "none",
                border: "none",
                padding: "12px 24px",
                borderRadius: "999px",
                fontSize: "14px",
                fontWeight: 600,
                background: "#fafafa",
                color: "#0a0a0a",
                fontFamily: "inherit",
              }}
            >
              إعادة المحاولة · Reload
            </button>
            <a
              href="/"
              style={{
                display: "inline-block",
                padding: "12px 24px",
                borderRadius: "999px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#fafafa",
                textDecoration: "none",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.10)",
                fontFamily: "inherit",
              }}
            >
              الصفحة الرئيسية · Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
