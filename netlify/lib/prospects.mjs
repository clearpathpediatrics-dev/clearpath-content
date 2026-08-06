/**
 * The outbound prospect store — the shared spine under the sourcing engine,
 * the dialer and the cold sequence.
 *
 * Keyed by domain, because that is the one identifier that survives a business
 * being re-sourced under a different name, category or metro. Re-running the
 * sweep merges into existing records rather than resetting them, so a prospect
 * you already called never comes back as new.
 *
 * Env:
 *   CPC_ADMIN_TOKEN     guards the dialer and the import endpoint
 *   CPC_DAILY_CALL_GOAL how many dials the queue is sized for (default 40)
 */
import { getStore } from "@netlify/blobs";

export const prospectStore = () => getStore({ name: "cpc-prospects", consistency: "strong" });
export const meterStore = () => getStore({ name: "cpc-meters", consistency: "strong" });

/* ------------------------------------------------------------------ status */

/**
 * Where a prospect sits. Only `new` and `callback` appear in the dial queue;
 * only `approved` is eligible for the automated cold sequence. Nothing enters
 * `approved` without a human pressing the button — that is the whole safety
 * model for outbound, and also why the send volume stays defensible.
 */
export const STATUS = {
  NEW: "new",            // sourced and scored, never touched
  APPROVED: "approved",  // human-approved for the automated email sequence
  EMAILING: "emailing",  // sequence in flight
  CONTACTED: "contacted",// reached out manually, no outcome yet
  CALLBACK: "callback",  // asked to be called back at callbackAt
  BOOKED: "booked",      // meeting on the calendar — stop everything
  DEAD: "dead",          // not a fit, or said no
  DNC: "dnc",            // do not contact, ever
};

export const TERMINAL = new Set([STATUS.BOOKED, STATUS.DEAD, STATUS.DNC]);

/** Dispositions the dialer offers, and what each one does to the record. */
export const DISPOSITIONS = {
  "no-answer":     { label: "No answer",        status: STATUS.CONTACTED, retryDays: 2,  tone: "neutral" },
  "voicemail":     { label: "Left voicemail",   status: STATUS.CONTACTED, retryDays: 4,  tone: "neutral" },
  "gatekeeper":    { label: "Gatekeeper",       status: STATUS.CONTACTED, retryDays: 3,  tone: "neutral" },
  "callback":      { label: "Callback",         status: STATUS.CALLBACK,  retryDays: 1,  tone: "good"    },
  "emailed":       { label: "Emailed manually", status: STATUS.CONTACTED, retryDays: 5,  tone: "neutral" },
  "approve-email": { label: "Start sequence",   status: STATUS.APPROVED,  retryDays: null, tone: "good"  },
  "booked":        { label: "Booked",           status: STATUS.BOOKED,    retryDays: null, tone: "win"   },
  "not-interested":{ label: "Not interested",   status: STATUS.DEAD,      retryDays: null, tone: "bad"   },
  "bad-fit":       { label: "Bad fit",          status: STATUS.DEAD,      retryDays: null, tone: "bad"   },
  "dnc":           { label: "Do not contact",   status: STATUS.DNC,       retryDays: null, tone: "bad"   },
  "skip":          { label: "Skip for now",     status: STATUS.NEW,       retryDays: 14, tone: "neutral" },
};

/* ------------------------------------------------------------------ record */

export const domainKey = (websiteOrDomain = "") => {
  let s = String(websiteOrDomain).trim().toLowerCase();
  if (!s) return null;
  try {
    if (!/^https?:\/\//.test(s)) s = "https://" + s;
    return new URL(s).hostname.replace(/^www\./, "");
  } catch { return null; }
};

/** A fresh record from a sourcing run. */
export function newProspect(raw) {
  const domain = domainKey(raw.domain || raw.website);
  return {
    domain,
    business: raw.business || "",
    website: raw.website || (domain ? "https://" + domain : ""),
    phone: raw.phone || "",
    email: raw.email || "",
    contact: raw.contact || "",
    address: raw.address || "",
    city: raw.city || "",
    state: raw.state || "",
    industry: raw.industry || "Other",
    rating: raw.rating ?? null,
    reviews: raw.reviews ?? 0,
    placeId: raw.placeId || "",

    score: raw.score ?? 0,
    band: raw.band || "LOW",
    reasons: raw.reasons || [],
    flags: raw.flags || [],
    findings: raw.findings || [],
    audit: raw.audit || null,

    source: raw.source || "manual",
    sourcedAt: raw.sourcedAt || new Date().toISOString(),

    status: STATUS.NEW,
    attempts: 0,
    nextTouchAt: new Date().toISOString(),
    callbackAt: null,
    emailStage: 0,
    nextEmailAt: null,
    notes: "",
    history: [{ at: new Date().toISOString(), event: "sourced", detail: raw.source || "manual" }],
  };
}

/**
 * Merge a freshly sourced record over an existing one. Refreshes the facts
 * (audit, score, phone, email) and leaves every pipeline field alone — a
 * prospect mid-sequence must not be reset by a routine re-sweep.
 */
export function mergeProspect(existing, fresh) {
  return {
    ...existing,
    business: fresh.business || existing.business,
    website: fresh.website || existing.website,
    phone: fresh.phone || existing.phone,
    email: fresh.email || existing.email,
    address: fresh.address || existing.address,
    city: fresh.city || existing.city,
    state: fresh.state || existing.state,
    industry: fresh.industry || existing.industry,
    rating: fresh.rating ?? existing.rating,
    reviews: fresh.reviews ?? existing.reviews,
    score: fresh.score ?? existing.score,
    band: fresh.band || existing.band,
    reasons: fresh.reasons?.length ? fresh.reasons : existing.reasons,
    flags: fresh.flags?.length ? fresh.flags : existing.flags,
    findings: fresh.findings?.length ? fresh.findings : existing.findings,
    audit: fresh.audit || existing.audit,
    resourcedAt: new Date().toISOString(),
    history: [...(existing.history || []), { at: new Date().toISOString(), event: "re-sourced" }],
  };
}

/* ------------------------------------------------------------------- reads */

export async function allProspects() {
  const store = prospectStore();
  const { blobs } = await store.list();
  const out = await Promise.all((blobs || []).map(async ({ key }) => {
    try { return JSON.parse(await store.get(key)); } catch { return null; }
  }));
  return out.filter(Boolean);
}

export async function getProspect(domain) {
  const key = domainKey(domain);
  if (!key) return null;
  try { return JSON.parse(await prospectStore().get(key)); } catch { return null; }
}

export async function putProspect(p) {
  if (!p?.domain) return false;
  await prospectStore().set(p.domain, JSON.stringify(p));
  return true;
}

/**
 * The call queue, best-first.
 *
 * Ranked by score, but a due callback always outranks a cold record — someone
 * who asked to be called back is the warmest thing in the list and going cold
 * on them is the most expensive mistake available.
 */
export function callQueue(prospects, { limit = 40, minScore = 55, industry, city } = {}) {
  const now = Date.now();
  return prospects
    .filter(p => !TERMINAL.has(p.status))
    .filter(p => p.phone)
    .filter(p => p.score >= minScore)
    .filter(p => !industry || p.industry === industry)
    .filter(p => !city || p.city === city)
    .filter(p => !p.nextTouchAt || Date.parse(p.nextTouchAt) <= now)
    .sort((a, b) => {
      const aCb = a.status === STATUS.CALLBACK ? 1 : 0;
      const bCb = b.status === STATUS.CALLBACK ? 1 : 0;
      if (aCb !== bCb) return bCb - aCb;
      return (b.score || 0) - (a.score || 0);
    })
    .slice(0, limit);
}

/**
 * Record a dialer outcome. Returns the updated record.
 * `detail` is free text from the notes box; `callbackAt` is an ISO date.
 */
export function applyDisposition(p, code, { note = "", callbackAt = null } = {}) {
  const d = DISPOSITIONS[code];
  if (!d) return p;

  const now = new Date();
  p.status = d.status;
  p.attempts = (p.attempts || 0) + (code === "approve-email" ? 0 : 1);
  p.lastTouchedAt = now.toISOString();
  if (note) p.notes = [p.notes, `${now.toISOString().slice(0, 10)}: ${note}`].filter(Boolean).join("\n");

  if (d.status === STATUS.CALLBACK && callbackAt) {
    p.callbackAt = callbackAt;
    p.nextTouchAt = callbackAt;
  } else if (d.retryDays != null) {
    p.nextTouchAt = new Date(now.getTime() + d.retryDays * 864e5).toISOString();
  } else {
    p.nextTouchAt = null;
  }

  // Approving for the sequence starts the clock; the scheduled function picks
  // it up on its next run rather than sending inline.
  if (d.status === STATUS.APPROVED) {
    p.emailStage = 0;
    p.nextEmailAt = now.toISOString();
  }
  // Anything terminal must also stop an in-flight sequence.
  if (TERMINAL.has(d.status)) {
    p.nextEmailAt = null;
  }

  // Six unanswered dials is the point where persistence stops being a virtue.
  if (p.attempts >= 6 && p.status === STATUS.CONTACTED) {
    p.status = STATUS.DEAD;
    p.nextTouchAt = null;
    p.closedReason = "no contact after 6 attempts";
  }

  p.history = [...(p.history || []), {
    at: now.toISOString(), event: `dial:${code}`, detail: note || undefined,
  }];
  return p;
}

/* ------------------------------------------------------------------ meters */

const dayKey = (d = new Date()) => d.toISOString().slice(0, 10);

/** How many of `kind` have happened today. */
export async function meterGet(kind, day = dayKey()) {
  try {
    const raw = await meterStore().get(`${kind}:${day}`);
    return raw ? Number(JSON.parse(raw).n) || 0 : 0;
  } catch { return 0; }
}

export async function meterBump(kind, by = 1, day = dayKey()) {
  const n = (await meterGet(kind, day)) + by;
  try { await meterStore().set(`${kind}:${day}`, JSON.stringify({ n, day })); } catch { /* non-fatal */ }
  return n;
}

/** Guard on the admin token. Returns true when the caller is authorised. */
export function authorised(req) {
  const token = process.env.CPC_ADMIN_TOKEN;
  if (!token) return false;                       // fail closed
  const url = new URL(req.url);
  const given = url.searchParams.get("token") || req.headers.get("x-cpc-token");
  return given === token;
}
