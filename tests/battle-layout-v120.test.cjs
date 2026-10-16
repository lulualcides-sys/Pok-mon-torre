'use strict';
/* V120 mobile battle screenshot regression: Blaine presentation, boss phase,
 * Save/Migrate overlap, HP HUD. No combat or approved sprites are touched.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('effects/ui/battle-layout-v120.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const approved=JSON.parse(fs.readFileSync('effects/moves/STATUS_APROVADOS.json','utf8'));
assert.ok(html.includes('effects/ui/battle-layout-v120.js'));
for(const key of ['body:has(#modal.combatModal) #ptWebSave','[data-v117-leader]',
 '#v30BossPhase{display:none!important}','height:clamp(265px,43dvh,430px)',
 '.v120BossPhase','width:43%'])assert.ok(source.includes(key),'Missing UI guard '+key);
assert.ok(!source.includes('hitTarget(')&&!source.includes('useMove('));
assert.ok(!source.includes('drawMon(')&&!source.includes('this.dpr='));
assert.equal(approved.moves.find(x=>x.move==='Rain Dance')?.protect,true);
let style,dupes=[{removed:false,remove(){this.removed=true;}}],small=null;
const overlineParent={children:[],appendChild(c){this.children.push(c);small=c;}};
const heading={
 querySelectorAll(sel){assert.equal(sel,'[data-v117-leader]');return dupes.filter(x=>!x.removed);},
 querySelector(sel){
  if(sel==='.v120BossPhase')return small;
  if(sel==='.overline')return {parentElement:overlineParent};
  return null;
 }
};
const phase={textContent:'👑 Blaine · FASE 2/4 · Estratégia adaptativa'};
const tag={textContent:'🏟️ Arena',classes:new Set(),classList:{toggle(name,val){if(val)thisObj.classes.add(name);else thisObj.classes.delete(name)}}};
const thisObj=tag;
const modal={querySelector(sel){
 if(sel==='.battleHeading')return heading;
 if(sel==='#v30BossPhase')return phase;
 if(sel==='#v33TerrainTag')return tag;
 return null;
}};
const document={
 head:{appendChild(node){style=node;}},
 createElement(name){return {tagName:name,style:{},setAttribute(n,v){this[n]=v;},remove(){this.removed=true;}}},
 querySelector(sel){if(sel==='#modal.combatModal')return modal;if(sel==='.v120BossPhase')return small;return null;}
};
const window={};
const battle={active:false,v30Boss:false};
const events={start:0,next:0,render:0};
let startBattle=function(){events.start++;battle.active=true;battle.v30Boss=true;return true};
let nextFoe=function(){events.next++;phase.textContent='👑 Blaine · FASE 3/4 · Estratégia adaptativa';return 'next'};
let renderBattle=function(){events.render++;return true};
const sb=vm.createContext({document,window,battle,startBattle,nextFoe,renderBattle,console});
vm.runInContext(source,sb,{timeout:1500});
assert.equal(window.PokemonTorreBattleLayoutV120.installed,true);
assert.equal(style.id,'v120-battle-layout');
assert.equal(sb.startBattle(),true);
assert.equal(events.start,1);
assert.equal(dupes[0].removed,true,'Remove the oversized Blaine panel');
assert.equal(small.textContent,'FASE 2/4','Preserve phase in a compact heading pill');
assert.equal(tag.classes.has('v120GenericTerrain'),true,'Hide useless generic terrain chip');
assert.equal(window.PokemonTorreBattleLayoutV120.diagnostics().phasesUpdated,1);
assert.equal(sb.nextFoe(),'next');
assert.equal(small.textContent,'FASE 3/4','Keep phase synchronised after next foe');
tag.textContent='🌊 Poças';
sb.renderBattle();
assert.equal(tag.classes.has('v120GenericTerrain'),false,'Important terrain still visible');
assert.equal(events.render,1);
assert.equal(window.PokemonTorreBattleLayoutV120.diagnostics().rosterDuplicatesRemoved,1);
assert.ok(style.textContent.includes('max-height:calc(100dvh - 10px)'));
console.log('PASS V120 mobile Blaine screenshot: native roster kept, duplicated card removed, compact boss phase, Save/Migrate hidden only in battle, terrain chip off when generic, no V95/V118 or move logic touched');
