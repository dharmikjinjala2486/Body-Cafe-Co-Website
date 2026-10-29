/* Three distinct experiences. Native scrolling; motion never controls commerce. */
(function () {
  'use strict';
  const S = window.BCCSite;
  const bases = {a:S.themes.a,c:S.themes.c,d:S.themes.d};
  const pad = i => String(i + 1).padStart(2, '0');
  const image = (p, eager=false) => `<img src="/web/media/${p.id}.webp" alt="${p.name} — draft front mockup" width="720" height="1000" decoding="async" ${eager?'loading="eager"':'loading="lazy"'}>`;
  const link = (href, text) => `<a class="cin-link" href="${href}">${text}<span aria-hidden="true">↗</span></a>`;
  const collectionSuffix = (html, marker) => html.slice(html.indexOf(marker));
  // Recolor warm architecture using each bottle's palette; preserve cool water
  // and neutral reflections. Every layer reuses the same cached scene asset.
  function landscape(ctx, first) {
    const filters = ctx.published.map((p, i) => {
      const rgb = p.color.match(/[a-f\d]{2}/gi).map(v => parseInt(v, 16) / 255);
      const cream = [1, .97, .87];
      const channels = rgb.map((v, n) => [v * .28, v * .72 + cream[n] * .28, cream[n]].map(x => x.toFixed(4)).join(' '));
      return `<filter id="cin-palette-${i}" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%"><feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 3 0 -3 0 0" result="warm"/><feColorMatrix in="SourceGraphic" type="saturate" values="0"/><feComponentTransfer>${channels.map((v,n)=>`<feFunc${'RGB'[n]} type="table" tableValues="${v}"/>`).join('')}</feComponentTransfer><feComposite in2="warm" operator="in" result="tinted"/><feComposite in="SourceGraphic" in2="warm" operator="out"/><feMerge><feMergeNode/><feMergeNode in="tinted"/></feMerge></filter>`;
    }).join('');
    return `<svg class="cin-palette-defs" aria-hidden="true" width="0" height="0"><defs>${filters}</defs></svg><div class="cin-landscape" aria-hidden="true">${ctx.published.map((p,i)=>`<img class="cin-landscape-palette" data-cin-palette="${i}" data-active="${i===first}" src="/web/media/everyday-elsewhere.webp" alt="" width="1536" height="1024" style="filter:url(#cin-palette-${i})" ${i===first?'fetchpriority="high"':''}>`).join('')}</div>`;
  }
  function chapters(ctx, d) {
    const night = d === 'd';
    const first = ctx.published.findIndex(p=>p.id === (night?'omega-3-fish-oil':'l-theanine'));
    const selected = ctx.published[first];
    const captions = night ? [
      ['01 / THE ARRIVAL', 'The everyday.<br><em>Seen after dark.</em>', 'A quiet exhibition of seven everyday essentials.'],
      ['02 / THE CLOSE-UP', 'Give the ordinary<br><em>your full attention.</em>', 'Look past a name. Meet the ingredient, the format, and the questions worth asking.'],
      ['03 / THE COLLECTION', 'Seven objects.<br><em>Seven beginnings.</em>', 'Choose an exhibit. Follow its story beyond the front label.']
    ] : [
      ['01 / SOMEWHERE ELSE', 'Step into<br><em>the unexpected.</em>', 'An ordinary day. A little detour. Welcome to Body Café Co.'],
      ['02 / A LITTLE CLOSER', 'There’s more<br><em>to every bottle.</em>', 'A name is just the introduction. The ingredient, the label, the lot—there’s a whole story to explore.'],
      ['03 / YOUR OWN WAY', 'Let curiosity<br><em>take the lead.</em>', 'Seven everyday supplements. Pick a bottle. See where the details take you.']
    ];
    const stops = night ? ['Arrive','Look closer','The exhibits'] : ['Arrive','Look closer','Explore'];
    return `<section class="cin-journey cin-${d}" data-cinema data-selected="${first}" ${night?'':`style="--cin-accent:${selected.color}"`} aria-label="${night?'The Night Museum':'The Everyday Elsewhere'}: a three-chapter story"><div class="cin-sticky">${night?'<div class="cin-landscape" aria-hidden="true"><img src="/web/media/night-museum.webp" alt="" width="1536" height="1024" fetchpriority="high"></div>':landscape(ctx,first)}<div class="cin-shade" aria-hidden="true"></div><div class="cin-mast"><span>BODY CAFÉ CO. / ${night?'THE NIGHT MUSEUM':'THE EVERYDAY ELSEWHERE'}</span><span>AN IMAGINARY WORLD / SEVEN REAL QUESTIONS</span></div><div class="cin-object" aria-hidden="true">${ctx.published.map((p,i)=>`<div class="cin-object-frame" data-cin-object="${i}" ${i===first?'':'hidden'}>${image(p,true)}</div>`).join('')}</div>${captions.map((c,i)=>`<div class="cin-caption cin-caption-${i}" data-cin-caption="${i}" ${i?'inert aria-hidden="true"':''}><span class="cin-kicker">${c[0]}</span><${i?'h2':'h1'}>${c[1]}</${i?'h2':'h1'}><p>${c[2]}</p>${i===0?'<button class="cin-scroll" data-cin-chapter="1">Scroll to wander <span aria-hidden="true">↓</span></button>':i===1?link('/learn/'+selected.id,'Read the ingredient notes'):''}</div>`).join('')}<div class="cin-cast" data-cin-cast inert aria-hidden="true"><div class="cin-cast-items" role="group" aria-label="Choose a product">${ctx.published.map((p,i)=>`<button data-cin-pick="${i}" aria-label="Explore ${ctx.escape(p.name)}" aria-pressed="${i===first}">${image(p)}<span>${pad(i)}</span></button>`).join('')}</div><div class="cin-choice"><div aria-live="polite"><span class="cin-kicker" data-cin-format>${ctx.escape(ctx.format[selected.id])}</span><h3 data-cin-name>${ctx.escape(selected.name)}</h3></div><a class="cin-link" data-cin-link href="/products/${selected.id}">Explore this bottle <span aria-hidden="true">↗</span></a></div></div><nav class="cin-chapters" aria-label="Story chapters">${stops.map((s,i)=>`<button data-cin-chapter="${i}" aria-current="${i===0?'step':'false'}"><span>${pad(i)}</span><strong>${s}</strong></button>`).join('')}<span class="cin-progress" aria-hidden="true"><i></i></span></nav><span class="cin-draft">IMAGINARY SCENERY · DRAFT BOTTLES · SAMPLE PRICES</span><script type="application/json" data-cin-data>${JSON.stringify(ctx.published.map(p=>({id:p.id,name:p.name,color:p.color,format:ctx.format[p.id]}))).replace(/</g,'\\u003c')}</script></div></section>`;
  }
  function homeC(ctx) {
    return chapters(ctx,'c') + collectionSuffix(bases.c.home(ctx),'<section class="w-manifesto">');
  }
  function homeD(ctx) {
    return chapters(ctx,'d') + `<section class="museum-note"><span class="cin-kicker">THE CURATOR’S NOTE</span><h2>The interesting part<br>is <em>what you notice.</em></h2><div><p>A front label catches the eye. A closer look raises the good questions: which ingredient, in what form, and what does the record actually show?</p><p>This exhibition is a beginning. The product pages, ingredient guides and lot desk carry the conversation further.</p>${link('/standards','Read our point of view')}</div></section>` + collectionSuffix(bases.d.home(ctx),'<section class="r-home-collection"');
  }
  function homeA(ctx) {
    const first=2,p=ctx.published[first];
    return `<section class="machine" data-machine data-selected="${first}"><div class="machine-mast"><span>BODY CAFÉ CO. / THE CURIOSITY MACHINE</span><span>MANUAL INPUT. OPEN QUESTIONS.</span></div><div class="machine-grid"><div class="machine-copy"><span class="machine-kicker"><i></i> CURIOSITY IS SWITCHED ON</span><h1>TURN <br>YOUR <br><em>CURIOSITY</em><br>ON.</h1><p>Seven everyday supplements.<br>A different way to get acquainted.</p>${link('/shop','Enter the collection')}<span class="machine-footnote">A working design instrument.<br>Draft mockups. Sample prices.</span></div><div class="machine-console"><div class="machine-console-head"><span>OBJECT VIEWER / 001—007</span><span class="machine-led">● READY TO EXPLORE</span></div><div class="machine-viewer"><svg class="machine-graticule" viewBox="0 0 600 600" aria-hidden="true"><defs><pattern id="machine-grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="currentColor" stroke-width=".5" opacity=".22"/></pattern></defs><circle cx="300" cy="300" r="290" fill="url(#machine-grid)"/><circle cx="300" cy="300" r="283"/><circle cx="300" cy="300" r="240"/><circle cx="300" cy="300" r="195" stroke-dasharray="2 9"/><path d="M0 300H600M300 0V600"/><g>${Array.from({length:70},(_,i)=>`<path d="M300 18V${i%10===0?42:29}" transform="rotate(${i*360/70} 300 300)"/>`).join('')}</g></svg><div class="machine-needle" aria-hidden="true"><span></span></div><span class="machine-axis machine-axis-n">N / INGREDIENT IN VIEW</span><span class="machine-axis machine-axis-w">−</span><span class="machine-axis machine-axis-e">+</span><div class="machine-object">${ctx.published.map((p,i)=>`<div data-machine-object="${i}" ${i===first?'':'hidden'}>${image(p,true)}</div>`).join('')}</div><span class="machine-readout" data-machine-number>03</span><span class="machine-object-note">FRONT VIEW / DRAFT MOCKUP</span></div><div class="machine-console-info"><div aria-live="polite"><span class="machine-kicker" data-machine-format>${ctx.escape(ctx.format[p.id])}</span><h2 data-machine-name>${ctx.escape(p.name)}</h2></div><a href="/products/${p.id}" data-machine-link aria-label="Explore ${ctx.escape(p.name)}">↗</a></div><div class="machine-control"><div><label for="machine-dial">TUNE YOUR CURIOSITY</label><span>01 → 07</span></div><input type="range" id="machine-dial" min="0" max="6" value="${first}" step="1" aria-label="Choose a product on the curiosity dial" aria-valuetext="${ctx.escape(p.name)}"><div class="machine-presets" role="group" aria-label="Product presets">${ctx.published.map((p,i)=>`<button data-machine-pick="${i}" aria-label="Select ${ctx.escape(p.name)}" aria-pressed="${i===first}">${pad(i)}</button>`).join('')}</div></div></div></div><div class="machine-bottom"><span>THE NAME IS ONLY THE BEGINNING.</span><a href="#machine-next">KEEP EXPLORING ↓</a><a href="/reports">FOLLOW A LOT NUMBER ↗</a></div><script type="application/json" data-machine-data>${JSON.stringify(ctx.published.map(p=>({id:p.id,name:p.name,format:ctx.format[p.id]}))).replace(/</g,'\\u003c')}</script></section><section class="machine-interlude" id="machine-next"><span>01 / CHANGE THE QUESTION</span><h2>Less guessing.<br><em>More knowing.</em></h2><div><p>Turn a name into a question. What’s the ingredient? What’s still being confirmed? What does a report tell you?</p>${link('/learn','Open the field guide')}</div></section>` + collectionSuffix(bases.a.home(ctx),'<section class="r-home-collection"');
  }
  S.themes.a={...bases.a,home:homeA};
  S.themes.c={...bases.c,home:homeC};
  S.themes.d={...bases.d,home:homeD};

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const motionReduced = () => reduced.matches || new URLSearchParams(location.search).get('motion')==='reduce';
  let cleanup = () => {};
  function enhance() {
    cleanup();
    document.documentElement.classList.toggle('cin-static',motionReduced() && ['a','c','d'].includes(document.body.dataset.theme));
    if(!['a','c','d'].includes(document.body.dataset.theme))return;
    const controller = new AbortController(), signal=controller.signal;
    let frame=0, observer=null, resize=null;
    const root=document.querySelector('[data-cinema]');
    const reveal = document.querySelectorAll('.w-manifesto, .w-collection > header, .w-curiosity > div, .w-story-letter, .w-reading-cards > a, .machine-interlude, .museum-note, .r-section-head, .r-principle-notes > article, .r-guide, .r-pdp-facts, .r-pdp-report');
    if(!motionReduced() && 'IntersectionObserver' in window){
      observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('cin-revealed');observer.unobserve(entry.target);}}),{threshold:.08});
      reveal.forEach(el=>{el.classList.add('cin-reveal');observer.observe(el);});
    }
    if(root && !motionReduced()){
      let top=0, distance=1, current=0,target=0,previous=0;
      const captions=Array.from(root.querySelectorAll('[data-cin-caption]'));
      const cast=root.querySelector('[data-cin-cast]');
      const tabs=Array.from(root.querySelectorAll('.cin-chapters button'));
      const measure=()=>{const rect=root.getBoundingClientRect();top=rect.top+scrollY;distance=Math.max(1,root.offsetHeight-root.querySelector('.cin-sticky').offsetHeight);schedule();};
      function draw(time){
        frame=0;
        const dt=previous?Math.min(50,time-previous):16.7;previous=time;
        current+=(target-current)*(1-Math.exp(-dt/95));
        if(Math.abs(current-target)<.0001)current=target;
        const p=current, stage=root.querySelector('.cin-sticky');
        stage.style.setProperty('--cin-p',p.toFixed(5));
        stage.style.setProperty('--cin-focus',Math.sin(Math.PI*p).toFixed(5));
        const active=p<.27?0:p<.73?1:2;
        captions.forEach((el,i)=>{
          const opacity=i===0?1-Math.min(1,p/.25):i===1?Math.min(1,Math.max(0,(p-.18)/.17),Math.max(0,(.79-p)/.18)):Math.min(1,Math.max(0,(p-.68)/.2));
          el.style.opacity=opacity.toFixed(4);
          el.style.transform=`translate3d(0,${(1-opacity)*24}px,0)`;
          el.inert=i!==active;el.setAttribute('aria-hidden',String(i!==active));
        });
        const show=Math.max(0,Math.min(1,(p-.72)/.18));
        cast.style.opacity=String(show);cast.style.transform=`translate3d(0,${(1-show)*35}px,0)`;cast.inert=active!==2;cast.setAttribute('aria-hidden',String(active!==2));
        tabs.forEach((b,i)=>b.setAttribute('aria-current',i===active?'step':'false'));
        if(current!==target)frame=requestAnimationFrame(draw);else previous=0;
      }
      function schedule(){target=Math.max(0,Math.min(1,(scrollY-top)/distance));if(!frame)frame=requestAnimationFrame(draw);}
      window.addEventListener('scroll',schedule,{passive:true,signal});
      window.addEventListener('resize',measure,{passive:true,signal});
      resize=new ResizeObserver(measure);resize.observe(root);measure();
    } else if(root){
      root.querySelectorAll('[inert]').forEach(el=>{el.inert=false;el.removeAttribute('aria-hidden');});
    }
    cleanup=()=>{controller.abort();if(frame)cancelAnimationFrame(frame);observer?.disconnect();resize?.disconnect();reveal.forEach(el=>el.classList.remove('cin-reveal','cin-revealed'));};
  }
  function select(root,index,machine){
    const data=JSON.parse(root.querySelector(machine?'[data-machine-data]':'[data-cin-data]').textContent),i=(index+data.length)%data.length,p=data[i];
    root.dataset.selected=String(i);
    if(root.classList.contains('cin-c')) {
      root.style.setProperty('--cin-accent', p.color);
      root.querySelectorAll('[data-cin-palette]').forEach((el,n)=>{el.dataset.active=String(n===i);});
    }
    const prefix=machine?'machine':'cin';
    root.querySelectorAll(`[data-${prefix}-object]`).forEach((el,n)=>{el.hidden=n!==i;});
    root.querySelectorAll(`[data-${prefix}-pick]`).forEach((el,n)=>el.setAttribute('aria-pressed',String(n===i)));
    root.querySelector(`[data-${prefix}-name]`).textContent=p.name;
    root.querySelector(`[data-${prefix}-format]`).textContent=p.format;
    const a=root.querySelector(`[data-${prefix}-link]`);a.href='/products/'+p.id+'?design='+document.body.dataset.theme;
    if(machine){
      a.setAttribute('aria-label','Explore '+p.name);root.querySelector('[data-machine-number]').textContent=pad(i);
      const dial=root.querySelector('#machine-dial');dial.value=String(i);dial.setAttribute('aria-valuetext',p.name);
      root.style.setProperty('--dial-angle',(i*360/7)+'deg');
    } else {
      root.querySelector('.cin-caption-1 .cin-link').href='/learn/'+p.id+'?design='+document.body.dataset.theme;
    }
  }
  document.addEventListener('click',e=>{
    const machine=e.target.closest('[data-machine-pick]'),pick=e.target.closest('[data-cin-pick]'),chapter=e.target.closest('[data-cin-chapter]');
    if(machine)select(machine.closest('[data-machine]'),Number(machine.dataset.machinePick),true);
    if(pick)select(pick.closest('[data-cinema]'),Number(pick.dataset.cinPick),false);
    if(chapter){const root=chapter.closest('[data-cinema]'),i=Number(chapter.dataset.cinChapter);if(motionReduced()){root.querySelector('[data-cin-caption="'+i+'"]').scrollIntoView({block:'center'});}else{const y=root.getBoundingClientRect().top+scrollY+(root.offsetHeight-root.querySelector('.cin-sticky').offsetHeight)*[0,.5,1][i];window.scrollTo({top:y,behavior:'smooth'});}}
  });
  document.addEventListener('input',e=>{if(e.target.id==='machine-dial')select(e.target.closest('[data-machine]'),Number(e.target.value),true);});
  reduced.addEventListener('change',enhance);
  window.BCCCinema={enhance};
})();
