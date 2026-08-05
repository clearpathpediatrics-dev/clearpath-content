#!/usr/bin/env node
/**
 * ClearPath Content — outbound prospect audit, scoring and draft generation.
 * -------------------------------------------------------------
 * Reads a CSV of businesses, audits each public site, scores it against the
 * ICP model, and writes a personalised draft for the ones worth contacting.
 * It does NOT send. Every draft is reviewed by a human before anything leaves.
 *
 * That is a deliberate design choice, not a limitation: at $199-499/mo, twenty
 * emails that quote a real finding from the recipient's own site beat two
 * thousand generic ones, and they do not put the sending domain at risk.
 *
 * CSV columns (header row required; only `website` is mandatory):
 *   business,website,email,contact,industry,city,state
 *
 * `industry` should match a label from the capture form's dropdown so the
 * scoring priors apply. Run with --list-industries to see them.
 *
 * Usage:
 *   node scripts/prospect-outreach.mjs prospects.csv
 *   node scripts/prospect-outreach.mjs prospects.csv --min 65 --out outreach
 *   node scripts/prospect-outreach.mjs --list-industries
 *
 * Output (default ./outreach/):
 *   drafts.md    review queue — one block per prospect, ranked by score
 *   scored.csv   every row with its score, band and findings
 *   scored.json  full audit data
 */
import fs from "node:fs";
import path from "node:path";
import { auditSite, headlineFindings } from "./site-audit.mjs";
import { scoreLead, playbook, industryPhrase, INDUSTRY_PRIORS, BANDS } from "./icp.mjs";

const CAL = "https://calendly.com/clearpathpediatrics/30min";
const CONCURRENCY = 4;   // polite: a handful of requests per site, four sites at a time
const args = process.argv.slice(2);

if (args.includes("--list-industries")) {
  console.log("Industry labels understood by the scoring model:\n");
  for (const [k, v] of Object.entries(INDUSTRY_PRIORS)) console.log(`  ${k.padEnd(24)} ${v.note}`);
  process.exit(0);
}

const csvPath = args.find(a => !a.startsWith("--"));
if (!csvPath) {
  console.error("usage: node scripts/prospect-outreach.mjs <prospects.csv> [--min 55] [--out outreach]");
  process.exit(1);
}
const flag = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : dflt;
};
const MIN = Number(flag("min", BANDS.WARM));
const OUT = path.resolve(flag("out", "outreach"));

/* ------------------------------------------------------------------- CSV */
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [head, ...body] = rows.filter(r => r.some(c => c.trim()));
  if (!head) return [];
  const keys = head.map(h => h.trim().toLowerCase());
  return body.map(r => Object.fromEntries(keys.map((k, i) => [k, (r[i] || "").trim()])));
}

/* ---------------------------------------------------------------- drafts */
function draft(p, audit, scored, findings) {
  const first = (p.contact || "").split(/\s+/)[0];
  const greeting = first ? `Hi ${first},` : `Hi,`;
  const biz = p.business || audit?.title?.split(/[|—-]/)[0]?.trim() || "your business";
  const where = p.city ? `${p.city}${p.state ? ", " + p.state : ""}` : "your market";
  const lead = findings[0];
  const second = findings[1];

  // Subject lines are plain and literal. Anything clever reads as a blast.
  const subject = lead && /no blog|roughly \d+ post/i.test(lead)
    ? `${biz} — nothing published`
    : audit?.paidLeadSignals?.length
      ? `${biz} — paying for shared leads`
      : `Something I noticed on ${biz}'s site`;

  const bodyLines = [
    greeting,
    "",
    `I look at ${where} ${industryPhrase(p.industry || "service")} websites for a living, and I spent a few minutes on ${audit?.origin || p.website}.`,
    "",
  ];
  if (lead) bodyLines.push(lead, "");
  if (second) bodyLines.push(second, "");
  bodyLines.push(
    `The reason it matters: when someone in ${where} searches the thing you actually get paid for, the results are usually held by directories and lead marketplaces. They cannot do the work — they capture the enquiry and sell it on, frequently to two or three of your competitors at once.`,
    "",
    `I run a program that fixes exactly that. Published answers to the questions your buyers are already typing, on your own domain, on a fixed schedule. Everything stays yours permanently. One business per niche, per metro — ${industryPhrase(p.industry || "your category")} in ${where} is open at the moment.`,
    "",
    `Worth thirty minutes? ${CAL}`,
    "",
    `If not, no follow-up from me — just reply "no" and you are off the list.`,
    "",
    `— Dean`,
    `ClearPath Content · clearpath-content.com`,
  );

  return { subject, body: bodyLines.join("\n") };
}

/* ------------------------------------------------------------------- run */
const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));
if (!rows.length) { console.error("No rows found. Is there a header row?"); process.exit(1); }
console.log(`[outreach] ${rows.length} prospects · auditing ${CONCURRENCY} at a time…\n`);

const results = [];
let done = 0;
async function worker(queue) {
  while (queue.length) {
    const p = queue.shift();
    let audit = null;
    try { audit = await auditSite(p.website, { city: p.city }); }
    catch (e) { audit = { ok: false, error: String(e.message || e) }; }
    const scored = scoreLead({ industry: p.industry || "Other", city: p.city }, audit);
    const findings = headlineFindings(audit, { city: p.city });
    results.push({ p, audit, scored, findings });
    done++;
    process.stdout.write(`\r  audited ${done}/${rows.length}`);
  }
}
// One shared queue — each worker shifts off the same array, so no site is
// audited twice.
const queue = rows.slice();
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)));
process.stdout.write("\n\n");

results.sort((a, b) => b.scored.score - a.scored.score);
const contactable = results.filter(r => r.scored.score >= MIN && r.p.email);
const noEmail = results.filter(r => r.scored.score >= MIN && !r.p.email);

fs.mkdirSync(OUT, { recursive: true });

// ---- drafts.md -----------------------------------------------------------
const md = [
  `# Outreach queue`,
  ``,
  `Generated from \`${path.basename(csvPath)}\` · ${results.length} audited · threshold ${MIN}/100`,
  ``,
  `**Nothing here has been sent.** Read each draft, check the finding is actually true on their site,`,
  `edit anything that reads as boilerplate, then send it yourself from your normal mail client.`,
  `If a finding is wrong, delete the draft — a false claim in a cold email costs more than the lead is worth.`,
  ``,
  `| # | Business | Score | Band | Action |`,
  `|---|---|---|---|---|`,
  ...contactable.map((r, i) => `| ${i + 1} | ${r.p.business || r.p.website} | ${r.scored.score} | ${r.scored.band} | ${playbook(r.scored.band).priority} |`),
  ``,
  `---`,
  ``,
];

for (const [i, r] of contactable.entries()) {
  const d = draft(r.p, r.audit, r.scored, r.findings);
  md.push(
    `## ${i + 1}. ${r.p.business || r.p.website} — ${r.scored.score}/100 ${r.scored.band}`,
    ``,
    `**To:** ${r.p.email}${r.p.contact ? ` (${r.p.contact})` : ""}  `,
    `**Site:** ${r.audit?.origin || r.p.website}  `,
    `**Category:** ${r.p.industry || "unclassified"} · ${r.p.city || "?"}${r.p.state ? ", " + r.p.state : ""}`,
    ``,
    `**Audit:** ${r.audit?.ok
      ? `${r.audit.hasBlog ? `blog ~${r.audit.blogPostCount} posts` : "no blog"}${r.audit.staleMonths != null ? `, last post ~${r.audit.staleMonths}mo ago` : ""} · ~${r.audit.pageCount} pages · schema ${r.audit.hasSchema ? "yes" : "no"}${r.audit.paidLeadSignals.length ? ` · buys leads via ${r.audit.paidLeadSignals.join(", ")}` : ""}`
      : `unavailable (${r.audit?.error})`}`,
    ``,
    r.scored.flags.length ? `**Flags:** ${r.scored.flags.join(" · ")}\n` : ``,
    `**Subject:** ${d.subject}`,
    ``,
    "```",
    d.body,
    "```",
    ``,
    `---`,
    ``,
  );
}

if (noEmail.length) {
  md.push(`## Good fit, no email address (${noEmail.length})`, ``,
    `Worth finding a contact for — these scored above the threshold:`, ``,
    ...noEmail.map(r => `- **${r.p.business || r.p.website}** — ${r.scored.score}/100 · ${r.audit?.origin || r.p.website}`), ``);
}

const below = results.filter(r => r.scored.score < MIN);
if (below.length) {
  md.push(`## Below threshold (${below.length}) — do not contact`, ``,
    ...below.map(r => `- ${r.p.business || r.p.website} — ${r.scored.score}/100 · ${r.scored.flags[0] || r.scored.industryNote}`), ``);
}

fs.writeFileSync(path.join(OUT, "drafts.md"), md.join("\n"));

// ---- scored.csv / .json ---------------------------------------------------
const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
fs.writeFileSync(path.join(OUT, "scored.csv"),
  ["business,website,email,industry,city,state,score,band,action,blog,posts,pages,schema,paid_leads,finding_1"]
    .concat(results.map(r => [
      r.p.business, r.p.website, r.p.email, r.p.industry, r.p.city, r.p.state,
      r.scored.score, r.scored.band, playbook(r.scored.band).priority,
      r.audit?.ok ? (r.audit.hasBlog ? "yes" : "no") : "?",
      r.audit?.blogPostCount ?? "", r.audit?.pageCount ?? "",
      r.audit?.ok ? (r.audit.hasSchema ? "yes" : "no") : "?",
      (r.audit?.paidLeadSignals || []).join(" "), r.findings[0] || "",
    ].map(q).join(","))).join("\n"));

fs.writeFileSync(path.join(OUT, "scored.json"), JSON.stringify(results, null, 2));

const band = (b) => results.filter(r => r.scored.band === b).length;
console.log(`  HOT  ${band("HOT")}   WARM ${band("WARM")}   COOL ${band("COOL")}   LOW ${band("LOW")}`);
console.log(`\n  ${contactable.length} drafts ready for review · ${noEmail.length} good fits missing an email`);
console.log(`\n  → ${path.join(OUT, "drafts.md")}`);
console.log(`  → ${path.join(OUT, "scored.csv")}\n`);
console.log(`  Nothing has been sent. Review the drafts, verify each finding, then send them yourself.\n`);
