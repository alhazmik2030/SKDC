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
  },
};

export function getDir(locale: Locale): "rtl" | "ltr" {
  return LOCALES.find((l) => l.code === locale)?.dir ?? "rtl";
}

export function getLocaleInfo(locale: Locale) {
  return LOCALES.find((l) => l.code === locale) ?? LOCALES[0];
}
