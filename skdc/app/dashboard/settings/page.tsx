"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Settings"
        title="الإعدادات"
        description="إدارة ورشتك، فريق العمل، الاشتراك، والتكاملات."
      />

      <Tabs defaultValue="workspace" className="w-full">
        <TabsList className="glass mb-6 h-auto gap-1 rounded-2xl bg-card/40 p-1.5">
          <TabsTrigger
            value="workspace"
            className="rounded-xl px-5 py-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-violet-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white"
          >
            الورشة
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="rounded-xl px-5 py-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-violet-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white"
          >
            الفريق
          </TabsTrigger>
          <TabsTrigger
            value="machines"
            className="rounded-xl px-5 py-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-violet-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white"
          >
            الماكينات
          </TabsTrigger>
          <TabsTrigger
            value="billing"
            className="rounded-xl px-5 py-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-violet-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white"
          >
            الاشتراك
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workspace">
          <Card className="glass border-0 bg-card/40">
            <CardHeader>
              <CardTitle>معلومات الورشة</CardTitle>
              <CardDescription>
                اسم الورشة، الشعار، والمعلومات العامة.
              </CardDescription>
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
              <CardDescription>
                دعوة مصممين وإدارة الصلاحيات.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              قريباً — يحتاج خطة Pro لدعوة أعضاء.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="machines">
          <Card className="glass border-0 bg-card/40">
            <CardHeader>
              <CardTitle>الماكينات المربوطة</CardTitle>
              <CardDescription>
                ربط ماكينات الورشة (Beam Saw، CNC، Edge Bander، إلخ) لإرسال
                مخطط القص مباشرة.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p className="mb-3">
                نظام Universal Machine Integration يدعم كل ماكينات الورش:
              </p>
              <ul className="list-inside list-disc space-y-1 text-xs">
                <li>Beam Saw (منشار الألواح)</li>
                <li>CNC Router (تفريز)</li>
                <li>Edge Bander (لصق الحواف)</li>
                <li>Drilling Machine (ثقب الـ Dowel)</li>
                <li>Nesting Machine (التفريز الذكي)</li>
              </ul>
              <p className="mt-3 text-xs italic">قادم في Phase 3 من الـ Roadmap.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card className="glass border-0 bg-card/40">
            <CardHeader>
              <CardTitle>الخطة الحالية: مجانية</CardTitle>
              <CardDescription>
                مشروع واحد + 3 عملاء + قوالب أساسية.
              </CardDescription>
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
