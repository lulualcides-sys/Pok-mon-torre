'use strict';
// Real Chromium smoke: open Pokémon Torre and render both V187 moves in battle.
// Does NOT alter a saved game, confirm native damage, or auto-approve the art.
const fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const { chromium }=require('/tmp/fire187-test/node_modules/playwright-core');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html','.js':'application/javascript','.txt':'text/plain',
 '.png':'image/png','.webp':'image/webp','.json':'application/json','.css':'text/css',
 '.svg':'image/svg+xml','.jpg':'image/jpeg'};
const server=http.createServer((req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+path.sep))throw Error('outside directory');
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
  res.setHeader('Cache-Control','no-cache');
  res.end(fs.readFileSync(file));
 }catch(e){res.statusCode=404;res.end('not found');}
});
async function run(){
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const port=server.address().port;
 let browser;
 fs.mkdirSync('fire187-test-report',{recursive:true});
 const log=[],errors=[];
 try{
  browser=await chromium.launch({
   executablePath:process.env.CHROME_BIN||'/usr/bin/google-chrome',
   headless:true,timeout:30000,
   args:['--no-sandbox','--disable-dev-shm-usage','--ignore-gpu-blocklist',
     '--enable-webgl','--use-gl=angle','--use-angle=swiftshader']
  });
  const page=await browser.newPage({viewport:{width:960,height:720},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(String(e).slice(0,500)));
  page.on('console',m=>{if(m.type()==='error')log.push(m.text().slice(0,500))});
  const url='http://127.0.0.1:'+port+'/?fire187=preview&build=rea-smoke';
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(()=>window.PokemonTorreReaFireV187?.installed===true,
    null,{timeout:100000,polling:450});
  const setup=await page.evaluate(()=>({
   installed:window.PokemonTorreReaFireV187?.installed,
   v172:!!window.PokemonTorreFlamethrowerApprovedV172,
   v183:!!window.PokemonTorreFireBlastV183,
   qa:typeof window.PokemonTorreLocalCombatTestV47?.start==='function',
   bridge:!!window.PokemonTorrePixelFlyingBridge?.labStage
  }));
  if(!setup.installed||setup.v172||setup.v183||!setup.qa||!setup.bridge)
   throw Error('Preview configuration invalid: '+JSON.stringify(setup));
  await page.evaluate(()=>window.PokemonTorreLocalCombatTestV47.start(150,143));
  await page.waitForFunction(()=>{const d=window.PokemonTorreReaFireV187?.diagnostics();return d?.loaded?.stream&&d?.loaded?.ember&&d?.loaded?.daimonji;},null,{timeout:60000,polling:500});
  const sheetAudit=await page.evaluate(()=>window.PokemonTorreReaFireV187?.diagnostics().assetSource);
  if(!sheetAudit?.includes('aseprite'))throw Error('V187 is not using loaded editable LibreSprite atlases');
  await page.waitForTimeout(300);
  const first=await page.evaluate(()=>window.PokemonTorreReaFireV187.visualTest('flamethrower'));
  await page.waitForTimeout(500);
  const flame=await page.evaluate(()=>window.PokemonTorreReaFireV187.diagnostics());
  await page.screenshot({path:'fire187-test-report/flamethrower.png'});
  if(!first||flame.casts.flamethrower<1||flame.frames<1)
   throw Error('Flamethrower did not render in battle: '+JSON.stringify(flame));
  const second=await page.evaluate(()=>window.PokemonTorreReaFireV187.visualTest('fireblast',true));
  await page.waitForTimeout(300);
  const blast=await page.evaluate(()=>window.PokemonTorreReaFireV187.diagnostics());
  await page.screenshot({path:'fire187-test-report/fireblast-impact.png'});
  if(!second||blast.casts.fireblast<1||blast.frames<=flame.frames||blast.confirmedImpacts<1)
   throw Error('Fire Blast impact not rendered: '+JSON.stringify(blast));
  if(blast.errors.length)throw Error('Rendering errors: '+JSON.stringify(blast.errors));
  await page.evaluate(()=>window.PokemonTorreLocalCombatTestV47.start(6,143)); // Charizard
  await page.waitForTimeout(1100);
  const available=await page.evaluate(()=>window.PokemonTorreReaFireV187.availableMoves());
  const nativeBefore=await page.evaluate(()=>window.PokemonTorreReaFireV187.diagnostics());
  // Inventory the ACTUAL equipped moves. Artificial visual test above is not
  // treated as proof of a live cast or synchronized damage.
  fs.writeFileSync('fire187-test-report/equipped-charizard.json',
    JSON.stringify({available,nativeBefore},null,2));
  console.log('V187 CHARIZARD EQUIPPED:',JSON.stringify(available));
  const result={setup,previews:{flamethrower:first,fireblast:second},
   diagnostics:blast,browserErrors:errors,consoleErrors:log};
  fs.writeFileSync('fire187-test-report/RESULTADO.json',JSON.stringify(result,null,2));
  console.log('PASS fire187 - actual Chromium battle render: '+JSON.stringify(result));
 }catch(err){
  fs.writeFileSync('fire187-test-report/FALHA.txt',String(err.stack||err)+'\n'+JSON.stringify({errors,log},null,2));
  throw err;
 }finally{await browser?.close();server.close();}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
