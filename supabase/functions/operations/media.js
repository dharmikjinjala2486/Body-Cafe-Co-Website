// Identifies file bytes, rejects animation/oversized images and drops identifying metadata.
const fail=()=>{throw new Error('Upload a valid still JPEG, PNG or WebP image, up to 5 MB.');};
const join=parts=>{let out=new Uint8Array(parts.reduce((n,p)=>n+p.length,0)),i=0;for(let p of parts){out.set(p,i);i+=p.length;}return out;};
const ascii=b=>String.fromCharCode(...b);
function orientation(seg){try{if(ascii(seg.slice(0,6))!=='Exif\0\0')return null;let t=seg.slice(6),v=new DataView(t.buffer),le=ascii(t.slice(0,2))==='II';if(!le&&ascii(t.slice(0,2))!=='MM')return null;let off=v.getUint32(4,le),n=Math.min(v.getUint16(off,le),512);for(let i=0;i<n;i++){let pos=off+2+12*i;if(v.getUint16(pos,le)===274&&v.getUint16(pos+2,le)===3){let n=v.getUint16(pos+8,le);return n>=1&&n<=8?n:null;}}}catch{}return null;}
function orientationBlock(value){let b=new Uint8Array(36),v=new DataView(b.buffer);b.set([255,225,0,34,69,120,105,102,0,0,77,77,0,42]);v.setUint32(14,8);v.setUint16(18,1);v.setUint16(20,274);v.setUint16(22,3);v.setUint32(24,1);v.setUint16(28,value);return b;}
export function sanitiseImage(input){let d=new Uint8Array(input),v=new DataView(d.buffer,d.byteOffset,d.byteLength),w,h,parts=[],mime,ext;if(!d.length||d.length>5*1024*1024)fail();
 if(ascii(d.slice(0,8))==='\x89PNG\r\n\x1a\n'){
  mime='image/png';ext='.png';parts=[d.slice(0,8)];let i=8,end=false,pixels=false;
  while(i+12<=d.length){let len=v.getUint32(i),type=ascii(d.slice(i+4,i+8));if(i+12+len>d.length||['acTL','fcTL','fdAT'].includes(type))fail();if(type==='IHDR'){if(len!==13||w!==undefined)fail();w=v.getUint32(i+8);h=v.getUint32(i+12);}if(type==='IDAT')pixels=true;if(['IHDR','PLTE','IDAT','IEND','tRNS','gAMA','cHRM','sRGB','sBIT','pHYs','bKGD'].includes(type))parts.push(d.slice(i,i+12+len));i+=12+len;if(type==='IEND'){end=true;break;}}
  if(!end||!pixels)fail();
 }else if(d[0]===255&&d[1]===216&&d[2]===255){
  mime='image/jpeg';ext='.jpg';parts=[d.slice(0,2)];let i=2,scan=false,orient=null;
  while(i<d.length){if(d[i]!==255)fail();while(d[i]===255)i++;let marker=d[i++];if(marker===217)fail();if(marker>=208&&marker<=215||marker===1)continue;if(i+2>d.length)fail();let len=v.getUint16(i);if(len<2||i+len>d.length)fail();let seg=d.slice(i+2,i+len);if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)&&len>=7){h=v.getUint16(i+3);w=v.getUint16(i+5);}if(marker===225&&!orient)orient=orientation(seg);let keep=!((marker>=225&&marker<=239&&marker!==238)||marker===254);if(marker===224&&ascii(seg.slice(0,5))!=='JFIF\0')keep=false;if(keep)parts.push(new Uint8Array([255,marker]),d.slice(i,i+len));i+=len;if(marker===218){parts.push(d.slice(i));scan=true;break;}}
  if(!scan||d[d.length-2]!==255||d[d.length-1]!==217)fail();if(orient&&orient!==1)parts.splice(1,0,orientationBlock(orient));
 }else if(ascii(d.slice(0,4))==='RIFF'&&ascii(d.slice(8,12))==='WEBP'){
  mime='image/webp';ext='.webp';let size=v.getUint32(4,true),i=12;if(size+8>d.length||size<12)fail();parts=[];
  while(i+8<=size+8){let type=ascii(d.slice(i,i+4)),len=v.getUint32(i+4,true);if(i+8+len>size+8||['ANIM','ANMF'].includes(type))fail();let body=d.slice(i+8,i+8+len),dv=new DataView(body.buffer);if(type==='VP8X'&&len>=10){body[0]&=~46;w=1+body[4]+(body[5]<<8)+(body[6]<<16);h=1+body[7]+(body[8]<<8)+(body[9]<<16);}else if(type==='VP8 '&&len>=10&&w===undefined){if(ascii(body.slice(3,6))!=='\x9d\x01\x2a')fail();w=dv.getUint16(6,true)&16383;h=dv.getUint16(8,true)&16383;}else if(type==='VP8L'&&len>=5&&w===undefined){if(body[0]!==47)fail();let bits=dv.getUint32(1,true);w=(bits&16383)+1;h=((bits>>>14)&16383)+1;}if(!['EXIF','XMP ','ICCP'].includes(type))parts.push(d.slice(i,i+8),body,...(len%2?[new Uint8Array(1)]:[]));i+=8+len+(len%2);}
  let payload=join([new TextEncoder().encode('WEBP'),...parts]),header=new Uint8Array(8);header.set(new TextEncoder().encode('RIFF'));new DataView(header.buffer).setUint32(4,payload.length,true);parts=[header,payload];
 }else fail();
 if(!w||!h||w>10000||h>10000)fail();return {bytes:join(parts),mime,ext,width:w,height:h};
}
