"use client";

import * as React from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { ChevronDown, LogOut, Settings as SettingsIcon, SunMoon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useThemeSwitcher } from "@/components/theme-switcher";

function handleSignOut() {
  void signOut({ callbackUrl: "/sign-in" });
}

function initialsFromName(name: string | null | undefined, email: string | null | undefined): string {
  const source = (name && name.trim()) || (email ? email.split("@")[0] : "");
  if (!source) return "؟";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return source.charAt(0).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

export function UserMenu() {
  const { data: session } = useSession();
  const themeSwitcher = useThemeSwitcher();

  const name = session?.user?.name || (session?.user?.email?.split("@")[0] ?? "مستخدم");
  const email = session?.user?.email || "";
  const initials = initialsFromName(session?.user?.name, session?.user?.email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={(props) => (
          <button
            {...props}
            type="button"
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.02] py-1 pl-2 pr-1 text-sm transition-colors hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40"
          >
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[popup-open]:rotate-180" />
            <span className="hidden text-right md:block">
              <span className="block text-xs font-medium leading-tight">{name}</span>
              <span className="block text-[10px] leading-tight text-muted-foreground">{email}</span>
            </span>
            <Avatar className="h-8 w-8 ring-1 ring-violet-400/30">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </button>
        )}
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="text-right">
            <div className="text-sm font-medium text-foreground">{name}</div>
            <div className="text-xs text-muted-foreground">{email}</div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={(props) => <Link {...props} href="/dashboard/settings" />}>
          <SettingsIcon className="h-4 w-4 text-muted-foreground" />
          <span>الإعدادات</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => themeSwitcher.open()}>
          <SunMoon className="h-4 w-4 text-muted-foreground" />
          <span>تبديل المظهر</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="h-4 w-4 text-rose-300" />
          <span className="text-rose-200">تسجيل الخروج</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
