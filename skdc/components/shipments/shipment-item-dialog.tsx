"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, Plus } from "lucide-react";
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
import { addItemToShipment } from "@/lib/actions/shipments";
import { useI18n } from "@/components/i18n-provider";

export interface ShipmentItemDialogProps {
  shipmentId: string;
  /** Optional select sources — keep simple HTML <select> for now. */
  projects?: { id: string; name: string }[];
  customers?: { id: string; name: string }[];
  trigger?: React.ReactNode;
}

/**
 * Lightweight dialog for adding a single line item to a shipment. Kept
 * deliberately simple (native <select>s, no autocomplete) — can be upgraded
 * later if workshops need richer linking.
 */
export function ShipmentItemDialog({
  shipmentId,
  projects = [],
  customers = [],
  trigger,
}: ShipmentItemDialogProps) {
  const { t } = useI18n();
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const Schema = React.useMemo(
    () =>
      z.object({
        description: z.string().min(1, t("form.shipmentItem.descriptionRequired")),
        qty: z.string().optional(),
        unitValue: z.string().optional(),
        weightKg: z.string().optional(),
        volumeM3: z.string().optional(),
        projectId: z.string().optional(),
        customerId: z.string().optional(),
        notes: z.string().optional(),
      }),
    [t],
  );

  type FormValues = z.infer<typeof Schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      description: "",
      qty: "1",
      unitValue: "",
      weightKg: "",
      volumeM3: "",
      projectId: "",
      customerId: "",
      notes: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        await addItemToShipment(shipmentId, {
          description: values.description.trim(),
          qty: values.qty ? Number(values.qty) : 1,
          unitValue: values.unitValue ? Number(values.unitValue) : null,
          weightKg: values.weightKg ? Number(values.weightKg) : null,
          volumeM3: values.volumeM3 ? Number(values.volumeM3) : null,
          projectId: values.projectId || null,
          customerId: values.customerId || null,
          notes: values.notes?.trim() || null,
        });
        toast.success(t("toast.shipmentItem.added"));
        form.reset();
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
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted/60"
              >
                <Plus className="h-3.5 w-3.5" />
                {t("shipment.items.add")}
              </button>
            )}
          </span>
        )}
      />
      <DialogContent className="glass max-h-[90vh] max-w-lg overflow-y-auto border-0 bg-card/90 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-gradient-aurora text-xl">
            {t("shipment.items.add")}
          </DialogTitle>
          <DialogDescription>
            {t("form.shipmentItem.description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <Field
            label={t("form.shipmentItem.descriptionLabel")}
            required
            error={form.formState.errors.description?.message}
          >
            <Input
              placeholder={t("form.shipmentItem.descriptionPlaceholder")}
              {...form.register("description")}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t("form.shipmentItem.qty")}>
              <Input
                type="number"
                min="1"
                step="1"
                dir="ltr"
                {...form.register("qty")}
              />
            </Field>
            <Field label={t("form.shipmentItem.unitValue")}>
              <Input
                type="number"
                step="0.01"
                min="0"
                dir="ltr"
                {...form.register("unitValue")}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t("form.shipmentItem.weightKg")}>
              <Input
                type="number"
                step="0.01"
                min="0"
                dir="ltr"
                {...form.register("weightKg")}
              />
            </Field>
            <Field label={t("form.shipmentItem.volumeM3")}>
              <Input
                type="number"
                step="0.001"
                min="0"
                dir="ltr"
                {...form.register("volumeM3")}
              />
            </Field>
          </div>

          <Field label={t("form.shipmentItem.customer")}>
            <select
              {...form.register("customerId")}
              className="h-9 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              <option value="">—</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t("form.shipmentItem.project")}>
            <select
              {...form.register("projectId")}
              className="h-9 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              <option value="">—</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t("common.notes")}>
            <Textarea rows={2} {...form.register("notes")} />
          </Field>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              {t("common.cancel")}
            </Button>
            <motion.button
              type="submit"
              disabled={isPending}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-white to-white/90 px-5 py-2 text-sm font-semibold text-background shadow-lg shadow-violet-500/20 transition-opacity disabled:opacity-60"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t("shipment.items.add")}
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
