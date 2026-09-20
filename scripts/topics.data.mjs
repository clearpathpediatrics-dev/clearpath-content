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

      // Added 2026-09-20 — catalog ran dry on 09-14 and publishing silently stalled.
      "how to get a brand mentioned in ChatGPT product recommendations",
      "why AI assistants disagree about which businesses to recommend",
      "keeping AI answers about your business factually current",
      "the role of third-party reviews in AI recommendation engines",
      "how retrieval-augmented generation decides what context to pull",
      "preparing a pricing page for AI answer engines",
      "monitoring how competitors appear inside AI assistants",
      "why AI engines favour original data over summarised takes",
      "publishing original research that AI models cite",
      "how conversational follow-up queries change content structure",
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

      // Added 2026-09-20 — catalog ran dry on 09-14 and publishing silently stalled.
      "deciding when a topic deserves a pillar page instead of a post",
      "recovering organic traffic after a ranking drop",
      "how seasonality should shape an annual content plan",
      "consolidating cannibalising pages into one stronger asset",
      "the first ninety days of content for a brand-new domain",
      "why thin category pages quietly suppress a whole site",
      "balancing commercial and informational content ratios",
      "pruning underperforming posts without losing equity",
      "building content moats competitors cannot copy quickly",
      "briefing a subject-matter expert for original insight",
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

      // Added 2026-09-20 — catalog ran dry on 09-14 and publishing silently stalled.
      "content marketing for pest control companies",
      "SEO content for electricians",
      "blog strategy for auto repair shops",
      "content marketing for moving companies",
      "SEO for orthodontic practices",
      "content strategy for commercial cleaning companies",
      "organic marketing for fitness studios and gyms",
      "SEO content for wedding and event venues",
      "content marketing for solar installers",
      "blog strategy for private schools and tutoring centres",
      "SEO content for home remodelling contractors",
      "content marketing for IT managed service providers",
      "organic strategy for pool service companies",
      "SEO content for dermatology practices",
      "content marketing for security and alarm companies",
      "blog strategy for multi-location franchise brands",
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

      // Added 2026-09-20 — catalog ran dry on 09-14 and publishing silently stalled.
      "handling multiple locations without duplicate content",
      "local landing pages for seasonal service demand",
      "how proximity, prominence and relevance trade off",
      "breaking into the map pack for competitive terms",
      "responding to negative reviews in a way that helps ranking",
      "local link building through community sponsorship",
      "optimising for near-me voice queries",
      "citation cleanup after a business move or rebrand",
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
      // Reworded 2026-08-07: the old phrasing ("attribution for organic content
      // in a long sales cycle") collided with the B2B long-sales-cycle post on
      // shared wording, retiring a measurement topic that was never covered.
      "multi-touch attribution models for organic content",
      "what a realistic organic growth curve looks like month by month",
      "how to tell whether your content investment is working at 90 days",
      "the leading indicators that precede ranking improvements",
      "why traffic is a vanity metric without intent segmentation",

      // Added 2026-09-20 — catalog ran dry on 09-14 and publishing silently stalled.
      "building a one-page content dashboard an owner will read",
      "forecasting pipeline from organic traffic realistically",
      "benchmarking your content against direct competitors",
      "cost per acquired customer from organic versus paid",
      "reading Search Console query data without fooling yourself",
      "when to shut down a content programme that is not working",
      "tracking assisted conversions from blog content",
      "setting content goals a leadership team will approve",
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

      // Added 2026-09-20 — catalog ran dry on 09-14 and publishing silently stalled.
      "whether to hire a strategist or a writer first",
      "AI content tools versus managed content services",
      "what a good content retainer scope actually includes",
      "running a paid pilot before signing a long contract",
      "comparing content agencies on process rather than portfolio",
      "when an SEO consultant beats a content agency",
      "contract terms that protect you if results stall",
      "what content ownership and licensing clauses should say",
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

      // Added 2026-09-20 — catalog ran dry on 09-14 and publishing silently stalled.
      "onboarding a new writer onto your brand voice fast",
      "a lightweight approval process that does not stall publishing",
      "repurposing one article into five distribution assets",
      "documenting SOPs so content survives staff turnover",
      "handling legal and compliance review in regulated industries",
      "working through a content backlog without losing momentum",
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

/** Every {cluster, angle} pair exactly once, ignoring cluster weighting. */
export function allAngles() {
  return CLUSTERS.flatMap(c => c.angles.map(angle => ({ cluster: c, angle })));
}

// ---------- angle ↔ published-post matching ----------
//
// Posts written from 2026-08-07 onward record the `angle` they were generated
// from, so exact matching is enough for them. Earlier posts predate that field,
// so we fall back to comparing significant words against the post's title, slug
// and tags. That fallback exists because the previous implementation compared
// the angle's first four words against a blob of recent titles, which missed
// rephrasings — "long-tail keyword strategy for businesses with no authority"
// did not match the post titled "How to Win Long-Tail Keywords With Zero
// Authority", and the angle was published twice.

const STOPWORDS = new Set(`
a about actually all also an and any are as at be been being but by can do does
each even every for from get gets got has have how i if in into is it its just
like make makes more most my no not of on one only or our out over per really
should so some still such than that the their them then there these they this
those to up us use uses using very via want was we what when where whether which
while who why will with without you your
`.trim().split(/\s+/));

/** Lowercase, de-hyphenate, strip punctuation, normalise -ise/-ize spellings. */
function normalizeWord(word) {
  let w = word.toLowerCase().replace(/[^a-z0-9]/g, "");
  w = w.replace(/isation$/, "ization").replace(/ised$/, "ized").replace(/ising$/, "izing");
  // Crude singularisation — enough to make keyword/keywords and company/companies match.
  if (/ies$/.test(w) && w.length > 4) w = w.slice(0, -3) + "y";
  else if (/(s|x|z|ch|sh)es$/.test(w)) w = w.slice(0, -2);
  else if (/s$/.test(w) && !/ss$/.test(w) && w.length > 3) w = w.slice(0, -1);
  return w;
}

/** Significant, normalised tokens for a phrase. */
function tokenize(text) {
  return new Set(
    String(text)
      .split(/[\s\-/]+/)
      .map(normalizeWord)
      .filter(w => w.length > 1 && !STOPWORDS.has(w))
  );
}

/** Stable identity for an angle, so trivial rewording of the catalog still matches history. */
export function angleKey(angle) {
  return [...tokenize(angle)].sort().join(" ");
}

/**
 * Inverse document frequency across the angle catalog, so ubiquitous words
 * ("content", "seo", "strategy", "business") barely count and distinctive ones
 * ("hvac", "schema", "cadence", "chiropractor") dominate the comparison.
 *
 * Without this, plain word-overlap matches almost anything to anything: every
 * post in this archive is about content marketing, so those words are noise.
 */
let _idf = null;
function idf() {
  if (_idf) return _idf;
  const angles = allAngles().map(a => tokenize(a.angle));
  const n = angles.length;
  const df = new Map();
  for (const words of angles) for (const w of words) df.set(w, (df.get(w) || 0) + 1);
  _idf = new Map();
  for (const [w, count] of df) _idf.set(w, Math.log(n / count));
  return _idf;
}

/** Weight of a word: unseen words are maximally distinctive (e.g. a proper noun). */
function weightOf(word) {
  const map = idf();
  return map.has(word) ? map.get(word) : Math.log(allAngles().length);
}

/**
 * IDF-weighted share of an angle's meaning that a published post already covers.
 * 1.0 means the post contains every distinctive word the angle carries.
 *
 * Tags are deliberately excluded — they are generic across the whole archive
 * ("content marketing", "seo") and only add noise.
 */
function angleOverlap(angle, post) {
  const angleWords = tokenize(angle);
  if (!angleWords.size) return 0;
  const postWords = tokenize([post.title, post.slug].join(" "));

  let total = 0, hit = 0;
  for (const w of angleWords) {
    const weight = weightOf(w);
    total += weight;
    if (postWords.has(w)) hit += weight;
  }
  return total > 0 ? hit / total : 0;
}

// Measured against the 23-post archive on 2026-08-07 (`npm run angles:audit`
// prints the score matrix): every genuine duplicate scored >= 0.631, and the
// closest non-duplicate pair scored 0.464. Nothing lands in between, so any
// threshold in that band behaves identically — 0.58 just sits in the middle.
// Re-run the audit after the catalog changes to confirm the gap still exists.
const DUPLICATE_THRESHOLD = 0.58;

/**
 * Which catalog angles are already represented in `posts`.
 * Returns a Map of angle -> the post that covers it (first/newest match wins).
 */
export function usedAngles(posts = []) {
  const recorded = new Map();
  for (const p of posts) if (p && p.angle) recorded.set(angleKey(p.angle), p);

  const used = new Map();
  for (const { angle } of allAngles()) {
    const exact = recorded.get(angleKey(angle));
    if (exact) { used.set(angle, { post: exact, score: 1, exact: true }); continue; }
    // Fall back to weighted word overlap, against EVERY post — not just those
    // missing an `angle`. A post recorded under one angle can still cover a
    // second, near-identical angle, and scoping this to unrecorded posts would
    // silently re-open those angles the moment history was backfilled.
    const best = bestMatch(angle, posts.filter(Boolean));
    if (best && best.score >= DUPLICATE_THRESHOLD) used.set(angle, { ...best, exact: false });
  }
  return used;
}

/** Highest-scoring post for an angle, or null. Exposed for the audit report. */
export function bestMatch(angle, posts = []) {
  let best = null;
  for (const post of posts) {
    const score = angleOverlap(angle, post);
    if (!best || score > best.score) best = { post, score };
  }
  return best;
}

/** Angles with no published post yet, one entry per angle. */
export function remainingAngles(posts = []) {
  const used = usedAngles(posts);
  return allAngles().filter(item => !used.has(item.angle));
}

/**
 * Deterministically pick up to N distinct unused angles for a given ISO date.
 * Deterministic so a re-run on the same day produces the same set (idempotency).
 *
 * Angles already covered by a published post are excluded unconditionally —
 * returning fewer than `count` is correct behaviour when the catalog runs dry.
 * Callers must handle a short result rather than treating it as an error.
 */
export function pickAngles(iso, count, posts = []) {
  const used = usedAngles(posts);
  const pool = anglePool().filter(item => !used.has(item.angle));
  if (!pool.length || count < 1) return [];

  // Simple stable hash of the date so each day starts at a different offset.
  let h = 0;
  for (const ch of iso) h = (h * 31 + ch.charCodeAt(0)) >>> 0;

  const picked = [];
  const pickedClusters = new Set();
  const pickedAngles = new Set();

  for (let step = 0; picked.length < count && step < pool.length * 2; step++) {
    const item = pool[(h + step * 7919) % pool.length];
    if (pickedAngles.has(item.angle)) continue;
    // Prefer one post per cluster per day, but drop the preference on the
    // second sweep rather than publish nothing.
    if (pickedClusters.has(item.cluster.key) && step < pool.length) continue;

    picked.push(item);
    pickedAngles.add(item.angle);
    pickedClusters.add(item.cluster.key);
  }
  return picked;
}
