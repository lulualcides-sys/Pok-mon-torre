'use strict';
/* V121: actual Android-size Chromium battles for non-Mewtwo species and preserved Mewtwo V95. */
const fs=require('node:fs'),http=require('node:http'),os=require('node:os');
const path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),pause=ms=>new Promise(r=>setTimeout(r,ms));
const chrome=process.env.CHROME_BIN||['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].find(fs.existsSync);
if(!chrome){console.error('Chromium unavailable for V121 verification');process.exit(1)}
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
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'poke-pokemon-v121-'));
 const proc=cp.spawn(chrome,[
  '--headless=new','--no-sandbox',
  '--disable-gpu',
  '--disable-dev-shm-usage',
  '--disable-background-networking','--disable-extensions',
  '--no-first-run','--no-default-browser-check','--remote-allow-origins=*',
  '--remote-debugging-port=0','--window-size=440,940',
  '--user-agent=Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
  '--user-data-dir='+tmp,
  'http://127.0.0.1:'+port+'/?build=fighting-enemy-v121'+(safe?'&safe=1':'')
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
   if(msg.method==='Runtime.exceptionThrown') console.log('V121 CHROME JS ERROR',JSON.stringify(msg.params?.exceptionDetails).slice(0,1100));
   if(msg.method==='Log.entryAdded'&&msg.params?.entry?.level==='error') console.log('V121 CHROME LOG ERROR',msg.params.entry.text);
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
   ready=await evaluate("(()=>({api:window.PokemonTorreEnemyFightingV121?.installed,qa:typeof window.PokemonTorreLocalCombatTestV47?.start==='function',boot:!!document.getElementById('main')}))()");
   if(ready?.api&&ready?.qa&&ready?.boot)break;
   await pause(150);
  }
  if(!ready?.api||!ready?.qa||!ready?.boot)
   throw Error('V121 contact AI or localhost battle tester unavailable: '+JSON.stringify(ready));
  const before=await evaluate("(()=>window.PokemonTorreEnemyFightingV121.diagnostics())()");
  const results=[];
  for(const id of [68,106,107]){
   const start=await evaluate("(()=>{const qa=window.PokemonTorreLocalCombatTestV47;return qa.start(3,"+id+")})()");
   let m=null,arrived=false;
   const prior=await evaluate("(()=>window.PokemonTorreEnemyFightingV121.diagnostics())()");
   for(let i=0;i<125;i++){
    await pause(140);
    m=await evaluate("(()=>window.PokemonTorreEnemyFightingV121?.diagnostics())()");
    if(m?.hits>prior.hits){arrived=true;break}
   }
   const ok=!!start&&arrived&&m.approaches>prior.approaches&&m.attempts>prior.attempts;
   const v={id,ok,approaches:m?.approaches-prior.approaches,attempts:m?.attempts-prior.attempts,
    hits:m?.hits-prior.hits,misses:m?.misses-prior.misses,suppressed:m?.suppressedRanged,
    last:m?.last};
   results.push(v);
   if(!ok)throw Error('V121 fighting Pokemon did not reach and hit player: '+JSON.stringify(v));
  }
  const prior=await evaluate("(()=>window.PokemonTorreEnemyFightingV121.diagnostics())()");
  await evaluate("(()=>window.PokemonTorreLocalCombatTestV47.start(3,131))()");
  await pause(1100);
  const non=await evaluate("(()=>window.PokemonTorreEnemyFightingV121.diagnostics())()");
  if(non.attempts>prior.attempts)
   throw Error('V121 changed non-fighting Pokemon ranged attacks: '+JSON.stringify(non));
  console.log('PASS V121 '+(safe?'SAFE':'NORMAL')+' REAL FIGHTING ATTACKS: '+JSON.stringify(results));
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
