/* Shared interactions; each theme retains its own colour, type and spatial language. */
(function(){
'use strict';
const S=window.BCCSite,no=i=>String(i+1).padStart(2,'0');
const titles={a:['PICK A QUESTION.','THREE LAYERS. ONE PICTURE.'],b:['A curious little detour.','There’s more to your bottle.'],c:['Follow your curiosity.','Every bottle has a back story.'],d:['A closer encounter.','Beyond the first impression.']};
function curiosity(ctx){
 const ps=ctx.published||ctx.catalog.filter(p=>p.published),p=ps[0];if(!p)return '';
 return `<section class="atelier-lab" data-curiosity><header><span class="atelier-eyebrow">THE CURIOSITY CABINET / 01—07</span><h2>${titles[ctx.design][0]}</h2><p>Seven ingredients. Seven starting points. Choose a bottle to open its notes.</p></header><div class="atelier-cabinet"><div class="atelier-fan" aria-label="Choose an ingredient">${ps.map((p,i)=>`<button data-curiosity-pick="${i}" aria-label="Read about ${ctx.escape(p.name)}" aria-pressed="${i===0}" style="--i:${i};--cap:${p.color}"><span>${no(i)}</span><img src="/web/media/${p.id}.webp" alt="" width="720" height="1000" loading="lazy" decoding="async"></button>`).join('')}<span class="atelier-fan-line" aria-hidden="true"></span></div><div class="atelier-caption" aria-live="polite"><span class="atelier-eyebrow" data-curiosity-format>${ctx.escape(ctx.format[p.id])}</span><h3 data-curiosity-name>${ctx.escape(p.name)}</h3><p>What does the name tell you?<br>And what else belongs in the picture?</p><a data-curiosity-link href="/learn/${p.id}">Open the ingredient notes <span aria-hidden="true">↗</span></a></div></div><script type="application/json" data-curiosity-products>${JSON.stringify(ps.map(p=>({id:p.id,name:p.name,format:ctx.format[p.id]}))).replace(/</g,'\\u003c')}</script></section>`;
}
function layers(ctx,report=false){
 const chapters=report?[
 ['The product','Start with the name.','Choose the exact product on your pack. Similar names and different formats can describe different products.','/shop','Browse the collection'],
 ['The lot','Keep the number.','Use the lot number printed on your pack. An order number, barcode or SKU is a different kind of identifier.','/reports','Find a lot record'],
 ['The record','Read it in context.','Check the product and lot against the source document, then read the test, method, units and limits together.','/learn/understanding-reports','Read the report guide']
 ]:[
 ['The front','A beginning.','The product name and format introduce the bottle. They do not tell you the full serving information, directions or cautions.','/shop','Meet the seven'],
 ['The detail','Room for the full picture.','Complete ingredients, amounts per serving, directions and cautions belong on the approved label. Final rear labels are still being prepared for this preview.','/learn/reading-a-label','Learn to read a label'],
 ['The record','A particular lot.','A laboratory report describes the sample tested from a particular lot. It cannot promise a personal outcome or authenticate every individual pack.','/learn/understanding-reports','Understand lot records']
 ];
 return `<section class="atelier-layers" data-layers><header><span class="atelier-eyebrow">${report?'FOLLOW THE NUMBER':'THE ANATOMY OF A CLEARER CHOICE'}</span><h2>${report?'A number.<br>A trail to follow.':titles[ctx.design][1]}</h2></header><div class="atelier-layer-layout"><div class="atelier-layer-art" aria-hidden="true"><span class="atelier-orbit orbit-one"></span><span class="atelier-orbit orbit-two"></span><span class="atelier-orbit orbit-three"></span><strong data-layer-glyph>${report?'LOT':'?'}</strong><span class="atelier-diagram-note">${report?'PRODUCT → LOT → RECORD':'LOOK / READ / UNDERSTAND'}</span></div><div class="atelier-layer-reader"><div class="atelier-tabs" role="tablist" aria-label="${report?'Follow a lot record':'Explore the bottle'}">${chapters.map((c,i)=>`<button role="tab" id="layer-tab-${i}" aria-controls="layer-panel-${i}" aria-selected="${i===0}" tabindex="${i===0?'0':'-1'}" data-layer-tab="${i}"><span>${no(i)}</span>${c[0]}</button>`).join('')}</div>${chapters.map((c,i)=>`<article role="tabpanel" id="layer-panel-${i}" aria-labelledby="layer-tab-${i}" ${i?'hidden':''} data-layer-panel="${i}"><span class="atelier-eyebrow">0${i+1} / ${c[0]}</span><h3>${c[1]}</h3><p>${c[2]}</p><a href="${c[3]}">${c[4]} <span aria-hidden="true">↗</span></a></article>`).join('')}</div></div></section>`;
}
for(const d of ['a','b','c','d']){
 const base=S.themes[d],next={...base};
 for(const key of ['home','shop','story','standards','reports','learn']){
  if(typeof base[key]!=='function')continue;
  next[key]=function(ctx,...args){const html=base[key](ctx,...args);if(key==='learn'&&args[0])return html;
   const extra=['standards','reports','story'].includes(key)?layers(ctx,key==='reports'):curiosity(ctx);
   if(key==='home'){const marker=d==='b'?'<section id="shop"':d==='c'?'<section class="w-collection"':'<section class="r-home-collection"';const pos=html.indexOf(marker);return pos<0?html+extra:html.slice(0,pos)+extra+html.slice(pos);}
   if(key==='standards'||key==='reports'){const end=html.indexOf('</header>');return end<0?html+extra:html.slice(0,end+9)+extra+html.slice(end+9);}
   return html+extra;
  };
 }
 S.themes[d]=next;
}
let cleanup=()=>{};
function enhance(){
 cleanup();const main=document.querySelector('#main');if(!main)return;
 const abort=new AbortController(),signal=abort.signal,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 main.querySelectorAll('[data-curiosity]').forEach(root=>{
  const ps=JSON.parse(root.querySelector('[data-curiosity-products]').textContent);
  root.addEventListener('click',e=>{const b=e.target.closest('[data-curiosity-pick]');if(!b)return;const i=+b.dataset.curiosityPick,p=ps[i];root.querySelectorAll('[data-curiosity-pick]').forEach((x,n)=>x.setAttribute('aria-pressed',String(n===i)));root.querySelector('[data-curiosity-name]').textContent=p.name;root.querySelector('[data-curiosity-format]').textContent=p.format;root.querySelector('[data-curiosity-link]').href='/learn/'+p.id+'?design='+document.body.dataset.theme;},{signal});
 });
 main.querySelectorAll('[data-layers]').forEach(root=>{
  const tabs=[...root.querySelectorAll('[data-layer-tab]')],panels=[...root.querySelectorAll('[data-layer-panel]')];
  const activate=i=>{tabs.forEach((b,n)=>{b.setAttribute('aria-selected',String(n===i));b.tabIndex=n===i?0:-1;panels[n].hidden=n!==i;});root.dataset.layer=String(i);};
  tabs.forEach((b,i)=>{b.addEventListener('click',()=>activate(i),{signal});b.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowRight'?1:2))%3;activate(n);tabs[n].focus();},{signal});});
 });
 // A compact reading trail is built from actual headings, including policy and help pages.
 const chapters=[...main.querySelectorAll('.r-article-body>section,.tb-article-body>section,.tb-steps>li,#checkout-form>section')].filter(s=>s.querySelector('h2,h3'));
 const head=main.querySelector('.r-page-head,.tb-head');
 let progressObserver;
 if(chapters.length>2&&head){const nav=document.createElement('nav');nav.className='atelier-reading-trail';nav.setAttribute('aria-label','Page chapters');chapters.forEach((s,i)=>{if(!s.id)s.id='reading-chapter-'+i;const a=document.createElement('a');a.href='#'+s.id;a.textContent=no(i)+' / '+s.querySelector('h2,h3').textContent;nav.append(a);});head.after(nav);progressObserver=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){nav.querySelectorAll('a').forEach(a=>a.setAttribute('aria-current',a.hash==='#'+e.target.id?'location':'false'));}});},{rootMargin:'-15% 0px -55% 0px'});chapters.forEach(s=>progressObserver.observe(s));}
 const targets=[...main.querySelectorAll('.atelier-lab>header,.atelier-layer-layout,.r-section-intro,.r-principle-notes>article,.r-guide,.r-article-body>section,.r-pdp-facts,.r-pdp-report,.r-edit,.tb-band>div,.tb-coll-head,.tb-steps>li,.tb-arch,.w-item,.w-story-chapter,.r-home-care,.tb-cheat-card')];
 const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('atelier-seen');reveal.unobserve(e.target);}}),{threshold:.06});
 if(!reduced)targets.forEach((el,i)=>{el.classList.add('atelier-reveal');el.style.setProperty('--reveal-delay',(i%3)*60+'ms');reveal.observe(el);});
 cleanup=()=>{abort.abort();reveal.disconnect();progressObserver?.disconnect();};
}
window.BCCAtelier={enhance};
})();
