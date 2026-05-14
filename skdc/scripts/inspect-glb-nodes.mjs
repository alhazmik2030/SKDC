/**
 * Deep inspect a .glb file: list every node + bounding box so we can decide
 * whether to auto-split into per-cabinet templates.
 *
 * Usage:  node scripts/inspect-glb-nodes.mjs <file.glb>
 */
import fs from "node:fs";
import path from "node:path";

const fp = process.argv[2];
if (!fp) {
  console.error("usage: node inspect-glb-nodes.mjs <file.glb>");
  process.exit(1);
}

const buf = fs.readFileSync(fp);
if (buf.toString("ascii", 0, 4) !== "glTF") {
  console.error("not a glb file");
  process.exit(1);
}
const chunk0Len = buf.readUInt32LE(12);
const json = JSON.parse(buf.toString("utf8", 20, 20 + chunk0Len).replace(/\0+$/, ""));

const nodes = json.nodes || [];
const meshes = json.meshes || [];

// Classify by name pattern (best-effort guess)
const CATEGORIES = [
  { rx: /lower|base|under|sufli|sub_|cabinet_l|kab_low/i, cat: "LOWER_CABINET" },
  { rx: /upper|wall|top|3lawi|kab_up/i, cat: "UPPER_CABINET" },
  { rx: /tall|pantry|larder|column|fridge_col/i, cat: "TALL_CABINET" },
  { rx: /sink|wash|basin|7awd/i, cat: "SINK" },
  { rx: /faucet|tap|crane|hanafi/i, cat: "FAUCET" },
  { rx: /stove|cooktop|hob|burner|gaz/i, cat: "COOKTOP" },
  { rx: /oven|furn|frn/i, cat: "OVEN" },
  { rx: /hood|extractor|chimney|chafa6/i, cat: "HOOD" },
  { rx: /fridge|refr|tha7la/i, cat: "FRIDGE" },
  { rx: /microwave|micro/i, cat: "MICROWAVE" },
  { rx: /dishwash|dw_|washer/i, cat: "DISHWASHER" },
  { rx: /counter|top|granite|marble/i, cat: "COUNTERTOP" },
  { rx: /chair|stool|seat/i, cat: "CHAIR" },
  { rx: /table|island/i, cat: "ISLAND" },
  { rx: /wall_|floor|ceiling|window|door/i, cat: "STRUCTURE" },
];

function classify(name) {
  if (!name) return "?";
  for (const { rx, cat } of CATEGORIES) if (rx.test(name)) return cat;
  return "?";
}

let namedNodes = 0;
let unnamedNodes = 0;
const counts = {};
const samples = {};

console.log(`\n=== ${path.basename(fp)} ===`);
console.log(`Total nodes: ${nodes.length}, meshes: ${meshes.length}`);
console.log(`\nTop-level scene nodes (depth 1):`);

const sceneRoots = (json.scenes?.[0]?.nodes) || [];
const printNode = (idx, depth = 0) => {
  if (depth > 2) return;
  const n = nodes[idx];
  if (!n) return;
  const name = n.name || "(unnamed)";
  const hasMesh = n.mesh != null;
  const cat = classify(name);
  console.log(
    `  ${"  ".repeat(depth)}[${idx}] ${name}${hasMesh ? "  • mesh" : ""}  →  ${cat}`,
  );
  for (const c of n.children || []) printNode(c, depth + 1);
};
for (const r of sceneRoots) printNode(r);

// Full stats by category
console.log(`\nAll mesh-bearing nodes classified:`);
for (const n of nodes) {
  if (n.mesh == null) continue;
  if (n.name) namedNodes++;
  else unnamedNodes++;
  const cat = classify(n.name);
  counts[cat] = (counts[cat] || 0) + 1;
  if (!samples[cat]) samples[cat] = [];
  if (samples[cat].length < 3) samples[cat].push(n.name || "(unnamed)");
}

const ordered = Object.entries(counts).sort((a, b) => b[1] - a[1]);
for (const [cat, n] of ordered) {
  const ex = samples[cat].join(", ");
  console.log(`  ${cat.padEnd(15)} ${String(n).padStart(4)}  e.g. ${ex}`);
}

console.log(`\nNamed mesh nodes:    ${namedNodes}`);
console.log(`Unnamed mesh nodes:  ${unnamedNodes}`);
const unknownPct = ((counts["?"] || 0) / (namedNodes + unnamedNodes)) * 100;
console.log(`Unclassified:        ${(counts["?"] || 0)} (${unknownPct.toFixed(0)}%)`);

console.log(`\n--- Verdict ---`);
if (unknownPct < 30 && namedNodes > unnamedNodes) {
  console.log(`✅ Auto-split feasible — names are meaningful`);
} else if (namedNodes > unnamedNodes * 2) {
  console.log(`🟡 Partial auto-split — some manual labelling needed`);
} else {
  console.log(`❌ Auto-split infeasible — names are generic, need visual splitter UI`);
}
