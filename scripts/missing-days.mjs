/**
 * Prints Phoenix dates in the recent past that are short on posts, oldest
 * first, one per line. Used to fill gaps left when the scheduler misses days.
 *
 *   node scripts/missing-days.mjs [lookbackDays]   (default 14)
 *
 * A date is "short" when it holds fewer than CPC_POSTS_PER_RUN posts, which
 * is the same measure the generator's own per-day quota guard uses — so a day
 * this prints is exactly a day the generator will agree to write for.
 */
import fs from "fs";

const lookback = Number(process.argv[2] || 14);
const perDay = Number(process.env.CPC_POSTS_PER_RUN || 2);

let posts = [];
try { posts = JSON.parse(fs.readFileSync("blog/posts.json", "utf8")); } catch {}

const counts = {};
for (const p of posts) counts[p.iso] = (counts[p.iso] || 0) + 1;

const isoIn = d => new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Phoenix", year: "numeric", month: "2-digit", day: "2-digit",
}).format(d);

const out = [];
for (let i = lookback; i >= 0; i--) {
  const iso = isoIn(new Date(Date.now() - i * 86400000));
  if ((counts[iso] || 0) < perDay) out.push(iso);
}
console.log(out.join("\n"));
