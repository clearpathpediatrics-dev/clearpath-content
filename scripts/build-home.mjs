#!/usr/bin/env node
/**
 * ClearPath Content — refresh the generated regions of the hand-written homepage.
 * -------------------------------------------------------------
 * index.html is authored by hand, but its two snapshot forms must match every
 * other copy of the form field for field (Netlify registers the form from the
 * HTML at deploy time). So they live between markers and are rebuilt from the
 * same snapshotForm() the generators use:
 *
 *   <!-- gen:hero-snapshot --> ... <!-- /gen:hero-snapshot -->
 *   <!-- gen:home-snapshot --> ... <!-- /gen:home-snapshot -->
 *
 * The hero form exists because the free Visibility Report, the strongest offer
 * on the site for someone who does not know CPC yet, sat 81% of the way down
 * the page. Links are normalized on the way out like every other page.
 *
 *   node scripts/build-home.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { captureBlock, snapshotForm } from "./blog-theme.mjs";
import { ROOT, normalizeLinks } from "./site-links.mjs";

const FILE = path.join(ROOT, "index.html");
let html = fs.readFileSync(FILE, "utf8");

const REGIONS = {
  "hero-snapshot": `
<div class="hero-cap capture-hero" id="cap-hero" data-placement="home-hero">
  <p class="hero-cap-h"><strong>Start free:</strong> see what buyers in your market are searching, and who answers them today.</p>
  ${snapshotForm({ id: "cap-hero", button: "Get my free snapshot" })}
</div>
`,
  "home-snapshot": captureBlock({ id: "cap-home", placement: "home-lower" }),
};

for (const [name, content] of Object.entries(REGIONS)) {
  const re = new RegExp(`(<!-- gen:${name} -->)[\\s\\S]*?(<!-- /gen:${name} -->)`);
  if (!re.test(html)) throw new Error(`index.html is missing the ${name} markers`);
  html = html.replace(re, `$1\n${content}\n$2`);
}

fs.writeFileSync(FILE, normalizeLinks(html));
console.log("[home] ✓ hero + lower snapshot forms refreshed");
