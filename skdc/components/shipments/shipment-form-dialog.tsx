"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, Ship } from "lucide-react";
import { ShipmentMode } from "@prisma/client";
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
import { createShipment, updateShipment } from "@/lib/actions/shipments";
import { useI18n } from "@/components/i18n-provider";

export interface ShipmentFormDialogProps {
  shipment?: {
    id: string;
    reference: string;
    mode: ShipmentMode;
    carrier: string | null;
    trackingNumber: string | null;
    containerNumber: string | null;
    originFactory: string | null;
    originCity: string | null;
    destPort: string | null;
    destCity: string | null;
    estimatedDeparture: Date | null;
    estimatedArrival: Date | null;
    totalValue: number | null;
    shippingCost: number | null;
    customsDuty: number | null;
    currency: string;
    notes: string | null;
  };
  trigger?: React.ReactNode;
  /** When true, dialog mounts already-open. Used by the lazy wrapper. */
  defaultOpen?: boolean;
}

const MODE_KEYS: Record<ShipmentMode, string> = {
  SEA_FCL: "shipment.mode.SEA_FCL",
  SEA_LCL: "shipment.mode.SEA_LCL",
  AIR: "shipment.mode.AIR",
  ROAD: "shipment.mode.ROAD",
};

const CURRENCIES = ["USD", "SAR", "CNY", "EUR"] as const;

/**
 * Format a Date for an <input type="datetime-local"> (it needs `YYYY-MM-DDTHH:mm`,
 * NOT an ISO string with a Z suffix). We strip seconds and timezone.
 */
function toDateTimeLocal(d: Date | null | undefined): string {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

export function ShipmentFormDialog({
  shipment,
  trigger,
  defaultOpen = false,
}: ShipmentFormDialogProps) {
  const { t } = useI18n();
  const [open, setOpen] = React.useState(defaultOpen);
  const [isPending, startTransition] = React.useTransition();
  const isEdit = !!shipment;

  const Schema = React.useMemo(
    () =>
      z.object({
        reference: z.string().min(1, t("form.shipment.referenceRequired")),
        mode: z.nativeEnum(ShipmentMode),
        carrier: z.string().optional(),
        trackingNumber: z.string().optional(),
        containerNumber: z.string().optional(),
        originFactory: z.string().optional(),
        originCity: z.string().optional(),
        destPort: z.string().optional(),
        destCity: z.string().optional(),
        estimatedDeparture: z.string().optional(),
        estimatedArrival: z.string().optional(),
        totalValue: z.string().optional(),
        shippingCost: z.string().optional(),
        customsDuty: z.string().optional(),
        currency: z.string().min(3),
        notes: z.string().optional(),
      }),
    [t],
  );

  type FormValues = z.infer<typeof Schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      reference: shipment?.reference ?? "",
      mode: shipment?.mode ?? ShipmentMode.SEA_FCL,
      carrier: shipment?.carrier ?? "",
      trackingNumber: shipment?.trackingNumber ?? "",
      containerNumber: shipment?.containerNumber ?? "",
      originFactory: shipment?.originFactory ?? "",
      originCity: shipment?.originCity ?? "",
      destPort: shipment?.destPort ?? "",
      destCity: shipment?.destCity ?? "",
      estimatedDeparture: toDateTimeLocal(shipment?.estimatedDeparture ?? null),
      estimatedArrival: toDateTimeLocal(shipment?.estimatedArrival ?? null),
      totalValue:
        shipment?.totalValue != null ? String(shipment.totalValue) : "",
      shippingCost:
        shipment?.shippingCost != null ? String(shipment.shippingCost) : "",
      customsDuty:
        shipment?.customsDuty != null ? String(shipment.customsDuty) : "",
      currency: shipment?.currency ?? "USD",
      notes: shipment?.notes ?? "",
    },
  });

  const mode = form.watch("mode");
  const currency = form.watch("currency");

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const payload = {
          reference: values.reference.trim(),
          mode: values.mode,
          carrier: values.carrier?.trim() || null,
          trackingNumber: values.trackingNumber?.trim() || null,
          containerNumber: values.containerNumber?.trim() || null,
          originFactory: values.originFactory?.trim() || null,
          originCity: values.originCity?.trim() || null,
          destPort: values.destPort?.trim() || null,
          destCity: values.destCity?.trim() || null,
          estimatedDeparture: values.estimatedDeparture || null,
          estimatedArrival: values.estimatedArrival || null,
          totalValue: values.totalValue ? Number(values.totalValue) : null,
          shippingCost: values.shippingCost ? Number(values.shippingCost) : null,
          customsDuty: values.customsDuty ? Number(values.customsDuty) : null,
          currency: values.currency,
          notes: values.notes?.trim() || null,
        };
        if (isEdit && shipment) {
          await updateShipment(shipment.id, payload);
          toast.success(t("toast.shipment.updated"));
        } else {
          await createShipment(payload);
          toast.success(t("toast.shipment.added"));
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
                <Ship className="h-4 w-4" />
                {t("empty.shipments.cta")}
              </button>
            )}
          </span>
        )}
      />
      <DialogContent className="glass max-h-[92vh] max-w-2xl overflow-y-auto border-0 bg-card/90 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-gradient-aurora text-2xl">
            {isEdit
              ? t("form.shipment.editTitle")
              : t("form.shipment.addTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("form.shipment.description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field
              label={t("form.shipment.reference")}
              required
              error={form.formState.errors.reference?.message}
            >
              <Input
                placeholder={t("form.shipment.referencePlaceholder")}
                {...form.register("reference")}
              />
            </Field>

            <Field label={t("form.shipment.mode")}>
              <Select
                value={mode}
                onValueChange={(v) =>
                  form.setValue("mode", v as ShipmentMode, {
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("form.shipment.mode")} />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(MODE_KEYS) as ShipmentMode[]).map((m) => (
                    <SelectItem key={m} value={m}>
                      {t(MODE_KEYS[m])}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label={t("form.shipment.carrier")}>
              <Input
                placeholder={t("form.shipment.carrierPlaceholder")}
                {...form.register("carrier")}
              />
            </Field>
            <Field label={t("form.shipment.trackingNumber")}>
              <Input dir="ltr" {...form.register("trackingNumber")} />
            </Field>
          </div>

          <Field label={t("form.shipment.containerNumber")}>
            <Input
              dir="ltr"
              placeholder="MSKU1234567"
              {...form.register("containerNumber")}
            />
          </Field>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label={t("form.shipment.originFactory")}>
              <Input {...form.register("originFactory")} />
            </Field>
            <Field label={t("form.shipment.originCity")}>
              <Input {...form.register("originCity")} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label={t("form.shipment.destPort")}>
              <Input {...form.register("destPort")} />
            </Field>
            <Field label={t("form.shipment.destCity")}>
              <Input {...form.register("destCity")} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label={t("form.shipment.estimatedDeparture")}>
              <Input
                type="datetime-local"
                dir="ltr"
                {...form.register("estimatedDeparture")}
              />
            </Field>
            <Field label={t("form.shipment.estimatedArrival")}>
              <Input
                type="datetime-local"
                dir="ltr"
                {...form.register("estimatedArrival")}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Field label={t("form.shipment.totalValue")}>
              <Input
                type="number"
                step="0.01"
                min="0"
                dir="ltr"
                {...form.register("totalValue")}
              />
            </Field>
            <Field label={t("form.shipment.shippingCost")}>
              <Input
                type="number"
                step="0.01"
                min="0"
                dir="ltr"
                {...form.register("shippingCost")}
              />
            </Field>
            <Field label={t("form.shipment.customsDuty")}>
              <Input
                type="number"
                step="0.01"
                min="0"
                dir="ltr"
                {...form.register("customsDuty")}
              />
            </Field>
          </div>

          <Field label={t("form.shipment.currency")}>
            <Select
              value={currency}
              onValueChange={(v) =>
                form.setValue("currency", String(v ?? "USD"), { shouldDirty: true })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label={t("form.shipment.notes")}>
            <Textarea rows={3} {...form.register("notes")} />
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
              {isEdit
                ? t("form.shipment.submitEdit")
                : t("form.shipment.submitNew")}
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
