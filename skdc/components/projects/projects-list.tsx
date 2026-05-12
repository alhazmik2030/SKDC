"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Pencil, Trash2, FolderKanban, ArrowLeft, User } from "lucide-react";
import type { Project, ProjectStatus } from "@prisma/client";
import { ProjectFormDialog } from "./project-form-dialog";
import { EmptyState } from "@/components/dashboard/empty-state";
import { deleteProject } from "@/lib/actions/projects";

type ProjectWithCustomer = Project & {
  customer: { id: string; name: string } | null;
};

const STATUS_STYLES: Record<ProjectStatus, { label: string; className: string }> = {
  DRAFT: { label: "مسودة", className: "bg-zinc-500/20 text-zinc-200 ring-zinc-400/30" },
  IN_REVIEW: { label: "قيد المراجعة", className: "bg-amber-500/20 text-amber-200 ring-amber-400/30" },
  APPROVED: { label: "موافق عليه", className: "bg-sky-500/20 text-sky-200 ring-sky-400/30" },
  IN_PRODUCTION: { label: "تحت التصنيع", className: "bg-violet-500/20 text-violet-200 ring-violet-400/30" },
  COMPLETED: { label: "مكتمل", className: "bg-emerald-500/20 text-emerald-200 ring-emerald-400/30" },
  CANCELLED: { label: "ملغي", className: "bg-rose-500/20 text-rose-200 ring-rose-400/30" },
};

export function ProjectsList({
  projects,
  customers,
}: {
  projects: ProjectWithCustomer[];
  customers: { id: string; name: string }[];
}) {
  const [isPending, startTransition] = React.useTransition();
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  if (projects.length === 0) {
    return (
      <ProjectFormDialog
        customers={customers}
        trigger={
          <div>
            <EmptyState
              icon={FolderKanban}
              title="لا يوجد مشاريع بعد"
              description="ابدأ مشروعك الأول باختيار عميل وتحديد أبعاد المطبخ، ثم اسحب الوحدات من المكتبة."
              ctaLabel="إنشاء أول مشروع"
              onCta={() => {}}
            />
          </div>
        }
      />
    );
  }

  const onDelete = (id: string, name: string) => {
    if (!confirm(`حذف "${name}"؟`)) return;
    setPendingId(id);
    startTransition(async () => {
      try {
        await deleteProject(id);
        toast.success("تم حذف المشروع");
      } catch (err) {
        toast.error((err as Error).message || "فشل الحذف");
      } finally {
        setPendingId(null);
      }
    });
  };

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {projects.map((p, i) => {
        const style = STATUS_STYLES[p.status];
        return (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.4) }}
            className="glass group relative overflow-hidden rounded-2xl border border-border p-5 transition-colors hover:border-violet-400/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${style.className}`}
                  >
                    {style.label}
                  </span>
                </div>
                <Link
                  href={`/dashboard/projects/${p.id}`}
                  className="mt-1.5 block text-base font-semibold leading-tight hover:text-violet-200"
                >
                  {p.name}
                </Link>
                {p.customer ? (
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    {p.customer.name}
                  </div>
                ) : null}
              </div>
              <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <ProjectFormDialog
                  customers={customers}
                  project={{
                    id: p.id,
                    name: p.name,
                    customerId: p.customerId,
                    status: p.status,
                    designStyle: p.designStyle,
                    roomWidth: p.roomWidth,
                    roomDepth: p.roomDepth,
                    roomHeight: p.roomHeight,
                    notes: p.notes,
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
                  disabled={isPending && pendingId === p.id}
                  onClick={() => onDelete(p.id, p.name)}
                  className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {p.roomWidth || p.roomDepth || p.roomHeight ? (
              <div className="mt-3 inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                الغرفة: {p.roomWidth ?? "—"} × {p.roomDepth ?? "—"} × {p.roomHeight ?? "—"} مم
              </div>
            ) : null}

            <Link
              href={`/dashboard/projects/${p.id}`}
              className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-violet-200 transition-colors hover:text-violet-100"
            >
              فتح المشروع
              <ArrowLeft className="h-3 w-3" />
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
