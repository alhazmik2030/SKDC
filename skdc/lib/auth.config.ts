import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { EmailConfig } from "next-auth/providers/email";
import type { Provider } from "next-auth/providers";
import { Resend } from "resend";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

/**
 * SKDC Auth providers — fast & professional.
 *
 *   1. Credentials (email + password)  — instant, no email service needed
 *   2. Google OAuth                    — one-click sign-in for everyone
 *   3. Email magic link (Resend)       — kept as backup, works once domain is verified
 *
 * Env vars (set in Railway):
 *   AUTH_GOOGLE_ID            — Google OAuth Client ID
 *   AUTH_GOOGLE_SECRET        — Google OAuth Client Secret
 *   RESEND_API_KEY            — (optional) for magic links
 *   EMAIL_FROM                — (optional) sender address
 */

// ----------- Credentials provider -----------
const CredentialsSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

const credentialsProvider = Credentials({
  id: "credentials",
  name: "Email + Password",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(raw) {
    let parsed: { email: string; password: string };
    try {
      parsed = CredentialsSchema.parse(raw);
    } catch {
      return null;
    }
    const user = await db.user.findUnique({ where: { email: parsed.email } });
    if (!user || !user.passwordHash) return null;
    const ok = await bcrypt.compare(parsed.password, user.passwordHash);
    if (!ok) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    };
  },
});

// ----------- Google provider (conditional on env) -----------
const HAS_GOOGLE = !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
const googleProvider = HAS_GOOGLE
  ? Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    })
  : null;

// ----------- Email magic link (Resend) -----------
const HAS_RESEND = !!process.env.RESEND_API_KEY;
const FROM_ADDR = process.env.EMAIL_FROM || "SKDC <onboarding@resend.dev>";
const resend = HAS_RESEND ? new Resend(process.env.RESEND_API_KEY) : null;

function magicLinkHtml(url: string): string {
  return `<!doctype html><html lang="ar" dir="rtl"><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Tahoma,sans-serif;background:#0a0a0a;color:#fff;margin:0;padding:40px 20px;"><table role="presentation" style="max-width:480px;margin:0 auto;background:#141414;border-radius:16px;padding:32px;border:1px solid #2a2a2a;"><tr><td><div style="font-size:12px;letter-spacing:2px;color:#a78bfa;text-transform:uppercase;margin-bottom:8px;">SKDC</div><h1 style="margin:0 0 16px 0;font-size:28px;background:linear-gradient(135deg,#c084fc,#f0abfc,#38bdf8);-webkit-background-clip:text;background-clip:text;color:transparent;">رابط الدخول</h1><p style="margin:0 0 24px 0;color:#a3a3a3;line-height:1.6;">اضغط على الزر لتسجيل الدخول إلى حسابك في SKDC.</p><a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#fff,#e0e7ff);color:#0a0a0a;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:600;font-size:15px;">الدخول إلى SKDC</a></td></tr></table></body></html>`;
}

const emailProvider: EmailConfig = {
  id: "email",
  type: "email",
  name: "Email",
  from: FROM_ADDR,
  maxAge: 24 * 60 * 60,
  server: { host: "localhost", port: 25, auth: { user: "x", pass: "x" } },
  options: {},
  async sendVerificationRequest({ identifier, url }) {
    if (resend) {
      try {
        const result = await resend.emails.send({
          from: FROM_ADDR,
          to: identifier,
          subject: "رابط الدخول إلى SKDC",
          html: magicLinkHtml(url),
        });
        if ("error" in result && result.error) {
          throw new Error(JSON.stringify(result.error));
        }
        return;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[auth] Resend send failed:", err);
      }
    }
    /* eslint-disable no-console */
    console.log("\n\n========== SKDC MAGIC LINK ==========");
    console.log(`To:   ${identifier}`);
    console.log(`URL:  ${url}`);
    console.log("=====================================\n\n");
    /* eslint-enable no-console */
  },
};

// ----------- Combined export -----------
const providersList: Provider[] = [credentialsProvider];
if (googleProvider) providersList.push(googleProvider);
providersList.push(emailProvider);

export const providers = providersList;
