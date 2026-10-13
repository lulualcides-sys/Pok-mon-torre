'use strict';
// Real Chromium startup regression: validates that the game renders, not just compiles.
const fs=require('node:fs'),http=require('node:http'),os=require('node:os');
const path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),sleep=ms=>new Promise(r=>setTimeout(r,ms));
const mime={'.html':'text/html;charset=utf-8','.js':'application/javascript;charset=utf-8',
 '.json':'application/json;charset=utf-8','.txt':'text/plain;charset=utf-8',
 '.svg':'image/svg+xml','.css':'text/css','.png':'image/png','.gif':'image/gif'};
const server=http.createServer((req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://local').pathname);
  // Regression: a missing optional V47 electric script MUST recover to safe=1.
  if((req.headers.referer||'').includes('electricFail=1')&&
     pathname.endsWith('/electric-sprite-kit.js'))throw Error('Simulated electric module load failure');
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+path.sep))throw Error('Invalid path');
  const bytes=fs.readFileSync(file);
  res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream','cache-control':'no-store'});
  res.end(bytes);
 }catch(err){if(!res.headersSent)res.writeHead(404);res.end(String(err));}
});
const get=url=>new Promise((resolve,reject)=>{
 http.get(url,res=>{let data='';res.on('data',d=>data+=d);
  res.on('end',()=>{try{resolve(JSON.parse(data))}catch(e){reject(e)}})
 }).on('error',reject);
});
const chrome=process.env.CHROME_BIN||[
 '/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium',
 '/usr/bin/chromium-browser'
].find(x=>fs.existsSync(x));
if(!chrome){console.error('SKIP: Chrome/Chromium missing');process.exit(0)}
async function browserCase(port,query,mobile=false,combat=false){
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'pokemon-boot-'));
 const child=cp.spawn(chrome,[
  '--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
  '--no-first-run','--no-default-browser-check','--disable-extensions',
  '--disable-background-networking','--remote-allow-origins=*',
  '--remote-debugging-port=0','--user-data-dir='+tmp,'--window-size=460,970',
  ...(mobile?['--user-agent=Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36']:[]),
  'http://127.0.0.1:'+port+'/'+query
 ],{stdio:'ignore'});
 const errors=[];let ws=null;
 try{
  const portFile=path.join(tmp,'DevToolsActivePort');let cdpPort=0;
  for(let i=0;i<90;i++){
   if(fs.existsSync(portFile)){cdpPort=Number(fs.readFileSync(portFile,'utf8').split('\n')[0]);break;}
   if(child.exitCode!==null)throw Error('Chromium exited '+child.exitCode);
   await sleep(200);
  }
  if(!cdpPort)throw Error('Chrome DevTools not available after 18 seconds');
  let target=null;
  for(let i=0;i<50;i++){
   const targets=await get('http://127.0.0.1:'+cdpPort+'/json/list').catch(()=>[]);
   target=targets.find(x=>x.type==='page'&&x.url.includes('127.0.0.1:'+port));
   if(target)break;
   await sleep(150);
  }
  if(!target)throw Error('Game tab did not open');
  ws=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res,rej)=>{ws.onopen=res;ws.onerror=rej;});
  let serial=0;const pending=new Map();
  ws.onmessage=e=>{
   let msg;try{msg=JSON.parse(e.data)}catch{return}
   if(msg.method==='Runtime.exceptionThrown')
    errors.push(msg.params?.exceptionDetails?.exception?.description||
     msg.params?.exceptionDetails?.text||'Unknown uncaught error');
   if(msg.method==='Log.entryAdded'&&msg.params?.entry?.level==='error')
    errors.push(msg.params.entry.text);
   if(pending.has(msg.id)){
    const fn=pending.get(msg.id);pending.delete(msg.id);fn(msg);
   }
  };
  const cmd=(method,params={})=>new Promise((res,rej)=>{
   const id=++serial;pending.set(id,res);
   try{ws.send(JSON.stringify({id,method,params}))}catch(e){pending.delete(id);rej(e)}
  });
  await cmd('Runtime.enable');await cmd('Log.enable');
  const expression="(() => ({title:document.title,ready:document.readyState,main:!!document.getElementById('main'),resources:(document.getElementById('resources')?.textContent||'').slice(0,140),text:(document.body?.innerText||'').slice(0,200),electric:typeof window.PokemonTorreElectricV46==='function',water:typeof window.PokemonTorreWaterV43==='function',types:typeof window.PokemonTorreMoveTypesV46==='function',url:location.search}))()";
  let result=null;
  for(let i=0;i<100;i++){
   const report=await cmd('Runtime.evaluate',{expression,returnByValue:true});
   result=report.result?.result?.value||result;
   if(result?.main&&result?.resources?.length>10)break;
   if(result?.text?.includes('Não foi possível abrir o jogo'))break;
   await sleep(250);
  }
  const ok=!!(result?.main&&result?.resources?.length>10&&!result?.text?.includes('Não foi possível abrir o jogo'));
  let combatResults=null;
  if(combat&&ok){
   const cases=[['electric-spark',25,143,0],['electric-spark-pikachu',25,143,1],
     ['electric-thunder',25,143,2],['water-gun',9,143,0],
     ['water-hydro',9,143,2],['fire-ember',6,143,0],
     ['electric-old-shot',25,143,2,{staleShot:true}],
     ['water-with-dodging',9,143,0,{allowDodge:true}],
     ['grass-bulbasaur',1,143,-1,{type:'grass'}],
     ['psychic-mewtwo',150,143,-1,{type:'psychic'}],
     ['fighting-machamp',68,143,-1,{type:'fighting'}],
     ['rock-onix',95,143,-1,{type:'rock'}],
     ['flying-pidgeot',18,143,-1,{type:'flying'}]];
   combatResults=[];
   for(const [name,allyId,foeId,slot,options={}] of cases){
    const expression="(async()=>{const qa=window.PokemonTorreLocalCombatTestV47;"+
     "if(!qa)return {error:'Combat QA missing'};"+
     "const initial=qa.start("+allyId+","+foeId+","+JSON.stringify(options)+");"+
     "const selectedSlot="+slot+"===-1?(initial.moves.findIndex(m=>m.power>0&&m.kind!=='status'&&m.type==="+JSON.stringify(options.type||null)+")>=0?initial.moves.findIndex(m=>m.power>0&&m.kind!=='status'&&m.type==="+JSON.stringify(options.type||null)+"):initial.moves.findIndex(m=>m.power>0&&m.kind!=='status')):"+slot+";"+
     "const fired=qa.cast(selectedSlot,"+JSON.stringify(options)+");"+
     "await new Promise(r=>setTimeout(r,2300));"+
     "return {initial,fired,final:qa.snapshot()};})()";
    const response=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
    const answer=response.result?.result?.value||{error:response.result?.exceptionDetails?.text||'No combat result'};
    combatResults.push({name,...answer,landed:
      Number.isFinite(answer?.fired?.hpBefore)&&
      Number.isFinite(answer?.final?.foeHp)&&
      answer.final.foeHp<answer.fired.hpBefore});
   }
  }
  return {query:query||'default',ok,result,combatResults,errors:errors.slice(0,12)};
 }finally{
  if(ws&&ws.readyState===WebSocket.OPEN)ws.close();
  child.kill('SIGKILL');
  // Chrome's helpers may still be shutting down; cleanup is best-effort.
  try{fs.rmSync(tmp,{recursive:true,force:true,maxRetries:4,retryDelay:200})}
  catch(e){console.warn('Temp Chrome profile will be cleaned by runner:',e.code)}
 }
}
server.listen(0,'127.0.0.1',async()=>{
 try{
  const port=server.address().port;
  const stable=await browserCase(port,'?safe=1');
  console.log('BROWSER STABLE:',JSON.stringify(stable));
  const experimental=await browserCase(port,'?v=46.1');
  console.log('BROWSER EXPERIMENT:',JSON.stringify(experimental));
  if(!stable.ok||stable.result?.electric||stable.result?.types){
   console.error('FAIL: V45 recovery mode must boot WITHOUT the experimental modules');process.exitCode=1;
  }
  if(!experimental.ok||!experimental.result?.electric||!experimental.result?.types){
   console.error('FAIL: V46 must now boot with electric and canonical types enabled');process.exitCode=1;
  }
  const phone=await browserCase(port,'?v=47-mobile',true);
  console.log('BROWSER ANDROID:',JSON.stringify(phone));
  if(!phone.ok||!phone.result?.electric||!phone.result?.types){
   console.error('FAIL: Android mobile-like Chromium must boot V47');process.exitCode=1;
  }
  const recovered=await browserCase(port,'?v=47&electricFail=1',true);
  console.log('BROWSER AUTOMATIC RECOVERY:',JSON.stringify(recovered));
  if(!recovered.ok||recovered.result?.electric||!recovered.result?.url?.includes('safe=1')){
   console.error('FAIL: a missing electric asset should recover to V45 safe mode on phone');process.exitCode=1;
  }
  const combat=await browserCase(port,'?v=47.1-hit-regression',false,true);
  console.log('BROWSER REAL COMBAT:',JSON.stringify(combat.combatResults));
  if(!combat.ok||!combat.combatResults?.every(c=>c.landed)){
   console.error('FAIL: real player bolts must actually reduce enemy HP for electric (Spark/Pikachu/Thunder), Water Gun/Hydro and fire');process.exitCode=1;
  }
  if(stable.ok&&experimental.ok&&phone.ok&&recovered.ok&&combat.ok&&
     combat.combatResults?.every(c=>c.landed))
   console.log('PASS: V47.2 real browser HP reduction for electric, water, fire, grass, psychic, fighting, rock and flying; moving foe and stale projectiles');
 }catch(e){console.error('BROWSER TEST EXCEPTION:',e);process.exitCode=1}
 finally{server.close()}
});
