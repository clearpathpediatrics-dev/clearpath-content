# The lead pipeline

Two halves feeding one scored list. Inbound runs itself. Outbound sources and
scores itself, and waits for you before it contacts anyone.

```
INBOUND  form ──▶ audit ──▶ score ──▶ snapshot email ──▶ alert you ──▶ 3-touch nurture
                                                                        (auto-stops)

OUTBOUND Places ──▶ audit ──▶ score ──▶ dialer queue ──▶ [ you press a button ]
                                                            ├─▶ call
                                                            └─▶ cold sequence (3 touches)
```

Both halves score on the same 0–100 ICP model, so a form fill and a cold
prospect sit in one ranked list and are directly comparable.

---

## One-time setup

### 1. Environment variables (Netlify → Site configuration → Environment)

| Variable | Needed for | Notes |
|---|---|---|
| `RESEND_API_KEY` | all email | already set |
| `CPC_ADMIN_TOKEN` | dialer, pipeline board, import | long random string — this is the only thing guarding your contact data |
| `CPC_POSTAL_ADDRESS` | all email | required by CAN-SPAM on commercial mail |
| `CPC_CALENDLY_URL` | all CTAs | optional — defaults to `calendly.com/admin-clearpath-content/30min` |
| `GOOGLE_PLACES_API_KEY` | sourcing | local only; never needs to reach Netlify |
| `CPC_COLD_FROM_EMAIL` | cold sequence | separate domain, see below. **Unset = cold email off** |
| `CPC_COLD_START_DATE` | cold sequence | `YYYY-MM-DD`, drives warmup. **Unset = cold email off** |
| `CPC_COLD_DAILY_MAX` | cold sequence | ceiling after warmup, default 75 |

### 2. Google Places key

1. console.cloud.google.com → new project → enable **Places API (New)**
2. Create an API key, restrict it to that API
3. `export GOOGLE_PLACES_API_KEY=…` in your shell profile

Text Search is about $32 per 1,000 requests. A sweep of the 19 under-served
metros across 8 categories is roughly **$18** and returns several thousand
scored businesses. The full 48-metro national sweep is about **$46**.

### 3. The cold sending domain

Do not send cold email from `clearpath-content.com`. That domain carries the
snapshot emails people actually asked for. Cold volume earns spam complaints at
a rate transactional mail never does, and once the domain's reputation drops,
requested snapshots start landing in spam — which kills the half of the funnel
that already works.

1. Buy a second domain — `clearpathcontent.co`, `getclearpath.com`, similar
2. Add it in Resend, verify SPF/DKIM/DMARC
3. Point it at the same site so links resolve
4. Warm it for ~3 weeks before real volume — the ramp below does this for you
5. Set `CPC_COLD_FROM_EMAIL="Dean <dean@thatdomain.com>"`
6. Set `CPC_COLD_START_DATE` to the day you want sending to begin

Warmup ramp, automatic: **10/day → 20 → 35 → 50 → 65 → ceiling**, one step per
week. Each day's allowance is spread across six runs between 8am and 1pm
Phoenix, weekdays only, so nothing goes out in a burst.

---

## Daily use

### Source prospects (as needed, not daily)

```bash
npm run source:plan                    # show the plan and the cost, call nothing
npm run source -- --metros mesa,tempe --industries HVAC
npm run source:push                    # upload to the live store
```

Runs on your machine — the audit is too network-heavy for a serverless timeout.
Re-running is always safe: it merges on domain and never resets a prospect
that's already in the pipeline.

Useful flags: `--all` (every metro), `--cells 40` (cost cap), `--min 65` (only
keep strong fits), `--list` (see categories and metros).

### Work the queue

```
https://clearpath-content.com/.netlify/functions/dialer?token=YOUR_TOKEN
```

One prospect per screen, ranked, with the audit findings and a talk track
already loaded. Due callbacks always sort above cold records.

- **Call** — `tel:` link, works from the phone
- **Email** — opens your mail client with the personalised draft filled in
- **Start email sequence** — hands them to the automation instead
- Keys `1` no answer · `2` voicemail · `3` callback · `4` sequence · `5` booked · `0` not interested

Preview it locally without deploying: `npm run dialer:preview`

### Watch inbound

```
https://clearpath-content.com/.netlify/functions/leads?token=YOUR_TOKEN
```

---

## What is automatic and what is not

**Automatic:** sourcing, auditing, scoring, email discovery, the inbound
snapshot, the inbound nurture, the cold sequence once approved, warmup pacing,
daily caps, unsubscribes, and stopping every sequence on any positive signal.

**Not automatic, on purpose:**

- **Nothing is contacted without you approving it.** Prospects land in `new`.
  Only the dialer moves them to `approved`, and only `approved` is eligible for
  the sequence. An unattended sourcing bug can waste API spend; it cannot mail
  four thousand strangers.
- **Calls are placed by you.** A click-to-call queue is fine. An auto-dialer
  placing calls without a human is where TCPA exposure lives, and Places returns
  plenty of mobile numbers for small contractors.
- **Replies are read by you.** Replies go to `CPC_ALERT_EMAIL`. Mark the outcome
  in the dialer — that is what stops the sequence.

## The maths

One business per category per metro: 48 metros × 12 categories = **576 slots
total**. At $199–499/mo, roughly **10 closes** is $2–5k MRR.

That is the argument for forty excellent contacts a day over four thousand
generic ones. Every touch here quotes something verifiable from the recipient's
own website. That is the entire advantage, and volume spam throws it away.
