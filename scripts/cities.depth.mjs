/**
 * Per-metro depth: example queries buyers in that market actually type, and a
 * sentence on who currently holds those results. Merged into CITIES at load.
 * These exist so each city page carries real, non-interchangeable substance —
 * near-identical city pages are doorway pages and rank accordingly.
 */
export const CITY_DEPTH = {
  "content-marketing-phoenix": {
    queries: ["how much does a new AC unit cost in Phoenix", "best time of year to replace a roof in Arizona", "scorpion control Phoenix how often", "do I need a pool service in the winter Phoenix", "new to Phoenix what to know about hard water"],
    landscape: "Phoenix results for these are held almost entirely by national home-service marketplaces and lead brokers that resell the same enquiry to three contractors. None of them can tell a homeowner what a unit actually costs here in July." },
  "content-marketing-scottsdale": {
    queries: ["how much does a kitchen remodel cost in Scottsdale", "best cosmetic dentist Scottsdale how to choose", "med spa vs dermatologist for Botox", "Scottsdale HOA rules for exterior paint", "how long does a full home remodel take"],
    landscape: "Scottsdale buyers read three or four providers deeply before contacting one. The businesses that publish nothing are eliminated before the shortlist is even made." },
  "content-marketing-mesa": {
    queries: ["cost to replace polybutylene pipes Mesa", "senior discount home repair Mesa AZ", "how old is too old for an AC unit", "Mesa AZ permit for water heater replacement", "best neighborhoods in Mesa for retirees"],
    landscape: "Mesa is one of the emptiest organic markets in the metro. Most results are Phoenix-wide pages that never mention Mesa, which means a genuinely Mesa-specific answer has almost no competition." },
  "content-marketing-tempe": {
    queries: ["landlord responsibilities Tempe AZ repairs", "how to handle a tenant maintenance request", "Tempe rental property management fees", "ASU off campus housing what to check", "small business insurance Tempe cost"],
    landscape: "Tempe search skews heavily toward renters, landlords and small operators — a set of questions that home-service content written for owner-occupants never answers." },
  "content-marketing-chandler": {
    queries: ["smart thermostat worth it Arizona", "solar panel payback period Chandler", "new build home warranty what it covers", "whole home water filtration cost Chandler", "EV charger installation cost Chandler AZ"],
    landscape: "Chandler buyers want numbers, payback periods and specifications. Marketing copy without figures reads as evasive to this market and gets skipped." },
  "content-marketing-gilbert": {
    queries: ["best pediatric dentist Gilbert AZ how to choose", "Gilbert AZ HOA landscaping rules", "new construction home inspection worth it", "family friendly contractors Gilbert", "how to vet a contractor referral"],
    landscape: "Gilbert runs on referrals — but almost every referral gets searched before the call. The business with nothing published loses the referral it already earned." },
  "content-marketing-las-vegas": {
    queries: ["how often to service AC in Las Vegas", "hard water damage to appliances Las Vegas", "commercial kitchen equipment repair Las Vegas", "short term rental cleaning services Vegas", "pool maintenance cost Las Vegas per month"],
    landscape: "Vegas results split between national franchises and hospitality-sector directories. Neither addresses the residential market that has grown up around the Strip." },
  "content-marketing-albuquerque": {
    queries: ["stucco repair cost Albuquerque", "swamp cooler vs AC New Mexico", "adobe home maintenance checklist", "Albuquerque permit for a casita", "best time to reseal a flat roof New Mexico"],
    landscape: "Almost nothing in these results is written by an Albuquerque business. Adobe, stucco and swamp-cooler questions in particular are answered by out-of-state content that gets the specifics wrong." },

  "content-marketing-houston": {
    queries: ["how much does foundation repair cost in Houston", "do I need flood insurance outside a flood zone Houston", "AC not keeping up with Houston humidity", "Houston permit requirements for a home addition", "commercial HVAC maintenance contract Houston"],
    landscape: "Houston results are dominated by storm-chasing national restoration brands and lead aggregators. A local business that explains what flooding actually does to a slab here outranks all of them on the questions that matter." },
  "content-marketing-dallas": {
    queries: ["foundation repair cost Dallas clay soil", "how to tell if a foundation problem is serious", "Dallas vs Plano property tax difference", "office build out cost per square foot Dallas", "moving to Dallas what to know about the heat"],
    landscape: "Dallas competitors spend heavily on paid search and publish almost nothing. That makes the organic long tail unusually cheap to take in a market this size." },
  "content-marketing-fort-worth": {
    queries: ["Fort Worth foundation repair vs Dallas cost", "historic home renovation Fort Worth permits", "Fort Worth hail damage roof claim process", "commercial electrician Fort Worth industrial", "best suburbs of Fort Worth for families"],
    landscape: "Nearly every result here is a DFW-wide page that mentions Fort Worth once. Content that is actually about Fort Worth reads as local immediately, to both readers and search engines." },
  "content-marketing-austin": {
    queries: ["Austin permitting timeline for a remodel", "how much does an ADU cost in Austin", "best water softener for Austin hard water", "Austin property tax protest worth it", "moving to Austin from California what to expect"],
    landscape: "Austin buyers read exhaustively and compare in writing. Long-form content that shows real working knowledge is close to the only thing that moves them." },
  "content-marketing-san-antonio": {
    queries: ["VA loan home inspection San Antonio", "AC replacement cost San Antonio 2026", "hard water treatment San Antonio cost", "military relocation to San Antonio checklist", "San Antonio foundation watering schedule"],
    landscape: "San Antonio has big-metro search volume and mid-metro competition. Most of what ranks was written for Texas generally, not for this city." },
  "content-marketing-oklahoma-city": {
    queries: ["hail damage roof inspection Oklahoma City", "how to file a storm damage insurance claim OKC", "storm shelter installation cost Oklahoma", "OKC roof replacement how long does it take", "what to do after tornado damage to a house"],
    landscape: "After a storm, OKC results fill with out-of-state contractors who arrived that week. A local business with published, dated answers is the credible option, and searchers notice." },

  "content-marketing-atlanta": {
    queries: ["do you service my suburb Atlanta contractors", "crawl space encapsulation cost Atlanta", "pollen season HVAC filter Atlanta", "Atlanta permit for a deck", "termite bond cost Georgia"],
    landscape: "Atlanta's sprawl means the single biggest unanswered question is simply who covers which suburb. Almost no competitor answers it clearly, and searchers ask it constantly." },
  "content-marketing-miami": {
    queries: ["Miami condo 40 year recertification cost", "hurricane impact windows cost Miami", "HOA special assessment what are my rights Florida", "mold remediation cost Miami", "contratistas en Miami como elegir"],
    landscape: "Condo recertification and assessment questions carry enormous stakes in Miami and are answered almost entirely by law-firm ad pages. Clear, plain explanation wins this ground easily." },
  "content-marketing-tampa": {
    queries: ["hurricane roof straps insurance discount Florida", "Tampa flood zone how to check", "AC replacement cost Tampa 2026", "new to Tampa best neighborhoods", "wind mitigation inspection Tampa worth it"],
    landscape: "Tampa search is full of newcomers who do not know which questions to ask yet. Content that anticipates the next question keeps them on the page and converts." },
  "content-marketing-orlando": {
    queries: ["short term rental cleaning cost Orlando", "vacation rental pool maintenance Orlando", "new construction warranty claim Orlando", "Orlando HOA short term rental rules", "commercial cleaning contract Orlando hospitality"],
    landscape: "The short-term rental operator is one of the most valuable buyers in Orlando and one of the least written for. Nearly all local content targets primary residences." },
  "content-marketing-jacksonville": {
    queries: ["do you serve Mandarin Jacksonville", "salt air corrosion HVAC Jacksonville Beach", "Jacksonville permit for a fence", "moving to Jacksonville best neighborhoods", "hurricane prep checklist Jacksonville"],
    landscape: "Jacksonville is geographically enormous, so 'do you actually come out here' is a real question. Naming neighbourhoods explicitly is a cheap and unusually effective advantage." },
  "content-marketing-charlotte": {
    queries: ["cost to finish a basement Charlotte", "Charlotte vs Fort Mill property taxes", "how to choose a financial advisor Charlotte", "moving to Charlotte from the northeast", "Charlotte permit for a home office addition"],
    landscape: "Charlotte buyers compare in spreadsheets. Content with real numbers, tradeoffs and a stated methodology outperforms anything written to persuade." },
  "content-marketing-raleigh": {
    queries: ["Raleigh Durham Chapel Hill which to live in", "cost of a home addition Raleigh", "how to evaluate a contractor bid", "Wake County permit process timeline", "relocating to the Triangle for a tech job"],
    landscape: "The Triangle is one of the most credential-conscious markets in the country. Published expertise functions here the way a referral does elsewhere." },
  "content-marketing-nashville": {
    queries: ["Nashville permit for a short term rental", "cost to build in Williamson County", "healthcare compliance consulting Nashville", "moving to Nashville which suburb", "Nashville roof replacement cost 2026"],
    landscape: "Nashville's growth has badly outrun its local content. Search demand routinely exceeds what any local business has bothered to publish about it." },
  "content-marketing-louisville": {
    queries: ["basement waterproofing cost Louisville", "Louisville old house electrical upgrade cost", "fleet maintenance contract Louisville", "Louisville HVAC humid summer sizing", "historic district renovation rules Louisville"],
    landscape: "Louisville is close to an open field organically. Even modest, consistent publishing displaces the directory pages currently holding these results." },

  "content-marketing-washington-dc": {
    queries: ["DC historic district renovation permit", "how to vet a contractor security clearance", "DC rowhouse HVAC options", "GSA schedule consulting how it works", "DC vs Arlington vs Bethesda for families"],
    landscape: "DC buyers vet in writing before they engage. A business with no published process, credentials or explanation does not survive the shortlist stage." },
  "content-marketing-baltimore": {
    queries: ["Baltimore rowhome roof replacement cost", "formstone removal cost Baltimore", "Baltimore permit for a basement conversion", "old house knob and tube rewiring cost", "Baltimore historic tax credit renovation"],
    landscape: "Rowhome-specific questions have essentially no good answers online. National pages describe detached single-family homes that do not exist on these blocks." },
  "content-marketing-philadelphia": {
    queries: ["Philadelphia rowhouse party wall repair", "Philly permit for a roof deck", "how much does it cost to fix a flat roof Philadelphia", "Philadelphia tax abatement still available", "which Philly neighborhood should I live in"],
    landscape: "Philadelphia's housing stock is specific enough that generic content is visibly wrong. Local knowledge is immediately obvious to a reader and rewarded accordingly." },
  "content-marketing-pittsburgh": {
    queries: ["basement waterproofing cost Pittsburgh hillside", "retaining wall repair cost Pittsburgh", "Pittsburgh old house furnace replacement", "landslide insurance Pittsburgh", "Pittsburgh permit for a garage"],
    landscape: "Hillside drainage, retaining walls and century-old basements define this market and are barely covered by anyone publishing locally." },
  "content-marketing-richmond": {
    queries: ["Richmond historic district renovation rules", "how to choose an estate attorney Richmond", "Richmond VA permit for an addition", "insurance claim denied what next Virginia", "moving to Richmond best neighborhoods"],
    landscape: "Richmond's legal, insurance and government buyers respond to procedural clarity. Content that explains the steps outperforms content that sells the outcome." },

  "content-marketing-new-york": {
    queries: ["co-op board approval renovation NYC", "alteration agreement what it means", "DOB permit timeline NYC apartment", "how much does a gut renovation cost NYC per square foot", "which Brooklyn neighborhood should I live in"],
    landscape: "NYC head terms are unwinnable and irrelevant. The board-approval, alteration-agreement and permit questions are where the actual money is, and they are wide open." },
  "content-marketing-boston": {
    queries: ["Boston triple decker renovation cost", "ice dam prevention Boston", "knob and tube wiring insurance Massachusetts", "Boston historic commission approval process", "burst pipe what to do first Boston"],
    landscape: "Boston's building stock and winters generate specific, urgent questions. Content that answers them precisely is what gets found at eleven at night in February." },

  "content-marketing-chicago": {
    queries: ["frozen pipe burst what to do Chicago", "Chicago two flat renovation cost", "tuckpointing cost Chicago", "Chicago permit for a porch", "which Chicago neighborhood is right for me"],
    landscape: "Chicago's seasonal emergencies drive enormous search volume in narrow windows. Whoever is already published when the temperature drops takes the calls." },
  "content-marketing-detroit": {
    queries: ["Detroit home rehab cost per square foot", "Detroit land bank house what to check", "furnace replacement cost Detroit", "Detroit permit for a rehab", "is it worth renovating an old Detroit house"],
    landscape: "Rehab and renovation questions here are asked constantly and answered almost entirely by national real-estate portals with no local knowledge at all." },
  "content-marketing-minneapolis": {
    queries: ["furnace replacement cost Minneapolis", "ice dam removal cost Minnesota", "attic insulation R value Minnesota", "frozen pipes prevention Minneapolis", "when to schedule exterior painting Minnesota"],
    landscape: "The exterior work window in Minneapolis is short and everyone competes inside it. The businesses booked solid are the ones people found reading in January." },
  "content-marketing-columbus": {
    queries: ["Columbus Ohio basement waterproofing cost", "Columbus permit for a deck", "commercial insurance broker Columbus", "best suburbs of Columbus for schools", "furnace tune up cost Columbus"],
    landscape: "Columbus is growing steadily without the organic competition that usually accompanies growth. Very little of what ranks was written by a Columbus business." },
  "content-marketing-indianapolis": {
    queries: ["Indianapolis HVAC replacement cost", "fleet vehicle maintenance Indianapolis", "Indianapolis permit for a fence", "basement egress window cost Indianapolis", "best Indianapolis suburbs for families"],
    landscape: "A large logistics economy sits alongside a light organic field. Both the B2B and residential sides of this market are underserved." },
  "content-marketing-kansas-city": {
    queries: ["Kansas City Missouri vs Kansas side taxes", "do I need a license on both sides Kansas City", "hail damage roof claim Kansas City", "KC permit for a basement finish", "best Kansas City suburb to live in"],
    landscape: "The state line creates genuine confusion about licensing, permits and service areas — and almost nobody publishes a clear answer to any of it." },
  "content-marketing-st-louis": {
    queries: ["tuckpointing cost St Louis", "St Louis brick house moisture problems", "which St Louis municipality do I need a permit from", "St Louis basement flooding after heavy rain", "storm damage roof claim St Louis"],
    landscape: "St. Louis's municipal fragmentation makes permitting genuinely confusing, and its brick housing stock generates questions national content simply does not have." },
  "content-marketing-milwaukee": {
    queries: ["Milwaukee bungalow renovation cost", "ice dam prevention Milwaukee", "Milwaukee permit for a porch", "furnace replacement cost Milwaukee", "lead pipe replacement Milwaukee"],
    landscape: "Older housing plus hard winters means steady, predictable demand — matched by almost no local publishing at all." },

  "content-marketing-denver": {
    queries: ["hail damage roof claim Denver process", "how long does a roof claim take Colorado", "swamp cooler vs AC Denver", "Denver permit for a basement finish", "moving to Denver what to know about altitude"],
    landscape: "Every hail season brings out-of-state roofers with no local record. A Denver business with published, dated answers to claim questions is the obvious safe choice." },
  "content-marketing-salt-lake-city": {
    queries: ["hard water solutions Salt Lake City", "air quality inversion home filtration Utah", "cost to finish a basement Salt Lake City", "Salt Lake County permit process", "moving to Utah what to know"],
    landscape: "Utah's growth has brought a wave of newcomers with no provider relationships and a lot of questions nobody local has answered in writing." },
  "content-marketing-boise": {
    queries: ["moving to Boise what to know", "new construction warranty Idaho what it covers", "Boise permit for a shop or garage", "best Boise area suburbs", "well water testing Idaho"],
    landscape: "Most searchers here arrived within the last two years and know nobody. There is no incumbent relationship to displace — only an answer to be first with." },

  "content-marketing-los-angeles": {
    queries: ["ADU cost Los Angeles 2026", "LA permit timeline for an addition", "do you serve the west side or the valley", "soft story retrofit cost Los Angeles", "which LA neighborhood should I live in"],
    landscape: "LA is a dozen markets pretending to be one. Content written for 'Los Angeles' reads as generic in every single one of them; content written for the Valley or the South Bay does not." },
  "content-marketing-san-diego": {
    queries: ["ADU cost San Diego 2026", "salt air HVAC maintenance coastal San Diego", "PCS move to San Diego checklist", "San Diego permit timeline for an addition", "solar plus battery worth it San Diego"],
    landscape: "ADU and military-relocation questions are asked constantly here and answered mostly by statewide pages that miss every San Diego-specific detail." },
  "content-marketing-san-francisco": {
    queries: ["SF permit timeline for a remodel", "rent control what can a landlord do San Francisco", "soft story retrofit cost San Francisco", "Victorian foundation repair cost SF", "SF ADU conversion garage cost"],
    landscape: "San Francisco's procedural questions are high-stakes and poorly answered. Clear explanation of process beats persuasion in this market every time." },
  "content-marketing-san-jose": {
    queries: ["kitchen remodel cost San Jose 2026", "San Jose permit process for an ADU", "seismic retrofit cost Bay Area", "solar plus battery payback San Jose", "how to compare contractor bids"],
    landscape: "San Jose buyers evaluate providers the way they evaluate vendors at work. Specifications, timelines and real numbers are the entire game here." },
  "content-marketing-sacramento": {
    queries: ["AC replacement cost Sacramento", "wildfire smoke home air filtration Sacramento", "Sacramento permit for a pool", "defensible space requirements California", "best Sacramento suburbs for families"],
    landscape: "Sacramento has real search volume and a fraction of the Bay Area's competition. Heat and wildfire questions in particular are barely covered locally." },

  "content-marketing-seattle": {
    queries: ["moss removal roof Seattle cost", "crawl space moisture Seattle", "Seattle permit timeline for a DADU", "gutter cleaning how often Seattle", "heat pump vs furnace Seattle"],
    landscape: "Seattle's moisture problems are constant, specific and almost entirely unanswered by national content written for dry climates." },
  "content-marketing-portland": {
    queries: ["moss and gutter maintenance Portland", "Portland permit for an ADU", "old house sewer line replacement Portland cost", "heat pump rebate Oregon", "Portland basement moisture solutions"],
    landscape: "Portland buyers ask about materials, methods and rebates before price. Content that explains how the work is done outperforms content that quotes it." },
};
