"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Plus } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import type { MaterialFormDialogProps } from "./material-form-dialog";

// Why: defer loading the heavy form bundle (zod + react-hook-form + framer-motion
// + the @prisma/client MaterialType barrel) until the user opens the dialog.
const MaterialFormDialogInner = dynamic(
  () => import("./material-form-dialog").then((m) => m.MaterialFormDialog),
  { ssr: false, loading: () => null },
);

export type MaterialFormDialogLazyProps = Omit<MaterialFormDialogProps, "defaultOpen">;

export function MaterialFormDialogLazy(props: MaterialFormDialogLazyProps) {
  const { t } = useI18n();
  const [shouldLoad, setShouldLoad] = React.useState(false);

  const activate = React.useCallback(() => setShouldLoad(true), []);

  if (shouldLoad) {
    return <MaterialFormDialogInner {...props} defaultOpen />;
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
      <Plus className="h-4 w-4" />
      {t("form.material.add")}
    </button>
  );
}
