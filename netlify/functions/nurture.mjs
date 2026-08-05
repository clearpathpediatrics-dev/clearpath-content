/**
 * Daily follow-up sequence for leads who requested a snapshot.
 * -------------------------------------------------------------
 * Three touches, then it stops permanently. It also stops the moment a lead
 * books, replies, or unsubscribes — nobody gets chased.
 *
 *   day 3   one specific finding from their own site, restated as a question
 *   day 8   the guide for their category, no ask
 *   day 17  a short close-the-loop note, then silence
 *
 * Runs on Netlify's scheduler. Sending is idempotent per stage: a lead can
 * only ever receive each touch once, so a double-run cannot double-send.
 */
import { industryPhrase } from "../../scripts/icp.mjs";
import {
  CAL, SITE, ALERT_TO, leadStore, sendEmail, layout, unsubUrlFor,
  toText, esc, isSuppressed,
} from "./_shared.mjs";

export const config = { schedule: "0 16 * * *" }; // 16:00 UTC — 9am Phoenix

const GAP_DAYS = [3, 5, 9]; // days between touches: 3, then +5 (day 8), then +9 (day 17)

const TOUCHES = [
  // ---- stage 0 -> touch 1 ------------------------------------------------
  (lead) => {
    const f = lead.findings?.[0];
    return {
      subject: `${lead.first}, one thing from your snapshot`,
      body: `
<p>${esc(lead.first)} — following up on the snapshot I sent over.</p>
${f ? `<p>The line I would focus on if it were my business:</p><div class="note">${esc(f)}</div>`
    : `<p>I never got a website from you, so the snapshot was only half of what I normally send. If you reply with the URL I will finish it off.</p>`}
<p>The question worth answering internally is simple: when someone in ${esc(lead.where)} searches the thing you actually get paid for, whose page do they land on? If the honest answer is a directory, that is a fixable problem and it is the only one I work on.</p>
<p><a class="btn" href="${CAL}">Book 30 minutes</a></p>
<p class="sig">— Dean</p>`,
    };
  },
  // ---- stage 1 -> touch 2 ------------------------------------------------
  (lead) => ({
    subject: `The long version, if it is useful`,
    body: `
<p>No pitch in this one.</p>
<p>Whether or not you ever work with me, the mechanics of this are worth understanding — and most of what is written about it online is written to sell software. This is the version I would want if I ran a ${esc(lead.industryLower)} business:</p>
<p><a class="btn" href="${SITE}/blog/${esc(lead.guideSlug || "organic-visibility-guide")}">Read the guide</a></p>
<p>It covers what actually moves rankings, how long it genuinely takes, and how to tell whether it is working before the revenue shows up. If you read it and decide to do it yourself, that is a completely fine outcome.</p>
<p class="sig">— Dean</p>`,
  }),
  // ---- stage 2 -> touch 3 ------------------------------------------------
  (lead) => ({
    subject: `Closing the loop`,
    body: `
<p>${esc(lead.first)} — last one from me, I am not going to keep landing in your inbox.</p>
<p>Two things worth saying before I stop:</p>
<ul>
  <li>Availability is one business per niche, per metro. ${esc(lead.industry)} in ${esc(lead.where)} is open right now. If someone else takes it, I cannot also work with you.</li>
  <li>If the timing is simply wrong, reply with a month and I will get out of the way until then.</li>
</ul>
<p>Otherwise, the snapshot is yours to keep and the guides are free. Good luck with it either way.</p>
<p><a class="btn" href="${CAL}">Book 30 minutes</a></p>
<p class="sig">— Dean</p>`,
  }),
];

export default async function handler() {
  const store = leadStore();
  const now = Date.now();
  const summary = { checked: 0, sent: 0, skipped: 0, finished: 0, errors: [] };

  let list;
  try { list = await store.list(); }
  catch (e) { return Response.json({ ok: false, error: String(e.message || e) }, { status: 500 }); }

  for (const { key } of list.blobs || []) {
    summary.checked++;
    let lead;
    try { lead = JSON.parse(await store.get(key)); }
    catch { summary.errors.push(`unreadable:${key}`); continue; }

    if (lead.closed || lead.stage >= TOUCHES.length) { summary.skipped++; continue; }
    if (!lead.nextTouchAt || Date.parse(lead.nextTouchAt) > now) { summary.skipped++; continue; }
    if (await isSuppressed(lead.email)) {
      lead.closed = true; lead.closedReason = "suppressed";
      await store.set(key, JSON.stringify(lead));
      summary.skipped++; continue;
    }

    const view = {
      ...lead,
      first: (lead.name || "").split(/\s+/)[0] || "there",
      where: lead.city ? `${lead.city}${lead.state ? ", " + lead.state : ""}` : "your market",
      industryLower: industryPhrase(lead.industry || ""),
    };
    const touch = TOUCHES[lead.stage](view);
    const html = layout({ body: touch.body, unsubUrl: unsubUrlFor(lead.email), preheader: touch.subject });

    const r = await sendEmail({
      to: lead.email, subject: touch.subject, html, text: toText(html),
      replyTo: ALERT_TO, tag: `nurture-${lead.stage + 1}`,
    });

    // Advance the stage whether or not delivery succeeded. A transient Resend
    // failure must not put the lead in a loop that re-sends every single day.
    lead.stage += 1;
    lead.history = lead.history || [];
    lead.history.push({ at: new Date().toISOString(), event: r.sent ? `touch-${lead.stage}` : `touch-${lead.stage}-failed:${r.error}` });

    if (lead.stage >= TOUCHES.length) {
      lead.closed = true; lead.closedReason = "sequence-complete"; lead.nextTouchAt = null;
      summary.finished++;
    } else {
      lead.nextTouchAt = new Date(now + GAP_DAYS[lead.stage] * 864e5).toISOString();
    }

    await store.set(key, JSON.stringify(lead));
    if (r.sent) summary.sent++; else summary.errors.push(`${lead.email}:${r.error}`);
  }

  console.log("[nurture]", JSON.stringify(summary));
  return Response.json({ ok: true, ...summary });
}
