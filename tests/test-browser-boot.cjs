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
async function browserCase(port,query){
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'pokemon-boot-'));
 const child=cp.spawn(chrome,[
  '--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
  '--no-first-run','--no-default-browser-check','--disable-extensions',
  '--disable-background-networking','--remote-allow-origins=*',
  '--remote-debugging-port=0','--user-data-dir='+tmp,'--window-size=460,970',
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
  const expression="(() => ({title:document.title,ready:document.readyState,main:!!document.getElementById('main'),resources:(document.getElementById('resources')?.textContent||'').slice(0,140),text:(document.body?.innerText||'').slice(0,200),electric:typeof window.PokemonTorreElectricV46==='function',water:typeof window.PokemonTorreWaterV43==='function',types:typeof window.PokemonTorreMoveTypesV46==='function'}))()";
  let result=null;
  for(let i=0;i<100;i++){
   const report=await cmd('Runtime.evaluate',{expression,returnByValue:true});
   result=report.result?.result?.value||result;
   if(result?.main&&result?.resources?.length>10)break;
   if(result?.text?.includes('Não foi possível abrir o jogo'))break;
   await sleep(250);
  }
  const ok=!!(result?.main&&result?.resources?.length>10&&!result?.text?.includes('Não foi possível abrir o jogo'));
  return {query:query||'default',ok,result,errors:errors.slice(0,7)};
 }finally{
  if(ws&&ws.readyState===WebSocket.OPEN)ws.close();
  child.kill('SIGKILL');fs.rmSync(tmp,{recursive:true,force:true});
 }
}
server.listen(0,'127.0.0.1',async()=>{
 try{
  const port=server.address().port;
  const stable=await browserCase(port,'?v=boot-safe');
  console.log('BROWSER STABLE:',JSON.stringify(stable));
  const experimental=await browserCase(port,'?electric46=1');
  console.log('BROWSER EXPERIMENT:',JSON.stringify(experimental));
  if(!stable.ok){console.error('FAIL: default safe game does not open');process.exitCode=1;}
  if(!experimental.ok)console.warn('WARNING: V46 remains isolated due to boot failure');
 }catch(e){console.error('BROWSER TEST EXCEPTION:',e);process.exitCode=1}
 finally{server.close()}
});
