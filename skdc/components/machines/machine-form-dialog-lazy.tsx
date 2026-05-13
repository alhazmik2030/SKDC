"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Plus } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import type { MachineFormDialogProps } from "./machine-form-dialog";

// Why: defer the heavy form bundle (zod + react-hook-form + the MachineCategory
// /Format/Channel enums) until the user opens the dialog from settings.
const MachineFormDialogInner = dynamic(
  () => import("./machine-form-dialog").then((m) => m.MachineFormDialog),
  { ssr: false, loading: () => null },
);

export type MachineFormDialogLazyProps = Omit<MachineFormDialogProps, "defaultOpen">;

export function MachineFormDialogLazy(props: MachineFormDialogLazyProps) {
  const { t } = useI18n();
  const [shouldLoad, setShouldLoad] = React.useState(false);

  const activate = React.useCallback(() => setShouldLoad(true), []);

  if (shouldLoad) {
    return <MachineFormDialogInner {...props} defaultOpen />;
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
      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-white to-white/90 px-4 py-2 text-sm font-semibold text-background shadow-md"
    >
      <Plus className="h-4 w-4" />
      {t("form.machine.add")}
    </button>
  );
}
