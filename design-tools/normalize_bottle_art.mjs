// Reframe original, unmodified WebP artwork in a common transparent SVG viewport.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const bounds={
 'iron-bisglycinate':[774,237,184,769,997], 'l-theanine':[774,236,190,771,997],
 'vitamin-d3-k2':[667,5,4,661,997], 'omega-3-fish-oil':[715,247,115,709,997],
 'myo-d-chiro-inositol':[716,246,115,710,997], 'creatine-chews':[716,246,113,709,996],
 'psyllium-husk':[714,246,118,709,996]
};
const base=new URL('../web/media/',import.meta.url);
await mkdir(new URL('bottles-normalized/',base),{recursive:true});
for(const [id,[w,x0,y0,x1,y1]] of Object.entries(bounds)){
 const image=await readFile(new URL(id+'.webp',base));
 const scale=1000/(y1-y0),x=360-(x0+x1)*scale/2,y=20-y0*scale;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1040" viewBox="0 0 720 1040"><image x="${x}" y="${y}" width="${w*scale}" height="${1000*scale}" preserveAspectRatio="none" href="data:image/webp;base64,${image.toString('base64')}"/></svg>\n`;
 await writeFile(new URL('bottles-normalized/'+id+'.svg',base),svg);
}
console.log('Reframed seven source images without changing their pixels.');
