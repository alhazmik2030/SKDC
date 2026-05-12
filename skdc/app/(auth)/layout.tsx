import Link from "next/link";
import { AuroraBackground } from "@/components/effects/aurora-background";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Animated aurora background */}
      <AuroraBackground />

      {/* Minimal top-left brand mark — no full navbar in the auth flow */}
      <div className="absolute top-6 right-6 z-20">
        <Link
          href="/"
          className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold tracking-wide transition-colors hover:bg-white/10"
        >
          <div className="relative h-6 w-6">
            <div className="absolute inset-0 rounded-md bg-gradient-to-br from-violet-400 via-fuchsia-400 to-sky-400" />
            <div className="absolute inset-[2px] rounded-[5px] bg-background" />
            <div className="absolute inset-[5px] rounded-sm bg-gradient-to-br from-violet-400 to-sky-400" />
          </div>
          SKDC
        </Link>
      </div>

      {/* Centered card area */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        {children}
      </div>
    </main>
  );
}
