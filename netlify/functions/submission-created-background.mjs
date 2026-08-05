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
import { scoreLead, playbook, industryPhrase } from "../../scripts/icp.mjs";
import {
  CAL, SITE, ALERT_TO, leadStore, emailKey, sendEmail, layout,
  unsubUrlFor, toText, esc, isSuppressed,
} from "./_shared.mjs";

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
    const findingsHtml = findings.length
      ? `<p>Three things stood out looking at your site:</p><ul>${findings.map(f => `<li>${esc(f)}</li>`).join("")}</ul>`
      : `<p>You did not include a website, so I could not look at what you have today. Reply with the URL and I will send the site-specific half of this.</p>`;

    const body = `
<h1>Your ${esc(where)} snapshot, ${esc(first)}</h1>
<p>Thanks for the request. Here is the short version, based on your site and what buyers in your category actually search for.</p>
${findingsHtml}
<div class="note">None of this is a criticism of the business — it is the normal state of almost every ${esc(industryPhrase(lead.industry))} website. It is only worth mentioning because it is fixable, and because the businesses that fix it stop competing on price.</div>
<p>The pattern in ${esc(where)} is the one we see nearly everywhere: the highest-intent local questions are answered by national directories and lead marketplaces. They cannot do the work. They capture the searcher and sell the enquiry on — often the same enquiry, to three of you.</p>
<p>If you want the longer version, this is the guide that covers your situation directly:</p>
<p><a class="btn" href="${SITE}/blog/${guideSlug}">${esc(guideTitle)}</a></p>
<p>And if it is easier to just talk it through, my calendar is open. Thirty minutes, no pitch — I will tell you honestly if this is the wrong answer for you.</p>
<p><a class="btn" href="${CAL}">Book 30 minutes</a></p>
<p class="sig">— Dean<br>ClearPath Content</p>`;

    const html = layout({ body, unsubUrl: unsub, preheader: findings[0] || `What ${where} is searching for` });
    const r = await sendEmail({
      to: lead.email,
      subject: findings.length
        ? `${first} — what I found on your site`
        : `Your ${where} snapshot`,
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
