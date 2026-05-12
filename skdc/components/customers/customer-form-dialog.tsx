"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, UserPlus } from "lucide-react";
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
import { createCustomer, updateCustomer } from "@/lib/actions/customers";

const Schema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  phone: z.string().optional(),
  email: z
    .string()
    .optional()
    .refine((v) => !v || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), "بريد غير صحيح"),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof Schema>;

export interface CustomerFormDialogProps {
  customer?: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    notes: string | null;
  };
  trigger?: React.ReactNode;
}

export function CustomerFormDialog({ customer, trigger }: CustomerFormDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const isEdit = !!customer;

  const form = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      name: customer?.name ?? "",
      phone: customer?.phone ?? "",
      email: customer?.email ?? "",
      address: customer?.address ?? "",
      notes: customer?.notes ?? "",
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        if (isEdit && customer) {
          await updateCustomer(customer.id, values);
          toast.success("تم تحديث العميل");
        } else {
          await createCustomer(values);
          toast.success("تم إضافة العميل");
          form.reset();
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
                <UserPlus className="h-4 w-4" />
                إضافة عميل
              </button>
            )}
          </span>
        )}
      />
      <DialogContent className="glass max-w-lg border-0 bg-card/90 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-gradient-aurora text-2xl">
            {isEdit ? "تعديل عميل" : "إضافة عميل جديد"}
          </DialogTitle>
          <DialogDescription>
            بيانات العميل تُربط بالمشاريع والفواتير لاحقاً.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Field
            label="الاسم"
            required
            error={form.formState.errors.name?.message}
          >
            <Input placeholder="مثال: محمد العتيبي" {...form.register("name")} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="الجوال" error={form.formState.errors.phone?.message}>
              <Input placeholder="+9665XXXXXXXX" {...form.register("phone")} dir="ltr" />
            </Field>
            <Field label="البريد" error={form.formState.errors.email?.message}>
              <Input placeholder="name@example.com" {...form.register("email")} dir="ltr" />
            </Field>
          </div>

          <Field label="العنوان" error={form.formState.errors.address?.message}>
            <Input placeholder="حي / مدينة" {...form.register("address")} />
          </Field>

          <Field label="ملاحظات" error={form.formState.errors.notes?.message}>
            <Textarea
              placeholder="ملاحظات اختيارية"
              rows={3}
              {...form.register("notes")}
            />
          </Field>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              إلغاء
            </Button>
            <motion.button
              type="submit"
              disabled={isPending}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-white to-white/90 px-5 py-2 text-sm font-semibold text-background shadow-lg shadow-violet-500/20 transition-opacity disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              {isEdit ? "حفظ التعديلات" : "إضافة العميل"}
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
      {error ? (
        <p className="mt-1 text-xs text-rose-300">{error}</p>
      ) : null}
    </div>
  );
}
