# خطة السبرنت — أسبوع واحد لبناء MVP

> **المدة:** 7 أيام
> **الاستراتيجية:** 6 موجات × 5 وكلاء = **30 وكيل** بالتوازي داخل كل موجة، تسلسلياً بين الموجات
> **الدور:** مراقب ومراجع (يراجع بعد كل موجة)
> **التاريخ:** 2026-05-12 → 2026-05-19

---

## البيئة المحلية

| الأداة | الحالة | الإصدار |
|--------|--------|---------|
| Node.js | جاهز | v24.14.1 |
| npm | جاهز | 11.11.0 |
| Git | جاهز | 2.53.0 |

## الحسابات المطلوبة (يوم 0 — اليوم نفسه)

> سجّل في هذه الخدمات قبل بدء الموجة الأولى. كلها مجانية.

1. **GitHub** — [github.com/signup](https://github.com/signup) — لتخزين الكود.
2. **Vercel** — [vercel.com/signup](https://vercel.com/signup) — للنشر. سجّل بحساب GitHub.
3. **Supabase** — [supabase.com](https://supabase.com) — لقاعدة البيانات. أنشئ مشروع جديد باسم `skdc-dev`.
4. **VS Code** — [code.visualstudio.com](https://code.visualstudio.com/) — محرر الكود.

> **بعد إنشاء الحسابات:** عطني `DATABASE_URL` من Supabase (Settings → Database → Connection string) — سيتم استخدامه في الموجة 1.

---

## الموجة 1 — التأسيس (اليوم 1)

**الهدف:** بنية المشروع جاهزة + قاعدة بيانات متصلة + تسجيل دخول يعمل.

| # | الوكيل | المهمة | الملفات الناتجة |
|---|--------|---------|----------------|
| 1 | Setup Engineer | إنشاء مشروع Next.js + TypeScript + Tailwind + إعداد أساسي | `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts` |
| 2 | Database Architect | تصميم Prisma schema (Workspace, User, Customer, Material, Template, Project, Design, Unit, Invoice) | `prisma/schema.prisma`, `prisma/seed.ts` |
| 3 | Auth Engineer | إعداد NextAuth.js مع Email + Google providers + Workspace creation | `app/api/auth/[...nextauth]/route.ts`, `lib/auth.ts` |
| 4 | UI Foundation | shadcn/ui setup + RTL/LTR support + dark mode + base layout | `app/layout.tsx`, `components/ui/*`, `globals.css` |
| 5 | DevOps | GitHub repo + Vercel project + environment variables + README | `.github/workflows/*`, `.env.example`, `README.md` |

**نقطة المراجعة 1:** نقرّر معاً قبل الموجة 2 — Schema صحيح؟ Auth يعمل؟

---

## الموجة 2 — Backend Models + API (اليوم 2)

**الهدف:** كل الـ APIs لإنشاء/قراءة/تعديل/حذف البيانات الأساسية.

| # | الوكيل | المهمة |
|---|--------|---------|
| 6 | Workspace API | endpoints للـ workspace + multi-tenancy middleware |
| 7 | Customer API | CRUD كامل للعملاء + validation + RBAC |
| 8 | Material API | CRUD للخامات + asar/متر² + thickness |
| 9 | Template API | CRUD للقوالب + JSON schema للخصائص + seed data |
| 10 | Project + Invoice API | CRUD للمشاريع + invoice generation logic |

**نقطة المراجعة 2:** نختبر الـ APIs بـ Thunder Client أو Postman.

---

## الموجة 3 — UI Foundations (اليوم 3)

**الهدف:** المكونات المشتركة + Layout الكامل.

| # | الوكيل | المهمة |
|---|--------|---------|
| 11 | Navigation | Sidebar + topbar + workspace switcher + language switcher |
| 12 | Forms | react-hook-form + zod + shadcn form components قابلة لإعادة الاستخدام |
| 13 | Data Tables | shadcn data-table مع filtering/sorting/pagination |
| 14 | Dashboard | الصفحة الرئيسية بعد الدخول + KPI cards + recent activity |
| 15 | Loading/Error | Skeleton loaders + error boundaries + toast notifications (sonner) |

**نقطة المراجعة 3:** نتأكد UI متناسق + RTL يعمل صح.

---

## الموجة 4 — الصفحات الأساسية (اليوم 4)

**الهدف:** كل صفحات الإدارة شغّالة (CRUD UI).

| # | الوكيل | المهمة |
|---|--------|---------|
| 16 | Customers Page | List + Detail + Create/Edit forms |
| 17 | Materials Page | List + Create/Edit + bulk upload from CSV |
| 18 | Templates Page | Gallery view + Detail + clone-and-customize |
| 19 | Projects Page | List + Create wizard + project detail |
| 20 | Settings Page | Workspace settings + team members + plan info |

**نقطة المراجعة 4:** كل الصفحات يدخل/يخرج منها بسلاسة.

---

## الموجة 5 — محرر التصميم 2D (اليوم 5)

**الهدف:** القلب الفعلي للبرنامج — محرر الـ 2D.

| # | الوكيل | المهمة |
|---|--------|---------|
| 21 | Canvas Engine | React Konva setup + grid + walls + zoom/pan |
| 22 | Unit Components | شكل بصري لكل نوع وحدة (سفلية، علوية، إكسسوار) |
| 23 | Drag & Drop | سحب وحدة من المكتبة + إفلات على Canvas + Snap to grid |
| 24 | Unit Properties Panel | محرر خصائص الوحدة (أبعاد، خامة، عدد أرفف، إلخ) |
| 25 | Design Save/Load | حفظ التصميم في DB + استعادته + history (undo/redo) |

**نقطة المراجعة 5:** نصمم مطبخ بسيط من الصفر — هل يشتغل؟

---

## الموجة 6 — الفاتورة + i18n + النشر (اليوم 6-7)

**الهدف:** الإكمال والإطلاق.

| # | الوكيل | المهمة |
|---|--------|---------|
| 26 | Invoice Generator | HTML/PDF فاتورة احترافية من المشروع + طباعة |
| 27 | Quote Calculation | حساب السعر التلقائي (وحدات × خامات × المعامل) |
| 28 | i18n Setup | next-intl + ترجمة العربي + الإنجليزي (الصيني لاحقاً) |
| 29 | Polish & Bugs | إصلاح الأخطاء الظاهرة + UI polish + accessibility |
| 30 | Deploy & QA | نشر نهائي على Vercel + اختبار E2E بسيط + Demo data |

**النتيجة النهائية:** مشروع منشور على رابط `https://skdc.vercel.app` يقدر يُعرض على عميل تجريبي.

---

## قواعد التشغيل لتجنب الفوضى

1. **كل وكيل يشتغل على ملفات محددة** ولا يلمس ملفات وكيل آخر داخل نفس الموجة.
2. **بين الموجات:** Commit + Push لـ Git قبل بدء الموجة التالية.
3. **نقطة المراجعة بعد كل موجة:** نراجع الكود معاً ونوافق قبل التالي.
4. **في حال فشل وكيل:** نوقف الموجة، نصلح، نعيد فقط الوكيل الفاشل.
5. **التتبع:** TodoWrite لكل وكيل — حالته (pending/in_progress/completed).

---

## ما الذي **لن** نبنيه في هذا السبرنت

> الالتزام بـ MVP يعني تأجيل هذي المميزات. مهمة لكن مش في الأسبوع الأول.

- ⏸ **محرر 3D** (المرحلة 2 من PLAN.md)
- ⏸ **مخطط القص الحقيقي** (المرحلة 3)
- ⏸ **اللغة الصينية** (المرحلة 4)
- ⏸ **Stripe والاشتراكات** (المرحلة 5)
- ⏸ **MCP Server** (المرحلة 6)
- ⏸ **Image-to-Design** (المرحلة 6)

---

## التكلفة التقديرية للسبرنت

| البند | التكلفة |
|------|---------|
| Vercel (Hobby) | $0 |
| Supabase (Free) | $0 |
| GitHub | $0 |
| domain (اختياري) | $0 — نستخدم `*.vercel.app` |
| Claude API tokens (30 وكيل) | حسب الخطة عندك |
| **الإجمالي** | $0 — بدون نطاق مخصص |

---

## ابدأ الآن (الخطوات الفورية)

1. سجّل في 4 الحسابات أعلاه.
2. أنشئ مشروع Supabase باسم `skdc-dev`.
3. انسخ الـ `DATABASE_URL` وعطني إياه (بصيغة شات عادي).
4. أقول لك "ابدأ الموجة 1" → أطلق 5 وكلاء بالتوازي.
5. بعد ~30-60 دقيقة نراجع نتيجة الموجة 1 ونقرر.
