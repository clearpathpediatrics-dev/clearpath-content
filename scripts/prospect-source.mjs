#!/usr/bin/env node
/**
 * ClearPath Content — automated prospect sourcing.
 * -------------------------------------------------------------
 * The top of the outbound funnel, end to end and unattended:
 *
 *   1. Sweeps Google Places for real businesses in a category and metro
 *   2. Audits each one's public site with the same auditor the inbound uses
 *   3. Scores them on the same ICP model, so inbound and outbound rank together
 *   4. Finds a published contact address where the business lists one
 *   5. Merges into data/prospects.json, preserving pipeline state
 *   6. Optionally pushes to the live store the dialer reads
 *
 * Runs on your machine rather than in a function: the audit is network-heavy
 * and a full sweep takes well past any serverless timeout. Nothing is sent.
 *
 * Usage:
 *   node scripts/prospect-source.mjs --dry-run --all
 *   node scripts/prospect-source.mjs --metros mesa,tempe --industries HVAC
 *   node scripts/prospect-source.mjs --all --cells 40 --max 40
 *   node scripts/prospect-source.mjs --push
 *
 * Flags:
 *   --all              every priority industry x every metro
 *   --metros a,b       metro slugs or city names (default: under-served first)
 *   --industries a,b   ICP labels; --list to see them
 *   --max N            results per category/metro cell (default 40, ceiling 60)
 *   --cells N          stop after N cells — the cost control knob
 *   --min N            only keep prospects scoring N or above (default 45)
 *   --concurrency N    parallel site audits (default 6)
 *   --dry-run          print the plan and estimated cost, call nothing
 *   --push             upload data/prospects.json to the live store
 *   --out FILE         default data/prospects.json
 *
 * Env: GOOGLE_PLACES_API_KEY, and for --push: CPC_ADMIN_TOKEN
 */
import fs from "node:fs";
import path from "node:path";
import { sweep, INDUSTRY_QUERIES, PRIORITY_INDUSTRIES } from "./places.mjs";
import { auditSite, headlineFindings, findContactEmail } from "./site-audit.mjs";
import { scoreLead, playbook } from "./icp.mjs";
import { CITIES } from "./hubs.data.mjs";
import { newProspect, mergeProspect, domainKey } from "../netlify/lib/prospects.mjs";

const SITE = process.env.CPC_SITE_URL || "https://clearpath-content.com";
const args = process.argv.slice(2);
const has = (f) => args.includes(`--${f}`);
const flag = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : dflt;
};
const list = (name) => (flag(name, "") || "").split(",").map(s => s.trim()).filter(Boolean);

if (has("list")) {
  console.log("\nIndustries (search phrases sent to Places):\n");
  for (const [k, v] of Object.entries(INDUSTRY_QUERIES)) console.log(`  ${k.padEnd(24)} ${v.join(" · ")}`);
  console.log(`\nMetros (${CITIES.length}):\n`);
  console.log("  " + CITIES.map(c => c.city).join(", ") + "\n");
  process.exit(0);
}

const OUT = path.resolve(flag("out", "data/prospects.json"));
const MAX = Math.min(60, Number(flag("max", 40)));
const MIN = Number(flag("min", 45));
const CONCURRENCY = Number(flag("concurrency", 6));

/* ------------------------------------------------------------------- state */

function loadExisting() {
  try { return JSON.parse(fs.readFileSync(OUT, "utf8")); }
  catch { return {}; }
}
const existing = loadExisting();
const knownDomains = new Set(Object.keys(existing));

/* -------------------------------------------------------------------- push */

if (has("push")) {
  const token = process.env.CPC_ADMIN_TOKEN;
  if (!token) { console.error("CPC_ADMIN_TOKEN is not set — cannot push."); process.exit(1); }
  const records = Object.values(existing);
  if (!records.length) { console.error(`Nothing in ${OUT} to push.`); process.exit(1); }

  console.log(`[push] ${records.length} prospects -> ${SITE}\n`);
  const BATCH = 200;
  let pushed = 0;
  for (let i = 0; i < records.length; i += BATCH) {
    const slice = records.slice(i, i + BATCH);
    const res = await fetch(`${SITE}/.netlify/functions/prospect-import`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-cpc-token": token },
      body: JSON.stringify({ prospects: slice }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) { console.error(`  batch ${i / BATCH + 1} failed: ${body.error || res.status}`); process.exit(1); }
    pushed += body.written || slice.length;
    process.stdout.write(`\r  pushed ${pushed}/${records.length}`);
  }
  console.log(`\n\n  Live. Open the dialer:\n  ${SITE}/.netlify/functions/dialer?token=…\n`);
  process.exit(0);
}

/* -------------------------------------------------------------- build plan */

// Under-served metros first: the same markets the ICP model already scores up,
// because local competitors there publish almost nothing.
const PREFERRED = [
  "Mesa", "Tempe", "Albuquerque", "Louisville", "Milwaukee", "St. Louis",
  "Indianapolis", "Columbus", "Oklahoma City", "Kansas City", "Detroit",
  "Jacksonville", "San Antonio", "Fort Worth", "Boise", "Sacramento",
  "Pittsburgh", "Richmond", "Baltimore",
];

function resolveMetros() {
  const want = list("metros");
  if (has("all")) {
    const rank = (c) => PREFERRED.indexOf(c.city);
    return [...CITIES].sort((a, b) => {
      const ra = rank(a), rb = rank(b);
      return (ra < 0 ? 99 : ra) - (rb < 0 ? 99 : rb);
    });
  }
  if (!want.length) return CITIES.filter(c => PREFERRED.includes(c.city));
  return CITIES.filter(c =>
    want.some(w => c.slug === w || c.slug.endsWith(w.toLowerCase()) ||
                   c.city.toLowerCase() === w.toLowerCase()));
}

function resolveIndustries() {
  const want = list("industries");
  if (!want.length) return PRIORITY_INDUSTRIES;
  return want.map(w => {
    const hit = Object.keys(INDUSTRY_QUERIES).find(k => k.toLowerCase() === w.toLowerCase() ||
                                                        k.toLowerCase().startsWith(w.toLowerCase()));
    if (!hit) { console.error(`Unknown industry "${w}" — run --list`); process.exit(1); }
    return hit;
  });
}

const metros = resolveMetros();
const industries = resolveIndustries();
if (!metros.length) { console.error("No metros matched. Run --list."); process.exit(1); }

const cells = [];
for (const ind of industries) {
  for (const m of metros) {
    for (const query of INDUSTRY_QUERIES[ind]) {
      cells.push({ industry: ind, query, city: m.city, state: m.abbr, where: `${m.city}, ${m.abbr}` });
    }
  }
}
const planned = cells.slice(0, Number(flag("cells", cells.length)));

const pagesPer = Math.ceil(MAX / 20);
const estRequests = planned.length * pagesPer;
const estCost = (estRequests * 0.032).toFixed(2);

console.log(`\n[source] ${industries.length} industries x ${metros.length} metros`);
console.log(`         ${planned.length} search cells · up to ${MAX} each`);
console.log(`         ~${estRequests} Places requests · ~$${estCost}`);
console.log(`         ${knownDomains.size} domains already known (skipped)\n`);

if (has("dry-run")) {
  console.log("Plan (first 25 cells):");
  for (const c of planned.slice(0, 25)) console.log(`  ${c.query.padEnd(28)} ${c.where}`);
  if (planned.length > 25) console.log(`  … and ${planned.length - 25} more`);
  console.log("\nNothing was called. Drop --dry-run to run it.\n");
  process.exit(0);
}

if (!process.env.GOOGLE_PLACES_API_KEY) {
  console.error("GOOGLE_PLACES_API_KEY is not set.\n");
  console.error("  1. console.cloud.google.com → enable 'Places API (New)'");
  console.error("  2. Create an API key, restrict it to that API");
  console.error("  3. export GOOGLE_PLACES_API_KEY=…\n");
  process.exit(1);
}

/* ------------------------------------------------------------------- sweep */

console.log("[1/2] Searching Places…");
const { results: found, requests, errors } = await sweep(planned, {
  max: MAX,
  knownDomains,
  onProgress: ({ done, total, cell, total_found }) =>
    process.stdout.write(`\r  ${done}/${total} cells · ${total_found} new businesses · ${cell.where}`.padEnd(90)),
});
console.log(`\n  ${found.length} new businesses · ${requests} requests · ~$${(requests * 0.032).toFixed(2)}`);
if (errors.length) console.log(`  ${errors.length} cell error(s): ${errors[0]}`);

if (!found.length) {
  console.log("\n  Nothing new. Widen --metros/--industries, or the market is already sourced.\n");
  process.exit(0);
}

/* ----------------------------------------------------- audit, score, email */

console.log(`\n[2/2] Auditing ${found.length} sites (${CONCURRENCY} at a time)…`);
const scored = [];
let done = 0;

async function worker(queue) {
  while (queue.length) {
    const biz = queue.shift();
    let audit = null, email = biz.email || "";
    try { audit = await auditSite(biz.website, { city: biz.city }); }
    catch (e) { audit = { ok: false, error: String(e.message || e) }; }

    // Only look for an address on sites that are actually worth contacting.
    const s = scoreLead({ industry: biz.industry, city: biz.city }, audit);
    if (!email && s.score >= MIN && audit?.ok) {
      try { email = (await findContactEmail(biz.website)).email || ""; } catch { /* optional */ }
    }

    scored.push({
      biz, audit, email,
      scored: s,
      findings: headlineFindings(audit, { city: biz.city }),
    });
    done++;
    process.stdout.write(`\r  audited ${done}/${found.length}`.padEnd(40));
  }
}
const queue = found.slice();
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)));
console.log("\n");

/* ------------------------------------------------------------------ merge */

const merged = { ...existing };
let added = 0, updated = 0, dropped = 0;

for (const r of scored) {
  if (r.scored.score < MIN) { dropped++; continue; }
  const key = domainKey(r.biz.domain || r.biz.website);
  if (!key) { dropped++; continue; }

  const fresh = {
    ...r.biz, email: r.email,
    score: r.scored.score, band: r.scored.band,
    reasons: r.scored.reasons, flags: r.scored.flags,
    findings: r.findings,
    audit: r.audit?.ok ? {
      hasBlog: r.audit.hasBlog, blogPostCount: r.audit.blogPostCount, staleMonths: r.audit.staleMonths,
      pageCount: r.audit.pageCount, hasSchema: r.audit.hasSchema,
      paidLeadSignals: r.audit.paidLeadSignals, hasAdsPixel: r.audit.hasAdsPixel,
      mentionsCity: r.audit.mentionsCity, ownerOperated: r.audit.ownerOperated, origin: r.audit.origin,
    } : { error: r.audit?.error || "audit failed" },
  };

  if (merged[key]) { merged[key] = mergeProspect(merged[key], fresh); updated++; }
  else { merged[key] = newProspect({ ...fresh, domain: key }); added++; }
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(merged, null, 2));

/* ---------------------------------------------------------------- summary */

const all = Object.values(merged);
const band = (b) => all.filter(p => p.band === b).length;
const withPhone = all.filter(p => p.phone).length;
const withEmail = all.filter(p => p.email).length;

console.log(`  ${added} added · ${updated} refreshed · ${dropped} below ${MIN}/100\n`);
console.log(`  Pipeline: ${all.length} prospects`);
console.log(`    HOT ${band("HOT")}   WARM ${band("WARM")}   COOL ${band("COOL")}   LOW ${band("LOW")}`);
console.log(`    ${withPhone} with a phone number · ${withEmail} with a published email\n`);

const top = all.filter(p => p.status === "new").sort((a, b) => b.score - a.score).slice(0, 5);
if (top.length) {
  console.log("  Best of the new batch:");
  for (const p of top) {
    console.log(`    ${String(p.score).padStart(3)} ${p.band.padEnd(5)} ${(p.business || p.domain).slice(0, 38).padEnd(40)} ${p.city}`);
    if (p.findings[0]) console.log(`        ${p.findings[0].slice(0, 96)}`);
  }
  console.log(`\n    ${playbook(top[0].band).priority}: ${top[0].business || top[0].domain}${top[0].phone ? " · " + top[0].phone : ""}`);
}

console.log(`\n  → ${OUT}`);
console.log(`\n  Nothing has been contacted. Push to the dialer when ready:\n    node scripts/prospect-source.mjs --push\n`);
