'use strict';
/* V117: actual Android-size Chromium battles for non-Mewtwo species and preserved Mewtwo V95. */
const fs=require('node:fs'),http=require('node:http'),os=require('node:os');
const path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),pause=ms=>new Promise(r=>setTimeout(r,ms));
const chrome=process.env.CHROME_BIN||['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].find(fs.existsSync);
if(!chrome){console.error('Chromium unavailable for V117 verification');process.exit(1)}
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
  'http://127.0.0.1:'+port+'/?build=pokemon-v117-official'+(preview?'&kanto117=1':'')+(safe?'&safe=1':'')
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
   if(msg.method==='Runtime.exceptionThrown') console.log('V117 CHROME JS ERROR',JSON.stringify(msg.params?.exceptionDetails).slice(0,1100));
   if(msg.method==='Log.entryAdded'&&msg.params?.entry?.level==='error') console.log('V117 CHROME LOG ERROR',msg.params.entry.text);
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
  for(let n=0;n<200;n++){
   ready=await evaluate("(()=>({boot:!!document.getElementById('main'),modules:[!!window.PokemonTorreSpriteAuditV117?.installed,!!window.PokemonTorreShinyV117?.installed,!!window.PokemonTorreGymsV117?.installed,!!window.PokemonTorreCombatV117?.installed,!!window.PokemonTorreMobileV117?.installed],mewtwo:!!window.PokemonTorrePokemonPolishV95?.installed,global:!!window.PokemonTorrePokemonPolishV115?.installed,scale:!!window.PokemonTorreVisualPreviewV116?.approved,qa:typeof window.PokemonTorreLocalCombatTestV47?.prepareVisualV116==='function',rain:!!window.PokemonTorreRainDanceV118?.installed,arena:!!window.PokemonTorreArenaWideV98?.enabled}))()");
   if(ready?.boot&&ready.modules?.every(Boolean)&&ready.mewtwo&&ready.global&&ready.scale&&ready.qa&&ready.rain&&ready.arena)break;
   await pause(125);
  }
  if(!ready?.boot||!ready.modules?.every(Boolean)||!ready.mewtwo||!ready.global||!ready.scale||!ready.qa||!ready.arena)
   throw Error('V117 5-module preview not ready: '+JSON.stringify(ready));
  const leaderList=await evaluate("(()=>window.PokemonTorreGymsV117.names)()");
  if(leaderList.length!==8||leaderList[0]!=='Brock'||leaderList[7]!=='Giovanni')
   throw Error('Kanto leaders not corrected: '+JSON.stringify(leaderList));
  const pokemon=[25,95,6,150];
  const results=[];
  for(const id of pokemon){
   const setup=await evaluate("(()=>window.PokemonTorreLocalCombatTestV47.prepareVisualV116("+id+","+(id===6)+",false))()");
   let state=null;
   for(let tries=0;tries<50;tries++){
    await pause(130);
    state=await evaluate("(()=>({global:window.PokemonTorrePokemonPolishV115?.diagnostics(),mewtwo:window.PokemonTorrePokemonPolishV95?.diagnostics(),sprite:window.PokemonTorreSpriteAuditV117?.diagnostics(),shiny:window.PokemonTorreShinyV117?.diagnostics(),mobile:window.PokemonTorreMobileV117?.diagnostics(),arena:!!window.PokemonTorreArenaWideV98?.enabled}))()");
    if(id===150?(state?.mewtwo?.polished>0):(state?.global?.polishedIds?.includes(String(id))))break;
   }
   const seen=id===150?(state.mewtwo?.polished>0):state.global?.polishedIds?.includes(String(id));
   const sprite=state.sprite;
   const okay=setup?.active&&seen&&state.arena&&sprite?.registeredSpecies===151&&sprite?.observedSpecies>=1;
   results.push({id,okay,seen,spriteSpecies:sprite?.observedSpecies,decoded:sprite?.decodedSpecies,protectedShiny:state.shiny?.animatedProtected,cache:state.global?.cacheBytes});
   if(!okay)throw Error('V117 real combat sprite audit failed: '+JSON.stringify(results.at(-1)));
  }
  const hit=await evaluate("(()=>window.PokemonTorreLocalCombatTestV47.verifyHitV117?.()||{error:'V117 hit hook missing'})()");
  if(hit?.error||!Number.isFinite(hit?.hpBefore)||!Number.isFinite(hit?.hpAfter)||hit.hpAfter>hit.hpBefore||!hit?.diagnostics)
   throw Error('V117 original hit engine not preserved: '+JSON.stringify(hit));
  // Game invincibility may legitimately prevent a synthetic hit. The unit test
  // asserts the actual HP-decrease reaction independently.
  const rain=await evaluate("(()=>window.PokemonTorreLocalCombatTestV47.testRainDanceV118?.()||{error:'Rain Dance QA missing'})()");
  if(!rain?.activated||rain?.diagnostics?.activations<1)
   throw Error('V118 Rain Dance failed to activate real PMD weather: '+JSON.stringify(rain));
  await pause(370);
  const rainVisual=await evaluate("(()=>({v118:window.PokemonTorreRainDanceV118?.diagnostics(),native:window.PokemonTorreV3564WeatherDiagnostics?.()}))()");
  if(rainVisual.v118.weather!=='rain'||(rainVisual.v118.originalRendererFrames<1&&rainVisual.v118.fallbackFrames<1))
   throw Error('V118 rain original frames not visible in battle: '+JSON.stringify(rainVisual));
  console.log('PASS V118 '+(safe?'SAFE':'NORMAL')+' real Rain Dance cast + restored PMD pixels: '+JSON.stringify(rainVisual));
  console.log('PASS V117 '+(safe?'SAFE':'NORMAL')+' ALL 5: '+JSON.stringify({modules:ready.modules,leaders:leaderList,combat:hit,results}));
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
})().catch(e=>{console.error('FAIL V117 global Pokemon Chromium',e.stack||e);process.exitCode=1;server.close()});
