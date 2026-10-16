'use strict';
/* V105 focused REAL mobile Chromium: 6 physical Fighting casts, original HP,
 * nearest-neighbor pixel sprites, retreat, safe fallback. No costly full-suite
 * Python asset build or unrelated battles. */
const fs=require('node:fs'),http=require('node:http'),os=require('node:os');
const path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),pause=ms=>new Promise(r=>setTimeout(r,ms));
const chrome=process.env.CHROME_BIN||['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].find(fs.existsSync);
if(!chrome){console.error('Chromium unavailable for V105 verification');process.exit(1)}
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
async function test(port,safe){
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'poke-v105-'));
 const proc=cp.spawn(chrome,[
  '--headless=new','--no-sandbox',
  '--disable-gpu',
  '--disable-dev-shm-usage',
  '--disable-background-networking','--disable-extensions',
  '--no-first-run','--no-default-browser-check','--remote-allow-origins=*',
  '--remote-debugging-port=0','--window-size=440,940',
  '--user-agent=Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
  '--user-data-dir='+tmp,
  'http://127.0.0.1:'+port+'/?build=v109-contact-pixel'+(safe?'&safe=1':'')
 ],{stdio:'ignore'});
 let ws=null,seq=0,pending=new Map();
 try{
  const portFile=path.join(tmp,'DevToolsActivePort');let devport=0;
  for(let n=0;n<120;n++){
   if(fs.existsSync(portFile)){devport=Number(fs.readFileSync(portFile,'utf8').split('\n')[0]);break}
   if(proc.exitCode!==null)throw Error('Chrome exited '+proc.exitCode);
   await pause(120);
  }
  if(!devport)throw Error('Chromium CDP unavailable');
  let page=null;for(let n=0;n<60;n++){
   const pages=await getJson('http://127.0.0.1:'+devport+'/json/list').catch(()=>[]);
   page=pages.find(x=>x.type==='page'&&x.url.includes('127.0.0.1:'+port));
   if(page)break;await pause(100);
  }
  if(!page)throw Error('Chromium page never opened');
  ws=new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject});
  ws.onmessage=e=>{const msg=JSON.parse(e.data);
   if(msg.method==='Runtime.exceptionThrown') console.log('V105 CHROME JS ERROR',JSON.stringify(msg.params?.exceptionDetails).slice(0,1100));
   if(msg.method==='Log.entryAdded'&&msg.params?.entry?.level==='error') console.log('V105 CHROME LOG ERROR',msg.params.entry.text);
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
  for(let n=0;n<135;n++){
   ready=await evaluate("(()=>({boot:!!document.getElementById('main'),poison:window.PokemonTorrePoisonV111?.diagnostics()?.version,poisonReady:window.PokemonTorrePoisonV111?.diagnostics()?.ready?.length,perf:window.PokemonTorreMobilePerfV111?.diagnostics()?.version,qa:typeof window.PokemonTorreLocalCombatTestV47?.castPoisonV111==='function',arena:!!window.PokemonTorreArenaWideV98?.enabled}))()");
   if(ready?.boot&&ready.poison==='111.0'&&ready.poisonReady===4&&ready.perf==='111.0'&&ready.qa&&ready.arena)break;
   await pause(180);
  }
  if(!ready?.qa||ready?.poisonReady!==4||ready?.perf!=='111.0'||!ready.arena)
   throw Error('V111 Poison/FPS boot incomplete '+JSON.stringify(ready));
  const names=['Picada Tóxica','Picada Venenosa','Venoshock','Ferrão Venenoso'],
   slugs=['picadatoxica','picadavenenosa','venoshock','ferraovenenoso'];
  for(let i=0;i<4;i++){
   let ok=false,report=null;
   for(let attempt=1;attempt<=3;attempt++){
    const before=await evaluate("(()=>window.PokemonTorreLocalCombatTestV47.castPoisonV111("+i+"))()");
    await pause(1650);
    const after=await evaluate("(()=>window.PokemonTorreLocalCombatTestV47.poisonStateV111())()");
    const fx=after?.poison||{},perf=after?.perf||{};
    const drew=(fx.draws?.[slugs[i]]||0)>0,hit=Number(after.hp)<Number(before.hpBefore),
     smooth=Number(after.dpr)>0&&Number(after.dpr)<=1.3;
    ok=before.accepted&&hit&&drew&&smooth&&perf.hudRuns>0&&
      after.canvasReady&&after.running&&after.safe===safe;
    report={passed:ok,attempt,name:names[i],damage:before.hpBefore-after.hp,
     draws:fx.draws?.[slugs[i]]||0,ready:fx.ready?.length,dpr:after.dpr,
     fps:after.fps,hudRuns:perf.hudRuns,hudSkipped:perf.hudSkipped,
     arena:ready.arena,errors:fx.errors};
    if(ok)break;
   }
   console.log('V111 POISON '+(safe?'SAFE':'NORMAL')+' '+names[i]+' '+JSON.stringify(report));
   if(!ok)throw Error('V111 Poison animation or mobile FPS validation failed: '+names[i]);
  }
  console.log('PASS V111 POISON '+(safe?'SAFE':'NORMAL')+
   ': four native HP hits, distinct GBA sprite sequences, mobile DPR cap, HUD optimization');
 }finally{
  ws?.close();proc.kill('SIGKILL');
  await pause(120);
  fs.rmSync(tmp,{recursive:true,force:true,maxRetries:3,retryDelay:80});
 }
}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 try{const port=server.address().port;await test(port,false);await test(port,true)}
 finally{server.close()}
})().catch(e=>{console.error('FAIL V105 focused Chromium',e.stack||e);process.exitCode=1;server.close()});
