/**
 * Inspect a .glb file: read its header + JSON chunk and print high-level
 * stats (meshes, materials, textures, accessors, generator string, file
 * size). No three.js needed — just parses the GLB container.
 *
 * Usage:  node scripts/inspect-glb.mjs <path-to-folder-or-files>
 */
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("usage: node inspect-glb.mjs <folder | file...>");
  process.exit(1);
}

const files = [];
for (const a of args) {
  const stat = fs.statSync(a);
  if (stat.isDirectory()) {
    for (const f of fs.readdirSync(a)) {
      if (f.toLowerCase().endsWith(".glb")) files.push(path.join(a, f));
    }
  } else {
    files.push(a);
  }
}

const fmtBytes = (n) => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
};

const sumTriangles = (json) => {
  if (!json.meshes) return 0;
  let tris = 0;
  for (const m of json.meshes) {
    for (const p of m.primitives || []) {
      const idx = p.indices;
      if (idx != null && json.accessors?.[idx]) {
        tris += Math.floor(json.accessors[idx].count / 3);
      } else if (p.attributes?.POSITION != null && json.accessors?.[p.attributes.POSITION]) {
        tris += Math.floor(json.accessors[p.attributes.POSITION].count / 3);
      }
    }
  }
  return tris;
};

for (const fp of files) {
  const buf = fs.readFileSync(fp);
  const magic = buf.toString("ascii", 0, 4);
  if (magic !== "glTF") {
    console.log(`\n❌ ${path.basename(fp)} — NOT a valid GLB (magic = ${magic})`);
    continue;
  }
  const version = buf.readUInt32LE(4);
  const totalLen = buf.readUInt32LE(8);
  const chunk0Len = buf.readUInt32LE(12);
  const chunk0Type = buf.toString("ascii", 16, 20);
  if (chunk0Type !== "JSON") {
    console.log(`\n❌ ${path.basename(fp)} — first chunk is not JSON (${chunk0Type})`);
    continue;
  }
  const jsonStr = buf.toString("utf8", 20, 20 + chunk0Len);
  let json;
  try {
    json = JSON.parse(jsonStr.replace(/\0+$/, ""));
  } catch (e) {
    console.log(`\n❌ ${path.basename(fp)} — JSON parse error: ${e.message}`);
    continue;
  }

  const tris = sumTriangles(json);
  const textures = (json.images || []).length;
  const materials = (json.materials || []).length;
  const meshes = (json.meshes || []).length;
  const nodes = (json.nodes || []).length;
  const animations = (json.animations || []).length;

  console.log(`\n📦 ${path.basename(fp)}`);
  console.log(`   size           ${fmtBytes(buf.length)}  (header reports ${fmtBytes(totalLen)})`);
  console.log(`   glTF version   ${version}`);
  console.log(`   nodes          ${nodes}`);
  console.log(`   meshes         ${meshes}`);
  console.log(`   triangles      ${tris.toLocaleString()}`);
  console.log(`   materials      ${materials}`);
  console.log(`   textures       ${textures}`);
  console.log(`   animations     ${animations}`);
  if (json.asset?.generator) console.log(`   generator      ${json.asset.generator}`);
  if (json.asset?.copyright) console.log(`   copyright      ${json.asset.copyright}`);
  if (json.scenes?.[0]?.name) console.log(`   scene name     ${json.scenes[0].name}`);

  // Light verdict per use case
  let verdict;
  if (tris > 500_000) verdict = "❌ ثقيل جداً للويب — Decimate قبل النشر";
  else if (tris > 150_000) verdict = "⚠️  ثقيل — يصلح لقالب hero لكن مش لكل قطعة";
  else if (tris > 50_000) verdict = "🟡 متوسط — مقبول لخزانة كاملة بأبواب وتفاصيل";
  else verdict = "✅ خفيف — مثالي للوضع التلقائي في الستديو";
  console.log(`   verdict        ${verdict}`);
}
