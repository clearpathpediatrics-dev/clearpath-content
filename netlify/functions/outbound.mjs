/**
 * The cold sequence — automated outbound to human-approved prospects.
 * -------------------------------------------------------------
 * Runs six times across the working day rather than once, because fifty emails
 * leaving in the same second is the single clearest bulk-sender signal there
 * is. Each run takes a slice of the daily allowance.
 *
 *   touch 1   the finding from their own site, and what it costs them
 *   touch 2   +4 days — the guide for their category, no ask at all
 *   touch 3   +9 days — close the loop, then silence forever
 *
 * Three hard gates before anything sends:
 *
 *   1. CPC_COLD_FROM_EMAIL must be set — a separate, warmed sending domain.
 *      Unset means cold sending is off, which is the default.
 *   2. CPC_COLD_START_DATE must be set — drives the warmup ramp. A brand new
 *      domain that starts at fifty a day gets filtered before it gets read.
 *   3. The prospect must be status APPROVED — a human pressed "start sequence"
 *      in the dialer. Nothing sources itself into an inbox.
 *
 * It stops permanently on reply, booking, unsubscribe, or completion.
 */
import {
  allProspects, putProspect, STATUS, TERMINAL, meterGet, meterBump,
} from "../lib/prospects.mjs";
import { industryPhrase } from "../../scripts/icp.mjs";
import {
  CAL, SITE, ALERT_TO, COLD_FROM, sendEmail, layout, ctaBand,
  unsubUrlFor, toText, esc, isSuppressed,
} from "../lib/shared.mjs";

// 15:00–20:00 UTC is 8am–1pm in Phoenix. Weekdays only — a cold email that
// lands on a Sunday reads as automation no matter how well it is written.
export const config = { schedule: "0 15,16,17,18,19,20 * * 1-5" };

const RUNS_PER_DAY = 6;
const GAP_DAYS = [4, 9];   // touch 1 -> 2 is 4 days, 2 -> 3 is another 9

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

/**
 * Warmup ramp. A new domain earns volume; it does not start with it.
 * Weeks 1-5: 10, 20, 35, 50, 65 a day, then the configured ceiling.
 */
export function dailyCap(now = Date.now()) {
  const start = process.env.CPC_COLD_START_DATE;
  if (!start) return 0;
  const t = Date.parse(start);
  if (Number.isNaN(t)) return 0;
  const days = Math.floor((now - t) / 864e5);
  if (days < 0) return 0;
  const ramp = [10, 20, 35, 50, 65];
  const week = Math.floor(days / 7);
  const ceiling = Number(process.env.CPC_COLD_DAILY_MAX || 75);
  return Math.min(week < ramp.length ? ramp[week] : ceiling, ceiling);
}

/* ---------------------------------------------------------------- touches */

const TOUCHES = [
  // ---- 1: the finding ----------------------------------------------------
  (p) => {
    const f = (p.findings || [])[0];
    const paid = p.audit?.paidLeadSignals?.length ? p.audit.paidLeadSignals.join(" and ") : null;
    return {
      subject: f && /no blog|roughly \d+ post/i.test(f)
        ? `${p.business || p.domain} — nothing published`
        : paid ? `${p.business || p.domain} — paying for shared leads`
        : `Something I noticed on ${p.business || p.domain}'s site`,
      body: `
<p>Hi${p.contact ? " " + esc(p.contact.split(/\s+/)[0]) : ""},</p>
<p>I look at ${esc(industryPhrase(p.industry))} websites in ${esc(p.where)} for a living, and I spent a few minutes on <a href="${esc(p.site)}">${esc(p.domain)}</a>.</p>
${f ? `<div class="note">${esc(f)}</div>` : ""}
${paid
  ? `<p>The reason it matters: you are already paying per lead through ${esc(paid)}, and those enquiries are routinely sold to two or three of your competitors at the same time. You are competing on response speed for a customer you already paid for.</p>`
  : `<p>The reason it matters: when someone in ${esc(p.where)} searches the thing you actually get paid for, the results are usually held by directories and lead marketplaces. They cannot do the work — they capture the enquiry and sell it on.</p>`}
<p>I run a program that fixes exactly that. Published answers to the questions your buyers are already typing, on your own domain, on a fixed schedule. Everything stays yours permanently.</p>
<p>One business per category, per metro — ${esc(industryPhrase(p.industry))} in ${esc(p.where)} is open at the moment.</p>
<p><a class="btn" href="${CAL}">Book fifteen minutes</a></p>
<p class="sig">— Dean<br>ClearPath Content</p>`,
    };
  },
  // ---- 2: the guide, no ask ----------------------------------------------
  (p) => ({
    subject: `The long version, if it is useful`,
    body: `
<p>No pitch in this one.</p>
<p>Whether or not we ever speak, the mechanics here are worth understanding — and most of what is written about it online is written to sell software. This is the version I would want if I ran a ${esc(industryPhrase(p.industry))} business:</p>
<p><a class="btn" href="${SITE}/blog/${esc(p.guideSlug)}">${esc(p.guideTitle)}</a></p>
<p>It covers what actually moves rankings, how long it genuinely takes, and how to tell whether it is working before the revenue shows up. If you read it and decide to do it yourself, that is a completely fine outcome.</p>
<p class="sig">— Dean</p>`,
  }),
  // ---- 3: close the loop --------------------------------------------------
  (p) => ({
    subject: `Closing the loop`,
    body: `
<p>Last one from me — I am not going to keep landing in your inbox.</p>
<p>Two things worth saying before I stop:</p>
<ul>
  <li>Availability is one business per category, per metro. ${esc(p.industrySentence)} in ${esc(p.where)} is open right now. If someone else takes it, I cannot also work with you.</li>
  <li>If the timing is simply wrong, reply with a month and I will get out of the way until then.</li>
</ul>
<p>Otherwise the audit is yours to keep and the guides are free. Good luck with it either way.</p>
<p><a class="btn" href="${CAL}">Book fifteen minutes</a></p>
<p class="sig">— Dean</p>`,
  }),
];

/* -------------------------------------------------------------------- run */

export default async function handler() {
  const summary = { eligible: 0, sent: 0, skipped: 0, finished: 0, cap: 0, sentToday: 0, errors: [] };

  if (!COLD_FROM) {
    console.log("[outbound] CPC_COLD_FROM_EMAIL not set — cold sending is off");
    return Response.json({ ok: true, off: "no cold sending domain configured", ...summary });
  }

  const cap = dailyCap();
  summary.cap = cap;
  if (cap <= 0) {
    console.log("[outbound] CPC_COLD_START_DATE not set or in the future — warmup has not begun");
    return Response.json({ ok: true, off: "warmup not started", ...summary });
  }

  const sentToday = await meterGet("cold-sent");
  summary.sentToday = sentToday;
  // Spread the day's allowance across the runs so nothing goes out in a burst.
  const slice = Math.max(1, Math.ceil(cap / RUNS_PER_DAY));
  const budget = Math.min(slice, cap - sentToday);
  if (budget <= 0) {
    return Response.json({ ok: true, note: "daily cap reached", ...summary });
  }

  let prospects;
  try { prospects = await allProspects(); }
  catch (e) { return Response.json({ ok: false, error: String(e.message || e) }, { status: 500 }); }

  const now = Date.now();
  const due = prospects
    .filter(p => p.email)
    .filter(p => p.status === STATUS.APPROVED || p.status === STATUS.EMAILING)
    .filter(p => !TERMINAL.has(p.status))
    .filter(p => (p.emailStage || 0) < TOUCHES.length)
    .filter(p => p.nextEmailAt && Date.parse(p.nextEmailAt) <= now)
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  summary.eligible = due.length;

  for (const p of due.slice(0, budget)) {
    if (await isSuppressed(p.email)) {
      p.status = STATUS.DEAD;
      p.closedReason = "unsubscribed";
      p.nextEmailAt = null;
      await putProspect(p);
      summary.skipped++;
      continue;
    }

    const [guideSlug, guideTitle] = GUIDE_FOR[p.industry] || GUIDE_FOR.Other;
    const view = {
      ...p,
      where: [p.city, p.state].filter(Boolean).join(", ") || "your market",
      site: p.website || "https://" + p.domain,
      guideSlug, guideTitle,
      industrySentence: industryPhrase(p.industry).replace(/^./, c => c.toUpperCase()),
    };

    const stage = p.emailStage || 0;
    const touch = TOUCHES[stage](view);
    const unsub = unsubUrlFor(p.email);
    const html = layout({
      body: touch.body,
      unsubUrl: unsub,
      preheader: (p.findings || [])[0]?.slice(0, 90) || touch.subject,
      band: stage === 0
        ? ctaBand(`One deployment per category, per metro. ${view.industrySentence} in ${view.where} is open right now.`, CAL, "Book fifteen minutes")
        : "",
    });

    const r = await sendEmail({
      to: p.email, subject: touch.subject, html, text: toText(html),
      from: COLD_FROM, replyTo: ALERT_TO, tag: `cold-${stage + 1}`,
      listUnsubUrl: unsub,
    });

    // Advance regardless of the send result. A transient Resend failure must
    // not put a prospect in a loop that retries every hour for a week.
    p.emailStage = stage + 1;
    p.status = STATUS.EMAILING;
    p.history = [...(p.history || []), {
      at: new Date().toISOString(),
      event: r.sent ? `cold-${p.emailStage}` : `cold-${p.emailStage}-failed:${r.error}`,
    }];

    if (p.emailStage >= TOUCHES.length) {
      p.status = STATUS.DEAD;
      p.closedReason = "sequence-complete";
      p.nextEmailAt = null;
      summary.finished++;
    } else {
      p.nextEmailAt = new Date(now + GAP_DAYS[stage] * 864e5).toISOString();
    }

    await putProspect(p);

    if (r.sent) { summary.sent++; await meterBump("cold-sent"); }
    else summary.errors.push(`${p.email}:${r.error}`);
  }

  console.log("[outbound]", JSON.stringify(summary));
  return Response.json({ ok: true, ...summary });
}
