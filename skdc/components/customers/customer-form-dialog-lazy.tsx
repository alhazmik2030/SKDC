"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { UserPlus } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import type { CustomerFormDialogProps } from "./customer-form-dialog";

// Why: defer loading the heavy form bundle (zod + react-hook-form + framer-motion)
// until the user actually intends to open the dialog. The visible "Add" trigger
// stays in the initial chunk so the page paint is unaffected.
const CustomerFormDialogInner = dynamic(
  () => import("./customer-form-dialog").then((m) => m.CustomerFormDialog),
  { ssr: false, loading: () => null },
);

export type CustomerFormDialogLazyProps = Omit<CustomerFormDialogProps, "defaultOpen">;

export function CustomerFormDialogLazy(props: CustomerFormDialogLazyProps) {
  const { t } = useI18n();
  const [shouldLoad, setShouldLoad] = React.useState(false);

  // Why: pointerenter/focus/touchstart fire BEFORE click, so the chunk usually
  // arrives in time. We also pass defaultOpen=true so the dialog auto-opens on
  // mount even when the click event happens before the chunk resolves.
  const activate = React.useCallback(() => setShouldLoad(true), []);

  if (shouldLoad) {
    return <CustomerFormDialogInner {...props} defaultOpen />;
  }

  if (props.trigger) {
    return (
      <span
        onPointerEnter={activate}
        onFocus={activate}
        onPointerDown={activate}
        onTouchStart={activate}
      >
        {props.trigger}
      </span>
    );
  }

  return (
    <button
      type="button"
      onPointerEnter={activate}
      onFocus={activate}
      onPointerDown={activate}
      onTouchStart={activate}
      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-white to-white/90 px-5 py-2.5 text-sm font-semibold text-background shadow-lg shadow-violet-500/20 transition-transform hover:scale-[1.02]"
    >
      <UserPlus className="h-4 w-4" />
      {t("form.customer.add")}
    </button>
  );
}
