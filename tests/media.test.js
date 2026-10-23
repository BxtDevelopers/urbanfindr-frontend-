import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync,readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { photos,resolveImage,propertyGallery,propertyImages,projectImages,designImage,designPhoto } from '../lib/media.js';
import { imageURL,propertySchema } from '../lib/validation.js';

test('all referenced bundled photos exist and contain JPEG bytes',()=>{
 const assets=new Set([photos.hero,...Object.values(photos).filter(Array.isArray).flat()]);
 for(const source of assets){const path=resolve('public',source.slice(1));assert.ok(existsSync(path),source);const bytes=readFileSync(path);assert.equal(bytes[0],0xff);assert.equal(bytes[1],0xd8);assert.ok(bytes.length>10000);assert.equal(imageURL.safeParse(source).success,true);}
});
test('photo URL validation rejects traversal and non-image local paths',()=>{
 for(const source of ['/photos/../secret.jpg','/photos/image.svg','/photos/file.exe','javascript:alert(1)'])assert.equal(imageURL.safeParse(source).success,false);
});
test('older property image references become appropriate PG and commercial photos',()=>{
 const pg=propertyImages({purpose:'pg',images:['/images/home-1.svg','/images/interior-2.svg']});assert.ok(pg[0].includes('bedroom'));
 const office=propertyImages({purpose:'commercial',type:'Office',images:['/images/home-4.svg']});assert.ok(office[0].includes('office'));
 assert.ok(propertyGallery({purpose:'buy',type:'Apartment'})[0].includes('builder'));
});
test('uploaded photos and custom HTTPS image links stay intact',()=>{
 const custom=['/uploads/abc-123.jpg','https://example.com/property.jpg'];assert.deepEqual(propertyImages({purpose:'rent',images:custom}),custom);assert.equal(resolveImage(custom[1]),custom[1]);assert.equal(resolveImage(null),photos.hero);
});
test('existing interior records resolve by category while floor plans stay unchanged',()=>{
 assert.ok(designImage({category:'Kitchen',image:'/images/interior-1.svg'}).includes('kitchen'));assert.ok(designPhoto('Wardrobe').includes('wardrobe'));assert.ok(projectImages({images:['/images/home-2.svg']})[0].includes('builder'));assert.equal(resolveImage('/images/plan-2.svg'),'/images/plan-2.svg');
});
