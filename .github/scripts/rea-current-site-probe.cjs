'use strict';
const fs=require('node:fs');
const {chromium}=require('/tmp/rea-path-check/node_modules/playwright-core');
const OUT='rea-site-path-diagnostics';
fs.mkdirSync(OUT,{recursive:true});
const site='https://www.pokearena2d.com/';
const report={date:new Date().toISOString(),urls:[],scripts:[],requests:[],errors:[]};
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
 const ctx=await browser.newContext(),page=await ctx.newPage();
 page.on('requestfailed',r=>report.errors.push({resource:r.url(),failure:r.failure()}));
 page.on('console',m=>{if(m.type()==='error')report.errors.push({console:m.text().slice(0,160)})});
 const resp=await page.goto(site,{waitUntil:'domcontentloaded',timeout:45000});
 report.page={status:resp?.status(),url:page.url(),title:await page.title()};
 await page.waitForTimeout(5500);
 report.dom=await page.evaluate(()=>({scripts:[...document.querySelectorAll('script')].map(x=>({src:x.src,type:x.type})),
  links:[...document.querySelectorAll('link')].filter(x=>x.href.endsWith('.js')).map(x=>x.href),
  resources:performance.getEntriesByType('resource').map(x=>x.name).filter(x=>x.includes('.js')).slice(0,35),
  body:document.body?.innerText?.slice(0,300),
  canvas:document.querySelectorAll('canvas').length}));
 const parts=['src-3a160064ab/datos.js','src-3a160064ab/luchador.js','src-3a160064ab/main.js'];
 for(const p of parts)try{
  const r=await page.request.get(site+p,{timeout:12000});
  const txt=await r.text();
  report.requests.push({url:site+p,status:r.status(),contentType:r.headers()['content-type'],length:txt.length,first:txt.slice(0,135)});
 }catch(e){report.requests.push({url:p,error:String(e).slice(0,250)})}
 try{report.dynamic=await page.evaluate(async()=>{const m=await import('/src-3a160064ab/datos.js');return {ok:true,roster:m.ROSTER?.length}})}
 catch(e){report.dynamic={error:String(e).slice(0,450)}}
 }finally{await browser.close()}
})().catch(e=>report.errors.push({fatal:String(e)})).finally(()=>{
 fs.writeFileSync(OUT+'/SITE-REPORT.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify(report).slice(0,15000));
});
