#!/usr/bin/env node
/**
 * ClearPath Content — /book/, where every "Request access" button goes.
 * -------------------------------------------------------------
 * 1,051 links opened Calendly cold in a new tab. "Request access" did not say
 * it meant a call, and nothing said what the call covered or why it is worth
 * thirty minutes of an owner's day. This page answers that, then puts the
 * calendar right there.
 *
 * Someone who has just requested a snapshot arrives with name and email filled
 * in: snapshot.js keeps them in this tab's session storage, and they go only
 * into Calendly's own URL parameters, never into this site's URLs.
 *
 *   node scripts/build-book.mjs
 */
import path from "node:path";
import { SITE, CAL, CSS, NAV, FOOTER, head, esc } from "./blog-theme.mjs";
import { ROOT, writePage } from "./site-links.mjs";

const url = `${SITE}/book/`;
const calUrl = `${CAL}?hide_gdpr_banner=1`;

const faq = [
  { q: "Is the call free?", a: "Yes. It is thirty minutes, there is no charge, and there is no obligation to sign up for anything." },
  { q: "What does “Request access” mean?", a: "We take one business per niche per metro, so the first thing we check is whether your category in your area is still open. The call is where that happens." },
  { q: "Is there a long contract?", a: "No. Plans are month-to-month, with no annual commitment." },
  { q: "Do I need to prepare?", a: "No. If it is easy, have your website and the services you most want more of in mind, and the half hour goes further." },
];

const ld = [
  { "@context": "https://schema.org", "@type": "WebPage", name: "Request access: a 30-minute call | ClearPath Content", url,
    isPartOf: { "@type": "WebSite", name: "ClearPath Content", url: `${SITE}/` },
    potentialAction: { "@type": "ScheduleAction", target: calUrl, name: "Book a 30-minute call" } },
  { "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
];

const html = head({
  title: "Request Access: Book a 30-Minute Call | ClearPath Content",
  description: "Book a free 30-minute call with ClearPath Content. We check whether your niche in your metro is open and show you what your market is searching.",
  url, og: "website", jsonld: ld,
}) + `<link rel="preconnect" href="https://assets.calendly.com">
<style>${CSS}
.bk{padding:54px 0 20px}
.bk h1{font-size:clamp(30px,4.4vw,46px);margin:16px 0 12px;max-width:20ch}
.bk .lede{color:var(--muted);font-size:17.5px;max-width:60ch}
.ticks{display:flex;flex-wrap:wrap;gap:8px 20px;margin-top:16px;font-size:14.5px;font-weight:600;color:var(--pine-2)}
.ticks span::before{content:"✓ ";color:var(--spring)}
.grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.25fr);gap:36px;align-items:start;padding:30px 0 40px}
.cal{grid-column:2;grid-row:1 / span 2;background:#fff;border:1px solid var(--border);border-radius:var(--r);overflow:hidden;
  box-shadow:var(--shadow);min-height:720px;position:sticky;top:100px}
.cal-load{padding:40px 28px;text-align:center;color:var(--muted)}
.cal-load a{font-weight:700;color:var(--pine-2)}
.calendly-inline-widget{min-width:300px;height:720px}
.info{grid-column:1}
.card{background:#fff;border:1px solid var(--border);border-radius:var(--r);padding:24px 26px;margin-bottom:16px;box-shadow:var(--shadow)}
.card h2{font-size:19px;margin-bottom:10px}
.card ul{list-style:none;display:grid;gap:9px}
.card li{position:relative;padding-left:22px;color:#33445A;font-size:15.5px}
.card li::before{content:"";position:absolute;left:2px;top:.62em;width:8px;height:8px;border-radius:50%;background:var(--spring)}
.card li b{color:var(--ink)}
.faq details{border-top:1px solid var(--border);padding:12px 0}
.faq details:first-of-type{border-top:0}
.faq summary{cursor:pointer;font-weight:600;color:var(--pine);list-style:none}
.faq summary::-webkit-details-marker{display:none}
.faq summary::after{content:"+";float:right;color:var(--spring);font-weight:700}
.faq details[open] summary::after{content:"–"}
.faq details p{margin-top:8px;color:#33445A;font-size:15px}
@media (max-width:900px){
  .grid{grid-template-columns:minmax(0,1fr);gap:18px}
  .cal{grid-column:1;grid-row:auto;position:static;min-height:0}
  .info{grid-column:1}
}
</style>
</head>
<body>
${NAV}
<main class="wrap bk">
  <span class="eyebrow">Request access</span>
  <h1>A 30-minute call to see if your market is open</h1>
  <p class="lede">We take one business per niche per metro. Pick a time and we'll check whether yours is open, show you what your buyers are searching, and tell you plainly whether this is a fit.</p>
  <div class="ticks"><span>Free</span><span>No obligation</span><span>Month-to-month if you go ahead</span></div>

  <div class="grid">
    <section class="cal" aria-label="Booking calendar">
      <div id="cal" class="cal-load">
        Loading the calendar…<br><br>
        <a href="${esc(calUrl)}" target="_blank" rel="noopener" data-cta="book-fallback">Open the booking calendar in a new tab →</a>
      </div>
    </section>
    <div class="info">
      <section class="card">
        <h2>What we'll cover</h2>
        <ul>
          <li><b>Whether your niche is open.</b> One business per niche per metro, so this comes first.</li>
          <li><b>What your market is searching.</b> The real questions buyers in your area type before they call anyone.</li>
          <li><b>Where you stand.</b> Which of those your site answers today, and who answers the rest.</li>
          <li><b>Which plan, if any.</b> What the first month would look like, or why it isn't the right time.</li>
        </ul>
      </section>
      <section class="card faq">
        <h2>Questions</h2>
        ${faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("\n        ")}
      </section>
    </div>
  </div>
</main>
${FOOTER}
<script>
(function () {
  var holder = document.getElementById("cal");
  var p = {};
  try { p = JSON.parse(sessionStorage.getItem("cpc-prefill") || "{}") || {}; } catch (e) {}
  var from = "";
  try { var r = document.referrer && new URL(document.referrer); if (r && r.origin === location.origin) from = r.pathname; } catch (e) {}
  function mount() {
    if (!window.Calendly) return;
    holder.className = "calendly-inline-widget";
    holder.innerHTML = "";
    // Calendly's prefill option did not fill the form in testing on the sister
    // site, so use its documented URL parameters. They go only to Calendly.
    var u = ${JSON.stringify(calUrl)};
    if (p.name) u += "&name=" + encodeURIComponent(p.name);
    if (p.email) u += "&email=" + encodeURIComponent(p.email);
    window.Calendly.initInlineWidget({
      url: u, parentElement: holder,
      // Shows Dean, inside Calendly, which page led to the booking.
      utm: { utmSource: "clearpath-content.com", utmMedium: "book-page", utmContent: from || "direct" },
    });
    var f = holder.querySelector("iframe");
    if (f) f.title = "Book a 30-minute call";
  }
  var s = document.createElement("script");
  s.src = "https://assets.calendly.com/assets/external/widget.js";
  s.async = true; s.onload = mount;
  document.head.appendChild(s);
})();
</script>
</body>
</html>`;

writePage(path.join(ROOT, "book", "index.html"), html);
console.log("[book] ✓ /book/");
