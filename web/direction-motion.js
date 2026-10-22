/* Native scrolling, bounded reveals and optional moving-image playback. No scroll hijacking. */
(function(){'use strict';let cleanup=()=>{};
function enhance(){cleanup();const main=document.querySelector('#main');if(!main)return;
 const abort=new AbortController(),signal=abort.signal,reduced=matchMedia('(prefers-reduced-motion: reduce)'),targets=[...main.querySelectorAll('.r3-home>section:not(.open),.df-editorial,.cp-editorial,.cp-section-heading,.cp-label-notes')];
 let observer,videoObserver,frame=0;
 if(!reduced.matches){observer=new IntersectionObserver(entries=>entries.forEach(x=>{if(x.isIntersecting){x.target.classList.add('dm-seen');observer.unobserve(x.target);}}),{threshold:.035});targets.forEach(x=>{if(x.getBoundingClientRect().top>innerHeight*.9){x.classList.add('dm-reveal');observer.observe(x);}});}
 const videos=[...main.querySelectorAll('[data-campaign-video]')];
 videos.forEach(v=>{const toggle=main.querySelector('[data-video-toggle]');let paused=reduced.matches;
 const update=()=>{if(toggle){toggle.textContent=v.paused?'Play moving image':'Pause moving image';toggle.setAttribute('aria-pressed',String(!v.paused));}};
 v.addEventListener('play',update,{signal});v.addEventListener('pause',update,{signal});
 toggle?.addEventListener('click',()=>{paused=!v.paused;if(paused)v.pause();else v.play().catch(()=>{});update();},{signal});
 if(!reduced.matches){videoObserver=new IntersectionObserver(entries=>entries.forEach(x=>{if(x.isIntersecting&&!paused)v.play().catch(()=>{});else v.pause();}),{threshold:.15});videoObserver.observe(v);}
 reduced.addEventListener('change',()=>{if(reduced.matches){paused=true;v.pause();targets.forEach(x=>x.classList.add('dm-seen'));}},{signal});
 });
 const hero=main.querySelector('.r3-home .open');const image=hero?.querySelector('.open-img img');
 if(hero&&image&&!reduced.matches){const draw=()=>{frame=0;const r=hero.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)image.style.transform='translate3d(0,'+Math.max(-20,Math.min(20,-r.top*.035))+'px,0) scale(1.04)';};const scroll=()=>{if(!frame)frame=requestAnimationFrame(draw);};addEventListener('scroll',scroll,{passive:true,signal});}
 cleanup=()=>{abort.abort();observer?.disconnect();videoObserver?.disconnect();if(frame)cancelAnimationFrame(frame);videos.forEach(v=>v.pause());};
}
window.BCCDirectionMotion={enhance};})();
