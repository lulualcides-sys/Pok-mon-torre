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
async function browserCase(port,query,mobile=false,combat=false,grass=false){
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'pokemon-boot-'));
 const child=cp.spawn(chrome,[
  '--headless=new','--no-sandbox',
  ...(query.includes('battle_preview=v84')?['--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']:['--disable-gpu']),
  '--disable-dev-shm-usage',
  '--no-first-run','--no-default-browser-check','--disable-extensions',
  '--disable-background-networking','--remote-allow-origins=*',
  '--remote-debugging-port=0','--user-data-dir='+tmp,'--window-size=460,970',
  ...(mobile?['--user-agent=Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36']:[]),
  'http://127.0.0.1:'+port+'/'+query
 ],{stdio:'ignore'});
 const errors=[];let ws=null;
 try{
  const portFile=path.join(tmp,'DevToolsActivePort');let cdpPort=0;
  for(let i=0;i<200;i++){
   if(fs.existsSync(portFile)){cdpPort=Number(fs.readFileSync(portFile,'utf8').split('\n')[0]);break;}
   if(child.exitCode!==null)throw Error('Chromium exited '+child.exitCode);
   await sleep(200);
  }
  if(!cdpPort)throw Error('Chrome DevTools not available after 40 seconds');
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
  const expression="(() => ({title:document.title,ready:document.readyState,main:!!document.getElementById('main'),resources:(document.getElementById('resources')?.textContent||'').slice(0,140),text:(document.body?.innerText||'').slice(0,200),electric:typeof window.PokemonTorreElectricV46==='function',electricVersion:window.PokemonTorreElectricV46?.().version,electricReady:window.PokemonTorreElectricV46?Object.values(window.PokemonTorreElectricV46().frames).every(n=>n===8)&&Object.values(window.PokemonTorreElectricV46().impacts).every(n=>n===4)&&window.PokemonTorreElectricV46().arcsReady===8:false,electricLabel:document.getElementById('ptFireSpriteV41Badge')?.textContent,water:typeof window.PokemonTorreWaterV43==='function',elemental:typeof window.PokemonTorreElementalV58==='function',elementalReady:typeof window.PokemonTorreElementalV58==='function'&&Object.values(window.PokemonTorreElementalV58().atlases).every(Boolean),library16:typeof window.PokemonTorreLibrary16V59==='function',library16Ready:typeof window.PokemonTorreLibrary16V59==='function'&&Object.values(window.PokemonTorreLibrary16V59().ready).every(Boolean),library16Count:window.PokemonTorreLibrary16V59?.().registeredEffects?.length,fourV60:typeof window.PokemonTorreFourFXV60==='function',fourV60Ready:typeof window.PokemonTorreFourFXV60==='function'&&Object.values(window.PokemonTorreFourFXV60().ready).every(Boolean),fourV60Count:window.PokemonTorreFourFXV60?.().catalogMoves?.length,plantV63:typeof window.PokemonTorrePlantFourV63==='function',plantV63Ready:typeof window.PokemonTorrePlantFourV63==='function'&&Object.values(window.PokemonTorrePlantFourV63().ready).every(Boolean),plantV63Decoded:typeof window.PokemonTorrePlantFourV63==='function'&&Object.values(window.PokemonTorrePlantFourV63().predecoded).every(n=>n===8),plantV63Count:window.PokemonTorrePlantFourV63?.().moves.length,fourBitmapSupported:typeof createImageBitmap==='function',fourBitmapReady:typeof window.PokemonTorreFourFXV60==='function'&&Object.values(window.PokemonTorreFourFXV60().prerendered).every(n=>n===8),pixiOverlayStarted:window.PokemonTorrePixiFX?.().ready,moveUi:typeof window.PokemonTorreMoveUIV61==='function',moveUiTypes:window.PokemonTorreMoveUIV61?.().types,types:typeof window.PokemonTorreMoveTypesV46==='function',previewVersion:window.PokemonTorreBattlePreviewV80?.version||null,hitSyncVersion:window.PokemonTorreHitSyncV80?.().version||null,approvedVersion:window.PokemonTorreBattleArtV81?.version||null,v84Version:window.PokemonTorreGrassFourPreviewV84?.version||null,equippedPreviewVersion:window.PokemonTorreEquippedFourPreviewV82?.version||null,equippedHitSyncVersion:window.PokemonTorreGrassImpactV82?.().version||null,grassV83Version:window.PokemonTorreGrassFourPreviewV83?.version||null,grassV83HitSyncVersion:window.PokemonTorreGrassImpactV83?.().version||null,url:location.search}))()";
  let result=null;
  for(let i=0;i<100;i++){
   const report=await cmd('Runtime.evaluate',{expression,returnByValue:true});
   result=report.result?.result?.value||result;
   if(result?.main&&result?.resources?.length>10&&(!result?.electric||result?.electricReady)&&(!result?.elemental||result?.elementalReady)&&(!result?.library16||result?.library16Ready)&&(!result?.fourV60||(result?.fourV60Ready&&(!result.fourBitmapSupported||result.fourBitmapReady)))&&(!result?.plantV63||(result?.plantV63Ready&&(!result.fourBitmapSupported||result.plantV63Decoded))))break;
   if(result?.text?.includes('Não foi possível abrir o jogo'))break;
   await sleep(250);
  }
  const ok=!!(result?.main&&result?.resources?.length>10&&!result?.text?.includes('Não foi possível abrir o jogo'));
  let uiFixture=null;
  if(ok&&query==='?v=46.1'){
    const probe=await cmd('Runtime.evaluate',{expression:"(async()=>{\n const modal=document.querySelector('#modal');\n if(!modal)return {ok:false,error:'modal missing'};\n const holder=document.createElement('section');holder.id='pt61-test-fixture';\n const moves=[\n  ['Nevasca','Gelo',35,'35','4.6'],\n  ['Tempestade de Neve','Gelo',39,'39','4.6'],\n  ['Faísca do Pikachu','Elétrico',18,'18','1.4'],\n  ['Volt Tackle','Elétrico',26.8,'27','2.8'],\n  ['Barreira','Psíquico',0,'24','5.8']\n ];\n holder.innerHTML='<div class=\"v331MoveList\">'+moves.map((x,i)=>\n  '<button class=\"v331Choice\" data-v331-pick=\"'+i+'\"><span><b>⚡ '+x[0]+'</b>'+\n  '<small>'+x[1]+' · '+(x[2]||'Defesa')+' força · '+x[3]+' energia · '+x[4]+'s</small>'+\n  '</span><span class=\"pillSmall\">EQUIPAR</span></button>').join('')+'</div>';\n modal.append(holder);\n await new Promise(r=>setTimeout(r,550));\n const rows=[...holder.querySelectorAll('.v331Choice')];\n const names=rows.map(el=>el.querySelector('.pt61Label')?.textContent||'');\n const powers=rows.map(el=>{\n  const m=el.querySelector('small')?.textContent.match(/(\\d+(?:[.,]\\d+)?)\\s*força/);\n  return m?Number(m[1].replace(',','.')):0;\n });\n const icons=rows.map(el=>el.querySelector('.pt61Icon')?.dataset.type);\n const originalButtonIds=rows.map(el=>el.getAttribute('data-v331-pick'));\n const svgCount=holder.querySelectorAll('.v331Choice .pt61Icon svg').length;\n const vectorMarkup=rows.map(el=>el.querySelector('.pt61Icon')?.innerHTML?.slice(0,100));\n const runsBefore=window.PokemonTorreMoveUIV61?.().runs||0;\n const churn=document.createElement('span');churn.className='pt61-performance-probe';\n holder.append(churn);\n for(let i=0;i<120;i++){const e=document.createElement('i');e.textContent='hp '+i;churn.append(e);}\n await new Promise(r=>setTimeout(r,140));\n const runsAfter=window.PokemonTorreMoveUIV61?.().runs||0;\n const stableObserver=runsAfter-runsBefore<=1;\n const centered=rows.every(el=>{const icon=el.querySelector('.pt61Icon');const st=window.getComputedStyle(icon);return st.display.includes('flex')&&st.alignItems==='center'&&st.justifyContent==='center'});\n const ok=JSON.stringify(powers)===JSON.stringify([0,18,26.8,35,39])\n  &&icons.includes('electric')&&icons.includes('ice')&&icons.includes('psychic')\n  &&originalButtonIds.length===5\n  &&stableObserver&&centered\n  &&holder.querySelectorAll('.v331Choice .pt61Icon svg').length===5;\n const picker=document.querySelector('.pt62TypeButton');\n const dropdownPresent=!!picker;\n picker?.click();\n await new Promise(r=>setTimeout(r,80));\n const popup=document.querySelector('.pt62TypePopup');\n const dropdownOptions=popup?.querySelectorAll('.pt62TypeOption').length||0;\n const optionIcons=popup?.querySelectorAll('.pt62TypeOption .pt61Icon svg').length||0;\n const iceOption=popup?.querySelector('.pt62TypeOption[data-type=\"ice\"]');\n const optionLabel=iceOption?.querySelector('.pt62OptionName')?.textContent;\n iceOption?.click();\n await new Promise(r=>setTimeout(r,80));\n const chosenType=document.querySelector('.ptTypeSelect')?.value;\n const pickerLabel=document.querySelector('.pt62TypeTitle')?.textContent;\n const popupClosed=!document.querySelector('.pt62TypePopup');\n const visibleGelo=[...holder.querySelectorAll('.v331Choice:not(.ptFilteredOut)')]\n  .map(row=>row.querySelector('.pt61Label')?.textContent);\n const filterWorks=visibleGelo.length===2&&visibleGelo.includes('Nevasca')\n   &&visibleGelo.includes('Tempestade de Neve');\n const typeMenuOk=dropdownPresent&&dropdownOptions===19&&optionIcons===19\n   &&optionLabel==='Gelo'&&chosenType==='ice'\n   &&pickerLabel==='Gelo'&&popupClosed&&filterWorks;\n holder.remove();\n return {ok:ok&&typeMenuOk,names,powers,icons,svgCount,\n  vectorMarkup,originalButtonIds,runsBefore,runsAfter,stableObserver,centered,\n  dropdownPresent,dropdownOptions,optionIcons,chosenType,pickerLabel,popupClosed,typeMenuOk,filterWorks,visibleGelo};\n})()",returnByValue:true,awaitPromise:true});
    uiFixture=probe.result?.result?.value||{ok:false,error:probe.result?.exceptionDetails?.text||'Evaluation failed'};
  }
  let grassResults=null,drainResults=null;
  if(ok&&grass){
   grassResults=[];
   // Start a fresh local test battle for each status synchronously. Returning
   // a Promise from the devtools context while startBattle() recreates the
   // game can produce an unhelpful {} instead of test diagnostics.
   for(const name of ['Stun Spore','Pó do Sono','Leech Seed','Esporos']){
    const expr="(()=>{const qa=window.PokemonTorreLocalCombatTestV47;return qa?.castGrass("+JSON.stringify(name)+",143)||{error:'Local status harness missing'};})()";
    const before=await cmd('Runtime.evaluate',{expression:expr,returnByValue:true});
    const cast=before.result?.result?.value||
     {error:before.result?.exceptionDetails?.text||'Cast did not produce a value',
      exception:before.result?.exceptionDetails?.exception?.description};
    await sleep(320);
    const after=await cmd('Runtime.evaluate',{
     expression:"(()=>({visual:window.PokemonTorrePlantStatusV64?.(),sprite:window.PokemonTorrePlantFourV63?.()}))()",
     returnByValue:true});
    const state=after.result?.result?.value||{};
    grassResults.push({name,error:cast.error,exception:cast.exception,
     equipped:cast.equipped,castAccepted:cast.cast?.stats?.lastCast===name||
      state.visual?.names?.at(-1)?.result===true,
     conditions:state.visual?.actualEnemyConditions,frames:state.sprite?.framesDrawn,
     visualQueues:state.visual?.visualQueues,statusApplied:state.visual?.statusApplied,
     cooldown:cast.cast?.cooldowns?.[['Stun Spore','Pó do Sono','Leech Seed','Esporos'].indexOf(name)],
     energyAfter:cast.cast?.energy});
   }
   drainResults=[];
   for(const name of ['Leech Seed','Absorver','Mega Dreno','Draining Kiss','Leech Life']){
    const expression="(()=>window.PokemonTorreLocalCombatTestV47?.verifyDrainV65("+JSON.stringify(name)+")||{error:'Missing V65 QA'})()";
    const response=await cmd('Runtime.evaluate',{expression,returnByValue:true});
    drainResults.push(response.result?.result?.value||
     {error:response.result?.exceptionDetails?.exception?.description||
       response.result?.exceptionDetails?.text||'No result'});
   }
  }
  let v84CombatResults=null,v84IsolationResults=null;
  if(ok&&query.includes('battle_preview=v84')){
   v84CombatResults=[];
   for(let slot=0;slot<4;slot++){
    const cast=await cmd('Runtime.evaluate',{
     expression:"(()=>window.PokemonTorreLocalCombatTestV47?.castPreviewGrassV84("+slot+")||{error:'V84 QA harness missing'})()",
     returnByValue:true
    });
    const before=cast.result?.result?.value||{error:cast.result?.exceptionDetails?.exception?.description||'QA error'};
    // Observe the actual WebGL animation after beginning the cast.
    await sleep(1220);
    const after=await cmd('Runtime.evaluate',{
     expression:"(()=>({art:window.PokemonTorreGrassFourPreviewV84?.diagnostics(),hit:window.PokemonTorreGrassImpactV84?.(),pixi:window.PokemonTorrePixiFX?.(),webglError:window.PokemonTorreGrassPreviewErrorV84||null}))()",
     returnByValue:true
    });
    v84CombatResults.push({slot,requested:before.requested,selected:before.selected,
     liveQueue:before.liveQueue,
     after:after.result?.result?.value||{},error:before.error});
   }
   // Critical regression: same battle, rapid alternation. The previous
   // Area vines must disappear as soon as Chicote/Vine is cast.
   v84IsolationResults=[];
   for(const slot of [2,0,3,2,0,3]){
    const response=await cmd('Runtime.evaluate',{
     expression:"(()=>({cast:window.PokemonTorreLocalCombatTestV47.castPreviewGrassV84("+slot+",143,true),layer:window.PokemonTorrePixiFX?.()}))()",
     returnByValue:true
    });
    const observation=response.result?.result?.value||{
     error:response.result?.exceptionDetails?.exception?.description||'QA fail'};
    v84IsolationResults.push({slot,selected:observation.cast?.selected,
      layer:observation.layer,error:observation.error});
    await sleep(270);
   }
  }
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
     ['fighting-machamp-queued',68,143,0,{simulateWindup:true}],
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
    // Real attacks can legitimately MISS due to native battle accuracy.
    // Retry at most three independent casts rather than treating one RNG miss
    // as a broken game. Persistent no-damage errors still fail this smoke test.
    let answer=null,landed=false,attempts=0;
    for(attempts=1;attempts<=3;attempts++){
      const response=await cmd('Runtime.evaluate',
        {expression,returnByValue:true,awaitPromise:true});
      answer=response.result?.result?.value||
        {error:response.result?.exceptionDetails?.text||'No combat result'};
      landed=Number.isFinite(answer?.fired?.hpBefore)&&
        Number.isFinite(answer?.final?.foeHp)&&
        answer.final.foeHp<answer.fired.hpBefore;
      if(landed)break;
    }
    combatResults.push({name,...answer,landed,attempts});
   }
  }
  return {query:query||'default',ok,result,combatResults,grassResults,drainResults,v84CombatResults,v84IsolationResults,uiFixture,errors:errors.slice(0,12)};
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
  if(!experimental.ok||experimental.result?.approvedVersion!=='81.0'||
     experimental.result?.hitSyncVersion!=='80.0'){
    console.error('FAIL: normal game must load approved V81 FX and native hit synchronizer without preview flag');
    process.exitCode=1;
  }
  const staged=await browserCase(port,'?battle_preview=v80&build=v80');
  console.log('BROWSER STAGED V80:',JSON.stringify({ok:staged.ok,version:staged.result?.previewVersion,hitSync:staged.result?.hitSyncVersion,url:staged.result?.url,errors:staged.errors}));
  if(!staged.ok||(staged.result?.previewVersion!=='80.0'||staged.result?.hitSyncVersion!=='80.0')){
    console.error('FAIL: browser did not actually load staged V80 preview');
    process.exitCode=1;
  }
  const equipped=await browserCase(port,'?battle_preview=v82&build=v82');
  console.log('BROWSER EQUIPPED GRASS V82:',JSON.stringify({
    ok:equipped.ok,preview:equipped.result?.equippedPreviewVersion,
    hitSync:equipped.result?.equippedHitSyncVersion,errors:equipped.errors
  }));
  if(!equipped.ok||equipped.result?.equippedPreviewVersion!=='82.0'||
      equipped.result?.equippedHitSyncVersion!=='82.0'){
    console.error('FAIL: in-battle V82 preview of the four equipped grass moves did not load');
    process.exitCode=1;
  }
  const v83=await browserCase(port,'?battle_preview=v83&build=v83');
  console.log('BROWSER GRASS FOUR V83:',JSON.stringify({
    ok:v83.ok,preview:v83.result?.grassV83Version,
    nativeHitSync:v83.result?.grassV83HitSyncVersion,errors:v83.errors
  }));
  if(!v83.ok||v83.result?.grassV83Version!=='83.1'||
     v83.result?.grassV83HitSyncVersion!=='83.1'){
    console.error('FAIL: V83 four unique grass previews did not load in real game');
    process.exitCode=1;
  }
  const v84=await browserCase(port,'?battle_preview=v84&build=v84-2-tres-distintos');
  console.log('BROWSER LIVE BATTLE V84:',JSON.stringify({ok:v84.ok,
   version:v84.result?.v84Version,casts:v84.v84CombatResults,errors:v84.errors}));
  const combatOK=v84.ok&&v84.result?.v84Version==='84.2'&&
    v84.v84CombatResults?.length===4&&
    v84.v84CombatResults.every((rec,index)=>{
      const expected=['Chicote de Vinha','Folha Navalha','Chicotes em Área','Vine Whip'][index];
      const move=rec.after?.art?.perMove?.[expected];
      return rec.selected===expected&&
       (move?.casts||0)>=1&&
       (move?.draws||0)>0&&
       (move?.framesMask||0)!==0&&
       rec.after?.pixi?.gpu===true&&
       !rec.after.webglError;
    });
  if(!combatOK){
   console.error('FAIL: V84 must draw new Pixi sprites IN REAL BATTLE for all 4 moves');
   process.exitCode=1;
  }
  console.log('V84 SAME-BATTLE ISOLATION:',JSON.stringify(v84.v84IsolationResults));
  const expectedKeys=['chicotesemarea','chicotedevinha','vinewhip',
                      'chicotesemarea','chicotedevinha','vinewhip'];
  const isolated=v84.v84IsolationResults?.length===expectedKeys.length&&
   v84.v84IsolationResults.every((rec,i)=>{
    const own=rec.layer?.activePreview;
    const label=['Chicotes em Área','Chicote de Vinha','Vine Whip',
                 'Chicotes em Área','Chicote de Vinha','Vine Whip'][i];
    const asset=['chicotes-em-area','chicote-de-vinha','vine-whip',
                 'chicotes-em-area','chicote-de-vinha','vine-whip'][i];
    return rec.selected===label&&own?.key===expectedKeys[i]&&
      own.source?.includes('/'+asset+'/v84-preview/sprites/'+asset+'.webp')&&
      rec.layer.previewEffectCount===1&&
      rec.layer.active===1&&
      !['chicotedevinha','folhanavalha','chicotesemarea','vinewhip']
       .some(k=>rec.layer.rendered?.[k]>0)&&
      (i===0||rec.layer.clearedV84>
       v84.v84IsolationResults[i-1].layer.clearedV84);
   });
  if(!isolated){
    console.error('FAIL: Area sprites leaked into next Chicote or Vine cast');
    process.exitCode=1;
  }
  if(!stable.ok||stable.result?.electric||stable.result?.types){
   console.error('FAIL: V45 recovery mode must boot WITHOUT the experimental modules');process.exitCode=1;
  }
  if(!experimental.ok||!experimental.result?.electric||!experimental.result?.types||experimental.result?.electricVersion!=='57.2'||!experimental.result?.electricLabel?.includes('ELÉTRICOS V57.2')||!experimental.result?.elemental||!experimental.result?.elementalReady||!experimental.result?.library16||!experimental.result?.library16Ready||experimental.result?.library16Count!==16||!experimental.result?.fourV60||!experimental.result?.fourV60Ready||experimental.result?.fourV60Count!==3||!experimental.result?.plantV63||!experimental.result?.plantV63Ready||experimental.result?.plantV63Count!==4||(experimental.result?.fourBitmapSupported&&!experimental.result?.plantV63Decoded)||(experimental.result?.fourBitmapSupported&&!experimental.result?.fourBitmapReady)||!experimental.result?.moveUi||experimental.result?.moveUiTypes!==18){
   console.error('FAIL: V46 must now boot with electric and canonical types enabled');process.exitCode=1;
  }
  if(!experimental.uiFixture?.ok){console.error('FAIL V61 icons/ascending power:',experimental.uiFixture);process.exitCode=1;}
  const phone=await browserCase(port,'?v=47-mobile',true);
  console.log('BROWSER ANDROID:',JSON.stringify(phone));
  if(!phone.ok||!phone.result?.electric||!phone.result?.types||!phone.result?.electricReady||!phone.result?.elementalReady||!phone.result?.library16Ready||!phone.result?.fourV60Ready||!phone.result?.plantV63||!phone.result?.plantV63Ready||(phone.result?.fourBitmapSupported&&!phone.result?.plantV63Decoded)||(phone.result?.fourBitmapSupported&&!phone.result?.fourBitmapReady)||!phone.result?.moveUi||phone.result?.moveUiTypes!==18){
   console.error('FAIL: Android mobile-like Chromium must boot V47');process.exitCode=1;
  }
  const recovered=await browserCase(port,'?v=47&electricFail=1',true);
  console.log('BROWSER AUTOMATIC RECOVERY:',JSON.stringify(recovered));
  if(!recovered.ok||recovered.result?.electric||!recovered.result?.url?.includes('safe=1')){
   console.error('FAIL: a missing electric asset should recover to V45 safe mode on phone');process.exitCode=1;
  }
  const status=await browserCase(port,'?v=64-grass-status-regression',true,false,true);
  console.log('BROWSER GRASS STATUSES:',JSON.stringify(status.grassResults));
  const names=['Stun Spore','Pó do Sono','Leech Seed','Esporos'];
  const idMap={'Stun Spore':'stun-spore','Pó do Sono':'po-do-sono',
   'Leech Seed':'leech-seed','Esporos':'esporos'};
  const expected={'Stun Spore':'paralysis','Pó do Sono':'sleep',
   'Leech Seed':'seed','Esporos':'sleep'};
  const statusOkay=status.ok&&status.grassResults?.length===4&&
   status.grassResults.every((r,i)=>!r.error&&r.name===names[i]&&
    r.equipped?.includes(r.name)&&r.castAccepted===true&&
    r.conditions?.includes(expected[r.name])&&
    (r.frames?.[idMap[r.name]]||0)>0&&r.visualQueues>0&&
    r.energyAfter<100);
  if(!statusOkay){
   console.error('FAIL: actual status casts must apply real conditions and draw their V63 sprites',status.grassResults);
   process.exitCode=1;
  }
  console.log('BROWSER ORIGINAL HP DRAIN:',JSON.stringify(status.drainResults));
  const drainOkay=status.drainResults?.length===5&&status.drainResults.every(r=>{
   if(r.error)return false;
   if(r.name==='Leech Seed')return r.seedApplied&&r.enemyLost===100&&r.playerHealed===100
     &&r.seedStats?.damage===100&&r.seedStats?.healed===100;
   return r.accepted&&r.enemyLost>0&&r.playerHealed===r.expectedHeal;
  });
  if(!drainOkay){
   console.error('FAIL: original Leech Seed and attacking moves must drain correct actual HP',status.drainResults);
   process.exitCode=1;
  }
  const combat=await browserCase(port,'?v=47.1-hit-regression',false,true);
  console.log('BROWSER REAL COMBAT:',JSON.stringify(combat.combatResults));
  if(!combat.ok||!combat.combatResults?.every(c=>c.landed)){
   console.error('FAIL: real player bolts must actually reduce enemy HP for electric (Spark/Pikachu/Thunder), Water Gun/Hydro and fire');process.exitCode=1;
  }
  if(stable.ok&&experimental.ok&&phone.ok&&recovered.ok&&combat.ok&&
     combat.combatResults?.every(c=>c.landed)&&
     combat.combatResults.some(c=>c.name==='fighting-machamp-queued'&&c.final?.stats?.replayedQueued>0))
   console.log('PASS: V47.2 real browser HP reduction for electric, water, fire, grass, psychic, fighting, rock and flying; moving foe and stale projectiles');
 }catch(e){console.error('BROWSER TEST EXCEPTION:',e);process.exitCode=1}
 finally{server.close()}
});
