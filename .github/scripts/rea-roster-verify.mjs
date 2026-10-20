import fs from 'node:fs';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('/tmp/rea-roster/node_modules/playwright-core');
const {PNG}=require('/tmp/rea-roster/node_modules/pngjs');
const dir='rea-roster-evidence';
fs.mkdirSync(dir,{recursive:true});
const result={target:'https://www.pokearena2d.com/',selectionPolicy:'Public Training slots only',
 scanned:26,detectedChanges:[],slots:[],errors:[],timestamp:new Date().toISOString()};
const save=()=>fs.writeFileSync(dir+'/ELENCO-ACESSIVEL.json',JSON.stringify(result,null,2));
function diff(a,b){
 const x=PNG.sync.read(a),y=PNG.sync.read(b);
 const box={x:151,y:181,w:185,h:35};
 let n=0,d=0;
 for(let row=box.y;row<box.y+box.h;row++)for(let col=box.x;col<box.x+box.w;col++){
  const i=(row*x.width+col)*4;
  if(i+2>=x.data.length||i+2>=y.data.length)continue;
  d+=Number(Math.abs(x.data[i]-y.data[i])+Math.abs(x.data[i+1]-y.data[i+1])+Math.abs(x.data[i+2]-y.data[i+2])>35);
  n++;
 }
 return {ratio:n?d/n:0,pixelsDifferent:d};
}
let browser;
try{
 browser=await chromium.connectOverCDP('http://127.0.0.1:9222');
 const ctx=browser.contexts()[0];const page=ctx.pages()[0]||await ctx.newPage();
 await page.setViewportSize({width:780,height:437});
 const sleep=ms=>page.waitForTimeout(ms);
 await page.goto(result.target,{waitUntil:'domcontentloaded',timeout:45000});
 await sleep(9500);await page.mouse.click(390,183);await sleep(3000);
 await page.mouse.click(390,282);await sleep(3600);
 await page.screenshot({path:dir+'/menu-before.png'});
 for(let i=0;i<26;i++){
  // Clicking an icon automatically shifts the selection focus to the Dummy
  // pane; refocus Player 1 and restore known Bulbasaur between each test.
  await page.mouse.click(136,238);await sleep(120);
  await page.mouse.click(53,78);await sleep(190);
  await page.mouse.click(136,238);await sleep(140);
  const before=await page.screenshot();
  const px=53+(i%13)*56.2,py=i<13?78:136;
  await page.mouse.click(px,py);await sleep(420);
  const after=await page.screenshot();
  const d=diff(before,after);
  const item={slot:i,position:[px,py],nameRegion:d,changedFromBulbasaur:d.ratio>.019,
   result:i===0?'known_bulbasaur':d.ratio>.019?'player_selection_changed':'no_change_or_locked'};
  result.slots.push(item);
  // Save every menu choice, so reviewer can verify what was actually shown.
  fs.writeFileSync(dir+'/slot-'+String(i).padStart(2,'0')+'.png',after);
  console.log('slot',i,item.result,d.ratio.toFixed(4));
 }
 result.detectedChanges=result.slots.filter(x=>x.changedFromBulbasaur).map(x=>x.slot);
}catch(e){result.errors.push(String(e).slice(0,370))}
finally{save();console.log(JSON.stringify({selectedSlots:result.detectedChanges,errors:result.errors}));
process.exit(0);}
