"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, Plus } from "lucide-react";
import { MaterialType } from "@prisma/client";
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
import { Button } from "@/components/ui/button";
import { createMaterial, updateMaterial } from "@/lib/actions/materials";

const Schema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  type: z.nativeEnum(MaterialType),
  color: z.string().optional(),
  thicknessMm: z.coerce.number().positive("لازم رقم موجب"),
  pricePerM2: z.coerce.number().nonnegative("لازم رقم 0 أو أكبر"),
});

type FormValues = z.input<typeof Schema>;

const TYPE_LABELS: Record<MaterialType, string> = {
  HPL: "HPL",
  POLYLACK: "POLYLACK",
  UVLACK: "UVLACK",
  MELAMIN: "MELAMIN",
  MDF: "MDF",
  PLYLACK: "PLYLACK",
  WOOD: "خشب طبيعي",
  OTHER: "أخرى",
};

export function MaterialFormDialog({
  material,
  trigger,
}: {
  material?: {
    id: string;
    name: string;
    type: MaterialType;
    color: string | null;
    thicknessMm: number;
    pricePerM2: number;
  };
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const isEdit = !!material;

  const form = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      name: material?.name ?? "",
      type: material?.type ?? "HPL",
      color: material?.color ?? "#FFFFFF",
      thicknessMm: material?.thicknessMm ?? 18,
      pricePerM2: material?.pricePerM2 ?? 0,
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        if (isEdit && material) {
          await updateMaterial(material.id, values);
          toast.success("تم تحديث الخامة");
        } else {
          await createMaterial(values);
          toast.success("تم إضافة الخامة");
          form.reset({
            name: "",
            type: "HPL",
            color: "#FFFFFF",
            thicknessMm: 18,
            pricePerM2: 0,
          });
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
                <Plus className="h-4 w-4" />
                إضافة خامة
              </button>
            )}
          </span>
        )}
      />
      <DialogContent className="glass max-w-lg border-0 bg-card/90 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-gradient-aurora text-2xl">
            {isEdit ? "تعديل خامة" : "إضافة خامة جديدة"}
          </DialogTitle>
          <DialogDescription>
            الخامة تُستخدم في حساب التسعير + إنتاج Cutting Diagram.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Field label="الاسم" required error={form.formState.errors.name?.message}>
            <Input placeholder="مثال: HPL أبيض لامع" {...form.register("name")} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="النوع" required>
              <select
                {...form.register("type")}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {(Object.keys(TYPE_LABELS) as MaterialType[]).map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="اللون">
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  className="h-9 w-12 cursor-pointer p-1"
                  {...form.register("color")}
                />
                <Input
                  type="text"
                  placeholder="#FFFFFF"
                  dir="ltr"
                  {...form.register("color")}
                />
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="السماكة (مم)"
              required
              error={form.formState.errors.thicknessMm?.message}
            >
              <Input type="number" step="0.1" min="0" {...form.register("thicknessMm")} />
            </Field>
            <Field
              label="السعر (ر.س / م²)"
              required
              error={form.formState.errors.pricePerM2?.message}
            >
              <Input type="number" step="0.01" min="0" {...form.register("pricePerM2")} />
            </Field>
          </div>

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
              {isEdit ? "حفظ التعديلات" : "إضافة الخامة"}
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
