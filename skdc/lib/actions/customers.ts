"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireWorkspaceId } from "@/lib/auth-helpers";

const CustomerInput = z.object({
  name: z.string().min(2, "الاسم مطلوب").max(120),
  phone: z.string().max(40).optional().nullable(),
  email: z.string().email("بريد غير صحيح").max(120).optional().nullable().or(z.literal("")),
  address: z.string().max(300).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export type CustomerInputType = z.infer<typeof CustomerInput>;

export async function listCustomers() {
  const workspaceId = await requireWorkspaceId();
  return db.customer.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createCustomer(raw: unknown) {
  const workspaceId = await requireWorkspaceId();
  const parsed = CustomerInput.parse(raw);
  const customer = await db.customer.create({
    data: {
      workspaceId,
      name: parsed.name,
      phone: parsed.phone || null,
      email: parsed.email || null,
      address: parsed.address || null,
      notes: parsed.notes || null,
    },
  });
  revalidatePath("/dashboard/customers");
  return customer;
}

export async function updateCustomer(id: string, raw: unknown) {
  const workspaceId = await requireWorkspaceId();
  const parsed = CustomerInput.parse(raw);

  // Ensure ownership.
  const existing = await db.customer.findFirst({ where: { id, workspaceId } });
  if (!existing) throw new Error("NOT_FOUND");

  const customer = await db.customer.update({
    where: { id },
    data: {
      name: parsed.name,
      phone: parsed.phone || null,
      email: parsed.email || null,
      address: parsed.address || null,
      notes: parsed.notes || null,
    },
  });
  revalidatePath("/dashboard/customers");
  return customer;
}

export async function deleteCustomer(id: string) {
  const workspaceId = await requireWorkspaceId();
  const existing = await db.customer.findFirst({ where: { id, workspaceId } });
  if (!existing) throw new Error("NOT_FOUND");
  await db.customer.delete({ where: { id } });
  revalidatePath("/dashboard/customers");
  return { ok: true };
}
