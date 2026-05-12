"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, FolderPlus } from "lucide-react";
import { ProjectStatus, DesignStyle } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createProject, updateProject } from "@/lib/actions/projects";

const Schema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  customerId: z.string().optional(),
  status: z.nativeEnum(ProjectStatus).default("DRAFT"),
  designStyle: z.nativeEnum(DesignStyle).optional().or(z.literal("")),
  roomWidth: z.coerce.number().positive().optional().or(z.literal("")),
  roomDepth: z.coerce.number().positive().optional().or(z.literal("")),
  roomHeight: z.coerce.number().positive().optional().or(z.literal("")),
  notes: z.string().optional(),
});

const STYLE_LABELS: Record<DesignStyle, string> = {
  MODERN: "مودرن",
  CLASSIC: "كلاسيك",
  NEO_CLASSIC: "نيو كلاسيك",
  INDUSTRIAL: "صناعي",
  SCANDINAVIAN: "اسكندنافي",
};

type FormValues = z.input<typeof Schema>;

const STATUS_LABELS: Record<ProjectStatus, string> = {
  DRAFT: "مسودة",
  IN_REVIEW: "قيد المراجعة",
  APPROVED: "موافق عليه",
  IN_PRODUCTION: "تحت التصنيع",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغي",
};

export function ProjectFormDialog({
  project,
  customers,
  trigger,
}: {
  project?: {
    id: string;
    name: string;
    customerId: string | null;
    status: ProjectStatus;
    designStyle: DesignStyle | null;
    roomWidth: number | null;
    roomDepth: number | null;
    roomHeight: number | null;
    notes: string | null;
  };
  customers: { id: string; name: string }[];
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const isEdit = !!project;

  const form = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      name: project?.name ?? "",
      customerId: project?.customerId ?? "",
      status: project?.status ?? "DRAFT",
      designStyle: project?.designStyle ?? "",
      roomWidth: project?.roomWidth ?? undefined,
      roomDepth: project?.roomDepth ?? undefined,
      roomHeight: project?.roomHeight ?? undefined,
      notes: project?.notes ?? "",
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const payload = {
          ...values,
          customerId: values.customerId || null,
          designStyle: values.designStyle || null,
          roomWidth: values.roomWidth === "" ? null : values.roomWidth,
          roomDepth: values.roomDepth === "" ? null : values.roomDepth,
          roomHeight: values.roomHeight === "" ? null : values.roomHeight,
        };
        if (isEdit && project) {
          await updateProject(project.id, payload);
          toast.success("تم تحديث المشروع");
        } else {
          await createProject(payload);
          toast.success("تم إنشاء المشروع");
          form.reset();
        }
        setOpen(false);
      } catch (err) {
        toast.error((err as Error).message || "حدث خطأ");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={(props) => (
          <span {...props}>
            {trigger ?? (
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-white to-white/90 px-5 py-2.5 text-sm font-semibold text-background shadow-lg shadow-violet-500/20 transition-transform hover:scale-[1.02]"
              >
                <FolderPlus className="h-4 w-4" />
                مشروع جديد
              </button>
            )}
          </span>
        )}
      />
      <DialogContent className="glass max-w-xl border-0 bg-card/90 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-gradient-aurora text-2xl">
            {isEdit ? "تعديل مشروع" : "إنشاء مشروع جديد"}
          </DialogTitle>
          <DialogDescription>
            اربط المشروع بعميل وحدد أبعاد الغرفة لبدء التصميم.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Field label="اسم المشروع" required error={form.formState.errors.name?.message}>
            <Input placeholder="مثال: مطبخ فيلا العتيبي" {...form.register("name")} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="العميل">
              <select
                {...form.register("customerId")}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">— بدون عميل —</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="الحالة">
              <select
                {...form.register("status")}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {(Object.keys(STATUS_LABELS) as ProjectStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="نمط التصميم">
            <select
              {...form.register("designStyle")}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">— بدون تحديد —</option>
              {(Object.keys(STYLE_LABELS) as DesignStyle[]).map((s) => (
                <option key={s} value={s}>
                  {STYLE_LABELS[s]}
                </option>
              ))}
            </select>
          </Field>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              أبعاد الغرفة (مم) — اختياري
            </label>
            <div className="grid grid-cols-3 gap-2">
              <Input type="number" placeholder="العرض" {...form.register("roomWidth")} />
              <Input type="number" placeholder="العمق" {...form.register("roomDepth")} />
              <Input type="number" placeholder="الارتفاع" {...form.register("roomHeight")} />
            </div>
          </div>

          <Field label="ملاحظات">
            <Textarea rows={2} {...form.register("notes")} />
          </Field>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
              إلغاء
            </Button>
            <motion.button
              type="submit"
              disabled={isPending}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-white to-white/90 px-5 py-2 text-sm font-semibold text-background shadow-lg shadow-violet-500/20 transition-opacity disabled:opacity-60"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isEdit ? "حفظ التعديلات" : "إنشاء المشروع"}
            </motion.button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
        {required ? <span className="mr-1 text-rose-300">*</span> : null}
      </label>
      {children}
      {error ? <p className="mt-1 text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}
