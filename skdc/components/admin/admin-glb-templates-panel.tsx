"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Trash2, ExternalLink, Plus, Star } from "lucide-react";
import type { KitchenTemplate } from "@prisma/client";
import { Input } from "@/components/ui/input";
import {
  createGlbTemplate,
  deleteGlbTemplate,
  updateGlbTemplate,
} from "@/lib/actions/templates-glb";

/**
 * Admin-side library manager. RTL-first Arabic UI.
 *
 * Why URL-input (not file upload): `@supabase/supabase-js` is not yet a
 * project dependency. The admin uploads the `.glb` directly to the Supabase
 * Storage bucket via the dashboard (see docs/SETUP_GLB_STORAGE.md) and
 * pastes the public URL here. This keeps server credentials out of the
 * client bundle and avoids a heavy storage SDK in production.
 */

const CATEGORIES = [
  { id: "LOWER_CABINET", label: "وحدة سفلية" },
  { id: "UPPER_CABINET", label: "وحدة علوية" },
  { id: "CORNER", label: "ركنة" },
  { id: "TALL_CABINET", label: "دولاب عالي" },
  { id: "DRAWER", label: "درج" },
  { id: "APPLIANCE", label: "جهاز كهربائي" },
  { id: "ACCESSORY", label: "إكسسوار" },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

interface FormState {
  name: string;
  nameAr: string;
  category: CategoryId;
  glbUrl: string;
  glbSizeBytes: string;
  triangleCount: string;
  thumbnailUrl: string;
  defaultWidth: string;
  defaultHeight: string;
  defaultDepth: string;
  license: string;
  attribution: string;
  sourceUrl: string;
  description: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  nameAr: "",
  category: "LOWER_CABINET",
  glbUrl: "",
  glbSizeBytes: "",
  triangleCount: "",
  thumbnailUrl: "",
  defaultWidth: "600",
  defaultHeight: "720",
  defaultDepth: "580",
  license: "CC-BY-4.0",
  attribution: "",
  sourceUrl: "",
  description: "",
};

export interface AdminGlbTemplatesPanelProps {
  templates: KitchenTemplate[];
}

export function AdminGlbTemplatesPanel({
  templates,
}: AdminGlbTemplatesPanelProps) {
  const router = useRouter();
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [isPending, startTransition] = React.useTransition();

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await createGlbTemplate({
          name: form.name,
          nameAr: form.nameAr || null,
          description: form.description || null,
          category: form.category,
          glbUrl: form.glbUrl,
          glbSizeBytes: Number(form.glbSizeBytes),
          triangleCount: Number(form.triangleCount),
          thumbnailUrl: form.thumbnailUrl || null,
          defaultWidth: Number(form.defaultWidth),
          defaultHeight: Number(form.defaultHeight),
          defaultDepth: Number(form.defaultDepth),
          license: form.license || "CC-BY-4.0",
          attribution: form.attribution || null,
          sourceUrl: form.sourceUrl || null,
          published: true,
          featured: false,
        });
        toast.success("تم إضافة القالب");
        setForm(EMPTY_FORM);
        router.refresh();
      } catch (err) {
        toast.error((err as Error).message || "حدث خطأ");
      }
    });
  };

  const togglePublished = (id: string, next: boolean) => {
    startTransition(async () => {
      try {
        await updateGlbTemplate(id, { published: next });
        router.refresh();
      } catch (err) {
        toast.error((err as Error).message || "تعذر التحديث");
      }
    });
  };

  const toggleFeatured = (id: string, next: boolean) => {
    startTransition(async () => {
      try {
        await updateGlbTemplate(id, { featured: next });
        router.refresh();
      } catch (err) {
        toast.error((err as Error).message || "تعذر التحديث");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("هل أنت متأكد من إلغاء نشر هذا القالب؟")) return;
    startTransition(async () => {
      try {
        await deleteGlbTemplate(id);
        toast.success("تم إلغاء النشر");
        router.refresh();
      } catch (err) {
        toast.error((err as Error).message || "حدث خطأ");
      }
    });
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* === Add form === */}
      <form
        onSubmit={handleSubmit}
        className="glass space-y-4 rounded-3xl p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gradient">إضافة قالب جديد</h2>
          <span className="text-xs text-muted-foreground">
            ارفع ملف .glb إلى Supabase Storage ثم الصق الرابط هنا
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="الاسم بالعربي" required>
            <Input
              value={form.nameAr}
              onChange={(e) => update("nameAr", e.target.value)}
              placeholder="مثال: ثلاجة جنبًا إلى جنب"
            />
          </Field>
          <Field label="الاسم بالإنجليزي" required>
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Side-by-side Fridge"
              required
            />
          </Field>
        </div>

        <Field label="الفئة" required>
          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value as CategoryId)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="رابط ملف .glb (Supabase Storage public URL)"
          required
          hint="مثال: https://xyz.supabase.co/storage/v1/object/public/kitchen-models/appliances/fridge.glb"
        >
          <Input
            type="url"
            value={form.glbUrl}
            onChange={(e) => update("glbUrl", e.target.value)}
            placeholder="https://..."
            required
            dir="ltr"
          />
        </Field>

        <div className="grid gap-3 md:grid-cols-3">
          <Field label="حجم الملف (بايت)" required>
            <Input
              type="number"
              min="1"
              value={form.glbSizeBytes}
              onChange={(e) => update("glbSizeBytes", e.target.value)}
              placeholder="2500000"
              required
            />
          </Field>
          <Field label="عدد المثلثات" required>
            <Input
              type="number"
              min="1"
              value={form.triangleCount}
              onChange={(e) => update("triangleCount", e.target.value)}
              placeholder="45000"
              required
            />
          </Field>
          <Field label="رابط الصورة المصغرة (اختياري)">
            <Input
              type="url"
              value={form.thumbnailUrl}
              onChange={(e) => update("thumbnailUrl", e.target.value)}
              placeholder="https://..."
              dir="ltr"
            />
          </Field>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Field label="العرض الافتراضي (مم)" required>
            <Input
              type="number"
              min="1"
              value={form.defaultWidth}
              onChange={(e) => update("defaultWidth", e.target.value)}
              required
            />
          </Field>
          <Field label="الارتفاع الافتراضي (مم)" required>
            <Input
              type="number"
              min="1"
              value={form.defaultHeight}
              onChange={(e) => update("defaultHeight", e.target.value)}
              required
            />
          </Field>
          <Field label="العمق الافتراضي (مم)" required>
            <Input
              type="number"
              min="1"
              value={form.defaultDepth}
              onChange={(e) => update("defaultDepth", e.target.value)}
              required
            />
          </Field>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="الترخيص">
            <Input
              value={form.license}
              onChange={(e) => update("license", e.target.value)}
              placeholder="CC-BY-4.0"
            />
          </Field>
          <Field label="رابط المصدر (Sketchfab)">
            <Input
              type="url"
              value={form.sourceUrl}
              onChange={(e) => update("sourceUrl", e.target.value)}
              placeholder="https://sketchfab.com/..."
              dir="ltr"
            />
          </Field>
        </div>

        <Field label="حقوق المؤلف">
          <Input
            value={form.attribution}
            onChange={(e) => update("attribution", e.target.value)}
            placeholder="By <author> on Sketchfab"
          />
        </Field>

        <Field label="ملاحظات">
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={2}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="مناسب للمطابخ الحديثة..."
          />
        </Field>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[var(--theme-stop-1,#a78bfa)] to-[var(--theme-stop-3,#38bdf8)] px-5 py-2 text-sm font-semibold text-background shadow-lg disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            إضافة القالب
          </button>
        </div>
      </form>

      {/* === Existing templates === */}
      <div className="glass overflow-hidden rounded-3xl">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold">
            القوالب الحالية
            <span className="ms-2 text-xs font-normal text-muted-foreground">
              ({templates.length})
            </span>
          </h2>
        </div>

        {templates.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            لم تتم إضافة قوالب بعد. ابدأ من الأعلى.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-white/[0.02] text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-start">الاسم</th>
                  <th className="px-4 py-3 text-start">الفئة</th>
                  <th className="px-4 py-3 text-start">الأبعاد (مم)</th>
                  <th className="px-4 py-3 text-start">الحجم</th>
                  <th className="px-4 py-3 text-start">مثلثات</th>
                  <th className="px-4 py-3 text-start">منشور</th>
                  <th className="px-4 py-3 text-start">مميز</th>
                  <th className="px-4 py-3 text-start">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-border/40 last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{t.nameAr ?? t.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {t.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {labelForCategory(t.category)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {t.defaultWidth}×{t.defaultHeight}×{t.defaultDepth}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {formatBytes(t.glbSizeBytes)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {t.triangleCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={t.published}
                        onChange={(e) =>
                          togglePublished(t.id, e.target.checked)
                        }
                        disabled={isPending}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleFeatured(t.id, !t.featured)}
                        disabled={isPending}
                        className="text-amber-300 disabled:opacity-50"
                        aria-label="مميز"
                      >
                        <Star
                          className="h-4 w-4"
                          fill={t.featured ? "currentColor" : "none"}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <a
                          href={t.glbUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                          aria-label="فتح ملف GLB"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDelete(t.id)}
                          disabled={isPending}
                          className="text-rose-300 hover:text-rose-200 disabled:opacity-50"
                          aria-label="إلغاء النشر"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
        {required ? <span className="me-1 text-rose-300">*</span> : null}
      </label>
      {children}
      {hint ? (
        <p className="mt-1 text-[10px] text-muted-foreground/80">{hint}</p>
      ) : null}
    </div>
  );
}

function labelForCategory(c: string): string {
  return CATEGORIES.find((x) => x.id === c)?.label ?? c;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
