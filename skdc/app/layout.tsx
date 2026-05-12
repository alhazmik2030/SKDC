import type { Metadata } from "next";
import { Geist, Geist_Mono, Cairo } from "next/font/google";
import { Toaster } from "sonner";
import { SmoothScroll } from "@/components/effects/smooth-scroll";
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

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SKDC — صمّم مطبخك بذكاء سحابي",
  description:
    "منصة سحابية ذكية لتصميم المطابخ بقوالب جاهزة قابلة للتعديل، توليد فاتورة ومخطط قص تلقائياً، ودعم 3 لغات.",
  keywords: ["مطابخ", "تصميم مطابخ", "Cutting Diagram", "SaaS", "Cloud"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${cairo.variable} ${geist.variable} ${geistMono.variable} font-arabic antialiased min-h-full`}
      >
        <SmoothScroll>{children}</SmoothScroll>
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
