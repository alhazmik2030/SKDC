import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Cairo } from "next/font/google";
import { Toaster } from "sonner";
import { SmoothScroll } from "@/components/effects/smooth-scroll";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeSwitcherProvider } from "@/components/theme-switcher";
import { SessionProvider } from "@/components/session-provider";
import { I18nProvider } from "@/components/i18n-provider";
import "./globals.css";

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Why: trimmed Cairo to 4 weights (was 7) — saves ~30KB of font payload.
// 400 (body), 600 (medium emphasis), 700 (headings), 900 (hero display).
const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "900"],
  display: "swap",
});

const SITE_URL = "https://skdc-production.up.railway.app";
const SITE_TITLE = "صمّم مطبخك بذكاء سحابي";
const SITE_DESCRIPTION =
  "منصة سحابية ذكية لتصميم المطابخ بقوالب جاهزة قابلة للتعديل، توليد فاتورة ومخطط قص تلقائياً، ودعم 3 لغات.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s — SKDC",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "مطابخ",
    "تصميم مطابخ",
    "كاد",
    "Cutting Diagram",
    "SaaS",
    "Cloud",
    "Kitchen Design Software",
    "Saudi Arabia",
    "CNC",
    "Cabinet Design",
    "橱柜设计",
    "板材",
  ],
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "SKDC",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "ar_SA",
    alternateLocale: ["en_US", "zh_CN"],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* Why: next/font self-hosts Google Fonts so no preconnect needed,
            but a dns-prefetch courtesy hint costs nothing and helps older clients. */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      </head>
      <body
        className={`${cairo.variable} ${geist.variable} ${geistMono.variable} font-arabic antialiased min-h-full`}
      >
        <SessionProvider>
          <I18nProvider>
            <ThemeProvider>
              <ThemeSwitcherProvider>
                <SmoothScroll>{children}</SmoothScroll>
              </ThemeSwitcherProvider>
            </ThemeProvider>
          </I18nProvider>
        </SessionProvider>
        <Toaster
          position="top-center"
          theme="dark"
          richColors
          toastOptions={{
            classNames: {
              toast: "glass !bg-card/80 !text-foreground !border-border",
            },
          }}
        />
      </body>
    </html>
  );
}
