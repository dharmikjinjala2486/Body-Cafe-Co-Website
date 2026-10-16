# Body Café Co website: final working plan

16 October 2026

This document defines the delivery sequence and current design direction. It retains explicitly provisional requirements until the team clarifies them. The supporting research, source links and detailed journey specifications are in `Website-Research-and-Plan.md`.

## 1. Assets are organised

The Website folder now includes 40 copied and verified files, approximately 128 MB: seven product mockups, four logo variants, brand guidelines, two colour references, 22 font files, the original mockup ZIP, Blender source and both requirements decks. Original files remain untouched.

```text
Website/
  Website-Final-Plan.md
  Website-Research-and-Plan.md
  assets/
    README.md
    asset-manifest.json
    brand/
      logos/
      guidelines/
      colours/
      fonts/
        aileron/
        lemonmilk/
    products/
      mockups/
    source/
      Bottle Mockups.zip
      blender/
  docs/
    requirements/
```

Source assets stay separate from future web-delivery files. Create responsive image exports and only the required licensed font weights during implementation. Keep ZIPs, Blender sources, requirements decks and private evidence out of the public deployment.

## 2. Catalogue and brand direction

The initial catalogue contains these seven products:

1. Iron Bisglycinate
2. L-Theanine
3. Vitamin D3 + K2
4. Omega-3 Fish Oil
5. Myo & D-Chiro Inositol
6. Creatine Chews
7. Psyllium Husk

The user confirmed that Vitamin D3 + K2 includes Omega-3 as triglycerides. Preserve that wording and obtain the approved quantities before publishing detailed facts.

Use the newly supplied mockups as the current visual foundation: ivory bottles, clean labels, individual cap colours, natural lighting and warm neutral backgrounds. Use Aileron for general brand typography and the supplied SVGs for the logo. Preserve logo proportions, clear space and contrast. Lemon Milk is the logo family and may be explored sparingly in short display headings.

Maintain a playful, evidence-led voice through clear copy and restrained interactions. The earlier illustrated packaging previews are historical references and do not define this version's design.

## 3. Immediate next deliverable: two concrete concepts

Develop two focused creative options using the actual supplied assets:

- **Concept A: warm editorial.** Spacious composition, confident product photography, restrained colour and a calm reading rhythm.
- **Concept B: expressive everyday.** Larger type, bolder product-colour sections and playful, controlled transitions, while retaining the same product facts and easy navigation.

Each concept must show a desktop and mobile homepage hero, a seven-product shop section, a D3 + K2 product-page overview and a lot-report entry point. Judge them on brand fit, clarity, mobile usability and how effectively they introduce evidence. A hero image alone is insufficient to select a design system.

Prototype prices, reports and facts must be visibly identified as placeholders where missing. Do not invent reviews, sales numbers, certifications or finished-product clinical results.

Update, 16 October 2026: the user requested expansion of both directions with clearly labelled preview data. Both now share the complete local application. See `IMPLEMENTATION-STATUS.md` for delivered features and remaining production requirements. Claude can provide a bounded critique of hierarchy, voice and missing states; Codex maintains the local source and verifies implementation. This remains a browser coordination workflow without automatic shared files or memory.

## 4. Public website structure

Main navigation: **Shop, Our Standards, Learn, Our Story**. Utilities: **Find your lot report, Search, Account, Cart**.

| Surface | Required content or behaviour |
|---|---|
| Homepage | Brand introduction, seven products, approved-goal discovery, evidence explanation, report lookup, product formats, approved bundles, founder story and service information |
| Shop | All seven products, readable names, form/pack facts, real prices and simple filtering |
| Product pages | Accurate gallery, formula/serving facts, approved benefits, price, delivery lookup, purchase controls, ingredients, directions, warnings, reports and FAQs |
| Bundles | Approved contents, itemised pricing and truthful savings; component stock and release controls |
| Standards and learning | Understandable sourcing/testing information and a provisional ingredient/proof library |
| Lot reports | Product and lot matching, approved summaries/documents, report versions and helpful failure states |
| Customer account | Mobile-based identity, orders, addresses, tracking, support cases and reorder; reward surfaces depend on the final rule |
| Support | Web/email/WhatsApp plus initial phone support, unique case IDs and linked order context |
| Commerce | Cart, checkout, payment recovery, confirmation, cancellation and return routes |
| Policies | Approved shipping, returns/refunds, cancellation, privacy, terms and required business disclosures |

Mobile design comes first. Product facts and purchase controls must remain readable without navigating a long story first. Keep report access prominent. Retain ordinary scrolling and reduced-motion support.

## 5. Core journeys

**Product choice:** discover by an approved everyday goal or exact product name, understand the formulation and suitability, inspect evidence, then purchase. No diagnostic quiz or AI health advice.

**Lot reports:** packaging QR opens the product page; the customer enters the lot number printed on the pack and sees the matching approved report. Include no-match, unpublished, loading, outage and withdrawn/recalled states. Report lookup does not authenticate an individual unit; concealed unit-code scope remains unresolved.

**Purchase:** guest checkout, with mobile OTP and optional email as the current proposed identity flow. Confirm whether OTP is mandatory before production implementation. Show price, taxes, delivery and COD charges before the final purchase action. Timed stock holds begin during payment, with server-side payment verification and reconciliation.

**COD:** include COD in the working scope. The comment specifies ₹150 to cover shipping plus an additional courier charge. Resolve whether ₹150 is an upfront advance or a fee collected later before building the payment flow.

**Post-purchase:** show verified order/payment status, delivery updates, support access and reorder. Permit cancellation before the agreed shipment-initiation boundary, enforced against concurrent dispatch. Separate unopened returns, opened-item complaints and safety escalation.

## 6. Operational platform

Build the required internal workflows alongside the customer site:

- Governed products, claims, prices and publication.
- Batch evidence, release status and report publication.
- Internal D2C inventory records, FEFO allocation and atomic reservations.
- Orders, payments, refunds and reconciliation.
- Vayuvega/Shipneer integrations and the retained controlled allocation direction, subject to API and operational fit.
- Unified support cases, returns, replacements and safety actions.
- Review verification and the agreed discount/referral mechanism.
- Microsoft SSO with MFA, Admin/Viewer authorization and different-person approvals for critical changes.
- Audit history, first-party events and contribution reporting.

Amazon's later comments specify FBA only, agency/Amazon operational management and reliance on Amazon inventory with bulk replenishment. Define the remaining website sync responsibilities before implementing the broader earlier Amazon scope. Represent FBA inventory separately from D2C stock.

Perform a short requirements-fit assessment before selecting the commerce engine and hosting stack. The choice must support the required payment reservations, batch controls, mobile identity, COD mechanics and approvals. A visual prototype does not establish production commerce readiness.

## 7. Build sequence

| Order | Deliverable | Completion condition |
|---|---|---|
| 1 | Asset organisation and working plan | Complete in this handoff; copies verified |
| 2 | Two visual concepts | Real assets shown in desktop/mobile hero, shop, product and report previews |
| 3 | Selected design system and complete journey layouts | Clear typography, colours, components and loading/error/empty/success states |
| 4 | Full public prototype | All seven product templates and connected purchase/report/support journeys |
| 5 | Server and operational implementation | Durable data, permissions, integrations and transaction recovery work correctly |
| 6 | Approved content and acceptance | Product records, claims, reports, policies and business settings verified |
| 7 | Coordinated release | Required channel readiness, monitoring and recovery arrangements in place |

This sequence does not reduce the complete v1 scope. Keep separate D2C and Amazon readiness checks while preserving the later request to launch together; the exact release interpretation remains provisional.

## 8. Required inputs, requested directly

There is enough visual material for the concepts. Request the following when needed for content and production:

- Approved rear labels and complete product records, including active quantities, pack sizes, directions, warnings and allergens.
- Final prices, bundle rules, stock and shipping dimensions/weights.
- Lot-linked approved reports and public/redacted versions.
- Founder story and any original people/product-use photography.
- Confirmed COD, reward, return, replacement and cancellation details.
- Support and business contacts, policies, domain and secure integration configuration.

Do not retry SharePoint. The user explicitly requested direct questions for missing information.

## 9. Provisional decisions

Retain the current answers to Q28, Q44, Q46, Q47, Q48 and Q49: ingredient/proof library, first-party events, feature flags/experiments, complete v1 with two gates, deferred extensions and delivered contribution. Mark them provisional until the other member clarifies them.

Also retain the explicitly unresolved mechanics listed in the research plan. An unanswered question must not become an invisible production assumption.

## 10. Quality and release checks

Validate real mobile and desktop journeys, readable product facts, keyboard/focus behaviour, contrast and reduced motion. Target WCAG 2.2 AA and Core Web Vitals of LCP ≤2.5 seconds, INP ≤200 ms and CLS ≤0.1 at the 75th percentile, with field monitoring after launch. References: [W3C](https://www.w3.org/WAI/WCAG22/quickref/) and [Google](https://web.dev/articles/vitals).

Test payment failures and duplicate/late webhooks, reservation expiry races, refund reconciliation, batch quarantine, bundle stock, OTP recovery, cancellation/dispatch races and courier failures. Confirm that Viewer permissions and second-person approvals hold on server endpoints.

Measure delivered contribution alongside payment success, delivery success, returns/RTO, repeat purchase and support resolution. Keep commercial targets grounded in actual launch data.

## Latest visual implementation update

16 October 2026: after reviewing the initial full-site directions, the user requested a frontend redesign in Claude and then asked Codex to sync it locally. Claude’s single “pick a cap” direction is now the current storefront, replacing its full-site A/B selector. The functional preview backend and pending production requirements remain unchanged. See `CLAUDE-SYNC.md` and `IMPLEMENTATION-STATUS.md`.
