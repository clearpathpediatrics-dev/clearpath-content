#!/usr/bin/env node
/**
 * Backfill the inbound capture surface across already-generated pages.
 *
 * Two problems this fixes:
 *
 *   1. Twenty-odd early blog posts end on an .endcard that asks for a booked
 *      call and nothing else. A call is a far bigger ask than an email address,
 *      so those pages convert a fraction of what the newer ones do. They get
 *      the snapshot form added above the endcard.
 *
 *   2. No page loads the capture nudge, so a reader who never scrolls to the
 *      form never sees it at all.
 *
 * Idempotent — run it as often as you like. Newly generated pages already
 * include both, so this only ever touches the backlog.
 *
 *   node scripts/backfill-capture.mjs --dry-run
 *   node scripts/backfill-capture.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { captureBlock } from "./blog-theme.mjs";

const DRY = process.argv.includes("--dry-run");
const ROOT = process.cwd();
const NUDGE = `<script src="/assets/capture-nudge.js" defer></script>`;

// The thank-you page must not re-ask, and the bot-disclosure page is a
// courtesy to site owners we audit — pitching on it would be crass.
const SKIP = new Set(["snapshot-requested/index.html", "about-our-audit/index.html"]);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".") || e.name === "node_modules" || e.name === "data") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

const files = walk(ROOT);
let addedForm = 0, addedNudge = 0, untouched = 0;
const changed = [];

for (const file of files) {
  const rel = path.relative(ROOT, file);
  if (SKIP.has(rel)) continue;

  let html = fs.readFileSync(file, "utf8");
  const before = html;

  // ---- 1. capture form, for pages that have none ------------------------
  if (!html.includes('class="capture"')) {
    const block = captureBlock({
      id: "cap-backfill",
      heading: "See what your market is already searching",
      sub: "Tell us your industry and city. We will send back a short snapshot of the questions buyers in your market are typing, and who is currently answering them today.",
    });

    // Above the endcard reads best: the article finishes, the low-friction ask
    // comes next, and the higher-friction booking ask stays last.
    if (html.includes('<div class="endcard">')) {
      html = html.replace('<div class="endcard">', `${block}\n    <div class="endcard">`);
    } else if (html.includes('<a class="backlink"')) {
      html = html.replace('<a class="backlink"', `${block}\n    <a class="backlink"`);
    } else if (html.includes("</main>")) {
      html = html.replace("</main>", `  <div class="narrow">${block}</div>\n</main>`);
    }
    if (html !== before) addedForm++;
  }

  // ---- 2. the nudge, everywhere that now has a form ---------------------
  if (html.includes('class="capture"') && !html.includes("capture-nudge.js")) {
    if (html.includes("</body>")) {
      html = html.replace("</body>", `${NUDGE}\n</body>`);
      addedNudge++;
    }
  }

  if (html !== before) {
    changed.push(rel);
    if (!DRY) fs.writeFileSync(file, html);
  } else untouched++;
}

console.log(`\n[backfill] ${files.length} pages scanned`);
console.log(`  ${addedForm} given a capture form`);
console.log(`  ${addedNudge} given the capture nudge`);
console.log(`  ${untouched} already complete\n`);

if (changed.length) {
  console.log("Changed:");
  for (const c of changed.slice(0, 12)) console.log(`  ${c}`);
  if (changed.length > 12) console.log(`  … and ${changed.length - 12} more`);
}
console.log(DRY ? "\nDry run — nothing written.\n" : "\nWritten.\n");
