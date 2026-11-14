import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { setTimeout as pause } from 'node:timers/promises';
import { mkdir,writeFile,unlink,readFile } from 'node:fs/promises';
const base='http://127.0.0.1:3188';
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p','3188','-H','127.0.0.1'],{env:{...process.env,MONGODB_URI:'',APP_URL:base,NEXT_TELEMETRY_DISABLED:'1'},stdio:['ignore','pipe','pipe']});let log='';server.stdout.on('data',b=>log+=b);server.stderr.on('data',b=>log+=b);let count=0;const file='storage/uploads/00000000-0000-0000-0000-000000000000.png';
try{let ready=false;for(let i=0;i<80;i++){try{if((await fetch(base)).ok){ready=true;break;}}catch{}if(server.exitCode!==null)throw new Error(log);await pause(250);}assert.ok(ready,log);
 for(const route of ['/','/properties','/properties?purpose=buy','/buy','/rent','/pg','/commercial','/cities','/cities/bengaluru','/cities/mumbai','/post-property?purpose=pg','/interiors?category=Kitchen','/projects','/interiors','/login','/register','/post-property','/compare','/dashboard','/dashboard/messages','/dashboard/visits','/dashboard/leads','/admin','/about']){const response=await fetch(base+route);assert.equal(response.status,200,route);const html=await response.text();assert.ok(html.includes('urbanfindr') || html.includes('urbanfinder'),route);count++;console.log(`PASS page ${route}`);}
 const homeHtml=await (await fetch(base)).text();
 const sections=['featured-properties','explore-by-city','latest-listings','builder-projects','home-interiors'];
 let previous=-1;for(const section of sections){const position=homeHtml.indexOf(`id="${section}"`);assert.ok(position>previous,`Home section ${section} exists in the correct order`);previous=position;count++;}
 for(const [route,title] of [['/buy','A home to call your own.'],['/rent','A fresh start. A place to belong.'],['/pg','Your own space. A shared experience.'],['/commercial','Space for your next big idea.']]){const html=await(await fetch(base+route)).text();assert.ok(html.includes(title),`${route} has dedicated category content`);count++;}
 const missingCity=await fetch(base+'/cities/not-a-city');assert.equal(missingCity.status,404);count++;
 for(const route of ['/api/discovery','/api/properties?featured=true','/api/properties?purpose=pg&sharing=2+sharing']){const response=await fetch(base+route);assert.equal(response.status,503);assert.ok((await response.json()).error.includes('MONGODB_URI'));count++;}
 const photoSources=JSON.parse(await readFile('public/photos/sources.json','utf8'));
 for(const item of photoSources){const response=await fetch(base+item.path);assert.equal(response.status,200,item.path);assert.ok(response.headers.get('content-type').startsWith('image/'));assert.ok((await response.arrayBuffer()).byteLength>10000);count++;}
 assert.ok(homeHtml.includes('/photos/hero-home.jpg'),'Homepage references bundled hero photo');count++;
 assert.ok(homeHtml.includes('/photos/living-1.jpg'),'Homepage references bundled interior photo');count++;
 const credits=await fetch(base+'/PHOTO-SOURCES.md');assert.equal(credits.status,200);count++;
 const me=await fetch(base+'/api/auth/me');assert.equal(me.status,200);assert.deepEqual(await me.json(),{user:null});count++;
 const mutation=await fetch(base+'/api/estimate',{method:'POST',headers:{Origin:'https://attacker.example','Content-Type':'application/json'},body:'{}'});assert.equal(mutation.status,403);count++;
 const health=await fetch(base+'/api/health');assert.equal(health.status,503);assert.ok((await health.json()).error.includes('MONGODB_URI'));count++;
 // This file is deliberately created after server startup to catch static-file caching regressions.
 await mkdir('storage/uploads',{recursive:true});await writeFile(file,Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000b49444154789c636000020000050001a5f645400000000049454e44ae426082','hex'));
 const image=await fetch(base+'/uploads/00000000-0000-0000-0000-000000000000.png');assert.equal(image.status,200);assert.equal(image.headers.get('content-type'),'image/png');assert.equal((await image.arrayBuffer()).byteLength,68);count++;
 const bad=await fetch(base+'/uploads/evil.svg');assert.equal(bad.status,404);count++;
 console.log(`PASS ${count} server smoke checks, including origin protection, missing-database error handling and newly created image serving.`);
}catch(e){console.error(e);console.error(log);process.exitCode=1;}finally{server.kill('SIGTERM');await unlink(file).catch(()=>{});}
