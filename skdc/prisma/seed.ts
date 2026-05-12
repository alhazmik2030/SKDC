// =====================================================================
// SKDC - Prisma Seed Script
// Idempotent: re-running `npm run db:seed` will NOT duplicate data.
// Strategy: findFirst-then-create / upsert by unique fields.
// =====================================================================

import { PrismaClient, Prisma } from "@prisma/client";
import {
  TEMPLATES,
  MATERIALS,
  CUSTOMERS,
  DEMO_WORKSPACE,
} from "../lib/seed-data";

const db = new PrismaClient();

async function seedTemplates(): Promise<{ created: number; existing: number }> {
  let created = 0;
  let existing = 0;

  for (const t of TEMPLATES) {
    const found = await db.template.findFirst({
      where: {
        name: t.name,
        category: t.category,
        workspaceId: null,
      },
    });

    if (found) {
      existing++;
      continue;
    }

    await db.template.create({
      data: {
        workspaceId: null,
        name: t.name,
        category: t.category,
        defaultWidth: t.defaultWidth,
        defaultHeight: t.defaultHeight,
        defaultDepth: t.defaultDepth,
        options: t.options as Prisma.InputJsonValue,
      },
    });
    created++;
  }

  return { created, existing };
}

async function seedWorkspace(): Promise<{
  workspaceId: string;
  wasCreated: boolean;
}> {
  const existing = await db.workspace.findUnique({
    where: { slug: DEMO_WORKSPACE.slug },
  });

  if (existing) {
    return { workspaceId: existing.id, wasCreated: false };
  }

  const created = await db.workspace.create({
    data: {
      name: DEMO_WORKSPACE.name,
      slug: DEMO_WORKSPACE.slug,
      plan: DEMO_WORKSPACE.plan,
    },
  });

  return { workspaceId: created.id, wasCreated: true };
}

async function seedMaterials(
  workspaceId: string,
): Promise<{ created: number; existing: number }> {
  let created = 0;
  let existing = 0;

  for (const m of MATERIALS) {
    const found = await db.material.findFirst({
      where: { name: m.name, workspaceId },
    });

    if (found) {
      existing++;
      continue;
    }

    await db.material.create({
      data: {
        workspaceId,
        name: m.name,
        type: m.type,
        color: m.color,
        thicknessMm: m.thicknessMm,
        pricePerM2: m.pricePerM2,
      },
    });
    created++;
  }

  return { created, existing };
}

async function seedCustomers(
  workspaceId: string,
): Promise<{ created: number; existing: number }> {
  let created = 0;
  let existing = 0;

  for (const c of CUSTOMERS) {
    const found = await db.customer.findFirst({
      where: { phone: c.phone, workspaceId },
    });

    if (found) {
      existing++;
      continue;
    }

    await db.customer.create({
      data: {
        workspaceId,
        name: c.name,
        phone: c.phone,
        address: c.address,
      },
    });
    created++;
  }

  return { created, existing };
}

async function main() {
  console.log("─".repeat(60));
  console.log("  SKDC Database Seed");
  console.log("─".repeat(60));

  // 1) Global templates
  console.log("\n[1/4] Seeding global templates...");
  const tplResult = await seedTemplates();
  console.log(
    `      created: ${tplResult.created}  |  already-present: ${tplResult.existing}  |  total in source: ${TEMPLATES.length}`,
  );

  // 2) Demo workspace
  console.log("\n[2/4] Ensuring demo workspace...");
  const ws = await seedWorkspace();
  console.log(
    `      workspace "${DEMO_WORKSPACE.slug}" ${ws.wasCreated ? "created" : "already exists"} (id: ${ws.workspaceId})`,
  );

  // 3) Materials (require workspaceId)
  console.log("\n[3/4] Seeding materials into demo workspace...");
  const matResult = await seedMaterials(ws.workspaceId);
  console.log(
    `      created: ${matResult.created}  |  already-present: ${matResult.existing}  |  total in source: ${MATERIALS.length}`,
  );

  // 4) Customers
  console.log("\n[4/4] Seeding demo customers...");
  const custResult = await seedCustomers(ws.workspaceId);
  console.log(
    `      created: ${custResult.created}  |  already-present: ${custResult.existing}  |  total in source: ${CUSTOMERS.length}`,
  );

  // Final counts across the DB (sanity check)
  const [tplCount, wsCount, matCount, custCount] = await Promise.all([
    db.template.count({ where: { workspaceId: null } }),
    db.workspace.count(),
    db.material.count({ where: { workspaceId: ws.workspaceId } }),
    db.customer.count({ where: { workspaceId: ws.workspaceId } }),
  ]);

  console.log("\n" + "─".repeat(60));
  console.log("  Final DB counts");
  console.log("─".repeat(60));
  console.log(`  Global templates           : ${tplCount}`);
  console.log(`  Workspaces (all)           : ${wsCount}`);
  console.log(`  Materials (demo workspace) : ${matCount}`);
  console.log(`  Customers (demo workspace) : ${custCount}`);
  console.log("─".repeat(60));
  console.log("  Seed complete.\n");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
