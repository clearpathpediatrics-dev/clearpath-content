/**
 * Blog watchdog: emails Dean when either auto-blog stops publishing.
 * -------------------------------------------------------------
 * Both blogs have gone dark without anyone noticing. CPC lost three days in
 * August to a code error and two more in October when its topic list ran out;
 * each time every scheduled run failed and the failure emails GitHub sends
 * went unread. A workflow step cannot email on failure without a secret stored
 * in GitHub, so this checks from the outside instead, with nothing to set up:
 *
 *   - the newest post date in each site's public blog/posts.json
 *   - the conclusion of each repository's recent workflow runs (public API)
 *
 * If a blog has no post dated today (Phoenix time), or its last run failed, it
 * sends one email naming the failing step and what that usually means. At most
 * one email per blog per day.
 *
 * 00:30 UTC is 5:30pm in Phoenix: after every scheduled slot on both sites
 * (CPC's last is 23:00 UTC, Pediatrics' 21:00), still the same Phoenix day.
 */
import { getStore } from "@netlify/blobs";
import { ALERT_TO, sendEmail, layout, toText, esc } from "../lib/shared.mjs";

export const config = { schedule: "30 0 * * *" };

const BLOGS = [
  {
    name: "ClearPath Content",
    posts: "https://clearpath-content.com/blog/posts.json",
    repo: "clearpathpediatrics-dev/clearpath-content",
    workflow: "daily-posts.yml",
  },
  {
    name: "ClearPath Pediatrics",
    posts: "https://clearpathpediatrics.com/blog/posts.json",
    repo: "clearpathpediatrics-dev/clearpath-site",
    workflow: "daily-blog.yml",
  },
];

// What a failing step usually means, in plain terms.
const STEP_HINT = {
  "Check angle runway": "The topic list is nearly or completely used up. Add angles to scripts/topics.data.mjs; the blog publishes nothing rather than repeat a topic.",
  // CPC's generator exits non-zero on purpose when the topic list is empty,
  // so on that site this is most often a used-up topic list.
  "Generate articles": "Most often the topic list has run out: the generator fails on purpose rather than repeat a topic, so add angles to scripts/topics.data.mjs. Otherwise it is an API key problem, an API outage or a code error, and the run log says which.",
  "Generate today's post": "Article generation itself failed: an API key problem, an API outage, or a code error on the live path. The run log says which.",
  "Smoke-test the publish path": "The free test run failed, so the paid run never started. A template or code change broke publishing; nothing was spent.",
  "Test angle selection": "The topic-selection tests failed, usually after a change to the topic list.",
  "Install dependencies": "npm install failed, usually a temporary registry problem. The next scheduled run often fixes itself.",
  "Commit and push": "Posts were written but could not be pushed back to GitHub.",
  "Commit & push": "Posts were written but could not be pushed back to GitHub.",
};

const phoenixToday = () => new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Phoenix", year: "numeric", month: "2-digit", day: "2-digit",
}).format(new Date());

async function json(url) {
  const r = await fetch(url, { headers: { "User-Agent": "clearpath-blog-watchdog", Accept: "application/json" } });
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  return r.json();
}

// Exported so the checks can be run locally against the live sites.
export async function inspect(blog, today) {
  const out = { blog, problems: [], newest: null, run: null, failedStep: null };
  try {
    const posts = await json(blog.posts);
    out.newest = posts[0]?.iso || null;
    if (out.newest !== today) out.problems.push(`No post dated today (${today}). The newest is ${out.newest || "unknown"}.`);
  } catch (e) {
    out.problems.push(`Could not read the published post list (${e.message}).`);
  }
  // GitHub's unauthenticated API is rate-limited per IP. If it refuses, the
  // post-date check above still stands on its own.
  try {
    const runs = await json(`https://api.github.com/repos/${blog.repo}/actions/workflows/${blog.workflow}/runs?per_page=5`);
    const done = (runs.workflow_runs || []).filter((r) => r.status === "completed");
    out.run = done[0] || null;
    if (out.run && out.run.conclusion === "failure") {
      const streak = done.findIndex((r) => r.conclusion !== "failure");
      out.problems.push(`The last ${streak === -1 ? done.length + "+" : streak} scheduled run(s) failed.`);
      const jobs = await json(out.run.jobs_url);
      for (const j of jobs.jobs || []) {
        const s = (j.steps || []).find((x) => x.conclusion === "failure");
        if (s) { out.failedStep = s.name; break; }
      }
    }
  } catch (e) {
    console.log(`[watchdog] ${blog.name}: GitHub check skipped (${e.message})`);
  }
  return out;
}

export default async () => {
  const today = phoenixToday();
  const store = getStore({ name: "cpc-ops", consistency: "strong" });
  const results = await Promise.all(BLOGS.map((b) => inspect(b, today)));

  for (const r of results) {
    if (!r.problems.length) { console.log(`[watchdog] ${r.blog.name}: healthy (newest ${r.newest})`); continue; }
    const key = `alerted:${r.blog.repo}:${today}`;
    if (await store.get(key)) continue;

    const hint = r.failedStep && STEP_HINT[r.failedStep];
    const body = `
<h1>${esc(r.blog.name)}: the blog did not publish today</h1>
<ul>${r.problems.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
${r.failedStep ? `<p><strong>Failing step:</strong> ${esc(r.failedStep)}</p>` : ""}
${hint ? `<p>${esc(hint)}</p>` : ""}
${r.run ? `<p><a href="${esc(r.run.html_url)}">Open the latest run on GitHub</a></p>` : ""}
<p style="font-size:14px;color:#5B6B80">Sent once a day while the problem lasts. It stops on its own once a post goes out.</p>`;
    await sendEmail({
      to: ALERT_TO,
      subject: `${r.blog.name} blog stopped publishing (${today})`,
      html: layout({ body }), text: toText(body), tag: "ops-alert",
    });
    await store.set(key, "1");
    console.log(`[watchdog] ${r.blog.name}: alerted (${r.problems.join(" ")})`);
  }
  return new Response("ok");
};
