/* =====================================================================
   ClearPath Content — analytics (one file, every page)
   ---------------------------------------------------------------------
   Nothing loads until GA4_MEASUREMENT_ID is set; until then this is a safe
   no-op. Measurement only: no Google Signals, no ad personalization.

   Events, recorded with where they happened and never with what anyone typed.
   Mark snapshot_submit and booking_scheduled as Key events in GA4:
     snapshot_step1      entered a valid email in the snapshot form (placement)
     snapshot_submit     sent the snapshot form (placement)
     book_cta_click      clicked a "Request access" / book button (placement)
     booking_scheduled   completed a booking in the embedded Calendly calendar
     roi_used            changed a value in the ROI calculator (once per visit)
     capture_shown / capture_dismissed   the corner nudge
   ===================================================================== */
(function () {
  var GA4_MEASUREMENT_ID = "G-CK3G195QL2";   // ClearPath Content web stream

  // A placeholder is a run of X's; a real ID never is.
  var hasGA4 = !!GA4_MEASUREMENT_ID && !/X{6,}/.test(GA4_MEASUREMENT_ID);

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  if (hasGA4) {
    window.gtag("js", new Date());
    window.gtag("config", GA4_MEASUREMENT_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
    var g = document.createElement("script");
    g.async = true;
    g.src = "https://www.googletagmanager.com/gtag/js?id=" + GA4_MEASUREMENT_ID;
    document.head.appendChild(g);
  }

  // Beacon transport so an event fired just before the page navigates (a form
  // submit, a link click) still arrives.
  window.cpTrack = function (name, params) {
    if (!hasGA4) return;
    params = params || {};
    params.transport_type = "beacon";
    try { window.gtag("event", name, params); } catch (e) {}
  };

  var pageType = (function (p) {
    if (p === "/") return "home";
    if (/^\/blog\/[^/]+-guide\/?$|^\/blog\/(content-marketing-roi|industry-content-playbooks)\/?$/.test(p)) return "pillar";
    if (/^\/blog\/.+/.test(p)) return "article";
    if (/^\/content-marketing-for-/.test(p)) return "industry";
    if (/^\/content-marketing-/.test(p)) return "city";
    return p.replace(/^\/|\/$/g, "").split("/")[0] || "other";
  })(location.pathname);

  document.addEventListener("click", function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest("a[href]") : null;
    if (!a) return;
    var href = a.getAttribute("href") || "";
    if (href.indexOf("/book") === 0 || href.indexOf("calendly.com") !== -1) {
      window.cpTrack("book_cta_click", { placement: a.getAttribute("data-cta") || "link", page_type: pageType });
    }
  }, true);

  // Calendly reports a finished booking to the page it is embedded in. This
  // is the real conversion; a click on a book button is only intent.
  window.addEventListener("message", function (e) {
    if (e.origin === "https://calendly.com" && e.data && e.data.event === "calendly.event_scheduled") {
      window.cpTrack("booking_scheduled", { page_type: pageType });
    }
  });

  if (pageType === "roi-calculator") {
    var once = false;
    document.addEventListener("input", function () {
      if (once) return; once = true;
      window.cpTrack("roi_used", {});
    }, true);
  }
})();
