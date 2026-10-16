'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const base='effects/moves/v128-water-preview/';
const scripts=['runtime.js','withdraw/index.js','water-gun/index.js','bubbles/index.js','dive/index.js'];
const text=scripts.map(f=>fs.readFileSync(base+f,'utf8'));
for(let i=0;i<text.length;i++)assert.doesNotThrow(()=>new vm.Script(text[i],{filename:scripts[i]}));
const mock=new Proxy({globalAlpha:1}, {get(o,k){return k in o?o[k]:(()=>{});},set(o,k,v){o[k]=v;return true;}});
const actor={x:110,y:230,r:33},enemy={x:340,y:224,r:35};
const battle={active:true,paused:false,energy:100};
const skills=[
 {name:'Withdraw',power:0,cat:'status',kind:'shield',type:'water'},
 {name:"Pistola d'Água",power:40,cat:'special',type:'water'},
 {name:'Bolhas',power:16,cat:'special',type:'water'},
 {name:'Mergulho',power:80,cat:'physical',type:'water'}
];
class Engine {
 constructor(){this.ctx=mock;this.player=actor;this.enemy=enemy;this.w=480;this.h=320;
 this.canvas={isConnected:true};this.v359Attacks=[];}
 useMove(i){
  const skill=skills[i];if(skill.power>0){this.v359Attacks.push({move:skill,kind:'hydropump',at:1000,end:1840,duration:840,
   times:[.64],battle,from:[110,190],to:[340,185]});}
  return true;
 }
 draw(now){}
}
const location={search:''};
const window={PokemonTorreV360Paint:()=>false};
const context={window,location,battle,BattleEngine:Engine,URLSearchParams,
 current:()=>({}),skillSet:()=>skills,performance:{now:()=>1000},console};
for(const code of text)vm.runInNewContext(code,context);
const preview=window.PokemonTorreWaterV128;
assert.ok(preview?.installed&&preview.official&&!preview.previewOnly);
assert.equal(preview.diagnostics().registered.length,4);
const engine=new Engine();
for(let i=0;i<4;i++){
 assert.notEqual(engine.useMove(i),false);
 if(i===0){engine.draw(1250);continue;}
 const fx=engine.v359Attacks.at(-1);
 assert.ok(fx.duration>1100&&fx.end>1840,'opt-in long animation');
 for(const q of [.04,.20,.40,.64,.74,.88,.97]){
  assert.equal(window.PokemonTorreV360Paint(mock,fx,fx.at+fx.duration*q,engine),true,skills[i].name+' frame '+q);
 }
}
const st=preview.diagnostics();
assert.equal(st.casts,4);assert.ok(st.frames>=21);
assert.deepEqual([...st.approvedUnchanged],['Cauda de Água','Pulso de Água']);
assert.ok(!text.join('\n').includes('.png')&&!text.join('\n').includes('document.createElement'),'no PNG images or new Atelier');
const original=JSON.parse(fs.readFileSync('effects/moves/STATUS_APROVADOS.json','utf8'));
for(const name of ['Cauda de Água','Pulso de Água','Withdraw','Pistola d’Água','Bolhas','Mergulho']){
 const row=original.moves.find(x=>x.move===name);
 assert.equal(row?.status,'aprovado');assert.equal(row?.protect,true);
}
const index=fs.readFileSync('index.html','utf8');
assert.ok(index.includes("get('water128')!=='0'"));
assert.ok(index.includes('effects/moves/v128-water-preview/runtime.js'));
const rollback={window:{},location:{search:'?water128=0'},battle,BattleEngine:Engine,URLSearchParams,current:()=>({}),skillSet:()=>skills,performance:{now:()=>1000},console};
vm.runInNewContext(text[0],rollback);
assert.equal(rollback.window.PokemonTorreWaterV128,undefined,'rollback disables official V128');
console.log('PASS V128: four official 12/16-frame approved moves, old water attacks protected, original fallback available.');
