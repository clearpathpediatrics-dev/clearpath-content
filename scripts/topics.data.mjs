/**
 * ClearPath Content — topic taxonomy for the auto-published blog.
 * -------------------------------------------------------------
 * Organised as topical CLUSTERS rather than a flat keyword list, because
 * search engines reward coherent topical depth, not scattered one-offs.
 * Each cluster is a pillar we want to own; posts are the satellites.
 *
 * Strategy note: the head term "content generation" is dominated by
 * established SaaS with enormous domain authority. The winnable ground for a
 * young domain is (a) AEO/GEO — optimising for AI answer engines, which is
 * new and under-contested — and (b) long-tail, industry-specific playbooks.
 * Both are weighted heavily below.
 */

export const CLUSTERS = [
  {
    key: "aeo-geo",
    name: "AI Search & Answer Engine Optimization",
    weight: 3, // the wedge: newest, least contested, closest to what CPC sells
    pillar: "/blog/ai-search-optimization-guide",
    angles: [
      "how AI answer engines choose which sources to cite",
      "structuring content so ChatGPT and Perplexity can quote it",
      "what an llms.txt file is and whether a business needs one",
      "why AI search traffic converts differently than classic organic",
      "measuring whether your business is being cited by AI assistants",
      "schema markup that helps AI engines understand a business",
      "the difference between SEO, AEO and GEO in practice",
      "writing FAQ sections that AI overviews actually pull from",
      "how AI Overviews changed the click-through economics of search",
      "auditing a website for AI answer-engine readiness",
      "why entity clarity matters more than keywords for AI search",
      "building topical authority that AI models recognise",
    ],
  },
  {
    key: "organic-strategy",
    name: "Organic Visibility Strategy",
    weight: 2,
    pillar: "/blog/organic-visibility-guide",
    angles: [
      "why publishing cadence beats individual article quality over time",
      "how topical authority actually accumulates on a domain",
      "internal linking structures that concentrate ranking power",
      "pillar-and-cluster content architecture explained simply",
      "how long organic content takes to compound, realistically",
      "the difference between rented reach and owned reach",
      "why most small business blogs fail within three months",
      "long-tail keyword strategy for businesses with no authority",
      "search intent categories and how to write for each",
      "content refresh strategy: when to update versus republish",
      "how to find the questions your buyers are actually typing",
      "why ten obvious keywords is the wrong target list",
    ],
  },
  {
    key: "industry-playbooks",
    name: "Industry Content Playbooks",
    weight: 3, // long-tail gold: low competition, high commercial intent
    pillar: "/blog/industry-content-playbooks",
    angles: [
      "content marketing for HVAC companies",
      "SEO content strategy for law firms",
      "blog strategy for dental practices",
      "content marketing for plumbing businesses",
      "SEO for accounting firms and CPAs",
      "content strategy for roofing contractors",
      "organic marketing for med spas and aesthetics clinics",
      "SEO content for real estate agents",
      "content marketing for B2B software companies",
      "blog strategy for home service businesses",
      "SEO content for financial advisors",
      "content marketing for veterinary practices",
      "organic strategy for landscaping companies",
      "SEO content for chiropractors and physical therapists",
      "content marketing for insurance agencies",
      "blog strategy for staffing and recruiting firms",
    ],
  },
  {
    key: "local-seo",
    name: "Local Search Visibility",
    weight: 2,
    pillar: "/blog/local-seo-guide",
    angles: [
      "how local search ranking actually works for service businesses",
      "Google Business Profile optimisation that moves the needle",
      "why NAP consistency still matters and how to audit it",
      "location pages that rank without being thin duplicates",
      "how reviews influence local rankings and AI recommendations",
      "targeting nearby cities without creating doorway pages",
      "local content ideas that attract genuinely local links",
      "service-area business SEO when you have no storefront",
    ],
  },
  {
    key: "measurement",
    name: "Measurement & ROI",
    weight: 2,
    pillar: "/blog/content-marketing-roi",
    angles: [
      "how to calculate the real ROI of organic content",
      "which content metrics actually predict revenue",
      "setting up Search Console so it answers business questions",
      "attribution for organic content in a long sales cycle",
      "what a realistic organic growth curve looks like month by month",
      "how to tell whether your content investment is working at 90 days",
      "the leading indicators that precede ranking improvements",
      "why traffic is a vanity metric without intent segmentation",
    ],
  },
  {
    key: "buying-guides",
    name: "Comparisons & Buying Guides",
    weight: 2, // high commercial intent — these convert
    pillar: "/blog/content-marketing-buying-guide",
    angles: [
      "content agency versus freelance writer versus automation",
      "what content marketing actually costs in 2026",
      "questions to ask before hiring a content agency",
      "signs your content agency is underdelivering",
      "in-house content team versus outsourcing: the real math",
      "how to evaluate content quality before you buy",
      "why per-article pricing misaligns incentives",
      "what to look for in a content subscription service",
      "red flags in SEO and content marketing proposals",
      "how to audit an agency's actual published results",
    ],
  },
  {
    key: "operations",
    name: "Content Operations",
    weight: 1,
    pillar: "/blog/content-operations-guide",
    angles: [
      "building an editorial calendar that survives a busy quarter",
      "brand voice documentation that actually gets used",
      "content briefs that produce usable first drafts",
      "an editing checklist for non-writers reviewing content",
      "publishing workflow for a business with no marketing team",
      "how to keep a blog going when nobody owns it",
    ],
  },
];

/** Flat weighted pool of {cluster, angle} pairs. */
export function anglePool() {
  const pool = [];
  for (const c of CLUSTERS) {
    for (const a of c.angles) {
      for (let w = 0; w < c.weight; w++) pool.push({ cluster: c, angle: a });
    }
  }
  return pool;
}

/**
 * Deterministically pick N distinct angles for a given ISO date + slot,
 * preferring angles whose topic hasn't been used recently. Deterministic so a
 * re-run on the same day can't produce a different set (idempotency).
 */
export function pickAngles(iso, count, recentTitles = []) {
  const pool = anglePool();
  // Simple stable hash of the date so each day starts at a different offset.
  let h = 0;
  for (const ch of iso) h = (h * 31 + ch.charCodeAt(0)) >>> 0;

  const recent = recentTitles.join(" ").toLowerCase();
  const picked = [];
  const usedClusters = new Set();
  const usedAngles = new Set();

  for (let step = 0; picked.length < count && step < pool.length * 2; step++) {
    const item = pool[(h + step * 7919) % pool.length];
    if (usedAngles.has(item.angle)) continue;
    // Avoid two posts from the same cluster on the same day when possible.
    if (usedClusters.has(item.cluster.key) && picked.length < count) {
      if (step < pool.length) continue;
    }
    // Skip angles that obviously overlap something published recently.
    const head = item.angle.split(" ").slice(0, 4).join(" ").toLowerCase();
    if (recent.includes(head) && step < pool.length) continue;

    picked.push(item);
    usedAngles.add(item.angle);
    usedClusters.add(item.cluster.key);
  }
  return picked;
}
