#!/usr/bin/env node
/**
 * ClearPath Content — one-off utility pages.
 *   /snapshot-requested/  — Netlify Forms success page for the capture block
 *
 * Run: node scripts/build-misc.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CAL } from "./pages.data.mjs";
import { SITE, CSS, NAV, FOOTER, head } from "./blog-theme.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const page = head({
  title: "Request received | ClearPath Content",
  description: "Your market snapshot request is in. Here is what happens next.",
  url: `${SITE}/snapshot-requested`,
  og: "website",
}) + `<meta name="robots" content="noindex, follow">
<style>${CSS}
.ty{max-width:680px;margin:0 auto;padding:70px 24px 20px;text-align:center}
.ty h1{font-size:clamp(30px,4.4vw,44px);margin:20px 0 16px}
.ty>p{color:var(--muted);font-size:17.5px;margin-bottom:14px}
.tick{width:66px;height:66px;margin:0 auto;border-radius:50%;background:var(--spring-soft);
  display:flex;align-items:center;justify-content:center;font-size:30px;color:var(--spring)}
.next{background:#fff;border:1px solid var(--border);border-radius:var(--r);padding:28px 30px;
  margin:32px 0 24px;text-align:left;box-shadow:var(--shadow)}
.next h2{font-size:16px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);margin-bottom:14px}
.next ol{margin:0 0 0 20px;color:#33445A}
.next li{padding:6px 0;font-size:16px}
.links{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:26px}
.links a{background:var(--spring-soft);color:var(--pine-2);border-radius:999px;padding:10px 20px;
  font-size:14px;font-weight:600;text-decoration:none}
.links a:hover{background:#D3E5F7}
</style>
</head>
<body>
${NAV}
<main class="ty">
  <div class="tick">✓</div>
  <h1>Your snapshot is on the way</h1>
  <p>Thanks — we have your request. Snapshots are put together by hand, so give it a business day or two.</p>
  <div class="next">
    <h2>What happens next</h2>
    <ol>
      <li>We look at what people in your market are actually searching in your category.</li>
      <li>We check which of those questions your site currently answers, and who is answering the rest.</li>
      <li>You get one email with the findings. No sequence, no drip, no sales cadence.</li>
    </ol>
  </div>
  <p>If you would rather not wait, the calendar below is the fastest path — thirty minutes, and you will know whether your niche in your metro is still open.</p>
  <p><a class="btn" href="${CAL}" target="_blank" rel="noopener" style="margin-top:8px">Book a 30-minute call</a></p>
  <div class="links">
    <a href="/what-you-get">What you get →</a>
    <a href="/industries">Industries →</a>
    <a href="/blog/organic-visibility-guide">Start with the visibility guide →</a>
  </div>
</main>
${FOOTER}
</body>
</html>`;

fs.mkdirSync(path.join(ROOT, "snapshot-requested"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "snapshot-requested", "index.html"), page);
console.log("  ✓ /snapshot-requested");

/* ---- /about-our-audit — what ClearPathContentBot does, referenced in its UA */
const auditPage = head({
  title: "About Our Site Audit | ClearPath Content",
  description: "What ClearPathContentBot looks at when we audit a website, what we do not collect, and how to opt out. Plain-English disclosure of our crawler.",
  url: `${SITE}/about-our-audit`,
  og: "website",
}) + `<style>${CSS}
.doc{max-width:720px;margin:0 auto;padding:56px 24px 10px}
.doc h1{font-size:clamp(28px,4vw,40px);margin:18px 0 16px}
.doc h2{font-size:21px;margin:34px 0 12px}
.doc p,.doc li{color:#33445A;font-size:16.5px;margin-bottom:13px}
.doc ul{margin:0 0 18px 22px}
.doc code{background:#E4EFFA;padding:2px 7px;border-radius:6px;font-family:var(--mono);font-size:14px}
</style>
</head>
<body>
${NAV}
<main class="doc">
  <span class="eyebrow">Disclosure</span>
  <h1>About our site audit</h1>
  <p>When you request a market snapshot, or when we research a business we are considering contacting, we fetch a handful of pages from the public website. This page explains exactly what that involves, because you should not have to guess.</p>

  <h2>What identifies us</h2>
  <p>Our requests carry the user agent <code>ClearPathContentBot/1.0</code> and link back to this page. A few requests per site, a few seconds apart. Nothing sustained, nothing aggressive.</p>

  <h2>What we look at</h2>
  <ul>
    <li>The homepage, and a blog or resources section if one is linked</li>
    <li><code>/sitemap.xml</code>, to count how many pages are published</li>
    <li>Whether structured data is present, since AI answer engines depend on it</li>
    <li>Whether the site links to lead marketplaces such as Angi or Thumbtack</li>
    <li>Whether the business's own city appears in the page text</li>
  </ul>
  <p>All of it is public information — the same things anyone sees opening the site in a browser.</p>

  <h2>What we do not do</h2>
  <ul>
    <li>We do not attempt to access anything behind a login, paywall or form</li>
    <li>We do not collect personal data about individuals</li>
    <li>We do not submit forms, click buttons, or interact with the site in any way</li>
    <li>We do not resell, publish or share what we find with anyone else</li>
    <li>We do not crawl at volume — this is a handful of pages, not a spider</li>
  </ul>

  <h2>How to opt out</h2>
  <p>Add this to your <code>robots.txt</code> and we will not fetch your site:</p>
  <p><code>User-agent: ClearPathContentBot</code><br><code>Disallow: /</code></p>
  <p>You can also just tell us. Reply to any email from us and we will stop, remove anything we hold on you, and not contact you again.</p>

  <h2>Why we do it</h2>
  <p>Because generic outreach wastes everyone's time. If we are going to email a business, the least we can do is look at their site first and say something true and specific about it — or work out that they are not a fit and leave them alone. Most of the businesses we audit never hear from us at all, because the audit tells us the program would not help them.</p>

  <div class="related" style="display:flex;gap:10px;flex-wrap:wrap;margin:26px 0 10px">
    <a href="/what-you-get" style="background:var(--spring-soft);color:var(--pine-2);border-radius:999px;padding:10px 20px;font-size:14px;font-weight:600;text-decoration:none">What you get →</a>
    <a href="/faq" style="background:var(--spring-soft);color:var(--pine-2);border-radius:999px;padding:10px 20px;font-size:14px;font-weight:600;text-decoration:none">FAQ →</a>
  </div>
</main>
${FOOTER}
</body>
</html>`;

fs.mkdirSync(path.join(ROOT, "about-our-audit"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "about-our-audit", "index.html"), auditPage);
console.log("  ✓ /about-our-audit");
