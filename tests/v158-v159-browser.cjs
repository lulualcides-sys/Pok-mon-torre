'use strict';
// V158+V159: Android Chromium e2e using the duplicated full campaign.
const {spawn}=require('node:child_process');
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
const bin=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].find(fs.existsSync);
if(!bin)throw Error('Chromium missing');
const port=18763,server=spawn('python',['-m','http.server',String(port),'--bind','127.0.0.1'],{cwd:process.cwd(),stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 let browser;
 try{
  await sleep(1300);
  browser=await chromium.launch({executablePath:bin,headless:true,
    args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox']});
  const page=await browser.newPage({viewport:{width:390,height:850},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+port+'/torre-v158-v159-lab.html?arena_lab=blue154',
     {waitUntil:'domcontentloaded',timeout:50000});
  try{await page.waitForFunction(()=>window.PokemonTorreV158159Lab?.diagnostics()&&
   typeof window.PokemonTorreLocalCombatTestV47?.start==='function',null,{timeout:65000});}
  catch(e){console.error('V158+159 boot',JSON.stringify(await page.evaluate(()=>({
    title:document.title,url:location.href,lab:window.PokemonTorreV158159Lab?.diagnostics?.(),
    boot:window.PokemonTorreV158159Boot,flag:window.__V158_159_LAB,
    qa:typeof window.PokemonTorreLocalCombatTestV47?.start,
    status:document.querySelector('#pt-status')?.textContent,
    body:document.body.textContent.slice(0,420)
   }))));throw e;}
  const isolation=await page.evaluate(()=>{
    localStorage.setItem('v158159_test','sandbox');
    return {key:Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)).find(k=>k?.includes('v158159_test')),
       val:localStorage.getItem('v158159_test')};
  });
  assert.equal(isolation.key,'__torre_lab_v158_159__v158159_test');
  assert.equal(isolation.val,'sandbox');
  const started=await page.evaluate(()=>window.PokemonTorreLocalCombatTestV47.start(25,74));
  assert(started,'Kanto Pikachu vs Geodude battle start');
  await page.waitForFunction(()=>window.PokemonTorreV158159Lab?.diagnostics().active,null,{timeout:25000});
  await page.waitForFunction(()=>window.PokemonTorreV158159Lab?.diagnostics().actors>0,null,{timeout:40000});
  const first=await page.evaluate(()=>window.PokemonTorreV158159Lab.diagnostics());
  assert(first.webgl,'shared PixiJS WebGL must render the battle');
  assert(first.animatedSpecies.some(id=>id===25||id===74),'one expanded Kanto PMD character must animate');
  await page.locator('[data-v158159="shadow"]').click();
  await page.waitForFunction(()=>window.PokemonTorreV158159Lab?.diagnostics().casts>0,null,{timeout:15000});
  await page.locator('[data-v158159="psychic"]').click();
  await page.waitForFunction(()=>window.PokemonTorreV158159Lab?.diagnostics().casts>1,null,{timeout:15000});
  await page.waitForTimeout(600);
  const final=await page.evaluate(()=>({
    lab:window.PokemonTorreV158159Lab.diagnostics(),
    overlays:document.querySelectorAll('#v158-159-lab-controls').length,
    arena:window.PokemonTorreBlue153?.diagnostics?.(),
  }));
  assert.equal(final.overlays,1);
  assert(final.lab.animatedFrames>2&&final.lab.fps>0);
  assert(final.lab.casts>=2);
  fs.mkdirSync('tests/artifacts',{recursive:true});
  await page.screenshot({path:'tests/artifacts/v158-v159-kanto-android.png'});
  console.log('V158+V159 CHROME PASS',JSON.stringify({isolation,first,final,errors}));
  assert.equal(errors.length,0,'no unhandled browser errors');
 }finally{
  if(browser)await browser.close();
  server.kill('SIGTERM');
 }
})().catch(e=>{console.error('V158+V159 CHROME FAILED',e.stack||e);process.exitCode=1;});
