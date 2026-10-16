'use strict';
/* V113 opt-in Poison preview: real sprite atlas frames, native HP owner,
 * previous official mode untouched, no CSS/Canvas geometry and no duplicates.
 */
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const ids=['nevoavenenosa','poisonjab','acido','lamacorrosiva'];
const names=['Névoa Venenosa','Poison Jab','Ácido','Lama Corrosiva'];
const n=[16,16,16,16],base='effects/moves/v113-poison-preview/';
const input=fs.readFileSync('index.html','utf8');
assert.ok(input.includes("get('battle_preview')==='poison113'"));
assert.ok(input.includes(base+'runtime.js'));
const baseline=JSON.parse(fs.readFileSync('effects/moves/STATUS_APROVADOS.json','utf8'));
for(const s of baseline.moves.filter(s=>s.version==='V111')){
 assert.equal(s.protect,true);assert.equal(s.aprovacao_visual,'salvo_com_ressalvas');
}
for(let i=0;i<4;i++){
 const path=base+ids[i]+'/sprites/'+ids[i]+'.webp';
 const data=fs.readFileSync(path);
 assert.equal(data.toString('ascii',0,4),'RIFF');
 assert.equal(data.toString('ascii',8,12),'WEBP');
 const spec=fs.readFileSync(base+ids[i]+'/spec.js','utf8');
 assert.ok(spec.includes('frames:'+n[i]));assert.ok(spec.includes('preview'));
}
const crypto=require('node:crypto');
const pathOriginal=base+'source/poison-attack-effects-original.png';
const bytes=fs.readFileSync(pathOriginal);
assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),
 'edc356640969383f7fa1cfe19beda3051184c0bbe1fc77bb211de5846923d659',
 'SOURCE MUST equal the original from user gallery');
const sprites=JSON.parse(fs.readFileSync(base+'manifest.json','utf8'));
for(let i=0;i<4;i++){
 assert.equal(sprites.moves[ids[i]].frames,n[i]);
 assert.ok(sprites.moves[ids[i]].unique>=n[i]-2,'all frames different');

}
function demo(search){
 const painted=[],shots=[],prior=[],skills=names.map(name=>({name,type:'poison'}));
 class FakeImage{
  complete=false;naturalWidth=0;naturalHeight=0;
  addEventListener(){}
  set src(value){
   const id=ids.find(id=>value.includes('/'+id+'.webp'));
   if(id){this.complete=true;this.naturalWidth=128*n[ids.indexOf(id)];this.naturalHeight=128}
  }
 }
 class Engine{
  constructor(){this.projectiles=[];this.player={x:30,y:145};this.enemy={x:230,y:130,r:34};this.h=420;}
  useMove(slot){this.projectiles.push({from:'player',slot});return true}
  drawProjectile(shot){prior.push(shot)}
 }
 const window={PokemonTorreV360Paint(){prior.push('old');return false}};
 const location={search,hostname:'remote.example'};
 const context=vm.createContext({window,location,Image:FakeImage,Math,Number,Array,
  URLSearchParams,BattleEngine:Engine,battle:{active:true},current:()=>({}),skillSet:()=>skills,
  pixiFX:{paintFightingSheet:()=>false},performance:{now:()=>500},console});
 vm.runInContext(fs.readFileSync(base+'runtime.js','utf8'),context,{timeout:3000});
 for(let i=0;i<4;i++){
  vm.runInContext(fs.readFileSync(base+ids[i]+'/spec.js','utf8'),context,{timeout:2000});
 }
 const api=window.PokemonTorrePoisonPreviewV113;
 assert.equal(api.enabled,search.includes('poison113'));
 assert.equal(api.diagnostics().registered.length,4);
 if(!api.enabled){
  assert.equal(api.diagnostics().ready.length,0);
  assert.equal(window.PokemonTorreV360Paint(null,{move:{name:names[0]}},100,{}),false);
  assert.equal(prior.at(-1),'old');
  return;
 }
 assert.equal(api.diagnostics().ready.length,4);
 const engine=new Engine();
 const g={save(){},restore(){},globalAlpha:1,drawImage(...args){painted.push(args)},
  imageSmoothingEnabled:true,beginPath(){throw Error('Canvas geometry not allowed')},
  fill(){throw Error('Canvas geometry not allowed')},stroke(){throw Error('Canvas geometry not allowed')}};
 for(let i=0;i<4;i++){
  const before=painted.length;
  engine.useMove(i);
  assert.equal(engine.projectiles.at(-1).__v113PreviewHidden,ids[i]);
  engine.drawProjectile(engine.projectiles.at(-1));
  assert.ok(!prior.includes(engine.projectiles.at(-1)),'generic shot not hidden');
  const fx={move:skills[i],at:100,duration:1000,times:[.64],from:[30,145],to:[230,130]};
  for(const t of [.08,.23,.47,.64,.84,.96]){
   assert.equal(window.PokemonTorreV360Paint(g,fx,100+t*1000,engine),true);
  }
  assert.equal(painted.length-before,6,'each attack animates independently');
  assert.ok(new Set(painted.slice(before).map(args=>args[1])).size>=4,'distinct frames '+names[i]);
 }
 const diag=api.diagnostics();
 assert.equal(diag.casts,4);assert.equal(diag.hiddenGeneric,4);assert.equal(diag.damageModified,false);
 assert.ok(diag.draws>=24);
 assert.equal(diag.pixi,0);assert.ok(diag.fallback>=24);
 const before=prior.length;
 window.PokemonTorreV360Paint(g,{move:{name:'Surf'}},100,engine);
 assert.equal(prior.length,before+1,'unrelated move painter unchanged');
 console.log('PASS V113 four authentic Mystery Dungeon source Poison preview sheets, 12/16 frames, native hit, isolated opt-in and normal-mode protection');
}
demo('?battle_preview=poison113');
demo('');
