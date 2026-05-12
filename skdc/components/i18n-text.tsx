"use client";

import { useI18n } from "@/components/i18n-provider";

/**
 * Tiny helper to drop an i18n-localized string into a server component tree.
 * Usage: <T k="page.customers.title" />
 */
export function T({ k }: { k: string }) {
  const { t } = useI18n();
  return <>{t(k)}</>;
}
