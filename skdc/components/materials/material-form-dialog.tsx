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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createMaterial, updateMaterial } from "@/lib/actions/materials";
import { useI18n } from "@/components/i18n-provider";

const GLASS_TINT_KEYS = [
  "clear",
  "bronze",
  "smoked",
  "milky-white",
  "black",
  "green",
  "blue",
] as const;

const GLASS_FINISH_KEYS = [
  "transparent",
  "frosted",
  "reflective",
  "tempered",
  "laminated",
  "patterned",
] as const;

const GLASS_THICKNESSES = [4, 5, 6, 8, 10, 12];

const MATERIAL_TYPES: MaterialType[] = [
  "HPL",
  "POLYLACK",
  "UVLACK",
  "MELAMIN",
  "MDF",
  "PLYLACK",
  "WOOD",
  "GLASS",
  "OTHER",
];

export interface MaterialFormDialogProps {
  material?: {
    id: string;
    name: string;
    type: MaterialType;
    color: string | null;
    thicknessMm: number;
    pricePerM2: number;
    glassTint?: string | null;
    glassFinish?: string | null;
  };
  trigger?: React.ReactNode;
  /** When true, dialog mounts already-open. Used by the lazy wrapper. */
  defaultOpen?: boolean;
}

export function MaterialFormDialog({ material, trigger, defaultOpen = false }: MaterialFormDialogProps) {
  const { t } = useI18n();
  const [open, setOpen] = React.useState(defaultOpen);
  const [isPending, startTransition] = React.useTransition();
  const isEdit = !!material;

  const Schema = React.useMemo(
    () =>
      z.object({
        name: z.string().min(2, t("form.customer.nameRequired")),
        type: z.nativeEnum(MaterialType),
        color: z.string().optional(),
        thicknessMm: z.coerce.number().positive(t("form.material.errPositive")),
        pricePerM2: z.coerce.number().nonnegative(t("form.material.errNonNegative")),
        glassTint: z.string().optional(),
        glassFinish: z.string().optional(),
      }),
    [t],
  );

  type FormValues = z.input<typeof Schema>;

  const TYPE_LABEL = (key: MaterialType) => t(`material.type.${key}`);
  const TINT_LABEL = (key: string) => t(`glass.tint.${key}`);
  const FINISH_LABEL = (key: string) => t(`glass.finish.${key}`);

  const form = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      name: material?.name ?? "",
      type: material?.type ?? "HPL",
      color: material?.color ?? "#FFFFFF",
      thicknessMm: material?.thicknessMm ?? 18,
      pricePerM2: material?.pricePerM2 ?? 0,
      glassTint: material?.glassTint ?? "clear",
      glassFinish: material?.glassFinish ?? "transparent",
    },
  });

  const selectedType = form.watch("type");
  const isGlass = selectedType === "GLASS";

  // Auto-adjust thickness when switching to/from GLASS
  React.useEffect(() => {
    if (isGlass) {
      const cur = Number(form.getValues("thicknessMm"));
      if (cur === 18 || cur === 16) {
        form.setValue("thicknessMm", 6);
      }
    }
  }, [isGlass, form]);

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        if (isEdit && material) {
          await updateMaterial(material.id, values);
          toast.success(t("toast.material.updated"));
        } else {
          await createMaterial(values);
          toast.success(t("toast.material.added"));
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
                <Plus className="h-4 w-4" />
                {t("form.material.add")}
              </button>
            )}
          </span>
        )}
      />
      <DialogContent className="glass max-w-lg border-0 bg-card/90 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-gradient-aurora text-2xl">
            {isEdit ? t("form.material.editTitle") : t("form.material.addTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("form.material.description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Field
            label={t("form.material.name")}
            required
            error={form.formState.errors.name?.message}
          >
            <Input
              placeholder={t("form.material.namePlaceholder")}
              {...form.register("name")}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t("form.material.type")} required>
              <Select
                value={form.watch("type")}
                onValueChange={(v) => form.setValue("type", v as MaterialType)}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder={t("form.material.typePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {MATERIAL_TYPES.map((mt) => (
                    <SelectItem key={mt} value={mt}>
                      {TYPE_LABEL(mt)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label={t("form.material.color")}>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  className="h-10 w-12 cursor-pointer p-1"
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
              label={t("form.material.thickness")}
              required
              error={form.formState.errors.thicknessMm?.message}
            >
              {isGlass ? (
                <Select
                  value={String(form.watch("thicknessMm"))}
                  onValueChange={(v) => form.setValue("thicknessMm", Number(v))}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder={t("form.material.thicknessPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {GLASS_THICKNESSES.map((th) => (
                      <SelectItem key={th} value={String(th)}>
                        {th} مم
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input type="number" step="0.1" min="0" {...form.register("thicknessMm")} />
              )}
            </Field>
            <Field
              label={t("form.material.price")}
              required
              error={form.formState.errors.pricePerM2?.message}
            >
              <Input type="number" step="0.01" min="0" {...form.register("pricePerM2")} />
            </Field>
          </div>

          {/* Glass-specific fields */}
          {isGlass ? (
            <div className="space-y-3 rounded-xl border border-sky-400/30 bg-sky-500/5 p-4">
              <div className="font-mono text-xs uppercase tracking-wider text-sky-300">
                {t("form.material.glassSection")}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label={t("form.material.glassTint")}>
                  <Select
                    value={form.watch("glassTint") ?? "clear"}
                    onValueChange={(v) => form.setValue("glassTint", String(v ?? "clear"))}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder={t("form.material.glassTintPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {GLASS_TINT_KEYS.map((k) => (
                        <SelectItem key={k} value={k}>
                          {TINT_LABEL(k)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label={t("form.material.glassFinish")}>
                  <Select
                    value={form.watch("glassFinish") ?? "transparent"}
                    onValueChange={(v) => form.setValue("glassFinish", String(v ?? "transparent"))}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder={t("form.material.glassFinishPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {GLASS_FINISH_KEYS.map((k) => (
                        <SelectItem key={k} value={k}>
                          {FINISH_LABEL(k)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </div>
          ) : null}

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
              {isEdit ? t("common.saveChanges") : t("form.material.submit")}
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
