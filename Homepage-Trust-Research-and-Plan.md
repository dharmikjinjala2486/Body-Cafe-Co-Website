# Body Café Co. — homepage research and proposed plan

Research date: 16 October 2026. Status: proposal; website implementation has not changed.

## Recommendation

Keep the Claude “Pick a cap” concept and café menu. Build the homepage around five customer questions: What do you sell? Which product should I explore? Why should I trust you? What have real customers experienced? What happens after I order?

Testimonials belong here, but they cannot carry the whole trust story. Product information, verifiable evidence, identifiable people and dependable service must support them. Baymard’s DTC research finds that shoppers can distrust reviews controlled by the brand and seek independent confirmation. Its separate research on small DTC catalogs identifies brand background and product information as important information needs. [DTC reviews research](https://baymard.com/research-articles/user-reviews-dtc), [DTC information needs](https://baymard.com/research-articles/dtc-users-informational-needs).

This is a qualitative benchmark, not a ranking of the world’s best websites. Competitor presentation demonstrates design patterns; it does not independently substantiate their supplement claims or prove that a section increases conversion. Our proposed order is a hypothesis to validate with Body Café Co. shoppers.

## Current homepage audit

The current source in `web/app.js` presents the cap hero, seven-product menu, lot lookup, three evidence steps, two illustrative pairings and FAQs. Its distinct packaging, typography and restrained interactions are worth keeping.

| Area | Current state | Proposed change | Priority |
|---|---|---|---|
| First impression | Strong packaging and headline; product category is less explicit | Add a plain description of the supplement range and concise, approved product context | Essential |
| Product choice | Names, formats and sample prices; little help interpreting unfamiliar ingredients | One approved purpose line per product, pack/serving details and clear product links | Essential |
| Quality | General evidence language; demo reports | Specific proof cards with source links, scope and status | Essential |
| Social proof | No homepage testimonials | Real product-linked customer experiences, only after permission and review | Conditional |
| New-shopper transparency | Lot input assumes the visitor owns a bottle | Lead with an understandable example report; retain lookup for existing customers | Essential |
| People | No real founder/team introduction | Short original founder story, portrait and actual roles | Essential content input |
| Real-world product context | Mostly rendered bottles | Real front/back packaging and product-in-hand photography | High value |
| Education | Learning pages exist but are absent from the homepage | Three concise guide previews | High value |
| Purchase certainty | FAQs contain provisional prices/returns | Consistent approved delivery, fees, return eligibility and contact information | Essential before launch |
| Pairings | Illustrative bundles | Keep secondary; publish only reviewed combinations and actual commercial terms | Conditional |

Two issues need particular attention before launch. The hero promises records for every supplement, while the preview contains illustrative records. Production wording must match the reports actually available. The returns FAQ gives seven days while also saying timings are pending; every customer-facing summary must agree with the final policy.

## Benchmark findings and application

| Reference | Observed pattern | Useful for Body Café Co. |
|---|---|---|
| [Ritual](https://ritual.com/) | Products, quality explanations, customer stories and named people are connected | Combine product discovery with accessible evidence and a human introduction |
| [Ritual sourcing](https://ritual.com/pages/ingredient-sourcing) | Ingredient origin and quality checkpoints have dedicated detail | Link each proof statement to something more specific than an icon |
| [Seed](https://seed.com/) | Product presentation connects with science, education and everyday imagery | Explain an unfamiliar ingredient/form without turning the homepage into a paper |
| [Thorne](https://www.thorne.com/) | Sourcing, testing and label accuracy receive distinct treatment | Separate what is in the formula from what was tested and what is certified |
| [AG1](https://drinkag1.com/) | Customer experiences have context; earlier-formula reviews are identified | Associate reviews with the correct product/formula version |
| [IM8](https://im8health.com/) | Proof and purchase reassurance appear close to the initial offer | Surface a few relevant, substantiated assurances early |
| [Wellbeing Nutrition](https://wellbeingnutrition.com/) | Discovery by needs/formats sits alongside experts and customer content | Make the seven products understandable; label expert roles separately from customer experiences |
| [Nutrabay](https://nutrabay.com/) | Cards expose price, pack information and review context; authenticity/service information is accessible | Provide useful facts near selection; avoid marketplace-level density for seven SKUs |
| [What’s Up Wellness](https://www.whatsupwellness.in/) | Product cards combine brief explanations with commerce information; some show no reviews | Make individual products legible and allow honest empty review states |
| [Feel](https://wearefeel.com/) | Customer reviews, nutritionist material and science are distinguished; an external review source is linked | Separate experience, expertise and evidence; link to genuine external feedback when available |
| [Heights](https://www.heights.com/) | Formula explanations and referenced study context accompany product positioning | Show evidence limits and formula specifics instead of unsupported scientific shorthand |

These are references for particular decisions, not templates to duplicate. Large review counts, guarantees, certifications, celebrity endorsements and health claims belong to those brands; none transfers to Body Café Co.

### Awwwards: use for craft

The [Awwwards ecommerce collection](https://www.awwwards.com/websites/e-commerce/) is useful for composition, photography, typography and interaction references. Its [Moringa Vinga listing](https://www.awwwards.com/sites/moringa-vinga) is a historical nominee reference for colorful product storytelling, not proof of a current award-winning supplement checkout. The [Digitron navigation example](https://www.awwwards.com/inspiration/easy-search-and-navigation-digitron-3d-immersive-site) illustrates the importance of retaining discoverable navigation within an immersive presentation.

For our brand: retain the large bottle, cap colors, bold LemonMilk headlines and Aileron reading text. Add quieter editorial sections and real photography. Avoid making the customer wait through animation to find a product, report or cart. Awards are a craft reference; usability and commercial outcomes need separate validation.

## Proposed homepage, in order

### 1. Hero: a clear invitation

Keep “Seven everyday essentials. Pick a cap.” Add a short, plain description making clear that this is a supplement collection. The selected bottle should have its name, format and approved one-line explanation. Keep “Shop all seven” as the primary action; make “Explore our standards” the secondary action for new visitors. Lot reports remain accessible in navigation.

Cap selection must work by touch and keyboard. Avoid involuntary product switching while someone reads. Introduce a compact real review summary here only once a legitimate dataset exists; otherwise leave it out.

### 2. Compact proof strip

Three concise assurances, each linking to its underlying detail. Candidate subjects are complete label information, specific lot evidence and accessible customer support. Final wording depends on what the business can substantiate. A decorative row of “premium,” “pure” and “trusted” badges supplies little information.

The strip should be visually quiet and readable on mobile. Do not claim independent testing, certifications, free delivery or a guarantee until the exact claim is supported.

### 3. Today’s menu: make all seven understandable

Keep the menu as the main commerce section, adding a compact product thumbnail, approved purpose, format, pack size/servings and price. Mobile rows should reveal these facts without hovering. Product details should be easy to open before adding unfamiliar supplements.

The seven products remain Iron Bisglycinate; L-Theanine; Vitamin D3 + K2; Omega-3 Fish Oil; Myo & D-Chiro Inositol; Creatine Chews; Psyllium Husk. Do not derive medical benefit copy from names alone. Keep clear preview labels until approved specifications and prices arrive.

Optional goal/category chips can follow approved positioning. They should filter products, not diagnose a condition or prescribe a combination. Seven products do not require a complex quiz.

### 4. The detail behind the bottle

Use a real packaging/process photograph alongside three short explanations: what is in the product, how quality is checked, and what evidence shoppers can inspect. Link to approved labels, relevant testing and the standards page.

Every statement needs a defined scope. Ingredient research, a finished-product trial, a manufacturing-facility certificate and a lot test report establish different things. Avoid presenting them as interchangeable proof.

### 5. Real customer experiences

Position after product discovery and the first substantive quality explanation. Start with up to three concise, approved cards on desktop and a manually controlled horizontal list on mobile. Each card should identify the product, review date, rating if actually supplied, approved customer display name and source/verification status. Link to the complete product review record.

Use customer images or short captioned videos only with permission. Distinguish featured reviews from the full review collection. Avoid selecting only perfect reviews while implying that they represent every customer. Broader product review pages should support rating distribution, useful filters and clearly identified staff responses. [Rating distributions](https://baymard.com/research-articles/user-ratings-distribution-summary), [responses to negative reviews](https://baymard.com/research-articles/respond-to-negative-user-reviews).

With no approved reviews, omit this module from the public homepage and use genuine founder/process content. Internal wireframes may show explicitly labeled layout placeholders, never invented customer quotations, faces, star averages or counts. One authentic review is preferable to an invented collection.

### 6. See what a lot report actually tells you

Merge the existing lookup and three-step evidence explanation into one stronger module. Prospective buyers get “See an example report”; existing owners get “Find your lot.” Include a close-up showing where the lot number appears on the pack.

An approved example should expose product, lot, testing date, lab/source, tests performed, units, method and applicable reviewed specification, with a readable summary and source document. Explain limitations nearby: a tested sample is not a promised personal health outcome or authentication of every individual pack. Until real evidence is supplied, visibly identify the example as a demonstration.

### 7. The people behind Body Café Co.

Use a real founder portrait, a concise original account of why the company exists and one concrete commitment customers can verify. Link to the full story. Add named technical reviewers or manufacturing partners only when their relationship, role, credentials and publication permission are established.

An expert can explain how information was reviewed; that is different from a blanket endorsement of all products. Avoid stock people presented as the actual team.

### 8. Useful reading

Three editorial cards: reading a supplement label, understanding a lot report and comparing ingredient forms. The current learning pages provide a starting point, but production articles need complete reviewed content and references where appropriate. Show author/reviewer and revision date when applicable.

Use close-up label imagery or restrained brand graphics. Keep the summaries helpful enough to justify the click rather than using fear or disease promises.

### 9. Before you order

Combine a short service assurance row with four to six FAQs. Answer delivery availability/timing, shipping charges, returns eligibility, choosing where to read product directions, lot reports and contacting support. Exact policies must be consistent across homepage, PDP, checkout and policy pages.

Show actual support email/WhatsApp and hours once supplied. A visible route to a person is more useful than an unsupported “24/7 support” promise. Do not advertise COD terms while its advance/fee mechanics remain undecided. Finish with a simple “Explore all seven” action.

### 10. Footer with real business information

Include business identity, contact routes, relevant license information, policies, social accounts and navigation. Newsletter signup is optional and belongs here with clear consent and a useful reason to subscribe. Avoid interrupting first-time visitors immediately with a signup modal.

The A/B/C design selector stays available in the review environment. Production navigation should be separate from internal design and Operations preview controls when launch work is authorized.

### Conditional additions, rather than mandatory extra sections

Approved bundles can sit after customer experiences or as a compact extension of the menu. Do not suggest taking all seven or describe arbitrary pairings as a routine. The confirmed D3 + K2 formula already includes Omega-3 as triglycerides; combinations need review against actual quantities and cautions.

Press coverage, awards, third-party review profiles and community galleries can be added when real, linked and permissioned. They are not prerequisites to make a credible launch homepage. Avoid an endless stack of repeated product carousels and trust badges.

## Trust and testimonial publishing rules

Nielsen Norman Group identifies design quality, disclosure, comprehensive content and connection to external sources as credibility factors. Apply this through working links, clear provenance and consistent information, alongside polished visuals. [Trustworthy design](https://www.nngroup.com/articles/trustworthy-design/).

| Content | Evidence needed | Public treatment |
|---|---|---|
| Verified purchase review | Correct customer/order/product relationship and delivered-order verification | Apply the badge only when checks pass |
| Gifted or paid experience | Actual experience, permission and material-connection record | Clearly disclose the gift/payment; do not call it a verified purchase automatically |
| Customer photo/video | Permission covering intended website use | Optional display name; captions and user-controlled playback |
| Expert material | Actual role, relevant credentials, permission and reviewed wording | Clearly label education/review role and any commercial connection |
| Lab evidence | Approved source file, lot identity, scope and reviewed interpretation | Link to evidence; state what was tested |
| Certification | Valid certificate, holder, scope, covered products/sites and logo permission | Use exact scope; facility certification is not automatically product certification |
| Aggregate rating | Real published review dataset and consistent calculation | Show count, source and product scope; no invented brand-wide average |

The current backend accepts reviews into pending moderation but does not yet implement approved public publishing. A homepage review section therefore needs a moderation/publication workflow, not just frontend cards. Record review source, consent, incentive disclosure, product/formula version, verification status and publication history. Separate ordinary criticism from content requiring privacy/claim review; do not suppress feedback simply for being negative. Never publish local demo-order reviews as real customer feedback.

For India-facing content, use a claim ledger mapping every health/quality statement to its approved label, evidence, applicable scope and reviewer. FSSAI advertising-and-claims rules address substantiation and restrictions on disease claims. Ingredient evidence must not be casually promoted as finished-product clinical proof. The linked compendium is a reference, so publication review must also account for applicable amendments. [FSSAI advertising and claims compendium](https://www.fssai.gov.in/upload/uploadfiles/files/Compendium_Advertising_Claims_Regulations_14_12_2022.pdf).

ASCI guidance addresses material connections, including gifts, and relevant qualification/credential disclosure for technical health advice. Use clear disclosures on the content itself when applicable, rather than burying them in the footer. [ASCI code and guidelines](https://www.ascionline.in/the-asci-code-guidelines/). These points guide content review; they are not a completed legal compliance assessment.

Avoid blanket range-wide “vegan” claims with fish oil in the catalog. Do not use “clinically proven,” “doctor recommended,” “FSSAI approved” as a quality/efficacy endorsement, “zero side effects,” invented sales counters, or unverified purity/superiority claims.

## Inputs needed, with priorities

Existing assets cover identity, fonts, cap colors, bottle renders and source requirements. They do not establish product efficacy, customer satisfaction or final service terms.

| Input | Minimum useful delivery | Purpose |
|---|---|---|
| Approved product records | Rear labels, formula/serving amounts, directions, cautions, allergens, pack sizes, prices and permitted purpose lines for seven SKUs | Product selection and accurate copy |
| Public quality evidence | Released lot reports, relevant licenses/certificates, exact scope and publication permissions | Substantiate proof modules |
| Founder/team | Original 100–150-word founder account, real portrait and exact roles | Human accountability |
| Genuine reviews, if available | Original feedback, SKU, date, source, verification, permission and incentive details | Honest social proof |
| Real product photography | Front/back label, seal/lot close-up, product in hand and several everyday-use scenes | Scale, usability and reality beyond renders |
| Service details | Final shipping/fees, returns, cancellation/COD decisions, support contacts and hours | Purchase certainty |
| Optional content | Customer video, genuine external coverage and reviewed learning articles | Enrichment after fundamentals |

No particular review count is required to begin. If testimonials are unavailable, launch with stronger factual evidence and real people, then add feedback as it arrives. Lifestyle imagery can be commissioned, but it must not be represented as customer testimony.

## Design and implementation sequence

1. **Create the content/evidence map.** Identify each proposed statement, owner, source, status and destination link. Resolve inconsistent service wording. Mark missing facts explicitly in the preview.
2. **Make desktop and mobile wireframes for direction C.** Show the ten-section sequence, with conditional modules visibly identified. Preserve A/B for comparison. Check that the first screens communicate product category, seven-item choice and a credible reason to explore.
3. **Build the essential modules.** Improve the menu, evidence presentation, report example, founder/learning previews and service information. Build review moderation/publication before displaying genuine review data. Retain clearly labeled preview prices/reports until replacements are approved.
4. **Review content and experience together.** Verify claim sources, permissions, accurate certifications, link destinations, mobile reading, keyboard access and reduced-motion behavior. Confirm no invented proof or demo customers appear in production data.
5. **Validate with target shoppers, then measure after launch.** Use an initial qualitative round with roughly five to eight representative participants to find comprehension problems; this is not statistically reliable conversion evidence. Iterate on the problems observed. Run controlled comparisons only when real traffic supports them.

Animations must not hide essential information or depend on hover. Keep customer video click-to-play and load media below the fold lazily. Use real static thumbnails instead of heavy social embeds on the critical path. Check contrast across all seven cap palettes, visible focus, readable body text, accessible controls and layout stability. Baymard documents discoverability and interaction problems with poorly implemented homepage carousels. [Homepage UX research](https://baymard.com/research-articles/ecommerce-homepage-ux).

## Success criteria

Before launch, a new visitor should be able to explain what the company sells, find an appropriate product page, locate full label information, identify the source/limits of quality evidence, understand who is behind the business and find delivery/returns/support details.

Test this through observed tasks: “Find the full ingredients,” “Show me evidence for a batch,” “Find out who runs the company,” and “What would delivery and a return involve?” Do not lead participants toward the desired answer.

After launch, track homepage-to-product visits, product-to-cart progression, completed orders and the existing delivered-contribution business measure, together with evidence/review link usage and support questions. Interpret engagement alongside purchase outcomes; a frequently clicked report link is not by itself proof of higher trust. Avoid collecting raw lot inputs, health conditions, contact details or review text in analytics events.

The recommended first work package is the content/evidence map and a mobile-first homepage wireframe. Testimonials are one module within that plan; product clarity and substantiated proof are the foundation.
