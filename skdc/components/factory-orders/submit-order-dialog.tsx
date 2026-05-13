"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, Send } from "lucide-react";
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
import {
  createFactoryOrder,
  submitFactoryOrder,
} from "@/lib/actions/factory-orders";
import { useI18n } from "@/components/i18n-provider";

export type FactoryOption = {
  id: string;
  name: string;
  country: string;
  preferredFormat: MachineFormat;
  channel: FactoryChannel;
};

export type ProjectOption = {
  id: string;
  name: string;
};

export interface SubmitOrderDialogProps {
  factories: FactoryOption[]; // already filtered to VERIFIED on the server
  projects: ProjectOption[];
  trigger?: React.ReactNode;
}

const FORMATS: MachineFormat[] = [
  MachineFormat.DXF,
  MachineFormat.PDF_REPORT,
  MachineFormat.CSV,
  MachineFormat.JSON,
];

/** Picks a language for the auto-generated factory message. */
function messageLocaleFor(country: string): "ar" | "zh" | "en" {
  if (country === "SA" || country === "AE" || country === "EG") return "ar";
  if (country === "CN" || country === "TW" || country === "HK") return "zh";
  return "en";
}

function buildPreview(
  reference: string,
  format: MachineFormat,
  channel: FactoryChannel,
  lang: "ar" | "zh" | "en",
): string {
  if (lang === "ar") {
    return [
      `السلام عليكم،`,
      `نرسل لكم طلب التصنيع رقم ${reference}.`,
      `الملفات المرفقة بصيغة ${format}.`,
      `قناة التواصل: ${channel}.`,
      `بانتظار تأكيد الاستلام والتسعير.`,
    ].join("\n");
  }
  if (lang === "zh") {
    return [
      `您好,`,
      `兹发送订单 ${reference}。`,
      `文件格式: ${format}。`,
      `沟通渠道: ${channel}。`,
      `请确认收货并提供报价。`,
    ].join("\n");
  }
  return [
    `Hello,`,
    `Sending production order ${reference}.`,
    `Attached files use format ${format}.`,
    `Channel: ${channel}.`,
    `Please confirm receipt and provide a quote.`,
  ].join("\n");
}

export function SubmitOrderDialog({
  factories,
  projects,
  trigger,
}: SubmitOrderDialogProps) {
  const { t } = useI18n();
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const Schema = React.useMemo(
    () =>
      z.object({
        factoryId: z.string().min(1, t("form.factoryOrder.factoryRequired")),
        projectId: z.string().min(1, t("form.factoryOrder.projectRequired")),
        reference: z.string().min(1, t("form.factoryOrder.referenceRequired")),
        format: z.nativeEnum(MachineFormat),
        notes: z.string().optional(),
      }),
    [t],
  );

  type FormValues = z.infer<typeof Schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      factoryId: factories[0]?.id ?? "",
      projectId: projects[0]?.id ?? "",
      reference: "",
      format: factories[0]?.preferredFormat ?? MachineFormat.DXF,
      notes: "",
    },
  });

  const factoryId = form.watch("factoryId");
  const reference = form.watch("reference");
  const format = form.watch("format");

  const selectedFactory = factories.find((f) => f.id === factoryId);
  const channel = selectedFactory?.channel ?? FactoryChannel.EMAIL;
  const lang = messageLocaleFor(selectedFactory?.country ?? "CN");
  const preview = buildPreview(reference || "FO-XXXX", format, channel, lang);

  // Keep format in sync when factory changes.
  React.useEffect(() => {
    if (selectedFactory) {
      form.setValue("format", selectedFactory.preferredFormat);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [factoryId]);

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const created = await createFactoryOrder({
          factoryId: values.factoryId,
          projectId: values.projectId,
          reference: values.reference.trim(),
          notes: values.notes?.trim() || null,
        });
        // Immediately submit so the timeline starts at SUBMITTED.
        await submitFactoryOrder(created.id, {
          note:
            values.notes?.trim() ||
            t("factoryOrder.event.autoSubmit"),
        });
        toast.success(t("toast.factoryOrder.submitted"));
        form.reset();
        setOpen(false);
      } catch (err) {
        const msg = (err as Error).message;
        if (msg === "FACTORY_NOT_VERIFIED") {
          toast.error(t("toast.factoryOrder.notVerified"));
        } else {
          toast.error(msg || t("common.unexpectedError"));
        }
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
                <Send className="h-4 w-4" />
                {t("form.factoryOrder.submit")}
              </button>
            )}
          </span>
        )}
      />
      <DialogContent className="glass max-h-[92vh] max-w-2xl overflow-y-auto border-0 bg-card/90 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-gradient-aurora text-2xl">
            {t("form.factoryOrder.title")}
          </DialogTitle>
          <DialogDescription>
            {t("form.factoryOrder.description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Field
              label={t("form.factoryOrder.factory")}
              required
              error={form.formState.errors.factoryId?.message}
            >
              {factories.length === 0 ? (
                <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                  {t("form.factoryOrder.noVerifiedFactories")}
                </p>
              ) : (
                <Select
                  value={factoryId ?? undefined}
                  onValueChange={(v) => form.setValue("factoryId", String(v ?? ""))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {factories.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name} ({f.country})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </Field>

            <Field
              label={t("form.factoryOrder.project")}
              required
              error={form.formState.errors.projectId?.message}
            >
              <Select
                value={form.watch("projectId") ?? undefined}
                onValueChange={(v) => form.setValue("projectId", String(v ?? ""))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Field
              label={t("form.factoryOrder.reference")}
              required
              error={form.formState.errors.reference?.message}
            >
              <Input
                placeholder="FO-2026-001"
                dir="ltr"
                {...form.register("reference")}
              />
            </Field>
            <Field label={t("form.factoryOrder.format")}>
              <Select
                value={format}
                onValueChange={(v) =>
                  form.setValue("format", v as MachineFormat)
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
          </div>

          <Field label={t("form.factoryOrder.channel")}>
            <div className="rounded-xl bg-white/[0.03] px-3 py-2 text-sm" dir="ltr">
              {channel}
            </div>
          </Field>

          <Field label={t("form.factoryOrder.notes")}>
            <Textarea rows={2} {...form.register("notes")} />
          </Field>

          {/* Preview pane — auto-localized to the factory's preferred language. */}
          <div>
            <div className="mb-1.5 text-xs font-medium text-muted-foreground">
              {t("form.factoryOrder.preview")} ({lang.toUpperCase()})
            </div>
            <pre
              dir={lang === "ar" ? "rtl" : "ltr"}
              className="whitespace-pre-wrap rounded-xl bg-white/[0.02] p-3 text-xs leading-relaxed text-muted-foreground"
            >
              {preview}
            </pre>
            {/* STUB: actual file generation via Machine adapter framework
                happens server-side after submission — preview here is the
                outgoing message body only. */}
          </div>

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
              disabled={isPending || factories.length === 0}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-white to-white/90 px-5 py-2 text-sm font-semibold text-background shadow-lg shadow-violet-500/20 transition-opacity disabled:opacity-60"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <Send className="h-4 w-4" />
              )}
              {t("form.factoryOrder.submit")}
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
