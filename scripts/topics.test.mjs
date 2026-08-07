/**
 * Tests for angle selection.  Run with: npm test
 *
 * The bug these guard against: on 2026-08-06 the generator republished
 * "long-tail keyword strategy for businesses with no authority" as
 * /blog/long-tail-keyword-strategy-no-authority-2, because de-duplication
 * compared the angle's first four words against a blob of recent titles and
 * the existing post was titled "Long-Tail Keywords for New Sites With No
 * Authority". Nothing recorded which angles had ever been used.
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { allAngles, usedAngles, remainingAngles, pickAngles } from "./topics.data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const archive = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "blog", "posts.json"), "utf8")
);

test("the 2026-08-06 duplicate cannot recur", () => {
  const before = archive.filter(p => p.iso !== "2026-08-06");
  const angle = "long-tail keyword strategy for businesses with no authority";

  assert.ok(
    usedAngles(before).has(angle),
    "angle should be recognised as already covered by the existing long-tail post"
  );
  assert.ok(
    !pickAngles("2026-08-06", 2, before).some(p => p.angle === angle),
    "the duplicate angle must never be selected again"
  );
});

test("an angle recorded on a post is never re-picked", () => {
  const angle = allAngles()[0].angle;
  const posts = [{ slug: "x", title: "Unrelated Title", angle }];
  assert.ok(usedAngles(posts).has(angle));
  for (let d = 1; d <= 40; d++) {
    assert.ok(!pickAngles(`2026-09-${String(d).padStart(2, "0")}`, 2, posts)
      .some(p => p.angle === angle));
  }
});

test("selection is deterministic for a given date", () => {
  const a = pickAngles("2026-08-20", 2, archive).map(p => p.angle);
  const b = pickAngles("2026-08-20", 2, archive).map(p => p.angle);
  assert.deepEqual(a, b, "a re-run on the same day must produce the same set");
});

test("picks are distinct and always unused", () => {
  const used = usedAngles(archive);
  for (let d = 1; d <= 28; d++) {
    const picks = pickAngles(`2026-10-${String(d).padStart(2, "0")}`, 2, archive);
    assert.equal(new Set(picks.map(p => p.angle)).size, picks.length, "no repeats within a day");
    for (const p of picks) assert.ok(!used.has(p.angle), `picked a used angle: ${p.angle}`);
  }
});

test("an exhausted catalog yields nothing rather than a duplicate", () => {
  // Every angle recorded as published.
  const posts = allAngles().map(({ angle }, i) => ({ slug: `p${i}`, title: angle, angle }));
  assert.equal(remainingAngles(posts).length, 0);
  assert.deepEqual(pickAngles("2026-12-01", 2, posts), []);
});

test("running the catalog down never repeats an angle", () => {
  let posts = [];
  const seen = new Set();
  for (let day = 0; day < 200; day++) {
    const picks = pickAngles(`sim-${day}`, 2, posts);
    if (!picks.length) break;
    for (const p of picks) {
      assert.ok(!seen.has(p.angle), `angle published twice: ${p.angle}`);
      seen.add(p.angle);
      posts = [{ slug: `s${seen.size}`, title: p.angle, angle: p.angle }, ...posts];
    }
  }
  assert.equal(seen.size, allAngles().length, "every angle should be reachable exactly once");
});

test("backfilling an angle does not re-open a near-identical sibling", () => {
  // Two angles that both describe one published post. Recording one of them
  // must not make the other look unused — that would republish the topic.
  const post = { slug: "hvac", title: "HVAC Content Marketing That Wins Off-Season Leads" };
  const covered = [...usedAngles([post]).keys()];
  assert.ok(covered.length >= 1, "fixture should cover at least one angle");

  const backfilled = [{ ...post, angle: covered[0] }];
  for (const angle of covered) {
    assert.ok(
      usedAngles(backfilled).has(angle),
      `angle re-opened after backfill: ${angle}`
    );
  }
});
