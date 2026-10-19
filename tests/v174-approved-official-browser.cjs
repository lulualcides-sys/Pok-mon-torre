'use strict';
// Test ACTUAL official URL, not the isolated V174 lab. Runs only in CI Chrome.
const assert=require('node:assert/strict'),fs=require('node:fs');
const {spawn}=require('node:child_process'),{chromium}=require('playwright-core');
const bin=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].find(fs.existsSync);
if(!bin)throw Error('Chromium unavailable');
const port=18776;
const server=spawn('python',['-m','http.server',String(port),'--bind','127.0.0.1'],{cwd:process.cwd(),stdio:'ignore'});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
(async()=>{
 let browser;
 try{
  await sleep(1500);
  browser=await chromium.launch({executablePath:bin,headless:true,
   args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox']});
  const page=await browser.newPage({viewport:{width:390,height:850},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+port+'/index.html',{waitUntil:'domcontentloaded',timeout:50000});
  await page.waitForFunction(()=>window.PokemonTorreV174Regional?.diagnostics()?.enabled===true
    &&typeof window.PokemonTorreLocalCombatTestV47?.start==='function',null,{timeout:100000});
  const info=await page.evaluate(()=>{
    localStorage.setItem('v174_official_persistence','preserved');
    return window.PokemonTorreV174Regional.diagnostics();
  });
  assert.equal(info.official,true,'regional arena must run on official URL');
  assert.equal(info.sandboxOnly,false);
  assert.equal(info.approved,true);
  assert.equal(info.regionCount,8);
  assert(await page.evaluate(()=>window.PokemonTorreLocalCombatTestV47.start(25,74)),
   'Pikachu versus Geodude should start in normal Pokémon Torre');
  try{
   await page.waitForFunction(()=>{
    const d=window.PokemonTorreV174Regional?.diagnostics();
    return d&&d.generated>=1&&d.applied>=1&&d.frames>=8;
   },null,{timeout:40000});
  }catch(err){
   const debug=await page.evaluate(()=>({
    stage:window.PokemonTorreV174Regional?.diagnostics?.(),
    bridge:typeof window.PokemonTorrePixelFlyingBridge?.labStage,
    pixi:typeof window.PIXI,
    battle:typeof battle==='undefined'?null:{active:battle?.active},
    gpu:window.PokemonTorrePixelFlyingBridge?.diagnostics?.()
   })).catch(e=>({error:String(e)}));
   console.error('V174 OFFICIAL CHROME DIAGNOSTICS',JSON.stringify({debug,errors}));
   throw err;
  }
  const data=await page.evaluate(()=>({
   arena:window.PokemonTorreV174Regional.diagnostics(),
   fire:!!window.PokemonTorreFlamethrowerApprovedV172?.installed,
   water:!!window.PokemonTorreWaterV128?.installed,
   three:typeof window.THREE,
   old3d:document.querySelectorAll('canvas[data-arena="three173"]').length,
   nativeCanvas:document.querySelectorAll('#battleCanvas').length,
   persistence:localStorage.getItem('v174_official_persistence'),
   labSave:localStorage.getItem('__torre_lab_v174__v174_official_persistence')
  }));
  assert.equal(data.arena.region,'Grutas de Pewter');
  assert.equal(data.arena.leader,'Brock');
  assert.equal(data.arena.leaderRoom,false);
  assert.equal(data.arena.extraWebGLContexts,0);
  assert.equal(data.arena.dynamicShadowPasses,0);
  assert.equal(data.arena.official,true);
  assert.equal(data.arena.sandboxOnly,false);
  assert.deepEqual(data.arena.errors,[]);
  assert.equal(data.three,'undefined');
  assert.equal(data.old3d,0);
  assert.equal(data.nativeCanvas,1);
  assert(data.fire&&data.water,'previously approved move runtimes still loaded');
  assert.equal(data.persistence,'preserved','official saves/storage must not be sandboxed');
  assert.equal(data.labSave,null,'no V174 lab interception');
  assert.deepEqual(errors,[],'no fatal browser exceptions');
  fs.mkdirSync('tests/artifacts',{recursive:true});
  await page.screenshot({path:'tests/artifacts/v174-approved-official-mobile.png'});
  console.log('V174 OFFICIAL CHROME PASS',JSON.stringify(data));
 }finally{
  if(browser)await browser.close();
  server.kill('SIGTERM');
 }
})().catch(e=>{console.error('V174 OFFICIAL CHROME FAILED',e.stack||e);process.exitCode=1;});
