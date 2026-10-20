/**
 * ClearPath Content — the market snapshot form, in two steps.
 * ---------------------------------------------------------------------
 * The form asked for six things at once before giving anything back. Now the
 * first step is just a work email and a website, the two things the free
 * Visibility Report actually needs to start; name, industry, city and state
 * follow once someone has committed. The backend only requires the email.
 *
 * Progressive: every field is in the static HTML (Netlify detects the form
 * from it), and without JavaScript the whole form shows and submits as one.
 *
 * On submit it also:
 *   - remembers name and email for this tab only (sessionStorage), so /book/
 *     can fill them into the calendar, and never puts them in a URL
 *   - records the step and placement in analytics, never the values
 *   - stops the corner nudge asking again
 */
(function () {
  "use strict";
  var forms = document.querySelectorAll('form[name="market-snapshot"]');
  if (!forms.length) return;

  var css = document.createElement("style");
  css.textContent =
    "form.cap-2s .cap-step2{display:none}" +
    "form.cap-2s.cap-open .cap-step2{display:grid;gap:12px;animation:capIn .28s ease}" +
    "@keyframes capIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}" +
    "form.cap-2s .cap-err{color:#FFB4A8;font-size:13.5px;min-height:1em;margin:-4px 0 0}" +
    "form.cap-2s .cap-err:empty{display:none}" +
    "@media (prefers-reduced-motion:reduce){form.cap-2s.cap-open .cap-step2{animation:none}}";
  document.head.appendChild(css);

  function track(name, params) { try { if (window.cpTrack) window.cpTrack(name, params || {}); } catch (e) {} }
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  Array.prototype.forEach.call(forms, function (form) {
    var wrap = form.closest("[data-placement]");
    var placement = (wrap && wrap.getAttribute("data-placement")) || "form";
    var step2 = form.querySelector(".cap-step2");
    var btn = form.querySelector('button[type="submit"]');
    var email = form.querySelector('input[name="email"]');
    if (!step2 || !btn || !email) return;

    var finalLabel = btn.textContent;
    var err = document.createElement("p");
    err.className = "cap-err";
    err.setAttribute("role", "alert");
    btn.parentNode.insertBefore(err, btn);

    // Step 2's required fields must not block step 1 while they are hidden.
    var later = step2.querySelectorAll("[required]");
    function setRequired(on) { Array.prototype.forEach.call(later, function (el) { el.required = on; }); }

    form.classList.add("cap-2s");
    setRequired(false);
    btn.textContent = "Continue →";

    function open() {
      form.classList.add("cap-open");
      setRequired(true);
      btn.textContent = finalLabel;
      var first = step2.querySelector("input, select");
      if (first) setTimeout(function () { first.focus(); }, 60);
      track("snapshot_step1", { placement: placement });
    }

    form.addEventListener("submit", function (e) {
      err.textContent = "";
      if (!form.classList.contains("cap-open")) {
        e.preventDefault();
        if (!EMAIL.test(email.value.trim())) {
          err.textContent = "Please enter a valid work email.";
          email.focus();
          return;
        }
        open();
        return;
      }
      // Final step: let the browser validate, then submit normally to Netlify.
      try {
        var nm = form.querySelector('input[name="name"]');
        sessionStorage.setItem("cpc-prefill", JSON.stringify({
          name: nm ? nm.value.trim() : "", email: email.value.trim(),
        }));
      } catch (x) {}
      try { localStorage.setItem("cpc-nudge-off", String(Date.now() + 3650 * 864e5)); } catch (x) {}
      track("snapshot_submit", { placement: placement });
    });
  });
})();
