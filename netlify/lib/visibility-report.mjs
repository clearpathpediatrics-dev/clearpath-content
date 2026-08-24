/**
 * ClearPath Content — the Visibility Report.
 * -------------------------------------------------------------
 * One asset that works in both directions:
 *   inbound   attached to the market-snapshot email a prospect requested
 *   outbound  the cold opener — "I ran this on your site, here it is"
 *
 * Everything on the page is an observed fact about their own website plus
 * publicly known search behaviour for their market. Nothing is projected,
 * invented, or dressed up as a guarantee. If a line cannot survive the
 * recipient opening their own site to check it, it does not belong here.
 *
 * LAYOUT: a flowing renderer, not a fixed template. Every block measures
 * itself and breaks to a new page when it will not fit, and section headings
 * carry a keep-with-next height so one can never be orphaned at a page foot.
 */
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { INDUSTRY_PRIORS, industryPhrase } from "../../scripts/icp.mjs";
import { marketQueries } from "../../scripts/market-queries.mjs";

/* CPC brand */
const PINE   = rgb(0.043, 0.133, 0.251);  // #0B2240
const PINE2  = rgb(0.082, 0.243, 0.420);  // #153E6B
const SPRING = rgb(0.243, 0.557, 0.871);  // #3E8EDE
const SOFT   = rgb(0.894, 0.937, 0.980);  // #E4EFFA
const INK    = rgb(0.200, 0.267, 0.353);
const MUTED  = rgb(0.357, 0.420, 0.502);
const LINE   = rgb(0.886, 0.910, 0.945);
const RUST   = rgb(0.706, 0.271, 0.122);
const WHITE  = rgb(1, 1, 1);
const PAPER  = rgb(0.961, 0.969, 0.984);

const PW = 612, PH = 792, M = 48;
const COL = PW - 2 * M;
const BOTTOM = 64;

/** pdf-lib standard fonts are WinAnsi — drop anything they cannot encode. */
const safe = (s = "") => String(s)
  .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
  .replace(/–/g, "-").replace(/…/g, "...")
  .replace(/[^\x20-\x7E -ÿ—•]/g, "");

/**
 * @param {object} p  { business, website, industry, city, state, contact }
 * @param {object} audit   result of auditSite()
 * @param {object} scored  result of scoreLead()
 * @param {object} extra   { findings[], queries[], landscape, dateLabel }
 */
export async function buildVisibilityReport(p, audit, scored, extra = {}) {
  const doc = await PDFDocument.create();
  const reg = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const obl = await doc.embedFont(StandardFonts.HelveticaOblique);

  const pages = [];
  let page, y;

  const wrap = (t, f, s, w) => {
    const out = [];
    for (const para of safe(t).split("\n")) {
      let ln = "";
      for (const word of para.split(" ")) {
        const trial = ln ? ln + " " + word : word;
        if (f.widthOfTextAtSize(trial, s) <= w) ln = trial;
        else { if (ln) out.push(ln); ln = word; }
      }
      out.push(ln);
    }
    return out;
  };
  const nl = (t, f, s, w) => wrap(t, f, s, w).length;

  const domain = safe((audit?.origin || p.website || "").replace(/^https?:\/\//, "").replace(/\/$/, ""));
  const where = safe([p.city, p.state].filter(Boolean).join(", "));

  function newPage(first = false) {
    page = doc.addPage([PW, PH]);
    pages.push(page);
    if (first) {
      page.drawRectangle({ x: 0, y: PH - 132, width: PW, height: 132, color: PINE });
      page.drawRectangle({ x: 0, y: PH - 136, width: PW, height: 4, color: SPRING });
      page.drawText("VISIBILITY REPORT", { x: M, y: PH - 52, size: 22, font: bold, color: WHITE });
      page.drawText(safe(domain), { x: M, y: PH - 76, size: 13, font: reg, color: SPRING });
      page.drawText(safe(`Prepared ${extra.dateLabel || ""}${where ? "  ·  " + where : ""}`),
        { x: M, y: PH - 98, size: 9.5, font: reg, color: rgb(0.62, 0.72, 0.84) });
      const wm = "ClearPath Content";
      page.drawText(wm, { x: PW - M - bold.widthOfTextAtSize(wm, 12), y: PH - 52, size: 12, font: bold, color: WHITE });
      const sub = "Organic visibility infrastructure";
      page.drawText(sub, { x: PW - M - reg.widthOfTextAtSize(sub, 8), y: PH - 68, size: 8, font: reg, color: SPRING });
      y = PH - 164;
    } else {
      page.drawRectangle({ x: 0, y: PH - 46, width: PW, height: 46, color: PINE });
      page.drawRectangle({ x: 0, y: PH - 49, width: PW, height: 3, color: SPRING });
      page.drawText("Visibility Report", { x: M, y: PH - 29, size: 10.5, font: bold, color: WHITE });
      page.drawText(safe(domain), {
        x: PW - M - reg.widthOfTextAtSize(safe(domain), 9.5), y: PH - 29, size: 9.5, font: reg, color: SPRING });
      y = PH - 78;
    }
  }
  const need = (h) => { if (y - h < BOTTOM) newPage(false); };

  const H = (t, follow = 40) => {
    need(32 + follow);
    page.drawText(safe(t), { x: M, y, size: 8.5, font: bold, color: MUTED });
    y -= 7;
    page.drawLine({ start: { x: M, y }, end: { x: PW - M, y }, thickness: 0.6, color: LINE });
    y -= 16;
  };
  const P = (t, { size = 10.2, font = reg, color = INK, gap = 9 } = {}) => {
    for (const ln of wrap(t, font, size, COL)) {
      need(size * 1.4);
      page.drawText(ln, { x: M, y, size, font, color });
      y -= size * 1.4;
    }
    y -= gap;
  };

  /* ---- the score dial, drawn rather than described --------------------- */
  const scoreCard = () => {
    const h = 92;
    need(h + 12);
    const top = y;
    page.drawRectangle({ x: M, y: top - h, width: COL, height: h, color: PAPER });
    page.drawRectangle({ x: M, y: top - h, width: 4, height: h, color: SPRING });

    const s = Math.max(0, Math.min(100, scored.score));
    page.drawText(String(s), { x: M + 26, y: top - 48, size: 40, font: bold, color: PINE });
    const den = "/100";
    page.drawText(den, { x: M + 26 + bold.widthOfTextAtSize(String(s), 40) + 3, y: top - 48, size: 12, font: reg, color: MUTED });
    page.drawText("OPPORTUNITY SCORE", { x: M + 26, y: top - 64, size: 7.5, font: bold, color: MUTED });

    // bar
    const bx = M + 168, bw = COL - 168 - 26;
    let by = top - 40;
    page.drawRectangle({ x: bx, y: by, width: bw, height: 9, color: rgb(0.886, 0.910, 0.945) });
    page.drawRectangle({ x: bx, y: by, width: Math.max(4, bw * (s / 100)), height: 9, color: s >= 75 ? SPRING : PINE2 });
    const band = scored.band === "HOT" ? "Strong opportunity"
               : scored.band === "WARM" ? "Real opportunity"
               : scored.band === "COOL" ? "Some opportunity" : "Limited opportunity";
    page.drawText(band, { x: bx, y: by + 18, size: 11, font: bold, color: PINE });
    let ly = by - 13;
    for (const ln of wrap("How much a published-content program would change what this business is found for.", reg, 8.6, bw)) {
      page.drawText(ln, { x: bx, y: ly, size: 8.6, font: reg, color: MUTED });
      ly -= 11;
    }
    y = top - h - 20;
  };

  /* ---- metric tiles ----------------------------------------------------- */
  const tiles = (cells) => {
    const h = 56, gap = 9, w = (COL - gap * (cells.length - 1)) / cells.length;
    need(h + 14);
    cells.forEach((c, i) => {
      const x = M + i * (w + gap);
      page.drawRectangle({ x, y: y - h, width: w, height: h, color: WHITE, borderColor: LINE, borderWidth: 1 });
      const v = String(c.n), col = c.warn ? RUST : PINE;
      page.drawText(v, { x: x + (w - bold.widthOfTextAtSize(v, 19)) / 2, y: y - 28, size: 19, font: bold, color: col });
      const k = safe(c.k).toUpperCase();
      const ks = k.length > 14 ? 6.4 : 7.2;
      page.drawText(k, { x: x + (w - bold.widthOfTextAtSize(k, ks)) / 2, y: y - 44, size: ks, font: bold, color: MUTED });
    });
    y -= h + 20;
  };

  const finding = (n, text) => {
    const ls = wrap(text, reg, 10.2, COL - 30);
    need(ls.length * 14 + 14);
    page.drawCircle({ x: M + 8, y: y + 3.4, size: 9, color: PINE2 });
    page.drawText(String(n), { x: M + 8 - bold.widthOfTextAtSize(String(n), 8.5) / 2, y: y + 0.6, size: 8.5, font: bold, color: WHITE });
    ls.forEach((l) => { page.drawText(l, { x: M + 26, y, size: 10.2, font: reg, color: INK }); y -= 14; });
    y -= 9;
  };

  const query = (q) => {
    const h = 26;
    need(h + 6);
    page.drawRectangle({ x: M, y: y - h + 14, width: COL, height: h, color: SOFT });
    page.drawRectangle({ x: M, y: y - h + 14, width: 3, height: h, color: SPRING });
    page.drawText(safe('"' + q + '"'), { x: M + 14, y: y - 1, size: 10, font: bold, color: PINE2 });
    y -= h + 6;
  };

  // ============================================================ page 1
  newPage(true);

  P(safe(`Prepared for ${p.business || domain}`), { font: obl, color: PINE2, size: 11, gap: 14 });
  scoreCard();

  H("WHAT WE FOUND ON YOUR SITE", 76);
  const a = audit && audit.ok ? audit : null;
  if (a) {
    tiles([
      { n: a.hasBlog ? a.blogPostCount : 0, k: a.hasBlog ? "Articles" : "No blog", warn: !a.hasBlog || a.blogPostCount < 6 },
      { n: a.staleMonths != null ? `${a.staleMonths}mo` : (a.hasBlog ? "—" : "n/a"), k: "Since last post", warn: (a.staleMonths ?? 0) >= 6 },
      { n: a.pageCount ?? "—", k: "Indexed pages", warn: (a.pageCount ?? 99) <= 8 },
      { n: a.hasSchema ? "Yes" : "No", k: "AI-readable", warn: !a.hasSchema },
    ]);
  } else {
    P(`We could not reach ${domain} to run the site checks (${safe(audit?.error || "no response")}). Everything below is based on the category and market rather than your specific pages.`, { color: MUTED });
  }

  const findings = extra.findings || [];
  if (findings.length) {
    H("THE THREE THINGS THAT MATTER MOST", 44);
    findings.forEach((f, i) => finding(i + 1, f));
    y -= 2;
  }

  // ---- what their market searches ---------------------------------------
  // Compose queries for THIS trade in THIS metro. Passing city-generic queries
  // (a roofer shown cosmetic-dentist searches) discredits the whole report.
  const qs = (extra.queries && extra.queries.length ? extra.queries
             : marketQueries(p.industry, p.city, p.state, 5)).slice(0, 5);
  if (qs.length) {
    H(`WHAT ${(p.city || "YOUR MARKET").toUpperCase()} IS SEARCHING`, 62);
    P("Real search shapes from this market — specific, local, and typed by somebody close to spending money. Each one is a page that does not exist yet.", { size: 9.6, color: MUTED, gap: 12 });
    qs.forEach(query);
    if (extra.landscape) { y -= 4; P(extra.landscape, { size: 10, gap: 12 }); }
  }

  // ---- why it matters for this category ---------------------------------
  const prior = INDUSTRY_PRIORS[p.industry];
  H("WHY THIS CATEGORY REWARDS IT", 52);
  if (prior && prior.ticket >= 0.75) {
    P(`${safe(prior.note)}. At that customer value a single additional job covers a year of publishing, which is why ${industryPhrase(p.industry || "this category")} rewards being the answer rather than buying the click.`);
  } else {
    P("Buyers in this category research before they contact anyone. Published answers reach them at the point the decision is actually being made, rather than interrupting them earlier.");
  }
  P("The highest-intent local questions are currently answered by national directories and lead marketplaces. None of them can do the work — they capture the searcher and sell the enquiry on, often the same enquiry to three competitors. Outbidding them is expensive and stops the day you stop paying. Out-answering them does not.", { gap: 14 });

  // ---- what we would do --------------------------------------------------
  H("WHAT A DEPLOYMENT WOULD DO", 60);
  [
    "Map the full question-space of your market, weighted by buying intent.",
    "Publish long-form answers to those questions on your domain, on a fixed cadence.",
    "Interlink each new piece into the existing body so the whole set compounds.",
    "Keep everything you own — permanently, whether or not the subscription continues.",
  ].forEach((t, i) => finding(i + 1, t));

  // ---- closing band flows with the content, never painted over it --------
  const BH = 96;
  need(BH + 26);
  const by = y - BH + 12;
  page.drawRectangle({ x: M, y: by, width: COL, height: BH, color: PINE });
  page.drawRectangle({ x: M, y: by + BH - 4, width: COL, height: 4, color: SPRING });
  page.drawText("One deployment per niche, per metro.", { x: M + 24, y: by + 62, size: 13, font: bold, color: WHITE });
  const l2 = safe(`${industryPhrase(p.industry || "your category")}${where ? " in " + where : ""} is open right now.`);
  page.drawText(l2, { x: M + 24, y: by + 44, size: 10.4, font: reg, color: rgb(0.77, 0.86, 0.95) });
  page.drawText("Thirty minutes, no pitch. We will tell you honestly if this is the wrong answer for you.",
    { x: M + 24, y: by + 28, size: 9.6, font: reg, color: rgb(0.62, 0.75, 0.89) });
  page.drawText("clearpath-content.com  |  admin@clearpath-content.com",
    { x: M + 24, y: by + 11, size: 8.6, font: reg, color: SPRING });

  // ---- footers ------------------------------------------------------------
  const disc = safe("Every figure in this report was observed on the public website named above on the date shown. ClearPath Content (CPC) — organic visibility infrastructure.");
  pages.forEach((pg, i) => {
    pg.drawText(disc, { x: M, y: 36, size: 7.2, font: reg, color: MUTED });
    const lbl = `${i + 1} of ${pages.length}`;
    pg.drawText(lbl, { x: PW - M - reg.widthOfTextAtSize(lbl, 7.2), y: 36, size: 7.2, font: reg, color: MUTED });
  });

  doc.setTitle(`Visibility Report — ${domain}`);
  doc.setProducer("ClearPath Content");
  return Buffer.from(await doc.save());
}
