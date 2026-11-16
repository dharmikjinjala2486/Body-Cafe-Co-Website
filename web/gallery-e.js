/* Body Café Co. — Variant E product galleries (16 Nov 2026).
   The owner's seven-image listing set for each product (web/media/gallery/<id>-01 … -07.webp, 1254 × 1254, converted
   from the "Amazon Listing images" folders). Product pages in Parts 1–4 and Content Focus show these, in this order,
   ahead of any images uploaded in the admin portal. To change a picture, replace its file under the same name.
   Image 1 is the bottle; image 7 is the selected label facts, drawn as a panel (no rear-label photograph). */
(function () {
  "use strict";
  var SIZE = 1254;
  var SETS = {
    "omega-3-fish-oil": [
      ["Bottle", "Omega-3 Fish Oil bottle"],
      ["Support", "Support for the way you live: heart, brain and joint health. Daily support, in one softgel."],
      ["Total omega-3", "800 mg total omega-3 as triglycerides per softgel, from 1,000 mg fish oil concentrate."],
      ["EPA and DHA", "Two key omega-3 fatty acids per softgel: 400 mg EPA and 300 mg DHA."],
      ["Fish oil and omega-3", "Fish oil and omega-3 are different amounts: 1,000 mg fish oil concentrate, 800 mg total omega-3, 400 mg EPA and 300 mg DHA."],
      ["Routine", "One small step in your morning: take 1 softgel with food, daily in the morning. 60 softgels, 60 daily servings."],
      ["Label facts", "Supplement facts, other ingredients and allergen information for Omega-3 Fish Oil."],
    ],
    "vitamin-d3-k2": [
      ["Bottle", "Vitamin D3 + K2 bottle"],
      ["Support", "Support for everyday movement: bone, muscle and heart health."],
      ["Three nutrients", "Three nutrients in one daily softgel: 600 IU vitamin D3, 55 mcg vitamin K2 and 200 mg total omega-3."],
      ["The forms", "A closer look at the forms: vitamin D3 as cholecalciferol and vitamin K2 as MK-7."],
      ["Omega-3", "Beyond the fish oil number: 250 mg fish oil concentrate, 200 mg total omega-3 as triglycerides, 100 mg EPA and 75 mg DHA."],
      ["Routine", "A simple daily routine: take 1 softgel with food, daily in the morning. 60 softgels, 60 daily servings."],
      ["Label facts", "Supplement facts, other ingredients and allergen information for Vitamin D3 + K2."],
    ],
    "creatine-chews": [
      ["Bottle", "Creatine Chews bottle, orange flavour"],
      ["Support", "Support your strength: creatine for strength and performance."],
      ["Serving", "3,000 mg creatine monohydrate per 2 chewable tablets. 60 tablets, 30 servings."],
      ["Flavour", "A bright orange flavour."],
      ["Format", "A different way to take creatine: chewable tablets, no powder to mix, no shaker needed."],
      ["Routine", "Choose your time and stay consistent: one time each day, with food or on an empty stomach. Chew thoroughly."],
      ["Label facts", "Nutrition and formula facts, other ingredients and allergen note for Creatine Chews."],
    ],
    "iron-bisglycinate": [
      ["Bottle", "Iron Bisglycinate bottle"],
      ["Dose", "29 mg iron per capsule. 60 capsules, 60 daily servings."],
      ["Hemoglobin", "Support for hemoglobin formation."],
      ["Energy", "Support for energy metabolism, for your everyday rhythm."],
      ["The form", "The form matters: Ferrochel® ferrous bisglycinate chelate, neutrally charged."],
      ["Routine", "Make room for your morning routine: take 1 capsule daily, in the morning, on an empty stomach. Avoid milk for 2 hours before or after."],
      ["Label facts", "Selected label facts, other ingredients, allergen note, caution and storage for Iron Bisglycinate."],
    ],
    "l-theanine": [
      ["Bottle", "L-Theanine bottle"],
      ["Calm", "Support a calmer mind."],
      ["Focus", "Make space for clear focus: L-Theanine for focus support."],
      ["Serving", "200 mg L-Theanine per capsule. 30 capsules, 30 daily servings."],
      ["Green tea", "L-Theanine, naturally found in green tea."],
      ["Routine", "A simple morning habit: take 1 capsule daily, in the morning, with food or on an empty stomach."],
      ["Label facts", "Selected label facts, other ingredients, allergen note, caution and storage for L-Theanine."],
    ],
    "myo-d-chiro-inositol": [
      ["Bottle", "Myo & D-Chiro Inositol bottle"],
      ["The ratio", "Understand the ratio: 40 parts Myo-Inositol to 1 part D-Chiro Inositol."],
      ["Amounts", "Amounts per 3 capsules: 2,000 mg Myo-Inositol and 50 mg D-Chiro Inositol."],
      ["Support", "Supports hormonal and metabolic balance."],
      ["Your month", "Plan your month: 90 capsules make 30 servings."],
      ["Routine", "Make it part of breakfast: take 3 capsules in the morning, with food."],
      ["Label facts", "Selected label facts, other ingredients, allergen note, caution and storage for Myo & D-Chiro Inositol."],
    ],
    "psyllium-husk": [
      ["Bottle", "Psyllium Husk (Isabgol) bottle"],
      ["Support", "Support your everyday rhythm: supports digestive health and regularity."],
      ["Husk amount", "2,000 mg psyllium husk (isabgol) per 5 capsules. 150 capsules, 30 servings."],
      ["Fibre", "Fibre per 5 capsules: 1,578 mg dietary fibre, of which 1,362 mg soluble fibre."],
      ["Ingredient", "Psyllium husk, also called isabgol."],
      ["Routine", "Your evening routine: take 5 capsules once daily, at night with food, with a full glass of water."],
      ["Label facts", "Selected label facts, other ingredients, allergen note, caution and storage for Psyllium Husk."],
    ],
  };
  function list(id) {
    var set = SETS[id];
    if (!set) return [];
    return set.map(function (x, i) {
      var n = (i < 9 ? "0" : "") + (i + 1);
      return { src: "/web/media/gallery/" + id + "-" + n + ".webp", w: SIZE, h: SIZE, label: x[0], alt: x[1] };
    });
  }
  window.BCCGalleryE = { list: list, has: function (id) { return !!SETS[id]; } };
})();
