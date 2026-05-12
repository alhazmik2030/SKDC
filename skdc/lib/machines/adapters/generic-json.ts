import type { MachineAdapter, CutPlan, EncodedOutput } from "../types";

/**
 * Generic JSON — يخرج CutPlan كما هو + توقيت + checksum.
 * يستخدم لأنظمة ERP/MES التي تستقبل عبر REST/Webhook.
 */
export const genericJsonAdapter: MachineAdapter = {
  id: "generic-json",
  name: "تصدير JSON",
  manufacturer: "OTHER",
  category: "MULTI_FUNCTION",
  capabilities: ["STRAIGHT_CUT", "BORE", "GROOVE", "EDGE_BAND"],
  outputFormat: "JSON",
  channel: "REST_API",

  encode(plan: CutPlan): EncodedOutput {
    const payload = {
      schema: "skdc.cutplan/v1",
      generatedAt: new Date().toISOString(),
      plan,
    };

    const contents = JSON.stringify(payload, null, 2);
    const filename = `cutplan-${plan.projectName.replace(/\s+/g, "-")}.json`;

    return {
      filename,
      mimeType: "application/json",
      contents,
    };
  },
};

export default genericJsonAdapter;
