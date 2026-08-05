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
