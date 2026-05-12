import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <div className="relative flex min-h-screen flex-row-reverse bg-background">
      {/* Subtle ambient — follows the active theme. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, var(--theme-halo, rgba(167, 139, 250, 0.10)), transparent 70%)",
          opacity: 0.4,
        }}
      />

      <Sidebar />

      <div className="flex min-h-screen flex-1 flex-col overflow-x-hidden">
        <Topbar />
        <main className="flex-1 overflow-x-hidden px-6 py-8 md:px-10 md:py-10">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
