/* Variant A's shared bottle image framing. Other directions keep their source artwork. */
(function(){
 'use strict';
 const ids=new Set(['iron-bisglycinate','l-theanine','vitamin-d3-k2','omega-3-fish-oil','myo-d-chiro-inositol','creatine-chews','psyllium-husk']);
 function isA(){return document.body.dataset.design==='a';}
 function url(id,original){if(window.BCCCatalogImages&&window.BCCCatalogImages[id])return window.BCCCatalogImages[id];return isA()&&ids.has(id)?'/web/media/bottles-normalized/'+id+'.svg':original||'/web/media/'+id+'.webp';}
 function dimensions(id,w=720,h=1000){return isA()&&ids.has(id)?{w:720,h:1040}:{w,h};}
 window.BCCBottleAssets={url,dimensions};
})();
