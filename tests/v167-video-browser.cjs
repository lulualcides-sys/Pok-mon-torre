'use strict';
// V167: Android Chromium e2e using the duplicated full campaign.
const {spawn}=require('node:child_process');
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
const bin=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].find(fs.existsSync);
if(!bin)throw Error('Chromium missing');
const port=18765,server=spawn('python',['-m','http.server',String(port),'--bind','127.0.0.1'],{cwd:process.cwd(),stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 let browser;
 try{
  await sleep(1300);
  browser=await chromium.launch({executablePath:bin,headless:true,
    args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox']});
  const page=await browser.newPage({viewport:{width:390,height:850},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+port+'/torre-v167-video-lab.html?arena_lab=blue167',
     {waitUntil:'domcontentloaded',timeout:50000});
  try{await page.waitForFunction(()=>window.PokemonTorreV167Lab?.diagnostics()&&
   typeof window.PokemonTorreLocalCombatTestV47?.start==='function',null,{timeout:65000});}
  catch(e){console.error('V167 boot',JSON.stringify(await page.evaluate(()=>({
    title:document.title,url:location.href,lab:window.PokemonTorreV167Lab?.diagnostics?.(),
    boot:window.PokemonTorreV167Boot,flag:window.__V167_LAB,
    qa:typeof window.PokemonTorreLocalCombatTestV47?.start,
    status:document.querySelector('#pt-status')?.textContent,
    body:document.body.textContent.slice(0,420)
   }))));throw e;}
  const isolation=await page.evaluate(()=>{
    localStorage.setItem('v167_test','sandbox');
    return {key:Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)).find(k=>k?.includes('v167_test')),
       val:localStorage.getItem('v167_test')};
  });
  assert.equal(isolation.key,'__torre_lab_v167__v167_test');
  assert.equal(isolation.val,'sandbox');
  const started=await page.evaluate(()=>window.PokemonTorreLocalCombatTestV47.start(25,74));
  assert(started,'Kanto Pikachu vs Geodude battle start');
  await page.waitForFunction(()=>window.PokemonTorreV167Lab?.diagnostics().active,null,{timeout:25000});
  await page.waitForFunction(()=>window.PokemonTorreV167Lab?.diagnostics().actors>0,null,{timeout:40000});
  const first=await page.evaluate(()=>window.PokemonTorreV167Lab.diagnostics());
  assert(first.webgl,'shared PixiJS WebGL must render the battle');
  assert(first.animatedSpecies.some(id=>id===25||id===74),'one expanded Kanto PMD character must animate');
  await page.locator('[data-v167="shadow"]').click();
  await page.waitForFunction(()=>window.PokemonTorreV167Lab?.diagnostics().casts>0,null,{timeout:15000});
  await page.locator('[data-v167="psychic"]').click();
  await page.waitForFunction(()=>window.PokemonTorreV167Lab?.diagnostics().casts>1,null,{timeout:15000});
  await page.locator('[data-v167="fire"]').click();
  await page.locator('[data-v167="electric"]').click();
  await page.waitForTimeout(300);
  const final=await page.evaluate(()=>({
    lab:window.PokemonTorreV167Lab.diagnostics(),
    overlays:document.querySelectorAll('#v167-lab-controls').length,
    arena:window.PokemonTorreBlue153?.diagnostics?.(),
  }));
  assert.equal(final.overlays,1);
  assert(final.lab.animatedFrames>2&&final.lab.fps>0);
  assert(final.lab.stableSizeChecks>2,'actor scale must be invariant');
  assert.equal(final.lab.actorsCurrently,2,'one GPU sprite per side, no doubled actors');
  assert.equal(final.lab.effectsAlive<=8,true);
  assert.equal(final.lab.arena?.theme,'violet','video reference cracked-violet arena is the default');
  await page.locator('#v167-arena-theme').click();
  await page.waitForFunction(()=>window.PokemonTorreV167Lab?.diagnostics().arena?.theme==='blue',
    null,{timeout:8000});
  const switched=await page.evaluate(()=>window.PokemonTorreV167Lab.diagnostics());
  assert.equal(switched.arenaTheme,'blue','arena blue/violet switch must work');
  assert(switched.quality==='high'||switched.quality==='medium'||switched.quality==='low');
  assert(final.lab.casts>=4,'all four distinct 16-frame spell previews');
  assert.equal(final.lab.artRevision,'v167-cracked-slate-cinematic-16frame-atlases');
  assert.equal(final.lab.gpuPreset,'RTX 2060');
  assert.equal(final.arena?.gpuPreset,'rtx2060');
  assert.equal(final.arena?.ambientMs,33);
  for(const path of ['assets/battle-v167/shadow-ball-16.png',
                     'assets/battle-v167/psychic-wave-16.png',
                     'assets/arena-v167/floor-atlas.png',
                     'assets/arena-v167/back-wall.png',
                     'assets/arena-v167/arch.png',
                     'assets/arena-v167/horizon-rail.png',
                     'assets/arena-v167/side-rail.png',
                     'assets/arena-v167/floor-rune.png',
                     'assets/battle-v167/fire-burst-16.png',
                     'assets/battle-v167/electric-arc-16.png']){
    const request=await page.request.get('http://127.0.0.1:'+port+'/'+path);
    assert.equal(request.status(),200,'missing generated cinematic asset '+path);
    const bytes=await request.body();
    assert(bytes.byteLength>160,'empty asset '+path);
    assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a','invalid PNG '+path);
  }
  fs.mkdirSync('tests/artifacts',{recursive:true});
  await page.screenshot({path:'tests/artifacts/v167-video-fidelity-android.png'});
  console.log('V167 CHROME PASS',JSON.stringify({isolation,first,final,errors}));
  assert.equal(errors.length,0,'no unhandled browser errors');
 }finally{
  if(browser)await browser.close();
  server.kill('SIGTERM');
 }
})().catch(e=>{console.error('V167 CHROME FAILED',e.stack||e);process.exitCode=1;});
