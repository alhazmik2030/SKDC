"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Box,
  Layers,
  Settings as SettingsIcon,
  Eye,
  Sparkles,
} from "lucide-react";
import { TemplateCategory } from "@prisma/client";
import { PageHeader } from "@/components/dashboard/page-header";
import { Input } from "@/components/ui/input";
import { createWorkspaceTemplate } from "@/lib/actions/templates";

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  LOWER_CABINET: "وحدة سفلية",
  UPPER_CABINET: "وحدة علوية",
  CORNER: "ركنة",
  TALL_CABINET: "دولاب عالي",
  DRAWER: "درج",
  APPLIANCE: "جهاز كهربائي",
  ACCESSORY: "إكسسوار",
};

const Schema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  category: z.nativeEnum(TemplateCategory),
  defaultWidth: z.coerce.number().positive(),
  defaultHeight: z.coerce.number().positive(),
  defaultDepth: z.coerce.number().positive(),
  doors: z.coerce.number().int().min(0).max(10).optional(),
  drawers: z.coerce.number().int().min(0).max(10).optional(),
  shelves: z.coerce.number().int().min(0).max(10).optional(),
});

// Form deals with raw input values (numbers may arrive as strings from inputs);
// Zod coerces them on submit.
type FormValues = z.input<typeof Schema>;

const STEPS = [
  { id: 1, label: "الأساسيات", icon: Box },
  { id: 2, label: "الأبعاد", icon: Layers },
  { id: 3, label: "الخصائص", icon: SettingsIcon },
  { id: 4, label: "معاينة", icon: Eye },
];

export default function NewTemplatePage() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      name: "",
      category: "LOWER_CABINET",
      defaultWidth: 600,
      defaultHeight: 720,
      defaultDepth: 580,
      doors: 2,
      drawers: 0,
      shelves: 1,
    },
    mode: "onChange",
  });

  const values = form.watch() as FormValues;
  const numWidth = Number(values.defaultWidth) || 0;
  const numHeight = Number(values.defaultHeight) || 0;
  const numDepth = Number(values.defaultDepth) || 0;

  const next = async () => {
    const fieldsByStep: Record<number, (keyof FormValues)[]> = {
      1: ["name", "category"],
      2: ["defaultWidth", "defaultHeight", "defaultDepth"],
      3: [],
    };
    const fields = fieldsByStep[step] ?? [];
    const ok = fields.length === 0 ? true : await form.trigger(fields);
    if (ok) setStep((s) => Math.min(s + 1, 4));
  };

  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      try {
        const options: Record<string, number> = {};
        const doors = Number(data.doors);
        const drawers = Number(data.drawers);
        const shelves = Number(data.shelves);
        if (Number.isFinite(doors)) options.doors = doors;
        if (Number.isFinite(drawers)) options.drawers = drawers;
        if (Number.isFinite(shelves)) options.shelves = shelves;

        await createWorkspaceTemplate({
          name: data.name,
          category: data.category,
          defaultWidth: Number(data.defaultWidth),
          defaultHeight: Number(data.defaultHeight),
          defaultDepth: Number(data.defaultDepth),
          options,
        });
        toast.success("تم إنشاء القالب");
        router.push("/dashboard/templates");
      } catch (err) {
        toast.error((err as Error).message || "حدث خطأ");
      }
    });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Custom Template"
        title="بناء قالب مخصص"
        description="ابنِ قالب وحدة خاص بورشتك واستخدمه في كل المشاريع. القوالب المخصصة تظهر فقط لك."
        action={
          <Link
            href="/dashboard/templates"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← العودة
          </Link>
        }
      />

      {/* Stepper */}
      <div className="glass mb-8 flex items-center justify-between gap-2 rounded-2xl p-3">
        {STEPS.map((s, i) => {
          const active = s.id === step;
          const done = s.id < step;
          return (
            <React.Fragment key={s.id}>
              <div
                className={`flex flex-1 items-center gap-2 rounded-xl px-3 py-2 transition-colors ${
                  active
                    ? "bg-gradient-to-br from-[var(--theme-stop-1,#a78bfa)] to-[var(--theme-stop-3,#38bdf8)] text-background"
                    : done
                      ? "text-foreground"
                      : "text-muted-foreground"
                }`}
              >
                <div
                  className={`grid h-7 w-7 place-items-center rounded-lg text-xs font-bold ${
                    active
                      ? "bg-background/20"
                      : done
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-white/5"
                  }`}
                >
                  {done ? "✓" : s.id}
                </div>
                <span className="hidden whitespace-nowrap text-xs font-medium md:inline">
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 ? (
                <div className="h-px flex-1 bg-border md:max-w-8" />
              ) : null}
            </React.Fragment>
          );
        })}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="glass rounded-3xl p-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <div>
                <h3 className="text-lg font-bold text-gradient">الأساسيات</h3>
                <p className="text-sm text-muted-foreground">اسم القالب وفئته.</p>
              </div>
              <Field label="اسم القالب" required error={form.formState.errors.name?.message}>
                <Input
                  placeholder="مثال: وحدة سفلية مخصصة للورشة"
                  {...form.register("name")}
                />
              </Field>
              <Field label="الفئة" required>
                <select
                  {...form.register("category")}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {(Object.keys(CATEGORY_LABELS) as TemplateCategory[]).map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </option>
                  ))}
                </select>
              </Field>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <div>
                <h3 className="text-lg font-bold text-gradient">الأبعاد الافتراضية</h3>
                <p className="text-sm text-muted-foreground">بالمليمتر. يمكن تعديلها لكل استخدام.</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="العرض (مم)" required error={form.formState.errors.defaultWidth?.message}>
                  <Input type="number" min="1" {...form.register("defaultWidth")} />
                </Field>
                <Field label="الارتفاع (مم)" required error={form.formState.errors.defaultHeight?.message}>
                  <Input type="number" min="1" {...form.register("defaultHeight")} />
                </Field>
                <Field label="العمق (مم)" required error={form.formState.errors.defaultDepth?.message}>
                  <Input type="number" min="1" {...form.register("defaultDepth")} />
                </Field>
              </div>

              {/* Live preview box */}
              <div className="relative mx-auto mt-6 grid h-48 place-items-center rounded-2xl border border-border bg-white/[0.02]">
                <div
                  className="rounded-lg bg-gradient-to-br from-[var(--theme-stop-1,#a78bfa)] to-[var(--theme-stop-3,#38bdf8)] shadow-2xl"
                  style={{
                    width: `${Math.min(numWidth / 12, 240)}px`,
                    height: `${Math.min(numHeight / 12, 160)}px`,
                  }}
                />
                <div className="absolute bottom-3 text-xs text-muted-foreground">
                  معاينة بالنسبة (1:12 تقريباً)
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <div>
                <h3 className="text-lg font-bold text-gradient">الخصائص</h3>
                <p className="text-sm text-muted-foreground">عدد الأبواب/الأدراج/الأرفف.</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="عدد الأبواب">
                  <Input type="number" min="0" max="10" {...form.register("doors")} />
                </Field>
                <Field label="عدد الأدراج">
                  <Input type="number" min="0" max="10" {...form.register("drawers")} />
                </Field>
                <Field label="عدد الأرفف">
                  <Input type="number" min="0" max="10" {...form.register("shelves")} />
                </Field>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <div>
                <h3 className="text-lg font-bold text-gradient flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-violet-300" />
                  معاينة
                </h3>
                <p className="text-sm text-muted-foreground">راجع التفاصيل قبل الحفظ.</p>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Detail label="الاسم" value={values.name} />
                <Detail label="الفئة" value={CATEGORY_LABELS[values.category]} />
                <Detail label="العرض" value={`${numWidth} مم`} />
                <Detail label="الارتفاع" value={`${numHeight} مم`} />
                <Detail label="العمق" value={`${numDepth} مم`} />
                <Detail label="الأبواب" value={`${Number(values.doors) || 0}`} />
                <Detail label="الأدراج" value={`${Number(values.drawers) || 0}`} />
                <Detail label="الأرفف" value={`${Number(values.shelves) || 0}`} />
              </dl>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-8 flex justify-between gap-2 border-t border-border/50 pt-6">
          <button
            type="button"
            onClick={prev}
            disabled={step === 1}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground disabled:opacity-30"
          >
            <ArrowRight className="h-4 w-4" />
            السابق
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-white to-white/90 px-5 py-2 text-sm font-semibold text-background shadow-lg"
            >
              التالي
              <ArrowLeft className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 px-5 py-2 text-sm font-semibold text-background shadow-lg disabled:opacity-60"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              حفظ القالب
            </button>
          )}
        </div>
      </form>
    </div>
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-white/[0.02] px-4 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-semibold">{value || "—"}</dd>
    </div>
  );
}
