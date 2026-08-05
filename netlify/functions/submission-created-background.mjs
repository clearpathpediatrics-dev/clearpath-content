/**
 * Fires automatically when the market-snapshot form is submitted.
 * -------------------------------------------------------------
 *   1. Audits the submitter's public website
 *   2. Scores them against the ICP model
 *   3. Emails them a real snapshot with findings from their own site
 *   4. Emails Dean a scored alert saying who to call and why
 *   5. Stores the lead and queues the follow-up sequence
 *
 * Background function: 15-minute ceiling, so the audit's network calls are
 * safe here. Netlify's own submission notification is unaffected and still
 * fires — this runs alongside it, not instead of it.
 */
import { auditSite, headlineFindings } from "../../scripts/site-audit.mjs";
import { scoreLead, playbook, industryPhrase, industrySentence, INDUSTRY_PRIORS } from "../../scripts/icp.mjs";
import { CITIES } from "../../scripts/hubs.data.mjs";
import {
  CAL, SITE, ALERT_TO, leadStore, emailKey, sendEmail, layout, statStrip, ctaBand,
  unsubUrlFor, toText, esc, isSuppressed,
} from "../lib/shared.mjs";

const GUIDE_FOR = {
  "HVAC": ["local-seo-guide", "Local Search Visibility for Service Businesses"],
  "Plumbing": ["local-seo-guide", "Local Search Visibility for Service Businesses"],
  "Electrical": ["local-seo-guide", "Local Search Visibility for Service Businesses"],
  "Roofing / Contracting": ["local-seo-guide", "Local Search Visibility for Service Businesses"],
  "Pest control": ["local-seo-guide", "Local Search Visibility for Service Businesses"],
  "Home services": ["local-seo-guide", "Local Search Visibility for Service Businesses"],
  "Law firm": ["organic-visibility-guide", "How Organic Visibility Actually Compounds"],
  "Dental practice": ["organic-visibility-guide", "How Organic Visibility Actually Compounds"],
  "Real estate": ["organic-visibility-guide", "How Organic Visibility Actually Compounds"],
  "Professional services": ["content-marketing-roi", "Measuring Content Marketing ROI"],
  "B2B software": ["ai-search-optimization-guide", "AI Search Optimization"],
  "Other": ["organic-visibility-guide", "How Organic Visibility Actually Compounds"],
};

export default async function handler(req) {
  let payload;
  try {
    const body = await req.json();
    payload = body?.payload ?? body;
  } catch {
    return new Response("bad payload", { status: 400 });
  }

  const d = payload?.data || {};
  if (payload?.form_name && payload.form_name !== "market-snapshot") {
    return new Response("ignored", { status: 200 });
  }
  if (d["bot-field"]) return new Response("bot", { status: 200 });

  const lead = {
    name: (d.name || "").trim(),
    email: emailKey(d.email),
    industry: (d.industry || "Other").trim(),
    city: (d.city || "").trim(),
    state: (d.state || "").trim(),
    website: (d.website || "").trim(),
    submittedAt: new Date().toISOString(),
  };
  if (!lead.email) return new Response("no email", { status: 200 });

  // --- audit + score ------------------------------------------------------
  let audit = null;
  if (lead.website) {
    try { audit = await auditSite(lead.website, { city: lead.city }); }
    catch (e) { audit = { ok: false, error: String(e.message || e) }; }
  }
  const scored = scoreLead(lead, audit);
  const findings = headlineFindings(audit, { city: lead.city });
  const play = playbook(scored.band);
  const [guideSlug, guideTitle] = GUIDE_FOR[lead.industry] || GUIDE_FOR.Other;

  // --- store --------------------------------------------------------------
  const record = {
    ...lead,
    score: scored.score, band: scored.band,
    reasons: scored.reasons, flags: scored.flags,
    audit: audit && audit.ok ? {
      hasBlog: audit.hasBlog, blogPostCount: audit.blogPostCount, staleMonths: audit.staleMonths,
      pageCount: audit.pageCount, hasSchema: audit.hasSchema,
      paidLeadSignals: audit.paidLeadSignals, mentionsCity: audit.mentionsCity,
    } : { error: audit?.error || "no website supplied" },
    findings, guideSlug,
    source: "inbound:market-snapshot",
    stage: 0,
    nextTouchAt: new Date(Date.now() + 3 * 864e5).toISOString(),
    closed: false,
    history: [{ at: lead.submittedAt, event: "submitted" }],
  };
  try { await leadStore().set(lead.email, JSON.stringify(record)); } catch { /* keep going — the emails matter more */ }

  const first = lead.name.split(/\s+/)[0] || "there";
  const where = lead.city ? `${lead.city}${lead.state ? ", " + lead.state : ""}` : "your market";
  const unsub = unsubUrlFor(lead.email);

  // --- email the lead -----------------------------------------------------
  if (!(await isSuppressed(lead.email))) {
    const a = audit && audit.ok ? audit : null;

    // Metrics strip — only real numbers, only when we actually looked.
    const cells = a ? [
      { n: a.hasBlog ? a.blogPostCount : 0, k: a.hasBlog ? "Articles" : "No blog", warn: !a.hasBlog || a.blogPostCount < 6 },
      { n: a.staleMonths != null ? `${a.staleMonths}mo` : (a.hasBlog ? "—" : "n/a"), k: "Since last post", warn: (a.staleMonths ?? 0) >= 6 },
      { n: a.pageCount ?? "—", k: "Indexed pages", warn: (a.pageCount ?? 99) <= 8 },
      { n: a.hasSchema ? "Yes" : "No", k: "AI-readable", warn: !a.hasSchema },
    ] : [];

    // The real queries this market types, straight off their own city page.
    const metro = CITIES.find(c =>
      c.city.toLowerCase() === lead.city.toLowerCase() ||
      (lead.city && c.city.toLowerCase().includes(lead.city.toLowerCase())));
    const queryBlock = metro ? `
<h2>What ${esc(metro.city)} is typing right now</h2>
<p>Real search shapes from this market — specific, local, and asked by someone close to spending money:</p>
${metro.queries.slice(0, 5).map(q => `<div class="q"><b>&ldquo;${esc(q)}&rdquo;</b></div>`).join("")}
<p style="margin-top:16px">${esc(metro.landscape)}</p>
<p><a href="${SITE}/${metro.slug}">See the full ${esc(metro.city)} breakdown &rarr;</a></p>` : "";

    const findingsHtml = findings.length
      ? `<h2>What stood out on your site</h2><ul>${findings.map(f => `<li>${esc(f)}</li>`).join("")}</ul>`
      : `<p>You did not include a website, so I could not look at what you have today. Reply with the URL and I will send the site-specific half of this.</p>`;

    const prior = INDUSTRY_PRIORS[lead.industry];
    const mathLine = prior && prior.ticket >= 0.75
      ? `<div class="note"><strong>Why the maths works here.</strong> ${esc(prior.note)}. At that customer value, a single additional job covers a year of publishing — which is why this category rewards being the answer rather than buying the click.</div>`
      : "";

    const body = `
<h1>Your ${esc(where)} snapshot, ${esc(first)}</h1>
<p>Thanks for the request. This is built from two things: what is actually on ${a ? `<a href="${esc(a.origin)}">${esc(a.origin.replace(/^https?:\/\//, ""))}</a>` : "your site"} right now, and what buyers in ${esc(where)} are searching before they call anyone.</p>
${a ? `<h2>Your site today</h2>${statStrip(cells)}` : ""}
${findingsHtml}
${mathLine}
${queryBlock}
<h2>Why those results are not yours</h2>
<p>The highest-intent local questions in ${esc(where)} are answered by national directories and lead marketplaces. None of them can do the work. They capture the searcher and sell the enquiry on &mdash; often the same enquiry, to three of you.</p>
<p>Outbidding them is expensive and stops the day you stop paying. Out-answering them does not. What something costs here, how local permitting works, what the housing stock does &mdash; a national page cannot write any of it credibly, and most of your competitors have not tried.</p>
<h2>If you want the long version</h2>
<p>This guide covers your situation specifically, and it is free whether or not we ever speak:</p>
<p><a class="btn" href="${SITE}/blog/${guideSlug}">${esc(guideTitle)}</a></p>
<p class="sig">&mdash; Dean<br>ClearPath Content</p>`;

    const html = layout({
      body, unsubUrl: unsub,
      preheader: findings[0] || `What ${where} is searching for`,
      band: ctaBand(
        `One deployment per niche, per metro. ${industrySentence(lead.industry)} in ${where} is open right now.`,
        CAL, "Book 30 minutes"),
    });
    const r = await sendEmail({
      to: lead.email,
      subject: findings.length ? `${first} — what I found on your site` : `Your ${where} snapshot`,
      html, text: toText(html), replyTo: ALERT_TO, tag: "inbound-snapshot",
    });
    record.history.push({ at: new Date().toISOString(), event: r.sent ? "snapshot-sent" : `snapshot-failed:${r.error}` });
  }

  // --- alert Dean ---------------------------------------------------------
  const rows = (label, items) => items.length
    ? `<p style="margin:0 0 6px"><strong>${label}</strong></p><ul>${items.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : "";

  const alertBody = `
<h1>${scored.band} · ${scored.score}/100 — ${esc(lead.name || lead.email)}</h1>
<div class="note"><strong>${esc(play.priority)}.</strong> ${esc(play.why)}</div>
<p>
  <strong>${esc(lead.industry)}</strong> · ${esc(where)}<br>
  ${esc(lead.email)}${lead.website ? ` · <a href="${esc(lead.website.startsWith("http") ? lead.website : "https://" + lead.website)}">${esc(lead.website)}</a>` : " · no website given"}
</p>
${rows("Why they score well", scored.reasons)}
${rows("Watch out for", scored.flags)}
${audit && audit.ok ? `<p style="font-size:14px;color:#5B6B80">Audit: ${audit.hasBlog ? `blog with ~${audit.blogPostCount} posts` : "no blog"}${audit.staleMonths != null ? `, last post ~${audit.staleMonths}mo ago` : ""} · ~${audit.pageCount} pages · schema ${audit.hasSchema ? "yes" : "no"}${audit.paidLeadSignals.length ? ` · buying leads via ${esc(audit.paidLeadSignals.join(", "))}` : ""}</p>` : `<p style="font-size:14px;color:#5B6B80">Audit unavailable: ${esc(audit?.error || "no website supplied")}</p>`}
<p style="font-size:14px;color:#5B6B80">Their snapshot email has already gone out. Follow-up 1 is queued for three days from now and stops automatically if they book or reply.</p>`;

  await sendEmail({
    to: ALERT_TO,
    subject: `[${scored.band} ${scored.score}] ${lead.industry} — ${where}${lead.name ? " — " + lead.name : ""}`,
    html: layout({ body: alertBody }), text: toText(alertBody), replyTo: lead.email, tag: "internal-alert",
  });

  try { await leadStore().set(lead.email, JSON.stringify(record)); } catch { /* best effort */ }
  return new Response("ok", { status: 200 });
}
