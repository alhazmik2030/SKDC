// =====================================================================
// SKDC — Example Kitchens Seeder
// ---------------------------------------------------------------------
// Materializes the 3 demo kitchens defined in `@/lib/seed/example-kitchens`
// into a specific workspace. Idempotent on customer name within the
// workspace: if a customer with the same name already exists, the entire
// example for that customer is skipped.
//
// CLI:  tsx prisma/seed-examples.ts <workspaceId>
// =====================================================================

import { Prisma, type InvoiceStatus } from "@prisma/client";

import { db } from "@/lib/db";
import {
  EXAMPLE_KITCHENS,
  type ExampleCustomer,
  type ExampleInvoice,
  type ExampleUnit,
} from "@/lib/seed/example-kitchens";

export interface SeedExampleKitchensResult {
  customersAdded: number;
  projectsAdded: number;
  unitsAdded: number;
  invoicesAdded: number;
  skipped: string[];
}

/**
 * Resolve the best Template for a given unit hint.
 *
 * Lookup strategy:
 *   1. Workspace-scoped template whose name starts with the hint.
 *   2. Global template (workspaceId = null) whose name starts with the hint.
 *   3. Fallback: first template (workspace-preferred) in `categoryFallback`.
 *
 * Returns `null` if nothing matches — caller should skip the unit and warn.
 */
async function resolveTemplateId(
  workspaceId: string,
  unit: ExampleUnit,
): Promise<string | null> {
  const hint = unit.templateNameHint;

  // Prefer workspace-scoped over global by ordering workspaceId asc (nulls last in Postgres by default).
  const byName = await db.template.findFirst({
    where: {
      name: { startsWith: hint },
      OR: [{ workspaceId }, { workspaceId: null }],
    },
    orderBy: [{ workspaceId: "asc" }],
  });
  if (byName) return byName.id;

  if (unit.categoryFallback) {
    const byCategory = await db.template.findFirst({
      where: {
        category: unit.categoryFallback,
        OR: [{ workspaceId }, { workspaceId: null }],
      },
      orderBy: [{ workspaceId: "asc" }],
    });
    if (byCategory) return byCategory.id;
  }

  return null;
}

/**
 * Map an `ExampleInvoice.status` (`DRAFT` | `SENT` | `PAID`) onto the Prisma
 * `InvoiceStatus` enum. Defaults to `DRAFT` when omitted.
 */
function toInvoiceStatus(status: ExampleInvoice["status"]): InvoiceStatus {
  switch (status) {
    case "SENT":
      return "SENT";
    case "PAID":
      return "PAID";
    case "DRAFT":
    case undefined:
    default:
      return "DRAFT";
  }
}

/**
 * Seeds the 3 example kitchens into the specified workspace.
 *
 * Idempotency: a customer is identified by (workspaceId, name). If a customer
 * with the same name already exists in the workspace, that entire example is
 * skipped (its name is appended to the returned `skipped` array). No partial
 * inserts: each customer's customer + project + design + units + invoice are
 * created inside a single Prisma `$transaction` and roll back together on
 * failure.
 */
export async function seedExampleKitchens(
  workspaceId: string,
): Promise<SeedExampleKitchensResult> {
  const result: SeedExampleKitchensResult = {
    customersAdded: 0,
    projectsAdded: 0,
    unitsAdded: 0,
    invoicesAdded: 0,
    skipped: [],
  };

  for (const example of EXAMPLE_KITCHENS) {
    const existing = await db.customer.findFirst({
      where: { workspaceId, name: example.name },
      select: { id: true },
    });

    if (existing) {
      result.skipped.push(example.name);
      continue;
    }

    // Resolve template ids up-front so the transaction body stays fast and
    // we can emit warnings outside the transaction.
    const resolvedUnits: Array<{ unit: ExampleUnit; templateId: string }> = [];
    for (const unit of example.project.units) {
      const templateId = await resolveTemplateId(workspaceId, unit);
      if (!templateId) {
        console.warn(`[seed] warning: no template for "${unit.templateNameHint}"`);
        continue;
      }
      resolvedUnits.push({ unit, templateId });
    }

    const invoice = example.project.invoice;
    const issuedAt =
      invoice && (invoice.status === "SENT" || invoice.status === "PAID")
        ? new Date()
        : null;

    const projectNotes = buildProjectNotes(example);

    const created = await db.$transaction(async (tx) => {
      // Why: 17-unit kitchens with invoice writes can take >5s on Supabase
      // pooled connections — bump the default 5s budget.
      const customer = await tx.customer.create({
        data: {
          workspaceId,
          name: example.name,
          phone: example.phone ?? null,
          email: example.email ?? null,
          address: example.address ?? null,
          notes: example.notes ?? null,
        },
        select: { id: true },
      });

      const project = await tx.project.create({
        data: {
          workspaceId,
          customerId: customer.id,
          name: example.project.name,
          status: example.project.status ?? "DRAFT",
          designStyle: example.project.designStyle ?? null,
          roomWidth: example.project.roomWidth,
          roomDepth: example.project.roomDepth,
          roomHeight: example.project.roomHeight,
          notes: projectNotes,
          design: {
            create: {
              data: {} as Prisma.InputJsonValue,
            },
          },
        },
        select: { id: true, design: { select: { id: true } } },
      });

      const designId = project.design?.id;
      if (!designId) {
        // Should be unreachable — the inline `design: { create: {} }` above
        // guarantees a row. Throwing aborts the transaction cleanly.
        throw new Error(
          `Failed to materialize Design for project ${project.id} (${example.project.name}).`,
        );
      }

      let unitsAdded = 0;
      for (const { unit, templateId } of resolvedUnits) {
        await tx.unit.create({
          data: {
            designId,
            templateId,
            x: unit.x,
            y: unit.y,
            z: 0,
            width: unit.width,
            height: unit.height,
            depth: unit.depth,
            rotation: unit.rotation ?? 0,
          },
        });
        unitsAdded++;
      }

      let invoicesAdded = 0;
      if (invoice) {
        await tx.invoice.create({
          data: {
            projectId: project.id,
            number: invoice.number,
            status: toInvoiceStatus(invoice.status),
            subtotal: invoice.subtotal,
            discount: invoice.discount,
            tax: invoice.tax,
            total: invoice.total,
            currency: invoice.currency,
            lineItems: invoice.lineItems as unknown as Prisma.InputJsonValue,
            notes: invoice.notes ?? null,
            issuedAt,
          },
        });
        invoicesAdded = 1;
      }

      return { unitsAdded, invoicesAdded };
    }, { maxWait: 15_000, timeout: 60_000 });

    result.customersAdded++;
    result.projectsAdded++;
    result.unitsAdded += created.unitsAdded;
    result.invoicesAdded += created.invoicesAdded;
  }

  return result;
}

/**
 * Prisma's Project model has a single `notes` field. The data module exposes
 * both `notes` (rare) and `description` (common). We merge them so neither is
 * lost; if both are absent we store `null`.
 */
function buildProjectNotes(example: ExampleCustomer): string | null {
  const description = example.project.description?.trim();
  if (description) return description;
  return null;
}

if (require.main === module) {
  const workspaceId = process.argv[2];
  if (!workspaceId) {
    console.error("Usage: tsx prisma/seed-examples.ts <workspaceId>");
    process.exit(1);
  }
  seedExampleKitchens(workspaceId)
    .then((res) => {
      console.log("Seed result:", JSON.stringify(res, null, 2));
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seed failed:", err);
      process.exit(1);
    });
}
