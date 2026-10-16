'use strict';
/* V117: actual Android-size Chromium battles for non-Mewtwo species and preserved Mewtwo V95. */
const fs=require('node:fs'),http=require('node:http'),os=require('node:os');
const path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),pause=ms=>new Promise(r=>setTimeout(r,ms));
const chrome=process.env.CHROME_BIN||['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].find(fs.existsSync);
if(!chrome){console.error('Chromium unavailable for V120 verification');process.exit(1)}
const mime={'.html':'text/html;charset=utf-8','.js':'application/javascript;charset=utf-8',
 '.json':'application/json;charset=utf-8','.txt':'text/plain;charset=utf-8',
 '.webp':'image/webp','.png':'image/png','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp'};
const server=http.createServer((req,res)=>{
 try{const p=decodeURIComponent(new URL(req.url,'http://local').pathname);
  const file=path.resolve(root,'.'+(p==='/'?'/index.html':p));
  if(!file.startsWith(root+path.sep))throw Error('path outside root');
  const bytes=fs.readFileSync(file);
  res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream',
   'cache-control':'no-store'});res.end(bytes);
 }catch(e){res.writeHead(404);res.end('Not found')}
});
const getJson=url=>new Promise((resolve,reject)=>{
 http.get(url,r=>{let txt='';r.on('data',d=>txt+=d);r.on('end',()=>{
  try{resolve(JSON.parse(txt))}catch(e){reject(e)}
 })}).on('error',reject);
});
async function test(port,safe,preview){
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'poke-pokemon-v117-'));
 const proc=cp.spawn(chrome,[
  '--headless=new','--no-sandbox',
  '--disable-gpu',
  '--disable-dev-shm-usage',
  '--disable-background-networking','--disable-extensions',
  '--no-first-run','--no-default-browser-check','--remote-allow-origins=*',
  '--remote-debugging-port=0','--window-size=440,940',
  '--user-agent=Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
  '--user-data-dir='+tmp,
  'http://127.0.0.1:'+port+'/?build=pokemon-v119-all-eight&kanto119=1'+(safe?'&safe=1':'')
 ],{stdio:'ignore'});
 let ws=null,seq=0,pending=new Map();
 try{
  const portFile=path.join(tmp,'DevToolsActivePort');let devport=0;
  for(let n=0;n<260;n++){
   if(fs.existsSync(portFile)){devport=Number(fs.readFileSync(portFile,'utf8').split('\n')[0]);break}
   if(proc.exitCode!==null)throw Error('Chrome exited '+proc.exitCode);
   await pause(120);
  }
  if(!devport)throw Error('Chromium CDP unavailable');
  let page=null;for(let n=0;n<120;n++){
   const pages=await getJson('http://127.0.0.1:'+devport+'/json/list').catch(()=>[]);
   page=pages.find(x=>x.type==='page'&&x.url.includes('127.0.0.1:'+port));
   if(page)break;await pause(100);
  }
  if(!page)throw Error('Chromium page never opened');
  ws=new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject});
  ws.onmessage=e=>{const msg=JSON.parse(e.data);
   if(msg.method==='Runtime.exceptionThrown') console.log('V120 CHROME JS ERROR',JSON.stringify(msg.params?.exceptionDetails).slice(0,1100));
   if(msg.method==='Log.entryAdded'&&msg.params?.entry?.level==='error') console.log('V120 CHROME LOG ERROR',msg.params.entry.text);
   if(pending.has(msg.id)){
    const fn=pending.get(msg.id);pending.delete(msg.id);fn(msg);
  }};
  const send=(method,params={})=>new Promise((resolve,reject)=>{
   const id=++seq;pending.set(id,resolve);
   try{ws.send(JSON.stringify({id,method,params}))}catch(e){reject(e)}
  });
  await send('Runtime.enable');
  const evaluate=async expr=>{
   const x=await send('Runtime.evaluate',{expression:expr,returnByValue:true});
   if(x.result?.exceptionDetails)throw Error(x.result.exceptionDetails.text||x.result.exceptionDetails.exception?.description);
   return x.result?.result?.value;
  };
  let ready=null;
  for(let n=0;n<160;n++){
   ready=await evaluate("(()=>({boot:!!document.getElementById('main'),layout:!!window.PokemonTorreBattleLayoutV120?.installed,qa:typeof window.PokemonTorreLocalCombatTestV47?.prepareVisualV116==='function',v119:!!window.PokemonTorreEnemyShinyV119?.installed}))()");
   if(ready?.boot&&ready?.layout&&ready?.qa&&ready?.v119)break;
   await pause(120);
  }
  if(!ready?.layout||!ready?.qa||!ready?.v119)throw Error('V120 battle layout not installed: '+JSON.stringify(ready));
  const started=await evaluate("(()=>window.PokemonTorreLocalCombatTestV47.prepareVisualV116(25,false,false))()");
  if(!started?.active)throw Error('V120 real battle could not start');
  await pause(320);
  const visual=await evaluate("(()=>{const modal=document.querySelector('#modal.combatModal'),arena=modal?.querySelector('#arenaPro'),heading=modal?.querySelector('.battleHeading');if(!modal||!arena||!heading)return {error:'Missing actual combat DOM'};const existing=heading.querySelector('[data-v117-leader]');const fake=document.createElement('aside');fake.dataset.v117Leader='yes';fake.textContent='DUPLICATE BLAINE PANEL';heading.append(fake);let phase=arena.querySelector('#v30BossPhase');if(!phase){phase=document.createElement('div');phase.id='v30BossPhase';arena.append(phase);}phase.textContent='👑 Blaine · FASE 2/4 · Estratégia adaptativa';let terrain=arena.querySelector('#v33TerrainTag');if(!terrain){terrain=document.createElement('span');terrain.id='v33TerrainTag';arena.append(terrain);}terrain.textContent='🏟️ Arena';window.PokemonTorreBattleLayoutV120.refresh();const chip=heading.querySelector('.v120BossPhase'),save=document.querySelector('#ptWebSave'),hud=arena.querySelector('.hudPro.ally'),styles=getComputedStyle(arena),mobile=getComputedStyle(save);return {existing:!!existing,duplicateRemoved:!fake.isConnected,phase:chip?.textContent,giantBossHidden:getComputedStyle(phase).display==='none',saveHidden:mobile.display==='none',arenaHeight:arena.getBoundingClientRect().height,viewport:innerHeight,modalWidth:modal.getBoundingClientRect().width,viewportWidth:innerWidth,hudWidth:hud?.getBoundingClientRect().width,terrainHidden:getComputedStyle(terrain).display==='none',battleActive:true}})()");
  if(visual?.error||!visual.duplicateRemoved||visual.phase!=='FASE 2/4'||!visual.giantBossHidden||!visual.saveHidden||!visual.terrainHidden||
     visual.arenaHeight>450||visual.modalWidth>visual.viewportWidth+1)
   throw Error('V120 screenshot issues remain: '+JSON.stringify(visual));
  const phaseUpdate=await evaluate("(()=>{const phase=document.querySelector('#v30BossPhase');phase.textContent='👑 Blaine · FASE 3/4 · Estratégia adaptativa';window.PokemonTorreBattleLayoutV120.refresh();return document.querySelector('.v120BossPhase')?.textContent})()");
  if(phaseUpdate!=='FASE 3/4')throw Error('V120 phase did not update');
  console.log('PASS V120 '+(safe?'SAFE':'NORMAL')+' visual repair in real Android-size battle: '+JSON.stringify(visual));
 }finally{
  ws?.close();proc.kill('SIGKILL');
  await pause(120);
  fs.rmSync(tmp,{recursive:true,force:true,maxRetries:3,retryDelay:80});
 }
}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 try{
  const port=server.address().port;
  async function check(safe,preview=false){
   for(let attempt=1;attempt<=3;attempt++){
    try{return await test(port,safe,preview)}
    catch(error){
     if(!/Chromium CDP unavailable|Chromium page never opened|Chrome exited/i.test(String(error))||attempt===3)throw error;
     console.warn('V118 CI Chromium startup transient, retry '+attempt,String(error));
     await pause(1400);
    }
   }
  }
  await check(false);
  await check(true);
 }
 finally{server.close()}
})().catch(e=>{console.error('FAIL V119 all-eight mobile Chromium',e.stack||e);process.exitCode=1;server.close()});
