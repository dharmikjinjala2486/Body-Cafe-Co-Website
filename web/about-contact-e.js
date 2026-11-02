/* Body Café Co. — Variant E · Contact and About: reference copy.
   From the owner-selected reference (design-review/story-source-2026-11-02/reference-index.html): contact() and the
   "Our belief" and "Why we exist" sections of home(). Reproduced verbatim; checked by design-tools/test-about-contact-e.mjs.
   Contact keeps its working support form and the Super Sevens switchboard; About keeps all of its existing sections.
   The homepage is not touched by this file. */
(function () {
  "use strict";
  var S = window.BCCSite, L = window.BCCLivingE;
  if (!S || !S.themes || !S.themes.e || !L) return;
  var esc = L.esc;

  var CONTACT = {
    eyebrow: "Contact",
    title: "Ask us anything.",
    lede: "If something isn't clear on a label, or you want to know more about how a product is made, write to us. We'll answer in plain language, and we'll tell you where the answer comes from.",
    addressLabel: "Address",
    address: "Bluebell Lifecare Pvt. Ltd., Ahmedabad, Gujarat 380054, India",
    note: "We can explain our products, but we can't give medical advice. For questions about your health, please speak with a doctor.",
  };
  var BELIEF = {
    eyebrow: "Our belief",
    title: "You should always know what you're being served.",
    lede: "A good café never hides the recipe. You can read the menu, see what goes into your cup, and ask what you like. We think supplements deserve the same openness.",
    body: "So every label we print answers the three questions careful people ask: what form is this ingredient in, how much of it do I get, and when should I take it? If a label cannot answer those, it is not finished.",
  };
  var WHY = {
    eyebrow: "Why we exist",
    title: "The front of the label shouts. The back whispers.",
    shout: ["More energy.", "More strength.", "More glow."],
    body: [
      "You check the date on the milk packet. You read reviews before buying a phone cover. Then you reach the supplement shelf, and the facts that matter most are in tiny type, inside a \"blend\", or missing.",
      "Advice arrives from every direction, and very little of it is clear. So people either buy on faith, or quietly stop. Neither is a real choice. A choice needs information.",
    ],
  };
  // The About "Keep going" link to Story now uses the Story page's own headline.
  var STORY_LINK = "You should always know what you're being served.";

  /* ---------------------------------------------------------------- Contact */
  L.wrap("contact", function (root) {
    var head = root.querySelector(".su-head"); if (!head) return;
    var k = head.querySelector(".su-k"), h1 = head.querySelector("h1"), lede = head.querySelector(".su-lede");
    if (k) k.textContent = CONTACT.eyebrow;
    if (h1) h1.textContent = CONTACT.title;
    if (lede) lede.textContent = CONTACT.lede;
    head.classList.add("sca-head");
    // Address and the medical-advice note travel with the switchboard (super-sevens.js), which reads them from here.
  });
  window.BCCContactE = CONTACT;

  /* ---------------------------------------------------------------- About */
  function belief() {
    return '<section class="sca-belief" aria-labelledby="sca-belief-t"><div><p class="ez-k">' + esc(BELIEF.eyebrow) + '</p><h2 id="sca-belief-t">' + esc(BELIEF.title) + "</h2></div>" +
      '<div class="sca-stack"><p class="sca-lede">' + esc(BELIEF.lede) + "</p><p>" + esc(BELIEF.body) + "</p></div></section>";
  }
  function why(ctx) {
    var cols = ctx.catalog.slice(0, 3).map(function (p) { return p.color; });
    return '<section class="sca-why" aria-labelledby="sca-why-t"><div><p class="ez-k">' + esc(WHY.eyebrow) + '</p><h2 id="sca-why-t">' + esc(WHY.title) + "</h2></div>" +
      '<div class="sca-stack"><p class="sca-shout">' + WHY.shout.map(function (s, i) { return '<s style="--cap:' + (cols[i] || "#2d2926") + '">' + esc(s) + "</s>"; }).join(" ") + "</p>" +
      WHY.body.map(function (b) { return "<p>" + esc(b) + "</p>"; }).join("") + "</div></section>";
  }
  L.wrap("about", function (root, ctx) {
    var hero = root.querySelector(".eza-hero"), ezaWhy = root.querySelector(".eza-why");
    if (hero) hero.after(L.frag(belief()));
    if (ezaWhy) {
      ezaWhy.before(L.frag(why(ctx)));
      // E's own "Why we exist" section now continues the reference one; its repeated kicker is hidden visually only.
      var k = ezaWhy.querySelector(".ez-k"); if (k) k.classList.add("sr-only");
      ezaWhy.classList.add("sca-continues");
    }
    var storyLink = root.querySelector('.eza-next a[href="/story"] strong');
    if (storyLink) storyLink.textContent = STORY_LINK;
  });

  window.BCCAboutContactE = { CONTACT: CONTACT, BELIEF: BELIEF, WHY: WHY, STORY_LINK: STORY_LINK };
})();
