/**
 * SKDC — lightweight i18n with industry-accurate Chinese.
 *
 * Chinese terms were sourced from research into the Foshan/Shunde cabinet
 * manufacturing industry (the actual vocabulary factory workers and designers
 * use day-to-day — not dictionary translations). See docs/CHINA_LOCALIZATION.md.
 *
 * Locales:
 *   - ar: العربية (Saudi market — RTL)
 *   - en: English (international fallback)
 *   - zh: 简体中文 (Mainland China factories + designers — Foshan/Shunde)
 */

export type Locale = "ar" | "en" | "zh";

export const LOCALES: {
  code: Locale;
  label: string;
  nativeLabel: string;
  flag: string;
  flagEmoji: string;
  dir: "rtl" | "ltr";
}[] = [
  {
    code: "ar",
    label: "Arabic",
    nativeLabel: "العربية",
    flag: "SA",
    flagEmoji: "🇸🇦",
    dir: "rtl",
  },
  {
    code: "en",
    label: "English",
    nativeLabel: "English",
    flag: "US",
    flagEmoji: "🇺🇸",
    dir: "ltr",
  },
  {
    code: "zh",
    label: "Chinese",
    nativeLabel: "中文",
    flag: "CN",
    flagEmoji: "🇨🇳",
    dir: "ltr",
  },
];

export const DEFAULT_LOCALE: Locale = "ar";

type Dict = Record<string, string>;

export const translations: Record<Locale, Dict> = {
  // ===========================================================
  // العربية
  // ===========================================================
  ar: {
    "nav.home": "الرئيسية",
    "nav.customers": "العملاء",
    "nav.materials": "الخامات",
    "nav.templates": "القوالب",
    "nav.projects": "المشاريع",
    "nav.designer": "محرر التصميم",
    "nav.designer3d": "معاينة 3D",
    "nav.settings": "الإعدادات",
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.delete": "حذف",
    "common.edit": "تعديل",
    "common.add": "إضافة",
    "common.search": "بحث",
    "common.loading": "جاري التحميل...",
    "common.signOut": "تسجيل الخروج",
    "common.signIn": "تسجيل الدخول",
    "common.signUp": "إنشاء حساب",
    "topbar.search": "ابحث في كل شيء...",
    "userMenu.settings": "الإعدادات",
    "userMenu.theme": "تبديل المظهر",
    "userMenu.language": "اللغة",
    "landing.tagline": "صمّم مطبخك بذكاء سحابي",
    "landing.subtitle":
      "منصة سحابية ذكية لتصميم المطابخ بقوالب جاهزة قابلة للتعديل، توليد فاتورة ومخطط قص تلقائياً، ودعم 3 لغات.",
    "landing.ctaPrimary": "جرّب مجاناً",
    "landing.ctaSecondary": "شاهد العرض",
    "auth.heading": "سجّل دخولك",
    "auth.emailLabel": "البريد الإلكتروني",
    "auth.sendMagicLink": "أرسل رابط الدخول",
    "auth.continueGoogle": "متابعة باستخدام Google",
    "auth.checkInbox": "تحقق من بريدك",
    "machine.beamSaw": "منشار ألواح",
    "machine.cncRouter": "CNC Router",
    "machine.edgeBander": "ماكينة لصق الحواف",
    "machine.drilling": "ماكينة تثقيب",
    "material.glass": "زجاج",
    "material.hpl": "HPL",
    "material.mdf": "MDF",
    "material.wood": "خشب طبيعي",

    // ===== Dashboard pages =====
    "page.customers.eyebrow": "Customers",
    "page.customers.title": "العملاء",
    "page.customers.description": "إدارة قاعدة عملاء ورشتك — كل عميل قابل للربط بمشاريع وفواتير.",
    "page.customers.empty.title": "ابدأ بإضافة أول عميل",
    "page.customers.empty.description": "بيانات العميل تربط المشاريع والفواتير في مكان واحد.",
    "page.customers.action.add": "إضافة عميل",

    "page.materials.eyebrow": "Materials",
    "page.materials.title": "الخامات",
    "page.materials.description": "إدارة خاماتك وأسعارها — HPL، POLYLACK، MDF، MELAMIN، UVLACK، خشب طبيعي.",
    "page.materials.empty.title": "ابدأ بتخصيص خاماتك",
    "page.materials.empty.description": "أضف خامات ورشتك مع الأسعار والسماكات لتسريع التسعير التلقائي.",
    "page.materials.action.add": "إضافة خامة",

    "page.templates.eyebrow": "Templates",
    "page.templates.title": "القوالب",
    "page.templates.description": "مكتبة قوالب جاهزة + إمكانية بناء قوالب خاصة بورشتك. كل قالب قابل للتخصيص قبل الدمج.",
    "page.templates.action.custom": "قالب مخصص",

    "page.projects.eyebrow": "Projects",
    "page.projects.title": "المشاريع",
    "page.projects.description": "كل مشروع يجمع العميل والتصميم والفاتورة في مكان واحد.",
    "page.projects.action.new": "مشروع جديد",
    "page.projects.empty.title": "أنشئ أول مشروع",
    "page.projects.empty.description": "كل مشروع يبدأ بعميل وأبعاد الغرفة.",

    "page.settings.eyebrow": "Settings",
    "page.settings.title": "الإعدادات",
    "page.settings.description": "إدارة ورشتك، فريق العمل، الماكينات، والاشتراك.",
    "page.settings.tab.workspace": "الورشة",
    "page.settings.tab.team": "الفريق",
    "page.settings.tab.machines": "الماكينات",
    "page.settings.tab.api": "MCP & API",
    "page.settings.tab.billing": "الاشتراك",

    "page.designer.eyebrow": "Designer",
    "page.designer.title": "محرر التصميم",
    "page.designer.description": "ابدأ تصميم أول مطبخ — كل تصميم يُربط بمشروع.",
    "page.designer.noProject.title": "لا يوجد مشروع للتصميم بعد",
    "page.designer.noProject.description": "المحرر يفتح داخل أي مشروع. أنشئ مشروعك الأول (يستغرق دقيقة) وستعود لهنا تلقائياً للتصميم.",
    "page.designer.noProject.cta": "إنشاء مشروع جديد",
    "page.designer.picker.title": "اختر المشروع للتصميم",
    "page.designer.picker.description": "كل مشروع له لوحة تصميم خاصة. اختر مشروعاً للدخول للمحرر.",
    "page.designer.openEditor": "افتح المحرر",
    "page.designer.noDimensions": "بدون أبعاد بعد",

    // ===== Dashboard home =====
    "dashboard.eyebrow": "Dashboard",
    "dashboard.welcome": "مرحباً بك في SKDC",
    "dashboard.subtitle": "نظرة سريعة على ورشتك. ابدأ بإضافة عميل أو إنشاء مشروع جديد.",
    "dashboard.stats.designs": "تصاميم محفوظة",
    "dashboard.stats.invoices": "فواتير صادرة",
    "dashboard.stats.customers": "عملاء",
    "dashboard.stats.activeProjects": "مشاريع نشطة",
    "dashboard.quickActions.title": "الإجراءات السريعة",
    "dashboard.quickActions.newProject.title": "إنشاء مشروع جديد",
    "dashboard.quickActions.newProject.subtitle": "ابدأ تصميم مطبخ لعميل",
    "dashboard.quickActions.newCustomer.title": "إضافة عميل",
    "dashboard.quickActions.newCustomer.subtitle": "أضف عميل لقاعدة بياناتك",
    "dashboard.quickActions.exploreTemplates.title": "استكشاف القوالب",
    "dashboard.quickActions.exploreTemplates.subtitle": "35 قالب جاهز + قوالب مخصصة",
    "dashboard.recent.title": "النشاط الأخير",
    "dashboard.recent.empty": "لا يوجد نشاط حديث بعد",
    "dashboard.recent.emptySub": "عند إنشاء مشاريع وإصدار فواتير، ستظهر هنا.",
  },

  // ===========================================================
  // English
  // ===========================================================
  en: {
    "nav.home": "Home",
    "nav.customers": "Customers",
    "nav.materials": "Materials",
    "nav.templates": "Templates",
    "nav.projects": "Projects",
    "nav.designer": "Designer",
    "nav.designer3d": "3D Preview",
    "nav.settings": "Settings",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.add": "Add",
    "common.search": "Search",
    "common.loading": "Loading...",
    "common.signOut": "Sign out",
    "common.signIn": "Sign in",
    "common.signUp": "Sign up",
    "topbar.search": "Search anything...",
    "userMenu.settings": "Settings",
    "userMenu.theme": "Switch theme",
    "userMenu.language": "Language",
    "landing.tagline": "Design kitchens with cloud intelligence",
    "landing.subtitle":
      "A smart cloud platform for kitchen design with ready editable templates, automatic invoice & cut-list generation, and 3-language support.",
    "landing.ctaPrimary": "Try free",
    "landing.ctaSecondary": "Watch demo",
    "auth.heading": "Sign in",
    "auth.emailLabel": "Email",
    "auth.sendMagicLink": "Send sign-in link",
    "auth.continueGoogle": "Continue with Google",
    "auth.checkInbox": "Check your inbox",
    "machine.beamSaw": "Beam Saw",
    "machine.cncRouter": "CNC Router",
    "machine.edgeBander": "Edge Bander",
    "machine.drilling": "Drilling Machine",
    "material.glass": "Glass",
    "material.hpl": "HPL",
    "material.mdf": "MDF",
    "material.wood": "Solid Wood",

    // ===== Dashboard pages =====
    "page.customers.eyebrow": "Customers",
    "page.customers.title": "Customers",
    "page.customers.description": "Manage your workshop's customer database — every customer can be linked to projects and invoices.",
    "page.customers.empty.title": "Add your first customer",
    "page.customers.empty.description": "Customer data links projects and invoices in one place.",
    "page.customers.action.add": "Add customer",

    "page.materials.eyebrow": "Materials",
    "page.materials.title": "Materials",
    "page.materials.description": "Manage your panel materials and prices — HPL, POLYLACK, MDF, MELAMIN, UVLACK, solid wood.",
    "page.materials.empty.title": "Customize your materials",
    "page.materials.empty.description": "Add workshop materials with prices and thicknesses for automatic pricing.",
    "page.materials.action.add": "Add material",

    "page.templates.eyebrow": "Templates",
    "page.templates.title": "Templates",
    "page.templates.description": "Ready-made template library + the ability to build custom templates for your workshop.",
    "page.templates.action.custom": "Custom template",

    "page.projects.eyebrow": "Projects",
    "page.projects.title": "Projects",
    "page.projects.description": "Each project bundles the customer, design and invoice in one place.",
    "page.projects.action.new": "New project",
    "page.projects.empty.title": "Create your first project",
    "page.projects.empty.description": "Every project starts with a customer and room dimensions.",

    "page.settings.eyebrow": "Settings",
    "page.settings.title": "Settings",
    "page.settings.description": "Manage your workshop, team, machines, and subscription.",
    "page.settings.tab.workspace": "Workspace",
    "page.settings.tab.team": "Team",
    "page.settings.tab.machines": "Machines",
    "page.settings.tab.api": "MCP & API",
    "page.settings.tab.billing": "Billing",

    "page.designer.eyebrow": "Designer",
    "page.designer.title": "Design Editor",
    "page.designer.description": "Start designing your first kitchen — each design is tied to a project.",
    "page.designer.noProject.title": "No project to design yet",
    "page.designer.noProject.description": "The editor opens inside a project. Create your first project (it takes a minute) and you'll return here automatically.",
    "page.designer.noProject.cta": "Create new project",
    "page.designer.picker.title": "Pick a project to design",
    "page.designer.picker.description": "Each project has its own design canvas. Choose a project to enter the editor.",
    "page.designer.openEditor": "Open editor",
    "page.designer.noDimensions": "No dimensions yet",

    // ===== Dashboard home =====
    "dashboard.eyebrow": "Dashboard",
    "dashboard.welcome": "Welcome to SKDC",
    "dashboard.subtitle": "A quick glance at your workshop. Start by adding a customer or creating a new project.",
    "dashboard.stats.designs": "Saved designs",
    "dashboard.stats.invoices": "Issued invoices",
    "dashboard.stats.customers": "Customers",
    "dashboard.stats.activeProjects": "Active projects",
    "dashboard.quickActions.title": "Quick actions",
    "dashboard.quickActions.newProject.title": "Create new project",
    "dashboard.quickActions.newProject.subtitle": "Start designing a kitchen for a customer",
    "dashboard.quickActions.newCustomer.title": "Add customer",
    "dashboard.quickActions.newCustomer.subtitle": "Add a customer to your database",
    "dashboard.quickActions.exploreTemplates.title": "Explore templates",
    "dashboard.quickActions.exploreTemplates.subtitle": "35 ready templates + custom ones",
    "dashboard.recent.title": "Recent activity",
    "dashboard.recent.empty": "No recent activity yet",
    "dashboard.recent.emptySub": "As you create projects and issue invoices, they'll show up here.",
  },

  // ===========================================================
  // 简体中文 (Industry-accurate, Foshan/Shunde factory terminology)
  // ===========================================================
  zh: {
    "nav.home": "首页",
    "nav.customers": "客户",
    "nav.materials": "板材", // panel material — what factories actually say
    "nav.templates": "柜体模板", // cabinet templates
    "nav.projects": "订单", // dingdan — order, not "project" — factories think in orders
    "nav.designer": "设计编辑器",
    "nav.designer3d": "三维预览",
    "nav.settings": "设置",
    "common.save": "保存",
    "common.cancel": "取消",
    "common.delete": "删除",
    "common.edit": "编辑",
    "common.add": "添加",
    "common.search": "搜索",
    "common.loading": "加载中...",
    "common.signOut": "退出登录",
    "common.signIn": "登录",
    "common.signUp": "注册",
    "topbar.search": "搜索任意内容...",
    "userMenu.settings": "设置",
    "userMenu.theme": "切换主题",
    "userMenu.language": "语言",
    "landing.tagline": "云端智能橱柜设计平台", // 橱柜 chúguì = kitchen cabinet
    "landing.subtitle":
      "智能云端橱柜设计软件，提供现成的可编辑柜体模板，自动生成报价单与开料单，支持三种语言。",
    "landing.ctaPrimary": "免费试用",
    "landing.ctaSecondary": "观看演示",
    "auth.heading": "登录",
    "auth.emailLabel": "邮箱",
    "auth.sendMagicLink": "发送登录链接",
    "auth.continueGoogle": "使用 Google 登录",
    "auth.checkInbox": "请查收邮件",
    "machine.beamSaw": "电子裁板锯", // diànzǐ cáibǎnjù
    "machine.cncRouter": "数控开料机", // shùkòng kāiliàojī
    "machine.edgeBander": "封边机", // fēngbiānjī
    "machine.drilling": "多排钻", // duōpái zuàn
    "material.glass": "玻璃",
    "material.hpl": "防火板",
    "material.mdf": "中纤板",
    "material.wood": "实木",
    // Industry terms (used in tooltips / cabinet-config UI later)
    "industry.cabinet": "柜体",
    "industry.baseCabinet": "地柜",
    "industry.wallCabinet": "吊柜",
    "industry.tallCabinet": "高柜",
    "industry.door": "门板",
    "industry.drawer": "抽屉",
    "industry.shelf": "层板",
    "industry.hinge": "铰链",
    "industry.softCloseHinge": "阻尼铰链",
    "industry.drawerSlide": "滑轨",
    "industry.softCloseSlide": "阻尼滑轨",
    "industry.handle": "拉手",
    "industry.edgeBanding": "封边条",
    "industry.countertop": "台面",
    "industry.ledStrip": "LED 灯带",
    "industry.toeKick": "踢脚线",
    "industry.rangeHood": "油烟机",
    "industry.cuttingPlan": "开料单",
    "industry.nesting": "优化排板",
    "industry.bom": "物料清单",
    "industry.quotation": "报价单",
    "industry.fapiao": "发票",
    "industry.workshop": "车间",
    "industry.installer": "安装师傅",

    // ===== Dashboard pages =====
    "page.customers.eyebrow": "客户",
    "page.customers.title": "客户管理",
    "page.customers.description": "管理车间的客户数据库 — 每个客户都可以关联到订单和报价单。",
    "page.customers.empty.title": "添加第一个客户",
    "page.customers.empty.description": "客户数据将订单和发票统一管理。",
    "page.customers.action.add": "添加客户",

    "page.materials.eyebrow": "板材",
    "page.materials.title": "板材管理",
    "page.materials.description": "管理板材种类与价格 — 防火板、UV板、密度板、三聚氰胺板、实木。",
    "page.materials.empty.title": "开始定制板材",
    "page.materials.empty.description": "添加车间的板材价格与厚度,加速自动报价。",
    "page.materials.action.add": "添加板材",

    "page.templates.eyebrow": "柜体模板",
    "page.templates.title": "柜体模板",
    "page.templates.description": "现成的柜体模板库 + 可为车间定制专属模板。每个模板都可在使用前自由编辑。",
    "page.templates.action.custom": "定制模板",

    "page.projects.eyebrow": "订单",
    "page.projects.title": "订单管理",
    "page.projects.description": "每个订单将客户、设计与发票整合在一起。",
    "page.projects.action.new": "新建订单",
    "page.projects.empty.title": "创建第一个订单",
    "page.projects.empty.description": "每个订单从客户和房间尺寸开始。",

    "page.settings.eyebrow": "设置",
    "page.settings.title": "设置",
    "page.settings.description": "管理车间、团队、设备与订阅。",
    "page.settings.tab.workspace": "车间",
    "page.settings.tab.team": "团队",
    "page.settings.tab.machines": "设备",
    "page.settings.tab.api": "MCP & API",
    "page.settings.tab.billing": "订阅",

    "page.designer.eyebrow": "设计编辑器",
    "page.designer.title": "设计编辑器",
    "page.designer.description": "开始设计第一个橱柜 — 每个设计都关联到一个订单。",
    "page.designer.noProject.title": "暂无可设计的订单",
    "page.designer.noProject.description": "编辑器在订单内打开。先创建第一个订单(只需一分钟),然后会自动回到此处进入编辑器。",
    "page.designer.noProject.cta": "新建订单",
    "page.designer.picker.title": "选择订单进入编辑器",
    "page.designer.picker.description": "每个订单有独立的设计画布。选择一个订单进入编辑器。",
    "page.designer.openEditor": "打开编辑器",
    "page.designer.noDimensions": "尚未设置尺寸",

    // ===== Dashboard home =====
    "dashboard.eyebrow": "首页",
    "dashboard.welcome": "欢迎使用 SKDC",
    "dashboard.subtitle": "车间一览。从添加客户或创建新订单开始。",
    "dashboard.stats.designs": "已保存设计",
    "dashboard.stats.invoices": "已开发票",
    "dashboard.stats.customers": "客户",
    "dashboard.stats.activeProjects": "进行中的订单",
    "dashboard.quickActions.title": "快捷操作",
    "dashboard.quickActions.newProject.title": "创建新订单",
    "dashboard.quickActions.newProject.subtitle": "为客户开始设计橱柜",
    "dashboard.quickActions.newCustomer.title": "添加客户",
    "dashboard.quickActions.newCustomer.subtitle": "把客户添加到数据库",
    "dashboard.quickActions.exploreTemplates.title": "浏览模板",
    "dashboard.quickActions.exploreTemplates.subtitle": "35 个现成模板 + 定制模板",
    "dashboard.recent.title": "最近活动",
    "dashboard.recent.empty": "暂无最近活动",
    "dashboard.recent.emptySub": "创建订单和开票后,记录会显示在这里。",
  },
};

export function getDir(locale: Locale): "rtl" | "ltr" {
  return LOCALES.find((l) => l.code === locale)?.dir ?? "rtl";
}

export function getLocaleInfo(locale: Locale) {
  return LOCALES.find((l) => l.code === locale) ?? LOCALES[0];
}
