import * as T from './vendor/three/three.module.min.js';
import { GLTFLoader } from './vendor/three/GLTFLoader.js';
const TAU=Math.PI*2,step=TAU/7;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ease=v=>{v=clamp(v,0,1);return v*v*(3-2*v);};
function environment(renderer){
 const room=new T.Scene();room.background=new T.Color('#202024');
 const geo=new T.PlaneGeometry(12,9);
 for(const [x,y,z,rx,ry,color] of [[0,7,0,Math.PI/2,0,'#ffffff'],[-6,0,0,0,Math.PI/2,'#f1f5ff'],[6,0,0,0,-Math.PI/2,'#fff4cf'],[0,1,-6,0,0,'#ffffff']]){
  const panel=new T.Mesh(geo,new T.MeshBasicMaterial({color,side:T.DoubleSide}));panel.position.set(x,y,z);panel.rotation.set(rx,ry,0);room.add(panel);
 }
 const pmrem=new T.PMREMGenerator(renderer),rt=pmrem.fromScene(room,.08);pmrem.dispose();room.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});return rt;
}
function ribbon(radius,height,turns,width){
 const geo=new T.PlaneGeometry(1,1,160,1),a=geo.attributes.position,uv=geo.attributes.uv;
 for(let i=0;i<a.count;i++){const u=uv.getX(i),v=uv.getY(i),theta=u*TAU*turns,r=radius+(v-.5)*width; a.setXYZ(i,Math.cos(theta)*r,(u-.5)*height,Math.sin(theta)*r);}
 geo.computeVertexNormals();return geo;
}
export function mount(root){
 const d=root.dataset.design,night=d==='d',story=root.classList.contains('live-story'),surface=root.querySelector('.live-surface'),data=JSON.parse(root.querySelector('[data-live-products]').textContent);
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),staticQuery=new URLSearchParams(location.search).get('motion')==='reduce';
 let paused=reduce.matches||staticQuery,visible=true,disposed=false,selected=Number(root.dataset.selected),expanded=false;
 let renderer;
 try{renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});}catch{root.classList.add('live-unavailable');root.querySelector('.live-loading').textContent='Use the product controls to explore.';return()=>{};}
 renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1:1.35));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=night?1.0:1.0;
 renderer.domElement.setAttribute('aria-hidden','true');surface.append(renderer.domElement);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(36,1,.1,150);
 const env=environment(renderer);scene.environment=env.texture;scene.environmentIntensity=night?.75:.85;
 const ambient=new T.HemisphereLight(night?0xc6d8ff:0xffffff,night?0x30251c:0xb4b992,night?1.1:1.2);scene.add(ambient);
 const key=new T.DirectionalLight(0xffffff,night?2.6:1.8);key.position.set(3,6,7);scene.add(key);
 const rim=new T.DirectionalLight(night?0xffb354:0xc9eaff,night?2.5:1.3);rim.position.set(-4,2,-5);scene.add(rim);
 const fill=new T.PointLight(night?0x9bbcff:0xffffff,night?8:7,30);fill.position.set(0,0,8);scene.add(fill);
 const exhibition=new T.Group(),objects=new T.Group(),sculpture=new T.Group();exhibition.add(objects,sculpture);scene.add(exhibition);
 const assets=[],meshes=[],rings=[],shaders=[],geometries=[],materials=[];
 const material=p=>{const m=new T.MeshStandardMaterial(p);materials.push(m);return m;};
 if(night){
  const gold=material({color:'#b4a17f',metalness:1,roughness:.22});
  const inner=material({color:'#f7dca1',emissive:'#e7b75f',emissiveIntensity:2.4,metalness:.6,roughness:.2});
  for(let i=0;i<5;i++){
   const group=new T.Group(),geo=new T.TorusGeometry(4.2+i*.07,.022,6,72);geometries.push(geo);
   const ring=new T.Mesh(geo,gold);group.add(ring);
   const arcGeo=new T.TorusGeometry(4.2+i*.07,.012,6,80,Math.PI*.65);geometries.push(arcGeo);
   const arc=new T.Mesh(arcGeo,inner);arc.rotation.z=i*.5;group.add(arc);group.position.z=-i*2.9-1;group.rotation.set(i*.07,i*.05,i*.16);sculpture.add(group);rings.push(group);
  }
  const points=new Float32Array(180*3);for(let i=0;i<180;i++){points[i*3]=Math.sin(i*71.3)*15;points[i*3+1]=Math.cos(i*37.7)*9;points[i*3+2]=-((i*1.77)%45);}
  const starsGeo=new T.BufferGeometry();starsGeo.setAttribute('position',new T.BufferAttribute(points,3));geometries.push(starsGeo);
  const starMat=new T.PointsMaterial({color:'#e9d7b0',size:.022,transparent:true,opacity:.65});materials.push(starMat);sculpture.add(new T.Points(starsGeo,starMat));
 }else{
  for(let i=0;i<3;i++){
   const geo=ribbon(1.9+i*.18,5.1,1.4,.28+(i===1?.18:0));geometries.push(geo);
   const m=material({color:i===1?'#2545fb':'#dce1e5',metalness:i===1?.7:1,roughness:.18,side:T.DoubleSide});
   m.onBeforeCompile=shader=>{shader.uniforms.liveTime={value:0};shader.vertexShader='uniform float liveTime;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n transformed.x += sin(position.y*2.1 + liveTime)*.09; transformed.z += cos(position.y*1.8 + liveTime)*.09;');shaders.push(shader);};
   const mesh=new T.Mesh(geo,m);mesh.rotation.set(i*.15,TAU*i/3,i===1?-.25:.15);sculpture.add(mesh);rings.push(mesh);
  }
  for(let i=0;i<18;i++){
   const geo=i%3===0?new T.TorusGeometry(.16,.045,8,16):new T.IcosahedronGeometry(.09+i%4*.035,0);geometries.push(geo);
   const m=material({color:i%3===0?'#2345f5':i%3===1?'#e8f55b':'#d7dddf',metalness:.65,roughness:.2});const mesh=new T.Mesh(geo,m);mesh.userData.seed=i;sculpture.add(mesh);meshes.push(mesh);
  }
 }
 const loader=new GLTFLoader();let yaw=0,targetYaw=0,drag=0,targetDrag=0,burst=0,progress=0,targetProgress=0,px=0,py=0,tx=0,ty=0,time=0,last=0,burstVelocity=0,throwVelocity=0,pastIntro=false;
 const signalController=new AbortController(),signal=signalController.signal;
 const positions=data.map(()=>new T.Vector3());
 const letters=[...root.querySelectorAll('.live-letter')],intro=root.querySelector('.live-type'),after=root.querySelector('.live-type-after'),stage=root.querySelector('.live-stage'),copies=[...root.querySelectorAll('[data-story-copy]')],steps=[...root.querySelectorAll('[data-story-step]')];
 let width=surface.clientWidth,height=surface.clientHeight,currentChapter=-1,manualCap=null,capLift=0,capLabel="";
 const stats={frames:0,total:0,adjusted:false};
 const fallback=root.querySelector('[data-live-fallback]');
 const loading=root.querySelector('.live-loading');
 function controls(){
  const p=data[selected];root.dataset.selected=String(selected);root.querySelector('[data-live-name]').textContent=p.name;root.querySelector('[data-live-format]').textContent=p.format;root.querySelector('[data-live-no]').textContent=String(selected+1).padStart(2,'0');
  root.querySelector('[data-live-link]').href='/products/'+p.id+'?design='+d;fallback.src='/web/media/'+p.id+'.webp';fallback.alt=p.name+', draft front mockup';
  root.querySelectorAll('[data-live-pick]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===selected)));
 }
 function pick(i){selected=((i%7)+7)%7;targetYaw=-selected*step+Math.round((targetYaw+selected*step)/TAU)*TAU;targetDrag=0;controls();if(assets[selected])root.classList.add('live-ready');else root.classList.remove('live-ready');invalidate();}
 async function load(i){
  try{const gltf=await loader.loadAsync('/web/models/'+data[i].id+'.glb?v=smooth-cap-3');if(disposed){release(gltf.scene);return;}
   const group=new T.Group();group.add(gltf.scene);group.userData.index=i;
   const cap=new T.Group();cap.name='Animated cap';gltf.scene.updateMatrixWorld(true);
   const capParts=[];gltf.scene.traverse(o=>{if(o.isMesh){o.userData.index=i;o.material.envMapIntensity=night?.55:.65;o.material.roughness=Math.max(o.material.roughness,.42);if(o.name.includes('_CAP'))capParts.push(o);if(o.name.includes('_LABEL')){o.material.polygonOffset=true;o.material.polygonOffsetFactor=-1;o.material.polygonOffsetUnits=-1;}}});
   gltf.scene.add(cap);gltf.scene.updateMatrixWorld(true);capParts.forEach(o=>cap.attach(o));group.userData.cap=cap;
   group.userData.capParts=capParts.length;
   assets[i]=group;objects.add(group);if(i===selected){root.classList.add('live-ready');root.classList.remove('live-unavailable');loading.textContent='';}
   root.dataset.loaded=String(assets.filter(Boolean).length);root.dataset.capParts=String(group.userData.capParts);invalidate();
  }catch{if(!disposed&&i===selected){loading.textContent='Product preview';root.classList.add('live-unavailable');}}
 }
 load(selected).then(()=>{if(!disposed)data.forEach((_,i)=>{if(i!==selected)load(i);});});
 function release(object){object.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material]){for(const value of Object.values(m))if(value?.isTexture)value.dispose();m.dispose();}}});}
 function measure(){width=surface.clientWidth;height=surface.clientHeight;renderer.setSize(width,height,false);camera.aspect=width/Math.max(1,height);camera.updateProjectionMatrix();scroll();invalidate();}
 function scroll(){const rect=root.getBoundingClientRect(),distance=Math.max(1,root.offsetHeight-stage.offsetHeight);const next=(reduce.matches||staticQuery)?0:clamp(-rect.top/distance,0,1);if(Math.abs(next-targetProgress)>.002)manualCap=null;targetProgress=next;invalidate();}
 function draw(stamp=performance.now(),force=false){
  if(disposed||(!visible&&!force))return;
  const rawDt=last?(stamp-last)/1000:.016,dt=Math.min(.05,rawDt);last=stamp;
  if(!paused&&!stats.adjusted&&rawDt<.15){stats.frames++;stats.total+=rawDt;if(stats.frames===150){root.dataset.frameMs=(stats.total/stats.frames*1000).toFixed(1);if(stats.total/stats.frames>.025){renderer.setPixelRatio(1);renderer.setSize(width,height,false);root.dataset.quality='balanced';}stats.adjusted=true;}}
  if(!paused)time+=dt;
  const smooth=force?1:1-Math.exp(-dt*10),spring=force?1:1-Math.exp(-dt*10);
  progress+=(targetProgress-progress)*smooth;
  if(force){burst=expanded?1:0;burstVelocity=0;}else{burstVelocity+=(((expanded?1:0)-burst)*55-burstVelocity*11)*dt;burst=clamp(burst+burstVelocity*dt,-.03,1.07);}
  if(!down&&!paused){targetDrag+=throwVelocity*dt;throwVelocity*=Math.exp(-dt*5);}
  px+=(tx-px)*smooth;py+=(ty-py)*smooth;yaw+=(targetYaw-yaw)*spring;drag+=(targetDrag-drag)*spring;
  if(story){
   const chapter=Math.min(3,Math.floor(progress*3+.4));
   if(chapter!==currentChapter){currentChapter=chapter;root.dataset.story=String(chapter);copies.forEach((el,i)=>{el.classList.toggle('is-current',i===chapter);el.inert=!(reduce.matches||staticQuery)&&i!==chapter;el.setAttribute('aria-hidden',String(!(reduce.matches||staticQuery)&&i!==chapter));});steps.forEach((b,i)=>b.setAttribute('aria-current',i===chapter?'step':'false'));}
  }else{const nextIntro=progress>.45;if(nextIntro!==pastIntro){pastIntro=nextIntro;intro.inert=pastIntro;intro.setAttribute('aria-hidden',String(pastIntro));after.setAttribute('aria-hidden',String(!pastIntro));}}
  root.style.setProperty('--live-progress',progress.toFixed(4));root.style.setProperty('--live-pointer',px.toFixed(4));
  const mobile=width<700,ox=mobile?0:2.9,formation=night?burst:clamp(burst+progress*.72,0,1.05);
  exhibition.scale.setScalar(mobile?.6:1);exhibition.position.set(ox,mobile?(story?-.75:-.55):.05,0);camera.position.set(px*.4,py*.24+(mobile?.3:.4),night?10.8-progress*1.1+burst*(mobile?22:4.5):11.2+formation*(mobile?12:3));
  if(story){camera.position.set(px*.16,py*.12+(mobile?.6:.75),mobile?10.6:11.4-Math.sin(progress*Math.PI)*.35);}
  camera.lookAt(0,mobile?-.1:0,0);
  sculpture.rotation.y=(night?px*.08:time*.13+px*.16)+drag*.15;
  if(night){
   rings.forEach((ring,i)=>{ring.position.z=-i*3.5-3+progress*2;ring.rotation.z=i*.16+time*(i%2?.012:-.012);ring.rotation.y=Math.sin(time*.12+i*.3)*.08;ring.scale.setScalar(1+Math.sin(progress*Math.PI)*.12);});
  }else{
   rings.forEach((ring,i)=>{ring.rotation.y=TAU*i/3+time*(i%2?-.19:.13);ring.rotation.z=Math.sin(time*.35+i)*.15+burst*.6;ring.scale.setScalar(1+formation*.25+progress*.06);});
   meshes.forEach((mesh,i)=>{const a=i*2.399+time*.08,r=2.5+(i%4)*.38+formation;mesh.position.set(Math.cos(a)*r,Math.sin(a*1.7)*2.4,Math.sin(a)*r);mesh.rotation.set(time*.18+i,time*.2+i,0);});
  }
  shaders.forEach(s=>s.uniforms.liveTime.value=time);
  assets.forEach((group,i)=>{
   if(!group)return;
   if(story){
    group.visible=i===selected;if(!group.visible)return;
    const opening=ease(progress/.28),closing=ease((progress-.69)/.3),targetLift=manualCap===null?clamp(opening-closing,0,1):manualCap;capLift+=(targetLift-capLift)*spring;const lift=capLift;
    const label=targetLift>.5?'Close the cap':'Open the cap';if(label!==capLabel){capLabel=label;const b=root.querySelector('[data-live-burst]');b.innerHTML='<span aria-hidden="true">'+(targetLift>.5?'−':'+')+'</span>'+label;b.setAttribute('aria-pressed',String(targetLift>.5));}
    const rise=Math.sin(progress*Math.PI)*.15;
    positions[i].set(0,.25+rise+Math.sin(time*.45)*.025,-.2);
    group.position.lerp(positions[i],spring);group.scale.setScalar(mobile?.93:.98);
    group.rotation.set(.06+Math.sin(progress*Math.PI)*.08,drag+px*.12+Math.sin(progress*Math.PI)*.48,-.055+Math.sin(progress*Math.PI)*.11);
    group.userData.cap.position.y=lift*(mobile?.75:.85);group.userData.cap.rotation.y=lift*.75;
    root.dataset.cap=lift>.03?'open':'closed';
   }else if(night){
    const a=i*step+yaw,r=3.6+burst*2.3;
    positions[i].set(Math.sin(a)*r,Math.sin(a*.9+time*.5)*.13,Math.cos(a)*r-2.2);
    group.position.lerp(positions[i],spring);group.rotation.set(Math.sin(time*.35+i)*.035,-a*.15+drag,0);group.scale.setScalar(.76+.08*Math.cos(a));group.visible=true;
   }else{
    const show=i===selected||formation>.015;group.visible=show;if(!show)return;
    const a=i*step-selected*step,timeFloat=Math.sin(time*.7+i)*.1;
    positions[i].set(Math.sin(a)*3.7*formation,timeFloat+Math.cos(a)*1.9*formation,Math.cos(a)*2.2*formation);
    group.position.lerp(positions[i],spring);group.rotation.set(formation*Math.sin(a)*.4,drag+px*.18+formation*a*.2,-.12+formation*Math.cos(a)*.2);group.scale.setScalar(i===selected?1.12-formation*.38:Math.max(.001,formation*.74));
   }
  });
  letters.forEach((el,i)=>{const offset=Math.sin(time*.6+i*.55)*2+px*Math.sin(i*.8)*5;el.style.transform=`translate3d(0,${paused?0:offset}px,0)`;});
  renderer.render(scene,camera);
 }
 function running(){root.dataset.rendering=paused?'paused':!visible?'offscreen':document.hidden?'hidden':'running';renderer.setAnimationLoop(!paused&&visible&&!document.hidden?draw:null);}
 function invalidate(){if(!visible||document.hidden)return;if(paused){draw(performance.now(),true);}else if(visible&&!document.hidden)renderer.setAnimationLoop(draw);}
 const motionButton=root.querySelector('[data-live-pause]');
 function motionLabel(){motionButton.setAttribute('aria-pressed',String(paused));motionButton.innerHTML=(paused?'Resume motion':'Pause motion')+' <span aria-hidden="true">'+(paused?'▷':'Ⅱ')+'</span>';root.classList.toggle('live-paused',paused);root.classList.toggle('live-reduced',reduce.matches||staticQuery);}
 motionLabel();
 motionButton.addEventListener('click',()=>{paused=!paused;motionLabel();last=0;running();},{signal});
 root.querySelector('[data-live-burst]').addEventListener('click',e=>{if(story){manualCap=capLift>.5?0:1;invalidate();return;}expanded=!expanded;stats.frames=0;stats.total=0;stats.adjusted=false;const b=e.currentTarget;b.setAttribute('aria-pressed',String(expanded));b.innerHTML='<span aria-hidden="true">✳</span>'+(expanded?(story?'Close the cap':night?'Gather the orbit':'Bring it together'):(story?'Open the cap':night?'Expand the orbit':'Let it loose'));invalidate();},{signal});
 root.querySelectorAll('[data-live-pick]').forEach((b,i)=>b.addEventListener('click',()=>pick(i),{signal}));
 let down=null,oldX=0,totalDrag=0;
 surface.addEventListener('pointerdown',e=>{if(e.button!==0)return;down={x:e.clientX,y:e.clientY};oldX=e.clientX;totalDrag=0;surface.setPointerCapture(e.pointerId);surface.classList.add('is-dragging');},{signal});
 surface.addEventListener('pointermove',e=>{const r=surface.getBoundingClientRect();tx=((e.clientX-r.left)/r.width-.5)*2;ty=-((e.clientY-r.top)/r.height-.5)*2;if(down){const delta=e.clientX-oldX;totalDrag+=Math.abs(delta);if(night&&!story)targetYaw+=delta*.006;else {targetDrag+=delta*.01;throwVelocity=delta*.13;}oldX=e.clientX;}invalidate();},{signal});
 function up(e){if(!down)return;surface.classList.remove('is-dragging');if(totalDrag<7){const rect=surface.getBoundingClientRect(),ray=new T.Raycaster();ray.setFromCamera(new T.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);const hit=ray.intersectObjects(objects.children,true)[0];if(hit?.object.userData.index!==undefined)pick(hit.object.userData.index);}else if(night&&!story){pick(Math.round(-targetYaw/step));}down=null;}
 surface.addEventListener('pointerup',up,{signal});surface.addEventListener('pointercancel',()=>{down=null;surface.classList.remove('is-dragging');},{signal});
 surface.addEventListener('pointerleave',()=>{if(!down){tx=0;ty=0;invalidate();}},{signal});
 steps.forEach((b,i)=>b.addEventListener('click',()=>{if(reduce.matches||staticQuery){copies[i].scrollIntoView({behavior:'instant',block:'center'});return;}const top=scrollY+root.getBoundingClientRect().top;window.scrollTo({top:top+(root.offsetHeight-stage.offsetHeight)*i/3,behavior:'smooth'});},{signal}));
 const ro=new ResizeObserver(measure);ro.observe(surface);
 const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;last=0;running();},{threshold:0});io.observe(stage);
 window.addEventListener('scroll',scroll,{passive:true,signal});document.addEventListener('visibilitychange',running,{signal});
 const mediaChange=()=>{paused=reduce.matches||staticQuery;motionLabel();scroll();running();};reduce.addEventListener('change',mediaChange);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();renderer.setAnimationLoop(null);root.classList.remove('live-ready');root.classList.add('live-unavailable');loading.textContent='Product preview';},{signal});
 root.querySelectorAll('[data-live-pause],[data-live-burst]').forEach(b=>b.disabled=false);
 controls();measure();targetYaw=-selected*step;yaw=targetYaw;draw(performance.now(),true);running();
 return()=>{disposed=true;signalController.abort();renderer.setAnimationLoop(null);ro.disconnect();io.disconnect();reduce.removeEventListener('change',mediaChange);assets.forEach(g=>g&&release(g));geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());env.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();};
}
