#!/usr/bin/env node
/**
 * ClearPath Content — hub page builder (pillars, cities, comparisons).
 * -------------------------------------------------------------
 * Renders:
 *   /blog/<pillar-slug>/  — 7 cluster pillars; each auto-lists its articles
 *   /content-marketing-<city>/ — local pages
 *   /<comparison-slug>/   — buying-decision comparison pages
 *
 * Sitemap is owned by build-pages.mjs and generate-posts.mjs (both import
 * ALL_PAGE_URLS from sitemap-urls.mjs), so this script does not write it.
 *
 * Run: node scripts/build-hubs.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PILLARS, CITIES, COMPARISONS } from "./hubs.data.mjs";
import { INDUSTRIES, CAL } from "./pages.data.mjs";
import { SITE, BRAND, esc, CSS, NAV, FOOTER, head, captureBlock } from "./blog-theme.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const HUB_CSS = `${CSS}
.hero{padding:60px 0 30px}
.hero h1{font-size:clamp(30px,4.6vw,48px);margin:18px 0 16px}
.hero p{color:var(--muted);font-size:18px;max-width:64ch;margin-bottom:14px}
.cta-row{margin-top:26px;display:flex;gap:12px;flex-wrap:wrap}
.btn.ghost{background:#fff;color:var(--pine);border:1.5px solid var(--border);box-shadow:none}
.crumbs{font-size:12.5px;color:var(--muted);padding-top:22px}
.crumbs a{color:var(--muted);text-decoration:none}
.crumbs a:hover{color:var(--pine-2)}
.toc{background:#fff;border:1px solid var(--border);border-radius:var(--r);padding:24px 28px;margin:8px 0 10px;box-shadow:var(--shadow)}
.toc h2{font-size:15px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);margin-bottom:12px}
.toc ol{margin:0;padding-left:20px;color:var(--pine-2)}
.toc li{padding:5px 0;font-size:15px}
.toc a{color:var(--pine-2);text-decoration:none;font-weight:500}
.toc a:hover{text-decoration:underline}
.sec{padding:34px 0 6px;scroll-margin-top:90px}
.sec h2{font-size:clamp(22px,3.2vw,30px);margin-bottom:14px}
.sec p{color:#33445A;font-size:16.5px;margin-bottom:15px}
.sec ul,.sec ol{margin:0 0 18px 22px;color:#33445A}
.sec li{margin-bottom:11px;font-size:16.5px}
.sec li strong,.sec p strong{color:var(--pine)}
.after{background:var(--spring-soft);border-left:3px solid var(--spring);border-radius:0 12px 12px 0;
  padding:14px 20px;color:var(--pine);font-size:16px;margin:4px 0 18px}
.tablewrap{overflow-x:auto;margin:18px 0 6px;-webkit-overflow-scrolling:touch}
.tablewrap::-webkit-scrollbar{height:8px}
.tablewrap::-webkit-scrollbar-thumb{background:#CBD8E6;border-radius:99px}
.scrollhint{display:none;color:var(--muted);font-size:13px;margin:0 0 20px}
@media(max-width:700px){.scrollhint{display:block}}
table.cmp{width:100%;min-width:640px;border-collapse:collapse;background:#fff;border:1px solid var(--border);
  border-radius:14px;overflow:hidden;font-size:15px}
table.cmp th,table.cmp td{padding:14px 16px;text-align:left;border-bottom:1px solid var(--border);vertical-align:top}
table.cmp thead th{background:var(--pine);color:#fff;font-family:var(--display);font-weight:600}
table.cmp tbody th{background:var(--bg);color:var(--pine);font-weight:700;width:190px}
table.cmp tr:last-child td,table.cmp tr:last-child th{border-bottom:none}
.twocol{display:grid;gap:16px;margin:18px 0 8px}
@media(min-width:720px){.twocol{grid-template-columns:1fr 1fr}}
.wcard{background:#fff;border:1px solid var(--border);border-radius:var(--r);padding:24px 26px;box-shadow:var(--shadow)}
.wcard h3{font-size:17px;margin-bottom:12px}
.wcard ul{list-style:none;margin:0}
.wcard li{position:relative;padding:8px 0 8px 26px;font-size:15px;color:#33445A}
.wcard li::before{content:"✓";position:absolute;left:0;top:8px;color:var(--spring);font-weight:800}
.related{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}
.related a{background:var(--spring-soft);color:var(--pine-2);border-radius:999px;padding:9px 17px;font-size:13.5px;font-weight:600;text-decoration:none}
.related a:hover{background:#D3E5F7}
.artlist{list-style:none;margin-top:16px}
.artlist li{background:#fff;border:1px solid var(--border);border-radius:14px;padding:16px 20px;margin-bottom:10px;box-shadow:0 3px 12px rgba(11,34,64,.05)}
.artlist a{font-weight:600;color:var(--pine);text-decoration:none}
.artlist a:hover{color:var(--pine-2)}
.artlist .ex{display:block;color:var(--muted);font-size:14.5px;font-weight:400;margin-top:4px}
.empty{color:var(--muted);font-style:italic;font-size:15.5px}
details{background:#fff;border:1px solid var(--border);border-radius:16px;margin-top:12px;overflow:hidden;box-shadow:var(--shadow)}
summary{cursor:pointer;list-style:none;padding:19px 24px;font-family:var(--display);font-weight:600;font-size:16.5px;
  color:var(--pine);display:flex;justify-content:space-between;align-items:center;gap:18px}
summary::-webkit-details-marker{display:none}
summary::after{content:"+";flex:none;color:var(--spring);font-size:20px;line-height:1}
details[open] summary::after{content:"–"}
details p{padding:0 24px 22px;color:var(--muted);font-size:15px;max-width:66ch}
.band{background:var(--pine);color:#fff;border-radius:var(--r-lg);padding:44px 40px;margin:40px 0 10px;text-align:center}
.band h2{color:#fff;margin-bottom:10px;font-size:clamp(22px,3vw,30px)}
.band p{color:#C4DDF2;max-width:54ch;margin:0 auto 24px;font-size:16px}
.citynotes{list-style:none;margin-top:14px}
.citynotes li{position:relative;padding:11px 0 11px 28px;border-bottom:1px solid var(--border);font-size:16px;color:#33445A}
.citynotes li:last-child{border-bottom:none}
.citynotes li::before{content:"◆";position:absolute;left:0;top:11px;color:var(--spring);font-size:11px}
`;

const md = (s) => esc(s).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
const anchor = (h) => h.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const crumbs = (parts) =>
  `<div class="narrow"><nav class="crumbs" aria-label="Breadcrumb">${parts
    .map((p, i) => (i === parts.length - 1 ? `<span>${esc(p.n)}</span>` : `<a href="${p.u}">${esc(p.n)}</a>`))
    .join(" › ")}</nav></div>`;

const breadcrumbLd = (parts) => ({
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: parts.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.n, item: SITE + p.u })),
});

const faqLd = (f) => ({
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: f.map(x => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })),
});

const faqBlock = (f) => f.map(x => `\n  <details><summary>${esc(x.q)}</summary><p>${esc(x.a)}</p></details>`).join("");

const band = (h, p, label = "Book a 30-minute call") => `
<div class="narrow"><div class="band">
  <h2>${esc(h)}</h2><p>${esc(p)}</p>
  <a class="btn" href="${CAL}" target="_blank" rel="noopener">${esc(label)}</a>
</div></div>`;

function readPosts() {
  try { return JSON.parse(fs.readFileSync(path.join(ROOT, "blog", "posts.json"), "utf8")); }
  catch { return []; }
}

/* ------------------------------------------------------------------ pillar */
function renderPillar(p, posts) {
  const url = `${SITE}/${p.slug}`;
  const mine = posts.filter(x => x.clusterKey === p.clusterKey);
  const articleLd = {
    "@context": "https://schema.org", "@type": "Article",
    headline: p.h1, description: p.metaDescription, mainEntityOfPage: url,
    author: { "@type": "Organization", name: BRAND, url: SITE },
    publisher: { "@type": "Organization", name: BRAND, url: SITE },
    image: `${SITE}/assets/cpc-og.jpg`, keywords: p.keywords.join(", "),
  };
  const crumbParts = [{ n: "Home", u: "/" }, { n: "Field notes", u: "/blog" }, { n: p.eyebrow, u: "/" + p.slug }];

  const body = p.sections.map(s => `
<section class="sec" id="${anchor(s.h)}"><div class="narrow">
  <h2>${esc(s.h)}</h2>
  ${(s.p || []).map(t => `<p>${md(t)}</p>`).join("\n  ")}
  ${s.list ? `<ul>${s.list.map(i => `<li>${md(i)}</li>`).join("")}</ul>` : ""}
  ${s.ol ? `<ol>${s.ol.map(i => `<li>${md(i)}</li>`).join("")}</ol>` : ""}
  ${s.after ? `<p class="after">${md(s.after)}</p>` : ""}
</div></section>`).join("");

  const articles = mine.length
    ? `<ul class="artlist">${mine.map(a => `
      <li><a href="/blog/${a.slug}">${esc(a.title)}</a><span class="ex">${esc(a.excerpt || a.metaDescription || "")}</span></li>`).join("")}
    </ul>`
    : `<p class="empty">Articles in this cluster publish continuously — new pieces appear here automatically as they go live.</p>`;

  const industryLinks = p.linkIndustries
    ? `<div class="related">${INDUSTRIES.map(i => `<a href="/${i.slug}">${esc(i.industry)} →</a>`).join("")}</div>`
    : "";

  return head({
    title: p.title, description: p.metaDescription, url, keywords: p.keywords, og: "article",
    jsonld: [articleLd, breadcrumbLd(crumbParts), faqLd(p.faq)],
  }) + `<style>${HUB_CSS}</style>
</head>
<body>
${NAV}
${crumbs(crumbParts)}
<header class="hero"><div class="narrow">
  <span class="eyebrow">${esc(p.eyebrow)}</span>
  <h1>${esc(p.h1)}</h1>
  ${p.intro.map(t => `<p>${esc(t)}</p>`).join("\n  ")}
  <div class="cta-row">
    <a class="btn" href="${CAL}" target="_blank" rel="noopener">Book a 30-minute call</a>
    <a class="btn ghost" href="/what-you-get">See what you get</a>
  </div>
</div></header>

<div class="narrow"><div class="toc">
  <h2>In this guide</h2>
  <ol>${p.sections.map(s => `<li><a href="#${anchor(s.h)}">${esc(s.h)}</a></li>`).join("")}</ol>
</div></div>
${body}

<section class="sec"><div class="narrow">
  <h2>${p.linkIndustries ? "Industry playbooks" : "Articles in this cluster"}</h2>
  ${p.linkIndustries ? industryLinks : articles}
</div></section>

<section class="sec"><div class="narrow">
  <h2>Common questions</h2>${faqBlock(p.faq)}
  <div class="related" style="margin-top:20px"><a href="/blog/">All field notes →</a><a href="/what-you-get">What you get →</a><a href="/faq">FAQ →</a></div>
</div></section>

<section class="sec"><div class="narrow">${captureBlock({ id: "cap-pillar" })}</div></section>

<section class="sec">${band("Want this running on your domain?", "We deploy for one business per niche, per metro. Thirty minutes tells you whether yours is open.")}</section>
${FOOTER}
</body>
</html>`;
}

/* -------------------------------------------------------------------- city */
function renderCity(c) {
  const url = `${SITE}/${c.slug}`;
  const crumbParts = [{ n: "Home", u: "/" }, { n: `${c.city} content marketing`, u: "/" + c.slug }];
  const svc = {
    "@context": "https://schema.org", "@type": "Service",
    name: `Content Marketing in ${c.city}, ${c.state}`,
    description: `Organic visibility programs for ${c.city} businesses.`,
    url, provider: { "@type": "Organization", name: BRAND, url: SITE },
    areaServed: { "@type": "City", name: c.city, containedInPlace: { "@type": "State", name: c.state } },
  };
  const faq = [
    { q: `How much does content marketing cost in ${c.city}?`, a: `Agency retainers in the ${c.city} market commonly run into the thousands per month for a handful of articles. ClearPath Content deployment tiers run $199 to $499 per month, month to month, with everything published staying yours permanently.` },
    { q: `Do you only work with ${c.city} businesses?`, a: `No — the program runs for businesses anywhere. ${c.city} and the surrounding metro is simply where we are based, and local markets are where genuinely local content has the biggest advantage over national competitors.` },
    { q: `Can you work with more than one business in ${c.city}?`, a: `Not in the same niche. We deploy for one business per niche, per metro — the entire value is that you own the answers in your market, and that does not survive selling the same coverage to your competitor.` },
  ];
  return head({
    title: `Content Marketing in ${c.city}, AZ | ${BRAND}`,
    description: `Organic visibility programs for ${c.city} businesses — published to your own domain, on a fixed cadence, targeting what ${c.city} buyers actually search.`,
    url, og: "website",
    keywords: [`content marketing ${c.city}`, `${c.city} SEO`, `${c.city} content marketing agency`, `SEO company ${c.city}`, `${c.city} digital marketing`],
    jsonld: [svc, breadcrumbLd(crumbParts), faqLd(faq)],
  }) + `<style>${HUB_CSS}</style>
</head>
<body>
${NAV}
${crumbs(crumbParts)}
<header class="hero"><div class="narrow">
  <span class="eyebrow">${esc(c.city)}, ${esc(c.state)}</span>
  <h1>Content Marketing in ${esc(c.city)}</h1>
  <p>${esc(c.blurb)}</p>
  <p>We run organic visibility programs for ${esc(c.city)} businesses — published to your own domain, on a fixed cadence, targeting the questions your local buyers actually type. One business per niche, per metro.</p>
  <div class="cta-row">
    <a class="btn" href="${CAL}" target="_blank" rel="noopener">Check if your ${esc(c.city)} niche is open</a>
    <a class="btn ghost" href="/industries">See industries</a>
  </div>
</div></header>

<section class="sec"><div class="narrow">
  <h2>What shapes search in ${esc(c.city)}</h2>
  <p>Local content only outperforms national competitors when it contains something true only of this market. These are the factors we build around here.</p>
  <ul class="citynotes">${c.notes.map(n => `<li>${esc(n)}</li>`).join("")}</ul>
</div></section>

<section class="sec"><div class="narrow">
  <h2>Why local businesses lose their own market</h2>
  <p>Search results in ${esc(c.city)} for the highest-intent local questions are dominated by national directories, portals and lead aggregators. None of them can actually do the work — they capture the searcher, then sell that lead back to the local business, often shared with two competitors.</p>
  <p>The way out is not to outbid them. It is to answer the specific questions they answer generically and badly: what something costs in this market, how local permitting works, what the housing stock here does, which neighbourhoods you actually serve. That ground is winnable, and most local competitors are not even contesting it.</p>
</div></section>

<section class="sec"><div class="narrow">
  <h2>Industries we deploy for in ${esc(c.city)}</h2>
  <div class="related">${INDUSTRIES.map(i => `<a href="/${i.slug}">${esc(i.industry)} →</a>`).join("")}</div>
</div></section>

<section class="sec"><div class="narrow">
  <h2>Common questions</h2>${faqBlock(faq)}
  <div class="related" style="margin-top:20px"><a href="/blog/local-seo-guide">The local SEO guide →</a><a href="/what-you-get">What you get →</a></div>
</div></section>

<section class="sec"><div class="narrow">${captureBlock({
  id: "cap-city",
  heading: `See what ${c.city} is already searching`,
  sub: `Tell us your industry. We will send back a short snapshot of what buyers in ${c.city} are typing before they call anyone, and who is answering them today.`,
  city: `${c.city}, AZ`,
})}</div></section>

<section class="sec">${band(`Is your ${c.city} niche still open?`, "One deployment per niche, per metro. Thirty minutes tells you whether yours is available.", "Check availability")}</section>
${FOOTER}
</body>
</html>`;
}

/* -------------------------------------------------------------- comparison */
function renderComparison(c) {
  const url = `${SITE}/${c.slug}`;
  const crumbParts = [{ n: "Home", u: "/" }, { n: c.eyebrow, u: "/" + c.slug }];
  const heads = c.slug === "diy-content-vs-outsourcing"
    ? ["", "Doing it yourself", "Outsourcing it"]
    : ["", "Agency retainer", "Content subscription"];
  const whenHeads = c.slug === "diy-content-vs-outsourcing"
    ? ["Do it yourself if…", "Outsource if…"]
    : ["An agency fits if…", "A subscription fits if…"];

  return head({
    title: c.title, description: c.metaDescription, url, keywords: c.keywords, og: "article",
    jsonld: [
      { "@context": "https://schema.org", "@type": "Article", headline: c.h1, description: c.metaDescription,
        mainEntityOfPage: url, author: { "@type": "Organization", name: BRAND, url: SITE },
        publisher: { "@type": "Organization", name: BRAND, url: SITE } },
      breadcrumbLd(crumbParts), faqLd(c.faq),
    ],
  }) + `<style>${HUB_CSS}</style>
</head>
<body>
${NAV}
${crumbs(crumbParts)}
<header class="hero"><div class="narrow">
  <span class="eyebrow">${esc(c.eyebrow)}</span>
  <h1>${esc(c.h1)}</h1>
  ${c.intro.map(t => `<p>${esc(t)}</p>`).join("\n  ")}
  <div class="cta-row"><a class="btn" href="${CAL}" target="_blank" rel="noopener">Talk it through — 30 minutes</a></div>
</div></header>

<section class="sec"><div class="narrow">
  <h2>Side by side</h2>
  <div class="tablewrap"><table class="cmp">
    <thead><tr>${heads.map(h => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead>
    <tbody>${c.rows.map(r => `<tr><th scope="row">${esc(r[0])}</th><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join("")}</tbody>
  </table></div>
  <p class="scrollhint">Swipe the table sideways to see both columns.</p>
</div></section>

<section class="sec"><div class="narrow">
  <h2>Which one fits you</h2>
  <div class="twocol">
    <div class="wcard"><h3>${esc(whenHeads[0])}</h3><ul>${c.when.agency.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
    <div class="wcard"><h3>${esc(whenHeads[1])}</h3><ul>${c.when.subscription.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
  </div>
</div></section>

<section class="sec"><div class="narrow">
  <h2>Common questions</h2>${faqBlock(c.faq)}
  <div class="related" style="margin-top:20px"><a href="/blog/content-marketing-buying-guide">The full buyer's guide →</a><a href="/what-you-get">What you get →</a><a href="/#pricing">Pricing →</a></div>
</div></section>

<section class="sec"><div class="narrow">${captureBlock({ id: "cap-cmp" })}</div></section>

<section class="sec">${band("Not sure which fits?", "Thirty minutes, no pitch. We will tell you honestly if a subscription is the wrong answer for your situation.")}</section>
${FOOTER}
</body>
</html>`;
}

// ---- run ----
const posts = readPosts();
let n = 0;
for (const p of PILLARS) {
  const dir = path.join(ROOT, p.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), renderPillar(p, posts));
  console.log(`  ✓ /${p.slug}`); n++;
}
for (const c of CITIES) {
  const dir = path.join(ROOT, c.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), renderCity(c));
  console.log(`  ✓ /${c.slug}`); n++;
}
for (const c of COMPARISONS) {
  const dir = path.join(ROOT, c.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), renderComparison(c));
  console.log(`  ✓ /${c.slug}`); n++;
}
console.log(`[hubs] built ${n} pages.`);
