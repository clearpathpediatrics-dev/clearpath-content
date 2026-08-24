/**
 * ClearPath Content — industry × metro query shapes.
 * -------------------------------------------------------------
 * The city pages carry queries that characterise a *market* ("med spa vs
 * dermatologist for Botox" in Scottsdale). Those are right for a page about
 * Scottsdale and badly wrong in a report sent to a roofing company — showing a
 * roofer cosmetic-dentist queries destroys the credibility of everything else
 * on the page.
 *
 * So the report composes its own: real query shapes for the recipient's own
 * trade, with their city and state substituted in. Every one is a search a
 * buyer in that category plausibly types, and every one is a page that could
 * be written.
 *
 * {city} and {state} are filled at render time.
 */

const T = {
  "HVAC": [
    "how much does a new AC unit cost in {city}",
    "AC repair or replace {city}",
    "how often should I service my AC in {state}",
    "best time of year to replace an air conditioner {state}",
    "why is my AC not keeping up {city}",
    "furnace replacement cost {city}",
    "AC tune up cost {city}",
  ],
  "Plumbing": [
    "emergency plumber {city} what does it cost",
    "repipe cost {city}",
    "water heater replacement cost {city}",
    "hard water treatment {city} worth it",
    "how to find a slab leak {city}",
    "tankless vs tank water heater {state}",
  ],
  "Electrical": [
    "electrical panel upgrade cost {city}",
    "EV charger installation cost {city}",
    "do I need a permit for electrical work in {city}",
    "why do my breakers keep tripping {city}",
    "whole house generator cost {state}",
    "knob and tube rewiring cost {city}",
  ],
  "Roofing / Contracting": [
    "how much does a roof replacement cost in {city}",
    "roof hail damage insurance claim {state}",
    "best time of year to replace a roof in {state}",
    "how long does a roof replacement take {city}",
    "how to tell if a roof needs replacing or repairing",
    "roofing permit requirements {city}",
    "how to vet a roofing contractor after a storm",
  ],
  "Pest control": [
    "scorpion control {city} how often",
    "termite inspection cost {city}",
    "how much does monthly pest control cost {city}",
    "roof rat removal {city}",
    "termite bond worth it {state}",
    "bed bug treatment cost {city}",
  ],
  "Law firm": [
    "how much does an estate lawyer cost in {state}",
    "do I need a lawyer for {state} probate",
    "how long does a personal injury case take in {state}",
    "what to bring to a first meeting with a lawyer",
    "contingency fee percentage {state}",
    "how to choose a family law attorney {city}",
  ],
  "Dental practice": [
    "how much do dental implants cost in {city}",
    "invisalign cost {city}",
    "does insurance cover dental implants",
    "best cosmetic dentist {city} how to choose",
    "root canal cost {city}",
    "emergency dentist {city} same day",
  ],
  "Real estate": [
    "should I sell my house now {city}",
    "how much is my home worth {city}",
    "how to choose a realtor {city}",
    "what are closing costs in {state}",
    "best neighborhoods in {city} for families",
    "how long do homes take to sell in {city}",
  ],
  "Home services": [
    "how much does a kitchen remodel cost in {city}",
    "do I need a permit for a home addition {city}",
    "how to vet a contractor {city}",
    "how long does a bathroom remodel take",
    "average cost per square foot to build {state}",
    "landscaping cost {city}",
  ],
  "B2B software": [
    "best {industry} software for small business",
    "how much does {industry} software cost",
    "{industry} software implementation timeline",
    "how to build a business case for new software",
    "what to ask a software vendor before buying",
    "switching costs when changing software providers",
  ],
  "Professional services": [
    "how much does a bookkeeper cost {city}",
    "when should a small business hire a CPA",
    "what to bring to a first consultation",
    "how to choose a consultant {city}",
    "hourly vs retainer which is better",
    "small business tax deadlines {state}",
  ],
};

const STATE_NAME = {
  AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",CO:"Colorado",CT:"Connecticut",
  DE:"Delaware",DC:"Washington DC",FL:"Florida",GA:"Georgia",HI:"Hawaii",ID:"Idaho",IL:"Illinois",
  IN:"Indiana",IA:"Iowa",KS:"Kansas",KY:"Kentucky",LA:"Louisiana",ME:"Maine",MD:"Maryland",
  MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",MO:"Missouri",MT:"Montana",
  NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",NM:"New Mexico",NY:"New York",
  NC:"North Carolina",ND:"North Dakota",OH:"Ohio",OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",
  RI:"Rhode Island",SC:"South Carolina",SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",
  VT:"Vermont",VA:"Virginia",WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming",
};

const FALLBACK = [
  "how much does {industry} cost in {city}",
  "best {industry} in {city} how to choose",
  "what to ask before hiring {industry} {city}",
  "how long does {industry} work take",
  "{industry} near me reviews {city}",
];

/**
 * Query shapes for this recipient's trade and market.
 * @param {string} industry  a label from INDUSTRY_PRIORS
 * @param {string} city
 * @param {string} state     two-letter code, optional
 * @param {number} n
 */
export function marketQueries(industry, city, state, n = 5) {
  const tpl = T[industry] || FALLBACK;
  const c = (city || "").trim() || "your area";
  // People search "in Arizona", not "in AZ".
  const raw = (state || "").trim();
  const s = STATE_NAME[raw.toUpperCase()] || raw || c;
  const ind = (industry || "service").toLowerCase().replace(" / ", " ").replace(/s$/, "");
  return tpl
    .map((q) => q.replace(/\{city\}/g, c).replace(/\{state\}/g, s).replace(/\{industry\}/g, ind))
    .slice(0, n);
}

/** True when we have real templates for this trade rather than the fallback. */
export const hasQueriesFor = (industry) => Boolean(T[industry]);
