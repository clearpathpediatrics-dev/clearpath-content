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
.regionblk{margin-bottom:34px}
.regionblk h2{font-size:20px;margin-bottom:4px}
.regionblk .rc{color:var(--muted);font-size:13.5px;margin-bottom:14px}
.citygrid{display:grid;gap:12px;grid-template-columns:1fr}
@media(min-width:560px){.citygrid{grid-template-columns:1fr 1fr}}
@media(min-width:900px){.citygrid{grid-template-columns:1fr 1fr 1fr}}
.citycard{background:#fff;border:1px solid var(--border);border-radius:16px;padding:16px 18px;
  text-decoration:none;display:block;box-shadow:0 3px 12px rgba(11,34,64,.05);transition:transform .18s,border-color .18s}
.citycard:hover{transform:translateY(-3px);border-color:var(--spring)}
.citycard strong{display:block;font-family:var(--display);font-size:16.5px;color:var(--pine)}
.citycard span{display:block;color:var(--muted);font-size:12.5px;margin-top:3px}
.statelist{columns:2;column-gap:26px;color:#33445A;font-size:15.5px;margin-top:12px}
@media(min-width:760px){.statelist{columns:4}}
.statelist li{list-style:none;padding:4px 0;break-inside:avoid}
.qlist{list-style:none;margin-top:16px;display:grid;gap:10px}
.qlist li{background:#fff;border:1px solid var(--border);border-radius:12px;padding:13px 18px 13px 44px;
  position:relative;font-size:15.5px;color:#33445A;box-shadow:0 2px 8px rgba(11,34,64,.04)}
.qlist li::before{content:"";position:absolute;left:17px;top:50%;width:13px;height:13px;margin-top:-7px;
  border:2px solid var(--spring);border-radius:50%;box-shadow:2px 3px 0 -1px var(--spring)}
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
    { q: `Do you only work with ${c.city} businesses?`, a: `No — we deploy for businesses across the United States, and ${c.city} is one of the markets we run dedicated programs in. Local markets are simply where genuinely local content has the biggest advantage, because national competitors cannot write credibly about a place they do not operate in.` },
    { q: `Can you work with more than one business in ${c.city}?`, a: `Not in the same niche. We deploy for one business per niche, per metro — the entire value is that you own the answers in your market, and that does not survive selling the same coverage to your competitor.` },
    { q: `What would you publish for a ${c.city} business?`, a: `Work grounded in this market specifically. ${c.landscape} The published answers address that directly — ${c.queries.slice(0, 3).join("; ")} — rather than the generic version of those questions that already ranks and helps nobody.` },
  ];
  return head({
    title: `Content Marketing in ${c.city}, ${c.abbr} | ${BRAND}`,
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
  <p>We run organic visibility programs for ${esc(c.city)} businesses — published to your own domain, on a fixed cadence, targeting the questions your local buyers actually type. One business per niche, per metro, so the coverage we build in ${esc(c.city)} is not sold to the competitor down the road.</p>
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
  <h2>What ${esc(c.city)} buyers are actually typing</h2>
  <p>These are the shapes of query that matter in this market — specific, local, and asked by someone close to spending money. They are not head terms, and that is precisely why they are winnable.</p>
  <ul class="qlist">${c.queries.map(q => `<li>${esc(q)}</li>`).join("")}</ul>
  <p class="after">Each one of these is a page. Answer it properly once and it keeps earning — in Google, and increasingly in the AI assistants that now summarise these answers for people who never see a results page at all.</p>
</div></section>

<section class="sec"><div class="narrow">
  <h2>Who holds those results in ${esc(c.city)} today</h2>
  <p>${esc(c.landscape)}</p>
  <p>The pattern is the same across most of the ${esc(c.region)}: national directories, portals and lead aggregators sit on the highest-intent local questions. None of them can do the work. They capture the searcher, then sell that enquiry back to a local business — frequently the same enquiry, to three of them.</p>
  <p>Outbidding them is expensive and stops the moment you stop paying. Out-answering them is not. What costs in ${esc(c.city)}, how permitting works here, what the housing stock does, which areas you actually cover — a national page cannot write any of it credibly, and most of your local competitors have not tried.</p>
</div></section>

<section class="sec"><div class="narrow">
  <h2>Industries we deploy for in ${esc(c.city)}</h2>
  <div class="related">${INDUSTRIES.map(i => `<a href="/${i.slug}">${esc(i.industry)} →</a>`).join("")}</div>
</div></section>

<section class="sec"><div class="narrow">
  <h2>Common questions</h2>${faqBlock(faq)}
  <div class="related" style="margin-top:20px"><a href="/blog/local-seo-guide">The local SEO guide →</a><a href="/what-you-get">What you get →</a></div>
</div></section>

<section class="sec"><div class="narrow">
  <h2>Other markets in the ${esc(c.region)}</h2>
  <p style="color:var(--muted);margin-bottom:14px">We deploy nationwide. These are the other ${esc(c.region)} metros with a dedicated page.</p>
  <div class="related">${CITIES.filter(x => x.region === c.region && x.slug !== c.slug)
    .map(x => `<a href="/${x.slug}">${esc(x.city)}, ${esc(x.abbr)} →</a>`).join("")}<a href="/locations">All locations →</a></div>
</div></section>

<section class="sec"><div class="narrow">${captureBlock({
  id: "cap-city",
  heading: `See what ${c.city} is already searching`,
  sub: `Tell us your industry. We will send back a short snapshot of what buyers in ${c.city} are typing before they call anyone, and who is answering them today.`,
  city: c.city,
  state: c.abbr,
})}</div></section>

<section class="sec">${band(`Is your ${c.city} niche still open?`, "One deployment per niche, per metro. Thirty minutes tells you whether yours is available.", "Check availability")}</section>
${FOOTER}
</body>
</html>`;
}


/* --------------------------------------------------------- locations hub */
const REGION_ORDER = ["Northeast", "Mid-Atlantic", "Southeast", "Midwest", "South Central",
  "Southwest", "Mountain West", "West Coast", "Pacific Northwest"];

function renderLocations() {
  const url = `${SITE}/locations`;
  const crumbParts = [{ n: "Home", u: "/" }, { n: "Locations", u: "/locations" }];
  const byRegion = REGION_ORDER
    .map(r => [r, CITIES.filter(c => c.region === r)])
    .filter(([, list]) => list.length);
  const states = [...new Set(CITIES.map(c => c.state))].sort();

  const faq = [
    { q: "Do you only work in the cities listed here?", a: "No. Deployments run for businesses anywhere in the United States. The cities listed here are markets we have built dedicated pages for; if yours is not on the list it simply means we have not written that page yet, not that we cannot deploy there." },
    { q: "How does 'one business per niche, per metro' work nationally?", a: "Availability is scoped to a niche within a metro. An HVAC deployment in Denver does not affect an HVAC deployment in Dallas, and it does not affect a dental deployment in Denver. It only closes HVAC in Denver." },
    { q: "Does local content still matter if I serve a whole region?", a: "Yes, and usually more than businesses expect. Buyers search with local qualifiers even for regional providers, and national directories rank for those queries by default. Content that is specifically about a market is what displaces them." },
    { q: "Do you understand markets you are not physically in?", a: "The program is built around what a given market actually searches, which is observable rather than intuited. What matters is that the published answers are accurate and specific to that market — climate, housing stock, regulation, local pricing — not where the writing desk sits." },
  ];

  const ld = {
    "@context": "https://schema.org", "@type": "Service",
    name: "Content Marketing & Organic Visibility Programs",
    description: "Organic visibility programs for businesses across the United States.",
    url, provider: { "@type": "Organization", name: BRAND, url: SITE },
    areaServed: { "@type": "Country", name: "United States" },
    hasOfferCatalog: {
      "@type": "OfferCatalog", name: "Markets with dedicated programs",
      itemListElement: CITIES.map((c, i) => ({
        "@type": "ListItem", position: i + 1, name: `Content Marketing in ${c.city}, ${c.abbr}`, url: `${SITE}/${c.slug}`,
      })),
    },
  };

  return head({
    title: `Content Marketing by City — Nationwide | ${BRAND}`,
    description: `Organic visibility programs for businesses across the United States. ${CITIES.length} metros with dedicated pages, one deployment per niche per metro, published to your own domain.`,
    url, og: "website",
    keywords: ["content marketing near me", "local content marketing company", "content marketing by city", "nationwide SEO content", "local SEO agency"],
    jsonld: [ld, breadcrumbLd(crumbParts), faqLd(faq)],
  }) + `<style>${HUB_CSS}</style>
</head>
<body>
${NAV}
${crumbs(crumbParts)}
<header class="hero"><div class="narrow">
  <span class="eyebrow">Nationwide</span>
  <h1>Where we deploy</h1>
  <p>ClearPath Content runs organic visibility programs for businesses across the United States. Every deployment publishes to your own domain, targets the questions your buyers actually type, and stays yours permanently.</p>
  <p>Availability is scoped by market: <strong>one business per niche, per metro</strong>. An HVAC deployment in Denver has no bearing on one in Dallas — it only closes HVAC in Denver.</p>
  <div class="cta-row">
    <a class="btn" href="${CAL}" target="_blank" rel="noopener">Check if your market is open</a>
    <a class="btn ghost" href="/industries">See industries</a>
  </div>
</div></header>

<section class="sec"><div class="wrap">
  <h2 style="font-size:clamp(22px,3vw,28px);margin-bottom:6px">${CITIES.length} metros with a dedicated page</h2>
  <p style="color:var(--muted);max-width:64ch;margin-bottom:26px">Each of these pages covers what actually shapes search in that market — climate, housing stock, local regulation, who currently holds the results. If your city is not listed, we still deploy there; the page just has not been written yet.</p>
  ${byRegion.map(([region, list]) => `
  <div class="regionblk">
    <h2>${esc(region)}</h2>
    <p class="rc">${list.length} market${list.length === 1 ? "" : "s"}</p>
    <div class="citygrid">${list.map(c => `
      <a class="citycard" href="/${c.slug}"><strong>${esc(c.city)}, ${esc(c.abbr)}</strong><span>${esc(c.state)}</span></a>`).join("")}
    </div>
  </div>`).join("")}
</div></section>

<section class="sec"><div class="narrow">
  <h2>States we currently have market pages in</h2>
  <ul class="statelist">${states.map(st => `<li>${esc(st)}</li>`).join("")}</ul>
  <p style="color:var(--muted);font-size:15px;margin-top:16px">Not an exhaustive list of where we work — deployments run in all fifty states. These are simply the states where a metro page exists today.</p>
</div></section>

<section class="sec"><div class="narrow">
  <h2>Industries we deploy for</h2>
  <div class="related">${INDUSTRIES.map(i => `<a href="/${i.slug}">${esc(i.industry)} →</a>`).join("")}</div>
</div></section>

<section class="sec"><div class="narrow">
  <h2>Common questions</h2>${faqBlock(faq)}
  <div class="related" style="margin-top:20px"><a href="/blog/local-seo-guide">The local SEO guide →</a><a href="/what-you-get">What you get →</a></div>
</div></section>

<section class="sec"><div class="narrow">${captureBlock({ id: "cap-loc" })}</div></section>

<section class="sec">${band("Is your market still open?", "One deployment per niche, per metro, anywhere in the country. Thirty minutes tells you whether yours is available.", "Check availability")}</section>
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
fs.mkdirSync(path.join(ROOT, "locations"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "locations", "index.html"), renderLocations());
console.log("  ✓ /locations"); n++;

for (const c of COMPARISONS) {
  const dir = path.join(ROOT, c.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), renderComparison(c));
  console.log(`  ✓ /${c.slug}`); n++;
}
console.log(`[hubs] built ${n} pages.`);
