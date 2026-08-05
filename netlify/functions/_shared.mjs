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
export const CAL = "https://calendly.com/clearpathpediatrics/30min";

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

const BRAND_HEAD = `
<style>
  body{margin:0;background:#F5F7FB;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
       color:#0E1B2E;line-height:1.6;-webkit-font-smoothing:antialiased}
  .wrap{max-width:600px;margin:0 auto;padding:28px 18px 40px}
  .card{background:#fff;border:1px solid #E2E8F1;border-radius:18px;padding:32px 30px}
  .mark{font-weight:700;font-size:17px;color:#0B2240;letter-spacing:-.01em;margin-bottom:22px;display:block}
  h1{font-size:22px;line-height:1.25;color:#0B2240;margin:0 0 16px}
  p{font-size:15.5px;color:#33445A;margin:0 0 15px}
  ul{margin:0 0 18px;padding-left:0;list-style:none}
  li{position:relative;padding:0 0 12px 22px;font-size:15.5px;color:#33445A}
  li:before{content:"—";position:absolute;left:0;color:#3E8EDE;font-weight:700}
  .btn{display:inline-block;background:#2F72C4;color:#fff !important;text-decoration:none;font-weight:700;
       font-size:15px;padding:13px 26px;border-radius:999px;margin:8px 0 4px}
  .note{background:#E4EFFA;border-left:3px solid #3E8EDE;border-radius:0 10px 10px 0;padding:13px 17px;
        font-size:14.5px;color:#153E6B;margin:4px 0 18px}
  .sig{margin-top:24px;font-size:15px;color:#33445A}
  .foot{margin-top:22px;padding:0 8px;font-size:11.5px;color:#8494A8;line-height:1.6}
  .foot a{color:#8494A8}
</style>`;

/** Wrap body HTML in the branded shell with a compliant footer. */
export function layout({ body, unsubUrl, preheader = "" }) {
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">${BRAND_HEAD}</head><body>
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</div>` : ""}
<div class="wrap">
  <div class="card"><span class="mark">ClearPath Content</span>${body}</div>
  <div class="foot">
    ClearPath Content · organic visibility programs<br>
    ${POSTAL ? esc(POSTAL) + "<br>" : ""}
    ${unsubUrl ? `<a href="${unsubUrl}">Unsubscribe</a> — one click, no questions, and it stops everything.` : ""}
  </div>
</div></body></html>`;
}

export const unsubUrlFor = (email) =>
  `${SITE}/.netlify/functions/unsubscribe?e=${encodeURIComponent(emailKey(email))}`;

/** Very rough plain-text fallback so the message is readable without HTML. */
export const toText = (html) => html
  .replace(/<style[\s\S]*?<\/style>/gi, "")
  .replace(/<li>/gi, "\n- ").replace(/<\/(p|h1|div|li)>/gi, "\n")
  .replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "")
  .replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"')
  .replace(/\n{3,}/g, "\n\n").trim();
