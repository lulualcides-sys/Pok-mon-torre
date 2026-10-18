'use strict';
// V171 WebGL flame-flow smoke: verify browser compiles shader and visible stream advances.
const fs=require('node:fs'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const {chromium}=require('playwright-core');
const bin=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].find(fs.existsSync);
if(!bin)throw Error('Chromium unavailable');
const port=18769;
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
  page.on('pageerror',e=>errors.push('page: '+e.message));
  page.on('console',msg=>{if(msg.type()==='error')errors.push('console: '+msg.text());});
  await page.goto('http://127.0.0.1:'+port+'/torre-v171-flamethrower-uv-lab.html',
    {waitUntil:'domcontentloaded',timeout:55000});
  await page.waitForFunction(()=>window.PokemonTorreFlamethrowerV171?.diagnostics()&&
    typeof window.PokemonTorreLocalCombatTestV47?.start==='function',null,{timeout:65000});
  const iso=await page.evaluate(()=>{
    localStorage.setItem('flame169','yes');
    return {key:Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)).find(k=>k?.endsWith('flame169')),
      value:localStorage.getItem('flame169')};
  });
  assert.equal(iso.key,'__torre_lab_v171__flame169');
  assert.equal(iso.value,'yes');
  assert(await page.evaluate(()=>window.PokemonTorreLocalCombatTestV47.start(4,74)));
  await page.waitForFunction(()=>window.PokemonTorreFlamethrowerV171?.diagnostics().webgl,null,{timeout:30000});
  await page.locator('#v171-stream-button').waitFor({state:'visible',timeout:15000});
  await page.locator('#v171-stream-button').click();
  await page.waitForFunction(()=>window.PokemonTorreFlamethrowerV171?.diagnostics().casts>=1,
    null,{timeout:8000});
  await page.waitForTimeout(440);
  const first=await page.evaluate(()=>window.PokemonTorreFlamethrowerV171.diagnostics());
  assert.equal(first.activeStreams,1,'one continuous jet, no clusters or polygons');
  assert(first.shaderFrames>=4,'shader updates along battle loop');
  assert(first.uniforms[0].uReach>.9,'nozzle reached the enemy');
  assert(first.uniforms[0].uOpacity>.5,'beam persists over time');
  assert.equal(first.flameMode,'true-UV-mesh-continuous-fire');
  assert.equal(first.previews,1);
  assert.equal(first.preservedOriginal,true);
  // Screenshots can take 0.8-1.5s on SwiftShader; capture AFTER checking
  // live uniforms so a legitimate 1.33s fire cast cannot expire during testing.
  await page.waitForTimeout(155);
  const second=await page.evaluate(()=>window.PokemonTorreFlamethrowerV171.diagnostics());
  assert(second.shaderFrames>first.shaderFrames,'continuous shader must animate while fully extended');
  assert(second.uniforms[0].uTime>first.uniforms[0].uTime+.02,'material texture flows toward target');
  assert.equal(second.activeStreams,1);
  fs.mkdirSync('tests/artifacts',{recursive:true});
  await page.screenshot({path:'tests/artifacts/v171-flamethrower-flow.png'});

  // Publish a compact battle capture to the CI log for a REAL visual review.
  // A passing JS test by itself did not catch the rectangle in V169.
  const thumbCode="from PIL import Image\nfrom io import BytesIO\nimport base64\nim=Image.open('tests/artifacts/v171-flamethrower-flow.png').convert('RGB')\nim.thumbnail((390,850))\nout=BytesIO();im.save(out,'JPEG',quality=68,optimize=True)\nprint(base64.b64encode(out.getvalue()).decode())";
  const probe=require('node:child_process').spawnSync('python',['-c',thumbCode],{encoding:'utf8'});
  assert.equal(probe.status,0,'CI visual evidence capture must succeed');
  console.log('V171_BATTLE_JPEG_B64:'+probe.stdout.trim());

  assert.equal(second.errors.length,0,'no PixiJS filter errors');
  await page.waitForFunction(()=>window.PokemonTorreFlamethrowerV171?.diagnostics().finished>=1,
     null,{timeout:6500});
  const done=await page.evaluate(()=>window.PokemonTorreFlamethrowerV171.diagnostics());
  assert.equal(done.activeStreams,0,'flame stops without remaining on menu');
  assert.equal(done.errors.length,0);
  console.log('V171 CONSOLE DIAGNOSTICS',JSON.stringify({errors,done}));
  // Old campaign assets can emit nonfatal 404 console entries in the test
  // server. Only block actual page exceptions or shader/WebGL compile faults.
  const critical=errors.filter(x=>x.startsWith('page: ')||
    /GLSL|shader|WebGL|compile|program link|fragment|INVALID_OPERATION|ERROR: 0:/i.test(x));
  assert.deepEqual(critical,[],'no shader compilation or uncaught runtime exceptions');
  console.log('V171 CHROME PASS',JSON.stringify({isolation:iso,first,second,done,errors}));
 }finally{
  if(browser)await browser.close();
  server.kill('SIGTERM');
 }
})().catch(e=>{console.error('V171 CHROME FAILED',e.stack||e);process.exitCode=1;});
