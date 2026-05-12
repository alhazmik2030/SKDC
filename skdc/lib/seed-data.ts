// =====================================================================
// SKDC - Seed Data
// Arabic kitchen design templates, materials, and demo customers.
// All measurements in millimeters (mm). Prices in SAR per square meter.
// =====================================================================

import type { TemplateCategory, MaterialType } from "@prisma/client";

export type SeedTemplate = {
  name: string;
  category: TemplateCategory;
  defaultWidth: number;
  defaultHeight: number;
  defaultDepth: number;
  options: Record<string, unknown>;
};

export type SeedMaterial = {
  name: string;
  type: MaterialType;
  color: string;
  thicknessMm: number;
  pricePerM2: number;
};

export type SeedCustomer = {
  name: string;
  phone: string;
  address: string;
};

// ---------------------------------------------------------------------
// TEMPLATES
// ---------------------------------------------------------------------

export const TEMPLATES: SeedTemplate[] = [
  // ---------- LOWER_CABINET (وحدات سفلية) ----------
  {
    name: "وحدة سفلية ضلفة واحدة",
    category: "LOWER_CABINET",
    defaultWidth: 400,
    defaultHeight: 720,
    defaultDepth: 580,
    options: { doors: 1, shelves: 1 },
  },
  {
    name: "وحدة سفلية ضلفتين",
    category: "LOWER_CABINET",
    defaultWidth: 600,
    defaultHeight: 720,
    defaultDepth: 580,
    options: { doors: 2, shelves: 1 },
  },
  {
    name: "وحدة سفلية ضلفتين كبيرة",
    category: "LOWER_CABINET",
    defaultWidth: 800,
    defaultHeight: 720,
    defaultDepth: 580,
    options: { doors: 2, shelves: 1 },
  },
  {
    name: "وحدة سفلية درج واحد",
    category: "LOWER_CABINET",
    defaultWidth: 600,
    defaultHeight: 720,
    defaultDepth: 580,
    options: { drawers: 1, doors: 1 },
  },
  {
    name: "وحدة سفلية درجين",
    category: "LOWER_CABINET",
    defaultWidth: 600,
    defaultHeight: 720,
    defaultDepth: 580,
    options: { drawers: 2 },
  },
  {
    name: "وحدة سفلية ثلاثة أدراج",
    category: "LOWER_CABINET",
    defaultWidth: 600,
    defaultHeight: 720,
    defaultDepth: 580,
    options: { drawers: 3 },
  },
  {
    name: "وحدة سفلية أربعة أدراج",
    category: "LOWER_CABINET",
    defaultWidth: 600,
    defaultHeight: 720,
    defaultDepth: 580,
    options: { drawers: 4 },
  },
  {
    name: "وحدة سفلية لحوض المغسلة",
    category: "LOWER_CABINET",
    defaultWidth: 800,
    defaultHeight: 720,
    defaultDepth: 580,
    options: { doors: 2, sinkCutout: true },
  },

  // ---------- UPPER_CABINET (وحدات علوية) ----------
  {
    name: "وحدة علوية ضلفة",
    category: "UPPER_CABINET",
    defaultWidth: 400,
    defaultHeight: 720,
    defaultDepth: 350,
    options: { doors: 1, shelves: 2 },
  },
  {
    name: "وحدة علوية ضلفتين",
    category: "UPPER_CABINET",
    defaultWidth: 600,
    defaultHeight: 720,
    defaultDepth: 350,
    options: { doors: 2, shelves: 2 },
  },
  {
    name: "وحدة علوية فلاب",
    category: "UPPER_CABINET",
    defaultWidth: 600,
    defaultHeight: 400,
    defaultDepth: 350,
    options: { flap: true },
  },
  {
    name: "وحدة علوية زجاج",
    category: "UPPER_CABINET",
    defaultWidth: 600,
    defaultHeight: 720,
    defaultDepth: 350,
    options: { doors: 2, glass: true },
  },
  {
    name: "رف علوي مفتوح",
    category: "UPPER_CABINET",
    defaultWidth: 800,
    defaultHeight: 400,
    defaultDepth: 300,
    options: { shelves: 1, open: true },
  },
  {
    name: "وحدة شفاط",
    category: "UPPER_CABINET",
    defaultWidth: 600,
    defaultHeight: 600,
    defaultDepth: 400,
    options: { hoodHousing: true },
  },

  // ---------- CORNER (أركان) ----------
  {
    name: "ركنة سفلية L",
    category: "CORNER",
    defaultWidth: 900,
    defaultHeight: 720,
    defaultDepth: 900,
    options: { shape: "L", doors: 2 },
  },
  {
    name: "ركنة سفلية أعمى",
    category: "CORNER",
    defaultWidth: 1000,
    defaultHeight: 720,
    defaultDepth: 600,
    options: { shape: "blind" },
  },
  {
    name: "ركنة سفلية ماجيك",
    category: "CORNER",
    defaultWidth: 900,
    defaultHeight: 720,
    defaultDepth: 900,
    options: { shape: "magic", pullout: true },
  },
  {
    name: "ركنة علوية L",
    category: "CORNER",
    defaultWidth: 600,
    defaultHeight: 720,
    defaultDepth: 600,
    options: { shape: "L", upper: true },
  },

  // ---------- TALL_CABINET (دواليب) ----------
  {
    name: "دولاب أعمدة (Pantry)",
    category: "TALL_CABINET",
    defaultWidth: 600,
    defaultHeight: 2200,
    defaultDepth: 580,
    options: { doors: 2, shelves: 5 },
  },
  {
    name: "حاضنة فرن مدمج",
    category: "TALL_CABINET",
    defaultWidth: 600,
    defaultHeight: 2200,
    defaultDepth: 580,
    options: { ovenSlot: true, doors: 2 },
  },
  {
    name: "حاضنة فرن + ميكروويف",
    category: "TALL_CABINET",
    defaultWidth: 600,
    defaultHeight: 2200,
    defaultDepth: 580,
    options: { ovenSlot: true, microwaveSlot: true, doors: 1 },
  },
  {
    name: "دولاب ثلاجة جانبية",
    category: "TALL_CABINET",
    defaultWidth: 700,
    defaultHeight: 2200,
    defaultDepth: 650,
    options: { fridgeHousing: true },
  },
  {
    name: "دولاب سحب علوي",
    category: "TALL_CABINET",
    defaultWidth: 400,
    defaultHeight: 2200,
    defaultDepth: 580,
    options: { pullout: true },
  },

  // ---------- APPLIANCE (أجهزة كهربائية) ----------
  {
    name: "فرن مدمج",
    category: "APPLIANCE",
    defaultWidth: 600,
    defaultHeight: 600,
    defaultDepth: 550,
    options: { appliance: "oven" },
  },
  {
    name: "ميكروويف مدمج",
    category: "APPLIANCE",
    defaultWidth: 600,
    defaultHeight: 380,
    defaultDepth: 340,
    options: { appliance: "microwave" },
  },
  {
    name: "شفاط",
    category: "APPLIANCE",
    defaultWidth: 600,
    defaultHeight: 900,
    defaultDepth: 500,
    options: { appliance: "hood" },
  },
  {
    name: "ثلاجة عادية",
    category: "APPLIANCE",
    defaultWidth: 600,
    defaultHeight: 1850,
    defaultDepth: 650,
    options: { appliance: "fridge" },
  },
  {
    name: "ثلاجة Side-by-Side",
    category: "APPLIANCE",
    defaultWidth: 900,
    defaultHeight: 1850,
    defaultDepth: 700,
    options: { appliance: "fridge-sbs" },
  },
  {
    name: "غسالة صحون",
    category: "APPLIANCE",
    defaultWidth: 600,
    defaultHeight: 850,
    defaultDepth: 570,
    options: { appliance: "dishwasher" },
  },
  {
    name: "موقد كهربائي (Cooktop)",
    category: "APPLIANCE",
    defaultWidth: 600,
    defaultHeight: 50,
    defaultDepth: 500,
    options: { appliance: "cooktop" },
  },
  {
    name: "موقد غاز (Hob)",
    category: "APPLIANCE",
    defaultWidth: 600,
    defaultHeight: 100,
    defaultDepth: 500,
    options: { appliance: "hob" },
  },

  // ---------- ACCESSORY (إكسسوارات) ----------
  {
    name: "سحب توابل",
    category: "ACCESSORY",
    defaultWidth: 200,
    defaultHeight: 720,
    defaultDepth: 500,
    options: { accessory: "spice-pull" },
  },
  {
    name: "سحب زجاجات",
    category: "ACCESSORY",
    defaultWidth: 300,
    defaultHeight: 720,
    defaultDepth: 500,
    options: { accessory: "wine-pull" },
  },
  {
    name: "ستاند رفوف داخلي",
    category: "ACCESSORY",
    defaultWidth: 400,
    defaultHeight: 720,
    defaultDepth: 500,
    options: { accessory: "wire-basket" },
  },
  {
    name: "نفايات داخلية",
    category: "ACCESSORY",
    defaultWidth: 400,
    defaultHeight: 720,
    defaultDepth: 500,
    options: { accessory: "trash-bin" },
  },
];

// ---------------------------------------------------------------------
// MATERIALS (seeded into the demo workspace — Material.workspaceId is required)
// ---------------------------------------------------------------------

export const MATERIALS: SeedMaterial[] = [
  { name: "HPL أبيض لامع", type: "HPL", color: "#FFFFFF", thicknessMm: 18, pricePerM2: 45 },
  { name: "HPL أسود لامع", type: "HPL", color: "#000000", thicknessMm: 18, pricePerM2: 50 },
  { name: "HPL خشب بلوط", type: "HPL", color: "#8B6F47", thicknessMm: 18, pricePerM2: 55 },
  { name: "UVLACK أبيض هاي قلوس", type: "UVLACK", color: "#FFFFFF", thicknessMm: 18, pricePerM2: 95 },
  { name: "UVLACK رمادي مات", type: "UVLACK", color: "#6B7280", thicknessMm: 18, pricePerM2: 105 },
  { name: "MELAMIN بلوط", type: "MELAMIN", color: "#A87C50", thicknessMm: 18, pricePerM2: 35 },
  { name: "MELAMIN جوز", type: "MELAMIN", color: "#5C4033", thicknessMm: 18, pricePerM2: 38 },
  { name: "MDF خام", type: "MDF", color: "#C8A57C", thicknessMm: 16, pricePerM2: 25 },
  { name: "POLYLACK هاي قلوس أبيض", type: "POLYLACK", color: "#FFFFFF", thicknessMm: 18, pricePerM2: 120 },
  { name: "PLYLACK كلاسيك", type: "PLYLACK", color: "#E5E5E5", thicknessMm: 18, pricePerM2: 80 },
  { name: "خشب زان طبيعي", type: "WOOD", color: "#D7B98E", thicknessMm: 20, pricePerM2: 180 },
  { name: "خشب بتولا (Birch)", type: "WOOD", color: "#E8D8B5", thicknessMm: 20, pricePerM2: 160 },
];

// ---------------------------------------------------------------------
// DEMO CUSTOMERS (Saudi market)
// ---------------------------------------------------------------------

export const CUSTOMERS: SeedCustomer[] = [
  { name: "محمد العتيبي", phone: "+966555123456", address: "حي الياسمين، الرياض" },
  { name: "نوف الشمري", phone: "+966503344556", address: "حي العليا، الرياض" },
  { name: "عبدالله الدوسري", phone: "+966509988776", address: "حي النرجس، الرياض" },
  { name: "ريم القحطاني", phone: "+966551122334", address: "حي الواحة، الرياض" },
  { name: "فهد المالكي", phone: "+966508877665", address: "حي الملقا، الرياض" },
];

// ---------------------------------------------------------------------
// DEMO WORKSPACE
// ---------------------------------------------------------------------

export const DEMO_WORKSPACE = {
  name: "ورشة تجريبية",
  slug: "demo-workshop",
  plan: "FREE" as const,
};
