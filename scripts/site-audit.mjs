/**
 * ClearPath Content — lightweight public-site audit.
 * -------------------------------------------------------------
 * Fetches a handful of public pages and reports observable facts: does a blog
 * exist, how many pages are indexable, is there structured data, do they buy
 * leads, do they mention their own city. Nothing here is private, nothing is
 * behind auth, and it is a few requests — the same footprint as a person
 * opening the site in a browser.
 *
 * Every finding must be something you could show the prospect and have them
 * agree with. Guesses do not belong in outreach.
 */

const UA = "ClearPathContentBot/1.0 (+https://clearpath-content.com/about-our-audit)";
const TIMEOUT_MS = 9000;

/** Third-party lead marketplaces — presence means they already buy leads. */
const PAID_LEAD_PATTERNS = [
  [/angi\.com|angieslist/i, "Angi"],
  [/homeadvisor/i, "HomeAdvisor"],
  [/thumbtack/i, "Thumbtack"],
  [/porch\.com/i, "Porch"],
  [/houzz\.com/i, "Houzz"],
  [/yelp\.com\/biz/i, "Yelp for Business"],
  [/bark\.com/i, "Bark"],
  [/networx/i, "Networx"],
  [/modernize\.com/i, "Modernize"],
  [/avvo\.com|findlaw|justia|lawyers\.com/i, "legal directory"],
  [/zillow\.com\/profile|realtor\.com\/realestateagent/i, "real-estate portal"],
  [/opencare|zocdoc/i, "patient marketplace"],
];

const ADS_PATTERNS = [
  /googleadservices|gtag\/js\?id=AW-|google_conversion/i,
  /connect\.facebook\.net|fbq\(/i,
  /bat\.bing\.com/i,
];

const ENTERPRISE_PATTERNS = [/\/investors?\b/i, /\/careers?\b/i, /\/newsroom\b/i, /\/press-releases?\b/i, /\bNASDAQ\b|\bNYSE\b/];
const OWNER_PATTERNS = [/family[- ]owned/i, /locally[- ]owned/i, /owner[- ]operated/i, /founded by/i, /meet the owner/i];

const BLOG_PATHS = ["/blog", "/blog/", "/news", "/articles", "/resources", "/insights", "/learn"];

function normUrl(input = "") {
  let u = String(input).trim();
  if (!u) return null;
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  try {
    const parsed = new URL(u);
    if (!/^https?:$/.test(parsed.protocol)) return null;
    // Never audit our own properties or obvious non-sites.
    if (/clearpath-content\.com$/i.test(parsed.hostname)) return null;
    return parsed;
  } catch { return null; }
}

async function get(url, { asText = true } = {}) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctl.signal,
      redirect: "follow",
      headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" },
    });
    if (!res.ok) return { ok: false, status: res.status };
    const body = asText ? (await res.text()).slice(0, 400_000) : null;
    return { ok: true, status: res.status, body, finalUrl: res.url };
  } catch (e) {
    return { ok: false, error: e.name === "AbortError" ? "timeout" : String(e.message || e) };
  } finally { clearTimeout(t); }
}

const textOf = (html) => html
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ");

/** Count <url> entries in a sitemap, following one level of sitemap index. */
async function countSitemapUrls(origin) {
  const first = await get(`${origin}/sitemap.xml`);
  if (!first.ok || !first.body) return null;
  const body = first.body;
  if (/<sitemapindex/i.test(body)) {
    const children = [...body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map(m => m[1]).slice(0, 5);
    let total = 0;
    for (const c of children) {
      const r = await get(c);
      if (r.ok && r.body) total += (r.body.match(/<url>/gi) || []).length;
    }
    return total || null;
  }
  const n = (body.match(/<url>/gi) || []).length;
  return n || null;
}

/** Newest date found in a blob of HTML, as whole months before now. */
function monthsSinceNewestDate(html) {
  const now = Date.now();
  const found = [];
  for (const m of html.matchAll(/datetime="(\d{4}-\d{2}-\d{2})/gi)) found.push(Date.parse(m[1]));
  for (const m of html.matchAll(/"datePublished"\s*:\s*"(\d{4}-\d{2}-\d{2})/gi)) found.push(Date.parse(m[1]));
  for (const m of html.matchAll(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+(20\d\d)\b/gi)) {
    const d = Date.parse(m[0]); if (!Number.isNaN(d)) found.push(d);
  }
  const valid = found.filter(d => !Number.isNaN(d) && d <= now);
  if (!valid.length) return null;
  return Math.floor((now - Math.max(...valid)) / (1000 * 60 * 60 * 24 * 30.44));
}

/**
 * Audit a public website.
 * @param {string} website  domain or URL
 * @param {object} [ctx]    { city } — used to check local relevance
 */
export async function auditSite(website, ctx = {}) {
  const url = normUrl(website);
  if (!url) return { ok: false, error: "no usable website provided" };

  const origin = url.origin;
  const home = await get(origin);
  if (!home.ok) return { ok: false, error: home.error || `homepage returned ${home.status}`, origin };

  const html = home.body || "";
  const plain = textOf(html);

  // --- blog discovery -----------------------------------------------------
  let hasBlog = false, blogUrl = null, blogPostCount = 0, staleMonths = null;
  const linked = [...html.matchAll(/href="([^"]*(?:blog|news|articles|resources|insights)[^"]*)"/gi)].map(m => m[1]);
  const candidates = [...new Set([...linked.slice(0, 4), ...BLOG_PATHS])];
  for (const c of candidates) {
    const target = c.startsWith("http") ? c : origin + (c.startsWith("/") ? c : "/" + c);
    if (!target.startsWith(origin)) continue;
    const r = await get(target);
    if (r.ok && r.body && r.body.length > 800) {
      hasBlog = true;
      blogUrl = r.finalUrl || target;
      const links = [...r.body.matchAll(/href="([^"#?]+)"/gi)].map(m => m[1]);
      const base = new URL(blogUrl).pathname.replace(/\/$/, "");
      blogPostCount = new Set(
        links.filter(h => h.includes(base + "/") && h.replace(base + "/", "").replace(/\/$/, "").length > 2)
      ).size;
      staleMonths = monthsSinceNewestDate(r.body);
      break;
    }
  }

  // --- size ---------------------------------------------------------------
  const sitemapCount = await countSitemapUrls(origin);
  const internal = new Set(
    [...html.matchAll(/href="([^"#?]+)"/gi)].map(m => m[1])
      .filter(h => h.startsWith("/") || h.startsWith(origin))
      .map(h => h.replace(origin, "").replace(/\/$/, ""))
      .filter(Boolean)
  );
  const pageCount = sitemapCount ?? internal.size;

  // --- signals ------------------------------------------------------------
  const paidLeadSignals = [...new Set(PAID_LEAD_PATTERNS.filter(([re]) => re.test(html)).map(([, name]) => name))];
  const hasAdsPixel = ADS_PATTERNS.some(re => re.test(html));
  const hasSchema = /application\/ld\+json/i.test(html);
  const schemaTypes = [...new Set([...html.matchAll(/"@type"\s*:\s*"([A-Za-z]+)"/g)].map(m => m[1]))].slice(0, 8);
  const enterpriseSignals = ENTERPRISE_PATTERNS.filter(re => re.test(html)).length >= 2;
  const ownerOperated = OWNER_PATTERNS.some(re => re.test(plain));

  const city = (ctx.city || "").trim();
  const cityHits = city ? (plain.match(new RegExp(city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")) || []).length : 0;

  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [, ""])[1].trim().slice(0, 120);
  const metaDesc = (html.match(/<meta\s+name="description"\s+content="([^"]*)"/i) || [, ""])[1].trim();

  return {
    ok: true, origin, title, metaDesc,
    hasBlog, blogUrl, blogPostCount, staleMonths,
    pageCount, sitemapCount, hasSchema, schemaTypes,
    paidLeadSignals, hasAdsPixel,
    enterpriseSignals, ownerOperated,
    mentionsCity: cityHits >= 3, cityHits,
    hasMetaDesc: Boolean(metaDesc),
  };
}

/**
 * The two or three findings worth putting in an email. Ordered by how
 * uncomfortable they are to read, which is the same as how motivating.
 * Every line must be verifiable by the recipient in one click.
 */
export function headlineFindings(audit, ctx = {}) {
  if (!audit || !audit.ok) return [];
  const out = [];
  const city = ctx.city || "your city";

  if (!audit.hasBlog) {
    out.push("There is no blog or resources section on the site, so there is nothing for search engines to surface when someone asks a question in your category.");
  } else if (audit.blogPostCount <= 5) {
    out.push(`The blog has roughly ${audit.blogPostCount} post${audit.blogPostCount === 1 ? "" : "s"} on it. That is usually a sign someone started and it stopped being anyone's job.`);
  } else if (audit.staleMonths != null && audit.staleMonths >= 6) {
    out.push(`The most recent post looks to be about ${audit.staleMonths} months old. Search treats a stalled blog very differently from an active one.`);
  }

  if (audit.paidLeadSignals.length) {
    out.push(`The site links to ${audit.paidLeadSignals.join(" and ")}, so you are paying per lead for enquiries that are usually sold to two or three competitors at the same time.`);
  } else if (audit.hasAdsPixel) {
    out.push("There is ad tracking on the site, which means traffic is being bought. That traffic stops the day the budget does — published pages do not.");
  }

  if (audit.pageCount && audit.pageCount <= 8) {
    out.push(`I count about ${audit.pageCount} indexable pages. That is a very small surface for search to find you on, regardless of how good the pages are.`);
  }

  if (ctx.city && !audit.mentionsCity) {
    out.push(`${city} barely appears on the site. Local searches are the highest-intent traffic in your category and they are going to whoever does mention it.`);
  }

  if (!audit.hasSchema) {
    out.push("There is no structured data on the page. ChatGPT, Perplexity and Google's AI answers all lean on it, and without it there is nothing clean for them to quote.");
  }

  return out.slice(0, 3);
}
