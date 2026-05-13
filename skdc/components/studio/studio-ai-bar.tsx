"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/components/i18n-provider";

export function StudioAIBar() {
  const { t } = useI18n();
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [value, setValue] = React.useState<string>("");

  // Why: ⌘K / Ctrl+K is the canonical command-palette shortcut; focus the
  // AI bar so the studio behaves like Linear/Figma/Raycast.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!value.trim()) return;
    // TODO: pipe into the AI agent action — for now a friendly stub.
    toast.message(value);
    setValue("");
    inputRef.current?.blur();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="absolute bottom-9 end-3 z-[50] flex items-center gap-2 rounded-xl border px-3 py-1.5"
      style={{
        background:
          "linear-gradient(135deg, rgba(167,139,250,0.15), rgba(240,171,252,0.08))",
        borderColor: "rgba(167,139,250,0.35)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        boxShadow: "0 14px 40px -14px rgba(167,139,250,0.45)",
      }}
    >
      <span
        className="grid h-6 w-6 place-items-center rounded-full"
        style={{
          background:
            "linear-gradient(135deg, var(--theme-stop-1, #a78bfa), var(--theme-stop-2, #f0abfc))",
        }}
      >
        <Sparkles className="h-3 w-3 text-white" />
      </span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("studio.ai.placeholder")}
        className="w-[220px] border-0 bg-transparent font-[inherit] text-[12px] text-white placeholder:text-white/55 focus:outline-none"
      />
      <kbd
        className="rounded px-1.5 py-0.5 font-mono text-[9px] text-white/55"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        ⌘K
      </kbd>
    </form>
  );
}
