/**
 * One-click unsubscribe. No confirmation step, no login, no "are you sure".
 * Adds the address to the suppression store and closes any open sequence.
 * Also answers POST so RFC 8058 one-click unsubscribe works from Gmail.
 */
import { suppress, leadStore, emailKey, esc } from "../lib/shared.mjs";

const page = (title, msg) => `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>${esc(title)} · ClearPath Content</title>
<style>
 body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#F5F7FB;
   font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;color:#0E1B2E;padding:24px}
 .c{max-width:460px;background:#fff;border:1px solid #E2E8F1;border-radius:20px;padding:38px 34px;text-align:center;
   box-shadow:0 6px 30px rgba(11,34,64,.08)}
 h1{font-size:22px;color:#0B2240;margin:0 0 12px}
 p{font-size:15.5px;color:#5B6B80;line-height:1.6;margin:0 0 18px}
 a{display:inline-block;background:#2F72C4;color:#fff;text-decoration:none;font-weight:700;font-size:14.5px;
   padding:12px 24px;border-radius:999px}
</style></head><body><div class="c"><h1>${esc(title)}</h1><p>${esc(msg)}</p>
<a href="https://clearpath-content.com/">Back to the site</a></div></body></html>`;

export default async function handler(req) {
  const url = new URL(req.url);
  let email = emailKey(url.searchParams.get("e") || "");

  if (!email && req.method === "POST") {
    try {
      const form = await req.formData();
      email = emailKey(form.get("e") || form.get("email") || "");
    } catch { /* fall through */ }
  }

  if (!email || !email.includes("@")) {
    return new Response(page("Link not recognised", "That unsubscribe link is missing an address. Reply to any of our emails with the word stop and it will be handled by hand."),
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  try {
    await suppress(email, "one-click");
    const store = leadStore();
    const raw = await store.get(email);
    if (raw) {
      const lead = JSON.parse(raw);
      lead.closed = true; lead.closedReason = "unsubscribed"; lead.nextTouchAt = null;
      (lead.history = lead.history || []).push({ at: new Date().toISOString(), event: "unsubscribed" });
      await store.set(email, JSON.stringify(lead));
    }
  } catch (e) {
    console.error("[unsubscribe]", e);
    return new Response(page("Something went wrong", "We could not process that automatically. Reply to any email with the word stop and it will be done manually today."),
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  // RFC 8058 one-click clients want a bare 200, not a page.
  if (req.method === "POST") return new Response("unsubscribed", { status: 200 });

  return new Response(page("You are unsubscribed", `${email} will not receive anything further from ClearPath Content. Nothing else is required from you.`),
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
}
