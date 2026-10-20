'use strict';
// Real battle / real client-built evolution stages, Chrome-only, local Training.
// Stage transitions call Poké Arena 2D's OWN published evolucionar() and megaevolucionar()
// on a locally observed Luchador instance. No account, server or online match state.
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const {chromium}=require('/tmp/rea-evo-capture/node_modules/playwright-core');
const {PNG}=require('/tmp/rea-evo-capture/node_modules/pngjs');
const ROOT='rea-evolved-moves',SITE='https://www.pokearena2d.com/';
const GROUPS={
 pilot:[1],
 e0:[0,1,2,3],e1:[4,5,6],e2:[7,8,9],e3:[10,11,12,13],
 e4:[14,15,16],e5:[17,18,19],e6:[20,21,22],e7:[23,24,25]
};
const group=process.argv[2]||'pilot',indices=GROUPS[group];
if(!indices)throw Error('Unknown group '+group);
const controlSlots=['lmb','rmb','esp','q','e'];
const result={group,indices,started:new Date().toISOString(),mode:'isolated-public-offline-training',
 localProgressOnly:true,loginUsed:false,serverChanged:false,gameFilesModified:false,
 catalog:[],captures:[],evolutions:[],errors:[],validation:{
  stageVerifiedForEveryVideo:false,skillInputsReal:true,
  visualMotionAloneNotProofOfMove:true}};
fs.mkdirSync(ROOT,{recursive:true});
const save=()=>fs.writeFileSync(ROOT+'/MANIFEST.json',JSON.stringify(result,null,2));
const safe=s=>String(s||'unnamed').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const wait=ms=>page.waitForTimeout(ms);
let browser,ctx,page,roster=[];
const profileSelect=(i)=>[53+(i%13)*56.2,i<13?78:136];
function deriveMove(p,stage,slot,mega=false){
 const ev=p.evoluciones||[];
 const kits=[p.kit];
 for(let i=0;i<stage;i++)kits.push(ev[i]?.kit||{});
 const f=stage===0?p:ev[stage-1]||p;
 if(mega&&f.mega?.kit)kits.push(f.mega.kit);
 const m=Object.assign({},...kits.map(x=>x?.[slot]||{}));
 return {name:m.nombre||slot,shape:m.forma||'',sprite:m.hoja||null,category:m.tipo||'',cost:m.coste||0,
  properties:Object.keys(m)};
}
function changed(a,b){
 let x,y;try{x=PNG.sync.read(a);y=PNG.sync.read(b)}catch(_){return null}
 let n=0,z=0;for(let yy=95;yy<344;yy+=4)for(let xx=110;xx<708;xx+=4){
  const i=(yy*x.width+xx)*4;
  if(i+2>=x.data.length||i+2>=y.data.length)continue;
  n++;if(Math.abs(x.data[i]-y.data[i])+Math.abs(x.data[i+1]-y.data[i+1])+Math.abs(x.data[i+2]-y.data[i+2])>100)z++;
 }
 return n?+(z/n).toFixed(4):null;
}
function contact(dir,files){
 const pos=[0,3,6,9,12,15,18,21],w=390,h=219,img=new PNG({width:w*4,height:h*2});
 for(let k=0;k<8;k++){
  const f=PNG.sync.read(fs.readFileSync(files[pos[k]]));
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const s=((y*2)*f.width+x*2)*4,d=((Math.floor(k/4)*h+y)*img.width+((k%4)*w+x))*4;
   for(let z=0;z<4;z++)img.data[d+z]=f.data[s+z]||0;
  }
 }
 fs.writeFileSync(dir+'/contact-sheet.png',PNG.sync.write(img));
}
function mp4(dir,frames){
 const a=spawnSync('ffmpeg',['-y','-hide_banner','-loglevel','error','-framerate','10',
  '-i',dir+'/frame-%02d.png','-vf','pad=ceil(iw/2)*2:ceil(ih/2)*2',
  '-c:v','libx264','-preset','veryfast','-crf','27','-pix_fmt','yuv420p',
  dir+'/combat-frames.mp4'],{timeout:75000,encoding:'utf8'});
 if(a.status!==0){return {ok:false,error:JSON.stringify({status:a.status,error:String(a.error||''),stderr:(a.stderr||'').slice(0,400)})}}
 const bytes=fs.statSync(dir+'/combat-frames.mp4').size;
 if(bytes<1500)return {ok:false,error:'encoded video too small'};
 for(const f of frames)fs.unlinkSync(f);
 return {ok:true,bytes};
}
async function inspectRuntime(id){
 return page.evaluate(async(targetId)=>{
  const dir=([...document.querySelectorAll('script[type="module"][src]')]
   .map(x=>x.src).find(x=>/\/src-[\w-]+\/main\.js(?:\?|$)/.test(x))||'')
   .match(/\/(src-[\w-]+)\/main\.js/)?.[1];
  if(!dir)return {available:false,reason:'public game module prefix absent'};
  window.__reaSourceDir=dir;
  const mod=await import('/'+dir+'/luchador.js');
  const entry=mod.Luchador;
  if(!entry)return {available:false,reason:'Luchador export absent',exports:Object.keys(mod)};
  window.__reaTargetId=targetId;
  window.__reaPlayers={};
  window.__reaPlayerById={};
  const prototypes=Object.getOwnPropertyNames(entry.prototype).filter(k=>typeof Object.getOwnPropertyDescriptor(entry.prototype,k)?.value==='function');
  const hooks=[];
  if(!window.__reaEvolutionHook){
   for(const name of ['update','updateTitere','actualizar','actualizarTitere','actualizarGraficos','kitActual','ganarExp','animar','intentar','actualizarGrafico']){
    const old=Object.getOwnPropertyDescriptor(entry.prototype,name)?.value;
    if(typeof old!=='function')continue;
    entry.prototype[name]=function(...args){
      const id=this.def?.id,side=this.lado;
      if(id){
       window.__reaPlayerById[id]=this;
       if(Number.isInteger(side))window.__reaPlayers[side]=this;
      }
      return old.apply(this,args);
    };
    hooks.push(name);
   }
   window.__reaEvolutionHook={hooks,prototypes};
  }
  return {available:true,installedHooks:window.__reaEvolutionHook?.hooks||hooks,methodNames:prototypes};
 },id);
}
async function launchMatch(i){
 await page.goto(SITE,{waitUntil:'domcontentloaded',timeout:55000});
 await wait(8400);
 const hook=await inspectRuntime(roster[i]?.id);
 if(!hook.available)throw Error('Failed to install read-only fighter hook '+JSON.stringify(hook));
 await page.mouse.click(390,183);await wait(2150);
 await page.mouse.click(390,282);await wait(2700);
 const p=profileSelect(i);await page.mouse.click(...p);await wait(300);
 await page.mouse.click(550,243);await wait(250);
 await page.mouse.click(669,78);await wait(280);
 await page.mouse.click(181,385);await wait(350);
 await page.mouse.click(684,393);await wait(3600);
 try{
  await page.waitForFunction(()=>!!window.__reaPlayerById?.[window.__reaTargetId],null,{timeout:14000,polling:200});
 }catch(e){
  const snap=await page.evaluate(()=>({target:window.__reaTargetId,
    players:Object.entries(window.__reaPlayerById||{}).map(([k,p])=>({id:k,side:p.lado,stage:p.etapa})),
    hooks:window.__reaEvolutionHook,body:document.body?.innerText?.slice(0,250),
    canvasCount:document.querySelectorAll('canvas').length}));
  await page.screenshot({path:ROOT+'/'+String(i).padStart(2,'0')+'-hook-failure.png'});
  throw Error('Fighter capture timed out: '+JSON.stringify(snap));
 }
 const info=await page.evaluate(()=>{const a=window.__reaPlayerById?.[window.__reaTargetId];return a?{
  id:a.def?.id,stage:a.etapa,total:a.etapasTotales,mega:a.mega,
  hp:a.hp,actualKit:Object.fromEntries(Object.entries(a.kitActual()).map(([k,m])=>[k,m?.nombre||k]))
 }:null});
 if(info?.id!==roster[i]?.id)throw Error('Wrong player in fight: '+JSON.stringify(info)+' expected '+roster[i]?.id);
 return info;
}
async function progressTo(stage,mega=false){
 const info=await page.evaluate(async(target)=>{
  const l=window.__reaPlayerById?.[window.__reaTargetId];
  if(!l)return {ok:false,reason:'no local controlled player'};
  const {evolucionar,megaevolucionar}=await import('/'+window.__reaSourceDir+'/habilidades.js');
  const targetStage=target.stage;
  if(l.etapa<targetStage){
   const before=l.etapa;
   // Only local browser Training. Trigger same game-owned evolve transition
   // that a user reaches by winning XP and pressing mega/evolve.
   l.ganarExp(l.expNecesaria+10);
   const could=l.puedeEvolucionar;
   if(could)evolucionar(l);
   return {pending:could,stageBefore:before,experience:l.exp,required:l.expNecesaria};
  }
  if(target.mega&&l.forma?.mega&&!l.mega){
   l.ulti=100;
   megaevolucionar(l);
   return {pendingMega:true,stageBefore:l.etapa};
  }
  return {noChange:true,stageBefore:l.etapa};
 },{stage,mega});
 if(info?.pending)await wait(1800);
 if(info?.pendingMega)await wait(1200);
 const actual=await page.evaluate(()=>{const l=window.__reaPlayerById?.[window.__reaTargetId];return l?{
  name:l.nombre,id:l.def.id,stage:l.etapa,total:l.etapasTotales,mega:!!l.mega,
  kit:Object.fromEntries(Object.entries(l.kitActual()).map(([k,m])=>[k,{
   name:m?.nombre||k,sprite:m?.hoja||null,shape:m?.forma||null}]))
 }:null});
 const ok=actual?.stage===stage&&(!mega||actual.mega===true);
 result.evolutions.push({pokemon:roster.find(x=>x.id===actual?.id)?.nombre||'',target:stage,mega,attempt:info,actual,ok});
 save();
 return {ok,actual,info};
}
async function captureOne(i,stage,mega,slot,known){
 const mon=roster[i];
 const move=known.actual?.kit?.[slot]||deriveMove(mon,stage,slot,mega);
 const name=move.name||move.nombre||slot;
 const tag=mega?'mega':'stage'+stage,folder=ROOT+'/'+String(i).padStart(2,'0')+'-'+safe(mon.nombre)+'/'+tag+'/'+slot+'-'+safe(name);
 fs.mkdirSync(folder,{recursive:true});
 const shot=async f=>page.screenshot({path:f,timeout:16000});
 await page.evaluate((slot)=>{
  const l=window.__reaPlayerById?.[window.__reaTargetId];
  if(l){
    l.hp=l.hpMax;l.energia=100;l.ulti=100;
    if(l.cd&&slot in l.cd)l.cd[slot]=0;
  }
 },slot);
 const before=await shot(folder+'/before.png');
 const keys=['left','right','Space','q','e'],key=keys[controlSlots.indexOf(slot)];
 await page.mouse.move(575,216);
 let down=false;
 const frames=[],timeline=[],diff=[];
 try{
  if(key==='left'||key==='right')await page.mouse.down({button:key});
  else await page.keyboard.down(key);
  down=true;
  const t=Date.now();
  for(let frame=0;frame<25;frame++){
   const file=folder+'/frame-'+String(frame).padStart(2,'0')+'.png';
   const data=await shot(file);
   frames.push(file);timeline.push(Date.now()-t);
   diff.push(changed(before,data));
   await wait(70);
  }
 }finally{
  if(down){
   if(key==='left'||key==='right')await page.mouse.up({button:key});
   else await page.keyboard.up(key);
  }
 }
 try{contact(folder,frames)}catch(e){result.errors.push({i,stage,slot,contact:String(e).slice(0,120)})}
 const enc=mp4(folder,frames);
 const actual=await page.evaluate(()=>{const l=window.__reaPlayerById?.[window.__reaTargetId];return l?{
   stage:l.etapa,mega:!!l.mega,name:l.nombre,
   energy:l.energia,ulti:l.ulti,cooldown:l.cd||{}
 }:null});
 const entry={index:i,pokemon:mon.nombre,evolvedName:known.actual?.name,stage,mega,slot,moveName:name,
  skillConfig:move,stageAtCast:known.actual?.stage,stageAfterCast:actual?.stage,
  megaAtCast:known.actual?.mega,framesCaptured:25,
  changedFrames:diff.filter(x=>x!==null&&x>.013).length,
  video:enc.ok?folder+'/combat-frames.mp4':null,
  videoError:enc.ok?null:enc.error,
  contact:folder+'/contact-sheet.png',
  elapsedMs:timeline,visualChange:diff,
  status:enc.ok?'captured_real_screen_unverified_cast':'raw_frames_saved_encoder_failed'};
 result.captures.push(entry);save();
 console.log('CAPTURE',JSON.stringify({index:i,stage,mega,slot,move:name,video:enc.ok,changed:entry.changedFrames}));
}
(async()=>{
 browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 ctx=await browser.newContext({viewport:{width:780,height:437}});
 await ctx.addInitScript(()=>{
  if(location.host==='www.pokearena2d.com')localStorage.setItem('pa-liga',
   JSON.stringify({v:1,vencidos:{},legado:true,visto:true}));
 });
 page=await ctx.newPage();
 let meta;
 for(let attempt=1;attempt<=5;attempt++){
  try{
   await page.goto(SITE,{waitUntil:'domcontentloaded',timeout:50000});
   await wait(8500);
   meta=await page.evaluate(async()=>{
    const dir=([...document.querySelectorAll('script[type="module"][src]')]
     .map(x=>x.src).find(x=>/\/src-[\w-]+\/main\.js(?:\?|$)/.test(x))||'')
     .match(/\/(src-[\w-]+)\/main\.js/)?.[1];
    if(!dir)throw Error('Active Poké Arena script bundle path not found');
    const d=await import('/'+dir+'/datos.js');
    const l=await import('/'+dir+'/liga.js');
    return {activeBundle:dir,unlocked:l.resumen(),roster:d.ROSTER.map((p,i)=>({
     index:i,id:p.id,nombre:p.nombre,
     kit:p.kit,evoluciones:p.evoluciones||[],
     stages:1+(p.evoluciones?.length||0),
     megaForms:p.evoluciones?.filter(x=>x.mega).map(x=>x.mega.nombre)||[]
    }))};
   });
   break;
  }catch(error){
   result.errors.push({sourceAttempt:attempt,recoverable:true,error:String(error).slice(0,230)});
   if(attempt===5)throw error;
   await wait(3200);
  }
 }
 if(meta.unlocked?.desbloqueados!==26)throw Error('Local offline roster did not unlock 26/26');
 roster=meta.roster;
 result.activeBundle=meta.activeBundle;
 result.catalog=roster.map((p,i)=>({index:i,id:p.id,name:p.nombre,stages:p.stages,
   moves:Array.from({length:p.stages},(_,stage)=>({
    stage,form:stage===0?p.nombre:p.evoluciones[stage-1].nombre,
    moves:Object.fromEntries(controlSlots.map(k=>[k,deriveMove(p,stage,k)]))
   })),mega:p.megaForms}));
 save();
 for(const i of indices){
  try{
   const base=await launchMatch(i);
   result.evolutions.push({index:i,target:0,ok:base?.stage===0,actual:base});
   for(let stage=0;stage<roster[i].stages;stage++){
    let state=await progressTo(stage,false);
    if(!state.ok){
     result.errors.push({index:i,stage,reason:'evolution-not-verified',observed:state});
     save();continue;
    }
    for(const slot of controlSlots){
     try{await captureOne(i,stage,false,slot,state)}
     catch(e){result.errors.push({index:i,stage,slot,error:String(e.stack||e).slice(0,500)});save()}
    }
   }
   const mega=roster[i].evoluciones?.at(-1)?.mega;
   if(mega){
    const stage=roster[i].stages-1,st=await progressTo(stage,true);
    if(st.ok){
     for(const slot of controlSlots)try{await captureOne(i,stage,true,slot,st)}
      catch(e){result.errors.push({index:i,stage,mega:true,slot,error:String(e.stack||e).slice(0,300)});save()}
    }else{result.errors.push({index:i,mega:true,reason:'mega-not-verified',observed:st});save()}
   }
  }catch(e){result.errors.push({index:i,error:String(e.stack||e).slice(0,650)});save()}
 }
})().catch(e=>{result.errors.push({fatal:String(e.stack||e).slice(0,700)})}).finally(async()=>{
 await browser?.close();result.completedAt=new Date().toISOString();
 result.validation.stageVerifiedForEveryVideo=result.captures.length>0&&result.captures.every(x=>x.stageAtCast===x.stage&&(!x.mega||x.megaAtCast));
 save();
 console.log('FINAL',JSON.stringify({group,result:{captures:result.captures.length,
  expected:indices.length*15,videoCount:result.captures.filter(x=>x.video).length,
  evolvedCaptures:result.captures.filter(x=>x.stage>0).length,
  megaCaptures:result.captures.filter(x=>x.mega).length,
  verifiedStages:result.validation.stageVerifiedForEveryVideo,errors:result.errors}}));
 if(result.captures.length===0)process.exitCode=1;
});
