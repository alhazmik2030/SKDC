"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Plus, Cpu } from "lucide-react";
import { MachineCategory, MachineFormat, MachineChannel } from "@prisma/client";
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
import { createMachine, updateMachine } from "@/lib/actions/machines";
import { useI18n } from "@/components/i18n-provider";

const CATEGORY_KEYS: MachineCategory[] = [
  "BEAM_SAW",
  "PANEL_SAW",
  "CNC_ROUTER",
  "NESTING_CNC",
  "EDGE_BANDER",
  "DRILLING_MACHINE",
  "BORING_MACHINE",
  "MEMBRANE_PRESS",
  "POSTFORMING",
  "MULTI_FUNCTION",
];

const CHANNEL_KEYS: MachineChannel[] = [
  "FILE_DOWNLOAD",
  "FILE_UPLOAD_FTP",
  "REST_API",
  "MQTT",
  "USB_AGENT",
];

const ADAPTERS = [
  { id: "generic-beamsaw-dxf", name: "DXF — منشار ألواح عام", format: "DXF" as MachineFormat, cat: "BEAM_SAW" as MachineCategory },
  { id: "generic-cnc-gcode", name: "G-Code — CNC عام", format: "GCODE" as MachineFormat, cat: "CNC_ROUTER" as MachineCategory },
  { id: "generic-csv", name: "CSV — جدول قطع", format: "CSV" as MachineFormat, cat: "MULTI_FUNCTION" as MachineCategory },
  { id: "generic-json", name: "JSON — REST API", format: "JSON" as MachineFormat, cat: "MULTI_FUNCTION" as MachineCategory },
];

export interface MachineFormDialogProps {
  machine?: {
    id: string;
    name: string;
    manufacturer: string;
    model: string | null;
    adapterId: string;
    category: MachineCategory;
    preferredFormat: MachineFormat;
    channel: MachineChannel;
    endpoint: string | null;
    notes: string | null;
    isActive: boolean;
  };
  trigger?: React.ReactNode;
  /** When true, dialog mounts already-open. Used by the lazy wrapper. */
  defaultOpen?: boolean;
}

export function MachineFormDialog({ machine, trigger, defaultOpen = false }: MachineFormDialogProps) {
  const { t } = useI18n();
  const [open, setOpen] = React.useState(defaultOpen);
  const [isPending, startTransition] = React.useTransition();
  const isEdit = !!machine;

  const Schema = React.useMemo(
    () =>
      z.object({
        name: z.string().min(2),
        manufacturer: z.string().min(2),
        model: z.string().optional(),
        adapterId: z.string().min(1),
        category: z.nativeEnum(MachineCategory),
        preferredFormat: z.nativeEnum(MachineFormat),
        channel: z.nativeEnum(MachineChannel),
        endpoint: z.string().optional(),
        notes: z.string().optional(),
        isActive: z.boolean().default(true),
      }),
    [],
  );

  type FormValues = z.input<typeof Schema>;

  const CAT_LABEL = (key: MachineCategory) => t(`machine.cat.${key}`);
  const CHAN_LABEL = (key: MachineChannel) => t(`machine.channel.${key}`);

  const form = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      name: machine?.name ?? "",
      manufacturer: machine?.manufacturer ?? "",
      model: machine?.model ?? "",
      adapterId: machine?.adapterId ?? "generic-beamsaw-dxf",
      category: machine?.category ?? "BEAM_SAW",
      preferredFormat: machine?.preferredFormat ?? "DXF",
      channel: machine?.channel ?? "FILE_DOWNLOAD",
      endpoint: machine?.endpoint ?? "",
      notes: machine?.notes ?? "",
      isActive: machine?.isActive ?? true,
    },
  });

  const onAdapterChange = (id: string) => {
    const a = ADAPTERS.find((x) => x.id === id);
    if (!a) return;
    form.setValue("adapterId", id);
    form.setValue("preferredFormat", a.format);
    form.setValue("category", a.cat);
  };

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        if (isEdit && machine) {
          await updateMachine(machine.id, values);
          toast.success(t("toast.machine.updated"));
        } else {
          await createMachine(values);
          toast.success(t("toast.machine.added"));
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
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-white to-white/90 px-4 py-2 text-sm font-semibold text-background shadow-md"
              >
                <Plus className="h-4 w-4" />
                {t("form.machine.add")}
              </button>
            )}
          </span>
        )}
      />
      <DialogContent className="glass max-w-xl border-0 bg-card/90 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-gradient-aurora text-2xl flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            {isEdit ? t("form.machine.editTitle") : t("form.machine.addTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("form.machine.description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("form.machine.name")} required>
              <Input
                placeholder={t("form.machine.namePlaceholder")}
                {...form.register("name")}
              />
            </Field>
            <Field label={t("form.machine.manufacturer")} required>
              <Input
                placeholder={t("form.machine.manufacturerPlaceholder")}
                {...form.register("manufacturer")}
              />
            </Field>
          </div>

          <Field label={t("form.machine.model")}>
            <Input placeholder="HKL 200" {...form.register("model")} />
          </Field>

          <Field label={t("form.machine.adapter")} required>
            <select
              value={form.watch("adapterId")}
              onChange={(e) => onAdapterChange(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {ADAPTERS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t("form.machine.category")}>
              <select
                {...form.register("category")}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {CATEGORY_KEYS.map((c) => (
                  <option key={c} value={c}>
                    {CAT_LABEL(c)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("form.machine.channel")}>
              <select
                {...form.register("channel")}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {CHANNEL_KEYS.map((c) => (
                  <option key={c} value={c}>
                    {CHAN_LABEL(c)}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label={t("form.machine.endpoint")}>
            <Input placeholder="ftp://192.168.1.50  أو  https://api.machine.local" dir="ltr" {...form.register("endpoint")} />
          </Field>

          <Field label={t("common.notes")}>
            <Textarea rows={2} {...form.register("notes")} />
          </Field>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
              {t("common.cancel")}
            </Button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-white to-white/90 px-5 py-2 text-sm font-semibold text-background shadow-lg disabled:opacity-60"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isEdit ? t("common.saveChanges") : t("common.add")}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
        {required ? <span className="mr-1 text-rose-300">*</span> : null}
      </label>
      {children}
    </div>
  );
}
