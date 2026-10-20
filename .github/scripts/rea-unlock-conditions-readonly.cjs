'use strict';
// Static/public-only read of the game's own visible web client.
// Purpose: determine legitimate character availability & unlock pathways.
// Does NOT change client state, evade authentication, patch code or call private endpoints.
const fs=require('node:fs'), crypto=require('node:crypto');
const {chromium}=require('/tmp/rea-unlock-study/node_modules/playwright-core');
const OUT='rea-unlock-study';
fs.mkdirSync(OUT,{recursive:true});
const root='https://www.pokearena2d.com/';
const modules=[
 'src-3a160064ab/escenas/seleccion.js',
 'src-3a160064ab/escenas/preparar.js',
 'src-3a160064ab/escenas/pokedex.js',
 'src-3a160064ab/escenas/perfil.js',
 'src-3a160064ab/escenas/cuenta.js',
 'src-3a160064ab/escenas/liga.js',
 'src-3a160064ab/liga.js',
 'src-3a160064ab/estadisticas.js',
 'src-3a160064ab/datos.js',
 'src-3a160064ab/selector.js',
 'src-3a160064ab/main.js',
 'src-3a160064ab/escenas/batalla.js',
 'src-3a160064ab/escenas/titulo.js'
];
const terms=/desbloq|bloque|candado|unlock|locked|available|habilitado|disponible|requisit|cuenta|gratis|entreno|training|ranked|progres|niv[eé]l|registro|lineas|storage|guardado|guardar|liga|ligaAbierta|vencido|ganad|derrot|victoria/i;
const results={root,readOnly:true,modules:[],generated:new Date().toISOString(),errors:[]};
(async()=>{
 const browser=await chromium.launch({
  executablePath:'/usr/bin/google-chrome',headless:true,
  args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  const context=await browser.newContext();
  const page=await context.newPage();
  await page.goto(root,{waitUntil:'domcontentloaded',timeout:50000});
  for(const file of modules){
   try{
    const r=await page.request.get(root+file,{timeout:22000});
    if(!r.ok()){results.modules.push({file,status:r.status()});continue;}
    const src=await r.text();
    const snippets=[],lines=src.split('\n');
    for(let i=0;i<lines.length;i++){
      const line=lines[i];
      let m,rx=new RegExp(terms.source,'ig'),hits=0;
      while((m=rx.exec(line))&&hits++<100&&snippets.length<160){
       const start=Math.max(0,m.index-210),end=Math.min(line.length,m.index+320);
       snippets.push({line:i+1,keyword:m[0],excerpt:line.slice(start,end)});
      }
    }
    results.modules.push({file,status:r.status(),bytes:src.length,
      sha256:crypto.createHash('sha256').update(src).digest('hex'),
      snippets,imports:[...src.matchAll(/(?:from\s+|import\s*)['"](\.?\.\/[^'"]+)['"]/g)].map(m=>m[1]).slice(0,25)});
   }catch(e){results.modules.push({file,error:String(e).slice(0,250)})}
  }
 }finally{await browser.close()}
})().catch(e=>results.errors.push(String(e))).finally(()=>{
 fs.writeFileSync(OUT+'/UNLOCK-AUDIT.json',JSON.stringify(results,null,2));
 fs.writeFileSync(OUT+'/SUMMARY.txt',[
  'Public character availability audit; no bypass or unlock performed.',
  ...results.modules.map(m=>m.file+' HTTP '+(m.status||'?')+' matches '+(m.snippets?.length||0)),
  ...results.errors
 ].join('\n'));
 console.log(JSON.stringify({checked:results.modules.length,errors:results.errors,
  matches:results.modules.map(x=>({file:x.file,n:x.snippets?.length||0}))}));
});
