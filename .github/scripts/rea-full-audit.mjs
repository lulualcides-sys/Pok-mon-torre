import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('/tmp/rea-play/node_modules/playwright-core');
const acorn=require('/tmp/rea-play/node_modules/acorn');
const {PNG}=require('/tmp/rea-play/node_modules/pngjs');
const profiles={
  bulbasaur:{player:[53,78],dummy:[669,78],arena:[117,385],arenaName:'Stadium'},
  charmander:{player:[109,78],dummy:[53,78],arena:[185,385],arenaName:'Neon'},
  squirtle:{player:[165,78],dummy:[669,78],arena:[245,385],arenaName:'Crater'},
  pikachu:{player:[669,78],dummy:[165,78],arena:[310,385],arenaName:'Ruins'}
};
const who=process.argv[2]||'bulbasaur', team=profiles[who];
if(!team)throw Error('Invalid sampling profile: '+who);
const origin='https://www.pokearena2d.com/',out='rea-full-report';
fs.mkdirSync(out+'/frames',{recursive:true});
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const data={site:origin,sampledPokemon:who,intendedArena:team.arenaName,
  stages:[],errors:[],browserErrors:[],network:[],moveTests:[],scriptCatalog:[],
  atlas:[],resourceReferences:[],candidateNames:[],towerFolders:[]};
const browser=await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx=browser.contexts()[0];
if(!ctx)throw Error('CDP context missing');
const page=ctx.pages()[0]||await ctx.newPage();
await page.setViewportSize({width:780,height:437});
page.on('response',r=>{
 if(r.url().startsWith(origin)&&data.network.length<2000)data.network.push({
  path:new URL(r.url()).pathname,status:r.status(),type:r.request().resourceType()});
});
page.on('pageerror',e=>{if(data.browserErrors.length<30)data.browserErrors.push(String(e).slice(0,350));});
const sleep=ms=>page.waitForTimeout(ms);
function write(name,obj){fs.writeFileSync(path.join(out,name),JSON.stringify(obj,null,2));}
async function snap(label){
 const img=await page.screenshot({path:out+'/'+label+'.png',timeout:20000});
 data.stages.push({label,sha256:sha(img),url:page.url()});return img;
}
function pixdiff(a,b){
 try{
  const x=PNG.sync.read(a),y=PNG.sync.read(b);
  let changed=0;
  for(let row=110;row<325;row+=2)for(let col=20;col<750;col+=2){
   const off=(row*x.width+col)*4;
   if(off+2>=x.data.length||off+2>=y.data.length)continue;
   if(Math.abs(x.data[off]-y.data[off])+Math.abs(x.data[off+1]-y.data[off+1])+Math.abs(x.data[off+2]-y.data[off+2])>65)changed++;
  }
  return changed*4;
 }catch{return null;}
}
async function captureInputs(){
 await page.evaluate(()=>document.querySelector('canvas')?.addEventListener('contextmenu',e=>{e.preventDefault();e.stopPropagation();},{capture:true}));
 await page.keyboard.press('k');
 const inputs=['left','right','Space','q','e'];
 for(const [idx,input] of inputs.entries()){
  const reference=await page.screenshot({timeout:14000});
  await page.mouse.move(515,210);
  if(['left','right'].includes(input))await page.mouse.down({button:input});
  else await page.keyboard.down(input);
  const deltas=[];
  for(let frame=0;frame<12;frame++){
   const name=out+'/frames/'+String(idx)+'-'+input+'-'+String(frame).padStart(2,'0')+'.png';
   const capture=await page.screenshot({path:name,timeout:14000});
   deltas.push(pixdiff(reference,capture));
   await sleep(90);
  }
  if(['left','right'].includes(input))await page.mouse.up({button:input});
  else await page.keyboard.up(input);
  data.moveTests.push({input,changes:deltas,attempted:true,
   caveat:'Visual differences can include idle animations; they do not prove move activation.'});
  await sleep(650);
 }
}
function k(n){if(!n)return null;if(n.type==='Identifier')return n.name;if(n.type==='Literal')return String(n.value);return null;}
function value(n){return n?.type==='Literal'?n.value:null;}
function props(n){return n?.type==='ObjectExpression'?
 n.properties.filter(p=>p.type==='Property').map(p=>[k(p.key),p.value]).filter(([key])=>key!==null):[];}
function walk(root,cb){
 const stack=[root];let budget=300000;
 while(stack.length&&budget--){
  const n=stack.pop();if(!n||typeof n!=='object')continue;
  if(typeof n.type==='string')cb(n);
  for(const [key,v] of Object.entries(n)){
   if(key==='start'||key==='end'||key==='raw')continue;
   if(Array.isArray(v)){for(const item of v)if(item?.type)stack.push(item);}
   else if(v?.type)stack.push(v);
  }
 }
}
function analyze(js,rel){
 const info={file:rel,size:Buffer.byteLength(js),sha256:sha(js),parsed:false,
  functions:[],exports:[],maps:[],resources:[],candidateNames:[]};
 try{
  const ast=acorn.parse(js,{ecmaVersion:'latest',sourceType:'module',allowHashBang:true});
  info.parsed=true;
  walk(ast,n=>{
   if(n.type==='FunctionDeclaration'&&n.id?.name&&info.functions.length<120)info.functions.push(n.id.name);
   if(n.type==='ExportNamedDeclaration'){
    if(n.declaration?.id?.name)info.exports.push(n.declaration.id.name);
    for(const a of n.declaration?.declarations||[])if(a.id?.name)info.exports.push(a.id.name);
   }
   if(n.type==='VariableDeclarator'&&n.init?.type==='ObjectExpression'){
    const p=props(n.init);if(p.length>=3&&info.maps.length<70)
    info.maps.push({name:n.id?.name||'anonymous',size:p.length,keys:p.slice(0,240).map(z=>z[0])});
   }
   if(n.type==='Property'&&n.value?.type==='ObjectExpression'){
    const m=Object.fromEntries(props(n.value));
    if(['fw','fh','cols'].every(key=>Number.isFinite(value(m[key])))&&value(m.fw)>0&&value(m.fh)>0){
     const anim=props(m.anims).map(([name,o])=>({name,fps:value(Object.fromEntries(props(o)).fps)}));
     data.atlas.push({source:rel,key:k(n.key),fw:value(m.fw),fh:value(m.fh),cols:value(m.cols),anims:anim});
    }
   }
   if(n.type==='Literal'&&typeof n.value==='string'){
    const s=n.value;
    if(/^assets\/.{2,180}\.(png|webp|jpg|jpeg|json|ogg|wav|mp3)$/i.test(s)&&info.resources.length<900)info.resources.push(s);
    if(/(datos|habilidades|vfx)\.js$/.test(rel)&&/^[A-Za-z][a-z0-9_-]{2,40}$/i.test(s)&&
     /(blast|beam|punch|ball|fire|ember|flame|water|surf|ice|thunder|electric|vine|leaf|shadow|solar|psychic|tackle|wave|pulse|aqua|poison|rock)/i.test(s))
      info.candidateNames.push(s);
   }
  });
  info.candidateNames=[...new Set(info.candidateNames)];
 }catch(e){info.parseError=String(e).slice(0,180);}
 return info;
}
async function inventory(){
 const links=await page.evaluate(()=>[...new Set([...document.querySelectorAll('script[src]')].map(e=>e.src)
   .concat(performance.getEntriesByType('resource').map(e=>e.name)))]);
 const scripts=links.filter(u=>u.startsWith(origin)&&/\.m?js(?:\?|$)/.test(u)).slice(0,100);
 for(let i=0;i<scripts.length;i+=6){
  const results=await Promise.all(scripts.slice(i,i+6).map(async u=>{
   const rel=new URL(u).pathname.slice(1);
   if(rel.includes('lib/phaser.min.js'))return {file:rel,vendor:'Phaser',skippedParse:true};
   try{
    const response=await page.request.get(u,{timeout:18000});
    if(!response.ok())return {file:rel,status:response.status(),error:'Non-200'};
    const body=await response.body();
    if(body.length>2300000)return {file:rel,size:body.length,sha256:sha(body),skippedParse:true};
    return analyze(body.toString('utf8'),rel);
   }catch(e){return {file:rel,error:String(e).slice(0,150)}}
  }));
  data.scriptCatalog.push(...results);
 }
 data.resourceReferences=[...new Set(data.scriptCatalog.flatMap(o=>o.resources||[]))].slice(0,3000);
 data.candidateNames=[...new Set(data.scriptCatalog.flatMap(o=>o.candidateNames||[]))].sort();
 data.networkAssets=[...new Map(data.network.filter(o=>o.type==='image'||o.type==='xhr')
   .map(o=>[o.path,o])).values()].slice(0,2400);
 try{data.towerFolders=fs.readdirSync('effects/moves',{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>x.name);}
 catch(e){data.errors.push('Local moves inventory: '+String(e).slice(0,130));}
 try{
  const approval=fs.readFileSync('effects/moves/STATUS_APROVADOS.json');
  const a=JSON.parse(approval);
  data.towerApproval={sha256:sha(approval),topLevelKeys:Object.keys(a).slice(0,30)};
 }catch(e){data.towerApproval={error:String(e).slice(0,130)}}
 write('INVENTARIO-GERAL.json',{scripts:data.scriptCatalog,atlases:data.atlas,
  assets:data.resourceReferences,networkAssets:data.networkAssets,candidateNames:data.candidateNames,
  towerFolders:data.towerFolders,towerApproval:data.towerApproval});
}
async function navigate(){
 await page.goto(origin,{waitUntil:'domcontentloaded',timeout:50000});
 await sleep(11500);await snap('00-home');
 await page.mouse.click(390,183);await sleep(4800);await snap('01-modes');
 await page.mouse.click(390,282);await sleep(5200);await snap('02-training');
 await page.mouse.click(...team.player);await sleep(600);
 await page.mouse.click(556,243);await sleep(300); // Focus the Dummy selection pane before choosing opponent.
 await page.mouse.click(...team.dummy);await sleep(400);
 await page.mouse.click(...team.arena);await sleep(600);
 await snap('03-selection-'+who);
 await page.mouse.click(684,393);await sleep(4100);
 await snap('04-battle-'+who);
 await captureInputs();await snap('05-after-moves-'+who);
}
function report(){
 const scripts=data.scriptCatalog,atlas=data.atlas;
 const md=[
 '# Poké Arena 2D — auditoria pública de sistema visual',
 '',
 'Perfil: '+who+'. Arena solicitada pela automação: '+team.arenaName+'.',
 '',
 'Esta é uma coleta técnica da interface pública. Não representa acesso irrestrito a conteúdo bloqueado ou privado.',
 '',
 '## Inventário observado',
 '- JavaScript descoberto: '+scripts.length+'; analisado como AST: '+scripts.filter(x=>x.parsed).length,
 '- Atlases com dimensões detectadas: '+atlas.length,
 '- Referências a recursos gráficos/áudio: '+data.resourceReferences.length,
 '- Nomes candidatos de movimentos (heurística, requer revisão): '+data.candidateNames.length,
 '- Pastas de efeitos no Pokémon Torre: '+data.towerFolders.length,
 '',
 '## Dados de spritesheets detectados',
 '| Chave | Frame | Colunas | Animações e FPS |',
 '|---|---:|---:|---|',
 ...atlas.slice(0,140).map(x=>'| '+x.key+' | '+x.fw+'x'+x.fh+' | '+x.cols+' | '+x.anims.map(a=>a.name+':'+(a.fps??'?')).join(', ').slice(0,90)+' |'),
 '',
 '## Fontes e cenas observadas',
 ...scripts.filter(x=>/(arena|campo|escenas\/|habilidad|vfx|sprites)/.test(x.file))
  .map(x=>'- '+x.file+' ('+(x.size||'?')+' bytes; '+(x.maps?.length||0)+' mapas estáticos top-level)'),
 '',
 '## Testes de cinco comandos por Pokémon',
 ...data.moveTests.map(t=>'- '+t.input+': '+t.changes.filter(n=>n>1000).length+' de '+t.changes.length+' quadros com mudança visível. Não comprova qual habilidade ativou.'),
 '',
 '## Restrições',
 '- Aprovação visual e gameplay precisam ser checadas, mesmo quando a análise AST encontra um registro.',
 '- Conteúdo de modos online, contas ou desbloqueios não é coberto.',
 '- O REA fornece evidências passivas; este script auxilia a navegação para observar o jogo.',
 '- Não foram incorporados arquivos ou código de terceiros ao Pokémon Torre.',
 '- Implementar equivalentes autorais no PixiJS/WebGL, comparar impacto e manter golpes aprovados intactos.',
 '',
 'Arquivos: INVENTARIO-GERAL.json (perfil bulbasaur), survey.json, frames/, rea-inspect.json, rea-bundle.json.'
 ];
 fs.writeFileSync(out+'/AUDITORIA.md',md.join('\n'));
}
try{
 await navigate();
 if(who==='bulbasaur')await inventory();
}catch(e){data.errors.push('Audit: '+String(e).slice(0,400));}
finally{
 report();write('survey.json',data);
 console.log(JSON.stringify({pokemon:who,arena:team.arenaName,stages:data.stages.length,
  moves:data.moveTests.length,scripts:data.scriptCatalog.length,atlases:data.atlas.length,
  resources:data.resourceReferences.length,errors:data.errors},null,2));
 process.exit(0);
}
