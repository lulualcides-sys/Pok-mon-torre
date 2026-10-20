import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('/tmp/rea-all-moves/node_modules/playwright-core');
const {PNG}=require('/tmp/rea-all-moves/node_modules/pngjs');
const SITE='https://www.pokearena2d.com/',OUT='rea-moves-evidence';
const pokemon=process.argv[2]||'charmander';
const profiles={
 bulbasaur:{pos:[53,78],opponent:[669,78],arena:[112,385],
   moves:['Razor Leaf','Growth','Vine Whip','Leech Seed','Solar Beam']},
 charmander:{pos:[109,78],opponent:[669,78],arena:[181,385],
   moves:['Ember','Flamethrower','Quick Attack','Fire Spin','Fire Blast']},
 squirtle:{pos:[165,78],opponent:[669,78],arena:[246,385],
   moves:['Water Gun','Bubble Beam','Rapid Spin','Hydro Typhoon','Hydro Pump']},
 pichu:{pos:[669,78],opponent:[165,78],arena:[315,385],
   moves:['Thunder Shock','Thunderbolt','Quick Attack','Discharge','Thunder']}
};
if(!profiles[pokemon])throw Error('Unrecognized public profile: '+pokemon);
const me=profiles[pokemon],hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const manifest={site:SITE,version:'rea-public-moves-1',pokemon,
  scope:'Public Training mode real browser screenshots only',
  captures:[],roster:[],errors:[],started:new Date().toISOString(),
  disclaimer:'A screenshot change does not guarantee the command activated an attack.'};
fs.mkdirSync(OUT,{recursive:true});
let browser,page;
const wait=ms=>page.waitForTimeout(ms),json=(file,data)=>fs.writeFileSync(file,JSON.stringify(data,null,2));
const persist=()=>json(OUT+'/manifest-'+pokemon+'.json',manifest);
const safe=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
const grab=file=>page.screenshot(file?{path:file,timeout:16000}:{timeout:16000});
function roiDiff(a,b,box){
 try{
  const x=PNG.sync.read(a),y=PNG.sync.read(b);
  let changed=0,n=0;
  for(let row=box.y;row<box.y+box.h;row+=2)for(let col=box.x;col<box.x+box.w;col+=2){
   const i=(row*x.width+col)*4;
   if(i+2>=x.data.length||i+2>=y.data.length)continue;
   const d=Math.abs(x.data[i]-y.data[i])+Math.abs(x.data[i+1]-y.data[i+1])+Math.abs(x.data[i+2]-y.data[i+2]);
   if(d>90)changed++;n++;
  }
  return {ratio:n?changed/n:0,changedPixels:changed*4};
 }catch(e){return {error:String(e).slice(0,100)}}
}
async function navigate(){
 await page.goto(SITE,{waitUntil:'domcontentloaded',timeout:50000});
 await wait(10000);await page.mouse.click(390,183);await wait(3000);
 await page.mouse.click(390,282);await wait(3600);
}
async function discover(){
 await navigate();fs.mkdirSync(OUT+'/roster',{recursive:true});
 let last=await grab(OUT+'/roster/initial.png');
 for(let i=0;i<26;i++){
  const x=53+(i%13)*56.2,y=i<13?78:136;
  await page.mouse.click(x,y);await wait(340);
  const frame=await grab(),diff=roiDiff(last,frame,{x:154,y:182,w:169,h:26});
  const changed=diff.ratio>.015;
  const row={index:i,coordinate:[x,y],nameRegionDifference:diff,
    status:changed?'selection_changed':'unchanged_or_locked'};
  manifest.roster.push(row);
  if(changed)await grab(OUT+'/roster/selectable-'+String(i).padStart(2,'0')+'.png');
  last=frame;
 }
 persist();
}
async function fight(slot){
 await navigate();
 await page.mouse.click(...me.pos);await wait(350);
 await page.mouse.click(552,244);await wait(230);
 await page.mouse.click(...me.opponent);await wait(390);
 await page.mouse.click(...me.arena);await wait(450);
 const dir=OUT+'/'+pokemon+'/'+String(slot).padStart(2,'0')+'-'+safe(me.moves[slot]);
 fs.mkdirSync(dir,{recursive:true});
 await grab(dir+'/selection.png');
 await page.mouse.click(684,393);await wait(4000);
 const canvas=await page.evaluate(()=>document.querySelector('canvas')?.getBoundingClientRect().width||0);
 await grab(dir+'/battle-before.png');
 if(canvas<300)throw Error('No active gameplay canvas in Training battle');
 // Only regular Training control input, no hidden unlocking or game state mutation.
 await page.mouse.move(551,219);
 if(slot===4){
  for(let i=0;i<9;i++){await page.mouse.click(551,219,{button:'left'});await wait(260);}
  await wait(1100);
 }
 const input=['left','right','Space','q','e'][slot];
 const reference=await grab(),events=[],begin=Date.now();
 let down=false;
 try{
  if(input==='left'||input==='right')await page.mouse.down({button:input});
  else await page.keyboard.down(input);
  down=true;
  for(let i=0;i<25;i++){
   const png=await grab(dir+'/frame-'+String(i).padStart(2,'0')+'.png');
   events.push({frame:i,elapsedMs:Date.now()-begin,sha256:hash(png),
     difference:roiDiff(reference,png,{x:118,y:98,w:585,h:254})});
   await wait(80);
  }
 }finally{
  if(down){
   if(input==='left'||input==='right')await page.mouse.up({button:input});
   else await page.keyboard.up(input);
  }
 }
 await wait(220);await grab(dir+'/battle-after.png');
 const active=events.filter(e=>e.difference?.ratio>.014).length;
 const result={pokemon,move:me.moves[slot],slot,input,
  status:active>=3?'frames_saved_visual_change':'frames_saved_activation_unverified',
  frameCount:events.length,changedFrames:active,
  evidenceDir:dir,frames:events,
  comment:'Real browser playback capture. Movement or idle changes may be misclassified; review images.'};
 manifest.captures.push(result);persist();
 console.log(JSON.stringify({move:result.move,status:result.status,frames:result.frameCount}));
}
async function sheets(){
 // Eight sampled screenshots tiled at half size for fast visual review.
 for(const c of manifest.captures){
  const indices=[0,3,6,9,12,15,18,21],w=390,h=219;
  const sheet=new PNG({width:w*4,height:h*2});
  for(let i=0;i<indices.length;i++){
   const file=c.evidenceDir+'/frame-'+String(indices[i]).padStart(2,'0')+'.png';
   const img=PNG.sync.read(fs.readFileSync(file));
   const x0=(i%4)*w,y0=Math.floor(i/4)*h;
   for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const a=((y*2)*img.width+x*2)*4,b=((y0+y)*sheet.width+x0+x)*4;
    for(let k=0;k<4;k++)sheet.data[b+k]=img.data[a+k];
   }
  }
  fs.writeFileSync(c.evidenceDir+'/contact-sheet.png',PNG.sync.write(sheet));
 }
}
try{
 browser=await chromium.connectOverCDP('http://127.0.0.1:9222',{timeout:25000});
 const ctx=browser.contexts()[0];if(!ctx)throw Error('CDP context absent');
 page=ctx.pages()[0]||await ctx.newPage();await page.setViewportSize({width:780,height:437});
 if(pokemon==='bulbasaur')await discover();
 for(let slot=0;slot<5;slot++){
  try{await fight(slot)}
  catch(e){manifest.errors.push({slot,move:me.moves[slot],error:String(e).slice(0,280)});persist();}
 }
 await sheets();
}catch(e){manifest.errors.push({fatal:String(e).slice(0,340)})}
finally{
 manifest.ended=new Date().toISOString();persist();
 fs.writeFileSync(OUT+'/README.txt','Capturas de interações REAIS no Poké Arena 2D para pesquisa visual. Arquivos frame-XX.png em ordem. Alterações de pixel não são prova de golpe executado. Golpes bloqueados não são contornados.\n');
 console.log(JSON.stringify({pokemon,captured:manifest.captures.length,errors:manifest.errors}));
 process.exit(0);
}
