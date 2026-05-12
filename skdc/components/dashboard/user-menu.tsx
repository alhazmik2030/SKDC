"use client";

import * as React from "react";
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

// NOTE: next-auth wiring is owned by Agent A. We don't import from "@/lib/auth"
// yet to avoid a hard build break. The signOut click is a placeholder.
function handleSignOut() {
  // TODO: Replace with `signOut()` from "next-auth/react" once Agent A
  // finishes wiring `lib/auth.ts` and the auth route handlers.
  if (typeof window !== "undefined") {
    console.warn("[user-menu] signOut not wired yet — Agent A");
  }
}

export function UserMenu() {
  // Placeholder identity until Agent A provides the real session.
  const name = "خالد الحازمي";
  const email = "khalid@skdc.app";
  const initials = "خح";

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
        <DropdownMenuItem>
          <SettingsIcon className="h-4 w-4 text-muted-foreground" />
          <span>الإعدادات</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
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
