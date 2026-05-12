import type { EmailConfig } from "next-auth/providers/email";

/**
 * Console-logging "email" provider for development.
 *
 * Instead of sending a real email, the magic-link URL is printed to the
 * server console. This lets us build and test the full auth flow without
 * SMTP credentials. In production, swap this for a real provider (Resend).
 *
 * NOTE: We provide a dummy `server` config so the NodemailerProvider's
 * validation passes. Since `sendVerificationRequest` is overridden, the
 * dummy server is NEVER actually used to send mail.
 */
const consoleEmailProvider: EmailConfig = {
  id: "email",
  type: "email",
  name: "Email",
  from: "noreply@skdc.app",
  maxAge: 24 * 60 * 60,
  server: {
    host: "localhost",
    port: 25,
    auth: { user: "x", pass: "x" },
  },
  options: {},
  async sendVerificationRequest({ identifier, url }) {
    /* eslint-disable no-console */
    console.log("\n\n========== SKDC MAGIC LINK ==========");
    console.log(`To:   ${identifier}`);
    console.log(`URL:  ${url}`);
    console.log("=====================================\n\n");
    /* eslint-enable no-console */
  },
};

export const providers: EmailConfig[] = [consoleEmailProvider];
