import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('/tmp/rea-unlock-test/node_modules/playwright-core');
const {PNG}=require('/tmp/rea-unlock-test/node_modules/pngjs');
const S='https://www.pokearena2d.com/';
const GROUP={
 pilot:[3],
 g0:[3,4,5,6,7],g1:[8,9,10,12,13],
 g2:[14,15,16,17,18,19],g3:[20,21,22,23,24,25]
};
const kind=process.argv[2]||'pilot';
if(!GROUP[kind])throw Error('Invalid capture group '+kind);
const out='rea-unlocked-captures';
fs.mkdirSync(out,{recursive:true});
const h=s=>crypto.createHash('sha256').update(s).digest('hex');
const sl=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const report={group:kind,indices:GROUP[kind],started:new Date().toISOString(),
 sandbox:{localStorageOnly:true,profile:'fresh disposal',serverAltered:false,
 authentication:false,online:false},
 roster:[],tests:[],errors:[],source:'real gameplay screenshots and H264 movie, not third-party atlas'};
const write=()=>fs.writeFileSync(out+'/manifest.json',JSON.stringify(report,null,2));
let browser,page;
const wait=ms=>page.waitForTimeout(ms),shot=file=>page.screenshot({path:file,timeout:20000});
function changed(a,b){
 const p=PNG.sync.read(a),q=PNG.sync.read(b);
 let n=0,d=0;
 for(let y=107;y<353;y+=3)for(let x=110;x<708;x+=3){
  const i=(y*p.width+x)*4;
  if(i+2>=p.data.length||i+2>=q.data.length)continue;
  const delta=Math.abs(p.data[i]-q.data[i])+Math.abs(p.data[i+1]-q.data[i+1])+Math.abs(p.data[i+2]-q.data[i+2]);
  n++;if(delta>96)d++;
 }
 return +(d/n).toFixed(4);
}
function contact(dir,frames){
 const cols=4,rows=2,w=390,hh=219,sel=[0,3,6,9,12,15,18,21];
 const sheet=new PNG({width:w*cols,height:hh*rows});
 for(let k=0;k<8;k++){
  const raw=PNG.sync.read(fs.readFileSync(frames[sel[k]]));
  for(let y=0;y<hh;y++)for(let x=0;x<w;x++){
   const i=((y*2)*raw.width+x*2)*4;
   const j=((Math.floor(k/cols)*hh+y)*sheet.width+(k%cols)*w+x)*4;
   for(let b=0;b<4;b++)sheet.data[j+b]=raw.data[i+b];
  }
 }
 fs.writeFileSync(dir+'/contact-sheet.png',PNG.sync.write(sheet));
}
function renderMp4(dir,frames){
 const p=spawnSync('ffmpeg',['-y','-hide_banner','-loglevel','error','-framerate','10',
 '-i',dir+'/frame-%02d.png','-c:v','libx264','-preset','veryfast','-crf','25',
 '-pix_fmt','yuv420p',dir+'/real-gameplay.mp4'],{timeout:70000,encoding:'utf8'});
 if(p.status!==0)throw Error('ffmpeg failed: '+(p.stderr||'').slice(0,350));
 // Keep the evidence montage and real-time capture as MP4; delete redundant
 // raw PNGs only after a valid playable video exists.
 if(fs.statSync(dir+'/real-gameplay.mp4').size<2000)throw Error('MP4 too small');
 for(const f of frames)fs.unlinkSync(f);
 return fs.statSync(dir+'/real-gameplay.mp4').size;
}
async function menu(){
 await page.goto(S,{waitUntil:'domcontentloaded',timeout:55000});
 await wait(9000);
 await page.mouse.click(390,183);await wait(2500);
 await page.mouse.click(390,282);await wait(2900);
}
async function record(id,slot){
 await menu();
 const x=53+(id%13)*56.2,y=id<13?78:136;
 await page.mouse.click(x,y);await wait(360);
 await page.mouse.click(550,243);await wait(190);
 await page.mouse.click(669,78);await wait(250);
 await page.mouse.click(181,385);await wait(300);
 const name=report.roster[id]?.name||'index-'+id;
 const move=report.roster[id]?.moves?.[slot]||'move-'+slot;
 const dir=out+'/'+String(id).padStart(2,'0')+'-'+sl(name)+'/'+slot+'-'+sl(move);
 fs.mkdirSync(dir,{recursive:true});
 await shot(dir+'/selection.png');
 await page.mouse.click(684,393);await wait(3600);
 await page.evaluate(()=>{
  const c=document.querySelector('canvas');
  c?.addEventListener('contextmenu',e=>{e.preventDefault();e.stopPropagation();},true);
 });
 const before=await shot(dir+'/before.png');
 const command=['left','right','Space','q','e'][slot];
 await page.mouse.move(570,220);
 if(slot===4){
  for(let i=0;i<8;i++){await page.mouse.click(570,220);await wait(210)}
  await wait(600);
 }
 let held=false;
 const frames=[],ratios=[],times=[];
 try{
  if(command==='left'||command==='right')await page.mouse.down({button:command});
  else await page.keyboard.down(command);
  held=true;
  const t=Date.now();
  for(let f=0;f<25;f++){
   const file=dir+'/frame-'+String(f).padStart(2,'0')+'.png';
   const frame=await shot(file);
   frames.push(file);ratios.push(changed(before,frame));times.push(Date.now()-t);
   await wait(78);
  }
 }finally{
  if(held){
   if(command==='left'||command==='right')await page.mouse.up({button:command});
   else await page.keyboard.up(command);
  }
 }
 contact(dir,frames);
 const size=renderMp4(dir,frames);
 const entry={index:id,pokemon:name,move,slot,command,frames:25,
  videoPath:dir+'/real-gameplay.mp4',contactPath:dir+'/contact-sheet.png',
  visualChanges:ratios.filter(x=>x>.014).length,status:'captured_attempt_unverified',
  timestampsMs:times,roiDifference:ratios,videoBytes:size};
 report.tests.push(entry);write();
 console.log('CAPTURED',JSON.stringify({index:id,move,frames:25,sizeBytes:size}));
}
try{
 browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,
  args:['--no-sandbox','--disable-dev-shm-usage']});
 const ctx=await browser.newContext({viewport:{width:780,height:437}});
 await ctx.addInitScript(()=>{
  if(location.host==='www.pokearena2d.com'){
   localStorage.setItem('pa-liga',JSON.stringify({v:1,vencidos:{},legado:true,visto:true}));
  }
 });
 page=await ctx.newPage();
 await page.goto(S,{waitUntil:'domcontentloaded',timeout:55000});
 await wait(8500);
 const catalog=await page.evaluate(async()=>{
  const d=await import('/src-3a160064ab/datos.js');
  const r=await import('/src-3a160064ab/liga.js');
  return {unlocked:r.resumen(),roster:d.ROSTER.map((p,i)=>({
    index:i,id:p.id,name:p.nombre||p.name||p.id,
    moves:['lmb','rmb','esp','q','e'].map(k=>p.kit?.[k]?.nombre||k)
  }))};
 });
 report.unlocked=catalog.unlocked;report.roster=catalog.roster;
 if(catalog.unlocked.desbloqueados<26)throw Error('Not all characters unlocked locally');
 for(const id of GROUP[kind]){
  for(let slot=0;slot<5;slot++){
   try{await record(id,slot)}catch(e){
    const err={id,slot,error:String(e.stack||e).slice(0,400)};report.errors.push(err);write();console.error('ERROR',err);
   }
  }
 }
}catch(e){report.errors.push({fatal:String(e.stack||e).slice(0,700)})}
finally{
 await browser?.close();report.finished=new Date().toISOString();write();
 console.log('SUMMARY',JSON.stringify({group:kind,unlocked:report.unlocked,
  complete:report.tests.length,errors:report.errors}));
 if(!report.tests.length)process.exitCode=1;
}
