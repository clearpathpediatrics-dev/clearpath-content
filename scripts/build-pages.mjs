#!/usr/bin/env node
/**
 * ClearPath Content — evergreen page builder.
 * -------------------------------------------------------------
 * Renders the commercial-intent pages defined in pages.data.mjs:
 *   /<industry-slug>/   — one per industry (long-tail, high buying intent)
 *   /what-you-get/      — capabilities framed as outcomes
 *   /faq/               — FAQ hub (strong for AI answer engines)
 * Then rebuilds sitemap.xml to include them alongside the blog.
 *
 * Run: node scripts/build-pages.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { INDUSTRIES, FAQ_HUB, CAPABILITIES, CAL } from "./pages.data.mjs";
import { SITE, BRAND, esc, CSS, NAV, FOOTER, head } from "./blog-theme.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const PAGE_CSS = `${CSS}
.hero{padding:64px 0 34px}
.hero h1{font-size:clamp(32px,5vw,52px);margin:18px 0 16px}
.hero p{color:var(--muted);font-size:18px;max-width:62ch;margin-bottom:14px}
.cta-row{margin-top:26px;display:flex;gap:12px;flex-wrap:wrap}
.btn.ghost{background:#fff;color:var(--pine);border:1.5px solid var(--border);box-shadow:none}
.btn.ghost:hover{border-color:var(--spring)}
section.blk{padding:44px 0}
section.blk h2{font-size:clamp(24px,3.4vw,34px);margin-bottom:14px}
section.blk > .narrow > p{color:var(--muted);max-width:64ch;margin-bottom:8px}
.qchips{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px}
.qchip{background:#fff;border:1px solid var(--border);border-radius:999px;padding:9px 17px;font-size:13.5px;
  font-weight:600;color:var(--pine-2);display:inline-flex;align-items:center;gap:8px}
.qchip::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--spring);flex:none}
.cards{display:grid;gap:16px;margin-top:22px}
@media(min-width:760px){.cards.c3{grid-template-columns:repeat(3,1fr)}}
.card{background:#fff;border:1px solid var(--border);border-radius:var(--r);padding:24px 26px;box-shadow:var(--shadow)}
.card h3{font-size:17.5px;margin-bottom:7px}
.card p{color:var(--muted);font-size:14.5px}
.card .n{font-family:var(--mono);font-size:12px;color:var(--spring);display:block;margin-bottom:9px}
.checks{list-style:none;margin-top:18px}
.checks li{position:relative;padding:10px 0 10px 30px;color:var(--ink);font-size:16px;border-bottom:1px solid var(--border)}
.checks li:last-child{border-bottom:none}
.checks li::before{content:"✓";position:absolute;left:0;top:10px;color:var(--spring);font-weight:800}
.band{background:var(--pine);color:#fff;border-radius:var(--r-lg);padding:44px 40px;margin:44px 0 0;text-align:center}
.band h2{color:#fff;margin-bottom:10px}
.band p{color:#C4DDF2;max-width:52ch;margin:0 auto 24px}
details{background:#fff;border:1px solid var(--border);border-radius:16px;margin-top:12px;overflow:hidden;box-shadow:var(--shadow)}
summary{cursor:pointer;list-style:none;padding:19px 24px;font-family:var(--display);font-weight:600;font-size:16.5px;
  color:var(--pine);display:flex;justify-content:space-between;align-items:center;gap:18px}
summary::-webkit-details-marker{display:none}
summary::after{content:"+";flex:none;color:var(--spring);font-size:20px;line-height:1}
details[open] summary::after{content:"–"}
details p{padding:0 24px 22px;color:var(--muted);font-size:15px;max-width:66ch}
.faqgroup{margin-top:34px}
.faqgroup > h2{font-size:22px;margin-bottom:4px}
.crumbs{font-size:12.5px;color:var(--muted);padding-top:22px}
.crumbs a{color:var(--muted);text-decoration:none}
.related{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}
.related a{background:var(--spring-soft);color:var(--pine-2);border-radius:999px;padding:9px 17px;font-size:13.5px;
  font-weight:600;text-decoration:none}
.related a:hover{background:#D3E5F7}
`;

const crumbs = (name) =>
  `<div class="narrow"><nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> › <span>${esc(name)}</span></nav></div>`;

const breadcrumbLd = (name, url) => ({
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
    { "@type": "ListItem", position: 2, name, item: url },
  ],
});

const faqLd = (pairs) => ({
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: pairs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});

const ctaBand = (heading, sub) => `
<div class="narrow"><div class="band">
  <h2>${esc(heading)}</h2>
  <p>${esc(sub)}</p>
  <a class="btn" href="${CAL}" target="_blank" rel="noopener">Book a 30-minute call</a>
</div></div>`;

const faqBlock = (pairs) => pairs.map(f => `
  <details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("");

/* ------------------------------------------------------------- industry page */
function renderIndustry(p) {
  const url = `${SITE}/${p.slug}`;
  const others = INDUSTRIES.filter(x => x.slug !== p.slug).slice(0, 5);
  const serviceLd = {
    "@context": "https://schema.org", "@type": "Service",
    name: p.h1, description: p.metaDescription, url,
    serviceType: "Content marketing and organic search visibility",
    provider: { "@type": "Organization", name: BRAND, url: SITE },
    audience: { "@type": "Audience", audienceType: p.industry },
    areaServed: "US",
  };

  return head({
    title: p.title, description: p.metaDescription, url, keywords: p.keywords, og: "website",
    jsonld: [serviceLd, breadcrumbLd(p.h1, url), faqLd(p.faq)],
  }) + `<style>${PAGE_CSS}</style>
</head>
<body>
${NAV}
${crumbs(p.industry)}
<header class="hero"><div class="narrow">
  <span class="eyebrow">${esc(p.industry)}</span>
  <h1>${esc(p.h1)}</h1>
  ${p.intro.map(t => `<p>${esc(t)}</p>`).join("\n  ")}
  <div class="cta-row">
    <a class="btn" href="${CAL}" target="_blank" rel="noopener">Book a 30-minute call</a>
    <a class="btn ghost" href="/what-you-get">See what you get</a>
  </div>
</div></header>

<section class="blk"><div class="narrow">
  <h2>What your customers are typing right now</h2>
  <p>Every one of these is a person with intent, mid-decision, looking for an answer. Whoever publishes it gets considered.</p>
  <div class="qchips">${p.queries.map(q => `<span class="qchip">${esc(q)}</span>`).join("")}</div>
</div></section>

<section class="blk"><div class="narrow">
  <h2>Why this usually doesn't get done</h2>
  <div class="cards c3">${p.problem.map(x => `
    <div class="card"><h3>${esc(x.t)}</h3><p>${esc(x.d)}</p></div>`).join("")}
  </div>
</div></section>

<section class="blk"><div class="narrow">
  <h2>What a deployment delivers</h2>
  <ul class="checks">${p.outcomes.map(o => `<li>${esc(o)}</li>`).join("")}</ul>
  <div class="related" style="margin-top:24px"><a href="/what-you-get">Full deliverables →</a><a href="/faq">Common questions →</a></div>
</div></section>

<section class="blk"><div class="narrow">
  <h2>Questions ${esc(p.industry.toLowerCase())} ask</h2>
  ${faqBlock(p.faq)}
</div></section>

<section class="blk"><div class="narrow">
  <h2>Other industries we deploy for</h2>
  <div class="related">${others.map(o => `<a href="/${o.slug}">${esc(o.industry)} →</a>`).join("")}</div>
</div></section>

<section class="blk">${ctaBand("One deployment per niche, per metro.", "The point is that you own the answers in your market. Book a call and we'll tell you if yours is still open.")}</section>
${FOOTER}
</body>
</html>`;
}

/* --------------------------------------------------------- capabilities page */
function renderCapabilities() {
  const c = CAPABILITIES;
  const url = `${SITE}/${c.slug}`;
  return head({
    title: c.title, description: c.metaDescription, url, keywords: c.keywords, og: "website",
    jsonld: [breadcrumbLd(c.h1, url), faqLd(c.faq)],
  }) + `<style>${PAGE_CSS}</style>
</head>
<body>
${NAV}
${crumbs("What you get")}
<header class="hero"><div class="narrow">
  <span class="eyebrow">Deliverables</span>
  <h1>${esc(c.h1)}</h1>
  ${c.intro.map(t => `<p>${esc(t)}</p>`).join("\n  ")}
  <div class="cta-row"><a class="btn" href="${CAL}" target="_blank" rel="noopener">Book a 30-minute call</a></div>
</div></header>

<section class="blk"><div class="narrow">
  <h2>What lands on your domain</h2>
  <div class="cards">${c.blocks.map(b => `
    <div class="card"><span class="n">${b.n}</span><h3>${esc(b.t)}</h3><p>${esc(b.d)}</p></div>`).join("")}
  </div>
</div></section>

<section class="blk"><div class="narrow">
  <h2>What stays yours</h2>
  <ul class="checks">${c.keeps.map(k => `<li>${esc(k)}</li>`).join("")}</ul>
</div></section>

<section class="blk"><div class="narrow">
  <h2>Common questions</h2>
  ${faqBlock(c.faq)}
  <div class="related" style="margin-top:22px"><a href="/faq">All questions →</a><a href="/#pricing">Deployment tiers →</a></div>
</div></section>

<section class="blk"><div class="narrow">
  <h2>Deployments by industry</h2>
  <div class="related">${INDUSTRIES.map(o => `<a href="/${o.slug}">${esc(o.industry)} →</a>`).join("")}</div>
</div></section>

<section class="blk">${ctaBand("See whether your market is still open.", "We deploy for one business per niche, per metro. Thirty minutes tells you if yours is available.")}</section>
${FOOTER}
</body>
</html>`;
}

/* ------------------------------------------------------------------ FAQ hub */
function renderFaqHub() {
  const url = `${SITE}/faq`;
  const all = FAQ_HUB.flatMap(g => g.items);
  return head({
    title: `Frequently Asked Questions | ${BRAND}`,
    description: "Straight answers on how ClearPath Content works, what it costs, what you own, how fast results come, and what is required from you.",
    url, og: "website",
    keywords: ["content marketing FAQ", "content subscription questions", "how content marketing works", "content marketing cost"],
    jsonld: [breadcrumbLd("FAQ", url), faqLd(all)],
  }) + `<style>${PAGE_CSS}</style>
</head>
<body>
${NAV}
${crumbs("FAQ")}
<header class="hero"><div class="narrow">
  <span class="eyebrow">Straight answers</span>
  <h1>Frequently asked questions</h1>
  <p>What the program is, what it costs, how fast it works, what you own, and what it requires from you. If something isn't answered here, ask on a call.</p>
  <div class="cta-row"><a class="btn" href="${CAL}" target="_blank" rel="noopener">Book a 30-minute call</a></div>
</div></header>

<main>
${FAQ_HUB.map(g => `
<section class="blk" style="padding:24px 0"><div class="narrow faqgroup">
  <h2>${esc(g.group)}</h2>
  ${faqBlock(g.items)}
</div></section>`).join("")}

<section class="blk"><div class="narrow">
  <h2>Deployments by industry</h2>
  <div class="related">${INDUSTRIES.map(o => `<a href="/${o.slug}">${esc(o.industry)} →</a>`).join("")}</div>
</div></section>

<section class="blk">${ctaBand("Still have questions?", "Thirty minutes, no pitch. We'll tell you honestly whether this fits your market.")}</section>
</main>
${FOOTER}
</body>
</html>`;
}

/* ------------------------------------------------------------------ sitemap */
function buildSitemap() {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Phoenix", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
  let posts = [];
  try { posts = JSON.parse(fs.readFileSync(path.join(ROOT, "blog", "posts.json"), "utf8")); } catch {}

  const urls = [
    { loc: `${SITE}/`, pri: "1.0", freq: "weekly", mod: today },
    { loc: `${SITE}/what-you-get`, pri: "0.9", freq: "monthly", mod: today },
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

// ---- run ----
let n = 0;
for (const p of INDUSTRIES) {
  const dir = path.join(ROOT, p.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), renderIndustry(p));
  console.log(`  ✓ /${p.slug}`); n++;
}
fs.mkdirSync(path.join(ROOT, CAPABILITIES.slug), { recursive: true });
fs.writeFileSync(path.join(ROOT, CAPABILITIES.slug, "index.html"), renderCapabilities());
console.log(`  ✓ /${CAPABILITIES.slug}`); n++;

fs.mkdirSync(path.join(ROOT, "faq"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "faq", "index.html"), renderFaqHub());
console.log("  ✓ /faq"); n++;

fs.writeFileSync(path.join(ROOT, "sitemap.xml"), buildSitemap());
console.log(`[pages] built ${n} pages + sitemap.`);
