"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Building2, Loader2 } from "lucide-react";
import { FactoryChannel, MachineFormat } from "@prisma/client";
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
import { createFactory, updateFactory } from "@/lib/actions/factories";
import { useI18n } from "@/components/i18n-provider";

export interface FactoryFormDialogProps {
  factory?: {
    id: string;
    name: string;
    nameLocal: string | null;
    legalName: string | null;
    taxId: string | null;
    contactName: string | null;
    contactNameLocal: string | null;
    contactPhone: string | null;
    contactEmail: string | null;
    wechatId: string | null;
    whatsappNumber: string | null;
    city: string | null;
    province: string | null;
    country: string;
    addressLine: string | null;
    preferredFormat: MachineFormat;
    channel: FactoryChannel;
    endpoint: string | null;
    leadTimeDays: number | null;
    paymentTerms: string | null;
    notes: string | null;
  };
  trigger?: React.ReactNode;
  /** When true, dialog mounts already-open. Used by the lazy wrapper. */
  defaultOpen?: boolean;
}

const FORMATS: MachineFormat[] = [
  MachineFormat.DXF,
  MachineFormat.PDF_REPORT,
  MachineFormat.CSV,
  MachineFormat.JSON,
];

const CHANNELS: FactoryChannel[] = [
  FactoryChannel.EMAIL,
  FactoryChannel.WHATSAPP,
  FactoryChannel.WECHAT,
  FactoryChannel.DINGTALK,
  FactoryChannel.FTP,
  FactoryChannel.REST_API,
  FactoryChannel.PORTAL,
];

export function FactoryFormDialog({
  factory,
  trigger,
  defaultOpen = false,
}: FactoryFormDialogProps) {
  const { t } = useI18n();
  const [open, setOpen] = React.useState(defaultOpen);
  const [isPending, startTransition] = React.useTransition();
  const isEdit = !!factory;

  const Schema = React.useMemo(
    () =>
      z.object({
        name: z.string().min(2, t("form.factory.nameRequired")),
        nameLocal: z.string().optional(),
        legalName: z.string().optional(),
        taxId: z.string().optional(),
        contactName: z.string().optional(),
        contactNameLocal: z.string().optional(),
        contactPhone: z.string().optional(),
        contactEmail: z
          .string()
          .optional()
          .refine(
            (v) => !v || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v),
            t("form.factory.invalidEmail"),
          ),
        wechatId: z.string().optional(),
        whatsappNumber: z.string().optional(),
        city: z.string().optional(),
        province: z.string().optional(),
        country: z.string().min(2).max(4),
        addressLine: z.string().optional(),
        preferredFormat: z.nativeEnum(MachineFormat),
        channel: z.nativeEnum(FactoryChannel),
        endpoint: z.string().optional(),
        leadTimeDays: z.string().optional(),
        paymentTerms: z.string().optional(),
        notes: z.string().optional(),
      }),
    [t],
  );

  type FormValues = z.infer<typeof Schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      name: factory?.name ?? "",
      nameLocal: factory?.nameLocal ?? "",
      legalName: factory?.legalName ?? "",
      taxId: factory?.taxId ?? "",
      contactName: factory?.contactName ?? "",
      contactNameLocal: factory?.contactNameLocal ?? "",
      contactPhone: factory?.contactPhone ?? "",
      contactEmail: factory?.contactEmail ?? "",
      wechatId: factory?.wechatId ?? "",
      whatsappNumber: factory?.whatsappNumber ?? "",
      city: factory?.city ?? "",
      province: factory?.province ?? "",
      country: factory?.country ?? "CN",
      addressLine: factory?.addressLine ?? "",
      preferredFormat: factory?.preferredFormat ?? MachineFormat.DXF,
      channel: factory?.channel ?? FactoryChannel.EMAIL,
      endpoint: factory?.endpoint ?? "",
      leadTimeDays:
        factory?.leadTimeDays != null ? String(factory.leadTimeDays) : "",
      paymentTerms: factory?.paymentTerms ?? "",
      notes: factory?.notes ?? "",
    },
  });

  const preferredFormat = form.watch("preferredFormat");
  const channel = form.watch("channel");

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const payload = {
          name: values.name.trim(),
          nameLocal: values.nameLocal?.trim() || null,
          legalName: values.legalName?.trim() || null,
          taxId: values.taxId?.trim() || null,
          contactName: values.contactName?.trim() || null,
          contactNameLocal: values.contactNameLocal?.trim() || null,
          contactPhone: values.contactPhone?.trim() || null,
          contactEmail: values.contactEmail?.trim() || null,
          wechatId: values.wechatId?.trim() || null,
          whatsappNumber: values.whatsappNumber?.trim() || null,
          city: values.city?.trim() || null,
          province: values.province?.trim() || null,
          country: values.country.trim().toUpperCase(),
          addressLine: values.addressLine?.trim() || null,
          preferredFormat: values.preferredFormat,
          channel: values.channel,
          endpoint: values.endpoint?.trim() || null,
          leadTimeDays: values.leadTimeDays
            ? Number(values.leadTimeDays)
            : null,
          paymentTerms: values.paymentTerms?.trim() || null,
          notes: values.notes?.trim() || null,
        };
        if (isEdit && factory) {
          await updateFactory(factory.id, payload);
          toast.success(t("toast.factory.updated"));
        } else {
          await createFactory(payload);
          toast.success(t("toast.factory.added"));
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
                <Building2 className="h-4 w-4" />
                {t("form.factory.add")}
              </button>
            )}
          </span>
        )}
      />
      <DialogContent className="glass max-h-[92vh] max-w-2xl overflow-y-auto border-0 bg-card/90 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-gradient-aurora text-2xl">
            {isEdit ? t("form.factory.editTitle") : t("form.factory.addTitle")}
          </DialogTitle>
          <DialogDescription>{t("form.factory.description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* ===== Identity ===== */}
          <div className="grid gap-3 md:grid-cols-2">
            <Field
              label={t("form.factory.name")}
              required
              error={form.formState.errors.name?.message}
            >
              <Input
                placeholder={t("form.factory.namePlaceholder")}
                {...form.register("name")}
              />
            </Field>
            <Field label={t("form.factory.nameLocal")}>
              <Input
                placeholder="佛山日升橱柜"
                {...form.register("nameLocal")}
              />
            </Field>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Field label={t("form.factory.legalName")}>
              <Input {...form.register("legalName")} />
            </Field>
            <Field label={t("form.factory.taxId")}>
              <Input dir="ltr" {...form.register("taxId")} />
            </Field>
          </div>

          {/* ===== Contact ===== */}
          <div className="grid gap-3 md:grid-cols-2">
            <Field label={t("form.factory.contactName")}>
              <Input {...form.register("contactName")} />
            </Field>
            <Field label={t("form.factory.contactNameLocal")}>
              <Input {...form.register("contactNameLocal")} />
            </Field>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Field label={t("form.factory.contactPhone")}>
              <Input dir="ltr" {...form.register("contactPhone")} />
            </Field>
            <Field
              label={t("form.factory.contactEmail")}
              error={form.formState.errors.contactEmail?.message}
            >
              <Input dir="ltr" {...form.register("contactEmail")} />
            </Field>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Field label={t("form.factory.wechatId")}>
              <Input dir="ltr" {...form.register("wechatId")} />
            </Field>
            <Field label={t("form.factory.whatsappNumber")}>
              <Input dir="ltr" {...form.register("whatsappNumber")} />
            </Field>
          </div>

          {/* ===== Address ===== */}
          <div className="grid gap-3 md:grid-cols-3">
            <Field label={t("form.factory.city")}>
              <Input {...form.register("city")} />
            </Field>
            <Field label={t("form.factory.province")}>
              <Input {...form.register("province")} />
            </Field>
            <Field label={t("form.factory.country")}>
              <Input
                dir="ltr"
                maxLength={4}
                {...form.register("country")}
              />
            </Field>
          </div>

          <Field label={t("form.factory.addressLine")}>
            <Input {...form.register("addressLine")} />
          </Field>

          {/* ===== Capabilities ===== */}
          <div className="grid gap-3 md:grid-cols-2">
            <Field label={t("form.factory.preferredFormat")}>
              <Select
                value={preferredFormat}
                onValueChange={(v) =>
                  form.setValue("preferredFormat", v as MachineFormat, {
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMATS.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label={t("form.factory.channel")}>
              <Select
                value={channel}
                onValueChange={(v) =>
                  form.setValue("channel", v as FactoryChannel, {
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHANNELS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label={t("form.factory.endpoint")}>
            <Input
              dir="ltr"
              placeholder="https://api.factory.com/orders"
              {...form.register("endpoint")}
            />
          </Field>

          {/* ===== Operational ===== */}
          <div className="grid gap-3 md:grid-cols-2">
            <Field label={t("form.factory.leadTimeDays")}>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                {...form.register("leadTimeDays")}
              />
            </Field>
            <Field label={t("form.factory.paymentTerms")}>
              <Input
                placeholder="30/70"
                {...form.register("paymentTerms")}
              />
            </Field>
          </div>

          <Field label={t("common.notes")}>
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
              {isEdit ? t("common.saveChanges") : t("form.factory.submit")}
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
