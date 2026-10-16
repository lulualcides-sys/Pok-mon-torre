'use strict';
/* V114: all four original Poison sprites are approved; flat mud is official.
 * No V111/V98 regression.
 */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const names=['Névoa Venenosa','Poison Jab','Ácido','Lama Corrosiva'];
const ids=['nevoavenenosa','poisonjab','acido','lamacorrosiva'];
const path='effects/moves/v114-poison/';
const index=fs.readFileSync('index.html','utf8');
assert.match(index,/v114mode===null\|\|v114mode==='poison114'/);
const approvals=JSON.parse(fs.readFileSync('effects/moves/STATUS_APROVADOS.json','utf8'));
const oldNames=['Picada Tóxica','Picada Venenosa','Venoshock','Ferrão Venenoso'];
assert.equal(oldNames.filter(name=>{
 const entry=approvals.moves.find(x=>x.move===name);
 return entry?.protect===true&&(
  (entry.version==='V111'&&entry.aprovacao_visual==='salvo_com_ressalvas')||
  (entry.previous_approved?.version==='V111'&&
   entry.previous_approved?.aprovacao_visual==='salvo_com_ressalvas'&&
   entry.fallback_file==='effects/moves/v111-poison/renderer.js')
 );
}).length,4,'Keep all four V111 artworks, including V122 Venoshock rollback');
for(const name of names){
 const entry=approvals.moves.find(x=>x.move===name);
 assert.ok(entry,'Missing approved move '+name);
 assert.equal(entry.status,'aprovado');assert.equal(entry.protect,true);
 assert.equal(entry.version,'V114');
}
assert.ok(approvals.moves.some(x=>x.move==='Lama Corrosiva'&&x.status==='aprovado'&&x.protect===true),'Mud must be saved and protected');
for(let i=0;i<4;i++){
 assert.ok(fs.readFileSync(path+ids[i]+'/spec.js','utf8').includes('frames:16'));
 const source=i<3?'effects/moves/v113-poison-preview/':'effects/moves/v114-poison/';
 const file=source+ids[i]+'/sprites/'+ids[i]+'.webp';
 const b=fs.readFileSync(file);
 assert.equal(b.toString('ascii',0,4),'RIFF');
 assert.equal(b.toString('ascii',8,12),'WEBP');
}
const sludge=JSON.parse(fs.readFileSync(path+'manifest.json','utf8'));
assert.equal(sludge.frames,16);assert.ok(sludge.unique>=14);assert.equal(sludge.orientation,'flat-ground-puddle');
function smoke(query,readyCount,numberOfMoves){
 let draws=[],fallback=[],skills=names.map(name=>({name,type:'poison'}));
 class FakeImage{
  complete=false;naturalWidth=0;naturalHeight=0;
  addEventListener(){}
  set src(value){
   const id=ids.find(x=>value.includes('/'+x+'.webp'));
   if(id){this.complete=true;this.naturalWidth=16*128;this.naturalHeight=128}
  }
 }
 class Engine{
  constructor(){this.projectiles=[];this.player={x:30,y:145,r:30};this.enemy={x:230,y:130,r:34};this.h=420;}
  useMove(slot){this.projectiles.push({from:'player',slot});return true}
  drawProjectile(s){fallback.push(s)}
  update(){}
 }
 const battle={active:true};
 const window={PokemonTorreV360Paint(){fallback.push('old');return false}};
 const ctx=vm.createContext({window,Image:FakeImage,URLSearchParams,location:{hostname:'prod.example',search:query},
  BattleEngine:Engine,battle,current:()=>({}),skillSet:()=>skills,performance:{now:()=>500},
  Math,Array,Number,console,pixiFX:{paintFightingSheet:()=>false}});
 vm.runInContext(fs.readFileSync(path+'runtime.js','utf8'),ctx,{timeout:3000});
 for(const id of ids)vm.runInContext(fs.readFileSync(path+id+'/spec.js','utf8'),ctx,{timeout:1500});
 const api=window.PokemonTorrePoisonPreviewV114,diag=api.diagnostics();
 assert.equal(diag.version,'114.0');assert.equal(diag.ready.length,readyCount);
 const eng=new Engine(),g={save(){},restore(){},globalAlpha:1,imageSmoothingEnabled:true,
  drawImage(...xs){draws.push(xs)},beginPath(){throw Error('No Canvas shapes')},
  fill(){throw Error('No Canvas shapes')},stroke(){throw Error('No Canvas shapes')}};
 for(let i=0;i<numberOfMoves;i++){
  const prior=draws.length;eng.useMove(i);
  const shot=eng.projectiles.at(-1);
  assert.equal(shot.__v114PreviewHidden,ids[i]);
  eng.drawProjectile(shot);
  assert.ok(!fallback.includes(shot));
  const fx={move:skills[i],at:100,duration:1000,times:[.64],from:[30,145],to:[230,130]};
  for(const t of [.09,.23,.40,.64,.84,.95])
   assert.equal(window.PokemonTorreV360Paint(g,fx,100+t*1000,eng),true);
  assert.equal(draws.length-prior,6);
  assert.ok(new Set(draws.slice(prior).map(a=>a[1])).size>=4);
  const last=api.diagnostics().last;
  if(i===0)assert.ok(last.width>=125&&last.width<=135,'Fog reduced slightly');
  if(i===1)assert.ok(last.width>=94&&last.width<=101,'Jab reduced slightly');
  if(i===2)assert.ok(last.width>=90&&last.width<=97,'Acid reduced slightly');
  if(i===3){
   assert.equal(last.ground,true);
   assert.ok(Math.abs(last.y-eng.enemy.y)<15,'Mud is at feet rather than torso');
   assert.ok(last.height<last.width*.48,'Mud is a FLAT ground puddle');
  }
 }
 const fx=api.diagnostics();
 assert.equal(fx.draws,6*numberOfMoves);
 assert.equal(fx.damageModified,false);
 console.log('PASS V114 '+(query||'NORMAL')+' '+numberOfMoves+' independent original-sprite moves, ground-level mud official, HP untouched');
}
smoke('',4,4);
smoke('?safe=1',4,4);
smoke('?battle_preview=poison114',4,4);
smoke('?battle_preview=poison114&safe=1',4,4);
