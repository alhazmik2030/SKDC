"use client";

import { Printer } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";

export function PrintButton() {
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-white to-white/90 px-5 py-2.5 text-sm font-semibold text-background shadow-lg shadow-violet-500/20 transition-transform hover:scale-[1.02]"
    >
      <Printer className="h-4 w-4" />
      {t("common.print")}
    </button>
  );
}
