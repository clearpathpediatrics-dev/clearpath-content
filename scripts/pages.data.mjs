/**
 * ClearPath Content — evergreen page data.
 * -------------------------------------------------------------
 * These are commercial-intent landing pages, not tutorials. Everything here is
 * framed around the BUYER's problem and the OUTCOME they get — never the
 * mechanism. Two reasons that matters:
 *   1. Competitors read your site. Method detail is free R&D for them.
 *   2. How-to content attracts DIYers who will never buy. "content marketing
 *      for HVAC companies" attracts an HVAC owner with a budget.
 *
 * Rule for anything added here: describe WHAT the client ends up with and WHY
 * it matters. Never describe HOW it is produced beyond the public method names
 * already on the homepage.
 */

export const CAL = "https://calendly.com/clearpathpediatrics/30min";

/* ---------------------------------------------------------------- industries */
export const INDUSTRIES = [
  {
    slug: "content-marketing-for-hvac-companies",
    industry: "HVAC Companies",
    h1: "Content Marketing for HVAC Companies",
    title: "Content Marketing for HVAC Companies | ClearPath Content",
    metaDescription: "HVAC customers search before they call. A publishing program that puts your company in those results year-round — not just during peak season.",
    keywords: ["content marketing for HVAC", "HVAC SEO", "HVAC marketing", "HVAC lead generation", "HVAC company blog"],
    intro: [
      "Almost nobody calls an HVAC company cold. They search first — for a symptom, a price, a comparison, or a company name they half-remember from a neighbour. By the time the phone rings, the decision is largely made.",
      "The problem is that HVAC search demand is enormous and seasonal, and it is nearly all captured by directories and national aggregators who are not going to show up at anyone's house. The local company that answers those questions publicly is the one that intercepts the call.",
    ],
    queries: [
      "why is my ac blowing warm air",
      "how much does a new furnace cost in [city]",
      "heat pump vs furnace which is cheaper",
      "emergency ac repair near me",
      "how often should hvac be serviced",
      "signs your ac needs replacing not repair",
    ],
    problem: [
      { t: "Demand spikes, then you're invisible", d: "Search volume triples in the first heat wave. Ranking takes months. If you start publishing when the phones go quiet, you have already missed the season you were trying to win." },
      { t: "Directories outrank you for your own market", d: "Aggregators dominate the obvious keywords. The winnable ground is the specific, high-intent questions they answer generically and badly." },
      { t: "Nobody in the shop has time to write", d: "Blogging is the first thing dropped in a busy quarter and the last thing picked back up. Cadence is where almost every HVAC content effort dies." },
    ],
    outcomes: [
      "A steady stream of published answers to the questions your customers actually type, on your own domain",
      "Coverage that widens every month instead of repeating the same five topics",
      "Seasonal and emergency-intent content live before the season, not during it",
      "Service-area coverage that reads as genuinely local, not spun",
      "Zero hours a week from you or anyone on your team",
    ],
    faq: [
      { q: "How long before an HVAC company sees results from content marketing?", a: "It depends on your market, your competition, and how established your domain is. Some deployments see movement within weeks; most compound over one to two quarters. The reason to start before you need it is that the ranking is already in place when demand spikes." },
      { q: "Does content marketing work for a local HVAC company or only for big brands?", a: "It works particularly well locally, because the winnable queries are specific and regional. A national directory cannot credibly answer what a furnace replacement costs in your city or how local permitting affects a job. You can." },
      { q: "What does an HVAC company get each month?", a: "Published articles on your own domain targeting real customer questions, interlinked into a coherent structure, on a fixed cadence. Everything published stays yours permanently." },
    ],
  },
  {
    slug: "content-marketing-for-law-firms",
    industry: "Law Firms",
    h1: "Content Marketing for Law Firms",
    title: "Content Marketing for Law Firms | ClearPath Content",
    metaDescription: "Prospective clients research for weeks before contacting a firm. A publishing program that makes yours the one they keep finding — without partner hours.",
    keywords: ["content marketing for law firms", "law firm SEO", "attorney content marketing", "legal marketing", "law firm blog"],
    intro: [
      "Legal clients research longer than almost any other category. Weeks of reading about their situation, what it costs, what happens next, and whether they even need a lawyer — long before anyone fills in a contact form.",
      "Firms that publish real answers during that window get considered. Firms that publish a practice-area page and nothing else are invisible for the entire research phase and only compete at the very end, on price and proximity.",
    ],
    queries: [
      "how much does an estate lawyer cost",
      "do i need a lawyer for a small claims case",
      "what happens at a probate hearing",
      "how long does a personal injury case take",
      "difference between chapter 7 and chapter 13",
      "can i change my will without a lawyer",
    ],
    problem: [
      { t: "Billable hours make publishing impossible", d: "Content is worth less per hour than legal work, so it never gets written. That is rational and it is also why most firm blogs stop after four posts." },
      { t: "Compliance makes firms cautious to the point of silence", d: "The fear of saying something wrong produces pages that say nothing at all — and nothing is exactly what ranks nowhere." },
      { t: "Everyone targets the same three keywords", d: "Whole markets fight over one head term while hundreds of specific, high-intent questions sit uncontested." },
    ],
    outcomes: [
      "Consistent publishing on the questions clients research before they call",
      "Coverage across your practice areas, not just the one somebody remembered to write about",
      "Content in your firm's voice and positioning, reviewed by you before it goes live",
      "A body of work that keeps earning after it publishes, unlike ad spend",
      "No partner or associate hours consumed",
    ],
    faq: [
      { q: "Is content marketing worth it for a small law firm?", a: "Often more so than for large ones. Small firms can own specific, local, high-intent questions that national firms answer generically. The constraint has never been capability — it is sustaining a publishing cadence alongside billable work." },
      { q: "How do you handle legal compliance and accuracy?", a: "New deployments start in review mode: articles arrive as drafts for your approval before anything publishes. Standing rules you give us — required disclaimers, language to avoid, claims never to make — are encoded permanently into your configuration." },
      { q: "What kind of legal content actually generates clients?", a: "Content matching how someone describes their own situation before they know the legal terminology, and content answering cost and process questions. Both signal a person with a real problem, not a student researching a topic." },
    ],
  },
  {
    slug: "content-marketing-for-dental-practices",
    industry: "Dental Practices",
    h1: "Content Marketing for Dental Practices",
    title: "Content Marketing for Dental Practices | ClearPath Content",
    metaDescription: "Patients search costs, procedures and comparisons before booking. A publishing program that makes your practice the one answering — every week.",
    keywords: ["content marketing for dentists", "dental practice SEO", "dental marketing", "dentist blog", "dental patient acquisition"],
    intro: [
      "Dental patients research two things obsessively before booking: what a procedure involves, and what it costs. Both are questions most practice websites refuse to answer, which is exactly why they lose the patient to whoever will.",
      "High-value procedures — implants, orthodontics, cosmetic work — involve weeks of comparison. The practice that shows up throughout that research earns the consultation.",
    ],
    queries: [
      "how much do dental implants cost",
      "invisalign vs braces which is better",
      "is a root canal painful",
      "how long do veneers last",
      "does insurance cover wisdom teeth removal",
      "what to expect after a dental crown",
    ],
    problem: [
      { t: "Price opacity pushes patients elsewhere", d: "Patients will find a cost answer somewhere. If it is not from you, it is from a competitor or a forum thread, and the anchor is set before you meet them." },
      { t: "Practice sites are brochures, not answers", d: "A services page listing procedures ranks for nothing, because it answers nothing anyone is actually typing." },
      { t: "Nobody at the practice can sustain it", d: "Between patients and admin, content is written for two months and then abandoned." },
    ],
    outcomes: [
      "Answers published for the procedure and cost questions patients research first",
      "Coverage of your high-value procedures, not just general dentistry",
      "A consistent cadence that builds authority instead of stalling",
      "Content written for anxious patients, in your practice's tone",
      "No chair time or admin time consumed",
    ],
    faq: [
      { q: "Should a dental practice publish prices online?", a: "You do not have to publish a fixed price to answer a cost question well. Explaining what drives the range, what insurance typically covers, and what the process involves satisfies the search and builds trust — while leaving the exact figure to a consultation." },
      { q: "How much content does a dental practice need?", a: "Fewer, deeper pieces on the procedures that actually drive revenue outperform a high volume of general oral-health posts. The right cadence depends on how competitive your market is and how much ground you are starting from." },
    ],
  },
  {
    slug: "content-marketing-for-home-services",
    industry: "Home Service Businesses",
    h1: "Content Marketing for Home Service Businesses",
    title: "Content Marketing for Home Service Businesses | ClearPath Content",
    metaDescription: "Plumbing, roofing, electrical, landscaping — customers search before they call. A publishing program that puts you in those results, permanently.",
    keywords: ["content marketing for home services", "plumber SEO", "roofing marketing", "electrician SEO", "home service lead generation"],
    intro: [
      "Home service work is urgent, local, and researched. Something breaks, the homeowner searches, and the companies that appear in that search get the call. It is close to that simple.",
      "The complication is that home service search is dominated by lead aggregators who sell the same lead to four companies. Publishing on your own domain is how you get the call directly instead of paying to share it.",
    ],
    queries: [
      "why is my water heater leaking",
      "how much does a roof replacement cost",
      "how do i know if i need a new electrical panel",
      "emergency plumber near me open now",
      "how long does a water heater last",
      "is a slab leak covered by insurance",
    ],
    problem: [
      { t: "You're renting leads instead of owning demand", d: "Aggregator leads stop the moment you stop paying, arrive pre-shopped, and are sold to your competitors simultaneously." },
      { t: "Emergency intent goes to whoever ranks", d: "Nobody comparison-shops a burst pipe. They call what they find, and what they find is decided months earlier." },
      { t: "Multi-trade or multi-area coverage never gets built", d: "Every service line and every service area needs its own answers. That is more writing than any owner will do." },
    ],
    outcomes: [
      "Published answers across every service line, not just your biggest one",
      "Genuine service-area coverage rather than thin duplicated location pages",
      "Emergency and high-intent content live before you need it",
      "An asset on your own domain that keeps working when you stop paying for ads",
      "Nothing required from you or your crew",
    ],
    faq: [
      { q: "Is content marketing better than buying leads for home services?", a: "They do different jobs. Purchased leads produce calls immediately and stop when spend stops. Published content takes longer to build but keeps producing, arrives unshared, and is an asset you own. Most established companies are best served running both and shifting weight toward owned over time." },
      { q: "How do you cover multiple service areas without thin duplicate pages?", a: "By writing genuinely different content for each area rather than swapping a city name into a template. Search engines have penalised the template approach for years, and it converts poorly besides." },
    ],
  },
  {
    slug: "content-marketing-for-b2b-software",
    industry: "B2B Software Companies",
    h1: "Content Marketing for B2B Software Companies",
    title: "Content Marketing for B2B Software Companies | ClearPath Content",
    metaDescription: "Long sales cycles, multiple stakeholders, expensive paid channels. A publishing program that builds the organic pipeline your CAC needs.",
    keywords: ["B2B software content marketing", "SaaS content marketing", "B2B SaaS SEO", "software company blog", "SaaS demand generation"],
    intro: [
      "B2B software has the longest research cycle of any category and the most expensive paid channels. Buyers self-educate for months, involve three to six colleagues, and arrive at a shortlist before ever contacting a vendor.",
      "Organic content is the only channel that works across that entire cycle at a cost that does not scale linearly with growth. It is also the one most under-resourced teams abandon first.",
    ],
    queries: [
      "best accounting software for contractors",
      "how to migrate from spreadsheets to a crm",
      "what does implementation actually involve",
      "alternatives to [competitor]",
      "how much should we budget for onboarding",
      "how to get buy-in for new software",
    ],
    problem: [
      { t: "Paid acquisition costs keep climbing", d: "CAC rises every year in competitive software categories. Without an organic base, growth gets more expensive rather than less." },
      { t: "Content is one marketer's fifth priority", d: "Between launches, events, lifecycle and paid, a consistent publishing cadence is almost never sustained." },
      { t: "The buying committee is ignored", d: "Most SaaS content addresses the champion only. The finance and IT stakeholders who can veto the deal are researching too, and finding nothing." },
    ],
    outcomes: [
      "Coverage across the full buying cycle, not just bottom-funnel comparison pages",
      "Content addressing every stakeholder in the committee, not only the champion",
      "A publishing cadence that survives launches and quarter-end",
      "An organic base that lowers blended CAC as it compounds",
      "No marketing headcount consumed",
    ],
    faq: [
      { q: "How much content does a B2B software company need to see results?", a: "It depends far more on competition and domain authority than on raw volume. What consistently matters is sustained cadence and widening coverage — sporadic publishing, however good, does not accumulate authority." },
      { q: "Should B2B software content target keywords or the buying committee?", a: "Both, and they overlap more than teams assume. Each committee member types their own questions — the champion researches capability, finance researches cost and ROI, IT researches security and integration. Those are all keyword opportunities most competitors ignore." },
    ],
  },
  {
    slug: "content-marketing-for-professional-services",
    industry: "Professional Services Firms",
    h1: "Content Marketing for Professional Services Firms",
    title: "Content Marketing for Professional Services Firms | ClearPath Content",
    metaDescription: "Accounting, consulting, financial advice, insurance — clients research expertise before they call. A publishing program that demonstrates it continuously.",
    keywords: ["professional services content marketing", "accounting firm SEO", "consulting firm marketing", "financial advisor content", "CPA marketing"],
    intro: [
      "Professional services sell judgment, and judgment is hard to advertise. A prospective client cannot evaluate your expertise from a services page — but they can evaluate it from how well you answer the question they are actually stuck on.",
      "That is why published content converts unusually well in this category. It is the only channel where prospects experience your thinking before they pay for it.",
    ],
    queries: [
      "should i form an llc or s corp",
      "how much should bookkeeping cost for a small business",
      "when do i need to make quarterly tax payments",
      "how do i value a small business for sale",
      "what does a fractional cfo actually do",
      "how much life insurance do i actually need",
    ],
    problem: [
      { t: "Billable time makes content unaffordable", d: "Every hour spent writing is an hour not billed. The economics guarantee content loses unless it is taken off the firm's plate." },
      { t: "Expertise stays invisible", d: "Prospects cannot tell two firms apart from their websites, so they default to price and referral." },
      { t: "Referral pipelines eventually plateau", d: "Referrals are excellent and finite. Firms that never build a second channel hit a ceiling they cannot see coming." },
    ],
    outcomes: [
      "Published answers that demonstrate judgment rather than assert it",
      "Coverage across every service line you want to grow",
      "A second pipeline that does not depend on your referral network",
      "Content in your firm's voice, approved by you before publishing",
      "No billable hours redirected",
    ],
    faq: [
      { q: "Does content marketing work for firms that get most work from referrals?", a: "It works best as a complement. Referred prospects almost always research you before calling — content is what they find, and it shortens the trust-building phase. It also builds a second channel for when referral volume plateaus." },
      { q: "How do we publish useful advice without giving away the work we charge for?", a: "The same way a good consultation does. Explaining what a decision depends on, what the options are, and what typically drives the answer demonstrates expertise and creates demand for the judgment call itself. Nobody reads a helpful article and concludes they no longer need an advisor." },
    ],
  },
];

/* ---------------------------------------------------------------- FAQ hub */
export const FAQ_HUB = [
  {
    group: "About the program",
    items: [
      { q: "What is ClearPath Content?", a: "ClearPath Content is an organic visibility program for businesses. It runs the whole publishing operation — mapping what your market searches for, producing long-form articles in your voice, publishing them on a set cadence to your own domain, and interlinking them into a coherent structure. It is sold as a monthly subscription rather than an hourly retainer." },
      { q: "How is this different from hiring a content agency?", a: "Agencies bill hours and typically deliver a handful of articles a month from rotating freelancers, with strategy billed separately. ClearPath Content runs the whole system at a subscription price and publishes 8–22 architected articles a month, on a cadence no human team sustains. You are not buying content, you are installing infrastructure." },
      { q: "How is this different from hiring a freelance writer?", a: "A freelancer writes what you brief them on. You remain the strategist — deciding topics, writing briefs, editing, publishing, and handling internal linking. ClearPath Content takes the entire operation, not just the writing." },
      { q: "Who is this for?", a: "Businesses that sell something considered — where buyers research before contacting anyone. Home services, legal, dental, professional services, and B2B software are common fits. It works less well for pure impulse purchases with no research phase." },
    ],
  },
  {
    group: "Results and expectations",
    items: [
      { q: "How fast should I expect results?", a: "Honestly, it depends on your market, competition, and domain history. Some deployments see meaningful movement within weeks; most compound over one to two quarters. That is the nature of owned visibility — slower to build than ads, and far more defensible once built. What is guaranteed is the input: relentless cadence, widening coverage, and structural reinforcement every week." },
      { q: "Can you guarantee rankings?", a: "No, and you should be wary of anyone who does. Nobody controls search engines. What can be committed to is the work: consistent publication, expanding coverage of your market's question-space, and a structure engineered for authority to accumulate." },
      { q: "What happens if I cancel?", a: "Everything published stays on your domain, owned by you, permanently. You keep the asset. The publishing simply stops." },
    ],
  },
  {
    group: "Content and control",
    items: [
      { q: "Will the content sound like my business?", a: "Your deployment is conditioned on your actual voice — real excerpts from your site, your terminology, your offers, your market, and an explicit list of phrases you never want to see. The output should be recognisably yours, not generic filler." },
      { q: "Do I get to review what's published?", a: "Yes. New deployments start in review mode, with articles arriving as drafts for your approval until you are comfortable with the voice. Most clients move to full automated publishing within about two weeks. Every standing preference you give us is encoded permanently into your configuration." },
      { q: "What if an article is wrong or off-brand?", a: "Tell us and it is corrected, and the underlying preference is added to your configuration so it does not recur. Corrections compound the same way the content does." },
      { q: "Who owns the content?", a: "You do, permanently, regardless of whether the subscription continues." },
    ],
  },
  {
    group: "Practicalities",
    items: [
      { q: "What do you need from me?", a: "About thirty minutes, once. We take your site, your services, and your market, and configure your deployment. After that, involvement is optional by design." },
      { q: "Is there a contract?", a: "Month to month. Visibility infrastructure should keep earning its place every thirty days." },
      { q: "Do you work with competitors in my market?", a: "No. We deploy for one business per niche, per metro. The entire value is that you own the answers in your market — that does not survive selling the same coverage to your competitor." },
      { q: "How much does it cost?", a: "Deployment tiers run $199 to $499 per month depending on cadence, article depth, and reinforcement. All tiers run the same program." },
    ],
  },
];

/* ---------------------------------------------------------------- capabilities */
export const CAPABILITIES = {
  slug: "what-you-get",
  h1: "What a Deployment Actually Delivers",
  title: "What You Get | ClearPath Content",
  metaDescription: "Exactly what lands on your domain each month, what stays yours, and what is required from you. No jargon, no hourly billing, no long-term contract.",
  keywords: ["content marketing deliverables", "content subscription service", "what you get content marketing", "managed content program"],
  intro: [
    "Most content proposals describe activity — hours, deliverables, meetings. This page describes outcomes: what ends up on your domain, what it is engineered to do, and what it costs you in time.",
  ],
  blocks: [
    { n: "01", t: "Articles published to your own domain", d: "Between 8 and 22 long-form articles a month depending on tier, published directly to your site. Not a portal, not a content library you have to migrate — your domain, your URLs, your asset." },
    { n: "02", t: "Coverage that only widens", d: "State is tracked permanently, so topics never repeat and coverage expands every cycle. Month three covers ground month one did not, by design." },
    { n: "03", t: "Structure, not a pile of pages", d: "Articles are organised into topical groups and interlinked with each other, so the body of work reads as a coherent library rather than scattered posts. Structure is what separates content that accumulates authority from content that just exists." },
    { n: "04", t: "Written in your voice", d: "Conditioned on your real terminology, offers, market and positioning — plus an explicit list of phrases you never want to see. Standing preferences are permanent, not re-briefed each time." },
    { n: "05", t: "A cadence that does not lapse", d: "Publication runs on schedule every week without exception. Sustained cadence is one of the strongest trust signals a domain emits, and the first thing every manual effort abandons." },
    { n: "06", t: "Built for AI answer engines too", d: "Articles are structured so assistants like ChatGPT, Perplexity and Google's AI Overviews can surface them directly. A growing share of buyer research now happens there, and most competitors are not structured for it at all." },
  ],
  keeps: [
    "Every article published stays on your domain permanently",
    "You own the content outright, during and after the subscription",
    "Month-to-month — no annual commitment",
    "One deployment per niche, per metro — your market stays yours",
  ],
  faq: [
    { q: "How much of my time does this take?", a: "About thirty minutes once, to configure your deployment. After that your involvement is optional — review drafts if you want to, or let it run. Most clients move to full automation within about two weeks." },
    { q: "Do I need to supply topics or briefs?", a: "No. Identifying what your market searches for is part of the program. You are welcome to request specific topics, and standing requests are added to your configuration permanently." },
    { q: "What if I already have a blog?", a: "Existing content stays where it is. New work is published alongside it and interlinked with what you already have, so the existing library gets reinforced rather than orphaned." },
  ],
};
