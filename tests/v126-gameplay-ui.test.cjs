'use strict';
/* V126: No rewrite to protected Pokémon move lists or battle mechanics. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('effects/v126/gameplay-ui.js','utf8');
const entry=fs.readFileSync('index.html','utf8');
const approvals=JSON.parse(fs.readFileSync('effects/moves/STATUS_APROVADOS.json','utf8'));
assert.ok(entry.includes('effects/v126/gameplay-ui.js'),'game must integrate the V126 module');
assert.ok(entry.includes("get('ui126')!=='0'"),'isolated rollback must exist');
assert.ok(approvals.moves.filter(x=>x.protect&&x.version==='V122').length===4,'approved moves preserved');
assert.doesNotMatch(src,/hitTarget\s*=|BattleEngine\.prototype\.useMove\s*=|damage\s*=|save\.team\s*=/,
 'no rewriting damage, player attacks or team saves');
const party=[{id:25,hp:70,maxHp:95,level:21},{id:7,hp:25,maxHp:25,level:5}];
const save={starter:25,gym:0,stage:3,team:party,medals:[],coins:40,balls:2,potions:1};
let clicks=0,selected=-1,summaryOpened=false,oldCounts=0,frames=0,then=0,persistCalls=0;
function node(){
 return {dataset:{},attrs:{},listeners:{},children:[],style:{},className:'',
  setAttribute(k,v){this.attrs[k]=v},addEventListener(t,fn){this.listeners[t]=fn},appendChild(x){this.children.push(x);return x},
  querySelector(){return null},insertBefore(x){this.children.push(x)},
  get parentElement(){return this},get classList(){return {contains(){return false}}}};
}
const cards=[node(),node()],head=node(),modal=node(),slots=node(),pills=[node(),node()];
const shortcut={click(){clicks++}};
const choices=party.map((_,i)=>({click(){selected=i;summaryOpened=true}}));
modal.querySelector=q=>q==='.v331Slots'&&summaryOpened?slots:null;
const doc={
 createElement:tag=>{const n=node();n.tag=tag;return n},
 head,
 getElementById:id=>id==='v331MovesShortcut'?shortcut:id==='modal'?modal:null,
 querySelector:q=>{const m=q.match(/^\[data-v331-pokemon="(\d+)"\]$/);return m?choices[+m[1]]:null},
 querySelectorAll:q=>q==='#main .teamrow .moncard'?cards:[]
};
class Engine{frame(){frames++}}
const s={window:{},URLSearchParams,location:{search:''},document:doc,
 navigator:{userAgent:'Android Chrome'},save,
 BattleEngine:Engine,D:{25:{name:'Pikachu',type:'electric'},7:{name:'Squirtle',type:'water'}},
 TYPE_NAME:{electric:'Elétrico',water:'Água'},
 battle:null,
 v29TrainerCount:g=>{oldCounts++;return 6+g},render(){},
 showTeam(){},persist(){persistCalls++;},performance:{now(){return ++then}},
 console,Math,Number,Array,Date};
vm.runInNewContext(src,s,{filename:'effects/v126/gameplay-ui.js',timeout:2500});
assert.equal(s.window.PokemonTorreV126.installed,true);
assert.deepEqual(Array.from(s.window.PokemonTorreV126.trainers),[13,15,17,19,21,23,25,27]);
for(let g=0;g<8;g++){
 save.gym=g;save.stage=0;
 assert.equal(s.v29TrainerCount(g),13+g*2,'number of PRE-leader trainers in gym '+g);
}
save.gym=1;save.stage=18;
assert.equal(s.v29TrainerCount(1),15,'fixed leader threshold must NOT drift with save.stage');
assert.equal(s.v29TrainerCount(9),15,'native Elite Four untouched');
// V137: recover a save stuck AFTER Brock's winning fight, with no badge.
save.gym=0;save.stage=14;save.medals=[];save.coins=70;save.balls=4;save.potions=3;
assert.equal(s.v29TrainerCount(0),13);
assert.equal(s.window.PokemonTorreV126.recoverStuckLeader(),true);
assert.equal(save.gym,1,'Brock must unlock Misty');
assert.equal(save.stage,0,'Misty must start at first trainer');
assert.deepEqual(save.medals,[0],'award missing Boulder badge exactly once');
assert.equal(save.coins,190);assert.equal(save.balls,7);assert.equal(save.potions,5);
const recoveredCalls=persistCalls;
assert.equal(s.window.PokemonTorreV126.recoverStuckLeader(),false,'recovery must be idempotent');
assert.equal(persistCalls,recoveredCalls,'do not save multiple times');
save.gym=0;save.stage=0;save.medals=[];
s.render();
assert.equal(cards[0].attrs.role,'button');
assert.equal(cards[0].attrs.tabindex,'0');
assert.ok(cards[0].attrs['aria-label'].includes('Pikachu'));
assert.equal(typeof cards[0].listeners.click,'function');
cards[0].listeners.click();
assert.equal(clicks,1,'native V33.1 shortcut is reused');
assert.equal(selected,0,'tapped Pokemon opens its exact 4-move editor');
assert.equal(slots.children.length,1,'summary contains HP/type and the editor');
assert.ok(slots.children[0].textContent.includes('PV 70/95'));
cards[1].listeners.keydown({key:'Enter',preventDefault(){}});
assert.equal(selected,1,'keyboard can open its Pokemon editor');
new Engine().frame();
assert.equal(frames,1,'native battle frame is still called');
const css=head.children[0].textContent;
assert.ok(css.includes('.spritewrap:has(img.sprite) > .placeholder'),'remove emoji only when sprite is present');
assert.ok(css.includes('content-visibility:auto'),'large TM/Mewtwo catalogue should be virtualized for painting');
assert.ok(css.includes('backdrop-filter:none'),'disable heavy blur on mobile');
assert.ok(!css.includes('.shopEmoji'),'item/TM original sprites must not change');
console.log('PASS V137: stable 13–27 trainer counts, Brock stage 14 auto-recovered into Misty exactly once, direct editor, Android optimizations and combat untouched.');
