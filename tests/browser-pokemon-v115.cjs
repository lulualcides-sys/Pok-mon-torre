'use strict';
/* V115: actual Android-size Chromium battles for non-Mewtwo species and preserved Mewtwo V95. */
const fs=require('node:fs'),http=require('node:http'),os=require('node:os');
const path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),pause=ms=>new Promise(r=>setTimeout(r,ms));
const chrome=process.env.CHROME_BIN||['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].find(fs.existsSync);
if(!chrome){console.error('Chromium unavailable for V115 verification');process.exit(1)}
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
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'poke-pokemon-v115-'));
 const proc=cp.spawn(chrome,[
  '--headless=new','--no-sandbox',
  '--disable-gpu',
  '--disable-dev-shm-usage',
  '--disable-background-networking','--disable-extensions',
  '--no-first-run','--no-default-browser-check','--remote-allow-origins=*',
  '--remote-debugging-port=0','--window-size=440,940',
  '--user-agent=Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
  '--user-data-dir='+tmp,
  'http://127.0.0.1:'+port+'/?build=pokemon-v115-all'+(safe?'&safe=1':'')
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
   if(msg.method==='Runtime.exceptionThrown') console.log('V115 CHROME JS ERROR',JSON.stringify(msg.params?.exceptionDetails).slice(0,1100));
   if(msg.method==='Log.entryAdded'&&msg.params?.entry?.level==='error') console.log('V115 CHROME LOG ERROR',msg.params.entry.text);
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
  for(let n=0;n<180;n++){
   ready=await evaluate("(()=>({boot:!!document.getElementById('main'),scope:window.PokemonTorrePokemonPolishV115?.config?.scope,mewtwo:window.PokemonTorrePokemonPolishV95?.installed,qa:typeof window.PokemonTorreLocalCombatTestV47?.start==='function',arena:!!window.PokemonTorreArenaWideV98?.enabled}))()");
   if(ready?.boot&&ready?.scope==='all-existing-except-mewtwo-150'&&ready?.mewtwo&&ready?.qa&&ready?.arena)break;
   await pause(150);
  }
  if(!ready?.boot||ready?.scope!=='all-existing-except-mewtwo-150'||!ready.mewtwo||!ready.qa||!ready.arena)
   throw Error('V115 global visual pipeline not loaded: '+JSON.stringify(ready));
  const results=[];
  const mons=[1,25,6,131,150];
  for(const id of mons){
   const start=await evaluate("(()=>{const qa=window.PokemonTorreLocalCombatTestV47;qa.start("+id+",143);return {started:true}})()");
   let state=null;
   for(let attempt=0;attempt<25;attempt++){
    await pause(105);
    state=await evaluate("(()=>({v115:window.PokemonTorrePokemonPolishV115?.diagnostics(),v95:window.PokemonTorrePokemonPolishV95?.diagnostics(),active:!!document.querySelector('canvas'),safe:new URLSearchParams(location.search).get('safe')==='1'}))()");
    if(id===150?(state?.v95?.polished>0):(state?.v115?.polishedIds?.includes(String(id))))break;
   }
   const seen=id===150?(state?.v95?.polished>0):(state?.v115?.polishedIds?.includes(String(id)));
   const passed=!!start?.started&&seen&&state?.active&&state?.safe===safe
      &&state?.v115?.cacheBytes<=24*1024*1024&&state?.v115?.failed===0;
   results.push({id,ok:passed,visible:state?.active,processed:seen,mewtwoV95:state?.v95?.polished,
     visualFrames:state?.v115?.framesGenerated,polished:state?.v115?.polished,skipped:state?.v115?.skipped,draws:state?.v115?.draws,seen:state?.v115?.seenIds,polishedIds:state?.v115?.polishedIds,cacheBytes:state?.v115?.cacheBytes,
     cacheHit:state?.v115?.cacheHits,safe:state?.safe,error:state?.v115?.lastError});
   if(!passed)throw Error('V115 global pokemon visual in combat failed: '+JSON.stringify(results.at(-1)));
  }
  console.log('PASS V115 '+(safe?'SAFE':'NORMAL')+': '+JSON.stringify(results));
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
})().catch(e=>{console.error('FAIL V115 global Pokemon Chromium',e.stack||e);process.exitCode=1;server.close()});
