'use strict';
/** Full Chrome smoke for V155: actually loads PMD art and hits with both spells.
 * Run from repo root after generated assets exist. */
const {spawn}=require('node:child_process');
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
const port=18760;
const bin=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].find(fs.existsSync);
if(!bin)throw Error('Chrome/Chromium executable not installed in runner');
const server=spawn('python',['-m','http.server',String(port),'--bind','127.0.0.1'],{cwd:process.cwd(),stdio:['ignore','pipe','pipe']});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
(async()=>{
 let browser;
 try{
  await sleep(1150);
  browser=await chromium.launch({executablePath:bin,headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox']});
  const page=await browser.newPage({viewport:{width:390,height:850},deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+port+'/previews/v155-mew-mewtwo.html',{waitUntil:'domcontentloaded',timeout:40000});
  await page.waitForFunction(()=>window.PokemonTorreMewPilot?.diagnostics().ready===true,null,{timeout:45000});
  const initial=await page.evaluate(()=>{
   const d=window.PokemonTorreMewPilot.diagnostics();
   const can=document.querySelector('#stage canvas');
   return{...d,webgl:!!can,assets:window.PIXI?.utils?.isWebGLSupported?.(),
    visual:can?.width+'x'+can?.height,bodyWidth:document.body.scrollWidth};
  });
  assert.ok(initial.ready&&initial.webgl,'actual battle scene must mount');
  assert.equal(initial.foeHp,240);
  await page.locator('#shadow').click();
  await page.waitForFunction(()=>window.PokemonTorreMewPilot.diagnostics().foeHp<240,null,{timeout:6000});
  const hit=await page.evaluate(()=>window.PokemonTorreMewPilot.diagnostics());
  assert.equal(hit.foeHp,217,'Shadow Ball damage (23) on real graphical contact');
  await page.locator('#psychic').click();
  await page.waitForFunction(()=>window.PokemonTorreMewPilot.diagnostics().foeHp<=186,null,{timeout:6000});
  const psychic=await page.evaluate(()=>window.PokemonTorreMewPilot.diagnostics());
  assert.ok(psychic.foeHp<=186,'Psychic lands with visible arrival');
  fs.mkdirSync('tests/artifacts',{recursive:true});
  await page.screenshot({path:'tests/artifacts/v155-mobile-smoke.png'});
  console.log('V155 BROWSER PASS',JSON.stringify({initial,shadowHp:hit.foeHp,psychicHp:psychic.foeHp,errors}));
  assert.equal(errors.length,0,'no unhandled browser JS errors');
 }finally{if(browser)await browser.close();server.kill('SIGTERM');}
})().catch(e=>{console.error('V155 BROWSER SMOKE FAILED',e);process.exitCode=1;});
