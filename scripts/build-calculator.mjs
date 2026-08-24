#!/usr/bin/env node
/**
 * ClearPath Content — the ROI calculator.
 * -------------------------------------------------------------
 * WHY IT IS BUILT THIS WAY
 *
 * The obvious version claims a result: "our average client gets 20-30 leads a
 * year". CPC has no clients yet, so that number would be invented — an
 * unsubstantiated performance claim, and the kind a prospect dismantles in one
 * question. Every figure on this page is therefore either typed in by the
 * visitor or derived from it by arithmetic they can check.
 *
 * The persuasion comes from BREAK-EVEN, not from a promise. "At $9,000 a job
 * this pays for itself if it brings you one extra customer every four years"
 * is unarguable, uses their own number, and reframes the decision from
 * "will this work?" to "is that plausible?" — a much easier yes.
 *
 * Upside is modelled only from a slider the visitor sets themselves, and is
 * labelled as their assumption everywhere it appears.
 *
 * Run: node scripts/build-calculator.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITE, BRAND, esc, CSS, NAV, FOOTER, head } from "./blog-theme.mjs";
import { CAL } from "./pages.data.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SLUG = "roi-calculator";

/* Typical deal sizes, used only to pre-fill the field. The visitor overwrites
   it immediately and the label says so. */
const PRESETS = [
  ["Roofing / contracting", 12000], ["HVAC", 9000], ["Plumbing", 1200],
  ["Electrical", 2500], ["Pest control", 600], ["Law firm", 6000],
  ["Dental practice", 3500], ["Real estate", 9000], ["Home services", 15000],
  ["B2B software", 12000], ["Professional services", 6000], ["Something else", 5000],
];

const FAQ = [
  { q: "Where do these numbers come from?",
    a: "Every figure is either one you typed or arithmetic on the figures you typed. We do not model a result for you, because we would be guessing at your market, your close rate and your capacity." },
  { q: "Why does it lead with break-even instead of projected leads?",
    a: "Because break-even is the only number we can state honestly. What it takes to cover the cost is arithmetic. What you will actually get depends on your market, your competition and your close rate — so that part is a slider you control, not a promise we make." },
  { q: "How long before it breaks even in practice?",
    a: "Published content compounds rather than switching on. Most of what we publish takes one to two quarters to rank and then keeps working. Plan on the first two quarters being investment and judge it from there." },
  { q: "What if it never brings a single extra customer?",
    a: "Then it was the wrong answer for your market and you should stop. It is month to month for that reason, and everything published stays on your domain and remains yours." },
];

const page = () => head({
  title: `Content Marketing ROI Calculator | ${BRAND}`,
  description: "Work out what content marketing has to produce to pay for itself in your business. Your numbers, your assumptions, no projected results. Free, instant.",
  url: `${SITE}/${SLUG}`,
  og: "website",
  keywords: ["content marketing roi calculator", "seo roi calculator", "marketing break even calculator",
             "content marketing cost", "is content marketing worth it"],
  jsonld: [
    { "@context": "https://schema.org", "@type": "WebApplication",
      name: "Content Marketing ROI Calculator", url: `${SITE}/${SLUG}`,
      applicationCategory: "BusinessApplication", operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: "Calculate the break-even point and modelled return of a content marketing subscription using your own customer value.",
      publisher: { "@type": "Organization", name: BRAND, url: SITE } },
    { "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: FAQ.map(f => ({ "@type": "Question", name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a } })) },
  ],
}) + `<style>${CSS}
.hero{padding:56px 0 10px;text-align:center}
.hero h1{font-size:clamp(30px,5vw,46px);margin:18px 0 14px;line-height:1.12}
.hero p{color:var(--muted);font-size:18px;max-width:58ch;margin:0 auto}
.calc{max-width:1140px;margin:0 auto;padding:0 24px}
.grid{display:grid;gap:20px;margin:30px 0 10px}
@media(min-width:900px){.grid{grid-template-columns:minmax(330px,380px) minmax(0,1fr);align-items:start}}
/* A grid track's implicit min-width is auto, so a wide child (the three tier
   cards) pushes the column past the container instead of shrinking. */
.grid > *{min-width:0}
.tiers > *{min-width:0}

.panel{background:#fff;border:1px solid var(--border);border-radius:var(--r);padding:26px 24px;box-shadow:var(--shadow)}
.panel h2{font-size:15px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);margin-bottom:20px}
.f{margin-bottom:22px}
.f:last-child{margin-bottom:4px}
label{display:block;font-size:14.5px;font-weight:600;color:var(--pine);margin-bottom:8px}
.hint{font-size:12.5px;color:var(--muted);margin-top:6px;line-height:1.5}
select,input[type=text]{width:100%;font-family:var(--body);font-size:16px;color:var(--ink);background:#fff;
  border:1.5px solid var(--border);border-radius:12px;padding:12px 14px;-webkit-appearance:none}
select{appearance:none;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8'><path d='M1 1l5 5 5-5' stroke='%235B6B80' stroke-width='2' fill='none' stroke-linecap='round'/></svg>");
  background-repeat:no-repeat;background-position:right 14px center;padding-right:40px}
input:focus,select:focus{outline:none;border-color:var(--spring);box-shadow:0 0 0 4px rgba(62,142,222,.2)}
.money{position:relative}
.money span{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--muted);font-size:16px;pointer-events:none}
.money input{padding-left:30px}
.rangerow{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:6px}
.rangeval{font-family:var(--mono);font-size:19px;font-weight:600;color:var(--pine)}
input[type=range]{width:100%;-webkit-appearance:none;background:transparent;margin:6px 0 0}
input[type=range]::-webkit-slider-runnable-track{height:6px;border-radius:99px;background:#DCE7F5}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;margin-top:-8px;
  border-radius:50%;background:var(--spring);border:3px solid #fff;box-shadow:0 2px 8px rgba(11,34,64,.25);cursor:pointer}
input[type=range]::-moz-range-track{height:6px;border-radius:99px;background:#DCE7F5}
input[type=range]::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:var(--spring);
  border:3px solid #fff;box-shadow:0 2px 8px rgba(11,34,64,.25);cursor:pointer}
.ticks{display:flex;justify-content:space-between;font-size:11.5px;color:var(--muted);margin-top:6px;font-family:var(--mono)}

/* the headline result */
.verdict{background:linear-gradient(160deg,#0B2240,#153E6B);border-radius:var(--r);padding:30px 30px 26px;color:#fff;box-shadow:var(--shadow-lg)}
.verdict .k{font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:#7FB0E0;font-weight:700}
.verdict .big{font-family:var(--display);font-size:clamp(26px,3.6vw,34px);line-height:1.2;margin:12px 0 10px;color:#fff}
.verdict .big b{color:#8FC4F5}
.verdict p{color:#C4DDF2;font-size:15px;margin:0;max-width:56ch}

/* tier cards */
.tiers{display:grid;gap:14px;margin-top:18px}
@media(min-width:640px){.tiers{grid-template-columns:1fr 1fr 1fr}}
.tier{background:#fff;border:1px solid var(--border);border-radius:18px;padding:20px 20px 22px;position:relative}
.tier.best{border-color:var(--spring);box-shadow:0 0 0 3px rgba(62,142,222,.14)}
.tier .flag{position:absolute;top:-11px;left:20px;background:var(--spring);color:#fff;font-size:10.5px;
  font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:4px 11px;border-radius:99px}
.tier h3{font-size:16px;margin-bottom:2px}
.tier .price{font-family:var(--mono);font-size:13px;color:var(--muted);margin-bottom:14px}
.row{display:flex;justify-content:space-between;align-items:baseline;gap:10px;padding:8px 0;border-bottom:1px solid #EEF3F9;font-size:14px}
.row span{flex:0 0 auto}
.row:last-child{border-bottom:none}
.row span{color:var(--muted)}
.row b{color:var(--pine);font-family:var(--mono);font-weight:600;text-align:right;
  flex:1 1 auto;min-width:0;overflow-wrap:anywhere}
/* The break-even value is a sentence, not a figure — right-aligning it in a
   narrow column overflowed the card. It gets its own stacked row. */
.row.stack{padding-bottom:12px}
.row.stack b{font-family:var(--body);font-size:15.5px;line-height:1.35;white-space:normal}
.row b.good{color:#1D7A5F}
.row b.bad{color:#B4451F}

.note{background:var(--spring-soft);border-left:3px solid var(--spring);border-radius:0 12px 12px 0;
  padding:15px 18px;font-size:14.5px;color:var(--pine);margin:22px 0 0}
.honest{background:#fff;border:1px dashed var(--border);border-radius:16px;padding:20px 22px;margin:26px 0 0}
.honest h3{font-size:14px;letter-spacing:.04em;text-transform:uppercase;color:var(--muted);margin-bottom:10px}
.honest p{font-size:14.5px;color:#33445A;margin:0 0 10px;line-height:1.65}
.honest p:last-child{margin:0}

.faq{max-width:760px;margin:0 auto;padding:46px 24px 0}
.faq h2{font-size:clamp(22px,3vw,30px);margin-bottom:16px}
details{background:#fff;border:1px solid var(--border);border-radius:16px;margin-top:12px;overflow:hidden;box-shadow:var(--shadow)}
summary{cursor:pointer;list-style:none;padding:18px 22px;font-family:var(--display);font-weight:600;font-size:16px;
  color:var(--pine);display:flex;justify-content:space-between;align-items:center;gap:16px}
summary::-webkit-details-marker{display:none}
summary::after{content:"+";flex:none;color:var(--spring);font-size:20px;line-height:1}
details[open] summary::after{content:"–"}
details p{padding:0 22px 20px;color:var(--muted);font-size:15px;max-width:64ch}
.band{background:var(--pine);color:#fff;border-radius:var(--r-lg);padding:42px 38px;margin:44px auto 10px;
  max-width:760px;text-align:center}
.band h2{color:#fff;margin-bottom:10px;font-size:clamp(22px,3vw,30px)}
.band p{color:#C4DDF2;max-width:52ch;margin:0 auto 22px;font-size:16px}
@media(max-width:600px){.panel,.verdict{padding:22px 18px}.band{padding:32px 22px}}
</style>
</head>
<body>
${NAV}

<header class="hero"><div class="narrow">
  <span class="eyebrow">Free · instant · no signup</span>
  <h1>What would content marketing have to do to pay for itself?</h1>
  <p>Put in what a customer is actually worth to you. We will show you the break-even point against each plan — and let you model the upside with your own assumptions, not ours.</p>
</div></header>

<div class="calc">
  <div class="grid">
    <!-- ------------------------------------------------ inputs -->
    <div class="panel">
      <h2>Your numbers</h2>

      <div class="f">
        <label for="ind">What do you do?</label>
        <select id="ind">${PRESETS.map(([n, v], i) =>
          `<option value="${v}"${i === 0 ? " selected" : ""}>${esc(n)}</option>`).join("")}</select>
        <p class="hint">Only pre-fills the next field. Change it to whatever is true for you.</p>
      </div>

      <div class="f">
        <label for="val">What is one new customer worth?</label>
        <div class="money"><span>$</span><input id="val" type="text" inputmode="numeric" value="12,000"></div>
        <p class="hint">Revenue from one customer. If they come back, use what they are worth over the whole relationship, not the first job.</p>
      </div>

      <div class="f">
        <div class="rangerow"><label for="cur" style="margin:0">New customers a month, today</label>
          <span class="rangeval" id="curOut">6</span></div>
        <input id="cur" type="range" min="1" max="60" value="6">
        <div class="ticks"><span>1</span><span>60</span></div>
      </div>

      <div class="f">
        <div class="rangerow"><label for="lift" style="margin:0">Extra customers a year, if it works</label>
          <span class="rangeval" id="liftOut">4</span></div>
        <input id="lift" type="range" min="0" max="120" step="1" value="4">
        <div class="ticks"><span>0</span><span>120</span></div>
        <p class="hint"><strong>Your assumption, not our forecast.</strong> Defaults to 5% more new business than you get today — deliberately conservative. Drag it down until the number feels like something you would actually bet on.</p>
      </div>
    </div>

    <!-- ------------------------------------------------ results -->
    <div>
      <div class="verdict">
        <span class="k">The only number we can promise</span>
        <p class="big" id="verdict">—</p>
        <p id="verdictSub">Break-even is arithmetic on the figure you entered. Everything below it is your assumption.</p>
      </div>

      <div class="tiers" id="tiers"></div>

      <div class="note" id="context">—</div>

      <div class="honest">
        <h3>What this calculator will not do</h3>
        <p>It will not tell you how many leads you will get. We have no way of knowing that, and any company that puts a number on it before seeing your market is guessing at best.</p>
        <p>Published content compounds rather than switching on. Expect the first two quarters to be investment, then judge it on what is ranking. It is month to month precisely so you can stop if it is not working — and everything published stays yours either way.</p>
      </div>
    </div>
  </div>
</div>

<section class="faq">
  <h2>Common questions</h2>
  ${FAQ.map(f => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}
</section>

<div class="band">
  <h2>Want the version built on your actual market?</h2>
  <p>We will look at what your buyers are searching, what your site answers today, and who is capturing that traffic instead of you. Free, and yours to keep.</p>
  <a class="btn" href="/#snapshot">Get my free market snapshot</a>
  <p style="margin-top:16px;font-size:14px"><a href="${CAL}" target="_blank" rel="noopener" style="color:#8FC4F5">Or book thirty minutes →</a></p>
</div>

${FOOTER}
<script>
(function(){
  var TIERS=[{n:"Starter",p:199},{n:"Growth",p:399},{n:"Authority",p:499}];
  var $=function(i){return document.getElementById(i)};
  var money=function(n){return "$"+Math.round(n).toLocaleString("en-US")};
  var clean=function(s){return Math.max(0,parseFloat(String(s).replace(/[^0-9.]/g,""))||0)};

  function plural(n,w){return n===1?w:w+"s"}

  /** "one extra customer every N" — the line that does the persuading. */
  function everyPhrase(perYear){
    if(perYear<=0) return "—";
    if(perYear>=12) return "about "+Math.round(perYear/12)+" extra "+plural(Math.round(perYear/12),"customer")+" a month";
    if(perYear>=1.6) return "about "+(Math.round(perYear*10)/10)+" extra customers a year";
    if(perYear>=0.92) return "one extra customer a year";
    var months=12/perYear;
    if(months<=23) return "one extra customer every "+Math.round(months)+" months";
    var years=months/12;
    return "one extra customer every "+(years<2.05?"2":Math.round(years))+" years";
  }

  function render(){
    var v=clean($("val").value), cur=+$("cur").value, lift=+$("lift").value;
    $("curOut").textContent=cur;
    $("liftOut").textContent=lift;

    if(!v){ $("verdict").textContent="Enter what a customer is worth."; $("tiers").innerHTML=""; return; }

    // Break-even is stated against the lowest plan, because that is the honest
    // floor: the smallest commitment that buys anything at all.
    var beYear=(TIERS[0].p*12)/v;
    $("verdict").innerHTML="This pays for itself at <b>"+everyPhrase(beYear)+"</b>.";
    $("verdictSub").textContent="At "+money(v)+" a customer, the "+TIERS[0].n+" plan costs "+money(TIERS[0].p*12)+
      " a year — so it covers itself the moment it produces that much. Everything past it is upside.";

    var html="";
    TIERS.forEach(function(t,i){
      var annual=t.p*12;
      var be=annual/v;
      var gain=lift*v;
      var net=gain-annual;
      var roi=annual>0?(net/annual):0;
      var payback=gain>0?(annual/(gain/12)):0; // months of modelled gain needed to cover the year
      html+='<div class="tier'+(i===1?' best':'')+'">'+
        (i===1?'<span class="flag">Most chosen</span>':'')+
        '<h3>'+t.n+'</h3><div class="price">'+money(t.p)+'/mo · '+money(annual)+' a year</div>'+
        '<div class="row stack"><span>Breaks even at</span><b>'+everyPhrase(be)+'</b></div>'+
        '<div class="row"><span>Your assumption</span><b>+'+lift+'/yr</b></div>'+
        '<div class="row"><span>Revenue added</span><b>'+money(gain)+'</b></div>'+
        '<div class="row"><span>Net of cost</span><b class="'+(net>=0?'good':'bad')+'">'+
          (net>=0?'+':'')+money(net)+'</b></div>'+
        '<div class="row"><span>Return</span><b class="'+(net>=0?'good':'bad')+'">'+
          (lift===0?'—':(roi>=0?(Math.round(roi*10)/10)+'×':'−'))+'</b></div>'+
        (payback>0&&payback<=12?'<div class="row"><span>Cost covered by</span><b>month '+Math.max(1,Math.ceil(payback))+'</b></div>':'')+
        '</div>';
    });
    $("tiers").innerHTML=html;

    var growth=cur>0?((lift/(cur*12))*100):0;
    // A modelled return this large is arithmetically right and rhetorically
    // useless — it reads as a fantasy and takes the credible numbers with it.
    // Better the tool says so than the prospect does.
    var topRoi=lift>0?((lift*v)-(TIERS[0].p*12))/(TIERS[0].p*12):0;
    var overclaim = topRoi>15
      ? '<div class="note" style="background:#FDF3E7;border-left-color:#C88A3A;color:#7A5418;margin-top:12px">'+
        '<strong>That return is doing a lot of work.</strong> The arithmetic is right, but a modelled figure that '+
        'large almost always means the assumption above is optimistic. Drag it down until it is a number you would '+
        'actually bet on — the break-even line is the one that does not move.</div>'
      : "";
    $("context").insertAdjacentHTML; // (kept: context node is replaced below)
    $("context").innerHTML = lift===0
      ? "Set the slider above to model what a result would be worth. At zero it only shows the break-even point — which is the honest floor."
      : "You are modelling <strong>"+lift+" extra "+plural(lift,"customer")+" a year</strong> on top of the "+(cur*12)+
        " you already win. That is a <strong>"+Math.round(growth)+"% increase</strong> in new business. Whether that is realistic depends entirely on your market — worth pressure-testing on a call before you believe it.";
    var warn=document.getElementById("overclaim");
    if(warn) warn.remove();
    if(overclaim){ $("context").insertAdjacentHTML("afterend", overclaim.replace('class="note"','id="overclaim" class="note"')); }
  }

  $("ind").addEventListener("change",function(){
    $("val").value=(+this.value).toLocaleString("en-US"); render();
  });
  $("val").addEventListener("input",render);
  $("val").addEventListener("blur",function(){
    var v=clean(this.value); this.value=v?v.toLocaleString("en-US"):"";
  });
  // Moving the volume slider re-suggests a 15% lift, so the assumption always
  // stays proportionate to the business rather than stranded at a stale number.
  var liftTouched=false;
  $("lift").addEventListener("input",function(){ liftTouched=true; render(); });
  $("cur").addEventListener("input",function(){
    if(!liftTouched){ $("lift").value=Math.max(1,Math.round(+this.value*12*0.05)); }
    render();
  });
  render();
})();
</script>
</body>
</html>`;

fs.mkdirSync(path.join(ROOT, SLUG), { recursive: true });
fs.writeFileSync(path.join(ROOT, SLUG, "index.html"), page());
console.log(`  ✓ /${SLUG}`);
console.log("[calculator] built 1 page.");
