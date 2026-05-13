"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Building2 } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import type { FactoryFormDialogProps } from "./factory-form-dialog";

// Why: defer loading the heavy form bundle (zod + react-hook-form + framer-motion)
// until the user actually intends to open the dialog.
const FactoryFormDialogInner = dynamic(
  () => import("./factory-form-dialog").then((m) => m.FactoryFormDialog),
  { ssr: false, loading: () => null },
);

export type FactoryFormDialogLazyProps = Omit<
  FactoryFormDialogProps,
  "defaultOpen"
>;

export function FactoryFormDialogLazy(props: FactoryFormDialogLazyProps) {
  const { t } = useI18n();
  const [shouldLoad, setShouldLoad] = React.useState(false);

  const activate = React.useCallback(() => setShouldLoad(true), []);

  if (shouldLoad) {
    return <FactoryFormDialogInner {...props} defaultOpen />;
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
      <Building2 className="h-4 w-4" />
      {t("form.factory.add")}
    </button>
  );
}
