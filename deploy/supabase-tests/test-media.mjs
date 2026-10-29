import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {sanitiseImage} from '../../supabase/functions/operations/media.js';
const fixtures=JSON.parse(await fs.readFile(new URL('media-fixtures.json',import.meta.url)));
for(const kind of ['JPEG','PNG','WEBP']){
 const image=sanitiseImage(Buffer.from(fixtures[kind],'base64'));
 assert.equal(image.width,24);assert.equal(image.height,16);
 const cleaned=Buffer.from(image.bytes);
 for(const privateText of ['CameraMaker','SECRETNOTE','Private Person'])assert.equal(cleaned.includes(privateText),false);
 if(kind==='JPEG'){let pos=cleaned.indexOf('Exif');assert.ok(pos>0);assert.equal(cleaned.readUInt16BE(pos+24),6);}
}
for(const kind of ['APNG','GIF'])assert.throws(()=>sanitiseImage(Buffer.from(fixtures[kind],'base64')));
console.log('Image fixtures preserve orientation and dimensions, remove private metadata and reject animation.');
