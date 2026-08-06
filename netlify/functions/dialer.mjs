/**
 * The dialer — a work queue for outbound, one prospect per screen.
 * -------------------------------------------------------------
 * The point is not dialing faster. It is zero prep time per call: the score,
 * the reason for the score, and a real finding from that business's own site
 * are already on screen when the phone starts ringing. A call that opens with
 * "I was on your site this morning and noticed X" is a different conversation
 * from a cold pitch, and this is what makes that repeatable at forty a day.
 *
 *   GET  /.netlify/functions/dialer?token=…            the queue
 *        &industry=HVAC &city=Mesa &min=65             filters
 *   POST /.netlify/functions/dialer?token=…&action=disposition
 *        { domain, code, note, callbackAt }
 *
 * Deliberately not a predictive dialer. Every call is placed by a human
 * pressing the button — which is both the right side of TCPA and the reason
 * the conversation quality holds up.
 */
import {
  allProspects, getProspect, putProspect, callQueue, applyDisposition,
  DISPOSITIONS, STATUS, TERMINAL, meterGet, meterBump, authorised,
} from "../lib/prospects.mjs";
import { industryPhrase, playbook } from "../../scripts/icp.mjs";
import { CAL, esc } from "../lib/shared.mjs";

const BAND_COLOUR = { HOT: "#B4451F", WARM: "#1F5FA8", COOL: "#5B6B80", LOW: "#8494A8" };

/* ------------------------------------------------------------- talk track */

/**
 * The opener. Built from the same audit finding the email would quote, so the
 * call and the email tell one consistent story.
 */
function talkTrack(p) {
  const who = p.business || p.domain;
  const where = [p.city, p.state].filter(Boolean).join(", ") || "the area";
  const cat = industryPhrase(p.industry || "service");
  const finding = (p.findings || [])[0];
  const paid = p.audit?.paidLeadSignals?.length ? p.audit.paidLeadSignals.join(" and ") : null;

  const open = `Hi — is the owner around? … My name's Dean, I'm calling from here in ${where}. I'll be quick and you can tell me to get lost.`;
  const hook = finding
    ? `I look at ${cat} websites in ${where} for a living. I was on ${p.domain} this morning — ${finding.replace(/^There is |^I count |^The /, m => m.toLowerCase())}`
    : `I look at ${cat} websites in ${where} for a living, and I spent a few minutes on ${p.domain} this morning.`;
  const pivot = paid
    ? `I noticed you're on ${paid}. So you're already paying per lead for enquiries that get sold to two or three of your competitors at the same time. That's the bit I fix.`
    : `When someone in ${where} searches the thing you actually get paid for, the results are held by directories. They can't do the work — they just capture the enquiry and sell it on.`;
  const ask = `I publish the answers to those questions on your own domain, on a schedule. One business per category per metro — ${cat} in ${p.city || where} is open right now. Worth fifteen minutes this week?`;

  return { open, hook, pivot, ask };
}

const OBJECTIONS = [
  ["“We already have someone doing SEO.”",
   "Fair enough — what did they publish last month? If the honest answer is nothing, that's the gap. I'm not asking you to fire anyone."],
  ["“How much is it?”",
   "Between $199 and $499 a month depending on cadence. One extra job covers the year, which is the only reason the maths works in your category."],
  ["“Send me some information.”",
   "Happy to — what's the best address? I'll send the actual audit of your site, not a brochure. Then I'll leave you alone unless you reply."],
  ["“We're too busy right now.”",
   "That's usually the right time, honestly — this takes months to compound, so starting it while you're busy is the point. Want me to try you in a quarter?"],
];

/* ------------------------------------------------------------------- POST */

async function handleDisposition(req) {
  let body;
  try { body = await req.json(); }
  catch { return Response.json({ ok: false, error: "invalid JSON" }, { status: 400 }); }

  const { domain, code, note = "", callbackAt = null } = body || {};
  if (!DISPOSITIONS[code]) return Response.json({ ok: false, error: "unknown disposition" }, { status: 400 });

  const p = await getProspect(domain);
  if (!p) return Response.json({ ok: false, error: "prospect not found" }, { status: 404 });

  applyDisposition(p, code, { note, callbackAt });
  await putProspect(p);

  // Only real dial outcomes count toward the daily number.
  if (!["approve-email", "skip"].includes(code)) await meterBump("dials");
  if (code === "booked") await meterBump("booked");
  if (code === "approve-email") await meterBump("approved");

  return Response.json({ ok: true, status: p.status, nextTouchAt: p.nextTouchAt });
}

/* -------------------------------------------------------------------- GET */

export default async function handler(req) {
  if (!authorised(req)) return new Response("Not found", { status: 404 });

  const url = new URL(req.url);
  const token = url.searchParams.get("token") || req.headers.get("x-cpc-token");

  if (req.method === "POST") {
    if (url.searchParams.get("action") === "disposition") return handleDisposition(req);
    return Response.json({ ok: false, error: "unknown action" }, { status: 400 });
  }

  let prospects = [];
  try { prospects = await allProspects(); }
  catch (e) { return new Response(`store error: ${e.message}`, { status: 500 }); }

  const industry = url.searchParams.get("industry") || "";
  const city = url.searchParams.get("city") || "";
  const minScore = Number(url.searchParams.get("min") || 55);
  const limit = Number(url.searchParams.get("limit") || process.env.CPC_DAILY_CALL_GOAL || 40);

  const queue = callQueue(prospects, { limit, minScore, industry, city });
  const [dials, booked, approved] = await Promise.all([
    meterGet("dials"), meterGet("booked"), meterGet("approved"),
  ]);

  const html = renderDialer({
    prospects, queue, token, industry, city, minScore,
    meters: { dials, booked, approved },
  });

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex", "Cache-Control": "no-store" },
  });
}

/* ----------------------------------------------------------------- render */

/**
 * Exported so the page can be rendered from fixtures without a live store —
 * `node scripts/dialer-preview.mjs` writes a working copy to disk.
 */
export function renderDialer({ prospects, queue, token, industry = "", city = "", minScore = 55, meters = {} }) {
  const { dials = 0, booked = 0, approved = 0 } = meters;
  const total = prospects.length;
  const live = prospects.filter(p => !TERMINAL.has(p.status)).length;
  const industries = [...new Set(prospects.map(p => p.industry).filter(Boolean))].sort();
  const cities = [...new Set(prospects.map(p => p.city).filter(Boolean))].sort();

  const cards = queue.map((p, i) => renderCard(p, i, queue.length)).join("");

  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow"><title>Dialer · ClearPath Content</title>
<style>
 *{box-sizing:border-box}
 body{margin:0;background:#0B2240;color:#0E1B2E;font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
      padding:0 0 env(safe-area-inset-bottom)}
 .top{background:#0B2240;color:#fff;padding:14px 18px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;
      position:sticky;top:0;z-index:20;border-bottom:1px solid #1B3A63}
 .top h1{font-size:15px;margin:0;font-weight:700;letter-spacing:-.01em}
 .top .m{font-size:12px;color:#7FB0E0;display:flex;gap:14px;margin-left:auto;white-space:nowrap;
         overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}
 .top .m::-webkit-scrollbar{display:none}
 .top .m b{color:#fff;font-size:14px}
 .bar{height:3px;background:#1B3A63}.bar i{display:block;height:100%;background:#3E8EDE;width:0;transition:width .25s}
 .wrap{max-width:660px;margin:0 auto;padding:16px 14px 40px}
 .card{background:#fff;border-radius:18px;padding:0;overflow:hidden;display:none;box-shadow:0 8px 30px rgba(0,0,0,.22)}
 .card.on{display:block}
 .hd{padding:18px 20px 16px;border-bottom:1px solid #EEF2F7}
 .pill{display:inline-block;color:#fff;font-weight:700;font-size:11.5px;padding:4px 11px;border-radius:99px;letter-spacing:.02em}
 .biz{font-size:21px;font-weight:700;color:#0B2240;margin:10px 0 3px;line-height:1.25}
 .meta{font-size:13.5px;color:#5B6B80}
 .meta a{color:#1F5FA8}
 .cbk{background:#FFF4E0;border:1px solid #F0D08A;color:#7A4E00;font-size:13px;padding:8px 12px;border-radius:10px;margin:12px 0 0}
 .call{display:flex;gap:10px;padding:16px 20px;background:#F7FAFE;border-bottom:1px solid #EEF2F7}
 .call a{flex:1;text-align:center;text-decoration:none;font-weight:700;font-size:15px;padding:14px 10px;border-radius:12px}
 .call .tel{background:#1B8A4B;color:#fff;flex:2}
 .call .em{background:#2F72C4;color:#fff}
 .call .web{background:#fff;color:#1F5FA8;border:1px solid #CFDCEC}
 .call .off{background:#EEF2F7;color:#8494A8;pointer-events:none}
 .sec{padding:16px 20px;border-bottom:1px solid #EEF2F7}
 .sec:last-of-type{border-bottom:none}
 h2{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#5B6B80;margin:0 0 10px;font-weight:700}
 .say{background:#F2F6FC;border-left:3px solid #3E8EDE;border-radius:0 10px 10px 0;padding:11px 14px;margin:0 0 8px;
      font-size:14.5px;color:#12325A}
 .say b{color:#0B2240}
 ul{margin:0;padding:0;list-style:none}
 li{position:relative;padding:0 0 8px 18px;font-size:14px;color:#33445A}
 li:before{content:"—";position:absolute;left:0;color:#3E8EDE;font-weight:700}
 li.flag:before{content:"!";color:#B4451F}
 .stats{display:flex;gap:7px;flex-wrap:wrap}
 .st{flex:1;min-width:70px;background:#F2F6FC;border:1px solid #DCE7F5;border-radius:11px;padding:9px 6px;text-align:center}
 .st b{display:block;font-size:17px;color:#0B2240}.st.warn b{color:#B4451F}
 .st span{font-size:9.5px;letter-spacing:.05em;text-transform:uppercase;color:#5B6B80}
 details{margin-top:10px}summary{cursor:pointer;font-size:13px;color:#1F5FA8;font-weight:600}
 .obj{margin-top:9px;font-size:13.5px;color:#33445A}.obj b{display:block;color:#0B2240;margin-top:8px}
 textarea,input[type=date]{width:100%;border:1px solid #CFDCEC;border-radius:10px;padding:10px;
   font-family:inherit;font-size:14px;color:#0E1B2E;background:#fff}
 textarea{resize:vertical;min-height:52px}
 input[type=date]{margin-top:8px;padding:9px}
 .dis{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:12px}
 .dis button{padding:12px 8px;border-radius:11px;border:1px solid #CFDCEC;background:#fff;color:#33445A;
             font-family:inherit;font-size:13.5px;font-weight:600;cursor:pointer}
 .dis button:active{transform:scale(.97)}
 .dis .good{background:#E8F5EE;border-color:#A8D8BE;color:#14683A}
 .dis .win{background:#1B8A4B;border-color:#1B8A4B;color:#fff;grid-column:span 2}
 .dis .bad{background:#FDEEE9;border-color:#F0C0AE;color:#8C3517}
 .empty{background:#fff;border-radius:18px;padding:34px 24px;text-align:center}
 .empty h2{font-size:17px;color:#0B2240;text-transform:none;letter-spacing:0;margin-bottom:10px}
 .empty p{color:#5B6B80;font-size:14.5px}
 .empty code{background:#F2F6FC;padding:3px 7px;border-radius:6px;font-size:13px;display:inline-block;margin-top:4px}
 .filters{background:#12305580;border-radius:12px;padding:10px 12px;margin-bottom:14px;display:flex;gap:8px;flex-wrap:wrap}
 .filters select,.filters a{background:#fff;border:1px solid #CFDCEC;border-radius:9px;padding:7px 10px;
   font-family:inherit;font-size:13px;color:#33445A;text-decoration:none}
 .toast{position:fixed;left:50%;transform:translateX(-50%);bottom:22px;background:#0B2240;color:#fff;padding:11px 20px;
        border-radius:99px;font-size:14px;font-weight:600;opacity:0;transition:opacity .2s;pointer-events:none;z-index:50;
        box-shadow:0 6px 20px rgba(0,0,0,.3)}
 .toast.on{opacity:1}
 @media(max-width:520px){
   .biz{font-size:19px}.wrap{padding:12px 10px 30px}.call{flex-wrap:wrap}.call .tel{flex:1 0 100%}
   /* The header is sticky — on a phone it has to stay one line or it eats the card. */
   .top{padding:10px 14px;gap:10px}.top h1{font-size:14px}
   .top .m{gap:11px;font-size:11px}.top .m b{font-size:13px}
 }
</style></head><body>

<div class="top">
  <h1>Dialer</h1>
  <div class="m">
    <span><b id="pos">${queue.length ? 1 : 0}</b>/${queue.length} queue</span>
    <span><b>${dials}</b> dials today</span>
    <span><b>${booked}</b> booked</span>
    <span><b>${approved}</b> queued to email</span>
    <span><b>${live}</b>/${total} live</span>
  </div>
</div>
<div class="bar"><i id="prog"></i></div>

<div class="wrap">
  <form class="filters" method="get">
    <input type="hidden" name="token" value="${esc(token)}">
    <select name="industry" onchange="this.form.submit()">
      <option value="">All categories</option>
      ${industries.map(i => `<option value="${esc(i)}"${i === industry ? " selected" : ""}>${esc(i)}</option>`).join("")}
    </select>
    <select name="city" onchange="this.form.submit()">
      <option value="">All metros</option>
      ${cities.map(c => `<option value="${esc(c)}"${c === city ? " selected" : ""}>${esc(c)}</option>`).join("")}
    </select>
    <select name="min" onchange="this.form.submit()">
      ${[75, 65, 55, 45, 35].map(n => `<option value="${n}"${n === minScore ? " selected" : ""}>${n}+ score</option>`).join("")}
    </select>
    <a href="/.netlify/functions/leads?token=${encodeURIComponent(token)}">Inbound &rarr;</a>
  </form>

  ${queue.length ? cards : `<div class="empty">
    <h2>Nothing due right now</h2>
    <p>Either the queue is worked for today, or nothing has been sourced at this filter yet.</p>
    <p>Source more prospects:<br><code>node scripts/prospect-source.mjs --metros mesa --industries HVAC</code><br>
    <code>node scripts/prospect-source.mjs --push</code></p>
    ${total ? `<p style="margin-top:16px">${total} prospects in the store — try lowering the score filter or clearing the category.</p>` : ""}
  </div>`}
</div>

<div class="toast" id="toast"></div>

<script>
(function(){
  var TOKEN = ${JSON.stringify(token)};
  var cards = Array.prototype.slice.call(document.querySelectorAll('.card'));
  var idx = 0, total = cards.length;

  function show(i){
    if(!total) return;
    if(i >= total){
      document.querySelector('.wrap').innerHTML =
        '<div class="empty"><h2>Queue clear</h2><p>That is the list worked. Sourcing more, or come back when callbacks come due.</p></div>';
      document.getElementById('prog').style.width = '100%';
      return;
    }
    cards.forEach(function(c,n){ c.classList.toggle('on', n===i); });
    document.getElementById('pos').textContent = i+1;
    document.getElementById('prog').style.width = ((i/total)*100)+'%';
    window.scrollTo(0,0);
  }

  function toast(msg){
    var t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('on');
    clearTimeout(t._h); t._h = setTimeout(function(){ t.classList.remove('on'); }, 1800);
  }

  window.dispo = function(btn, domain, code, label){
    var card = btn.closest('.card');
    var note = card.querySelector('textarea').value || '';
    var cb   = card.querySelector('input[type=date]');
    var when = cb && cb.value ? new Date(cb.value + 'T16:00:00Z').toISOString() : null;

    if(code === 'callback' && !when){
      toast('Pick a callback date first');
      cb.focus();
      return;
    }

    // Advance immediately — the operator should never wait on the network.
    toast(label);
    idx++; show(idx);

    fetch('/.netlify/functions/dialer?action=disposition&token='+encodeURIComponent(TOKEN), {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ domain: domain, code: code, note: note, callbackAt: when })
    }).then(function(r){ return r.json(); }).then(function(j){
      if(!j.ok) toast('Not saved: ' + (j.error||'error'));
    }).catch(function(){ toast('Offline — that one did not save'); });
  };

  document.addEventListener('keydown', function(e){
    if(e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
    var card = cards[idx]; if(!card) return;
    var map = { '1':'no-answer', '2':'voicemail', '3':'callback', '4':'approve-email', '5':'booked', '0':'not-interested' };
    if(map[e.key]){
      var b = card.querySelector('[data-code="'+map[e.key]+'"]');
      if(b) b.click();
    }
  });

  show(0);
})();
</script>
</body></html>`;
}

/* ------------------------------------------------------------------ card */

function renderCard(p, i, n) {
  const t = talkTrack(p);
  const a = p.audit && !p.audit.error ? p.audit : null;
  const where = [p.city, p.state].filter(Boolean).join(", ");
  const play = playbook(p.band);
  const tel = (p.phone || "").replace(/[^\d+]/g, "");
  const site = p.website || ("https://" + p.domain);

  const cells = a ? [
    { n: a.hasBlog ? a.blogPostCount : 0, k: a.hasBlog ? "Posts" : "No blog", warn: !a.hasBlog || a.blogPostCount < 6 },
    { n: a.staleMonths != null ? `${a.staleMonths}mo` : (a.hasBlog ? "—" : "n/a"), k: "Since last", warn: (a.staleMonths ?? 0) >= 6 },
    { n: a.pageCount ?? "—", k: "Pages", warn: (a.pageCount ?? 99) <= 8 },
    { n: a.hasSchema ? "Yes" : "No", k: "AI-ready", warn: !a.hasSchema },
  ] : [];

  const mailto = p.email
    ? `mailto:${encodeURIComponent(p.email)}?subject=${encodeURIComponent(
        (p.findings || [])[0]?.match(/no blog|roughly \d+ post/i) ? `${p.business} — nothing published` : `Something I noticed on ${p.business}'s site`)
      }&body=${encodeURIComponent(
        `Hi,\n\n${t.hook}\n\n${t.pivot}\n\n${t.ask}\n\nIf not, no follow-up from me — just reply "no" and you are off the list.\n\n— Dean\nClearPath Content · clearpath-content.com\n${CAL}`)}`
    : null;

  return `
<div class="card${i === 0 ? " on" : ""}" data-domain="${esc(p.domain)}">
  <div class="hd">
    <span class="pill" style="background:${BAND_COLOUR[p.band] || "#8494A8"}">${esc(p.band)} ${p.score}</span>
    <span style="font-size:12px;color:#5B6B80;margin-left:8px">${esc(play.priority)}${p.attempts ? ` · attempt ${p.attempts + 1}` : ""}</span>
    <div class="biz">${esc(p.business || p.domain)}</div>
    <div class="meta">
      ${esc(p.industry)}${where ? " · " + esc(where) : ""}${p.rating ? ` · ${p.rating}★ (${p.reviews})` : ""}<br>
      <a href="${esc(site)}" target="_blank" rel="noopener">${esc(p.domain)}</a>${p.email ? ` · ${esc(p.email)}` : ""}
    </div>
    ${p.status === STATUS.CALLBACK && p.callbackAt
      ? `<div class="cbk"><strong>Callback due.</strong> They asked to be reached around ${esc(p.callbackAt.slice(0, 10))}.</div>` : ""}
    ${p.notes ? `<div class="cbk" style="background:#F2F6FC;border-color:#CFDCEC;color:#33445A">${esc(p.notes).replace(/\n/g, "<br>")}</div>` : ""}
  </div>

  <div class="call">
    ${tel ? `<a class="tel" href="tel:${esc(tel)}">Call ${esc(p.phone)}</a>` : `<a class="tel off">No phone number</a>`}
    ${mailto ? `<a class="em" href="${mailto}">Email</a>` : `<a class="em off">No email</a>`}
    <a class="web" href="${esc(site)}" target="_blank" rel="noopener">Site</a>
  </div>

  ${cells.length ? `<div class="sec"><h2>Their site right now</h2><div class="stats">${
    cells.map(c => `<div class="st${c.warn ? " warn" : ""}"><b>${esc(String(c.n))}</b><span>${esc(c.k)}</span></div>`).join("")
  }</div>${a.paidLeadSignals?.length ? `<p style="margin:10px 0 0;font-size:13.5px;color:#B4451F"><strong>Buying leads via ${esc(a.paidLeadSignals.join(", "))}</strong> — budget already exists.</p>` : ""}</div>` : ""}

  <div class="sec">
    <h2>Opener</h2>
    <div class="say">${esc(t.open)}</div>
    <div class="say"><b>${esc(t.hook)}</b></div>
    <div class="say">${esc(t.pivot)}</div>
    <div class="say">${esc(t.ask)}</div>
    <details><summary>Objections</summary>
      <div class="obj">${OBJECTIONS.map(([q, r]) => `<b>${esc(q)}</b>${esc(r)}`).join("")}</div>
    </details>
  </div>

  ${(p.reasons?.length || p.flags?.length) ? `<div class="sec">
    <h2>Why ${p.score}</h2>
    <ul>
      ${(p.reasons || []).slice(0, 4).map(r => `<li>${esc(r)}</li>`).join("")}
      ${(p.flags || []).slice(0, 2).map(f => `<li class="flag">${esc(f)}</li>`).join("")}
    </ul>
  </div>` : ""}

  <div class="sec">
    <h2>Outcome</h2>
    <textarea placeholder="Notes — what they said, who to ask for next time"></textarea>
    <input type="date" aria-label="Callback date">
    <div class="dis">
      <button data-code="booked" class="win" onclick="dispo(this,'${esc(p.domain)}','booked','Booked — nice')">Booked a meeting</button>
      <button data-code="callback" class="good" onclick="dispo(this,'${esc(p.domain)}','callback','Callback set')">Callback</button>
      <button data-code="approve-email" class="good" onclick="dispo(this,'${esc(p.domain)}','approve-email','Queued for the sequence')">Start email sequence</button>
      <button data-code="no-answer" onclick="dispo(this,'${esc(p.domain)}','no-answer','No answer — retry in 2 days')">No answer</button>
      <button data-code="voicemail" onclick="dispo(this,'${esc(p.domain)}','voicemail','Voicemail logged')">Left voicemail</button>
      <button data-code="gatekeeper" onclick="dispo(this,'${esc(p.domain)}','gatekeeper','Logged')">Gatekeeper</button>
      <button data-code="skip" onclick="dispo(this,'${esc(p.domain)}','skip','Skipped for 2 weeks')">Skip</button>
      <button data-code="not-interested" class="bad" onclick="dispo(this,'${esc(p.domain)}','not-interested','Closed')">Not interested</button>
      <button data-code="dnc" class="bad" onclick="dispo(this,'${esc(p.domain)}','dnc','Do not contact')">Do not contact</button>
    </div>
    <p style="font-size:11.5px;color:#8494A8;margin:10px 0 0">Keys 1 no answer · 2 voicemail · 3 callback · 4 sequence · 5 booked · 0 not interested</p>
  </div>
</div>`;
}
