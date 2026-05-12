import { headers } from "next/headers";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MachineFormDialog } from "@/components/machines/machine-form-dialog";
import { MachinesList } from "@/components/machines/machines-list";
import { ApiTokensCard } from "@/components/api/api-tokens-card";
import { T } from "@/components/i18n-text";
import { listMachines } from "@/lib/actions/machines";
import { listTokens } from "@/lib/actions/api-tokens";

export const dynamic = "force-dynamic";

function tabClass() {
  // Tailwind's arbitrary value lets us reference CSS vars at the data-state hook,
  // so the active tab gradient follows the user's chosen theme.
  return [
    "rounded-xl px-5 py-2 data-[state=active]:text-white",
    "data-[state=active]:bg-[linear-gradient(135deg,var(--theme-stop-1,#a78bfa)_0%,var(--theme-stop-2,#f0abfc)_100%)]",
    "data-[state=active]:shadow-[0_10px_25px_-10px_var(--theme-halo,rgba(167,139,250,0.5))]",
  ].join(" ");
}

export default async function SettingsPage() {
  const [machines, tokens, hdrs] = await Promise.all([
    listMachines(),
    listTokens(),
    headers(),
  ]);
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host") ?? "skdc-production.up.railway.app";
  const proto = hdrs.get("x-forwarded-proto") ?? "https";
  const origin = `${proto}://${host}`;

  return (
    <div>
      <PageHeader
        eyebrowKey="page.settings.eyebrow"
        titleKey="page.settings.title"
        descriptionKey="page.settings.description"
      />

      <Tabs defaultValue="workspace" className="w-full">
        <TabsList className="glass mb-6 h-auto gap-1 rounded-2xl bg-card/40 p-1.5">
          <TabsTrigger value="workspace" className={tabClass()}><T k="page.settings.tab.workspace" /></TabsTrigger>
          <TabsTrigger value="team" className={tabClass()}><T k="page.settings.tab.team" /></TabsTrigger>
          <TabsTrigger value="machines" className={tabClass()}><T k="page.settings.tab.machines" /></TabsTrigger>
          <TabsTrigger value="api" className={tabClass()}><T k="page.settings.tab.api" /></TabsTrigger>
          <TabsTrigger value="billing" className={tabClass()}><T k="page.settings.tab.billing" /></TabsTrigger>
        </TabsList>

        <TabsContent value="workspace">
          <Card className="glass border-0 bg-card/40">
            <CardHeader>
              <CardTitle>معلومات الورشة</CardTitle>
              <CardDescription>اسم الورشة، الشعار، والمعلومات العامة.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              قريباً — إعدادات الورشة الكاملة.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card className="glass border-0 bg-card/40">
            <CardHeader>
              <CardTitle>أعضاء الفريق</CardTitle>
              <CardDescription>دعوة مصممين وإدارة الصلاحيات.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              قريباً — يحتاج خطة Pro لدعوة أعضاء.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="machines">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">الماكينات المربوطة</h3>
                <p className="text-xs text-muted-foreground">
                  أي ماكينة في الورشة (Beam Saw، CNC، Edge Bander، ...) قابلة للربط — تصدير DXF، G-Code، CSV، JSON.
                </p>
              </div>
              {machines.length > 0 ? <MachineFormDialog /> : null}
            </div>
            <MachinesList machines={machines} />
          </div>
        </TabsContent>

        <TabsContent value="api">
          <ApiTokensCard initialTokens={tokens} origin={origin} />
        </TabsContent>

        <TabsContent value="billing">
          <Card className="glass border-0 bg-card/40">
            <CardHeader>
              <CardTitle>الخطة الحالية: مجانية</CardTitle>
              <CardDescription>مشروع واحد + 3 عملاء + قوالب أساسية.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              قريباً — ترقية للخطة الاحترافية.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
