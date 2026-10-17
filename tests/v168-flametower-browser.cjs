'use strict';
// V168 actual Chromium Android-size live-battle gate.
const fs=require('node:fs'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const {chromium}=require('playwright-core');
const bin=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].find(fs.existsSync);
if(!bin)throw Error('Chromium missing');
const port=18768;
const server=spawn('python',['-m','http.server',String(port),'--bind','127.0.0.1'],{cwd:process.cwd(),stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 let browser;
 try{
  await sleep(1400);
  browser=await chromium.launch({executablePath:bin,headless:true,
   args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox']});
  const page=await browser.newPage({viewport:{width:390,height:850},deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+port+'/torre-v168-flametower-lab.html',
    {waitUntil:'domcontentloaded',timeout:55000});
  await page.waitForFunction(()=>window.PokemonTorreFlameTowerV168?.diagnostics()&&
    typeof window.PokemonTorreLocalCombatTestV47?.start==='function',null,{timeout:75000});
  const isolation=await page.evaluate(()=>{
    localStorage.setItem('flame168_test','okay');
    return {key:Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)).find(k=>k?.includes('flame168_test')),
      value:localStorage.getItem('flame168_test')};
  });
  assert.equal(isolation.key,'__torre_lab_v168__flame168_test');
  assert.equal(isolation.value,'okay');
  await page.waitForFunction(()=>window.PokemonTorreFlameTowerV168.diagnostics().loadReady===4,
    null,{timeout:25000});
  const started=await page.evaluate(()=>window.PokemonTorreLocalCombatTestV47.start(4,74));
  assert(started,'Charmander and Geodude should begin a real battle');
  await page.waitForFunction(()=>window.PokemonTorreFlameTowerV168?.diagnostics().active,null,{timeout:25000});
  await page.waitForFunction(()=>window.PokemonTorreFlameTowerV168?.diagnostics().webgl,null,{timeout:25000});
  await page.locator('#v168-panel-toggle').click();
  const kinds=['tower','flamethrower','blast','punch'];
  for(const kind of kinds){
   await page.locator('[data-flame168="'+kind+'"]').click();
   await page.waitForFunction(n=>window.PokemonTorreFlameTowerV168?.diagnostics().flames>=n,
      kinds.indexOf(kind)+1,{timeout:10000});
  }
  await page.waitForTimeout(490);
  const d=await page.evaluate(()=>window.PokemonTorreFlameTowerV168?.diagnostics());
  assert(d,'lab diagnostics available');
  assert(d.webgl&&d.active,'Pixi WebGL battle renders');
  assert.equal(d.flames,4,'all four fire previews triggered');
  assert.equal(d.loadReady,4,'all spritesheets were decoded');
  assert.equal(d.loadFailed,0,'every atlas loaded');
  assert(d.framesDrawn>=28,'animated fire frames must visibly progress');
  assert(d.contactDashes>=1,'Fire Punch must have a contact motion');
  assert(d.dashOffsets>=2,'physical Pokémon sprite visually lunges toward opponent');
  assert(d.impacts>=1,'impact frame occurs');
  assert(d.activeCasts<=4,'bounded concurrent GPU sprites');
  assert.deepEqual(d.atlasFrames,{tower:32,flamethrower:32,blast:32,punch:24});
  assert(d.previews.includes('punch'),'contact Fire Punch was triggered');
  assert.equal(d.savedMovesUntouched,true);
  assert.equal(d.originalCampaignPreserved,true);
  for(const file of ['flame-tower-32.png','flamethrower-32.png','fire-blast-32.png','fire-punch-24.png']){
   const response=await page.request.get('http://127.0.0.1:'+port+'/assets/flame-v168/'+file);
   assert.equal(response.status(),200,'missing '+file);
   const bytes=await response.body();
   assert(bytes.length>3000,'near-empty atlas '+file);
   assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  }
  fs.mkdirSync('tests/artifacts',{recursive:true});
  await page.screenshot({path:'tests/artifacts/v168-flametower-battle-mobile.png'});
  console.log('V168 CHROME PASS',JSON.stringify({isolation,diagnostics:d,errors}));
  assert.equal(errors.length,0,'JavaScript must not throw errors');
 }finally{
  if(browser)await browser.close();
  server.kill('SIGTERM');
 }
})().catch(e=>{console.error('V168 CHROME FAILED',e.stack||e);process.exitCode=1;});
