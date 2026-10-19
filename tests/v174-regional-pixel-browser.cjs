'use strict';
// Real mobile-sized Chrome smoke for V174's native 2D battle with shared Pixi WebGL
// scene-generation (not a new 3D engine or external video layer).
const assert=require('node:assert/strict'),fs=require('node:fs');
const http=require('node:http'),path=require('node:path');
const {chromium}=require('playwright-core');
const chrome=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].find(fs.existsSync);
if(!chrome)throw Error('Chromium unavailable');
const root=process.cwd();
const serve=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const file=path.resolve(root,'.'+pathname);
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 const ext=path.extname(file);
 const kind={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.txt':'text/plain; charset=utf-8',
  '.json':'application/json','.png':'image/png','.gif':'image/gif','.webp':'image/webp','.xml':'application/xml'}[ext]||'application/octet-stream';
 fs.stat(file,(err,s)=>{
  if(err||!s.isFile()){res.writeHead(404).end();return;}
  res.setHeader('Content-Type',kind);
  fs.createReadStream(file).pipe(res);
 });
});
(async()=>{
 let browser;
 try{
  await new Promise(resolve=>serve.listen(18775,'127.0.0.1',resolve));
  browser=await chromium.launch({executablePath:chrome,headless:true,
   args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-gpu-sandbox']});
  const page=await browser.newPage({viewport:{width:390,height:850},deviceScaleFactor:1});
  const fatal=[];page.on('pageerror',e=>fatal.push(e.message));
  await page.goto('http://127.0.0.1:18775/torre-v174-light-2p5d-lab.html',{waitUntil:'domcontentloaded',timeout:50000});
  await page.waitForFunction(()=>window.PokemonTorreV174Regional?.diagnostics()?.enabled&&
   typeof window.PokemonTorreLocalCombatTestV47?.start==='function',null,{timeout:95000});
  const before=await page.evaluate(()=>window.PokemonTorreV174Regional.regions());
  assert.equal(before.length,8);
  assert.equal(before[0].leader,'Brock');
  assert.equal(before[7].leader,'Giovanni');
  const started=await page.evaluate(()=>window.PokemonTorreLocalCombatTestV47.start(25,74));
  assert(started,'battle must actually start');
  await page.waitForFunction(()=>{
   const d=window.PokemonTorreV174Regional?.diagnostics();
   return d&&d.generated>=1&&d.applied>=1&&d.frames>=12;
  },null,{timeout:35000});
  const data=await page.evaluate(()=>({
   regional:window.PokemonTorreV174Regional.diagnostics(),
   three:typeof window.THREE,
   threeStage:document.querySelectorAll('canvas[data-arena="three173"]').length,
   native:document.querySelectorAll('#battleCanvas').length,
   fire:!!window.PokemonTorreFlamethrowerApprovedV172?.installed,
   water:!!window.PokemonTorreWaterV128?.installed
  }));
  assert.equal(data.three,'undefined');
  assert.equal(data.threeStage,0);
  assert.equal(data.native,1);
  assert.equal(data.regional.extraWebGLContexts,0);
  assert.equal(data.regional.leader,'Brock');
  assert.equal(data.regional.leaderRoom,false);
  assert.equal(data.regional.dynamicShadowPasses,0);
  assert.equal(data.regional.renderer,'shared-PixiJS-WebGL-snapshot');
  assert.equal(data.regional.errors.length,0,'region should render without fallback error');
  assert(data.fire&&data.water,'approved Flamethrower + water effects preserved');
  assert.equal(fatal.length,0,'no unhandled Chrome game errors');
  fs.mkdirSync('tests/artifacts',{recursive:true});
  await page.screenshot({path:'tests/artifacts/v174-regional-pixel-mobile.png'});
  console.log('V174 REGIONAL MOBILE PASS',JSON.stringify(data));
 }finally{
  if(browser)await browser.close();
  await new Promise(resolve=>serve.close(resolve));
 }
})().catch(e=>{console.error('V174 REGIONAL MOBILE FAILED',e.stack||e);process.exitCode=1;});
