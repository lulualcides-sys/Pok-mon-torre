'use strict';
// Actual browser gate for approved V172 FLAMETHROWER in the OFFICIAL game.
// No debug battle buttons or secondary V167 preview, water V128 remains active.
const fs=require('node:fs'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const {chromium}=require('playwright-core');
const bin=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].find(fs.existsSync);
if(!bin)throw Error('Chromium not available');
const port=18772,server=spawn('python',['-m','http.server',String(port),'--bind','127.0.0.1'],{cwd:process.cwd(),stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 let browser;
 try{
  await sleep(1400);
  browser=await chromium.launch({executablePath:bin,headless:true,
    args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox']});
  const page=await browser.newPage({viewport:{width:390,height:850},deviceScaleFactor:1});
  const errs=[];page.on('pageerror',e=>errs.push(e.message));
  await page.goto('http://127.0.0.1:'+port+'/index.html',{waitUntil:'domcontentloaded',timeout:50000});
  await page.waitForFunction(()=>window.PokemonTorreFlamethrowerApprovedV172?.installed===true
     && window.PokemonTorreWaterV128?.installed===true
     && typeof window.PokemonTorreLocalCombatTestV47?.start==='function',null,{timeout:100000});
  assert(await page.evaluate(()=>window.PokemonTorreLocalCombatTestV47.start(4,74)),
     'Charmander vs Geodude starts normal battle');
  await page.waitForFunction(()=>window.PokemonTorreFlamethrowerApprovedV172?.diagnostics().webgl,
     null,{timeout:35000});
  // Browser evaluate executes OUTSIDE the game's closure, so it cannot
  // access its private current()/skillSet(). Click the REAL game skill button.
  const skills=await page.locator('button.skillV8').allInnerTexts();
  const attack=page.locator('button.skillV8').filter({hasText:/Lança[- ]?Chamas|Flamethrower/i}).first();
  assert(await attack.count()>0,'Lança-Chamas must be equipped: '+JSON.stringify(skills));
  const slot=await attack.getAttribute('data-skill');
  await attack.click({timeout:12000});
  await page.waitForFunction(()=>window.PokemonTorreFlamethrowerApprovedV172?.diagnostics().moveCasts>=1,null,{timeout:25000});
  const first=await page.evaluate(()=>window.PokemonTorreFlamethrowerApprovedV172.diagnostics());
  assert.equal(first.installed,true);
  assert.equal(first.sandboxOnly,false);
  assert(first.activeStreams>=1,'official move produces continuous WebGL flame');
  assert(first.shaderFrames>=1);
  assert(first.impacts>=0);
  assert.equal(await page.locator('#v172-stream-button').count(),0,'no debug preview buttons in original game');
  assert.equal(await page.evaluate(()=>window.PokemonTorreWaterV128?.installed),true);
  await page.waitForFunction(()=>window.PokemonTorreFlamethrowerApprovedV172?.diagnostics().finished>=1,
     null,{timeout:12000});
  const end=await page.evaluate(()=>window.PokemonTorreFlamethrowerApprovedV172.diagnostics());
  assert(end.impacts>=1,'small hit effect on enemy when real move fires');
  assert(end.impactFrames>=1);
  assert.equal(end.activeStreams,0,'no flame overlay after battle cast');
  assert.deepEqual(end.errors,[]);
  assert.equal(errs.length,0,'unexpected JavaScript exception in production');
  console.log('PASS V172 OFFICIAL BATTLE',JSON.stringify({slot,moves:skills,casts:end.moveCasts,frames:end.shaderFrames,impactFrames:end.impactFrames,errors:errs}));
 }finally{
  if(browser)await browser.close();
  server.kill('SIGTERM');
 }
})().catch(e=>{console.error('FAIL V172 OFFICIAL BATTLE',e.stack||e);process.exitCode=1;});
