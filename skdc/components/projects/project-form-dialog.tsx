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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProject, updateProject } from "@/lib/actions/projects";
import { useI18n } from "@/components/i18n-provider";

const NO_CUSTOMER = "__none__";
const NO_STYLE = "__none__";

const STATUS_KEYS: ProjectStatus[] = [
  "DRAFT",
  "IN_REVIEW",
  "APPROVED",
  "IN_PRODUCTION",
  "COMPLETED",
  "CANCELLED",
];

const STYLE_KEYS: DesignStyle[] = [
  "MODERN",
  "CLASSIC",
  "NEO_CLASSIC",
  "INDUSTRIAL",
  "SCANDINAVIAN",
];

export interface ProjectFormDialogProps {
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
  /** When true, dialog mounts already-open. Used by the lazy wrapper. */
  defaultOpen?: boolean;
}

export function ProjectFormDialog({
  project,
  customers,
  trigger,
  defaultOpen = false,
}: ProjectFormDialogProps) {
  const { t } = useI18n();
  const [open, setOpen] = React.useState(defaultOpen);
  const [isPending, startTransition] = React.useTransition();
  const isEdit = !!project;

  const Schema = React.useMemo(
    () =>
      z.object({
        name: z.string().min(2, t("form.customer.nameRequired")),
        customerId: z.string().optional(),
        customerPhone: z.string().optional(),
        status: z.nativeEnum(ProjectStatus).default("DRAFT"),
        designStyle: z.nativeEnum(DesignStyle).optional().or(z.literal("")),
        roomWidth: z.coerce.number().positive().optional().or(z.literal("")),
        roomHeight: z.coerce.number().positive().optional().or(z.literal("")),
        wallThickness: z.coerce
          .number()
          .positive()
          .optional()
          .or(z.literal("")),
        notes: z.string().optional(),
      }),
    [t],
  );

  type FormValues = z.input<typeof Schema>;

  const STATUS_LABEL = (key: ProjectStatus) => t(`project.status.${key}`);
  const STYLE_LABEL = (key: DesignStyle) => t(`project.style.${key}`);

  const form = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      name: project?.name ?? "",
      customerId: project?.customerId ?? "",
      customerPhone: "",
      status: project?.status ?? "DRAFT",
      designStyle: project?.designStyle ?? "",
      roomWidth: project?.roomWidth ?? undefined,
      roomHeight: project?.roomHeight ?? undefined,
      wallThickness: 80,
      notes: project?.notes ?? "",
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const payload = {
          ...values,
          customerId: values.customerId || null,
          customerPhone: values.customerPhone || null,
          designStyle: values.designStyle || null,
          roomWidth: values.roomWidth === "" ? null : values.roomWidth,
          // Depth is no longer asked in the dialog — wall lengths come from
          // the wizard. Keep it null so existing DB rows stay valid.
          roomDepth: null,
          roomHeight: values.roomHeight === "" ? null : values.roomHeight,
          wallThickness:
            values.wallThickness === "" ? 80 : values.wallThickness,
        };
        if (isEdit && project) {
          await updateProject(project.id, payload);
          toast.success(t("toast.project.updated"));
        } else {
          await createProject(payload);
          toast.success(t("toast.project.created"));
          form.reset();
        }
        setOpen(false);
      } catch (err) {
        toast.error((err as Error).message || t("common.unexpectedError"));
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
                {t("form.project.new")}
              </button>
            )}
          </span>
        )}
      />
      <DialogContent className="glass max-w-xl border-0 bg-card/90 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-gradient-aurora text-2xl">
            {isEdit ? t("form.project.editTitle") : t("form.project.addTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("form.project.description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Field
            label={t("form.project.name")}
            required
            error={form.formState.errors.name?.message}
          >
            <Input
              placeholder={t("form.project.namePlaceholder")}
              {...form.register("name")}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t("form.project.customer")}>
              <Select
                value={form.watch("customerId") || NO_CUSTOMER}
                onValueChange={(v) =>
                  form.setValue("customerId", v === NO_CUSTOMER ? "" : String(v ?? ""))
                }
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder={t("form.project.noCustomer")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CUSTOMER}>
                    {t("form.project.noCustomer")}
                  </SelectItem>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t("form.project.status")}>
              <Select
                value={form.watch("status")}
                onValueChange={(v) => form.setValue("status", v as ProjectStatus)}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_KEYS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABEL(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label={t("form.project.style")}>
            <Select
              value={form.watch("designStyle") ? form.watch("designStyle") : NO_STYLE}
              onValueChange={(v) =>
                form.setValue(
                  "designStyle",
                  (v === NO_STYLE ? "" : (v as DesignStyle)) as FormValues["designStyle"],
                )
              }
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder={t("form.project.noStyle")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_STYLE}>{t("form.project.noStyle")}</SelectItem>
                {STYLE_KEYS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STYLE_LABEL(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Customer phone — captured here so the workshop doesn't lose the
              contact when a freshly-typed customer hasn't been added yet. */}
          <Field label="رقم جوال العميل">
            <Input
              type="tel"
              dir="ltr"
              inputMode="tel"
              placeholder="+9665XXXXXXXX"
              {...form.register("customerPhone")}
            />
          </Field>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              أبعاد المطبخ (مم) + سماكة الجدار
            </label>
            <div className="grid grid-cols-3 gap-2">
              <Input
                type="number"
                placeholder={"عرض / طول الجدار"}
                {...form.register("roomWidth")}
              />
              <Input
                type="number"
                placeholder={"ارتفاع الجدار"}
                {...form.register("roomHeight")}
              />
              <Input
                type="number"
                placeholder="سماكة الجدار (80)"
                {...form.register("wallThickness")}
              />
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground">
              عدد الجدران واتجاهها يُحدَّد في ويزرد الستديو بعد إنشاء المشروع.
              السماكة الافتراضية 80 مم وتقدر تغيّرها.
            </p>
          </div>

          <Field label={t("common.notes")}>
            <Textarea rows={2} {...form.register("notes")} />
          </Field>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
              {t("common.cancel")}
            </Button>
            <motion.button
              type="submit"
              disabled={isPending}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-white to-white/90 px-5 py-2 text-sm font-semibold text-background shadow-lg shadow-violet-500/20 transition-opacity disabled:opacity-60"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isEdit ? t("common.saveChanges") : t("form.project.submit")}
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
