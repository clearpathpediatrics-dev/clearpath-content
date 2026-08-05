/**
 * Shared helpers for the reach-out functions: email sending, branded HTML,
 * the lead store, and the suppression list.
 *
 * Env (set in Netlify → Site configuration → Environment variables):
 *   RESEND_API_KEY      required to send anything
 *   CPC_FROM_EMAIL      verified Resend sender, e.g. "Dean <dean@clearpath-content.com>"
 *   CPC_ALERT_EMAIL     where internal lead alerts go
 *   CPC_POSTAL_ADDRESS  physical mailing address — required in commercial email by CAN-SPAM
 */
import { getStore } from "@netlify/blobs";

export const SITE = "https://clearpath-content.com";
export const CAL = process.env.CPC_CALENDLY_URL || "https://calendly.com/clearpathpediatrics/30min";

export const FROM = process.env.CPC_FROM_EMAIL || "ClearPath Content <admin@clearpath-content.com>";
export const ALERT_TO = process.env.CPC_ALERT_EMAIL || "admin@clearpath-content.com";
export const POSTAL = process.env.CPC_POSTAL_ADDRESS || "";

export const leadStore = () => getStore({ name: "cpc-leads", consistency: "strong" });
export const suppressionStore = () => getStore({ name: "cpc-suppression", consistency: "strong" });

export const emailKey = (e) => String(e || "").trim().toLowerCase();

export async function isSuppressed(email) {
  try { return (await suppressionStore().get(emailKey(email))) !== null; }
  catch { return false; }
}

export async function suppress(email, reason = "unsubscribe") {
  await suppressionStore().set(emailKey(email), JSON.stringify({ reason, at: new Date().toISOString() }));
}

export const esc = (s = "") => String(s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/**
 * Send via Resend. Never throws — a delivery failure must not lose the lead.
 * Returns {sent:boolean, id?:string, error?:string}.
 */
export async function sendEmail({ to, subject, html, text, replyTo, tag }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false, error: "RESEND_API_KEY not set" };
  if (await isSuppressed(to)) return { sent: false, error: "recipient suppressed" };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM, to: [to], subject, html, text,
        ...(replyTo ? { reply_to: replyTo } : {}),
        ...(tag ? { tags: [{ name: "flow", value: tag }] } : {}),
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { sent: false, error: body.message || `resend ${res.status}` };
    return { sent: true, id: body.id };
  } catch (e) {
    return { sent: false, error: String(e.message || e) };
  }
}

/**
 * Email chrome. Two constraints drive every choice here:
 *  - Gmail strips SVG and blocks data: URIs, so the logo is a hosted PNG.
 *  - Apple Mail dark mode inverts light backgrounds, so the header band and
 *    CTA band are explicitly dark — they survive the inversion intact.
 */
const BRAND_HEAD = `
<style>
  body{margin:0;background:#F5F7FB;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
       color:#0E1B2E;line-height:1.6;-webkit-font-smoothing:antialiased}
  .wrap{max-width:620px;margin:0 auto;padding:24px 16px 36px}
  .shell{border-radius:20px;overflow:hidden;border:1px solid #E2E8F1}
  .hdr{background:#0B2240;padding:22px 30px}
  .hdr img{vertical-align:middle;width:30px;height:30px;border:0;display:inline-block}
  .hdr .wm{vertical-align:middle;font-size:18px;font-weight:700;color:#FFFFFF;letter-spacing:-.01em;padding-left:11px}
  .hdr .tag{margin:9px 0 0;font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:#7FB0E0}
  .card{background:#FFFFFF;padding:30px 30px 34px}
  h1{font-size:23px;line-height:1.24;color:#0B2240;margin:0 0 15px}
  h2{font-size:13px;letter-spacing:.09em;text-transform:uppercase;color:#5B6B80;margin:30px 0 13px;font-weight:700}
  p{font-size:15.5px;color:#33445A;margin:0 0 15px}
  ul{margin:0 0 18px;padding-left:0;list-style:none}
  li{position:relative;padding:0 0 12px 22px;font-size:15.5px;color:#33445A}
  li:before{content:"—";position:absolute;left:0;color:#3E8EDE;font-weight:700}
  .btn{display:inline-block;background:#2F72C4;color:#FFFFFF !important;text-decoration:none;font-weight:700;
       font-size:15px;padding:13px 26px;border-radius:999px;margin:6px 0 4px}
  .note{background:#E4EFFA;border-left:3px solid #3E8EDE;border-radius:0 10px 10px 0;padding:14px 18px;
        font-size:14.5px;color:#153E6B;margin:4px 0 18px}
  /* audit metrics */
  .stats{width:100%;border-collapse:separate;border-spacing:8px 0;margin:2px 0 20px}
  .stats td{background:#F2F6FC;border:1px solid #DCE7F5;border-radius:12px;padding:13px 10px;text-align:center;width:25%}
  .stats .n{display:block;font-size:21px;font-weight:700;color:#0B2240;line-height:1.15}
  .stats .k{display:block;font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:#5B6B80;margin-top:4px}
  .stats .warn .n{color:#B4451F}
  /* live queries */
  .q{background:#FFFFFF;border:1px solid #DCE7F5;border-left:3px solid #3E8EDE;border-radius:0 10px 10px 0;
     padding:11px 15px;margin:0 0 8px;font-size:14.5px;color:#1B3352}
  .q b{color:#0B2240;font-weight:600}
  .band{background:#123055;padding:26px 30px;text-align:center}
  .band p{color:#C4DDF2;font-size:15px;margin:0 0 16px}
  .band .btn{background:#3E8EDE}
  .sig{margin-top:26px;font-size:15px;color:#33445A}
  .foot{margin-top:20px;padding:0 10px;font-size:11.5px;color:#8494A8;line-height:1.65}
  .foot a{color:#8494A8}
  @media (max-width:520px){
    .card,.hdr,.band{padding-left:20px;padding-right:20px}
    .stats td{padding:10px 4px}
    .stats .n{font-size:18px}
    .stats .k{font-size:9.5px}
  }
</style>`;

/** A 4-cell metrics strip. Each cell is {n, k, warn?}. Pass 2 or 4 cells. */
export const statStrip = (cells) => !cells.length ? "" : `
<table class="stats" role="presentation"><tr>${cells.map(c =>
  `<td${c.warn ? ' class="warn"' : ""}><span class="n">${esc(String(c.n))}</span><span class="k">${esc(c.k)}</span></td>`
).join("")}</tr></table>`;

/** Dark call-to-action band. */
export const ctaBand = (text, href, label) => `
<div class="band"><p>${esc(text)}</p><a class="btn" href="${href}">${esc(label)}</a></div>`;

/**
 * Wrap body HTML in the branded shell.
 * `band` is optional dark-band HTML rendered below the white card.
 */
export function layout({ body, unsubUrl, preheader = "", band = "" }) {
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">${BRAND_HEAD}</head><body>
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</div>` : ""}
<div class="wrap">
  <div class="shell">
    <div class="hdr">
      <img src="${SITE}/assets/cpc-mark-light-96.png" width="30" height="30" alt="ClearPath Content"><span class="wm">ClearPath&nbsp;Content</span>
      <p class="tag">Organic visibility infrastructure</p>
    </div>
    <div class="card">${body}</div>
    ${band}
  </div>
  <div class="foot">
    ClearPath Content · organic visibility programs<br>
    ${POSTAL ? esc(POSTAL) + "<br>" : ""}
    ${unsubUrl ? `<a href="${unsubUrl}">Unsubscribe</a> — one click, no questions, and it stops everything.` : ""}
  </div>
</div></body></html>`;
}

export const unsubUrlFor = (email) =>
  `${SITE}/.netlify/functions/unsubscribe?e=${encodeURIComponent(emailKey(email))}`;

/**
 * Plain-text alternative. Worth doing properly: receivers compare the text and
 * HTML parts when scoring, and a mangled text part reads as machine-generated.
 * Block elements become line breaks, table cells get a separator so the
 * metrics strip does not collapse into one word, and entities are decoded.
 */
const ENTITIES = {
  "&nbsp;": " ", "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"',
  "&#39;": "'", "&apos;": "'", "&ldquo;": '"', "&rdquo;": '"',
  "&lsquo;": "'", "&rsquo;": "'", "&mdash;": "—", "&ndash;": "–",
  "&rarr;": "→", "&hellip;": "…",
};

export const toText = (html) => html
  .replace(/<style[\s\S]*?<\/style>|<head[\s\S]*?<\/head>/gi, "")
  .replace(/<li[^>]*>/gi, "\n- ")
  .replace(/<\/span>\s*<span[^>]*>/gi, " ")     // "3" + "Articles" -> "3 Articles"
  .replace(/<\/td>\s*<td[^>]*>/gi, "  ·  ")     // metrics cells stay separated
  .replace(/<\/(td|tr|table)>/gi, "\n")
  .replace(/<br\s*\/?>/gi, "\n")
  .replace(/<\/(p|h1|h2|h3|div|li)>/gi, "\n")
  .replace(/<[^>]+>/g, "")
  .replace(/&[a-z#0-9]+;/gi, (m) => ENTITIES[m.toLowerCase()] ?? m)
  .split("\n").map((l) => l.replace(/[ \t]+/g, " ").trim())
  .join("\n")
  .replace(/\n{3,}/g, "\n\n")
  .trim();
