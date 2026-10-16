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
 '.png':'image/png','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp'};
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
  '--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
  '--disable-background-networking','--disable-extensions',
  '--no-first-run','--no-default-browser-check','--remote-allow-origins=*',
  '--remote-debugging-port=0','--window-size=440,940',
  '--user-agent=Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
  '--user-data-dir='+tmp,
  'http://127.0.0.1:'+port+'/?build=v105-mobile-ink'+(safe?'&safe=1':'')
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
  ws.onmessage=e=>{const msg=JSON.parse(e.data);if(pending.has(msg.id)){
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
  let ready=null;for(let n=0;n<120;n++){
   ready=await evaluate("(()=>({boot:!!document.getElementById('main'),v104:window.PokemonTorreFightingV104?.diagnostics()?.version,ink:window.PokemonTorreFightingInkV105?.diagnostics()?.version,qa:typeof window.PokemonTorreLocalCombatTestV47?.castFightingV104==='function',arena:!!window.PokemonTorreArenaWideV98?.enabled}))()");
   if(ready?.boot&&ready.v104==='104.0'&&ready.ink==='105.0'&&ready.qa&&ready.arena)break;
   await pause(180);
  }
  if(!ready?.qa||ready.ink!=='105.0'||!ready.arena)throw Error('V105 boot incomplete '+JSON.stringify(ready));
  const names=['Chute','Golpe de Karatê','Cross Chop','Brick Break','Soco Dinâmico','Aura Sphere'];
  const styles=['kick','karate','cross','brick','punch','aura'];
  let successes=0;
  for(let i=0;i<names.length;i++){
   const before=await evaluate('(()=>window.PokemonTorreLocalCombatTestV47.castFightingV104('+i+',true))()');
   await pause(2000);
   const after=await evaluate("(()=>window.PokemonTorreLocalCombatTestV47.fightingStateV104())()");
   const ink=after?.pixel||{},fx=after?.fx||{},n=names[i].normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
   const ok=before?.accepted&&before?.afterInputEnergy===100&&
     before?.initialGap>after.h*.45&&after.hp<before.hpBefore&&
     after.safe===safe&&after.canvasReady&&after.running&&
     fx.approaches>=i+1&&fx.contact>=i+1&&fx.retreats>=i+1&&
     (fx.draws?.[n]||0)>0&&(ink.perStyle?.[styles[i]]||0)>0&&ink.frames>=8;
   console.log('V105 '+(safe?'SAFE':'NORMAL')+' '+names[i]+' '+JSON.stringify({
    passed:!!ok,damage:before?.hpBefore-after?.hp,inkDraws:ink.perStyle?.[styles[i]],
    approach:fx.approaches,retreat:fx.retreats,pixelTiles:ink.frames}));
   if(!ok)throw Error('V105 real contact smoke failed: '+names[i]);
   successes++;
  }
  const final=await evaluate("(()=>window.PokemonTorreFightingInkV105.diagnostics())()");
  const expected=[['kick',8],['karate',12],['cross',16],['brick',16]];
  for(const [style,frames] of expected){
   const sp=final.unique?.find(x=>x.style===style);
   if(!sp||sp.frames!==frames||sp.painted<100)throw Error('Pixel atlas not authored for '+style);
  }
  if(new Set(final.unique.map(x=>x.checksum)).size<5)throw Error('Generic duplicate cartoon art');
  console.log('PASS V105 REAL ANDROID '+(safe?'SAFE':'NORMAL')+
   ': '+successes+' melee hits, sprite frames, physical recoil, distinct pixel art');
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
