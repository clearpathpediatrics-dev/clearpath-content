/**
 * ClearPath Content — shared blog chrome (CSS, header, footer, head builder).
 * Matches the CPC brand system used on the homepage: Outfit + Plus Jakarta
 * Sans, navy #0B2240, spring blue #3E8EDE, light #F5F7FB.
 */

export const SITE = "https://clearpath-content.com";
export const BRAND = "ClearPath Content";
export const CONTACT = "deploy@clearpath-content.com";

export const esc = (s = "") => String(s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export const slugify = (s) => String(s).toLowerCase().trim()
  .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-")
  .slice(0, 72).replace(/^-|-$/g, "");

export const CSS = `
:root{
  --bg:#F5F7FB;--surface:#fff;--ink:#0E1B2E;--muted:#5B6B80;
  --pine:#0B2240;--pine-2:#153E6B;--spring:#3E8EDE;--spring-soft:#E4EFFA;
  --mint:#9CC9F0;--border:#E2E8F1;
  --shadow:0 6px 30px rgba(11,34,64,.08);--shadow-lg:0 24px 70px rgba(11,34,64,.13);
  --r:22px;--r-lg:32px;
  --display:'Outfit',sans-serif;--body:'Plus Jakarta Sans',sans-serif;--mono:'DM Mono',monospace;
}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--ink);font-family:var(--body);font-size:16px;line-height:1.7;-webkit-font-smoothing:antialiased;overflow-x:hidden}
a{color:var(--pine-2)}
::selection{background:var(--spring);color:#fff}
:focus-visible{outline:3px solid var(--spring);outline-offset:3px;border-radius:8px}
.wrap{max-width:1140px;margin:0 auto;padding:0 24px}
.narrow{max-width:760px;margin:0 auto;padding:0 24px}
h1,h2,h3{font-family:var(--display);font-weight:600;line-height:1.15;letter-spacing:-.02em;color:var(--pine)}
.eyebrow{display:inline-flex;align-items:center;gap:8px;font-weight:600;font-size:13px;letter-spacing:.04em;
  color:var(--pine-2);background:var(--spring-soft);padding:8px 18px;border-radius:999px}
.eyebrow::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--spring)}

nav{position:sticky;top:16px;z-index:50;padding:16px 24px 0}
.nav-pill{max-width:1140px;margin:0 auto;height:64px;background:rgba(255,255,255,.86);backdrop-filter:blur(14px);
  border:1px solid var(--border);border-radius:999px;box-shadow:var(--shadow);
  display:flex;align-items:center;justify-content:space-between;padding:0 12px 0 26px}
.wordmark{font-family:var(--display);font-weight:700;font-size:19px;text-decoration:none;display:flex;align-items:center;gap:10px;color:var(--pine)}
.nav-links{display:flex;gap:26px;align-items:center;font-size:14.5px;font-weight:500}
.nav-links a{text-decoration:none;color:var(--muted)}
.nav-links a:hover{color:var(--pine)}
.btn{display:inline-block;font-weight:600;font-size:15px;padding:13px 26px;border-radius:999px;text-decoration:none;
  background:linear-gradient(135deg,#2F72C4,#1F5FA8);color:#fff;box-shadow:0 8px 24px rgba(31,95,168,.35)}
.btn:hover{transform:translateY(-2px)}
.nav-pill .btn{padding:11px 22px;font-size:14px}

footer{background:#fff;border-top:1px solid var(--border);margin-top:80px;padding:48px 0 40px;font-size:13.5px;color:var(--muted)}
.foot-grid{display:flex;justify-content:space-between;flex-wrap:wrap;gap:20px;align-items:flex-start}
footer a{color:var(--muted);text-decoration:none}
footer a:hover{color:var(--pine-2);text-decoration:underline}
.foot-nav{display:flex;gap:20px;flex-wrap:wrap}
@media(max-width:800px){.nav-links a:not(.btn){display:none}}
`;

export const NAV = `
<nav>
  <div class="nav-pill">
    <a class="wordmark" href="/">
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="24" height="24" rx="8" fill="#0B2240"/>
        <path d="M6.5 19.5 C 10.5 18.5, 11 13.5, 13.2 10.5 C 15.2 7.8, 17.8 7, 19.8 7" stroke="#fff" stroke-width="2.2" stroke-linecap="round" fill="none" stroke-dasharray="0.1 4.4"/>
        <path d="M6.5 19.5 C 10.5 18.5, 11 13.5, 13.2 10.5" stroke="#fff" stroke-width="2.2" stroke-linecap="round" fill="none"/>
        <circle cx="19.8" cy="7" r="2.4" fill="#3E8EDE"/>
      </svg>
      ClearPath&nbsp;Content
    </a>
    <div class="nav-links">
      <a href="/#why">Why visibility</a>
      <a href="/#method">Methodology</a>
      <a href="/blog/">Field notes</a>
      <a href="/#pricing">Pricing</a>
      <a class="btn" href="https://calendly.com/clearpathpediatrics/30min" target="_blank" rel="noopener">Request access</a>
    </div>
  </div>
</nav>`;

export const FOOTER = `
<footer>
  <div class="wrap foot-grid">
    <span>ClearPath Content (CPC) — Visibility infrastructure</span>
    <nav class="foot-nav">
      <a href="/">Home</a>
      <a href="/#method">Methodology</a>
      <a href="/blog/">Field notes</a>
      <a href="/what-you-get">What you get</a>
      <a href="/faq">FAQ</a>
      <a href="/#pricing">Pricing</a>
    </nav>
  </div>
  <div class="wrap" style="margin-top:18px">© 2026 ClearPath Content (CPC) · All published work remains client property</div>
</footer>`;

export function head({ title, description, url, keywords = [], jsonld = [], og = "article" }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${keywords.length ? `<meta name="keywords" content="${esc(keywords.join(", "))}">` : ""}
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${url}">
<link rel="icon" type="image/svg+xml" href="/assets/cpc-mark.svg">
<meta property="og:type" content="${og}">
<meta property="og:site_name" content="${BRAND}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/assets/cpc-og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
${jsonld.map(o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join("\n")}
`;
}
