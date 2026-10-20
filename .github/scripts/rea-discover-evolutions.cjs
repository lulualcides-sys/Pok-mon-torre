'use strict';
const fs=require('node:fs');
const {chromium}=require('/tmp/rea-evolution/node_modules/playwright-core');
const out='rea-evolution-discovery';
fs.mkdirSync(out,{recursive:true});
const domain='https://www.pokearena2d.com/';
const files=['src-3a160064ab/datos.js','src-3a160064ab/luchador.js',
 'src-3a160064ab/controles.js','src-3a160064ab/escenas/batalla.js',
 'src-3a160064ab/escenas/pokedex.js','src-3a160064ab/escenas/seleccion.js',
 'src-3a160064ab/habilidades.js','src-3a160064ab/escenas/liga.js'];
const report={timestamp:new Date().toISOString(),source:domain,modules:[],roster:[],errors:[]};
async function main(){
 const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  const ctx=await browser.newContext();
  const page=await ctx.newPage();
  await page.goto(domain,{waitUntil:'domcontentloaded',timeout:50000});
  report.inspect=await page.evaluate(async()=>{
   const d=await import('/src-3a160064ab/datos.js');
   const mons=Array.isArray(d.ROSTER)?d.ROSTER:[];
   const summarize=(v,depth=0)=>{
    if(v===undefined)return '(undefined)';
    if(v===null||typeof v!=='object')return v;
    if(depth>3)return Array.isArray(v)?'[Array]':'[Object]';
    if(Array.isArray(v))return v.slice(0,35).map(x=>summarize(x,depth+1));
    return Object.fromEntries(Object.entries(v).slice(0,35).map(([k,w])=>[k,summarize(w,depth+1)]));
   };
   return {
    exportedKeys:Object.keys(d),
    rosterLength:mons.length,
    creatures:mons.map((p,i)=>({
     index:i,id:p.id,name:p.nombre||p.name||p.id,
     allKeys:Object.keys(p),
     line:p.linea??p.line??p.evoluciones??p.etapas??null,
     evolutions:p.evoluciones??p.evolucion??p.formas??null,
     level:p.nivel??p.nivelInicial??null,
     kitKeys:Object.keys(p.kit||{}),
     baseMoves:Object.fromEntries(Object.entries(p.kit||{}).map(([k,m])=>[k,{name:m?.nombre,keys:Object.keys(m||{})}])),
     stageKeys:Object.entries(p).filter(([k])=>/etap|evol|line|nivel|forma|mov|kit|exp/i.test(k)).map(([k,v])=>({key:k,value:summarize(v)})),
     nested: summarize(p,0)
    }))
   };
  });
  fs.writeFileSync(out+'/ROSTER-EVOLUTIONS.json',JSON.stringify(report.inspect,null,2));
  for(const f of files){
   try{
    const r=await page.request.get(domain+f,{timeout:24000});
    const code=await r.text();
    const matches=[...code.matchAll(/evoluc|evolv|etapa|evolu|subirNivel|porNivel|nivelEvol|linea|expEvol|formaEvol|evolucionActiva|transformar/gi)];
    // Entire modules aren't archived: only narrow executable-context excerpts.
    const spots=matches.slice(0,130).map(m=>({term:m[0],offset:m.index,
     excerpt:code.slice(Math.max(0,m.index-230),Math.min(code.length,m.index+360))}));
    report.modules.push({file:f,status:r.status(),size:code.length,totalMatches:matches.length,spots});
   }catch(e){report.errors.push({file:f,error:String(e).slice(0,400)})}
  }
 }finally{await browser.close()}
}
main().catch(e=>report.errors.push({fatal:String(e.stack||e).slice(0,600)})).finally(()=>{
 fs.writeFileSync(out+'/EVOLUTION-SOURCE-REPORT.json',JSON.stringify(report,null,2));
 const short={roster:report.inspect?.rosterLength||0,creatures:report.inspect?.creatures?.map(x=>({index:x.index,name:x.name,stageKeys:x.stageKeys.map(y=>y.key)}))||[],
  modules:report.modules.map(m=>({file:m.file,matches:m.totalMatches})),errors:report.errors};
 fs.writeFileSync(out+'/SUMMARY.json',JSON.stringify(short,null,2));
 console.log(JSON.stringify(short));
 if(report.errors.some(x=>x.fatal)||!report.inspect?.rosterLength)process.exitCode=1;
});
