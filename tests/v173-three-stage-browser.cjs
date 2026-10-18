'use strict';
const fs=require('node:fs'), assert=require('node:assert/strict'),{spawn,spawnSync}=require('node:child_process');
const {chromium}=require('playwright-core');
const bin=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].find(fs.existsSync);
if(!bin)throw Error('Chrome not installed');
const port=18773,server=spawn('python',['-m','http.server',String(port),'--bind','127.0.0.1'],{cwd:process.cwd(),stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 let browser;
 try{
  await sleep(1400);
  browser=await chromium.launch({executablePath:bin,headless:true,
   args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox']});
  const page=await browser.newPage({viewport:{width:390,height:850},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('console',x=>{if(x.type()==='error'&&/Three|WebGL|shader|THREE/.test(x.text()))errors.push(x.text());});
  await page.goto('http://127.0.0.1:'+port+'/torre-v173-real-3d-lab.html',
   {waitUntil:'domcontentloaded',timeout:50000});
  try{
   await page.waitForFunction(()=>window.PokemonTorreV173Stage?.diagnostics()&&
    typeof window.PokemonTorreLocalCombatTestV47?.start==='function',null,{timeout:90000});
  }catch(err){
   const probe=await page.evaluate(()=>({lib:typeof window.THREE,flag:window.__V173_LAB,
    stage:window.PokemonTorreV173Stage?.diagnostics?.(),status:document.querySelector('#pt-status')?.textContent,
    title:document.title,url:location.href}));
   console.error('V173 LOADER DIAGNOSTICS',JSON.stringify(probe));throw err;
  }
  assert(await page.evaluate(()=>!!window.THREE?.PerspectiveCamera),'Three.js library must be loaded');
  const isolated=await page.evaluate(()=>{
   localStorage.setItem('v173_test','sandbox');
   const keys=Array.from({length:localStorage.length},(_,i)=>localStorage.key(i));
   return {key:keys.find(k=>k.includes('v173_test')),value:localStorage.getItem('v173_test')};
  });
  assert.equal(isolated.key,'__torre_lab_v173__v173_test');
  assert.equal(isolated.value,'sandbox');
  assert(await page.evaluate(()=>window.PokemonTorreLocalCombatTestV47.start(25,74)),
   'Pikachu vs Geodude start battle normally');
  await page.waitForFunction(()=>window.PokemonTorreV173Stage?.diagnostics().webgl,
   null,{timeout:40000});
  const first=await page.evaluate(()=>window.PokemonTorreV173Stage.diagnostics());
  assert(first.three&&first.webgl,'actual Three.js GPU renderer');
  assert.equal(first.renderer,'THREE.WebGLRenderer');
  assert(first.geometry3d>=25,'3D room needs real wall/stone/door meshes');
  assert(first.lights>=4,'real scene lights exist');
  assert(first.shadowReceivers>=1,'real shadow receiving floor');
  assert.equal(first.activeStages,1,'one isolated 3D stage per battle');
  await page.waitForFunction(()=>window.PokemonTorreV173Stage?.diagnostics().actors3d>=2,null,{timeout:42000});
  await page.waitForFunction(()=>window.PokemonTorreV173Stage?.diagnostics().animatedFrames>=3,null,{timeout:15000});
  const done=await page.evaluate(()=>({
   d:window.PokemonTorreV173Stage.diagnostics(),
   THREE:window.THREE?.REVISION,
   three:document.querySelectorAll('canvas[data-arena="three173"]').length,
   original:document.querySelectorAll('#battleCanvas').length,
   approvedFire:!!window.PokemonTorreFlamethrowerApprovedV172?.installed
  }));
  assert.equal(done.three,1);
  assert.equal(done.original,1,'original battle/collision canvas preserved');
  assert.deepEqual(done.d.actorSides.sort(),['enemy','player']);
  assert(done.d.animatedSpecies.includes(25)&&done.d.animatedSpecies.includes(74));
  assert(done.d.animatedFrames>=3,'actual animated PMD 2D sprites on 3D world');
  assert(done.d.projectionChecks>=2,'3D billboard location derived from game hitboxes');
  assert.equal(done.d.approvedMovesIntact,true);
  assert.equal(done.d.campaignUntouched,true);
  assert.equal(done.d.errors.length,0,'scene, sprites and projections error-free');
  assert(done.approvedFire,'official V172 fire moves preserved in battle');
  fs.mkdirSync('tests/artifacts',{recursive:true});
  await page.screenshot({path:'tests/artifacts/v173-real-3d-chrome-mobile.png',animations:'disabled'});
  const img="from PIL import Image\nimport base64,io\np=Image.open('tests/artifacts/v173-real-3d-chrome-mobile.png').convert('RGB')\np.thumbnail((390,850))\nb=io.BytesIO();p.save(b,'JPEG',quality=67,optimize=True)\nprint(base64.b64encode(b.getvalue()).decode())";
  const shot=spawnSync('python',['-c',img],{encoding:'utf8',maxBuffer:1024*1024});
  assert.equal(shot.status,0,'actual screenshot evidence saved');
  console.log('V173_BATTLE_JPEG_B64:'+shot.stdout.trim());
  console.log('V173 CHROME PASS',JSON.stringify({isolated,first,done,errors}));
  assert.equal(errors.length,0,'no critical runtime errors');
 }finally{
  if(browser)await browser.close();
  server.kill('SIGTERM');
 }
})().catch(err=>{console.error('V173 CHROME FAILED',err.stack||err);process.exitCode=1;});
