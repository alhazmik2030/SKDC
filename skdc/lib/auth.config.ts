import type { EmailConfig } from "next-auth/providers/email";
import { Resend } from "resend";

/**
 * Email provider for SKDC.
 *
 * - Production: sends magic links via Resend.
 *   Requires `RESEND_API_KEY` env var. `EMAIL_FROM` defaults to the
 *   Resend onboarding sender (good for first deploy without a verified domain).
 *
 * - Development / fallback: prints the magic-link URL to the server console
 *   so you can build and test the full auth flow without any email service.
 *
 * The provider auto-selects based on env vars: if `RESEND_API_KEY` exists,
 * we send real emails. Otherwise we print to console.
 */

const HAS_RESEND = !!process.env.RESEND_API_KEY;
const FROM_ADDR = process.env.EMAIL_FROM || "SKDC <onboarding@resend.dev>";

const resend = HAS_RESEND ? new Resend(process.env.RESEND_API_KEY) : null;

function magicLinkHtml(url: string): string {
  return `<!doctype html>
<html lang="ar" dir="rtl">
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Tahoma, sans-serif; background: #0a0a0a; color: #fff; margin: 0; padding: 40px 20px;">
    <table role="presentation" style="max-width: 480px; margin: 0 auto; background: #141414; border-radius: 16px; padding: 32px; border: 1px solid #2a2a2a;">
      <tr><td>
        <div style="font-size: 12px; letter-spacing: 2px; color: #a78bfa; text-transform: uppercase; margin-bottom: 8px;">SKDC</div>
        <h1 style="margin: 0 0 16px 0; font-size: 28px; background: linear-gradient(135deg, #c084fc, #f0abfc, #38bdf8); -webkit-background-clip: text; background-clip: text; color: transparent;">رابط الدخول</h1>
        <p style="margin: 0 0 24px 0; color: #a3a3a3; line-height: 1.6;">
          اضغط على الزر لتسجيل الدخول إلى حسابك في SKDC.
          الرابط صالح لمدة 24 ساعة.
        </p>
        <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #fff, #e0e7ff); color: #0a0a0a; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px;">
          الدخول إلى SKDC
        </a>
        <p style="margin: 24px 0 0 0; color: #525252; font-size: 12px;">
          لو ما طلبت هذا الرابط، تجاهل هذه الرسالة بأمان.
        </p>
        <p style="margin: 12px 0 0 0; color: #525252; font-size: 11px; word-break: break-all;">
          أو انسخ الرابط: ${url}
        </p>
      </td></tr>
    </table>
    <p style="text-align: center; margin: 24px 0 0 0; color: #525252; font-size: 11px;">
      SKDC · Smart Kitchen Design Cloud
    </p>
  </body>
</html>`;
}

const emailProvider: EmailConfig = {
  id: "email",
  type: "email",
  name: "Email",
  from: FROM_ADDR,
  maxAge: 24 * 60 * 60,
  server: {
    host: "localhost",
    port: 25,
    auth: { user: "x", pass: "x" },
  },
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
        // Fall through to console so the user can still recover.
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

export const providers: EmailConfig[] = [emailProvider];
