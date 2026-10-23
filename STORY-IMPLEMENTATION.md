# Story — A–H implementation

23 October 2026. Base: `fd6036d` (About + Learn release). Not pushed or deployed.

## Page roles

| Route | Role | Change |
|---|---|---|
| `/about` | Who we are today | Unchanged. Its own renderer was already separate from Story. |
| `/story` | How it began and developed | New dedicated page in every direction (`web/story.js`) |
| `/standards` | Quality and evidence | Unchanged; linked from chapters 3 and 8 |
| `/learn` | Education | Unchanged; linked from chapters 5 and 8 |

## Shared flow (identical order in A–H)

The page opens with a hero and "The story in short", followed by the chapter rail and the full narrative.

| # | Chapter (anchor) | Status | Content |
|---|---|---|---|
| 1 | The opening moment (`#opening`) | Live | Brand idea (approved copy) and the seven caps |
| 2 | Before there was a brand (`#before`) | Hidden until founder material is supplied | — |
| 3 | The question we kept asking (`#question`) | Live | Trust-first vs detail-first (approved copy), who it's for, link to Standards |
| 4 | Becoming Body Café Co. (`#name`) | Live | Why a café; "there's no café to visit"; Playful, never vague; **The objects that tell our story** |
| 5 | Making the first collection (`#collection`) | Live | Seven on the counter, formats with product links, draft-pack line-up, links to Shop and Learn |
| 6 | What the journey taught us (`#lessons`) | Hidden until supplied | — |
| 7 | A note from the founder (`#founder`) | Hidden until supplied | — |
| 8 | The next chapter (`#next`) | Live | Where things stand now (documented) vs what we're working towards (no dates) vs what we won't do; routes to About, Standards, Learn, Shop, Ask about our story |

Hidden chapters leave no gap, heading, placeholder or empty slot. They appear in the nav and in the correct place as soon as the `FOUNDER` record in `story.js` holds approved content.

## The objects that tell our story

Five genuine objects, selectable as tabs (arrow, Home and End keys), each with an enlargeable image, what it is, and why it matters. No dates are shown, because none are documented:

1. A cap (studio render)
2. A draft bottle (L-Theanine front of pack)
3. The colour sheet (brand colour guide)
4. The wordmark (brand guide)
5. Two typefaces (brand guide)

`FOUNDER.objects` can add real items such as a notebook, naming sketch or first finished bottle, with an optional date.

## Functionality

- **Chapter rail.** Sticky below each direction's sticky header (measured at runtime), with a scroll-spy (`aria-current="location"`) and a 2–4px reading-progress line. H puts it in the left margin on desktop.
- **Anchors.**
  - A share button on every chapter copies the chapter link, with a visible fallback.
  - A direct `/story#chapter` link opens at that chapter and stays aligned while fonts and images load.
- **Image viewer.** A native modal `<dialog>`: focus moves to Close, arrow keys move between images, the caption and an "Image n of N" counter are announced, and Escape returns focus to the opener.
- **Ask about our story.**
  - Each chapter ends with "Ask about this chapter": `/contact?kind=brand&topic=/story#<chapter>`.
  - The closing route uses `topic=/story`.
  - The contact form pre-selects "About the brand" and shows "About: /story#…". The case stores the topic, with the subject "About the brand · /story#…".
- **Conditional, built and tested with in-memory fixtures only:**
  - Founder background, with photos.
  - Lessons, with links to their present-day expression.
  - Founder note, with portrait and signature.
  - Founder video or audio: `preload="none"`, no autoplay, a captions track and/or a transcript.
  - Timeline: renders only with 4–6 dated milestones.
  - Packaging-evolution viewer: needs 2+ real versions.
  - "A decision that changed".
- **Other:**
  - The design parameter is kept on all links.
  - Reduced motion removes the cap animation and smooth scrolling.

## Directions

- **A.** A poster sequence: Anton capitals, a graph-paper hero, lime-highlighted quote, bracketed chapter tags, and a blue closing chapter.
- **B.** A storybook of rounded colour-field chapter cards, numbered discs, and a speech-bubble question.
- **C.** A chaptered book: Gloock serif, red rotated chapter stamps, an arched window for the caps, and a blue closing chapter.
- **D.** After hours: midnight blue, centred gallery labels with gold rules, and a lit vitrine under each object.
- **E.** A fan deck: each chapter is a cap-colour swatch band, with a seven-colour progress line.
- **F.** A long-read: folio rules, ultralight heads, a drop cap, and numbered figures.
- **G.** A darkroom: alternating black and white chapters, frame numbers, and prints that develop from grayscale on hover or selection.
- **H.** A reference text: the chapter list in the margin, italic § heads, and plates.

## Server and app

- **`app/server.py`.** New `CASE_TOPIC` accepts `/learn[/slug]`, `/story` and `/about`, each with an optional `#section`. Learn feedback still uses `LEARN_TOPIC`.
- **`app/test_server.py`.** New test: Story questions keep their chapter reference, and invalid references are rejected.
- **`web/app.js`.**
  - The `caseTopic()` regex now matches the server.
  - `enhance()` calls `BCCStory.enhance()`.
- **`web/index.html`.** Loads `story.css` and `story.js` after Learn.

## Missing founder content (needed to complete chapters 2, 6, 7 and the optional components)

1. What first prompted the founder to start Body Café Co.: the real observation or moment, in their words.
2. Founder name, role and relevant background, as they want it published.
3. The real naming story, if it goes beyond the approved "Why a café?" copy, plus any naming notes or sketches.
4. Why these seven products were chosen first.
5. The decisions that took the most thought, and one that changed during development (before → after → why).
6. 2–4 genuine lessons or changes in thinking.
7. A founder's note about what the brand means today, plus an approved portrait (photo, alt text, credit).
8. Original assets, with dates where known:
   - notebook pages
   - sketches
   - earlier packaging versions (with what changed and why)
   - the first finished bottle
   - photographs from before the brand
9. 4–6 documented milestones with real dates.
10. Optional: founder audio or video with a captions file (VTT) or transcript.
11. What a customer should feel after reading the story, to tune the summary and closing.

Not used, deliberately:
- the stock reference photography on brand-guide page 8
- the colour page listing unreleased SKUs
- the 3D three-quarter renders, whose order relative to the mockups is unknown
- the internal CEO decision deck
