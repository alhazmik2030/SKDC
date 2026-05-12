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

const Schema = z.object({
  name: z.string().min(1, "اسم المفتاح مطلوب").max(60),
});

type FormValues = z.infer<typeof Schema>;

export interface ApiTokensCardProps {
  initialTokens: ListedToken[];
  /** Used in the config snippet so it always points at the live host. */
  origin: string;
}

export function ApiTokensCard({ initialTokens, origin }: ApiTokensCardProps) {
  const [tokens, setTokens] = React.useState<ListedToken[]>(initialTokens);
  const [created, setCreated] = React.useState<{ token: string; name: string } | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [copied, setCopied] = React.useState<"token" | "config" | null>(null);
  const [isPending, startTransition] = React.useTransition();

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
        toast.error((err as Error).message || "تعذّر إنشاء المفتاح");
      }
    });
  };

  const onRevoke = (id: string) => {
    if (!confirm("سيتم إبطال هذا المفتاح فوراً. تأكيد؟")) return;
    startTransition(async () => {
      try {
        await revokeToken(id);
        setTokens((prev) =>
          prev.map((t) => (t.id === id ? { ...t, revokedAt: new Date() } : t)),
        );
        toast.success("تم إبطال المفتاح");
      } catch (err) {
        toast.error((err as Error).message || "تعذّر الإبطال");
      }
    });
  };

  async function copy(text: string, kind: "token" | "config") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1500);
      toast.success("تم النسخ");
    } catch {
      toast.error("تعذّر النسخ");
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
              <h3 className="text-lg font-bold">مفاتيح MCP / API</h3>
              <p className="mt-1 max-w-prose text-sm text-muted-foreground">
                وفّر اتصالاً مباشراً بين الذكاء الاصطناعي وورشتك. كل مفتاح يمنح
                وصولاً كاملاً لورشتك على endpoint
                <code className="mx-1 rounded bg-white/5 px-1.5 py-0.5 font-mono text-[11px]">
                  POST {origin}/api/mcp
                </code>
                بصلاحيات قراءة وكتابة (إضافة عملاء، مشاريع، وحدات…).
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
                  مفتاح جديد
                </button>
              )}
            />
            <DialogContent className="glass max-w-md border-0 bg-card/90 backdrop-blur-2xl">
              <DialogHeader>
                <DialogTitle className="text-gradient-aurora text-2xl">
                  مفتاح API جديد
                </DialogTitle>
                <DialogDescription>
                  اختر اسماً واضحاً لتمييز المفتاح (مثلاً: «Claude Desktop» أو «Workshop Bot»).
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onCreate)} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    اسم المفتاح
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
                    إلغاء
                  </Button>
                  <motion.button
                    type="submit"
                    disabled={isPending}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-white to-white/90 px-5 py-2 text-sm font-semibold text-background shadow-lg shadow-violet-500/20 transition-opacity disabled:opacity-60"
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    توليد المفتاح
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
                  انسخ المفتاح الآن — لن يظهر مرة أخرى
                </p>
                <p className="mt-0.5 text-xs text-amber-200/70">
                  نخزّن hash فقط لحماية حسابك. أعد توليد مفتاح جديد لو ضاع.
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
                نسخ
              </button>
            </div>

            {claudeConfig ? (
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-medium text-amber-100">
                  <Terminal className="h-3.5 w-3.5" />
                  إعداد Claude Desktop / Cursor (انسخ وألصق)
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
                    نسخ
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-amber-200/70">
                  ضع هذا في
                  <code className="mx-1 rounded bg-white/5 px-1 py-0.5 font-mono">
                    ~/.config/claude/mcp_servers.json
                  </code>
                  (أو ما يقابله في Cursor).
                </p>
              </details>
            ) : null}

            <button
              type="button"
              onClick={() => setCreated(null)}
              className="mt-4 text-xs text-amber-300 underline-offset-4 hover:underline"
            >
              تم — أخفِ هذه النافذة
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ===== Existing tokens list ===== */}
      <div className="glass rounded-2xl border-0 bg-card/40">
        <div className="border-b border-border/60 px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground">
          المفاتيح الحالية ({tokens.length})
        </div>

        {tokens.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            لا توجد مفاتيح بعد. ابدأ بإنشاء مفتاح لربط Claude بورشتك.
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {tokens.map((t) => {
              const revoked = !!t.revokedAt;
              return (
                <li
                  key={t.id}
                  className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{t.name}</span>
                      {revoked ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-rose-400/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-200">
                          مُبطَل
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                          <ShieldCheck className="h-3 w-3" />
                          فعّال
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-muted-foreground">
                      <span className="font-mono" dir="ltr">
                        {t.prefix}…
                      </span>
                      <span>أُنشئ {formatDate(t.createdAt)}</span>
                      <span>
                        آخر استخدام: {t.lastUsedAt ? formatDate(t.lastUsedAt) : "—"}
                      </span>
                    </div>
                  </div>
                  {!revoked ? (
                    <button
                      type="button"
                      onClick={() => onRevoke(t.id)}
                      disabled={isPending}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-200 transition-colors hover:bg-rose-500/20 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      إبطال
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

function formatDate(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("ar-SA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
