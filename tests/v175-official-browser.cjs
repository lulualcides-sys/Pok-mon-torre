'use strict';
// Browser smoke of real official game (not arena/move lab).
const assert=require('node:assert/strict'),fs=require('node:fs'),{spawn}=require('node:child_process');
const {chromium}=require('playwright-core');
const bin=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].find(fs.existsSync);
if(!bin)throw Error('Chromium unavailable');
const port=18779,server=spawn('python',['-m','http.server',String(port),'--bind','127.0.0.1'],{cwd:process.cwd(),stdio:'ignore'});
const sleep=t=>new Promise(r=>setTimeout(r,t));
(async()=>{
 let browser;
 try{
  await sleep(1500);
  browser=await chromium.launch({executablePath:bin,headless:true,
   args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox']});
  const page=await browser.newPage({viewport:{width:390,height:850},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('http://127.0.0.1:'+port+'/index.html',{waitUntil:'domcontentloaded',timeout:55000});
  await page.waitForFunction(()=>typeof window.PokemonTorreV175Diagnostics==='function'&&
   typeof window.PokemonTorreLocalCombatTestV47?.start==='function',null,{timeout:110000});
  const info=await page.evaluate(()=>window.PokemonTorreV175Diagnostics());
  assert.equal(info.speciesCount,151);
  assert.equal(Object.keys(info.typeCounts).length,18);
  assert(Object.values(info.typeCounts).every(n=>n===16));
  assert(info.protectedMoves.includes('Surf')&&info.protectedMoves.includes('Bubble'));
  assert(await page.evaluate(()=>window.PokemonTorreLocalCombatTestV47.start(7,74)),
    'Squirtle vs Geodude battle must start');
  await page.waitForSelector('button.skillV8',{timeout:40000});
  const skills=await page.locator('button.skillV8').allInnerTexts();
  assert(skills.length>=4,'four battle buttons must remain visible');
  assert(!skills.some(s=>/Bolhas|Pistola d.Água|Lança-Chamas/i.test(s)),
    'English display should not expose previous Portuguese move labels: '+JSON.stringify(skills));
  assert.deepEqual(errors,[],'game JavaScript exceptions');
  const water=await page.evaluate(()=>window.PokemonTorreWaterV128?.installed);
  assert.equal(water,true,'Bubble and Water Gun approved V128 remains installed');
  const region=await page.evaluate(()=>window.PokemonTorreV174Regional?.diagnostics()?.official);
  assert.equal(region,true,'V174 regional stage remains official');
  console.log('V175 REAL BROWSER PASS',JSON.stringify({skills,region,water,species:info.speciesCount,errors}));
 }finally{if(browser)await browser.close();server.kill('SIGTERM')}
})().catch(e=>{console.error('V175 BROWSER FAIL',e.stack||e);process.exitCode=1;});

