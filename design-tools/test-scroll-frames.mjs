// Exercise cold-cache and out-of-order image loads: the visible frame must match
// the latest requested angle even when scrolling stops before the image arrives.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync('web/super-sevens.js','utf8');
class Frame {
  complete=false; naturalWidth=0; listeners=new Set();
  addEventListener(_event,fn){this.listeners.add(fn);}
  removeEventListener(_event,fn){this.listeners.delete(fn);}
  load(){this.complete=true;this.naturalWidth=520;for(const fn of [...this.listeners]){this.listeners.delete(fn);fn();}}
}
const context={Image:Frame,FRAMES:24,pad:n=>String(n).padStart(2,'0')};
vm.createContext(context);
vm.runInContext(source.slice(source.indexOf('  var frameCache = {}'),source.indexOf('  function spinBehaviour(')),context);
const image={src:'front.webp'},attrs={},lens={style:{}};
const el={isConnected:true,_f:0,getAttribute:()=> 'iron-bisglycinate',querySelector:s=>s==='img'?image:lens,setAttribute:(k,v)=>attrs[k]=v};
context.setFrame(el,4);
assert.equal(image.src,'front.webp','keep visible image while the next one loads');
assert.equal(el._f,0,'do not mark an unloaded frame as displayed');
context.frameCache['iron-bisglycinate'][4].load();
assert.match(image.src,/-04.webp$/,'finish the last requested frame even after scrolling stops');
assert.equal(attrs['aria-valuenow'],'60');
context.setFrame(el,8);context.setFrame(el,11);
context.frameCache['iron-bisglycinate'][8].load();
assert.match(image.src,/-04.webp$/,'a stale request must not repaint');
context.frameCache['iron-bisglycinate'][11].load();
assert.match(image.src,/-11.webp$/);
context.setFrame(el,8);
assert.match(image.src,/-08.webp$/,'already loaded frames apply immediately');
context.setFrame(el,9);el.isConnected=false;
context.frameCache['iron-bisglycinate'][9].load();
assert.match(image.src,/-08.webp$/,'detached page does not repaint');
console.log('Scroll frames passed: cold loading, stopped scrolling, stale loads, cached frames and detached pages.');

// The launch range must use one decoded sheet and repaint the latest requested
// angle when it arrives, without starting the 24 individual image requests.
const draws=[];
const canvas={width:0,height:0,setAttribute(){},getContext:()=>({clearRect(){},drawImage(...args){draws.push(args);}})};
context.document={createElement:()=>canvas};
const roll={...el,isConnected:true,_f:0,closest:()=>true,classList:{add(){}},appendChild(){}};
context.setFrame(roll,3);
context.setFrame(roll,17);
assert.equal(roll._f,0);
const sheet=context.atlasCache['iron-bisglycinate'];
sheet.image.naturalWidth=3120;
sheet.image.onload();
await sheet.promise;
await Promise.resolve();
assert.equal(roll._f,17,'sheet arrival paints the latest requested angle');
assert.deepEqual(draws.at(-1).slice(1),[2600,1720,520,860,0,0,520,860]);
context.setFrame(roll,18);
assert.equal(draws.length,2,'ready sheets redraw synchronously with no image request');
assert.equal(roll._f,18);
assert.match(sheet.image.src,/-atlas.webp$/);
console.log('Scroll atlas passed: one sheet, latest angle after loading and immediate decoded redraws.');
