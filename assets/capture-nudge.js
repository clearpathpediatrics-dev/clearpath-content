/**
 * ClearPath Content — capture nudge.
 *
 * Every page already carries the snapshot form; the problem is that most
 * readers never scroll to it. This surfaces a single, quiet prompt at the
 * moment someone is about to leave, and then never bothers them again.
 *
 * Deliberately not a modal. The site's whole argument is that it does not do
 * the interruptive thing, and a lightbox over an article about not being
 * interruptive is a bad look. A dismissible corner card is the ceiling.
 *
 * Rules it holds to:
 *   - never on a page with no capture form
 *   - never while the form is already on screen
 *   - never after the reader dismisses it (60 days) or submits (permanently)
 *   - once per session, full stop
 */
(function () {
  "use strict";

  var KEY_OFF = "cpc-nudge-off";
  var KEY_SEEN = "cpc-nudge-seen";
  var DWELL_MS = 45000;
  var SCROLL_AT = 0.55;

  function stored(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  // Suppressed for good, or already shown this session.
  var off = stored(KEY_OFF);
  if (off && Number(off) > Date.now()) return;
  try { if (sessionStorage.getItem(KEY_SEEN)) return; } catch (e) {}

  var form = document.querySelector(".capture");
  if (!form) return;

  // Styles ride along with the script so backfilling an existing page is a
  // single <script> tag — this site has no build step and no shared CSS file.
  var css = document.createElement("style");
  css.textContent = [
    ".cpc-nudge{position:fixed;right:20px;bottom:20px;z-index:60;width:330px;max-width:calc(100vw - 32px);",
    "  background:#0B2240;color:#fff;border-radius:18px;padding:20px 22px 18px;box-shadow:0 14px 44px rgba(6,20,40,.34);",
    "  font-family:inherit;opacity:0;transform:translateY(14px);transition:opacity .28s ease,transform .28s ease}",
    ".cpc-nudge.on{opacity:1;transform:translateY(0)}",
    ".cpc-nudge strong{display:block;font-size:16.5px;font-weight:700;letter-spacing:-.01em;margin-bottom:7px}",
    ".cpc-nudge p{margin:0 0 14px;font-size:13.8px;line-height:1.55;color:#BBD3EA}",
    ".cpc-nudge-go{display:inline-block;background:#3E8EDE;color:#fff;text-decoration:none;font-weight:700;",
    "  font-size:14px;padding:11px 20px;border-radius:999px}",
    ".cpc-nudge-x{position:absolute;top:9px;right:11px;background:none;border:0;color:#7FA6CE;font-size:23px;",
    "  line-height:1;cursor:pointer;padding:4px 7px;border-radius:8px}",
    ".cpc-nudge-x:hover{color:#fff}",
    // Below 1040px the site pins its own "Request access" bar to the bottom of
    // the viewport. Sit above it rather than under it.
    "@media(max-width:1040px){.cpc-nudge{bottom:92px}}",
    "@media(max-width:600px){.cpc-nudge{right:12px;left:12px;width:auto;padding:18px 18px 16px}}",
    "@media(prefers-reduced-motion:reduce){.cpc-nudge{transition:none}}",
  ].join("\n");
  document.head.appendChild(css);

  var shown = false, card = null;

  function inView(el) {
    var r = el.getBoundingClientRect();
    return r.top < (window.innerHeight || 0) && r.bottom > 0;
  }

  function dismiss(days) {
    if (!card) return;
    card.classList.remove("on");
    store(KEY_OFF, String(Date.now() + (days || 60) * 864e5));
    setTimeout(function () { if (card && card.parentNode) card.parentNode.removeChild(card); }, 300);
  }

  function show() {
    if (shown || inView(form)) return;
    shown = true;
    try { sessionStorage.setItem(KEY_SEEN, "1"); } catch (e) {}

    card = document.createElement("div");
    card.className = "cpc-nudge";
    card.setAttribute("role", "complementary");
    card.innerHTML =
      '<button class="cpc-nudge-x" aria-label="Dismiss">&times;</button>' +
      '<strong>Before you go</strong>' +
      '<p>We will send you a short snapshot of what your market is actually searching for, and who is answering it today. Free, and one click unsubscribes.</p>' +
      '<a class="cpc-nudge-go" href="#">See my market snapshot</a>';

    card.querySelector(".cpc-nudge-x").addEventListener("click", function () { dismiss(60); });
    card.querySelector(".cpc-nudge-go").addEventListener("click", function (e) {
      e.preventDefault();
      dismiss(60);
      form.scrollIntoView({ behavior: "smooth", block: "center" });
      var email = form.querySelector('input[type="email"]');
      if (email) setTimeout(function () { email.focus({ preventScroll: true }); }, 550);
    });

    document.body.appendChild(card);
    requestAnimationFrame(function () { card.classList.add("on"); });
  }

  // Someone who submits should never see this again on any page.
  form.addEventListener("submit", function () { store(KEY_OFF, String(Date.now() + 3650 * 864e5)); });

  // Desktop: the cursor leaving through the top of the window.
  document.addEventListener("mouseout", function (e) {
    if (!e.relatedTarget && e.clientY <= 0) show();
  });

  // Touch: there is no exit intent, so use depth instead.
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (shown || ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var h = document.documentElement.scrollHeight - window.innerHeight;
      if (h > 0 && window.scrollY / h > SCROLL_AT) show();
    });
  }, { passive: true });

  // A reader who has stayed this long is interested and may simply not scroll.
  setTimeout(show, DWELL_MS);
})();
