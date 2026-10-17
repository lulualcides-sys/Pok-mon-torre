'use strict';
/* V157: real Android-sized Chromium smoke of the original game's five-stage LAB COPY. */
const {spawn}=require('node:child_process');
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
const port=18762;
const bin=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].find(fs.existsSync);
if(!bin)throw Error('Chrome/Chromium missing');
const server=spawn('python',['-m','http.server',String(port),'--bind','127.0.0.1'],{cwd:process.cwd(),stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 let browser;
 try{
  await sleep(1250);
  browser=await chromium.launch({executablePath:bin,headless:true,
   args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox']});
  const page=await browser.newPage({viewport:{width:390,height:850},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+port+'/torre-v157-lab.html?arena_lab=blue154',
   {waitUntil:'domcontentloaded',timeout:40000});
  try{await page.waitForFunction(()=>window.PokemonTorreV157Lab?.diagnostics()&&
    typeof window.PokemonTorreLocalCombatTestV47?.start==='function',
    null,{timeout:35000});}
  catch(e){
   console.error('V157 boot',JSON.stringify(await page.evaluate(()=>({
    url:location.href,title:document.title,status:document.querySelector('#pt-status')?.textContent,
    lab:window.PokemonTorreV157Lab?.diagnostics?.(),boot:window.PokemonTorreV157Boot,flag:window.__V157_LAB,pixi:!!window.PIXI,qa:typeof window.PokemonTorreLocalCombatTestV47?.start,body:document.body.textContent.slice(0,300)
   }))));throw e;
  }
  const initial=await page.evaluate(()=>{
   localStorage.setItem('v157_isolation_test','sandbox');
   return {d:window.PokemonTorreV157Lab.diagnostics(),
    key:Array.from({length:localStorage.length},(_,i)=>localStorage.key(i))
      .find(k=>k?.includes('v157_isolation_test')),
    value:localStorage.getItem('v157_isolation_test')};
  });
  assert.equal(initial.key,'__torre_lab_v157__v157_isolation_test');
  assert.equal(initial.value,'sandbox');
  assert(initial.d.stages.every(Boolean));
  const battle=await page.evaluate(()=>window.PokemonTorreLocalCombatTestV47.start(150,151));
  assert(battle,'real Pokemon Torre battle starter must be available');
  await page.waitForFunction(()=>window.PokemonTorreV157Lab?.diagnostics().active,null,{timeout:25000});
  await page.waitForTimeout(2200);
  let frames=await page.evaluate(()=>window.PokemonTorreV157Lab.diagnostics());
  assert(frames.webgl,'existing shared PixiJS renderer must work in full game');
  assert(frames.actors>0,'at least one PMD actor must be animated by PixiJS');
  await page.locator('[data-v157="shadow"]').click();
  await page.waitForFunction(()=>window.PokemonTorreV157Lab?.diagnostics().casts>0,null,{timeout:10000});
  await page.locator('[data-v157="psychic"]').click();
  await page.waitForFunction(()=>window.PokemonTorreV157Lab?.diagnostics().casts>1,null,{timeout:10000});
  const final=await page.evaluate(()=>({
   lab:window.PokemonTorreV157Lab.diagnostics(),
   arena:window.PokemonTorreBlue153?.diagnostics?.(),
   protectedMoveCount:window.PokemonTorreApprovedMarkV122?.diagnostics?.()?.known,
   overlayCount:document.querySelectorAll('#v157-lab-controls').length
  }));
  assert.equal(final.overlayCount,1,'one LAB menu only');
  assert(final.arena?.enabled,'full game uses tested blue pixel arena');
  assert(final.lab.animatedFrames>2&&final.lab.fps>0,'animation and performance samples are real');
  fs.mkdirSync('tests/artifacts',{recursive:true});
  await page.screenshot({path:'tests/artifacts/v157-integrated-android.png'});
  console.log('V157 REAL CHROME PASS',JSON.stringify({initial,final,errors}));
  assert.equal(errors.length,0,'no unhandled browser errors');
 }finally{if(browser)await browser.close();server.kill('SIGTERM');}
})().catch(e=>{console.error('V157 CHROME FAILED',e.stack||e);process.exitCode=1;});
