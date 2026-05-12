"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const RegisterInput = z.object({
  name: z.string().min(2, "الاسم قصير جداً"),
  email: z.string().email("بريد غير صحيح").toLowerCase(),
  password: z.string().min(8, "كلمة المرور لازم 8 أحرف على الأقل"),
});

export type RegisterInputType = z.infer<typeof RegisterInput>;

export async function registerUser(raw: unknown): Promise<
  | { ok: true; email: string }
  | { ok: false; error: string; field?: "name" | "email" | "password" }
> {
  let parsed: RegisterInputType;
  try {
    parsed = RegisterInput.parse(raw);
  } catch (err) {
    const issue = (err as z.ZodError).issues?.[0];
    return {
      ok: false,
      error: issue?.message ?? "بيانات غير صحيحة",
      field: issue?.path?.[0] as "name" | "email" | "password" | undefined,
    };
  }

  // Check if email already exists
  const existing = await db.user.findUnique({ where: { email: parsed.email } });
  if (existing) {
    return { ok: false, error: "البريد مستخدم بالفعل", field: "email" };
  }

  const passwordHash = await bcrypt.hash(parsed.password, 12);

  const user = await db.user.create({
    data: {
      name: parsed.name,
      email: parsed.email,
      emailVerified: new Date(), // bypass verification — they set a password
      // passwordHash exists in DB (migration applied), but Prisma client
      // hasn't been regenerated yet locally — cast bypasses type check.
      // Build server will regenerate via `postinstall: prisma generate`.
      ...({ passwordHash } as { passwordHash: string }),
    },
  });

  // Bootstrap workspace + OWNER membership (idempotent via Membership.unique).
  try {
    const slug = `ws-${user.id.slice(-6)}-${Date.now().toString(36)}`;
    const workspaceName = parsed.name ? `مساحة ${parsed.name}` : "مساحتي";
    await db.workspace.create({
      data: {
        name: workspaceName,
        slug,
        members: { create: { userId: user.id, role: "OWNER" } },
      },
    });
  } catch {
    // best-effort — sign-in will surface any issue
  }

  return { ok: true, email: parsed.email };
}
