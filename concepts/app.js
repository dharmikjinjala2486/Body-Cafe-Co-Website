const products = [
  {slug:'iron-bisglycinate',name:'Iron Bisglycinate',sub:'A closer look at iron.',color:'#aa472e'},
  {slug:'l-theanine',name:'L-Theanine',sub:'Get to know the ingredient.',color:'#777d51'},
  {slug:'vitamin-d3-k2',name:'Vitamin D3 + K2',sub:'With Omega-3 as triglycerides.',color:'#35306f'},
  {slug:'omega-3-fish-oil',name:'Omega-3 Fish Oil',sub:'Explore the formulation.',color:'#84919b'},
  {slug:'myo-d-chiro-inositol',name:'Myo & D-Chiro Inositol',sub:'Two ingredients. All the details.',color:'#b184b9'},
  {slug:'creatine-chews',name:'Creatine Chews',sub:'Meet creatine in a chew.',color:'#07566a'},
  {slug:'psyllium-husk',name:'Psyllium Husk',sub:'Your closer look at psyllium.',color:'#9c9274'},
];
const grid=document.querySelector('#product-grid');
products.forEach((p,i)=>{
  const article=document.createElement('article'); article.className='product-card'; article.style.setProperty('--sku',p.color);
  article.innerHTML=`<a class="product-photo" href="#product" data-product="${p.slug}" aria-label="Explore ${p.name}"><img src="media/${p.slug}.webp" alt="${p.name} bottle mockup" width="1196" height="1315" loading="lazy"><span class="product-number">0${i+1}</span><span class="product-arrow" aria-hidden="true">↗</span></a><div class="product-meta"><span class="sku-line"></span><h3><a href="#product" data-product="${p.slug}">${p.name}</a></h3><p>${p.sub}</p></div>`;
  grid.append(article);
  const option=document.createElement('option');option.value=p.slug;option.textContent=p.name;document.querySelector('#report-product').append(option);
});
const reportTile=document.createElement('a'); reportTile.href='#report'; reportTile.className='collection-report'; reportTile.innerHTML='<span class="eyebrow">A LITTLE CURIOSITY</span><strong>Start with<br>the details.</strong><p>Have a bottle? Find the report for your lot.</p><span class="report-tile-link">Find your lot report ↗</span>'; grid.append(reportTile);
document.querySelector('#report-product').value='vitamin-d3-k2';
document.querySelectorAll('[data-product]').forEach(link=>link.addEventListener('click',()=>{
  const p=products.find(p=>p.slug===link.dataset.product);const i=products.indexOf(p);
  const image=document.querySelector('#detail-image');image.src=`media/${p.slug}.webp`;image.alt=`${p.name} product mockup`;
  document.querySelector('#detail-title').textContent=p.name;
  document.querySelector('#detail-subtitle').textContent=p.sub;
  document.querySelector('#detail-category').textContent=`THE EVERYDAY COLLECTION / 0${i+1}`;
  document.querySelector('#ingredients-copy').textContent=p.slug==='vitamin-d3-k2'?'Vitamin D3, Vitamin K2 and Omega-3 as triglycerides. Full formulation and amounts per serving will be added from the approved label.':'The full formulation, ingredient forms and amounts per serving will appear here from the approved label.';
  document.querySelector('#report-product').value=p.slug;
  document.querySelector('#report-result').replaceChildren();
}));
function setConcept(concept){
  const b=concept==='b';document.body.dataset.concept=b?'b':'a';
  document.querySelectorAll('[data-switch]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.switch===(b?'b':'a'))));
  document.querySelector('#hero-title').innerHTML=b?'Your body.<br>Your curiosity.<br><span>Your café.</span>':'Good things.<br>Clear intentions.<br><span>Your everyday.</span>';
  document.querySelector('.hero-description').innerHTML=b?'Seven everyday supplements. A fresh perspective.<br class="desktop-break"> Clear details. A place to find your lot report.':'Seven everyday supplements. Clear product details.<br class="desktop-break"> A place to find the report for your lot.';
  document.querySelector('#collection-title').innerHTML=b?'Seven essentials.<br><em>Which is your thing?</em>':'Find your<br><em>everyday thing.</em>';
  document.querySelector('.studio-label span').textContent=b?'DESIGN STUDY / 02':'DESIGN STUDY / 01';
  const url=new URL(location.href);url.searchParams.set('concept',b?'b':'a');history.replaceState(null,'',url);
  document.title=`Body Café Co. — ${b?'Expressive everyday':'Warm editorial'} concept`;
}
document.querySelectorAll('[data-switch]').forEach(button=>button.addEventListener('click',()=>setConcept(button.dataset.switch)));
setConcept(new URL(location.href).searchParams.get('concept')==='b'?'b':'a');
const menuButton=document.querySelector('.menu-button');const menu=document.querySelector('#mobile-menu');
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));menu.hidden=!open;menuButton.querySelector('span').textContent=open?'−':'＋';});
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.querySelector('span').textContent='＋';}));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.hidden){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.querySelector('span').textContent='＋';menuButton.focus();}});
document.querySelector('#report-product').addEventListener('change',()=>document.querySelector('#report-result').replaceChildren());
document.querySelector('#lot-number').addEventListener('input',()=>{document.querySelector('#report-result').replaceChildren();document.querySelector('#lot-number').removeAttribute('aria-invalid');});
document.querySelector('#report-form').addEventListener('submit',event=>{
  event.preventDefault();const result=document.querySelector('#report-result');const lot=document.querySelector('#lot-number').value.trim();
  if(!lot){result.textContent='Enter a lot number to preview the layout.';document.querySelector('#lot-number').setAttribute('aria-invalid','true');document.querySelector('#lot-number').focus();return;}
  document.querySelector('#lot-number').removeAttribute('aria-invalid');const p=products.find(p=>p.slug===document.querySelector('#report-product').value);
  result.replaceChildren();
  for(const [text,cls] of [['ILLUSTRATIVE LAYOUT · NOT A LIVE RESULT','result-label'],[p.name,''],[`Entered lot: ${lot}`,''],['An approved report would show the matching lot, reviewed dates, test summary and source document here.',''],['No report has been retrieved. This preview does not verify a product or unit.','']]){const para=document.createElement('p');para.textContent=text;if(cls)para.className=cls;result.append(para);}
});
