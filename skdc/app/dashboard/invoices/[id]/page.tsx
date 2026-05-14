import { notFound } from "next/navigation";
import Link from "next/link";
import { Printer, ArrowRight } from "lucide-react";
import { getInvoiceForPrint } from "@/lib/actions/invoices";
import { PrintButton } from "@/components/invoices/print-button";

/**
 * The Invoice.lineItems JSON has two flavours:
 *   - "rich" rows produced by the cut-plan engine (label + dimensions + surface area)
 *   - "simple" rows produced by manual entry / seed data (description + qty + unitPrice)
 * Both are tolerated below.
 */
type LineItem = {
  label?: string;
  description?: string;
  category?: string;
  quantity?: number;
  qty?: number;
  widthMm?: number;
  depthMm?: number;
  heightMm?: number;
  surfaceM2?: number;
  unitPrice?: number;
  total?: number;
};

export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<string, string> = {
  LOWER_CABINET: "وحدة سفلية",
  UPPER_CABINET: "وحدة علوية",
  CORNER: "ركنة",
  TALL_CABINET: "دولاب",
  DRAWER: "درج",
  APPLIANCE: "جهاز",
  ACCESSORY: "إكسسوار",
};

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await getInvoiceForPrint(id);
  if (!invoice) notFound();

  const lineItems = (invoice.lineItems as unknown as LineItem[]) ?? [];
  const issueDate = (invoice.issuedAt ?? invoice.createdAt).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background py-8 print:bg-white print:py-0">
      {/* Toolbar — hidden on print */}
      <div className="mx-auto mb-6 flex max-w-4xl items-center justify-between px-6 print:hidden">
        <Link
          href={`/dashboard/projects/${invoice.projectId}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="h-4 w-4" />
          العودة للمشروع
        </Link>
        <PrintButton />
      </div>

      {/* Invoice paper */}
      <div className="invoice-paper mx-auto max-w-4xl bg-white p-8 text-zinc-900 shadow-2xl print:shadow-none print:p-12 md:p-12">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-200 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="relative h-10 w-10">
                <div className="absolute inset-0 rounded-md bg-gradient-to-br from-violet-500 via-fuchsia-500 to-sky-500" />
                <div className="absolute inset-[2px] rounded-[5px] bg-white" />
                <div className="absolute inset-[7px] rounded-sm bg-gradient-to-br from-violet-500 to-sky-500" />
              </div>
              <div>
                <div className="text-xl font-black">SKDC</div>
                <div className="text-[10px] text-zinc-500">Smart Kitchen Design Cloud</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-zinc-600">
              <div className="font-semibold">{invoice.project.workspace.name}</div>
            </div>
          </div>
          <div className="text-left">
            <div className="text-2xl font-black tracking-tight">فاتورة</div>
            <div className="mt-1 font-mono text-sm text-zinc-600">{invoice.number}</div>
            <div className="mt-2 text-xs text-zinc-500">{issueDate}</div>
          </div>
        </div>

        {/* Client + project info */}
        <div className="mt-6 grid grid-cols-2 gap-6 rounded-xl bg-zinc-50 p-4">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500">العميل</div>
            <div className="mt-1 font-semibold">{invoice.project.customer?.name ?? "—"}</div>
            {invoice.project.customer?.phone ? (
              <div className="text-xs text-zinc-600" dir="ltr">
                {invoice.project.customer.phone}
              </div>
            ) : null}
            {invoice.project.customer?.address ? (
              <div className="mt-1 text-xs text-zinc-600">{invoice.project.customer.address}</div>
            ) : null}
          </div>
          <div className="text-left">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500">المشروع</div>
            <div className="mt-1 font-semibold">{invoice.project.name}</div>
            {invoice.project.roomWidth ? (
              <div className="font-mono text-xs text-zinc-600">
                المطبخ: {invoice.project.roomWidth}×{invoice.project.roomDepth}×
                {invoice.project.roomHeight} مم
              </div>
            ) : null}
          </div>
        </div>

        {/* Line items */}
        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50">
              <tr className="text-right text-xs uppercase tracking-wider text-zinc-500">
                <th className="px-3 py-2 font-medium">الوحدة</th>
                <th className="px-3 py-2 font-medium">الفئة</th>
                <th className="px-3 py-2 text-center font-medium">الأبعاد (مم)</th>
                <th className="px-3 py-2 text-center font-medium">المساحة م²</th>
                <th className="px-3 py-2 text-center font-medium">الكمية</th>
                <th className="px-3 py-2 text-left font-medium">المجموع</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, i) => {
                const label = item.label ?? item.description ?? "—";
                const qty = item.quantity ?? item.qty ?? 1;
                const unit = item.unitPrice ?? 0;
                const total = item.total ?? qty * unit;
                const dims =
                  item.widthMm && item.depthMm && item.heightMm
                    ? `${item.widthMm}×${item.depthMm}×${item.heightMm}`
                    : "—";
                const surface = item.surfaceM2 ?? "—";
                const cat = item.category
                  ? CATEGORY_LABEL[item.category] ?? item.category
                  : "—";
                return (
                  <tr key={i} className="border-t border-zinc-200">
                    <td className="px-3 py-3 font-medium">{label}</td>
                    <td className="px-3 py-3 text-xs text-zinc-600">{cat}</td>
                    <td className="px-3 py-3 text-center font-mono text-xs">{dims}</td>
                    <td className="px-3 py-3 text-center font-mono">{surface}</td>
                    <td className="px-3 py-3 text-center">{qty}</td>
                    <td className="px-3 py-3 text-left font-mono font-semibold">
                      {total.toFixed(2)} ر.س
                    </td>
                  </tr>
                );
              })}
              {lineItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-zinc-500">
                    لا توجد بنود
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-6 flex justify-end">
          <div className="w-72 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-600">المجموع الفرعي</span>
              <span className="font-mono">{invoice.subtotal.toFixed(2)} ر.س</span>
            </div>
            {invoice.discount > 0 ? (
              <div className="flex justify-between">
                <span className="text-zinc-600">الخصم</span>
                <span className="font-mono text-rose-600">
                  -{invoice.discount.toFixed(2)} ر.س
                </span>
              </div>
            ) : null}
            <div className="flex justify-between">
              <span className="text-zinc-600">ضريبة القيمة المضافة (15%)</span>
              <span className="font-mono">{invoice.tax.toFixed(2)} ر.س</span>
            </div>
            <div className="mt-2 flex justify-between border-t-2 border-zinc-900 pt-3">
              <span className="text-base font-bold">الإجمالي</span>
              <span className="font-mono text-base font-black">
                {invoice.total.toFixed(2)} ر.س
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 border-t border-zinc-200 pt-6 text-center text-xs text-zinc-500">
          <div>هذه الفاتورة صادرة إلكترونياً عبر منصة SKDC</div>
          <div className="mt-1 font-mono">
            صُنع في المملكة العربية السعودية · skdc.app
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 1cm; }
          body { background: white !important; }
          .invoice-paper { box-shadow: none !important; max-width: 100% !important; }
        }
      `}</style>
    </div>
  );
}
