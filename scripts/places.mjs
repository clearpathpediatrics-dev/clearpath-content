/**
 * ClearPath Content — Google Places (New) client.
 * -------------------------------------------------------------
 * The top of the outbound funnel. Given a category and a metro, returns the
 * businesses Google knows about: name, website, phone, address, rating.
 *
 * Uses the Places API (New) `searchText` endpoint. The field mask is the whole
 * billing story — you are charged per request according to the most expensive
 * field you ask for, so we ask for exactly what the pipeline uses and nothing
 * else. websiteUri and nationalPhoneNumber put us in the Pro tier.
 *
 *   GOOGLE_PLACES_API_KEY   required
 *
 * Cost, roughly: Text Search Pro is ~$32/1000 requests. One request returns up
 * to 20 places; three pages exhausts a query at 60. A full sweep of 48 metros
 * x 12 categories x 3 pages is ~1,700 requests — call it $55 for a national
 * prospect list. Re-running only to top up costs a fraction of that.
 */

const ENDPOINT = "https://places.googleapis.com/v1/places:searchText";

/** Exactly the fields the audit and scoring pipeline consumes. */
const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.websiteUri",
  "places.nationalPhoneNumber",
  "places.formattedAddress",
  "places.rating",
  "places.userRatingCount",
  "places.businessStatus",
  "places.primaryTypeDisplayName",
  "nextPageToken",
].join(",");

/**
 * The search phrase each ICP industry label maps to. These are written the way
 * a customer would search, not the way a taxonomy would classify — that is what
 * makes Places return operating businesses rather than trade associations.
 */
export const INDUSTRY_QUERIES = {
  "Roofing / Contracting": ["roofing contractor", "general contractor"],
  "Law firm": ["personal injury lawyer", "family law attorney", "estate planning attorney"],
  "B2B software": ["software company"],
  "Real estate": ["real estate agency"],
  "Dental practice": ["dentist", "orthodontist"],
  "HVAC": ["hvac contractor", "air conditioning repair"],
  "Electrical": ["electrician"],
  "Plumbing": ["plumber"],
  "Home services": ["remodeling contractor", "landscaping company"],
  "Professional services": ["accounting firm", "insurance agency"],
  "Pest control": ["pest control service"],
};

/** Categories worth sourcing first — highest ICP ticket x research scores. */
export const PRIORITY_INDUSTRIES = [
  "Roofing / Contracting", "Law firm", "HVAC", "Dental practice",
  "Real estate", "Professional services", "Home services", "Electrical",
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/**
 * One page of results. Never throws — a failed query should skip a cell in the
 * sweep, not abort a two-hour run.
 * @returns {{ok:boolean, places:object[], nextPageToken?:string, error?:string}}
 */
async function searchPage(textQuery, { apiKey, pageToken, pageSize = 20 }) {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify({
        textQuery,
        pageSize,
        ...(pageToken ? { pageToken } : {}),
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, places: [], error: body?.error?.message || `places ${res.status}` };
    }
    return { ok: true, places: body.places || [], nextPageToken: body.nextPageToken };
  } catch (e) {
    return { ok: false, places: [], error: String(e.message || e) };
  }
}

const cleanDomain = (uri) => {
  if (!uri) return null;
  try {
    const h = new URL(uri).hostname.toLowerCase().replace(/^www\./, "");
    // Social profiles and page builders are not the business's own site.
    if (/(facebook|instagram|linkedin|yelp|google|angi|thumbtack|nextdoor|bbb)\.(com|org)$/.test(h)) return null;
    return h;
  } catch { return null; }
};

/**
 * Search one category in one metro, following pagination up to `max` results.
 *
 * @param {string} query    e.g. "hvac contractor"
 * @param {string} where    e.g. "Mesa, AZ"
 * @param {object} opts     { apiKey, max = 60 }
 * @returns {{ok:boolean, results:object[], error?:string, requests:number}}
 */
export async function searchBusinesses(query, where, opts = {}) {
  const apiKey = opts.apiKey || process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return { ok: false, results: [], error: "GOOGLE_PLACES_API_KEY not set", requests: 0 };

  const max = opts.max ?? 60;
  const textQuery = `${query} in ${where}`;
  const out = [];
  let pageToken, requests = 0, error;

  while (out.length < max) {
    const page = await searchPage(textQuery, { apiKey, pageToken, pageSize: Math.min(20, max - out.length) });
    requests++;
    if (!page.ok) { error = page.error; break; }

    for (const p of page.places) {
      // Closed businesses are noise, and a prospect with no website has nothing
      // for the audit to look at — which is the entire basis of the outreach.
      if (p.businessStatus && p.businessStatus !== "OPERATIONAL") continue;
      const domain = cleanDomain(p.websiteUri);
      if (!domain) continue;

      out.push({
        placeId: p.id,
        business: p.displayName?.text || "",
        website: p.websiteUri,
        domain,
        phone: p.nationalPhoneNumber || "",
        address: p.formattedAddress || "",
        rating: p.rating ?? null,
        reviews: p.userRatingCount ?? 0,
        placeType: p.primaryTypeDisplayName?.text || "",
      });
    }

    if (!page.nextPageToken) break;
    pageToken = page.nextPageToken;
    // The API needs a moment before a page token becomes valid.
    await sleep(1200);
  }

  return { ok: !error || out.length > 0, results: out.slice(0, max), error, requests };
}

/**
 * Sweep many category/metro pairs, deduplicating by domain across the whole
 * run. `onProgress({done, total, cell, found})` is called after each cell.
 */
export async function sweep(cells, opts = {}) {
  const seen = new Set(opts.knownDomains || []);
  const results = [];
  let requests = 0;
  const errors = [];

  for (const [i, cell] of cells.entries()) {
    const r = await searchBusinesses(cell.query, cell.where, opts);
    requests += r.requests;
    if (r.error) errors.push(`${cell.query} / ${cell.where}: ${r.error}`);

    let found = 0;
    for (const biz of r.results) {
      if (seen.has(biz.domain)) continue;
      seen.add(biz.domain);
      results.push({
        ...biz,
        industry: cell.industry,
        city: cell.city,
        state: cell.state,
        source: `places:${cell.industry}:${cell.where}`,
      });
      found++;
    }
    opts.onProgress?.({ done: i + 1, total: cells.length, cell, found, total_found: results.length });
  }

  return { results, requests, errors };
}
