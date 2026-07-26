#!/usr/bin/env node
/**
 * ClearPath Content — auto-published blog generator.
 * -------------------------------------------------------------
 * Writes POSTS_PER_RUN articles per day using Claude, renders each as a
 * standalone brand-styled page, rebuilds the blog index and sitemap, and
 * leaves the changes on disk for CI to commit.
 *
 * Cadence is deliberately conservative. Google's scaled-content-abuse policy
 * targets mass publication aimed at manipulating rankings; the mitigation is
 * genuine depth, non-overlapping topics, and a human-plausible rate. Raise
 * POSTS_PER_RUN only as the domain matures.
 *
 * Env:  ANTHROPIC_API_KEY (required)      — GitHub secret
 *       CPC_POSTS_PER_RUN (optional)      — default 2
 *       CPC_BLOG_DRYRUN=1 (optional)      — render a sample, no API spend
 * Run:  node scripts/generate-posts.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pickAngles, CLUSTERS } from "./topics.data.mjs";
import { INDUSTRIES, CAPABILITIES } from "./pages.data.mjs";
import { SITE, BRAND, esc, slugify, CSS, NAV, FOOTER, head } from "./blog-theme.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BLOG_DIR = path.join(ROOT, "blog");
const POSTS_JSON = path.join(BLOG_DIR, "posts.json");
const SITEMAP = path.join(ROOT, "sitemap.xml");
const MODEL = process.env.CPC_BLOG_MODEL || "claude-opus-4-8";
const POSTS_PER_RUN = Number(process.env.CPC_POSTS_PER_RUN || 2);

// ---------- date helpers (America/Phoenix, matching the other property) ----------
function phoenixParts() {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Phoenix", weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const p = Object.fromEntries(fmt.formatToParts(new Date()).map(x => [x.type, x.value]));
  const iso = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Phoenix", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
  return { weekday: p.weekday, prettyDate: `${p.month} ${p.day}, ${p.year}`, iso };
}

function readPosts() {
  try { return JSON.parse(fs.readFileSync(POSTS_JSON, "utf8")); } catch { return []; }
}

function sanitize(html = "") {
  return html.replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/ on[a-z]+="[^"]*"/gi, "").replace(/javascript:/gi, "");
}

// ---------- prompt ----------
function systemPrompt(cluster, angle, recentTitles) {
  return `You write for ClearPath Content (CPC) — an organic visibility company that runs search-architecture and editorial programs for businesses. Website: clearpath-content.com. CPC sells a monthly subscription ($199-$499) that maps a market's question-space, produces long-form articles in the client's voice, publishes them on a set cadence, and interlinks them.

AUDIENCE: business owners and marketing leads — HVAC companies, law firms, dental practices, contractors, B2B software, professional services. Smart, busy, sceptical of marketing hype. They have been burned by agencies before.

VOICE: direct, specific, useful. Write like an experienced practitioner explaining something to a peer. Concrete numbers, real mechanics, plain language. No hype, no "in today's digital landscape", no filler transitions, no exclamation marks. Never use the words "leverage", "synergy", "game-changer", "unlock", or "delve".

TOPIC CLUSTER: "${cluster.name}"
TODAY'S ANGLE: "${angle}"

Pick a specific, searchable framing within that angle and write the definitive practical piece on it.

AVOID overlapping these recent titles: ${recentTitles.length ? recentTitles.slice(0, 15).map(t => `"${t}"`).join(", ") : "(none yet)"}.

HONESTY RULES (strict):
- Do NOT invent statistics, study results, survey figures, or cite named sources/companies for specific numbers. If you reference a general industry pattern, phrase it as a general observation, not an attributed statistic.
- Do NOT fabricate case studies, client results, or testimonials.
- Do NOT promise specific rankings, traffic numbers, or timelines. Organic results genuinely vary.
- Illustrative examples are fine when clearly hypothetical ("suppose a plumbing company in Tucson...").

REQUIREMENTS:
- 1,100-1,500 words in the body.
- Title: specific and searchable, matching how a business owner would phrase the query. No colons-with-clever-subtitle formula every time; vary the structure.
- Meta description: 150-160 characters, includes the primary keyword, ends with a concrete benefit.
- At least 4 H2 subheadings. Use H3 where a section needs sub-parts.
- Include 2 sections written as a direct question-and-answer, so AI answer engines can surface them (the question as an H2 phrased exactly as someone would ask it, followed by a direct, complete answer in the first sentence of the paragraph beneath).
- Include at least one concrete worked example, checklist, or step sequence.
- Mention ClearPath Content naturally at most once, near the end, and only if it genuinely fits. It is fine not to mention it at all.
- End with a practical takeaway, not a sales pitch.
- 4-6 SEO keyword tags.

OUTPUT: Return ONLY a single JSON object, no markdown fences, no commentary, with EXACTLY these keys:
{
  "title": string,
  "metaDescription": string,
  "slug": string,
  "excerpt": string,
  "readMinutes": number,
  "tags": string[],
  "html": string,
  "faq": [ { "q": string, "a": string } ]
}
"html" is the BODY only, using ONLY these tags: <p>, <h2>, <h3>, <ul>, <ol>, <li>, <strong>, <em>, <table>, <thead>, <tbody>, <tr>, <th>, <td>. No <h1>, no <script>, no inline styles, no images. Do not include the title or the tags.
"faq" holds 2-3 entries mirroring the Q&A sections in the body, for structured data.`;
}

const SAMPLE = {
  title: "How AI Answer Engines Decide Which Sources to Cite",
  metaDescription: "AI assistants cite a small number of sources per answer. Here is how that selection actually works, and what makes a page more likely to be one of them.",
  slug: "how-ai-answer-engines-choose-sources",
  excerpt: "ChatGPT, Perplexity and Google's AI Overviews all pick a handful of sources per answer. The selection is not random, and it is not the same as ranking first.",
  readMinutes: 6,
  tags: ["AI search optimization", "answer engine optimization", "AEO", "Perplexity", "AI Overviews"],
  html: `<p>When someone asks an AI assistant a question about your industry, it answers using a handful of sources. Not ten blue links — usually three to six pages, sometimes fewer. Being one of them is a different problem from ranking first, and the businesses that understand the difference are quietly collecting traffic that never shows up as a classic search impression.</p>
<h2>Retrieval is not ranking</h2>
<p>A traditional search engine orders pages. An answer engine does something else: it retrieves passages, evaluates whether they answer the question, and synthesises a response. That means a page ranking eighth can be cited while the page ranking first is skipped — because citation depends on whether a specific passage cleanly answers the specific question.</p>
<h3>What this changes in practice</h3>
<p>Optimising for retrieval means optimising at the passage level. Each section of your page should be able to stand alone and answer something completely, without requiring the three paragraphs above it for context.</p>
<h2>How do I make my content more likely to be cited by AI?</h2>
<p>Answer the question in the first sentence beneath the heading, then support it. Answer engines favour passages where the claim and its context sit together in a compact block. A section that opens with two paragraphs of throat-clearing before reaching the point is far less quotable than one that leads with the answer and elaborates afterwards.</p>
<ul>
<li>Phrase H2 headings as the question a person would actually type or say.</li>
<li>Put the complete answer in the first sentence after the heading.</li>
<li>Keep each answer self-contained — no "as mentioned above".</li>
<li>Include specifics: numbers, steps, named conditions. Vague prose does not get quoted.</li>
</ul>
<h2>Does schema markup matter for AI search?</h2>
<p>It helps, but less than clear writing does. Structured data makes your entities and relationships explicit, which reduces the work a model has to do to understand what your business is and what a page covers. FAQPage and Organization markup are worth implementing. They are not a substitute for content that answers the question directly.</p>
<h2>A short audit you can run today</h2>
<ol>
<li>List the ten questions your buyers ask before purchasing.</li>
<li>For each, ask an AI assistant that question and note which sources it cites.</li>
<li>Read the cited passages. Note their structure — heading phrasing, answer position, specificity.</li>
<li>Compare against your own page on that topic. Usually the gap is structural, not topical.</li>
</ol>
<p>The pattern is consistent: cited passages answer immediately, completely, and specifically. That is the whole trick, and it is unglamorous.</p>`,
  faq: [
    { q: "How do I make my content more likely to be cited by AI?", a: "Answer the question in the first sentence beneath the heading, then support it. Keep each section self-contained and specific, and phrase headings as the question a person would actually ask." },
    { q: "Does schema markup matter for AI search?", a: "It helps by making entities and relationships explicit, but it matters less than writing that answers the question directly. FAQPage and Organization markup are worth implementing, but are not a substitute for clear content." },
  ],
};

// ---------- renderers ----------
function renderPost(post) {
  const url = `${SITE}/blog/${post.slug}`;
  const articleLd = {
    "@context": "https://schema.org", "@type": "BlogPosting",
    headline: post.title, description: post.metaDescription,
    datePublished: post.iso, dateModified: post.iso,
    author: { "@type": "Organization", name: BRAND, url: SITE },
    publisher: { "@type": "Organization", name: BRAND, url: SITE },
    mainEntityOfPage: url, keywords: (post.tags || []).join(", "),
    articleSection: post.cluster,
  };
  const faqLd = post.faq?.length ? {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: post.faq.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  } : null;
  const crumbs = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Field notes", item: `${SITE}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  return head({
    title: `${post.title} | ${BRAND}`,
    description: post.metaDescription, url, keywords: post.tags,
    jsonld: [articleLd, crumbs, ...(faqLd ? [faqLd] : [])],
  }) + `<style>${CSS}
.article{padding:56px 0 10px}
.article .eyebrow{margin-bottom:16px}
.article h1{font-size:clamp(30px,4.6vw,46px);margin-bottom:14px}
.meta{color:var(--muted);font-size:13.5px;font-family:var(--mono)}
.tags{display:flex;flex-wrap:wrap;gap:8px;margin:20px 0 34px}
.tags span{font-size:12px;font-weight:600;color:var(--pine-2);background:var(--spring-soft);padding:6px 14px;border-radius:999px}
.body{font-size:16.5px}
.body h2{font-size:clamp(21px,3vw,27px);margin:38px 0 12px}
.body h3{font-size:19px;margin:26px 0 8px}
.body p{color:#33445A;margin-bottom:16px}
.body ul,.body ol{margin:0 0 18px 22px;color:#33445A}
.body li{margin-bottom:9px}
.body strong{color:var(--ink)}
.body table{width:100%;border-collapse:collapse;margin:20px 0;font-size:15px;background:#fff;border:1px solid var(--border);border-radius:14px;overflow:hidden}
.body th,.body td{padding:12px 14px;text-align:left;border-bottom:1px solid var(--border)}
.body thead th{background:var(--pine);color:#fff;font-family:var(--display);font-weight:600}
.crumbs{font-size:12.5px;color:var(--muted);padding-top:22px}
.crumbs a{color:var(--muted);text-decoration:none}
.crumbs a:hover{color:var(--pine-2)}
.endcard{background:linear-gradient(135deg,#0B2240,#1F5FA8);border-radius:var(--r-lg);padding:44px 40px;text-align:center;color:#fff;margin:52px 0 10px}
.endcard h3{color:#fff;font-size:25px;margin-bottom:10px}
.endcard p{color:#C4DDF2;max-width:48ch;margin:0 auto 24px;font-size:15.5px}
.backlink{display:inline-block;margin:26px 0 0;color:var(--pine-2);font-weight:600;text-decoration:none}
</style>
</head>
<body>
${NAV}
<div class="narrow"><nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> › <a href="/blog/">Field notes</a> › <span>${esc(post.cluster)}</span></nav></div>
<main class="article">
  <div class="narrow">
    <span class="eyebrow">${esc(post.cluster)}</span>
    <h1>${esc(post.title)}</h1>
    <p class="meta">${esc(post.prettyDate)}${post.readMinutes ? ` · ${post.readMinutes} min read` : ""}</p>
    <div class="tags">${(post.tags || []).map(t => `<span>${esc(t)}</span>`).join("")}</div>
    <div class="body">
${post.html}
    </div>
    <div class="endcard">
      <h3>This is what we do, every week, on autopilot.</h3>
      <p>ClearPath Content runs the whole organic program — demand mapping, production, publication and interlinking — as a monthly subscription.</p>
      <a class="btn" href="https://calendly.com/clearpathpediatrics/30min" target="_blank" rel="noopener">Book a 30-minute call</a>
    </div>
    <a class="backlink" href="/blog/">← All field notes</a>
  </div>
</main>
${FOOTER}
</body>
</html>`;
}

function renderIndex(posts) {
  const byCluster = {};
  for (const p of posts) (byCluster[p.cluster] ||= []).push(p);

  const cards = posts.map(p => `
      <a class="pcard" href="/blog/${p.slug}">
        <span class="ptag">${esc(p.cluster)}</span>
        <h2>${esc(p.title)}</h2>
        <p>${esc(p.excerpt || p.metaDescription || "")}</p>
        <span class="pmeta">${esc(p.prettyDate)}${p.readMinutes ? ` · ${p.readMinutes} min` : ""}</span>
      </a>`).join("\n");

  const blogLd = {
    "@context": "https://schema.org", "@type": "Blog",
    name: `${BRAND} — Field Notes`, url: `${SITE}/blog`,
    description: "Practical writing on organic visibility, AI answer-engine optimisation, and content strategy for businesses.",
    publisher: { "@type": "Organization", name: BRAND, url: SITE },
    blogPost: posts.slice(0, 30).map(p => ({
      "@type": "BlogPosting", headline: p.title, url: `${SITE}/blog/${p.slug}`, datePublished: p.iso,
    })),
  };

  return head({
    title: `Field Notes — Organic Visibility & AI Search | ${BRAND}`,
    description: "Practical writing on organic visibility, AI answer-engine optimisation, local search and content strategy — published continuously by ClearPath Content.",
    url: `${SITE}/blog`, og: "website",
    keywords: ["content marketing", "SEO", "AI search optimization", "AEO", "organic visibility"],
    jsonld: [blogLd],
  }) + `<style>${CSS}
.hero{padding:70px 0 40px;text-align:center}
.hero h1{font-size:clamp(34px,5.2vw,54px);margin:18px 0 14px}
.hero p{color:var(--muted);font-size:18px;max-width:60ch;margin:0 auto}
.counts{font-family:var(--mono);font-size:12.5px;color:var(--muted);margin-top:18px}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;padding:34px 0 20px}
.pcard{background:#fff;border:1px solid var(--border);border-radius:var(--r);padding:26px 26px;text-decoration:none;
  display:block;box-shadow:var(--shadow);transition:transform .2s,box-shadow .2s,border-color .2s}
.pcard:hover{transform:translateY(-4px);box-shadow:var(--shadow-lg);border-color:var(--spring)}
.ptag{font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--pine-2)}
.pcard h2{font-size:19px;margin:9px 0 9px;line-height:1.25}
.pcard p{color:var(--muted);font-size:14.5px;margin-bottom:14px}
.pmeta{font-family:var(--mono);font-size:11.5px;color:var(--muted)}
.empty{text-align:center;color:var(--muted);padding:40px 0}
@media(max-width:980px){.grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:660px){.grid{grid-template-columns:1fr}}
</style>
</head>
<body>
${NAV}
<header class="hero">
  <div class="narrow">
    <span class="eyebrow">Field notes</span>
    <h1>Organic visibility, written down.</h1>
    <p>Practical pieces on AI answer-engine optimisation, search architecture, local visibility and content operations. Published continuously — this blog is produced by the same engine we deploy for clients.</p>
    <p class="counts">${posts.length} article${posts.length === 1 ? "" : "s"} · ${Object.keys(byCluster).length} topic clusters</p>
  </div>
</header>
<main>
  <div class="wrap">
    ${posts.length ? `<div class="grid">${cards}\n    </div>` : `<p class="empty">First articles publishing shortly.</p>`}
  </div>
</main>
${FOOTER}
</body>
</html>`;
}

function renderSitemap(posts) {
  const today = phoenixParts().iso;
  // Must stay in sync with build-pages.mjs — this script runs daily via CI and
  // rewrites sitemap.xml, so omitting the evergreen pages here would silently
  // drop them from the sitemap on the next cron run.
  const urls = [
    { loc: `${SITE}/`, pri: "1.0", freq: "weekly", mod: today },
    { loc: `${SITE}/${CAPABILITIES.slug}`, pri: "0.9", freq: "monthly", mod: today },
    { loc: `${SITE}/faq`, pri: "0.8", freq: "monthly", mod: today },
    { loc: `${SITE}/blog`, pri: "0.9", freq: "daily", mod: today },
    ...INDUSTRIES.map(p => ({ loc: `${SITE}/${p.slug}`, pri: "0.8", freq: "monthly", mod: today })),
    ...posts.map(p => ({ loc: `${SITE}/blog/${p.slug}`, pri: "0.7", freq: "monthly", mod: p.iso })),
  ];
  const rows = urls.map(u =>
    `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.mod}</lastmod>\n    <changefreq>${u.freq}</changefreq>\n    <priority>${u.pri}</priority>\n  </url>`
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>\n`;
}

// ---------- main ----------
async function main() {
  const DRYRUN = process.env.CPC_BLOG_DRYRUN === "1";
  const { prettyDate, iso } = phoenixParts();
  const posts = readPosts();

  const todayCount = posts.filter(p => p.iso === iso).length;
  const need = Math.max(0, POSTS_PER_RUN - todayCount);
  // Note: we still rebuild the index and sitemap below even when nothing new is
  // generated, so a manual edit to posts.json (e.g. removing a post) is picked
  // up on the next run instead of leaving the index stale.
  const REBUILD_ONLY = process.env.CPC_REBUILD_ONLY === "1";
  if (!DRYRUN && (need === 0 || REBUILD_ONLY)) {
    console.log(`[cpc] ${iso} has ${todayCount}/${POSTS_PER_RUN} posts — rebuilding index + sitemap only.`);
    fs.writeFileSync(path.join(BLOG_DIR, "index.html"), renderIndex(posts));
    fs.writeFileSync(SITEMAP, renderSitemap(posts));
    return;
  }

  const recentTitles = posts.slice(0, 20).map(p => p.title);
  // In dry-run the body is a fixed sample, so pin it to the cluster it actually
  // belongs to rather than whatever the rotation happens to select.
  const picks = DRYRUN
    ? [{ cluster: CLUSTERS.find(c => c.key === "aeo-geo"), angle: "how AI answer engines choose which sources to cite" }]
    : pickAngles(iso, need, recentTitles);
  console.log(`[cpc] ${prettyDate} — generating ${picks.length} post(s) (${todayCount} already today) — model: ${DRYRUN ? "DRY-RUN" : MODEL}`);

  let client = null;
  if (!DRYRUN) {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("ERROR: ANTHROPIC_API_KEY is not set. (CPC_BLOG_DRYRUN=1 previews without one.)");
      process.exit(1);
    }
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    client = new Anthropic();
  }

  let updated = posts;
  const seen = new Set(posts.map(p => p.slug));

  for (const pick of picks) {
    let data;
    if (DRYRUN) {
      data = SAMPLE;
    } else {
      const resp = await client.messages.create({
        model: MODEL, max_tokens: 6000,
        system: systemPrompt(pick.cluster, pick.angle, [...recentTitles, ...updated.slice(0, 5).map(p => p.title)]),
        messages: [{ role: "user", content: `Write today's article on: "${pick.angle}". Return only the JSON object.` }],
      });
      const raw = resp.content.filter(b => b.type === "text").map(b => b.text).join("").trim();
      const jsonText = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      try { data = JSON.parse(jsonText); }
      catch {
        console.error(`[cpc] could not parse model JSON for "${pick.angle}" — skipping.\n${raw.slice(0, 800)}`);
        continue;
      }
    }

    let slug = slugify(data.slug || data.title || `post-${iso}`);
    if (!slug) slug = `post-${iso}`;
    if (seen.has(slug)) { let n = 2; while (seen.has(`${slug}-${n}`)) n++; slug = `${slug}-${n}`; }
    seen.add(slug);

    const post = {
      slug,
      title: String(data.title || "").trim(),
      metaDescription: String(data.metaDescription || "").trim().slice(0, 165),
      excerpt: String(data.excerpt || "").trim(),
      readMinutes: Number.isFinite(data.readMinutes) ? Math.round(data.readMinutes) : 6,
      tags: Array.isArray(data.tags) ? data.tags.slice(0, 6).map(String) : [],
      html: sanitize(String(data.html || "")),
      faq: Array.isArray(data.faq) ? data.faq.filter(f => f && f.q && f.a).slice(0, 3) : [],
      cluster: pick.cluster.name, clusterKey: pick.cluster.key,
      iso, prettyDate,
    };

    if (!post.title || post.html.length < 700) {
      console.error(`[cpc] generated post looks incomplete ("${post.title}") — skipping.`);
      continue;
    }

    const dir = path.join(BLOG_DIR, post.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), renderPost(post));

    const entry = {
      slug: post.slug, title: post.title, excerpt: post.excerpt || post.metaDescription,
      metaDescription: post.metaDescription, tags: post.tags,
      cluster: post.cluster, clusterKey: post.clusterKey,
      iso: post.iso, prettyDate: post.prettyDate, readMinutes: post.readMinutes,
    };
    updated = [entry, ...updated];
    console.log(`[cpc]   ✓ /blog/${post.slug}  ("${post.title}")`);
  }

  fs.mkdirSync(BLOG_DIR, { recursive: true });
  fs.writeFileSync(POSTS_JSON, JSON.stringify(updated, null, 2) + "\n");
  fs.writeFileSync(path.join(BLOG_DIR, "index.html"), renderIndex(updated));
  fs.writeFileSync(SITEMAP, renderSitemap(updated));
  console.log(`[cpc] ${updated.length} total posts · index + sitemap rebuilt`);
}

main().catch(e => { console.error(e); process.exit(1); });
