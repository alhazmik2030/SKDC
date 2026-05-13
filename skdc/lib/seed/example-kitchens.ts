/**
 * SKDC — Example Kitchens (demo seed data)
 * ----------------------------------------
 * Pure data module. No Prisma client, no I/O, no side effects.
 *
 * How this is consumed:
 *   A separate seed script (e.g. `prisma/seed.ts`) imports `EXAMPLE_KITCHENS`
 *   and, for each entry, performs the following inside a workspace transaction:
 *     1. Upsert a Customer row from the top-level customer fields.
 *     2. Create a Project row using `project.{name, status, designStyle, room*}`.
 *     3. Create a Design (the active one) linked to that project.
 *     4. For each `ExampleUnit`:
 *          - Resolve a Template by `templateNameHint` (case-sensitive starts-with).
 *            If no template matches, fall back to the first global template whose
 *            `category === categoryFallback`.
 *          - Resolve an optional workspace Material by `materialTypeHint`.
 *          - Insert a DesignUnit row at (x, y) with the given dimensions/rotation.
 *     5. If `project.invoice` is present, create an Invoice + InvoiceLine rows.
 *
 * Coordinates are room-local millimetres with origin at the back-left corner
 * (x = right along the back wall, y = forward into the room). Units are
 * non-overlapping along grid-aligned wall runs of standard 600 mm modules.
 *
 * Invoice math invariant (validated by unit tests):
 *   net   = subtotal - discount
 *   tax   = round(net * 0.15)
 *   total = net + tax
 */

import type {
  DesignStyle,
  MaterialType,
  ProjectStatus,
  TemplateCategory,
} from "@prisma/client";

export interface ExampleUnit {
  /** Match a global Template by name (case-sensitive starts-with) — we'll look it up at seed time. */
  templateNameHint: string;
  /** Optional category fallback if name lookup fails. */
  categoryFallback?: TemplateCategory;
  x: number; // mm, room-local
  y: number; // mm
  width: number;
  depth: number;
  height: number;
  rotation?: number;
  /** Optional material type hint to bind a matching workspace material. */
  materialTypeHint?: MaterialType;
}

export interface ExampleInvoiceLine {
  description: string; // e.g. "وحدة سفلية درج واحد 600×720×580"
  qty: number;
  unitPrice: number; // SAR
}

export interface ExampleInvoice {
  number: string; // e.g. "INV-2026-0001"
  subtotal: number;
  discount: number; // SAR
  tax: number; //     15% VAT applied to (subtotal - discount)
  total: number;
  currency: "SAR" | "USD";
  lineItems: ExampleInvoiceLine[];
  notes?: string;
  status?: "DRAFT" | "SENT" | "PAID";
}

export interface ExampleProject {
  name: string; //          bilingual-friendly project name
  description?: string;
  status?: ProjectStatus;
  designStyle?: DesignStyle;
  roomWidth: number; //     mm
  roomDepth: number; //     mm
  roomHeight: number; //    mm
  units: ExampleUnit[];
  invoice?: ExampleInvoice;
}

export interface ExampleCustomer {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  project: ExampleProject;
}

/* -------------------------------------------------------------------------- */
/* Layout helpers (compile-time only — not exported)                          */
/* -------------------------------------------------------------------------- */

// Standard module dimensions (mm)
const LOWER_DEPTH = 600;
const LOWER_HEIGHT = 720;
const UPPER_DEPTH = 350;
const UPPER_HEIGHT = 720;
const UPPER_Z_FROM_FLOOR = 1450; // informational — z is not modeled at this level
const TALL_DEPTH = 600;
const TALL_HEIGHT = 2100;

/* -------------------------------------------------------------------------- */
/* Kitchen 1 — مطبخ فيلا العتيبي (Modern L-Shape)                              */
/*    Room: 4200 (x) × 3000 (y). Back wall along y=0, left wall along x=0.    */
/* -------------------------------------------------------------------------- */

const KITCHEN_1_UNITS: ExampleUnit[] = [
  // --- Back wall (y = 0), running left → right ---
  // Corner unit anchors the inside corner at (0,0)
  {
    templateNameHint: "ركن سفلي دوار",
    categoryFallback: "CORNER",
    x: 0,
    y: 0,
    width: 900,
    depth: LOWER_DEPTH,
    height: LOWER_HEIGHT,
    materialTypeHint: "MELAMIN",
  },
  {
    templateNameHint: "وحدة سفلية درجين",
    categoryFallback: "LOWER_CABINET",
    x: 900,
    y: 0,
    width: 600,
    depth: LOWER_DEPTH,
    height: LOWER_HEIGHT,
    materialTypeHint: "MELAMIN",
  },
  {
    templateNameHint: "وحدة سفلية ضلفتين",
    categoryFallback: "LOWER_CABINET",
    x: 1500,
    y: 0,
    width: 800,
    depth: LOWER_DEPTH,
    height: LOWER_HEIGHT,
    materialTypeHint: "MELAMIN",
  },
  // Built-in oven housing under the hob run
  {
    templateNameHint: "حاضنة فرن",
    categoryFallback: "APPLIANCE",
    x: 2300,
    y: 0,
    width: 600,
    depth: LOWER_DEPTH,
    height: LOWER_HEIGHT,
    materialTypeHint: "MELAMIN",
  },
  {
    templateNameHint: "وحدة سفلية ثلاثة أدراج",
    categoryFallback: "DRAWER",
    x: 2900,
    y: 0,
    width: 600,
    depth: LOWER_DEPTH,
    height: LOWER_HEIGHT,
    materialTypeHint: "MELAMIN",
  },
  // Fridge column at the right end of the back wall
  {
    templateNameHint: "دولاب ثلاجة جانبية",
    categoryFallback: "TALL_CABINET",
    x: 3500,
    y: 0,
    width: 700,
    depth: TALL_DEPTH,
    height: TALL_HEIGHT,
    materialTypeHint: "MELAMIN",
  },

  // --- Left wall (x = 0), running back → front, skipping the corner footprint ---
  {
    templateNameHint: "وحدة سفلية ضلفة واحدة",
    categoryFallback: "LOWER_CABINET",
    x: 0,
    y: 900,
    width: LOWER_DEPTH, // 600 along x because rotated against the left wall
    depth: 500,
    height: LOWER_HEIGHT,
    rotation: 90,
    materialTypeHint: "MELAMIN",
  },
  {
    templateNameHint: "وحدة سفلية درج واحد",
    categoryFallback: "DRAWER",
    x: 0,
    y: 1400,
    width: LOWER_DEPTH,
    depth: 600,
    height: LOWER_HEIGHT,
    rotation: 90,
    materialTypeHint: "MELAMIN",
  },

  // --- Upper cabinets along back wall (mounted at ~1450mm) ---
  {
    templateNameHint: "ركن علوي",
    categoryFallback: "CORNER",
    x: 0,
    y: 0,
    width: 600,
    depth: UPPER_DEPTH,
    height: UPPER_HEIGHT,
    materialTypeHint: "MELAMIN",
  },
  {
    templateNameHint: "وحدة علوية ضلفتين",
    categoryFallback: "UPPER_CABINET",
    x: 600,
    y: 0,
    width: 900,
    depth: UPPER_DEPTH,
    height: UPPER_HEIGHT,
    materialTypeHint: "MELAMIN",
  },
  // Hood mounted above the hob (over the oven housing)
  {
    templateNameHint: "شفاط",
    categoryFallback: "APPLIANCE",
    x: 2300,
    y: 0,
    width: 600,
    depth: UPPER_DEPTH,
    height: 400,
    materialTypeHint: "OTHER",
  },
  {
    templateNameHint: "وحدة علوية زجاج",
    categoryFallback: "UPPER_CABINET",
    x: 2900,
    y: 0,
    width: 600,
    depth: UPPER_DEPTH,
    height: UPPER_HEIGHT,
    materialTypeHint: "GLASS",
  },
];
void UPPER_Z_FROM_FLOOR; // documentation constant

const KITCHEN_1_INVOICE: ExampleInvoice = {
  number: "INV-2026-0001",
  currency: "SAR",
  status: "SENT",
  lineItems: [
    { description: "ركن سفلي دوار 900×720×600", qty: 1, unitPrice: 2800 },
    { description: "وحدة سفلية درجين 600×720×600", qty: 1, unitPrice: 1850 },
    { description: "وحدة سفلية ضلفتين 800×720×600", qty: 1, unitPrice: 2100 },
    { description: "حاضنة فرن مدمج 600×720×600", qty: 1, unitPrice: 1950 },
    { description: "وحدة سفلية ثلاثة أدراج 600×720×600", qty: 1, unitPrice: 2400 },
    { description: "دولاب ثلاجة جانبية 700×2100×600", qty: 1, unitPrice: 3200 },
    { description: "وحدة سفلية ضلفة واحدة 500×720×600", qty: 1, unitPrice: 1600 },
    { description: "وحدة سفلية درج واحد 600×720×600", qty: 1, unitPrice: 1700 },
    { description: "ركن علوي 600×720×350", qty: 1, unitPrice: 1450 },
    { description: "وحدة علوية ضلفتين 900×720×350", qty: 1, unitPrice: 1800 },
    { description: "شفاط استانلس 600 مم", qty: 1, unitPrice: 1450 },
    { description: "وحدة علوية زجاج 600×720×350", qty: 1, unitPrice: 1900 },
    { description: "رخام كوارتز للأسطح (تركيب + توريد)", qty: 1, unitPrice: 3800 },
  ],
  subtotal: 28000,
  discount: 1400, // 5%
  tax: 3990, //   15% of (28000 - 1400)
  total: 30590,
  notes: "التسليم خلال 8 أسابيع — تركيب مجاني داخل الرياض.",
};

/* -------------------------------------------------------------------------- */
/* Kitchen 2 — مطبخ شقة الزهراء (Compact Single Wall)                          */
/*    Room: 3000 (x) × 2400 (y). All units along back wall (y = 0).           */
/* -------------------------------------------------------------------------- */

const KITCHEN_2_UNITS: ExampleUnit[] = [
  // Lower run — total 3000 mm along back wall
  {
    templateNameHint: "وحدة سفلية درج واحد",
    categoryFallback: "DRAWER",
    x: 0,
    y: 0,
    width: 600,
    depth: LOWER_DEPTH,
    height: LOWER_HEIGHT,
    materialTypeHint: "POLYLACK",
  },
  {
    templateNameHint: "وحدة سفلية ضلفتين",
    categoryFallback: "LOWER_CABINET",
    x: 600,
    y: 0,
    width: 600,
    depth: LOWER_DEPTH,
    height: LOWER_HEIGHT,
    materialTypeHint: "POLYLACK",
  },
  // Under-counter dishwasher slot
  {
    templateNameHint: "وحدة سفلية ضلفة واحدة",
    categoryFallback: "APPLIANCE",
    x: 1200,
    y: 0,
    width: 600,
    depth: LOWER_DEPTH,
    height: LOWER_HEIGHT,
    materialTypeHint: "POLYLACK",
  },
  {
    templateNameHint: "وحدة سفلية درجين",
    categoryFallback: "DRAWER",
    x: 1800,
    y: 0,
    width: 600,
    depth: LOWER_DEPTH,
    height: LOWER_HEIGHT,
    materialTypeHint: "POLYLACK",
  },
  // Wall-oven tall column at the right end
  {
    templateNameHint: "حاضنة فرن مدمج",
    categoryFallback: "TALL_CABINET",
    x: 2400,
    y: 0,
    width: 600,
    depth: TALL_DEPTH,
    height: TALL_HEIGHT,
    materialTypeHint: "POLYLACK",
  },

  // Upper run — two doors above the lower cabinets (not over the oven column)
  {
    templateNameHint: "وحدة علوية ضلفتين",
    categoryFallback: "UPPER_CABINET",
    x: 0,
    y: 0,
    width: 1200,
    depth: UPPER_DEPTH,
    height: UPPER_HEIGHT,
    materialTypeHint: "POLYLACK",
  },
  {
    templateNameHint: "وحدة علوية زجاج",
    categoryFallback: "UPPER_CABINET",
    x: 1200,
    y: 0,
    width: 1200,
    depth: UPPER_DEPTH,
    height: UPPER_HEIGHT,
    materialTypeHint: "GLASS",
  },
];

const KITCHEN_2_INVOICE: ExampleInvoice = {
  number: "INV-2026-0002",
  currency: "SAR",
  status: "DRAFT",
  lineItems: [
    { description: "وحدة سفلية درج واحد 600×720×600", qty: 1, unitPrice: 1700 },
    { description: "وحدة سفلية ضلفتين 600×720×600", qty: 1, unitPrice: 1850 },
    { description: "وحدة سفلية ضلفة واحدة (تحضير جلاية) 600×720×600", qty: 1, unitPrice: 1550 },
    { description: "وحدة سفلية درجين 600×720×600", qty: 1, unitPrice: 1850 },
    { description: "حاضنة فرن مدمج 600×2100×600", qty: 1, unitPrice: 2950 },
    { description: "وحدة علوية ضلفتين 1200×720×350", qty: 1, unitPrice: 2100 },
    { description: "وحدة علوية زجاج 1200×720×350", qty: 1, unitPrice: 2500 },
    { description: "رخام جرانيت للأسطح (توريد + تركيب)", qty: 1, unitPrice: 2500 },
    { description: "رسوم تصميم وفني قياسات", qty: 1, unitPrice: 1500 },
  ],
  subtotal: 18500,
  discount: 0,
  tax: 2775, // 15% of 18500
  total: 21275,
  notes: "العميلة في انتظار اعتماد الواجهة النهائية — التسليم 5 أسابيع من تاريخ الدفعة الأولى.",
};

/* -------------------------------------------------------------------------- */
/* Kitchen 3 — مطبخ فيلا الراجحي (Premium U-Shape with Island)                 */
/*    Room: 6000 (x) × 4500 (y). U = back + left + right walls.               */
/*    Island: ~2400 × 1000 centered, facing the back wall.                    */
/* -------------------------------------------------------------------------- */

const KITCHEN_3_UNITS: ExampleUnit[] = [
  // --- BACK WALL (y = 0) ---
  // Tall pantry column on the far left
  {
    templateNameHint: "دولاب أعمدة (Pantry)",
    categoryFallback: "TALL_CABINET",
    x: 0,
    y: 0,
    width: 600,
    depth: TALL_DEPTH,
    height: TALL_HEIGHT,
    materialTypeHint: "UVLACK",
  },
  // Side-by-side fridge
  {
    templateNameHint: "Side-by-Side ثلاجة",
    categoryFallback: "TALL_CABINET",
    x: 600,
    y: 0,
    width: 1200,
    depth: TALL_DEPTH,
    height: TALL_HEIGHT,
    materialTypeHint: "UVLACK",
  },
  // Built-in oven + microwave housing
  {
    templateNameHint: "حاضنة فرن + ميكروويف",
    categoryFallback: "TALL_CABINET",
    x: 1800,
    y: 0,
    width: 600,
    depth: TALL_DEPTH,
    height: TALL_HEIGHT,
    materialTypeHint: "UVLACK",
  },
  // Lower run with hob in the middle (back wall, after appliance towers)
  {
    templateNameHint: "وحدة سفلية ثلاثة أدراج",
    categoryFallback: "DRAWER",
    x: 2400,
    y: 0,
    width: 900,
    depth: LOWER_DEPTH,
    height: LOWER_HEIGHT,
    materialTypeHint: "UVLACK",
  },
  // Hob sits inside this 900 unit; we model an additional drawer cabinet beneath visually
  {
    templateNameHint: "وحدة سفلية أربعة أدراج",
    categoryFallback: "DRAWER",
    x: 3300,
    y: 0,
    width: 900,
    depth: LOWER_DEPTH,
    height: LOWER_HEIGHT,
    materialTypeHint: "UVLACK",
  },
  // Second tall pantry column on the far right
  {
    templateNameHint: "دولاب أعمدة (Pantry)",
    categoryFallback: "TALL_CABINET",
    x: 4200,
    y: 0,
    width: 600,
    depth: TALL_DEPTH,
    height: TALL_HEIGHT,
    materialTypeHint: "UVLACK",
  },
  // Right-end corner unit (back wall corner with right wall)
  {
    templateNameHint: "ركن سفلي دوار",
    categoryFallback: "CORNER",
    x: 4800,
    y: 0,
    width: 1200,
    depth: LOWER_DEPTH,
    height: LOWER_HEIGHT,
    materialTypeHint: "UVLACK",
  },

  // --- RIGHT WALL (x = 5400 inside the room, depth 600) ---
  // Dishwasher slot
  {
    templateNameHint: "وحدة سفلية ضلفة واحدة",
    categoryFallback: "APPLIANCE",
    x: 5400,
    y: 1200,
    width: LOWER_DEPTH,
    depth: 600,
    height: LOWER_HEIGHT,
    rotation: 90,
    materialTypeHint: "UVLACK",
  },
  {
    templateNameHint: "وحدة سفلية درجين",
    categoryFallback: "LOWER_CABINET",
    x: 5400,
    y: 1800,
    width: LOWER_DEPTH,
    depth: 600,
    height: LOWER_HEIGHT,
    rotation: 90,
    materialTypeHint: "UVLACK",
  },

  // --- ISLAND (centered) — 3 lower cabinets in a row, facing back wall ---
  // Island origin at x = 1800, y = 2200 (centered in 6000-wide room, 1000 deep block)
  {
    templateNameHint: "وحدة سفلية درجين",
    categoryFallback: "DRAWER",
    x: 1800,
    y: 2200,
    width: 800,
    depth: 1000,
    height: LOWER_HEIGHT,
    materialTypeHint: "UVLACK",
  },
  {
    templateNameHint: "وحدة سفلية ضلفتين",
    categoryFallback: "LOWER_CABINET",
    x: 2600,
    y: 2200,
    width: 800,
    depth: 1000,
    height: LOWER_HEIGHT,
    materialTypeHint: "UVLACK",
  },
  {
    templateNameHint: "وحدة سفلية ثلاثة أدراج",
    categoryFallback: "DRAWER",
    x: 3400,
    y: 2200,
    width: 800,
    depth: 1000,
    height: LOWER_HEIGHT,
    materialTypeHint: "UVLACK",
  },

  // --- UPPER CABINETS over back wall (skip over fridge/oven towers) ---
  {
    templateNameHint: "وحدة علوية ضلفتين",
    categoryFallback: "UPPER_CABINET",
    x: 2400,
    y: 0,
    width: 900,
    depth: UPPER_DEPTH,
    height: UPPER_HEIGHT,
    materialTypeHint: "UVLACK",
  },
  {
    templateNameHint: "شفاط",
    categoryFallback: "APPLIANCE",
    x: 3300,
    y: 0,
    width: 900,
    depth: UPPER_DEPTH,
    height: 500,
    materialTypeHint: "OTHER",
  },
  {
    templateNameHint: "وحدة علوية ضلفتين",
    categoryFallback: "UPPER_CABINET",
    x: 4200,
    y: 0,
    width: 600,
    depth: UPPER_DEPTH,
    height: UPPER_HEIGHT,
    materialTypeHint: "UVLACK",
  },
  {
    templateNameHint: "وحدة علوية زجاج",
    categoryFallback: "UPPER_CABINET",
    x: 4800,
    y: 0,
    width: 600,
    depth: UPPER_DEPTH,
    height: UPPER_HEIGHT,
    materialTypeHint: "GLASS",
  },
  // Upper pull-down over the right-wall run
  {
    templateNameHint: "دولاب سحب علوي",
    categoryFallback: "UPPER_CABINET",
    x: 5400,
    y: 1200,
    width: UPPER_DEPTH,
    depth: 1200,
    height: UPPER_HEIGHT,
    rotation: 90,
    materialTypeHint: "UVLACK",
  },
];

const KITCHEN_3_INVOICE: ExampleInvoice = {
  number: "INV-2026-0003",
  currency: "SAR",
  status: "PAID",
  lineItems: [
    { description: "دولاب أعمدة Pantry 600×2100×600", qty: 2, unitPrice: 4200 },
    { description: "ثلاجة Side-by-Side housing 1200×2100×600", qty: 1, unitPrice: 5400 },
    { description: "حاضنة فرن + ميكروويف 600×2100×600", qty: 1, unitPrice: 4100 },
    { description: "وحدة سفلية ثلاثة أدراج 900×720×600", qty: 2, unitPrice: 3000 },
    { description: "وحدة سفلية أربعة أدراج 900×720×600", qty: 1, unitPrice: 3400 },
    { description: "ركن سفلي دوار 1200×720×600", qty: 1, unitPrice: 3600 },
    { description: "وحدة سفلية ضلفة واحدة (تحضير جلاية) 600×720×600", qty: 1, unitPrice: 1700 },
    { description: "وحدة سفلية درجين 600×720×600", qty: 1, unitPrice: 1850 },
    { description: "جزيرة وسطى ثلاث وحدات 2400×720×1000", qty: 1, unitPrice: 7500 },
    { description: "وحدة علوية ضلفتين (مزدوجة) 900×720×350", qty: 2, unitPrice: 2000 },
    { description: "شفاط جزيرة فاخر 900 مم", qty: 1, unitPrice: 3000 },
    { description: "وحدة علوية زجاج بإضاءة LED 600×720×350", qty: 1, unitPrice: 2300 },
    { description: "دولاب سحب علوي 1200×720×350", qty: 1, unitPrice: 2800 },
    { description: "رخام كوارتز فاخر للأسطح والجزيرة", qty: 1, unitPrice: 7950 },
  ],
  subtotal: 62000,
  discount: 4960, // 8%
  tax: 8556, //    15% of (62000 - 4960) = 15% of 57040
  total: 65596,
  notes: "تم استلام كامل المبلغ — التسليم والتركيب خلال 10 أسابيع، يشمل ضمان 5 سنوات على الكوابح.",
};

/* -------------------------------------------------------------------------- */
/* Exported demo dataset                                                      */
/* -------------------------------------------------------------------------- */

export const EXAMPLE_KITCHENS: ExampleCustomer[] = [
  {
    name: "محمد العتيبي",
    phone: "+966500111222",
    email: "m.alotaibi@example.com",
    address: "الرياض - حي النخيل",
    notes: "عميل VIP — يفضل الموديل العصري بألوان فاتحة.",
    project: {
      name: "مطبخ فيلا العتيبي — Modern L-Shape",
      description:
        "مطبخ على شكل حرف L بطول 4.2 م × 3.0 م، خامة ميلامين بلون كاشمير، رخام كوارتز للأسطح، فرن مدمج وثلاجة جانبية.",
      status: "DRAFT",
      designStyle: "MODERN",
      roomWidth: 4200,
      roomDepth: 3000,
      roomHeight: 2700,
      units: KITCHEN_1_UNITS,
      invoice: KITCHEN_1_INVOICE,
    },
  },
  {
    name: "فاطمة الزهراء",
    phone: "+966555333444",
    email: "zahra.kitchen@example.com",
    address: "جدة - شاطئ النورس",
    notes: "شقة صغيرة — تركيز على الاستفادة من المساحة العمودية.",
    project: {
      name: "مطبخ شقة الزهراء — Compact Single Wall",
      description:
        "مطبخ بجدار واحد بطول 3.0 م، طراز نيوكلاسيك بولي لاك أبيض مطفي، فرن حائطي مدمج وجلاية مخفية.",
      status: "IN_REVIEW",
      designStyle: "NEO_CLASSIC",
      roomWidth: 3000,
      roomDepth: 2400,
      roomHeight: 2600,
      units: KITCHEN_2_UNITS,
      invoice: KITCHEN_2_INVOICE,
    },
  },
  {
    name: "عبدالله الراجحي",
    phone: "+966509999000",
    email: "rajhi.villa@example.com",
    address: "الخبر - الكورنيش",
    notes: "فيلا فاخرة — اعتماد المالك مباشرة على المخطط والـ 3D.",
    project: {
      name: "مطبخ فيلا الراجحي — Premium U-Shape with Island",
      description:
        "مطبخ صناعي فاخر على شكل U مع جزيرة وسطى 6.0 م × 4.5 م، خامة UV-Lack رمادي داكن، أجهزة مدمجة كاملة، شفاط جزيرة، رخام كوارتز.",
      status: "APPROVED",
      designStyle: "INDUSTRIAL",
      roomWidth: 6000,
      roomDepth: 4500,
      roomHeight: 2900,
      units: KITCHEN_3_UNITS,
      invoice: KITCHEN_3_INVOICE,
    },
  },
];
