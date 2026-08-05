/**
 * Private pipeline export. Token-guarded — the lead store holds contact data,
 * so this must never be publicly readable.
 *
 *   /.netlify/functions/leads?token=…            HTML board, ranked by score
 *   /.netlify/functions/leads?token=…&format=csv download
 *   /.netlify/functions/leads?token=…&format=json
 *
 * Set CPC_ADMIN_TOKEN in Netlify. Without it the endpoint refuses everything.
 */
import { leadStore, esc } from "../lib/shared.mjs";

const BAND_COLOUR = { HOT: "#B4451F", WARM: "#1F5FA8", COOL: "#5B6B80", LOW: "#8494A8" };

export default async function handler(req) {
  const token = process.env.CPC_ADMIN_TOKEN;
  const given = new URL(req.url).searchParams.get("token");
  // Fail closed: an unset token must not mean "open to everyone".
  if (!token || given !== token) return new Response("Not found", { status: 404 });

  const url = new URL(req.url);
  const format = url.searchParams.get("format") || "html";

  let leads = [];
  try {
    const store = leadStore();
    const { blobs } = await store.list();
    leads = (await Promise.all((blobs || []).map(async ({ key }) => {
      try { return JSON.parse(await store.get(key)); } catch { return null; }
    }))).filter(Boolean);
  } catch (e) {
    return new Response(`store error: ${e.message}`, { status: 500 });
  }
  leads.sort((a, b) => (b.score || 0) - (a.score || 0));

  if (format === "json") return Response.json(leads);

  if (format === "csv") {
    const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = ["submitted,score,band,name,email,industry,city,state,website,stage,closed,reason,finding_1"]
      .concat(leads.map(l => [
        l.submittedAt, l.score, l.band, l.name, l.email, l.industry, l.city, l.state,
        l.website, l.stage, l.closed ? "yes" : "no", l.closedReason || "", (l.findings || [])[0] || "",
      ].map(q).join(","))).join("\n");
    return new Response(csv, {
      headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="cpc-leads.csv"' },
    });
  }

  const count = (b) => leads.filter(l => l.band === b).length;
  const rows = leads.map(l => `
    <tr>
      <td><span class="pill" style="background:${BAND_COLOUR[l.band] || "#8494A8"}">${esc(l.band || "?")} ${l.score ?? ""}</span></td>
      <td><strong>${esc(l.name || "—")}</strong><br><a href="mailto:${esc(l.email)}">${esc(l.email)}</a></td>
      <td>${esc(l.industry || "—")}<br><span class="dim">${esc([l.city, l.state].filter(Boolean).join(", ") || "—")}</span></td>
      <td>${l.website ? `<a href="${esc(l.website.startsWith("http") ? l.website : "https://" + l.website)}" target="_blank" rel="noopener">${esc(l.website)}</a>` : "<span class='dim'>none</span>"}</td>
      <td class="dim">${esc((l.findings || [])[0] || "—")}</td>
      <td class="dim">${l.closed ? `closed · ${esc(l.closedReason || "")}` : `touch ${l.stage || 0}/3`}<br>${esc((l.submittedAt || "").slice(0, 10))}</td>
    </tr>`).join("");

  return new Response(`<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>Pipeline · ClearPath Content</title><style>
 body{margin:0;background:#F5F7FB;color:#0E1B2E;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;padding:28px 18px}
 .w{max-width:1180px;margin:0 auto}
 h1{font-size:24px;color:#0B2240;margin:0 0 6px}
 .sub{color:#5B6B80;font-size:14px;margin-bottom:20px}
 .stats{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px}
 .stat{background:#fff;border:1px solid #E2E8F1;border-radius:14px;padding:12px 18px;font-size:13px;color:#5B6B80}
 .stat b{display:block;font-size:22px;color:#0B2240}
 table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #E2E8F1;border-radius:14px;overflow:hidden;font-size:14px}
 th{background:#0B2240;color:#fff;text-align:left;padding:11px 14px;font-size:12px;letter-spacing:.05em;text-transform:uppercase}
 td{padding:13px 14px;border-bottom:1px solid #EEF2F7;vertical-align:top}
 tr:last-child td{border-bottom:none}
 .pill{display:inline-block;color:#fff;font-weight:700;font-size:11.5px;padding:4px 11px;border-radius:99px;white-space:nowrap}
 .dim{color:#5B6B80;font-size:13px}
 a{color:#1F5FA8}
 .tools{margin-top:16px;font-size:13px}
</style></head><body><div class="w">
<h1>Pipeline</h1>
<p class="sub">${leads.length} lead${leads.length === 1 ? "" : "s"} · ranked by ICP score · HOT means call today</p>
<div class="stats">
  <div class="stat"><b>${count("HOT")}</b>HOT</div>
  <div class="stat"><b>${count("WARM")}</b>WARM</div>
  <div class="stat"><b>${count("COOL")}</b>COOL</div>
  <div class="stat"><b>${count("LOW")}</b>LOW</div>
  <div class="stat"><b>${leads.filter(l => !l.closed).length}</b>In sequence</div>
</div>
${leads.length ? `<table><thead><tr><th>Score</th><th>Contact</th><th>Category</th><th>Site</th><th>Top finding</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`
  : `<p class="dim">No leads yet. They appear here the moment someone submits the snapshot form.</p>`}
<p class="tools"><a href="?token=${encodeURIComponent(given)}&format=csv">Download CSV</a> · <a href="?token=${encodeURIComponent(given)}&format=json">JSON</a></p>
</div></body></html>`, { headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex" } });
}
