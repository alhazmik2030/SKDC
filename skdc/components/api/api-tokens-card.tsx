"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  KeyRound,
  Plus,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  Loader2,
  Terminal,
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { createToken, revokeToken, type ListedToken } from "@/lib/actions/api-tokens";
import { useI18n } from "@/components/i18n-provider";

export interface ApiTokensCardProps {
  initialTokens: ListedToken[];
  /** Used in the config snippet so it always points at the live host. */
  origin: string;
}

export function ApiTokensCard({ initialTokens, origin }: ApiTokensCardProps) {
  const { t, locale } = useI18n();
  const [tokens, setTokens] = React.useState<ListedToken[]>(initialTokens);
  const [created, setCreated] = React.useState<{ token: string; name: string } | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [copied, setCopied] = React.useState<"token" | "config" | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const Schema = React.useMemo(
    () =>
      z.object({
        name: z.string().min(1, t("tokens.nameRequired")).max(60),
      }),
    [t],
  );

  type FormValues = z.infer<typeof Schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { name: "" },
  });

  const onCreate = (values: FormValues) => {
    startTransition(async () => {
      try {
        const result = await createToken(values);
        setTokens((prev) => [result.record, ...prev]);
        setCreated({ token: result.token, name: result.record.name });
        setCreateOpen(false);
        form.reset();
      } catch (err) {
        toast.error((err as Error).message || t("toast.token.createFailed"));
      }
    });
  };

  const onRevoke = (id: string) => {
    if (!confirm(t("tokens.revokeConfirm"))) return;
    startTransition(async () => {
      try {
        await revokeToken(id);
        setTokens((prev) =>
          prev.map((tk) => (tk.id === id ? { ...tk, revokedAt: new Date() } : tk)),
        );
        toast.success(t("toast.token.revoked"));
      } catch (err) {
        toast.error((err as Error).message || t("toast.token.revokeFailed"));
      }
    });
  };

  async function copy(text: string, kind: "token" | "config") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1500);
      toast.success(t("common.copied"));
    } catch {
      toast.error(t("common.copyFailed"));
    }
  }

  const claudeConfig =
    created
      ? JSON.stringify(
          {
            skdc: {
              transport: "http",
              url: `${origin}/api/mcp`,
              headers: { Authorization: `Bearer ${created.token}` },
            },
          },
          null,
          2,
        )
      : null;

  const dateLocale = locale === "ar" ? "ar-SA" : locale === "zh" ? "zh-CN" : "en-US";
  const formatDate = (d: Date | string) => {
    const date = typeof d === "string" ? new Date(d) : d;
    return new Intl.DateTimeFormat(dateLocale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* ===== Hero / explainer ===== */}
      <div className="glass relative overflow-hidden rounded-2xl border-0 bg-card/40 p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 left-1/3 h-40 w-72"
          style={{
            background:
              "radial-gradient(ellipse, var(--theme-halo, rgba(167,139,250,0.35)) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[var(--theme-stop-1,#a78bfa)] via-[var(--theme-stop-2,#f0abfc)] to-[var(--theme-stop-3,#38bdf8)] shadow-lg">
              <KeyRound className="h-5 w-5 text-background" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{t("tokens.title")}</h3>
              <p className="mt-1 max-w-prose text-sm text-muted-foreground">
                {t("tokens.description")}
                <code className="mx-1 rounded bg-white/5 px-1.5 py-0.5 font-mono text-[11px]">
                  POST {origin}/api/mcp
                </code>
                {t("tokens.description.scope")}
              </p>
            </div>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger
              render={(props) => (
                <button
                  {...props}
                  type="button"
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-br from-white to-white/90 px-4 py-2.5 text-sm font-semibold text-background shadow-lg shadow-violet-500/20 transition-transform hover:scale-[1.02]"
                >
                  <Plus className="h-4 w-4" />
                  {t("tokens.new")}
                </button>
              )}
            />
            <DialogContent className="glass max-w-md border-0 bg-card/90 backdrop-blur-2xl">
              <DialogHeader>
                <DialogTitle className="text-gradient-aurora text-2xl">
                  {t("tokens.newTitle")}
                </DialogTitle>
                <DialogDescription>
                  {t("tokens.newDescription")}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onCreate)} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    {t("tokens.nameLabel")}
                  </label>
                  <Input placeholder="Claude Desktop" {...form.register("name")} />
                  {form.formState.errors.name ? (
                    <p className="mt-1 text-xs text-rose-300">
                      {form.formState.errors.name.message}
                    </p>
                  ) : null}
                </div>
                <DialogFooter className="gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setCreateOpen(false)}
                    disabled={isPending}
                  >
                    {t("common.cancel")}
                  </Button>
                  <motion.button
                    type="submit"
                    disabled={isPending}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-white to-white/90 px-5 py-2 text-sm font-semibold text-background shadow-lg shadow-violet-500/20 transition-opacity disabled:opacity-60"
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {t("tokens.generate")}
                  </motion.button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ===== Just-created token: shown ONCE ===== */}
      <AnimatePresence>
        {created ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass overflow-hidden rounded-2xl border border-amber-400/30 bg-amber-500/[0.06] p-5"
          >
            <div className="mb-3 flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
              <div>
                <p className="text-sm font-semibold text-amber-100">
                  {t("tokens.justCreatedTitle")}
                </p>
                <p className="mt-0.5 text-xs text-amber-200/70">
                  {t("tokens.justCreatedDesc")}
                </p>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-400/20 bg-black/40 px-3 py-2 font-mono text-xs">
              <code className="flex-1 truncate" dir="ltr">
                {created.token}
              </code>
              <button
                type="button"
                onClick={() => copy(created.token, "token")}
                className="inline-flex items-center gap-1 rounded-lg bg-amber-400/20 px-2 py-1 text-amber-100 transition-colors hover:bg-amber-400/30"
              >
                {copied === "token" ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {t("common.copy")}
              </button>
            </div>

            {claudeConfig ? (
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-medium text-amber-100">
                  <Terminal className="h-3.5 w-3.5" />
                  {t("tokens.configToggle")}
                  <span className="text-amber-300 group-open:hidden">↓</span>
                  <span className="hidden text-amber-300 group-open:inline">↑</span>
                </summary>
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-400/20 bg-black/50 p-3">
                  <pre className="flex-1 overflow-x-auto text-[11px] leading-relaxed text-amber-50" dir="ltr">
                    <code>{claudeConfig}</code>
                  </pre>
                  <button
                    type="button"
                    onClick={() => copy(claudeConfig, "config")}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-amber-400/20 px-2 py-1 text-xs text-amber-100 transition-colors hover:bg-amber-400/30"
                  >
                    {copied === "config" ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {t("common.copy")}
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-amber-200/70">
                  {t("tokens.configHint")}
                  <code className="mx-1 rounded bg-white/5 px-1 py-0.5 font-mono">
                    ~/.config/claude/mcp_servers.json
                  </code>
                  {t("tokens.configHintRest")}
                </p>
              </details>
            ) : null}

            <button
              type="button"
              onClick={() => setCreated(null)}
              className="mt-4 text-xs text-amber-300 underline-offset-4 hover:underline"
            >
              {t("tokens.dismiss")}
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ===== Existing tokens list ===== */}
      <div className="glass rounded-2xl border-0 bg-card/40">
        <div className="border-b border-border/60 px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground">
          {t("tokens.currentCount")} ({tokens.length})
        </div>

        {tokens.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            {t("empty.tokens")}
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {tokens.map((tk) => {
              const revoked = !!tk.revokedAt;
              return (
                <li
                  key={tk.id}
                  className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{tk.name}</span>
                      {revoked ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-rose-400/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-200">
                          {t("tokens.statusRevoked")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                          <ShieldCheck className="h-3 w-3" />
                          {t("tokens.statusActive")}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-muted-foreground">
                      <span className="font-mono" dir="ltr">
                        {tk.prefix}…
                      </span>
                      <span>{t("tokens.createdOn")} {formatDate(tk.createdAt)}</span>
                      <span>
                        {t("tokens.lastUsed")}: {tk.lastUsedAt ? formatDate(tk.lastUsedAt) : "—"}
                      </span>
                    </div>
                  </div>
                  {!revoked ? (
                    <button
                      type="button"
                      onClick={() => onRevoke(tk.id)}
                      disabled={isPending}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-200 transition-colors hover:bg-rose-500/20 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {t("tokens.revoke")}
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
