/**
 * Angle catalog audit for the auto-published blog.
 * -----------------------------------------------
 *   npm run angles:audit             report coverage, runway and near-misses
 *   npm run angles:audit -- --plan   also show what the next 10 days would publish
 *   npm run angles:backfill          write `angle` onto older posts that predate the field
 *
 * Exists because the angle catalog is finite and the generator publishes from it
 * unattended. Without a way to see what is left, the first symptom of an
 * exhausted catalog is a duplicate article on the live site.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  allAngles, usedAngles, remainingAngles, pickAngles, bestMatch,
} from "./topics.data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_JSON = path.join(__dirname, "..", "blog", "posts.json");
const POSTS_PER_DAY = Number(process.env.CPC_POSTS_PER_RUN || 2);

const args = new Set(process.argv.slice(2));
const BACKFILL = args.has("--backfill");
const PLAN = args.has("--plan");

const posts = JSON.parse(fs.readFileSync(POSTS_JSON, "utf8"));
const angles = allAngles();
const used = usedAngles(posts);
const left = remainingAngles(posts);
const days = Math.floor(left.length / POSTS_PER_DAY);

console.log(`\nAngle catalog — ${angles.length} angles across ${new Set(angles.map(a => a.cluster.key)).size} clusters`);
console.log(`Published posts: ${posts.length}`);
console.log(`Covered: ${used.size}   Unused: ${left.length}   Runway: ~${days} day(s) at ${POSTS_PER_DAY}/day\n`);

// ---------- per-cluster coverage ----------
const byCluster = new Map();
for (const { cluster, angle } of angles) {
  const row = byCluster.get(cluster.key) || { name: cluster.name, total: 0, open: 0 };
  row.total++;
  if (!used.has(angle)) row.open++;
  byCluster.set(cluster.key, row);
}
console.log("Coverage by cluster");
for (const [key, r] of byCluster) {
  const bar = "█".repeat(Math.round(((r.total - r.open) / r.total) * 20)).padEnd(20, "·");
  console.log(`  ${bar} ${String(r.total - r.open).padStart(2)}/${String(r.total).padEnd(2)} covered  ${r.name} (${key})`);
}

// ---------- near-misses: the numbers behind the duplicate threshold ----------
console.log("\nClosest unused angles to an existing post (watch for creeping duplicates)");
const near = left
  .map(({ angle }) => ({ angle, ...(bestMatch(angle, posts) || { score: 0, post: null }) }))
  .filter(r => r.post && r.score >= 0.3)
  .sort((a, b) => b.score - a.score)
  .slice(0, 8);
if (!near.length) console.log("  (none above 0.30 — catalog is well separated)");
for (const r of near) {
  console.log(`  ${r.score.toFixed(3)}  "${r.angle}"\n          vs  ${r.post.title}`);
}

// ---------- unused angles ----------
console.log(`\nUnused angles (${left.length})`);
for (const { cluster, angle } of left) console.log(`  [${cluster.key}] ${angle}`);

if (PLAN) {
  console.log("\nProjected schedule (next 10 publishing days)");
  let sim = [...posts];
  for (let d = 1; d <= 10; d++) {
    const picks = pickAngles(`sim-day-${d}`, POSTS_PER_DAY, sim);
    if (!picks.length) { console.log(`  day +${d}: — catalog exhausted —`); break; }
    console.log(`  day +${d}: ${picks.map(p => p.angle).join("  |  ")}`);
    sim = [...picks.map(p => ({ slug: `sim-${d}`, title: p.angle, angle: p.angle })), ...sim];
  }
}

// ---------- runway verdict ----------
if (!left.length) {
  console.error(`\n⚠ CATALOG EXHAUSTED — the next run will publish nothing. Add angles to scripts/topics.data.mjs.`);
  process.exitCode = 1;
} else if (left.length <= POSTS_PER_DAY * 14) {
  console.error(`\n⚠ LOW — about ${days} day(s) of angles left. Top up scripts/topics.data.mjs.`);
  process.exitCode = 1;
} else {
  console.log(`\n✓ Healthy — about ${days} day(s) of angles remaining.`);
}

// ---------- optional backfill ----------
if (BACKFILL) {
  // Only assign an angle to a post that is the single best match for it, so one
  // post never silently claims two angles.
  const claimed = new Map(); // slug -> {angle, score}
  for (const [angle, m] of used) {
    if (m.exact) continue;
    const prev = claimed.get(m.post.slug);
    if (!prev || m.score > prev.score) claimed.set(m.post.slug, { angle, score: m.score });
  }

  let written = 0;
  for (const p of posts) {
    if (p.angle) continue;
    const c = claimed.get(p.slug);
    if (!c) continue;
    p.angle = c.angle;
    written++;
    console.log(`  + ${p.slug}\n      angle: "${c.angle}"  (confidence ${c.score.toFixed(3)})`);
  }
  if (written) {
    fs.writeFileSync(POSTS_JSON, JSON.stringify(posts, null, 2) + "\n");
    console.log(`\nBackfilled ${written} post(s) into blog/posts.json.`);
    console.log("Review the pairings above — an incorrect one permanently retires that angle.");
  } else {
    console.log("\nNothing to backfill — every matched post already records its angle.");
  }
}
