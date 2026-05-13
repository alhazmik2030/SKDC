"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { FolderPlus } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import type { ProjectFormDialogProps } from "./project-form-dialog";

// Why: defer the heavy form bundle (zod + react-hook-form + framer-motion +
// ProjectStatus/DesignStyle enums) until the user opens the dialog.
const ProjectFormDialogInner = dynamic(
  () => import("./project-form-dialog").then((m) => m.ProjectFormDialog),
  { ssr: false, loading: () => null },
);

export type ProjectFormDialogLazyProps = Omit<ProjectFormDialogProps, "defaultOpen">;

export function ProjectFormDialogLazy(props: ProjectFormDialogLazyProps) {
  const { t } = useI18n();
  const [shouldLoad, setShouldLoad] = React.useState(false);

  const activate = React.useCallback(() => setShouldLoad(true), []);

  if (shouldLoad) {
    return <ProjectFormDialogInner {...props} defaultOpen />;
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
      <FolderPlus className="h-4 w-4" />
      {t("form.project.new")}
    </button>
  );
}
