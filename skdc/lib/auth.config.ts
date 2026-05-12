import type { EmailConfig } from "next-auth/providers/email";

/**
 * Console-logging "email" provider for development.
 *
 * Instead of sending a real email, the magic-link URL is printed to the
 * server console. This lets us build and test the full auth flow without
 * SMTP credentials. In production, swap this for a real provider.
 *
 * TODO: swap for Resend in production.
 */
const consoleEmailProvider = {
  id: "email",
  type: "email",
  name: "Email",
  from: "noreply@skdc.app",
  maxAge: 24 * 60 * 60,
  async sendVerificationRequest({
    identifier,
    url,
  }: {
    identifier: string;
    url: string;
  }) {
    /* eslint-disable no-console */
    console.log("\n\n========== SKDC MAGIC LINK ==========");
    console.log(`To:   ${identifier}`);
    console.log(`URL:  ${url}`);
    console.log("=====================================\n\n");
    /* eslint-enable no-console */
  },
  options: {},
  server: {},
} satisfies EmailConfig;

export const providers = [consoleEmailProvider];
