/**
 * ClearPath Content — hub page data (pillars, cities, comparisons).
 * -------------------------------------------------------------
 * Same rule as pages.data.mjs: describe WHAT a buyer gets and WHY it matters.
 * Pillars go deep on the problem space — that is what earns rankings and makes
 * a reader want to talk to us — without documenting how the engine is built.
 */

/* ================================================================= PILLARS
 * One per blog cluster (topics.data.mjs). These are the authority hubs the
 * daily articles feed into; each lives at the cluster's `pillar` path.
 * `clusterKey` links a pillar to its articles so the page auto-lists them.
 */
import { CITY_DEPTH } from "./cities.depth.mjs";

export const PILLARS = [
  {
    slug: "blog/ai-search-optimization-guide",
    clusterKey: "aeo-geo",
    eyebrow: "The complete guide",
    h1: "AI Search Optimization: How to Get Cited by ChatGPT, Perplexity and AI Overviews",
    title: "AI Search Optimization Guide | ClearPath Content",
    metaDescription: "AI assistants cite a handful of sources per answer. A complete guide to how that selection works and how to structure content so yours is one of them.",
    keywords: ["AI search optimization", "answer engine optimization", "AEO", "GEO", "get cited by ChatGPT", "AI Overviews optimization"],
    intro: [
      "A growing share of buyer research never touches a results page. Someone asks ChatGPT which accounting software suits a contracting business, or asks Perplexity what a panel upgrade costs, and gets a synthesised answer built from three to six sources. No ten blue links, no scrolling, no comparison shopping.",
      "Being one of those cited sources is a different problem from ranking first, and most businesses are not structured for it at all. This guide covers what actually determines citation, how it differs from classic SEO, and what to change.",
    ],
    sections: [
      {
        h: "Retrieval is not ranking",
        p: [
          "A search engine orders pages. An answer engine does something different: it retrieves passages, judges whether each one answers the question, and synthesises a response from the best of them. The unit of competition is the passage, not the page.",
          "This has a counterintuitive consequence. A page ranking eighth can be cited while the page ranking first is skipped entirely — because citation depends on whether a specific block of text cleanly answers the specific question, not on the page's overall authority.",
        ],
      },
      {
        h: "What makes a passage quotable",
        p: [
          "Cited passages share a consistent shape. They answer in the first sentence, they are self-contained, and they are specific enough to be worth quoting.",
        ],
        list: [
          "**The answer comes first.** A section that opens with two paragraphs of context before reaching the point is far less quotable than one that leads with the answer and elaborates afterwards.",
          "**Each section stands alone.** No 'as mentioned above'. A retrieved passage arrives without the three paragraphs that preceded it, so it has to make sense cold.",
          "**Specificity beats polish.** Numbers, named conditions, ordered steps, and explicit tradeoffs get quoted. Confident but vague prose does not.",
          "**Headings are phrased as questions.** Matching the way a person actually asks makes the retrieval match far more direct.",
        ],
      },
      {
        h: "How is AI search optimization different from SEO?",
        p: [
          "Classic SEO optimises a page to outrank other pages; AI search optimisation structures passages so a model can lift one cleanly. The two overlap heavily — both reward genuine depth, clear structure and topical authority — but they diverge in three ways worth knowing.",
          "First, position matters less. Being in the retrievable set matters more than being first. Second, freshness weighs differently: answer engines often prefer recently updated sources for anything time-sensitive. Third, brand mentions matter more than links — models build associations between entities and topics from how often and how clearly they co-occur, not only from hyperlinks.",
        ],
      },
      {
        h: "Does schema markup help with AI search?",
        p: [
          "It helps, but less than clear writing does. Structured data makes your entities and their relationships explicit, which reduces the work a model has to do to understand what your business is and what a page covers. FAQPage, Organization and Service markup are all worth implementing.",
          "But schema is a clarifier, not a substitute. A page with perfect markup and buried answers loses to a page with no markup that answers the question in its first sentence.",
        ],
      },
      {
        h: "The role of llms.txt",
        p: [
          "An llms.txt file is a plain-language summary of your business placed at the root of your domain, written for AI crawlers rather than for people. It states what you do, who you serve, what you charge, and what your key pages are.",
          "It is not an official standard and no engine guarantees it will be read. But it costs almost nothing, and it gives a model an unambiguous, self-authored description of your business rather than one inferred from scattered marketing copy.",
        ],
      },
      {
        h: "A four-step audit you can run this week",
        p: ["This takes about an hour and tells you exactly where you stand."],
        ol: [
          "List the ten questions your buyers ask before purchasing.",
          "Ask each one to ChatGPT and Perplexity. Note which sources get cited.",
          "Read the cited passages. Look at heading phrasing, where the answer sits, and how specific it is.",
          "Compare against your own page on that topic. The gap is almost always structural, not topical — you have the knowledge, it just is not in a retrievable shape.",
        ],
      },
      {
        h: "Why this window matters now",
        p: [
          "Classic search is a mature, brutally competitive channel where new domains wait quarters for traction. AI answer engines are neither mature nor saturated — most businesses have not restructured anything, and many have never checked whether they are cited at all.",
          "That gap will close. Right now it is one of the few genuinely under-contested opportunities in organic visibility.",
        ],
      },
    ],
    faq: [
      { q: "How do I get my content cited by ChatGPT?", a: "Answer the question in the first sentence beneath a heading phrased the way a person would ask it, keep each section self-contained, and be specific — numbers, named conditions, ordered steps. Answer engines retrieve passages, so each passage must stand alone and answer completely." },
      { q: "Is AI search optimization different from SEO?", a: "They overlap but diverge in three ways: position matters less than being in the retrievable set, freshness weighs more heavily for time-sensitive topics, and brand mentions matter alongside links because models build entity-topic associations from co-occurrence." },
      { q: "Does schema markup help AI engines understand my site?", a: "Yes, but less than clear writing does. Schema makes entities and relationships explicit and reduces ambiguity. It does not compensate for answers buried three paragraphs into a section." },
    ],
  },
  {
    slug: "blog/organic-visibility-guide",
    clusterKey: "organic-strategy",
    eyebrow: "The complete guide",
    h1: "Organic Visibility: Why Cadence and Structure Beat Individual Articles",
    title: "The Organic Visibility Guide | ClearPath Content",
    metaDescription: "Most business blogs fail for structural reasons, not quality ones. How topical authority actually accumulates, and why publishing cadence outperforms brilliance.",
    keywords: ["organic visibility", "topical authority", "content strategy", "publishing cadence", "pillar and cluster content"],
    intro: [
      "Most business blogs fail. Not because the writing was bad, but because four excellent posts published over two years accumulate almost nothing, while forty ordinary posts published on a schedule and linked into a coherent structure compound into something durable.",
      "This guide covers why that is, how topical authority actually builds, and what separates content that accumulates from content that just exists.",
    ],
    sections: [
      {
        h: "Why one great article is worth less than you think",
        p: [
          "A single excellent article on a domain with no surrounding coverage is an orphan. Search engines assess topical authority at the domain level — how much genuinely useful ground you cover in a subject area, how it interconnects, and whether you keep showing up.",
          "One article signals nothing about whether you are a credible source on the topic. Forty interlinked articles do.",
        ],
      },
      {
        h: "How topical authority actually accumulates",
        p: [
          "Authority is not a score you earn once. It builds from three signals reinforcing each other over time.",
        ],
        list: [
          "**Coverage depth.** Answering the obvious question is table stakes. Answering the fifteen adjacent questions around it is what marks you as a source rather than a page.",
          "**Internal coherence.** Related pages linking to each other tells a search engine these pages belong to one body of work, and concentrates authority where you want it.",
          "**Sustained cadence.** A domain that publishes consistently signals an active, maintained resource. One that stops signals abandonment.",
        ],
      },
      {
        h: "Why does publishing cadence matter more than article quality?",
        p: [
          "Because quality has a floor, not a ceiling, in how search engines evaluate it. Past the point where an article genuinely answers its question, additional polish produces diminishing returns — while additional coverage keeps producing.",
          "Cadence is also the only variable that reliably predicts whether a content effort survives. Almost every failed business blog failed by stopping, not by publishing something insufficiently good.",
        ],
      },
      {
        h: "Pillar and cluster architecture, explained plainly",
        p: [
          "A pillar page covers a broad topic thoroughly and links out to every article that goes deeper on a sub-topic. Those articles link back. The result is a hub-and-spoke structure rather than a flat list of posts.",
          "This matters for two reasons. Search engines use internal links to understand which pages are most important and how they relate — a well-structured cluster makes that unambiguous. And readers who land on any one article have a clear path deeper, which is where consideration actually happens.",
          "The page you are reading is a pillar. Every article listed below is a spoke.",
        ],
      },
      {
        h: "How long does organic content take to work?",
        p: [
          "It depends on your market, your competition, and how established your domain is — anyone who answers this with a fixed number is guessing. Some markets move within weeks; most compound over one to two quarters.",
          "The more useful way to think about it: organic is slow to start and hard to stop. Paid traffic is the reverse — instant, and gone the moment spend stops. The reason to start organic before you need it is that the compounding has to happen somewhere, and it cannot happen retroactively.",
        ],
      },
      {
        h: "The long tail is where a new domain actually wins",
        p: [
          "Head terms — two or three words, enormous volume — are locked up by domains with years of authority. Chasing them from a standing start is the most common and most expensive mistake in content marketing.",
          "The winnable ground is the specific question with obvious intent: not 'plumber' but 'is a slab leak covered by homeowners insurance'. Lower volume individually, but far less contested, and the person searching has a real problem right now. A hundred of those outperform one head term you will never rank for.",
        ],
      },
    ],
    faq: [
      { q: "Why do most business blogs fail?", a: "They stop. Four excellent posts over two years accumulate almost nothing because topical authority builds from sustained coverage, internal coherence and consistent cadence — and stopping resets the third while never achieving the first two." },
      { q: "How long does organic content take to produce results?", a: "It depends on market, competition and domain history. Some see movement in weeks; most compound over one to two quarters. Organic is slow to start and hard to stop, which is the opposite of paid and the reason to begin before you need the leads." },
      { q: "What is a pillar and cluster content structure?", a: "A pillar page covers a broad topic thoroughly and links to articles that go deeper on sub-topics, which link back. This tells search engines which pages matter and how they relate, and gives readers a path deeper into your material." },
    ],
  },
  {
    slug: "blog/content-marketing-buying-guide",
    clusterKey: "buying-guides",
    eyebrow: "Buyer's guide",
    h1: "How to Buy Content Marketing Without Getting Burned",
    title: "Content Marketing Buyer's Guide | ClearPath Content",
    metaDescription: "Agency, freelancer, in-house or subscription — what each actually costs, where each fails, and the questions that separate real providers from bad ones.",
    keywords: ["content marketing cost", "hiring a content agency", "content agency vs freelancer", "content marketing pricing", "how to choose a content agency"],
    intro: [
      "Most businesses buying content marketing have been burned at least once. They paid a retainer, got a handful of articles, saw nothing measurable, and quietly stopped.",
      "That usually is not because content does not work. It is because the buying decision was made on price and vibes rather than on what actually determines whether a program produces anything. This guide covers the four ways to buy, what each really costs, and the questions worth asking.",
    ],
    sections: [
      {
        h: "The four ways to buy, and where each breaks",
        p: ["Every option is genuinely right for someone. The failures are predictable once you know where each one strains."],
        list: [
          "**Agency retainer.** Strategy, production and reporting bundled. Commonly thousands per month for a handful of articles. Breaks when the retainer buys hours rather than output, and when the senior person who sold you is not the junior who writes.",
          "**Freelance writer.** Cheaper per article, often better writing. Breaks because you become the strategist — keyword research, briefs, editing, publishing and internal linking all stay on your plate. The writing is outsourced; the system is not.",
          "**In-house hire.** Best alignment and deepest product knowledge. Breaks on cost and on the fact that one person cannot be strategist, writer, editor and publisher indefinitely without burning out or being pulled onto other work.",
          "**Subscription program.** Fixed monthly price for a defined cadence with the system included. Breaks if the provider treats volume as the product rather than structure and relevance.",
        ],
      },
      {
        h: "What does content marketing actually cost?",
        p: [
          "Agency retainers commonly run from around two thousand to ten thousand a month, typically buying somewhere between two and six articles — which works out to several hundred dollars per published piece once strategy and reporting are billed on top. Freelance rates commonly land between one hundred fifty and six hundred per article, plus whatever your own time is worth doing everything around the writing.",
          "These are general market ranges rather than survey figures, and they vary widely by market, niche and scope. Ask any provider for their own current numbers.",
          "The number that actually matters is not price per article. It is cost per published, structured, interlinked article that is part of a coherent plan — because an unstructured article is close to worthless regardless of what it cost.",
        ],
      },
      {
        h: "Questions that separate good providers from bad ones",
        p: ["Ask these before signing anything. The answers are more revealing than any portfolio."],
        ol: [
          "How many articles will actually publish per month, and what happens if you miss?",
          "Who decides the topics, and how do you decide them?",
          "Will these be interlinked with each other and with my existing pages?",
          "Do I own the content if I cancel?",
          "Can I see something you publish on your own domain, on a consistent cadence?",
          "What happens in month six that did not happen in month one?",
        ],
        after: "That last question matters most. A provider who cannot describe compounding is selling you individual articles, not a program.",
      },
      {
        h: "Red flags worth walking away from",
        list: [
          "**Guaranteed rankings.** Nobody controls search engines. A guarantee is either a misunderstanding or a lie.",
          "**Volume as the headline.** Hundreds of articles a month with no structure is how domains get flagged for scaled content abuse, not how they rank.",
          "**No ownership clause.** If you do not own what you paid for, you are renting your own website.",
          "**Vague deliverables.** 'Content strategy and thought leadership' is not a deliverable. A number of published articles per month is.",
          "**No published work of their own.** A content company with no consistent content is telling you something.",
        ],
      },
      {
        h: "Should I buy content marketing or do it myself?",
        p: [
          "Do it yourself if you have someone who can genuinely commit four to six hours a week indefinitely, and who will still be doing it in month nine. That person exists in some businesses, and when they do, in-house beats everything.",
          "Buy it if content is going to be the fifth priority of someone already doing four other jobs — which describes most small and mid-sized businesses. The failure mode of DIY is not bad articles, it is a blog that stops in March.",
        ],
      },
    ],
    faq: [
      { q: "How much does content marketing cost?", a: "Agency retainers commonly run two to ten thousand a month for roughly two to six articles; freelance rates commonly run one hundred fifty to six hundred per article plus your own time managing everything around the writing. These are general market ranges, not survey data — ask any provider for their current numbers." },
      { q: "Is a content agency or a freelancer better?", a: "An agency bundles strategy and production but bills hours; a freelancer is cheaper per piece but leaves you as the strategist doing research, briefs, editing, publishing and internal linking. The right answer depends on whether you have time to run the system yourself." },
      { q: "What should I ask before hiring a content provider?", a: "How many articles publish per month and what happens if they miss, who chooses topics and how, whether pieces are interlinked, whether you own the content if you cancel, whether they publish consistently on their own domain, and what happens in month six that did not happen in month one." },
    ],
  },
  {
    slug: "blog/local-seo-guide",
    clusterKey: "local-seo",
    eyebrow: "The complete guide",
    h1: "Local Search Visibility for Service Businesses",
    title: "Local SEO Guide for Service Businesses | ClearPath Content",
    metaDescription: "How local ranking actually works for service businesses — the map pack, service-area pages that don't read as duplicates, and where content fits.",
    keywords: ["local SEO", "local search ranking", "Google Business Profile", "service area SEO", "local content marketing"],
    intro: [
      "Local search is the highest-intent traffic a service business can get. Somebody with a problem, in your area, right now. It is also the category where the gap between businesses that understand the mechanics and businesses that do not is widest.",
      "This guide covers what actually drives local ranking, why most service-area pages fail, and where published content fits alongside your Google Business Profile.",
    ],
    sections: [
      {
        h: "Two different competitions, one search",
        p: [
          "A local search returns two distinct things: the map pack of three business listings, and the organic results beneath it. They are ranked differently and you compete for them separately.",
          "The map pack is driven mainly by your Google Business Profile, proximity to the searcher, and reviews. Organic results below are driven by your website — its content, structure and authority. Many businesses optimise one and ignore the other, then wonder why they are invisible for half the query.",
        ],
      },
      {
        h: "What actually moves local ranking",
        list: [
          "**A complete, active Google Business Profile.** Categories, services, hours, photos, and posts. This is the single highest-leverage free thing most local businesses have not finished.",
          "**Reviews, in volume and recency.** They influence the map pack directly and are increasingly quoted by AI assistants making recommendations.",
          "**Consistent name, address and phone** everywhere you appear. Inconsistency creates ambiguity, and ambiguity costs trust signals.",
          "**Genuinely local content.** The part almost nobody does — and the part that wins the organic results the map pack does not cover.",
        ],
      },
      {
        h: "Why do most service-area pages fail?",
        p: [
          "Because they are the same page with the city name swapped. Search engines have penalised that pattern for years, and readers see through it instantly — a page that says nothing specific about the place it names signals that you do not actually work there.",
          "A service-area page earns its place when it contains something true only of that area: local permitting rules, typical housing stock and its quirks, regional climate effects, actual pricing in that market, neighbourhoods you genuinely serve. That is harder to produce, which is exactly why it works.",
        ],
      },
      {
        h: "Where content fits alongside your profile",
        p: [
          "Your Google Business Profile wins the map pack. Your website wins everything else — and 'everything else' is most of the search, because the majority of local queries are questions rather than a direct request for a nearby business.",
          "Somebody searching whether a slab leak is covered by insurance is not looking at the map pack. They are reading. Then they hire whoever wrote the thing that helped them.",
        ],
      },
      {
        h: "How much local content does a service business need?",
        p: [
          "Fewer, genuinely specific pages beat a large number of thin ones every time. A handful of pages that could only have been written by someone who actually works in that market outperform thirty templated location pages, and they carry no duplicate-content risk.",
          "The practical sequence: cover your primary service area properly first, then expand outward one area at a time as each earns its keep.",
        ],
      },
    ],
    faq: [
      { q: "How does local SEO actually work?", a: "A local search returns two things ranked separately: the map pack, driven mainly by your Google Business Profile, proximity and reviews; and organic results beneath it, driven by your website's content, structure and authority. You compete for them separately and need both." },
      { q: "Why do service area pages not rank?", a: "Because most are one template with the city name swapped, which search engines have penalised for years and readers see through immediately. A page earns its place by containing something true only of that area — local permitting, housing stock, climate effects, real local pricing." },
      { q: "Do I need content if I have a Google Business Profile?", a: "Yes. Your profile competes for the map pack; your website competes for everything else — and most local searches are questions rather than a direct request for a nearby business. Those searchers are reading, not looking at a map." },
    ],
  },
  {
    slug: "blog/content-marketing-roi",
    clusterKey: "measurement",
    eyebrow: "The complete guide",
    h1: "Measuring Content Marketing ROI Without Fooling Yourself",
    title: "Content Marketing ROI & Measurement | ClearPath Content",
    metaDescription: "Traffic is a vanity metric. Which numbers actually predict revenue from content, what leading indicators to watch early, and how to attribute honestly.",
    keywords: ["content marketing ROI", "content marketing metrics", "measuring content performance", "SEO measurement", "content attribution"],
    intro: [
      "Content marketing has a measurement problem, and it runs in both directions. Some businesses declare success off a traffic chart that contains no buyers. Others cancel a program that was working because the payoff had not arrived by month three.",
      "This guide covers which numbers actually predict revenue, what to watch before revenue shows up, and how to attribute honestly when the sales cycle is long.",
    ],
    sections: [
      {
        h: "Why traffic is the wrong headline number",
        p: [
          "Traffic counts visits, not intent. A thousand visitors reading a general-interest article you happened to rank for are worth less than twenty visitors reading your pricing page.",
          "Worse, raw traffic on a young site is heavily inflated by crawlers. Search engine bots and AI crawlers hit every page repeatedly, and most basic counters include them. If your analytics does not distinguish, your number is partly machines.",
        ],
      },
      {
        h: "What content metrics actually predict revenue?",
        p: [
          "Four, roughly in order of how closely they track money.",
        ],
        list: [
          "**Conversions from organic.** Calls, form fills, bookings that originated in a search session. This is the only metric that is unambiguously real.",
          "**Rankings on commercial-intent queries.** Position on 'how much does X cost' matters far more than position on a general-interest term, because the searcher is deciding.",
          "**Assisted conversions.** How often organic content appears anywhere in a converting journey, not just as the last click. In long sales cycles this is usually the largest and most under-counted contribution.",
          "**Impressions on buying-intent queries.** The earliest reliable signal — it moves before clicks and long before revenue.",
        ],
      },
      {
        h: "What to watch in the first 90 days",
        p: [
          "Revenue is a lagging indicator, and judging a program on it at month two will make you cancel things that were working. Watch the leading indicators instead, in this order:",
        ],
        ol: [
          "**Indexation.** Are new pages actually getting into the index? If not, nothing else matters.",
          "**Impressions.** Are you being shown for anything? This moves first, often within weeks.",
          "**Query breadth.** Is the number of distinct queries you appear for growing? Widening coverage is the whole mechanism.",
          "**Position drift.** Are existing pages moving up over time, even if not yet to page one?",
          "**Then clicks, then conversions.** In that order, usually over one to two quarters.",
        ],
        after: "If the first four are moving, the program is working, whatever revenue is doing yet.",
      },
      {
        h: "Attribution when the sales cycle is long",
        p: [
          "Last-click attribution systematically undercounts content, because content does its work early. Somebody reads three articles in February, remembers the name, searches for you directly in May, and converts. Last-click credits that to direct traffic and content gets nothing.",
          "Two practical fixes that do not require a data team. First, watch branded search volume — if people are increasingly searching for you by name, something is building awareness. Second, ask. A 'how did you hear about us' field on your form captures what analytics structurally cannot.",
        ],
      },
      {
        h: "A simple ROI calculation that is honest",
        p: [
          "Take conversions attributable to organic over a period. Multiply by your close rate to get customers, then by average customer value — for recurring revenue, use lifetime value rather than first-month revenue, or you will dramatically undercount.",
          "Compare against total content spend for the same period. Then do it again a quarter later. The single number matters far less than the trend, because content's defining property is that the same spend keeps producing after you stop paying for it.",
        ],
      },
    ],
    faq: [
      { q: "What content marketing metrics actually matter?", a: "Conversions from organic, rankings on commercial-intent queries, assisted conversions, and impressions on buying-intent queries — roughly in that order. Raw traffic is a vanity metric because it counts visits rather than intent, and on young sites it is inflated by crawlers." },
      { q: "How do I measure content ROI in the first 90 days?", a: "Do not measure revenue yet. Watch leading indicators in order: indexation, impressions, query breadth, position drift, then clicks. If the first four are moving, the program is working even before revenue shows." },
      { q: "How do I attribute revenue to content with a long sales cycle?", a: "Last-click attribution undercounts content because content works early in the journey. Track branded search volume as an awareness proxy, and add a 'how did you hear about us' field to your forms to capture what analytics structurally cannot." },
    ],
  },
  {
    slug: "blog/industry-content-playbooks",
    clusterKey: "industry-playbooks",
    eyebrow: "Playbook index",
    h1: "Content Marketing Playbooks by Industry",
    title: "Content Playbooks by Industry | ClearPath Content",
    metaDescription: "What buyers search for, where each industry's content usually fails, and what actually converts — playbooks for home services, legal, dental, real estate and B2B.",
    keywords: ["industry content marketing", "content marketing playbook", "vertical content strategy", "content marketing by industry"],
    intro: [
      "The mechanics of organic visibility do not change between industries. What changes is the question-space: what buyers search, in what order, and which of those searches signals someone about to spend money.",
      "This is the index of industry playbooks. Each covers the actual queries that market types, why content usually does not get done there, and what converts.",
    ],
    sections: [
      {
        h: "What changes between industries, and what does not",
        p: [
          "Three things are constant everywhere: cadence beats brilliance, structure beats volume, and long-tail commercial-intent questions beat head terms. Those hold whether you install furnaces or sell enterprise software.",
          "What differs is the shape of the buying journey. Emergency trades are won months before the emergency, on searches that take seconds. Considered purchases — legal, dental implants, real estate, B2B software — are won across weeks of research by whoever keeps showing up. The content that works looks completely different in each.",
        ],
      },
      {
        h: "The pattern that repeats in every vertical",
        p: ["Across every industry we publish for, the same three failures show up:"],
        list: [
          "**The highest-intent search is answered by a national site.** Directories, portals and content mills capture the moment a local buyer is most ready, then sell that lead back to the local business.",
          "**The site is a brochure, not an answer.** A services page ranks for nothing because it answers nothing anyone is typing.",
          "**Nobody has time.** Content is the first thing dropped in a busy quarter and the last picked back up — which is why cadence, not capability, is the actual constraint.",
        ],
      },
      {
        h: "Which industries does content marketing work best for?",
        p: [
          "Content works wherever buyers research before contacting anyone — which covers most considered purchases and nearly all professional and home services. The stronger the research phase, the bigger the advantage.",
          "It works least well for pure impulse categories with no research step. If nobody has ever found you while looking into a problem, content is a weaker fit than paid or foot traffic.",
        ],
      },
    ],
    linkIndustries: true,
    faq: [
      { q: "Which industries does content marketing work best for?", a: "Any industry where buyers research before contacting someone — home services, legal, dental, real estate, professional services and B2B software all qualify. The longer the research phase, the larger the advantage. It works least well for impulse purchases with no research step." },
      { q: "Does content marketing strategy change by industry?", a: "The mechanics do not — cadence, structure and long-tail commercial intent win everywhere. What changes is the question-space and the buying journey. Emergency trades are won months before the emergency; considered purchases are won across weeks of research." },
    ],
  },
  {
    slug: "blog/content-operations-guide",
    clusterKey: "operations",
    eyebrow: "The complete guide",
    h1: "Content Operations: Why Publishing Stops and How to Make It Not",
    title: "Content Operations Guide | ClearPath Content",
    metaDescription: "Most content programs die from operations, not ideas. What actually causes publishing to stop, and the minimum system that keeps it running.",
    keywords: ["content operations", "editorial calendar", "content workflow", "brand voice documentation", "content production process"],
    intro: [
      "Almost no content program dies because someone ran out of ideas. They die in operations — the brief that never got written, the draft waiting three weeks on a review, the quarter where everyone was busy.",
      "This guide covers the specific failure points and the minimum system that survives a bad month.",
    ],
    sections: [
      {
        h: "The four places publishing actually stops",
        list: [
          "**No owner.** When content is everyone's job it is nobody's. The single strongest predictor of survival is one named person accountable for it shipping.",
          "**The review bottleneck.** A draft waiting on an approver who is busy is the most common stall. Reviews need a deadline and a default — approved if no response in five days.",
          "**No topic queue.** Deciding what to write is a separate job from writing, and when it happens ad hoc it becomes the reason nothing starts.",
          "**Perfectionism.** A published article that is good helps you. A perfect article still in drafts does nothing.",
        ],
      },
      {
        h: "Brand voice documentation that gets used",
        p: [
          "Most voice guidelines are adjectives — professional, approachable, authoritative — which are unusable because they describe a feeling rather than a decision.",
          "Useful voice documentation is concrete: three paragraphs you would be happy to have published, three you would not and why, a list of terms you always use, a list of phrases you never want to see, and how you refer to your customers. That is actionable by anyone, human or otherwise.",
        ],
      },
      {
        h: "What makes a brief that produces a usable draft",
        p: ["A brief that leaves any of these implicit produces a rewrite:"],
        ol: [
          "The exact question the article answers, phrased as the reader would ask it.",
          "Who is reading and what they already know.",
          "The three to five points the piece must make.",
          "What the reader should do next.",
          "Anything to avoid — claims you cannot make, competitors not to name, topics off-limits.",
        ],
      },
      {
        h: "How do I keep a blog going when nobody owns it?",
        p: [
          "Honestly: you usually cannot, and this is worth being clear-eyed about. Publishing consistently is a real operational commitment — roughly four to six hours a week for a modest cadence, indefinitely, including the weeks when something is on fire.",
          "There are three honest options. Assign it to someone and protect the time as you would any other commitment. Outsource the whole operation rather than just the writing. Or decide content is not your channel and put the energy somewhere else. What does not work is intending to do it.",
        ],
      },
      {
        h: "The minimum viable system",
        p: [
          "If you are doing this in-house, this is the smallest thing that survives a bad month: a topic queue kept at least eight items deep so you never start from a blank page, a single named owner, a review deadline with an automatic default, a fixed publishing day, and one voice document.",
          "Everything beyond that is optimisation. Everything less than that is a blog that stops in March.",
        ],
      },
    ],
    faq: [
      { q: "Why do content programs stop publishing?", a: "Four operational failures: no single named owner, a review bottleneck with no deadline, no topic queue so every piece starts from a blank page, and perfectionism that keeps good work in drafts. Ideas are almost never the constraint." },
      { q: "How much time does maintaining a blog actually take?", a: "Roughly four to six hours a week for a modest cadence — indefinitely, including weeks when something else is on fire. That is the honest number, and underestimating it is why most in-house programs stall." },
      { q: "What should brand voice documentation contain?", a: "Not adjectives. Three paragraphs you would be happy to publish, three you would not and why, terms you always use, phrases you never want to see, and how you refer to your customers." },
    ],
  },
];

/* ================================================================== CITIES
 * Metro landing pages. Deployments run nationwide; these are the markets with
 * dedicated pages. Every entry must carry genuinely market-specific `notes`
 * — near-identical city pages are doorway pages and are treated as such.
 * `region` drives the grouping on /locations.
 */
const CITY_BASE = [
  /* ---------------------------------------------------------- Southwest */
  { slug: "content-marketing-phoenix", city: "Phoenix", state: "Arizona", abbr: "AZ", region: "Southwest",
    blurb: "The fifth-largest city in the country, with a service-business market to match. Competition for the obvious keywords is heavy; the long-tail questions Phoenix homeowners and business owners actually type are wide open.",
    notes: ["Extreme summer heat drives predictable seasonal search spikes in HVAC, plumbing and pest control", "Rapid population growth means constant new-mover searches — new to Phoenix, best neighbourhoods, who to hire", "A large share of the market is transplants with no established provider relationships"] },
  { slug: "content-marketing-scottsdale", city: "Scottsdale", state: "Arizona", abbr: "AZ", region: "Southwest",
    blurb: "Higher household income, higher-ticket services, and buyers who research more before committing. Content does disproportionate work here because the purchases are considered rather than urgent.",
    notes: ["Premium services — med spas, remodels, cosmetic dentistry, luxury real estate — with long research cycles", "Buyers compare carefully and read before contacting anyone", "Design and quality signals matter more than price positioning"] },
  { slug: "content-marketing-mesa", city: "Mesa", state: "Arizona", abbr: "AZ", region: "Southwest",
    blurb: "Arizona's third-largest city and one of the most under-served markets in the metro for genuinely local content. Most competitors here publish nothing at all.",
    notes: ["Large established housing stock driving steady repair and replacement demand", "Significant retiree population researching carefully before hiring", "Local competitors are largely absent from organic search"] },
  { slug: "content-marketing-tempe", city: "Tempe", state: "Arizona", abbr: "AZ", region: "Southwest",
    blurb: "A dense, young, university-anchored market with a high concentration of small businesses and a rental-heavy housing mix that shapes what people search for.",
    notes: ["High rental density shifts demand toward landlords and property managers", "Dense small-business and startup community", "Younger demographic that researches almost exclusively online"] },
  { slug: "content-marketing-chandler", city: "Chandler", state: "Arizona", abbr: "AZ", region: "Southwest",
    blurb: "A tech-employer corridor with high household income and newer housing. Buyers here skew technical and research thoroughly before choosing a provider.",
    notes: ["Major tech and semiconductor employment base", "Newer housing stock shifting demand toward upgrades over repairs", "Technically literate buyers who compare in depth"] },
  { slug: "content-marketing-gilbert", city: "Gilbert", state: "Arizona", abbr: "AZ", region: "Southwest",
    blurb: "One of the fastest-growing towns in the country, heavily family-oriented, with strong word-of-mouth networks that content amplifies rather than replaces.",
    notes: ["Rapid growth and continuous new-construction activity", "Family-heavy demographic with high referral behaviour", "Prospects almost always research a referral before calling"] },
  { slug: "content-marketing-las-vegas", city: "Las Vegas", state: "Nevada", abbr: "NV", region: "Southwest",
    blurb: "A hospitality-anchored economy sitting on top of a large and fast-growing residential market. Two very different sets of buyers search here, and most local competitors write for neither.",
    notes: ["Desert heat and hard water drive year-round HVAC, plumbing and water-treatment demand", "A hospitality and events economy means a deep pool of B2B service buyers alongside homeowners", "High population turnover keeps new-resident and relocation queries continuously fresh"] },
  { slug: "content-marketing-albuquerque", city: "Albuquerque", state: "New Mexico", abbr: "NM", region: "Southwest",
    blurb: "A mid-sized market where national directories dominate the results by default, simply because so few local businesses publish anything. The bar to own a topic here is unusually low.",
    notes: ["Adobe and stucco construction creates repair questions with no useful national answer", "High-desert climate swings drive distinct heating and cooling seasonality", "Very thin local publishing means directory sites hold rankings almost unopposed"] },

  /* ------------------------------------------------------- South Central */
  { slug: "content-marketing-houston", city: "Houston", state: "Texas", abbr: "TX", region: "South Central",
    blurb: "One of the largest and least zoned metros in the country, which makes local knowledge genuinely valuable. What is true in the Heights is not true in Katy, and buyers can tell when content knows the difference.",
    notes: ["Humidity, storm and flood exposure drive urgent, high-value search across trades and insurance-adjacent services", "A vast energy and industrial base creates a deep B2B and professional-services market", "Minimal zoning means permitting and property questions vary sharply by area"] },
  { slug: "content-marketing-dallas", city: "Dallas", state: "Texas", abbr: "TX", region: "South Central",
    blurb: "A corporate relocation magnet with continuous inbound population and a service market growing to meet it. High competition on head terms, wide-open long tail.",
    notes: ["Expansive clay soils make foundation, plumbing and structural questions a persistent local search category", "Constant corporate relocations feed new-mover and new-office service demand", "A crowded agency market means competitors buy ads rather than build organic coverage"] },
  { slug: "content-marketing-fort-worth", city: "Fort Worth", state: "Texas", abbr: "TX", region: "South Central",
    blurb: "Frequently treated as an appendage of Dallas by national competitors, which is exactly why genuinely Fort Worth-specific content outperforms here.",
    notes: ["Content written for 'DFW' rarely answers Fort Worth-specific questions, leaving the gap open", "A strong logistics, aviation and manufacturing base drives industrial and commercial service demand", "A mix of historic and new-build housing splits repair versus upgrade demand"] },
  { slug: "content-marketing-austin", city: "Austin", state: "Texas", abbr: "TX", region: "South Central",
    blurb: "One of the most research-heavy buyer populations in the country. People here read before they call, compare more options, and reward businesses that explain themselves clearly.",
    notes: ["A technology workforce that researches thoroughly and reads long-form before contacting anyone", "Rapid growth keeps relocation, new-build and first-time-owner queries continuously active", "Heavy inbound migration means limited established loyalty to incumbent providers"] },
  { slug: "content-marketing-san-antonio", city: "San Antonio", state: "Texas", abbr: "TX", region: "South Central",
    blurb: "A large, affordable, family-heavy market with far less organic competition than its size suggests. Most of the search demand here is answered by out-of-market directories.",
    notes: ["A substantial military and veteran population with distinct service and benefits-related questions", "Long cooling season and hard water sustain year-round trade demand", "Local organic competition is materially lighter than in the other big Texas metros"] },
  { slug: "content-marketing-oklahoma-city", city: "Oklahoma City", state: "Oklahoma", abbr: "OK", region: "South Central",
    blurb: "Severe-weather exposure makes several service categories urgent and seasonal here, and urgency is exactly where being the answer already published pays off.",
    notes: ["Storm, hail and tornado exposure drives roofing, restoration and insurance-claim search spikes", "An energy-anchored economy with a broad small-business base", "Buyers often search mid-emergency, so the business already ranking captures the call"] },

  /* ----------------------------------------------------------- Southeast */
  { slug: "content-marketing-atlanta", city: "Atlanta", state: "Georgia", abbr: "GA", region: "Southeast",
    blurb: "A sprawling, multi-county metro where 'Atlanta' means twenty different submarkets. National competitors write one page for all of them; that is the opening.",
    notes: ["Sprawl means service-area and 'do you cover my suburb' questions carry real search volume", "Humidity, pollen and pests generate a distinct and predictable seasonal calendar", "A dense corporate headquarters base supports a deep B2B and professional-services market"] },
  { slug: "content-marketing-miami", city: "Miami", state: "Florida", abbr: "FL", region: "Southeast",
    blurb: "A market shaped by weather risk, condo regulation and a genuinely bilingual buyer base. Very few competitors publish content that reflects any of the three.",
    notes: ["Hurricane season and building-safety regulation drive high-stakes, high-intent search", "A dense condo and HOA market creates questions no national page answers", "A large Spanish-speaking population is underserved by most local publishing"] },
  { slug: "content-marketing-tampa", city: "Tampa", state: "Florida", abbr: "FL", region: "Southeast",
    blurb: "Fast-growing, storm-exposed and full of new arrivals with no provider relationships. Nearly every high-intent question here is being asked by someone new to the area.",
    notes: ["Storm and flood exposure drives urgent seasonal demand across trades and restoration", "Heavy in-migration keeps relocation and first-time-hire queries continuously fresh", "A large retiree population that researches carefully and reads thoroughly before calling"] },
  { slug: "content-marketing-orlando", city: "Orlando", state: "Florida", abbr: "FL", region: "Southeast",
    blurb: "A tourism economy layered over a booming residential one. The short-term rental market alone generates a category of search demand almost nobody local is writing for.",
    notes: ["A large short-term rental and property-management segment with its own service questions", "Continuous new construction shifts demand toward warranty, upgrade and finish-out work", "Tourism seasonality creates a commercial service cycle distinct from the residential one"] },
  { slug: "content-marketing-jacksonville", city: "Jacksonville", state: "Florida", abbr: "FL", region: "Southeast",
    blurb: "Geographically one of the largest cities in the country, which makes 'who actually serves my part of town' a live question — and a searchable one.",
    notes: ["Enormous city footprint makes neighbourhood and service-area content unusually valuable", "Coastal salt exposure drives distinct maintenance and corrosion questions", "A military and logistics employment base with steady relocation turnover"] },
  { slug: "content-marketing-charlotte", city: "Charlotte", state: "North Carolina", abbr: "NC", region: "Southeast",
    blurb: "A banking and professional-services hub absorbing steady inbound migration. Buyers skew financially literate and compare in writing before they compare on a call.",
    notes: ["A financial-services employment base with analytical, comparison-driven buyers", "Sustained in-migration keeps new-resident service queries continuously active", "Rapid suburban expansion outruns the coverage of existing local content"] },
  { slug: "content-marketing-raleigh", city: "Raleigh", state: "North Carolina", abbr: "NC", region: "Southeast",
    blurb: "One of the most educated buyer populations in the country. Thin marketing copy performs badly here; substantive published answers perform unusually well.",
    notes: ["A research-and-university economy producing buyers who read before they contact anyone", "Steady technology and life-sciences relocation into the Triangle", "Competitors rely on referral flow and publish very little"] },
  { slug: "content-marketing-nashville", city: "Nashville", state: "Tennessee", abbr: "TN", region: "Southeast",
    blurb: "Growth has outpaced the local service market, and it shows in search: high demand, thin local answers, and directories filling the gap.",
    notes: ["A major healthcare-industry base supporting deep B2B and professional-services demand", "Sustained in-migration and new construction across the surrounding counties", "Tourism and events add a commercial service cycle on top of the residential one"] },
  { slug: "content-marketing-louisville", city: "Louisville", state: "Kentucky", abbr: "KY", region: "Southeast",
    blurb: "A mid-sized market with a large logistics economy and very little local organic competition. The cost of owning a topic here is a fraction of what it is in a top-ten metro.",
    notes: ["A major logistics and distribution hub driving commercial and fleet service demand", "Older housing stock with humid summers and freezing winters, so repair demand runs year-round", "Very few local competitors publish substantive content of any kind"] },

  /* --------------------------------------------------------- Mid-Atlantic */
  { slug: "content-marketing-washington-dc", city: "Washington", state: "District of Columbia", abbr: "DC", region: "Mid-Atlantic",
    blurb: "A government and contractor economy with unusually high scrutiny on who you hire. Credentials, process and clear written explanation carry more weight here than almost anywhere.",
    notes: ["A federal and contractor buyer base that vets providers in writing before engaging", "Dense historic districts with permitting and preservation rules national pages ignore", "A transient professional population continuously searching as newcomers"] },
  { slug: "content-marketing-baltimore", city: "Baltimore", state: "Maryland", abbr: "MD", region: "Mid-Atlantic",
    blurb: "Dense, historic housing stock and a large institutional employment base. The specific questions here — rowhome systems, permits, older infrastructure — have almost no good local answers online.",
    notes: ["Rowhome and historic construction creates repair questions no national page addresses", "A large medical and university employment base supporting steady professional demand", "Aging infrastructure keeps plumbing, electrical and structural search demand high"] },
  { slug: "content-marketing-philadelphia", city: "Philadelphia", state: "Pennsylvania", abbr: "PA", region: "Mid-Atlantic",
    blurb: "Old housing, tight streets, historic districts and neighbourhood identities that matter to buyers. Content written for 'the Northeast' answers none of it.",
    notes: ["Rowhouse and pre-war construction drives highly specific repair and renovation questions", "Strong neighbourhood identity makes area-level content genuinely useful, not filler", "Freeze-thaw cycles create a sharp and predictable seasonal demand pattern"] },
  { slug: "content-marketing-pittsburgh", city: "Pittsburgh", state: "Pennsylvania", abbr: "PA", region: "Mid-Atlantic",
    blurb: "Hills, basements, old housing and hard winters generate a set of local problems that national content simply does not cover.",
    notes: ["Hillside lots and basements drive persistent drainage, waterproofing and foundation search", "A healthcare, university and robotics employment base supporting B2B demand", "Older housing stock keeps repair and replacement demand steady year-round"] },
  { slug: "content-marketing-richmond", city: "Richmond", state: "Virginia", abbr: "VA", region: "Mid-Atlantic",
    blurb: "A government, legal and insurance market with historic housing around it. Buyers here are process-oriented and respond to content that explains rather than sells.",
    notes: ["A legal, insurance and state-government employment base with credential-conscious buyers", "Historic districts with preservation requirements that shape renovation questions", "Humid summers and freeze-thaw winters split the repair calendar in two"] },

  /* ------------------------------------------------------------ Northeast */
  { slug: "content-marketing-new-york", city: "New York", state: "New York", abbr: "NY", region: "Northeast",
    blurb: "The most competitive search market in the country on head terms — and one of the most winnable on the specific, procedural questions New Yorkers actually type.",
    notes: ["Co-op and condo board approval processes create questions with no national equivalent", "Borough and neighbourhood-level differences make city-wide content nearly useless", "Head terms are saturated, so the opening is entirely in specific, procedural long tail"] },
  { slug: "content-marketing-boston", city: "Boston", state: "Massachusetts", abbr: "MA", region: "Northeast",
    blurb: "Some of the oldest housing stock in the country, hard winters, and a highly educated buyer base that reads before it hires.",
    notes: ["Very old housing stock drives specific systems, permitting and renovation questions", "Harsh winters create sharp seasonal spikes in heating, roofing and burst-pipe demand", "A university and hospital economy producing thorough, comparison-driven buyers"] },

  /* -------------------------------------------------------------- Midwest */
  { slug: "content-marketing-chicago", city: "Chicago", state: "Illinois", abbr: "IL", region: "Midwest",
    blurb: "A huge market with severe seasonality and strong neighbourhood identity. Most local competitors publish nothing beyond a service-area page.",
    notes: ["Freeze-thaw cycles and hard winters drive urgent, high-value seasonal demand", "Pre-war housing stock creates specific systems and renovation questions", "Distinct neighbourhood markets make city-level content read as generic"] },
  { slug: "content-marketing-detroit", city: "Detroit", state: "Michigan", abbr: "MI", region: "Midwest",
    blurb: "Older housing, harsh winters and a steadily rebuilding market. Search demand here is real and the local organic competition is thin.",
    notes: ["Aging housing stock keeps repair, replacement and rehab demand consistently high", "Severe winters drive heating, roofing and freeze-damage search every year", "Ongoing renovation and redevelopment activity across the metro"] },
  { slug: "content-marketing-minneapolis", city: "Minneapolis", state: "Minnesota", abbr: "MN", region: "Midwest",
    blurb: "Extreme winters make several service categories genuinely urgent, and a dense corporate base makes the B2B side unusually deep.",
    notes: ["Severe cold drives heating, insulation, roofing and frozen-pipe demand on a predictable calendar", "A dense concentration of large corporate headquarters supporting B2B services", "A short outdoor season compresses exterior work into a narrow, competitive window"] },
  { slug: "content-marketing-columbus", city: "Columbus", state: "Ohio", abbr: "OH", region: "Midwest",
    blurb: "A steadily growing, insurance- and logistics-heavy market where most local businesses still treat their website as a brochure.",
    notes: ["An insurance, logistics and university employment base supporting professional services", "Steady growth without the competitive saturation of larger Midwest metros", "Four-season climate producing an even spread of demand across the year"] },
  { slug: "content-marketing-indianapolis", city: "Indianapolis", state: "Indiana", abbr: "IN", region: "Midwest",
    blurb: "A large logistics and manufacturing base with a mid-sized metro's level of organic competition. That gap is the whole opportunity.",
    notes: ["A logistics and distribution economy creating commercial and fleet service demand", "Affordable housing stock with a high owner-occupancy rate and steady maintenance demand", "Local organic competition is light relative to the size of the market"] },
  { slug: "content-marketing-kansas-city", city: "Kansas City", state: "Missouri", abbr: "MO", region: "Midwest",
    blurb: "A two-state metro where service areas, licensing and pricing genuinely differ across the line — and where almost nobody writes about that.",
    notes: ["A metro split across two states, so licensing and service-area questions carry real volume", "Severe storm and hail exposure driving roofing and restoration demand", "A broad small-business base with thin organic publishing"] },
  { slug: "content-marketing-st-louis", city: "St. Louis", state: "Missouri", abbr: "MO", region: "Midwest",
    blurb: "Century-old brick housing, severe storms and a fragmented municipal map. Local specifics matter enormously here and are barely covered.",
    notes: ["Historic brick construction creates tuckpointing, masonry and moisture questions unique to the market", "Dozens of separate municipalities mean permitting varies street to street", "Severe storm season drives predictable roofing and restoration spikes"] },
  { slug: "content-marketing-milwaukee", city: "Milwaukee", state: "Wisconsin", abbr: "WI", region: "Midwest",
    blurb: "Hard winters, older housing and a manufacturing base — a market with consistent demand and very little local organic competition.",
    notes: ["Severe winters and lake-effect weather driving heating and exterior repair demand", "Older housing stock with a high share of pre-war construction", "A manufacturing and industrial base supporting commercial service demand"] },

  /* -------------------------------------------------------- Mountain West */
  { slug: "content-marketing-denver", city: "Denver", state: "Colorado", abbr: "CO", region: "Mountain West",
    blurb: "Hail alone makes several categories urgent here every year, and continuous in-migration means a steady supply of buyers with no existing provider.",
    notes: ["Severe hail seasons drive roofing, auto-glass and restoration demand on an annual cycle", "Altitude and dry air create HVAC, humidity and building-envelope questions specific to the region", "Sustained in-migration keeps new-resident service search continuously active"] },
  { slug: "content-marketing-salt-lake-city", city: "Salt Lake City", state: "Utah", abbr: "UT", region: "Mountain West",
    blurb: "One of the fastest-growing metros in the country with a technology corridor attached. Demand is expanding faster than the local content covering it.",
    notes: ["A rapidly expanding technology corridor along the Wasatch Front", "Winter inversion and air quality drive distinct HVAC and filtration demand", "Hard water and mineral content create recurring plumbing and appliance questions"] },
  { slug: "content-marketing-boise", city: "Boise", state: "Idaho", abbr: "ID", region: "Mountain West",
    blurb: "A small metro absorbing outsized in-migration. Nearly every high-intent search here comes from someone who arrived recently and knows nobody.",
    notes: ["Heavy in-migration means most searchers have no existing provider relationships", "Rapid new construction shifting demand toward finish-out, warranty and upgrade work", "A small local competitor set that publishes very little"] },

  /* ---------------------------------------------------------- West Coast */
  { slug: "content-marketing-los-angeles", city: "Los Angeles", state: "California", abbr: "CA", region: "West Coast",
    blurb: "Not one market but dozens. The businesses that win here write for a specific side of the city, because that is how people actually search.",
    notes: ["Dozens of distinct submarkets, so city-wide content reads as generic to every one of them", "Complex permitting and ADU rules that vary by jurisdiction and generate heavy search", "A large creative and entertainment economy with its own B2B service demand"] },
  { slug: "content-marketing-san-diego", city: "San Diego", state: "California", abbr: "CA", region: "West Coast",
    blurb: "Coastal conditions, a large military population and an ADU boom create a set of local questions that national content never touches.",
    notes: ["Coastal salt air drives corrosion, roofing and exterior maintenance questions", "A large military and veteran population with distinct relocation and service needs", "Accessory dwelling unit activity generating sustained permitting and construction search"] },
  { slug: "content-marketing-san-francisco", city: "San Francisco", state: "California", abbr: "CA", region: "West Coast",
    blurb: "High-value work, heavy regulation and buyers who research exhaustively. Content that explains process and cost honestly outperforms anything promotional.",
    notes: ["Dense permitting and rent-control regulation generating high-volume procedural search", "Victorian and pre-war housing stock with specific seismic and systems questions", "A technology buyer base that reads thoroughly and compares in detail"] },
  { slug: "content-marketing-san-jose", city: "San Jose", state: "California", abbr: "CA", region: "West Coast",
    blurb: "High household income, high-ticket projects and technically literate buyers. This market rewards depth and punishes vague marketing copy.",
    notes: ["High-value residential projects with long, research-heavy decision cycles", "A technology workforce that evaluates providers analytically and in writing", "Seismic retrofit and permitting requirements creating specific local search demand"] },
  { slug: "content-marketing-sacramento", city: "Sacramento", state: "California", abbr: "CA", region: "West Coast",
    blurb: "State-government stability plus extreme summer heat and wildfire exposure. Demand is steady and the local organic competition is far lighter than the Bay Area's.",
    notes: ["Extreme summer heat driving sustained cooling and energy-efficiency demand", "Wildfire and air-quality exposure creating a distinct seasonal search pattern", "A state-government employment base providing unusually stable service demand"] },

  /* ------------------------------------------------------ Pacific Northwest */
  { slug: "content-marketing-seattle", city: "Seattle", state: "Washington", abbr: "WA", region: "Pacific Northwest",
    blurb: "Persistent moisture creates a maintenance calendar unlike anywhere else, and a technology buyer base that will read three thousand words before making a call.",
    notes: ["Sustained rainfall driving moss, moisture, roofing and drainage demand year-round", "A technology workforce that researches exhaustively before contacting a provider", "Steep lots and dense infill construction creating specific permitting questions"] },
  { slug: "content-marketing-portland", city: "Portland", state: "Oregon", abbr: "OR", region: "Pacific Northwest",
    blurb: "Older housing, a wet climate and buyers who care visibly about how work gets done. Content that explains materials and methods converts here.",
    notes: ["A wet climate driving moisture, roofing and drainage demand across most of the year", "Older housing stock with a high share of pre-war construction", "Buyers who weigh sustainability and material choices and read about them first"] },
];

/* Merge in the per-metro queries + landscape sentence (scripts/cities.depth.mjs). */
export const CITIES = CITY_BASE.map(c => ({ ...c, ...(CITY_DEPTH[c.slug] || {}) }));


/* ============================================================= COMPARISONS */
export const COMPARISONS = [
  {
    slug: "content-agency-vs-subscription",
    eyebrow: "Comparison",
    h1: "Content Agency vs. Content Subscription: Which Actually Fits",
    title: "Content Agency vs Subscription | ClearPath Content",
    metaDescription: "An honest comparison of agency retainers and content subscriptions — what each costs, what each delivers, and which one fits your situation.",
    keywords: ["content agency vs subscription", "content marketing agency alternative", "content subscription service", "agency retainer cost"],
    intro: [
      "These are genuinely different products that get compared as if they were the same thing. An agency sells expertise and hours. A subscription sells output and a system. Both are right for someone.",
      "Here is an honest breakdown of where each one wins, and where each one strains.",
    ],
    rows: [
      ["What you're buying", "Hours, expertise, strategic partnership", "A defined published output every month"],
      ["Typical cost", "Commonly thousands per month", "A fixed monthly subscription"],
      ["Articles per month", "Usually a handful", "A defined, contracted cadence"],
      ["Strategy", "Included, billed within the retainer", "Included in the program"],
      ["Who writes", "Often rotating freelancers", "A consistent, voice-conditioned system"],
      ["Cadence risk", "Varies with agency workload", "Fixed by contract"],
      ["Commitment", "Often 6–12 month contracts", "Month to month"],
      ["Best for", "Complex brands needing bespoke campaigns", "Businesses that need consistent publishing to just happen"],
    ],
    when: {
      agency: ["You need multi-channel campaign work, not just publishing", "Your brand or compliance situation is genuinely bespoke", "You have budget for a senior strategic partner and want one", "You need someone in meetings representing the work"],
      subscription: ["The main problem is that publishing does not consistently happen", "You want a predictable monthly cost you can plan around", "You want output rather than hours on a timesheet", "You would rather not manage a vendor relationship every week"],
    },
    faq: [
      { q: "Is a content subscription cheaper than an agency?", a: "Usually significantly, on a per-article basis — but they are not the same product. An agency includes strategic partnership, campaign work and account management. A subscription is a defined publishing output. Compare on what you actually need rather than on headline price." },
      { q: "When is an agency the better choice?", a: "When you need multi-channel campaign work rather than just publishing, when your brand or compliance requirements are genuinely bespoke, or when you want a senior strategic partner in the room. Those are real needs a subscription does not serve." },
    ],
  },
  {
    slug: "diy-content-vs-outsourcing",
    eyebrow: "Comparison",
    h1: "Doing Content Yourself vs. Outsourcing It",
    title: "DIY Content vs Outsourcing | ClearPath Content",
    metaDescription: "The honest math on doing content in-house versus outsourcing — real time cost, where DIY fails, and how to tell which one fits your business.",
    keywords: ["DIY content marketing", "in-house vs outsourced content", "should I outsource content marketing", "content marketing time cost"],
    intro: [
      "In-house content, done consistently, beats almost anything you can buy. Nobody knows your business, your customers or your objections better than you do.",
      "The catch is the word consistently. This is an honest look at what in-house actually costs in time, where it usually breaks, and how to tell which side of the line you are on.",
    ],
    rows: [
      ["Cost", "Your time, or a salary", "A predictable monthly fee"],
      ["Product knowledge", "Unbeatable", "Learned from you during setup"],
      ["Realistic time cost", "4–6 hrs/week, indefinitely", "About 30 minutes, once"],
      ["Cadence risk", "High — first thing dropped in a busy quarter", "Contracted"],
      ["Strategy", "You do it", "Included"],
      ["Quality ceiling", "Very high if sustained", "Consistent"],
      ["Most common failure", "It stops", "Generic output from a weak provider"],
    ],
    when: {
      agency: ["Someone can genuinely commit 4–6 hours a week, indefinitely", "That person will still be doing it in month nine", "Your subject matter is highly specialised or regulated", "You want maximum control over every word"],
      subscription: ["Content is the fifth priority of someone doing four other jobs", "You have started a blog before and it stopped", "You would rather buy the outcome than manage the process", "The opportunity cost of your time is higher than the fee"],
    },
    faq: [
      { q: "Should I write my own content or outsource it?", a: "Write it yourself if someone can genuinely commit four to six hours a week indefinitely and will still be doing it in month nine. Outsource if content will be the fifth priority of someone already doing four jobs. The failure mode of DIY is not bad writing — it is stopping." },
      { q: "How many hours a week does in-house content actually take?", a: "Roughly four to six for a modest cadence, covering topic selection, research, writing, editing, publishing and internal linking. Most estimates only count writing, which is why in-house programs are so consistently under-resourced." },
    ],
  },
];
