"use client";

import * as React from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Pencil, Trash2, Layers } from "lucide-react";
import type { Material } from "@prisma/client";
import { MaterialFormDialog } from "./material-form-dialog";
import { EmptyState } from "@/components/dashboard/empty-state";
import { deleteMaterial } from "@/lib/actions/materials";

export function MaterialsList({ materials }: { materials: Material[] }) {
  const [isPending, startTransition] = React.useTransition();
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  if (materials.length === 0) {
    return (
      <MaterialFormDialog
        trigger={
          <div>
            <EmptyState
              icon={Layers}
              title="ابدأ بتخصيص خاماتك"
              description="أضف خامات ورشتك مع الأسعار والسماكات لتسريع التسعير التلقائي."
              ctaLabel="إضافة خامة"
              onCta={() => {}}
            />
          </div>
        }
      />
    );
  }

  const onDelete = (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف ${name}؟`)) return;
    setPendingId(id);
    startTransition(async () => {
      try {
        await deleteMaterial(id);
        toast.success("تم حذف الخامة");
      } catch (err) {
        toast.error((err as Error).message || "فشل الحذف");
      } finally {
        setPendingId(null);
      }
    });
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {materials.map((m, i) => (
        <motion.div
          key={m.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.4) }}
          className="glass group relative overflow-hidden rounded-2xl border border-border p-5 transition-colors hover:border-violet-400/40"
        >
          {/* Color swatch */}
          <div
            className="mb-4 h-20 rounded-xl ring-1 ring-white/10"
            style={{
              background: m.color ?? "linear-gradient(135deg, #a3a3a3, #525252)",
              boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.05)`,
            }}
            aria-hidden
          />

          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-semibold leading-tight">{m.name}</div>
              <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {m.type}
              </div>
            </div>
            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <MaterialFormDialog
                material={{
                  id: m.id,
                  name: m.name,
                  type: m.type,
                  color: m.color,
                  thicknessMm: m.thicknessMm,
                  pricePerM2: m.pricePerM2,
                }}
                trigger={
                  <button
                    type="button"
                    aria-label="تعديل"
                    className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                }
              />
              <button
                type="button"
                aria-label="حذف"
                disabled={isPending && pendingId === m.id}
                onClick={() => onDelete(m.id, m.name)}
                className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-3 flex justify-between text-xs text-muted-foreground">
            <span>{m.thicknessMm} مم</span>
            <span className="font-mono text-foreground">
              {m.pricePerM2.toFixed(2)} ر.س/م²
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
