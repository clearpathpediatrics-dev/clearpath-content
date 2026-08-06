#!/usr/bin/env node
/**
 * Render the dialer to a local HTML file, no deploy and no store required.
 *
 *   node scripts/dialer-preview.mjs            fixtures, or data/prospects.json if it exists
 *   node scripts/dialer-preview.mjs --open      …and open it
 *
 * The disposition buttons will not save from the preview — there is no store
 * behind it. Everything else is the real page.
 */
import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { renderDialer } from "../netlify/functions/dialer.mjs";
import { callQueue, newProspect } from "../netlify/lib/prospects.mjs";

const OUT = path.resolve("data/dialer-preview.html");

/** Representative of what a real sweep produces — one of each band. */
const FIXTURES = [
  {
    domain: "desertskyair.com", business: "Desert Sky Air Conditioning & Heating",
    website: "https://desertskyair.com", phone: "(480) 555-0142", email: "office@desertskyair.com",
    city: "Mesa", state: "AZ", industry: "HVAC", rating: 4.8, reviews: 212,
    score: 84, band: "HOT",
    reasons: [
      "High customer value — one additional HVAC customer covers a year of the program",
      "No blog or resources section — they publish nothing at all today",
      "Already buying leads (Angi, HomeAdvisor) — budget exists and the shared-lead model is already a known pain",
      "Owner-operated — one decision maker, no committee",
    ],
    flags: [],
    findings: [
      "There is no blog or resources section on the site, so there is nothing for search engines to surface when someone asks a question in your category.",
      "The site links to Angi and HomeAdvisor, so you are paying per lead for enquiries that are usually sold to two or three competitors at the same time.",
      "Mesa barely appears on the site. Local searches are the highest-intent traffic in your category and they are going to whoever does mention it.",
    ],
    audit: { hasBlog: false, blogPostCount: 0, staleMonths: null, pageCount: 7, hasSchema: false,
             paidLeadSignals: ["Angi", "HomeAdvisor"], hasAdsPixel: true, mentionsCity: false, ownerOperated: true },
    source: "places:HVAC:Mesa, AZ",
  },
  {
    domain: "cortezroofingaz.com", business: "Cortez Roofing",
    website: "https://cortezroofingaz.com", phone: "(480) 555-0198", email: "",
    city: "Tempe", state: "AZ", industry: "Roofing / Contracting", rating: 4.6, reviews: 88,
    score: 71, band: "WARM",
    reasons: [
      "High customer value — one additional roofing / contracting customer covers a year of the program",
      "Only 3 articles published — a stalled blog, which is the most common pattern",
      "Only 6 indexable pages — very little surface area for search to find",
      "Tempe is an under-served market — local competitors publish very little",
    ],
    flags: [],
    findings: [
      "The blog has roughly 3 posts on it. That is usually a sign someone started and it stopped being anyone's job.",
      "I count about 6 indexable pages. That is a very small surface for search to find you on, regardless of how good the pages are.",
    ],
    audit: { hasBlog: true, blogPostCount: 3, staleMonths: 19, pageCount: 6, hasSchema: false,
             paidLeadSignals: [], hasAdsPixel: false, mentionsCity: true, ownerOperated: true },
    source: "places:Roofing / Contracting:Tempe, AZ",
  },
  {
    domain: "hollandfamilylaw.com", business: "Holland Family Law",
    website: "https://hollandfamilylaw.com", phone: "(505) 555-0117", email: "info@hollandfamilylaw.com",
    city: "Albuquerque", state: "NM", industry: "Law firm", rating: 4.9, reviews: 41,
    score: 78, band: "HOT",
    reasons: [
      "High customer value — one additional law firm customer covers a year of the program",
      "Buyers in this category research heavily before making contact, so published answers do real work",
      "Last published roughly 14 months ago — the blog was started and abandoned",
      "Albuquerque is an under-served market — local competitors publish very little",
    ],
    flags: [],
    findings: [
      "The most recent post looks to be about 14 months old. Search treats a stalled blog very differently from an active one.",
      "There is no structured data on the page. ChatGPT, Perplexity and Google's AI answers all lean on it, and without it there is nothing clean for them to quote.",
    ],
    audit: { hasBlog: true, blogPostCount: 9, staleMonths: 14, pageCount: 14, hasSchema: false,
             paidLeadSignals: ["legal directory"], hasAdsPixel: false, mentionsCity: true, ownerOperated: false },
    source: "places:Law firm:Albuquerque, NM",
  },
];

let prospects;
try {
  const disk = JSON.parse(fs.readFileSync(path.resolve("data/prospects.json"), "utf8"));
  prospects = Object.values(disk);
  console.log(`[preview] ${prospects.length} prospects from data/prospects.json`);
} catch {
  prospects = FIXTURES.map(f => newProspect(f));
  console.log(`[preview] no data/prospects.json — using ${prospects.length} fixtures`);
}

const queue = callQueue(prospects, { limit: 40, minScore: 35 });
const html = renderDialer({
  prospects, queue, token: "PREVIEW", minScore: 35,
  meters: { dials: 12, booked: 1, approved: 4 },
});

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html);
console.log(`[preview] ${queue.length} in queue → ${OUT}`);

if (process.argv.includes("--open")) execFile("open", [OUT]);
