"use client";

import * as React from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Pencil, Trash2, Cpu, Power, PowerOff } from "lucide-react";
import type { Machine } from "@prisma/client";
import { MachineFormDialog } from "./machine-form-dialog";
import { deleteMachine } from "@/lib/actions/machines";

export function MachinesList({ machines }: { machines: Machine[] }) {
  const [isPending, startTransition] = React.useTransition();
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  if (machines.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white/[0.02] px-6 py-10 text-center">
        <Cpu className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <div className="font-semibold">لم تربط أي ماكينة بعد</div>
        <p className="mt-1 text-sm text-muted-foreground">
          اربط ماكينات ورشتك (Beam Saw، CNC، Edge Bander، إلخ) لإرسال مخطط القص مباشرة.
        </p>
        <div className="mt-5">
          <MachineFormDialog />
        </div>
      </div>
    );
  }

  const onDelete = (id: string, name: string) => {
    if (!confirm(`حذف الماكينة "${name}"؟`)) return;
    setPendingId(id);
    startTransition(async () => {
      try {
        await deleteMachine(id);
        toast.success("تم الحذف");
      } catch (err) {
        toast.error((err as Error).message || "فشل الحذف");
      } finally {
        setPendingId(null);
      }
    });
  };

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {machines.map((m, i) => (
        <motion.div
          key={m.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          className="glass group relative overflow-hidden rounded-2xl border border-border p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[var(--theme-stop-1,#a78bfa)] to-[var(--theme-stop-3,#38bdf8)] text-background">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">{m.name}</div>
                <div className="text-xs text-muted-foreground">
                  {m.manufacturer}
                  {m.model ? ` · ${m.model}` : ""}
                </div>
              </div>
            </div>
            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <MachineFormDialog
                machine={m}
                trigger={
                  <button
                    type="button"
                    className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    aria-label="تعديل"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                }
              />
              <button
                type="button"
                disabled={isPending && pendingId === m.id}
                onClick={() => onDelete(m.id, m.name)}
                className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-50"
                aria-label="حذف"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
            <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-violet-200 ring-1 ring-violet-400/30">
              {m.preferredFormat}
            </span>
            <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-sky-200 ring-1 ring-sky-400/30">
              {m.category}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ring-1 ${
                m.isActive
                  ? "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30"
                  : "bg-zinc-500/15 text-zinc-300 ring-zinc-400/30"
              }`}
            >
              {m.isActive ? <Power className="h-3 w-3" /> : <PowerOff className="h-3 w-3" />}
              {m.isActive ? "نشطة" : "متوقفة"}
            </span>
          </div>

          {m.endpoint ? (
            <div className="mt-3 font-mono text-[10px] text-muted-foreground" dir="ltr">
              {m.endpoint}
            </div>
          ) : null}
        </motion.div>
      ))}
    </div>
  );
}
