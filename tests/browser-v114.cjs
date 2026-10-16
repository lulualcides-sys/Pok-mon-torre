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
async function test(port,safe,preview){
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
  'http://127.0.0.1:'+port+'/?build=v114-ground-preview'+(preview?'&battle_preview=poison114':'')+(safe?'&safe=1':'')
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
  for(let n=0;n<150;n++){
   ready=await evaluate("(()=>({boot:!!document.getElementById('main'),preview:window.PokemonTorrePoisonPreviewV114?.diagnostics()?.version,ready:window.PokemonTorrePoisonPreviewV114?.diagnostics()?.ready?.length,qa:typeof window.PokemonTorreLocalCombatTestV47?.castPoisonPreviewV114==='function',arena:!!window.PokemonTorreArenaWideV98?.enabled}))()");
   if(ready?.boot&&ready.preview==='114.0'&&ready.ready===(preview?4:3)&&ready.qa&&ready.arena)break;
   await pause(170);
  }
  if(!ready?.qa||ready?.ready!==(preview?4:3)||!ready?.arena)
   throw Error('V114 pixel sprite preview not ready: '+JSON.stringify(ready));
  const names=['Névoa Venenosa','Poison Jab','Ácido','Lama Corrosiva'];
  for(let i=0;i<(preview?4:3);i++){
   let ok=false,report=null;
   for(let attempt=1;attempt<=3;attempt++){
    const before=await evaluate("(()=>window.PokemonTorreLocalCombatTestV47.castPoisonPreviewV114("+i+"))()");
    await pause(1800);
    const after=await evaluate("(()=>window.PokemonTorreLocalCombatTestV47.poisonPreviewStateV114())()");
    const fx=after.preview||{},hit=Number(after.hp)<Number(before.hpBefore);
    const rendered=fx.draws>0&&fx.last?.name===names[i];
    const smooth=Number(after.dpr)>0&&Number(after.dpr)<=1.3;
    ok=!!before.accepted&&hit&&rendered&&smooth&&after.canvasReady&&
      after.running&&after.safe===safe;
    report={ok,attempt,name:names[i],damage:before.hpBefore-after.hp,
     rendered,frame:fx.last?.frame,frames:fx.last?.total,painter:fx.last?.painter,approaches:fx.approaches,retreats:fx.retreats,
     ready:fx.ready?.length,ground:fx.last?.ground,x:fx.last?.x,y:fx.last?.y,height:fx.last?.height,width:fx.last?.width,groundY:after.groundY,errors:fx.errors,dpr:after.dpr,fps:after.fps};
    if(ok&&i===3)ok=fx.last?.ground===true&&fx.last.height<fx.last.width*.48&&Number.isFinite(fx.last.y);
    if(ok)break;
   }
   console.log('V114 POISON PREVIEW '+(safe?'SAFE':'NORMAL')+' '+JSON.stringify(report));
   if(!ok)throw Error('V114 Poison preview battle failed: '+names[i]);
  }
  console.log('PASS V114 preview: four Poison sprites in actual battle, native HP, normal/safe, V98');
 }finally{
  ws?.close();proc.kill('SIGKILL');
  await pause(120);
  fs.rmSync(tmp,{recursive:true,force:true,maxRetries:3,retryDelay:80});
 }
}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 try{const port=server.address().port;await test(port,false,false);await test(port,true,false);
   await test(port,false,true);await test(port,true,true)}
 finally{server.close()}
})().catch(e=>{console.error('FAIL V114 preview Chromium',e.stack||e);process.exitCode=1;server.close()});
