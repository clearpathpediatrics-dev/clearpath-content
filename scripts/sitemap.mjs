/**
 * ClearPath Content — single source of truth for sitemap.xml.
 *
 * WHY THIS FILE EXISTS: both build-pages.mjs and generate-posts.mjs write
 * sitemap.xml, and generate-posts.mjs runs on a daily cron. When the two had
 * their own copies of the URL list, a page added to one was silently deleted
 * from the sitemap by the next cron run. Every page type must be registered
 * here, and only here.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITE } from "./blog-theme.mjs";
import { INDUSTRIES, CAPABILITIES } from "./pages.data.mjs";
import { PILLARS, CITIES, COMPARISONS } from "./hubs.data.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const phoenixToday = () => new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Phoenix", year: "numeric", month: "2-digit", day: "2-digit",
}).format(new Date());

function loadPosts() {
  try { return JSON.parse(fs.readFileSync(path.join(ROOT, "blog", "posts.json"), "utf8")); }
  catch { return []; }
}

/** Build the full URL list. Pass posts to avoid a second read; omit to load from disk. */
export function sitemapUrls(posts) {
  const today = phoenixToday();
  const all = posts || loadPosts();
  return [
    { loc: `${SITE}/`, pri: "1.0", freq: "weekly", mod: today },
    { loc: `${SITE}/${CAPABILITIES.slug}`, pri: "0.9", freq: "monthly", mod: today },
    { loc: `${SITE}/industries`, pri: "0.9", freq: "monthly", mod: today },
    { loc: `${SITE}/locations`, pri: "0.9", freq: "monthly", mod: today },
    { loc: `${SITE}/blog`, pri: "0.9", freq: "daily", mod: today },
    { loc: `${SITE}/faq`, pri: "0.8", freq: "monthly", mod: today },
    { loc: `${SITE}/about-our-audit`, pri: "0.3", freq: "yearly", mod: today },
    ...PILLARS.map(p => ({ loc: `${SITE}/${p.slug}`, pri: "0.9", freq: "weekly", mod: today })),
    ...INDUSTRIES.map(p => ({ loc: `${SITE}/${p.slug}`, pri: "0.8", freq: "monthly", mod: today })),
    ...COMPARISONS.map(p => ({ loc: `${SITE}/${p.slug}`, pri: "0.8", freq: "monthly", mod: today })),
    ...CITIES.map(p => ({ loc: `${SITE}/${p.slug}`, pri: "0.7", freq: "monthly", mod: today })),
    ...all.map(p => ({ loc: `${SITE}/blog/${p.slug}`, pri: "0.7", freq: "monthly", mod: p.iso })),
  ];
}

export function renderSitemap(posts) {
  const rows = sitemapUrls(posts).map(u =>
    `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.mod}</lastmod>\n    <changefreq>${u.freq}</changefreq>\n    <priority>${u.pri}</priority>\n  </url>`
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>\n`;
}

export function writeSitemap(posts) {
  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), renderSitemap(posts));
}
