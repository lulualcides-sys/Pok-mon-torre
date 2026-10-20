'use strict';
// Browser-local save-state research, not account access and not online cheating.
// The experiment uses a NEW disposable Playwright browser profile and plays
// only public offline Training. No backend state or user cookies are modified.
const fs=require('node:fs'), crypto=require('node:crypto');
const {chromium}=require('/tmp/rea-unlock-test/node_modules/playwright-core');
const OUT='rea-local-unlock-proof';
fs.mkdirSync(OUT,{recursive:true});
const SITE='https://www.pokearena2d.com/', MOD='/src-3a160064ab/liga.js';
const report={site:SITE,mode:'local-disposable-session',serverModified:false,
 accountLogin:false,originalProfileTouched:false,
 tested:new Date().toISOString(),errors:[],screens:[]};
async function observe(browser,override,label){
 const ctx=await browser.newContext({viewport:{width:780,height:437}});
 if(override)await ctx.addInitScript(()=>{
  if(location.host==='www.pokearena2d.com'){
   localStorage.setItem('pa-liga',JSON.stringify({v:1,vencidos:{},legado:true,visto:true}));
  }
 });
 const page=await ctx.newPage();
 await page.goto(SITE,{waitUntil:'domcontentloaded',timeout:50000});
 await page.waitForTimeout(10500);
 const status=await page.evaluate(async p=>{
  const m=await import(p);
  const r=typeof m.resumen==='function'?m.resumen():null;
  return {moduleExports:Object.keys(m).slice(0,45),
   leagueState:r,localSavePresent:!!localStorage.getItem('pa-liga'),
   savedFlags:Object.keys(JSON.parse(localStorage.getItem('pa-liga')||'{}'))};
 },MOD);
 await page.mouse.click(390,183);await page.waitForTimeout(2500);
 await page.mouse.click(390,282);await page.waitForTimeout(3800);
 const screenshot=OUT+'/'+label+'-selection.png';
 await page.screenshot({path:screenshot});report.screens.push(screenshot);
 if(override){
  // Index 3 is locked in the original four-character public roster.
  await page.mouse.click(222,78);await page.waitForTimeout(450);
  await page.screenshot({path:OUT+'/sandbox-selected-index3.png'});
  await page.mouse.click(551,243);await page.waitForTimeout(260);
  await page.mouse.click(669,78);await page.waitForTimeout(250);
  await page.mouse.click(183,385);await page.waitForTimeout(320);
  await page.screenshot({path:OUT+'/sandbox-ready-index3.png'});
  await page.mouse.click(684,393);await page.waitForTimeout(4900);
  await page.screenshot({path:OUT+'/sandbox-battle-index3.png'});
  status.battleScene=await page.evaluate(()=>{
    const canvas=document.querySelector('canvas');
    return {canvasVisible:!!canvas&&canvas.getBoundingClientRect().width>400,
      url:location.href,canvasCount:document.querySelectorAll('canvas').length};
  });
 }
 await ctx.close();
 return status;
}
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,
  args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  report.vanilla=await observe(browser,false,'vanilla');
  report.sandbox=await observe(browser,true,'sandbox');
  report.browserChange=Number(report.sandbox?.leagueState?.desbloqueados||0)-
   Number(report.vanilla?.leagueState?.desbloqueados||0);
  report.succeeded=report.browserChange>0&&report.sandbox?.battleScene?.canvasVisible===true;
 }finally{await browser.close()}
})().catch(e=>report.errors.push(String(e.stack||e).slice(0,1000))).finally(()=>{
 fs.writeFileSync(OUT+'/RESULTADO.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify(report));
 if(!report.succeeded)process.exitCode=1;
});
