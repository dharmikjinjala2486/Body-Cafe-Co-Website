/* Design-only content fixtures, requested 24 October 2026.
   Kept separate from approved business records and from review/laboratory APIs.
   Remove this adapter before a production launch. No clinical doses, test results,
   licence numbers, verified reviews or payment capabilities are invented here. */
(function () {
  'use strict';
  // Demonstration fixtures exist only in preview releases; production shows the approved/pending states instead.
  if (window.BCCRelease && !window.BCCRelease.preview) return;
  const S = window.BCCSite, C = window.BCCSupportContent;
  const contact = {phone:'+91-8457125489',email:'care@bodycafeco.com'};
  const packs = {
    'iron-bisglycinate':'60 capsules', 'l-theanine':'30 capsules',
    'vitamin-d3-k2':'60 softgels', 'omega-3-fish-oil':'30 softgels',
    'myo-d-chiro-inositol':'30 capsules', 'creatine-chews':'30 chews',
    'psyllium-husk':'30 capsules'
  };
  function packInfo(id) {
    const value = packs[id];
    return value ? {
      value, status:'demo', label:'Demo pack: ' + value,
      description:'This design preview uses a demo pack of ' + value + '. The final pack quantity will be confirmed from the approved label.'
    } : null;
  }
  const delivery = 'Demo delivery charge: ₹75, waived when the order subtotal after discounts is ₹1,499 or more. No payment or dispatch takes place in this preview.';
  const returnWindow = 'For this demonstration, contact us within 7 days of delivery about an unopened return or an order issue. Final return terms are not approved.';
  // Exact policy/section IDs prevent a delivery-time example appearing under charges or failed delivery.
  // Unmapped pending sections retain their own explanation rather than a generic contact substitution.
  const policyExamples = {
    shipping: {
      where:'This design preview illustrates delivery within India. Courier serviceability is not connected; the pincode tool checks format only.',
      processing:'Demo dispatch estimate: 1–2 business days. No order is packed or dispatched in this preview.',
      charges:delivery,
      estimates:'Demo delivery estimate: 3–7 business days after dispatch. This is illustrative; no delivery date is promised.',
      failed:'Delivery attempts and returned-parcel handling are not configured in this preview. Contact support about an order issue; no parcel is dispatched.'
    },
    returns: {
      'change-of-mind':returnWindow,
      windows:returnWindow,
      condition:'The demo return example covers unopened items. Keep the pack and lot number when reporting an order issue; final return conditions are not approved.',
      collection:'Return collection and postage are not connected in this preview. Do not send an item back until support provides instructions.',
      refunds:'Demo refund estimate: 5–7 business days after approval. Refunds are reviewed before release; no money moves in this preview.',
      charges:'Delivery-charge adjustments, discounts and part-return calculations are not configured in this preview. Ask support about the specific order.'
    }
  };
  const reviews = [
    ['Preview customer A', 'The bottle colours make it easy to find the product I’m looking for.'],
    ['Preview customer B', 'I like being able to read the ingredient notes before choosing a bottle.']
  ];
  function reviewHTML() {
    return '<div class="demo-feedback" data-demo-feedback><p class="pp-micro">Illustrative feedback · fictional customers</p>' + reviews.map(r=>'<article><h3>'+r[0]+'</h3><p>“'+r[1]+'”</p></article>').join('')+'</div>';
  }
  if (C) {
    Object.assign(C.BUSINESS, {
      legalName:'Body Café Co. — demo business entry',
      address:'Demo office, Ahmedabad, Gujarat, India',
      grievanceOfficer:'Demo support lead · care@bodycafeco.com',
      hours:'Monday–Saturday, 10:00–18:00 IST (demo hours)',
      response:'Within 2 business days (demo target)'
    });
    C.DOCS.version='Preview 0.3';C.DOCS.updated='2026-10-26';
    C.DOCS.status='Illustrative policy content for this design preview; not live trading terms.';
    C.LINKS[0].items.push(['WhatsApp','https://wa.me/918457125489'],[contact.email,'mailto:'+contact.email],[contact.phone,'tel:+918457125489']);
    C.POLICIES.shipping.summary[1] = delivery;
    C.POLICIES.returns.summary[1] = returnWindow;
    for (const [policyId, policy] of Object.entries(C.POLICIES)) {
      for (const section of policy.sections) {
        const example = policyExamples[policyId]?.[section.id];
        if (!example) continue;
        section.p=[example];
        delete section.list;
        section.open=false;
      }
    }
  }
  if (window.BCCPDP) Object.assign(window.BCCPDP.copy, {
    purpose:'Explore the ingredient, format and product notes before choosing your everyday essentials.',
    tax:'MRP. Tax and delivery are shown in the order summary.',
    shipping:delivery,
    returns:returnWindow,
    directions:'Follow the directions printed on your pack. This design preview does not provide a dosage.',
    storage:'Demo storage entry: keep tightly closed in a cool, dry place away from direct sunlight.',
    noReviews:'Explore the illustrative feedback below. Fictional feedback is separate from submitted customer reviews.'
  });
  if (window.BCCHomeFlow) {
    Object.assign(window.BCCHomeFlow.VOICES, {
      title:'Illustrative feedback.<br><em>A preview of the layout.</em>',
      stamp:'DESIGN<br>EXAMPLE',
      lead:'“The bottle colours make it easy to find my everyday essentials.”',
      body:'Preview customer A · Illustrative feedback for this design.',
      small:'Fictional customer content. Real feedback will appear separately after review.'
    });
    window.BCCHomeFlow.FAQ.forEach(f=>{
      if(f.q==='Are these the final prices?'){f.q='What prices are shown?';f.a='Listed prices are for this design preview. Delivery is shown separately in your bag; no payment is taken.';}
      if(f.q==='When will my order arrive?')f.a=policyExamples.shipping.estimates;
      if(f.q==='How do returns work?')f.a=returnWindow;
      if(f.q==='How can I ask a question?')f.a='Email care@bodycafeco.com, call +91-8457125489, or open a support case.';
    });
    const trust=window.BCCHomeFlow.TRUST;
    trust[0].p='Browse the product name, ingredient notes, format and pack details for all seven products.';
    trust[1].st='Product information';trust[1].p='Find pack details and ingredient notes together on each product page. Follow the directions on your pack.';
    trust[2].st='Demo origin';trust[2].p='India · BCC demo manufacturing unit. This is an illustrative sourcing entry for the design.';
    trust[3].st='Demo records';trust[3].p='Try a demonstration lot lookup to explore how a batch record is presented. It contains no laboratory assessment.';
  }
  const home = window.BCCEH?.h.HOME;
  if (home) {
    home.voicesBody='Published customer reviews require verified delivery and moderation. Fictional design examples are labelled separately.';
    home.voicesSmall='Product pages include illustrative feedback for reviewing this design. It is not published customer feedback.';
    home.faq.forEach(f=>{
      if(f[0]==='Are these the final prices?') {
        f[0]='What prices are shown?';
        f[1]='Listed prices are for this design preview. Delivery is shown separately in your bag; no payment is taken.';
      }
      if(f[0]==='When will my order arrive?')f[1]=policyExamples.shipping.estimates;
      if(f[0]==='How do returns work?')f[1]=returnWindow;
    });
  }
  if (window.BCCStandards) {
    const m=window.BCCStandards.model;
    m.source.places=[
      ['Ingredient origin','India — illustrative origin entry'],
      ['Processing location','Gujarat, India — illustrative processing entry'],
      ['Finished-product manufacturer','BCC demo manufacturing unit — fictional facility entry']
    ];
    m.source.status='The locations and manufacturer shown here are fictional design entries, not supplier records.';
    m.source.check='Origin, processing and final manufacture are shown separately so each step is easy to read.';
    m.formula.pendingList='Pack details, ingredient notes and directions printed on your pack';
  }
  const phrases = new Map([
    ['Prices are samples, shown inclusive of illustrative tax; final GST rates await approval. No offers are running. Bottles shown are draft packaging. Pack sizes, servings and directions will come from the approved labels.','Listed prices and demo pack quantities are for this design preview. Final pack details will be confirmed from approved labels.'],
    ["Product names, ingredients in view and formats are published for all seven products. Approved rear labels haven't been supplied, so amounts, serving sizes, other ingredients, allergens, directions and cautions aren't published yet. Creatine Chews' complete formulation is still pending.",'Explore all seven products, their formats, pack details and ingredient notes. The additional sourcing entries on this preview are illustrative.'],
    ['Packaging is a draft. Amounts, directions and cautions will come from approved rear labels; until then, product pages show them as awaiting approval rather than guessing.','Product pages bring together ingredient notes and pack details. Follow the directions and cautions printed on your pack.'],
    ['The bottles are draft packaging. Amounts, directions and cautions will come from the approved rear labels.','Explore the collection, ingredient notes and pack details. Follow the directions printed on your pack.'],
    ['Planned, not yet in place. No dates are promised.','The next chapter · An illustrative roadmap for the brand.'],
    ['draft packaging','studio product artwork'],['Draft packaging','Studio product artwork'],
    ['MRP · incl. illustrative tax','MRP'],
    ['Sample price','MRP'],['Sample prices','Prices'],['sample price','listed price'],['sample prices','listed prices'],
    ['Sample total','Total'],['sample total','total'],['Sample subtotal','Subtotal'],
    ['DRAFT PACKAGING / SAMPLE PRICES','THE EVERYDAY COLLECTION / MRP'],
    ['Sample prices · draft packaging · no live payments','care@bodycafeco.com · +91-8457125489'],
    ['Draft copy · preview commerce · sample prices','care@bodycafeco.com · +91-8457125489'],
    ['Draft copy, preview commerce','care@bodycafeco.com · +91-8457125489'],
    [' (complete formulation pending)',' (demo formulation entry)'],
    ['Not yet published','Demo record'],['Not yet approved','Demo entry'],['Not yet confirmed','Demo entry'],['To be confirmed','Demo entry'],['to be confirmed','demo entry'],
    ['Sample records only','Demo records'],['sample records','demo records'],['sample lot','demo lot'],
    ['Draft packaging. Front-of-pack design mockup; wording printed on the pack is label artwork, not a claim made on this site.','Front of the bottle · Studio product image.'],
    ['Draft packaging. Front-of-pack design mockups; wording printed on the pack is label artwork, not a claim made on this site.','The everyday collection · Studio product images.'],
    ['Sample price · incl. illustrative tax','MRP'],
    ['No. Every price in the preview is a sample. Final prices, GST, shipping rules and offers are still being approved.','Listed prices are for this design preview. Delivery is shown separately in your bag; no payment is taken.'],
    ['Are these the final prices?','What prices are shown?'],
    ['Public email, WhatsApp and phone details will be added once they are confirmed.','Email care@bodycafeco.com or call +91-8457125489.'],
    ['Sample prices. Serving quantities and full label information will appear after content approval.','Explore the ingredient notes and product details before choosing.'],
    ['Prices are samples and no money is taken in the preview.','Checkout is simulated in this design preview.'],
    ['WHAT’S PUBLISHED.','THE DETAILS.'],['WHAT’S PENDING.','IN ONE PLACE.'],
    ['Know what’s confirmed','Read the product details']
  ].sort((a,b)=>b[0].length-a[0].length));
  function text(value) {
    for (const [before,after] of phrases) value=value.split(before).join(after);
    return value;
  }
  function present(html,ctx) {
    const t=document.createElement('template');t.innerHTML=html;
    const pid=ctx.path.startsWith('/products/')?ctx.path.split('/')[2]:null;
    // Fill nonclinical display fields in the preview; retain pack-directed dosage and cautions.
    const fields={
      'Pack quantity':packInfo(pid)?.label, 'Serving size':'Follow pack directions',
      'Servings per pack':'See pack directions', 'Preparation':'Use as directed on the pack',
      'Cautions and interactions':S.CARE_NOTE,
      'Storage':'Keep in a cool, dry place, away from direct sunlight',
      'Ingredient sourcing':'India — demo origin', 'Manufacturer':'BCC demo manufacturing unit',
      'Manufacturer and licence details':'Demo manufacturer entry; no licence number claimed',
      'Amount per serving':'Refer to your pack', 'Nutrition information':'Refer to your pack',
      'Dietary suitability':'Check the ingredients and cautions on your pack',
      'Allergens':'Read the full allergen statement on your pack',
      'Flavour and sweeteners':'Demo formulation entry',
      'Other ingredients and capsule or softgel shell':'Demo label entry — refer to your pack',
      'Pack & servings':'See product pack details',
      'Other ingredients and chew base':'Demo formulation entry — refer to your pack'
    };
    t.content.querySelectorAll('dl>div').forEach(row=>{
      const dt=row.querySelector('dt'),dd=row.querySelector('dd');
      if(dt&&dd&&fields[dt.textContent.trim()]&&/await|pending|not yet|approved label/i.test(dd.textContent)){
        const card=row.closest('[data-sp-item]');
        const pack = dt.textContent.trim()==='Pack & servings'&&card ? packInfo(card.dataset.spItem) : null;
        dd.textContent=pack ? pack.label : fields[dt.textContent.trim()];
        if (pack) dd.dataset.packStatus=pack.status;
        dd.classList.remove('is-pending');
      }
    });
    const walk=document.createTreeWalker(t.content,NodeFilter.SHOW_TEXT);
    while(walk.nextNode()){
      if(walk.currentNode.parentElement?.closest('script,style,textarea,input,pre,code'))continue;
      walk.currentNode.nodeValue=text(walk.currentNode.nodeValue);
    }
    return t.innerHTML;
  }
  window.BCCDemo={contact,packs,packInfo,present,reviewHTML,lotMetadata:{formulation_version:'DEMO-v1',manufactured:'2026-10-01',expiry:'2028-09-30'}};
})();
