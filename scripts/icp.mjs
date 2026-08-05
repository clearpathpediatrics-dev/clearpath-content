/**
 * ClearPath Content — ICP scoring.
 * -------------------------------------------------------------
 * Who gets the most value from a published-content program? The model is
 * multiplicative, not additive, because these factors gate each other:
 *
 *   1. TICKET      One extra customer has to pay for a year of the service.
 *                  At $199-499/mo that is $2.4k-6k. A $200 job cannot clear it;
 *                  a $12k roof clears it on the first sale.
 *   2. RESEARCH    Buyers must actually search before they buy. Emergency-only
 *                  categories get called, not googled, and content loses to the
 *                  map pack.
 *   3. GAP         They must be invisible today. A business already publishing
 *                  well has less to gain — and is a harder sell.
 *   4. SPEND       Already paying for leads (Angi, Thumbtack, LSA, directories)
 *                  means budget exists and the pain is already felt. This is
 *                  the single strongest buying signal in the set.
 *   5. DECIDE      Small enough to decide without a committee, big enough to
 *                  afford it and service the work.
 *
 * Score is 0-100. Anything at or above HOT is worth a same-day call.
 *
 * Used by both halves of the funnel so inbound and outbound rank on the same
 * scale — a form fill and a cold prospect are directly comparable.
 */

export const BANDS = { HOT: 75, WARM: 55, COOL: 35 };

/**
 * Per-industry priors. `ticket` is typical customer value, `research` is how
 * much of the buying decision happens in a search box before contact.
 * Both 0-1. Figures are order-of-magnitude judgements, not survey data.
 */
export const INDUSTRY_PRIORS = {
  "Roofing / Contracting": { ticket: 0.95, research: 0.80, note: "$10k-40k jobs, months of research, insurance-claim questions nobody answers well" },
  "Law firm":              { ticket: 0.95, research: 0.95, note: "A single matter can exceed a decade of subscription cost; clients research for weeks" },
  "B2B software":          { ticket: 0.90, research: 0.95, note: "Multi-year contract value, a buying committee that reads everything" },
  "Real estate":           { ticket: 0.90, research: 0.85, note: "One commission covers years; buyers and sellers research for months" },
  "Dental practice":       { ticket: 0.75, research: 0.80, note: "Implants and ortho are $4k-8k considered purchases with long research cycles" },
  "HVAC":                  { ticket: 0.85, research: 0.70, note: "$8k-15k replacements, strongly seasonal, heavy pre-purchase research" },
  "Electrical":            { ticket: 0.70, research: 0.65, note: "Panel upgrades and EV chargers are researched; service calls are not" },
  "Plumbing":              { ticket: 0.60, research: 0.50, note: "Repipes and water heaters are researched; emergencies are phone-first" },
  "Home services":         { ticket: 0.65, research: 0.65, note: "Wide range — remodels research heavily, maintenance does not" },
  "Professional services": { ticket: 0.80, research: 0.85, note: "Retainer relationships with long, credential-driven evaluation" },
  "Pest control":          { ticket: 0.45, research: 0.50, note: "Recurring contracts help lifetime value, but tickets are small and urgency is high" },
  "Other":                 { ticket: 0.60, research: 0.60, note: "Unclassified — scored on the audit rather than the category" },
};

/** Metros where local organic competition is materially lighter. */
const UNDERSERVED = new Set([
  "mesa", "albuquerque", "louisville", "milwaukee", "st. louis", "st louis",
  "indianapolis", "columbus", "oklahoma city", "kansas city", "detroit",
  "jacksonville", "san antonio", "fort worth", "boise", "sacramento",
  "tempe", "pittsburgh", "richmond", "baltimore",
]);

/** Metros where head terms are saturated and only the long tail is winnable. */
const SATURATED = new Set([
  "new york", "los angeles", "chicago", "san francisco", "boston",
  "washington", "miami", "seattle", "san jose",
]);

const clamp01 = (n) => Math.max(0, Math.min(1, n));

/**
 * Score a lead.
 *
 * @param {object} lead
 * @param {string} lead.industry  label from the capture form's dropdown
 * @param {string} [lead.city]
 * @param {object} [audit]        result of auditSite(); omit if not audited yet
 * @returns {{score:number, band:string, factors:object, reasons:string[], flags:string[]}}
 */
export function scoreLead(lead = {}, audit = null) {
  const prior = INDUSTRY_PRIORS[lead.industry] || INDUSTRY_PRIORS.Other;
  const reasons = [];
  const flags = [];

  // --- 1. ticket ---------------------------------------------------------
  const ticket = prior.ticket;
  if (ticket >= 0.85) reasons.push(`High customer value — one additional ${industryPhrase(lead.industry || "")} customer covers a year of the program`);

  // --- 2. research behaviour --------------------------------------------
  const research = prior.research;
  if (research >= 0.85) reasons.push("Buyers in this category research heavily before making contact, so published answers do real work");
  if (research <= 0.55) flags.push("Emergency-driven category — a share of demand is phone-first and content will not capture it");

  // --- 3. visibility gap (needs an audit) --------------------------------
  let gap = 0.55; // neutral assumption when we have not looked
  if (audit && audit.ok) {
    let g = 0.20;
    if (!audit.hasBlog)                      { g += 0.35; reasons.push("No blog or resources section — they publish nothing at all today"); }
    else if (audit.blogPostCount < 6)        { g += 0.22; reasons.push(`Only ${audit.blogPostCount} article${audit.blogPostCount === 1 ? "" : "s"} published — a stalled blog, which is the most common pattern`); }
    else if (audit.staleMonths >= 6)         { g += 0.20; reasons.push(`Last published roughly ${audit.staleMonths} months ago — the blog was started and abandoned`); }
    else                                     { g -= 0.10; flags.push("Already publishing consistently — less headroom, and a harder conversation"); }

    if (audit.pageCount <= 6)                { g += 0.15; reasons.push(`Only ${audit.pageCount} indexable pages — very little surface area for search to find`); }
    if (!audit.hasSchema)                    { g += 0.08; reasons.push("No structured data, so AI answer engines have nothing clean to cite"); }
    if (!audit.mentionsCity && lead.city)    { g += 0.10; reasons.push(`The site barely mentions ${lead.city} — it reads as location-agnostic to local search`); }
    gap = clamp01(g);
  } else if (audit && !audit.ok) {
    flags.push(`Could not audit the site (${audit.error}) — score is based on category priors only`);
  }

  // --- 4. existing paid-lead spend --------------------------------------
  let spend = 0.45;
  if (audit && audit.ok) {
    if (audit.paidLeadSignals.length) {
      spend = 0.95;
      reasons.push(`Already buying leads (${audit.paidLeadSignals.join(", ")}) — budget exists and the shared-lead model is already a known pain`);
    } else if (audit.hasAdsPixel) {
      spend = 0.75;
      reasons.push("Running paid ads — spending on traffic that stops the moment the budget does");
    }
  }

  // --- 5. decision speed -------------------------------------------------
  let decide = 0.70;
  if (audit && audit.ok) {
    if (audit.enterpriseSignals) { decide = 0.35; flags.push("Looks like a larger organisation — expect a longer approval path"); }
    if (audit.ownerOperated)     { decide = 0.90; reasons.push("Owner-operated — one decision maker, no committee"); }
  }

  // --- market modifier ---------------------------------------------------
  const city = (lead.city || "").trim().toLowerCase();
  let market = 1.0;
  if (UNDERSERVED.has(city)) { market = 1.08; reasons.push(`${lead.city} is an under-served market — local competitors publish very little`); }
  else if (SATURATED.has(city)) { market = 0.94; flags.push(`${lead.city} is saturated on head terms — the win is entirely in specific long-tail questions`); }

  // Weighted geometric mean: a zero on any dimension should sink the score,
  // which an additive model would not do.
  const factors = { ticket, research, gap, spend, decide };
  const weights = { ticket: 0.26, research: 0.22, gap: 0.24, spend: 0.18, decide: 0.10 };
  const logSum = Object.keys(weights)
    .reduce((acc, k) => acc + weights[k] * Math.log(Math.max(0.05, factors[k])), 0);
  const score = Math.round(clamp01(Math.exp(logSum) * market) * 100);

  const band = score >= BANDS.HOT ? "HOT" : score >= BANDS.WARM ? "WARM" : score >= BANDS.COOL ? "COOL" : "LOW";
  return { score, band, factors, reasons, flags, industryNote: prior.note };
}

/** Lowercase an industry label without mangling acronyms. */
export const industryPhrase = (label = "") =>
  label.split(" ").map(w => /^(HVAC|B2B)$/i.test(w) ? w.toUpperCase() : w.toLowerCase()).join(" ");

export const industrySentence = (label = "") =>
  industryPhrase(label).replace(/^./, c => c.toUpperCase());

export function playbook(band) {
  return {
    HOT:  { priority: "Call today", why: "High ticket, research-driven buyers, and visibly no coverage. This is the profile the program was built for." },
    WARM: { priority: "Call this week", why: "Good fit on most dimensions. Usually one factor is soft — check the flags before the call." },
    COOL: { priority: "Nurture, do not chase", why: "Real but slower. Let the follow-up sequence do the work and revisit if they engage." },
    LOW:  { priority: "Do not pursue", why: "Ticket size or buying behaviour makes the maths hard. Chasing these costs more than they return." },
  }[band];
}
