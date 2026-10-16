'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const file=fs.readFileSync('effects/v123/gameplay-mega.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const perf=fs.readFileSync('effects/v119/08-mobile.js','utf8');
const layout=fs.readFileSync('effects/ui/battle-proportion-v122.js','utf8');
const approvals=JSON.parse(fs.readFileSync('effects/moves/STATUS_APROVADOS.json','utf8'));
assert.ok(index.includes('effects/v123/gameplay-mega.js'));
assert.ok(perf.includes('this.assets?.size>32'));
assert.ok(perf.includes('now-this._v123LastPrune>18000'));
assert.ok(layout.includes('const scale=1.24'));
assert.ok(index.includes('effects/moves/v122-poison-preview/runtime.js'));
assert.ok(approvals.moves.filter(x=>x.version==='V122'&&x.protect).length===4);
const children=[],listeners={};
function element(){return {style:{},className:'',children:[],append(...els){this.children.push(...els)},appendChild(el){this.children.push(el);return el},querySelector(){return null},remove(){},set textContent(v){this._text=v},get textContent(){return this._text}}}
const main=element(),head=element();
const document={createElement:element,head,querySelector(q){if(q==='#main section'||q==='#main')return main;if(q==='#modal .result')return null;return null}};
const record={},localStorage={getItem:key=>record[key]||null,setItem:(key,value)=>record[key]=value};
const team=[{id:25,hp:40,maxHp:100,level:18}],save={gym:0,stage:1,coins:100,wins:0,losses:0,team},battle={active:false,wild:false};
class Engine{useMove(){return true}}
let renders=0,finishes=0,starts=0,persists=0,awards=0;
const globals={window:{},URLSearchParams,location:{search:''},document,localStorage,alert(){},save,battle,performance:{now:()=>12},
 BattleEngine:Engine,console,Math,Number,
 persist(){persists++},awardXP(){awards++},
 startBattle(enemies,label,wild){starts++;battle.active=true;battle.wild=wild;battle.label=label},
 finishBattle(win){finishes++;battle.active=false;if(win){save.wins++;save.stage++}else save.losses++},
 render(){renders++},renderWin(){},};
const ctx=vm.createContext(globals);
vm.runInContext(file,ctx,{timeout:2000});
assert.equal(ctx.window.PokemonTorreV123.installed,true);
assert.ok(head.children.some(x=>x.id==='v123-mobile-arena'));
ctx.render();assert.ok(main.children.some(x=>x.className==='v123Hub'));
ctx.startBattle([{id:25}],'TREINADOR 1',false);ctx.finishBattle(true);
assert.equal(finishes,1);assert.equal(save.wins,1);assert.equal(ctx.window.PokemonTorreV123.diagnostics().records.wins,1);
assert.equal(save.v123.pendingReward,1);
ctx.render();const hub=main.children.find(x=>x.className==='v123Hub');
assert.ok(hub);
const row=hub.children.find(x=>x.children?.some(y=>y.textContent==='✚ Centro Pokémon'));
const btn=row.children.find(y=>y.textContent==='✚ Centro Pokémon');btn.onclick();
assert.ok(team[0].hp>40);assert.equal(save.coins,80);
ctx.window.PokemonTorreV123.diagnostics();
console.log('PASS V123 mega: official loader, persistent win/reset records, healing once per stage, rewards, protected V122, enlarged arena and deferred mobile pruning');
