/**
 * Ingest a sourcing run into the live prospect store.
 *
 * POST /.netlify/functions/prospect-import   header: x-cpc-token
 *   { "prospects": [ …records from data/prospects.json… ] }
 *
 * Merges rather than overwrites: a prospect already in the pipeline keeps its
 * status, attempts, notes and sequence position. A re-sweep refreshes the facts
 * and nothing else, so re-running the sourcing engine is always safe.
 */
import {
  prospectStore, newProspect, mergeProspect, domainKey, authorised,
} from "../lib/prospects.mjs";

export default async function handler(req) {
  if (!authorised(req)) return new Response("Not found", { status: 404 });
  if (req.method !== "POST") return new Response("POST only", { status: 405 });

  let body;
  try { body = await req.json(); }
  catch { return Response.json({ ok: false, error: "invalid JSON" }, { status: 400 }); }

  const incoming = Array.isArray(body?.prospects) ? body.prospects : [];
  if (!incoming.length) return Response.json({ ok: false, error: "no prospects supplied" }, { status: 400 });
  if (incoming.length > 500) return Response.json({ ok: false, error: "batch too large — send 200 at a time" }, { status: 413 });

  const store = prospectStore();
  let added = 0, merged = 0, skipped = 0;

  for (const raw of incoming) {
    const key = domainKey(raw?.domain || raw?.website);
    if (!key) { skipped++; continue; }

    let existing = null;
    try { existing = JSON.parse(await store.get(key)); } catch { /* new */ }

    const record = existing ? mergeProspect(existing, raw) : newProspect({ ...raw, domain: key });
    try {
      await store.set(key, JSON.stringify(record));
      existing ? merged++ : added++;
    } catch { skipped++; }
  }

  console.log("[prospect-import]", JSON.stringify({ added, merged, skipped }));
  return Response.json({ ok: true, written: added + merged, added, merged, skipped });
}
