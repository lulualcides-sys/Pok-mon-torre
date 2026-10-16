'use strict';
/* V122 screenshot regression: 4 independent real PMD sprites + approved +,
 * wider portrait and landscape combat + generic cast FPS cap.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const get=p=>fs.readFileSync(p,'utf8');
const root='effects/moves/v122-poison-preview/';
const approved=JSON.parse(get('effects/moves/STATUS_APROVADOS.json'));
const html=get('index.html');
for(const p of ['effects/performance/cast-smooth-v122.js','effects/ui/battle-proportion-v122.js',
 'effects/ui/move-approved-mark-v122.js',...['runtime.js','venoshock/spec.js','toxinapesada/spec.js',
 'rajadaacida/spec.js','golpedeveneno/spec.js'].map(x=>root+x)]){
 assert.ok(html.includes(p),'Module must be loaded '+p);assert.ok(fs.statSync(p).size>80);
}
assert.ok(html.includes("get('poison122')!=='0'"),'V122 must load officially by default');
const renderer=get(root+'runtime.js');
assert.ok(!renderer.includes('hitTarget(')&&!renderer.includes('.hp='),'No direct damage manipulation');
const supported=['Venoshock','Toxina Pesada','Rajada Ácida','Golpe de Veneno'];
const ids=['venoshock','toxinapesada','rajadaacida','golpedeveneno'];
let calls=[];
class Image{
 constructor(){this.complete=true;this.naturalWidth=2048;this.naturalHeight=128;}
 addEventListener(){}
 decode(){return Promise.resolve();}
 set src(value){this._src=value;}
 get src(){return this._src;}
}
const battle={active:true,paused:false},mon={id:150,hp:100},enemy={id:25,hp:100};
let selected=0;
class BattleEngine{
 constructor(){this.projectiles=[];this.player={x:100,y:220,r:35};
 this.enemy={x:320,y:190,r:35};this.h=480;}
 useMove(){this.projectiles.push({from:'player'});return true;}
 drawProjectile(){calls.push('old-shot')}
}
const ctx={save(){},restore(){},drawImage(...args){calls.push(args)},
 globalAlpha:1,imageSmoothingEnabled:true};
const run=query=>{
 const window={PokemonTorreV360Paint:()=>false};
 const context=vm.createContext({window,BattleEngine,Image,URLSearchParams,
  location:{search:query,hostname:'example.test'},battle,current:()=>mon,skillSet:()=>supported.map((name)=>({name})),
  performance:{now:()=>200},console,Number,Math,Map,Set,WeakMap});
 vm.runInContext(renderer,context,{timeout:4000});
 if(query!=='?poison122=0'){
  for(const id of ids)vm.runInContext(get(root+id+'/spec.js'),context,{timeout:2000});
 }
 return {window,context};
};
assert.equal(run('?poison122=0').window.PokemonTorrePoisonV122,undefined,'V111 rollback must remain available');
const preview=run('');
const api=preview.window.PokemonTorrePoisonV122;
assert.equal(api.previewOnly,false);
assert.equal(api.official,true);
assert.equal(api.diagnostics().ready.length,4);
const engine=new BattleEngine();
for(let i=0;i<4;i++){
 const prior=calls.length;
 selected=i;
 const c0=engine.projectiles.length,ret=engine.useMove(i);
 assert.equal(ret,true);assert.equal(engine.projectiles.length,c0+1);
 assert.equal(engine.projectiles.at(-1).__v122PoisonPreview,ids[i]);
 engine.drawProjectile(engine.projectiles.at(-1));
 assert.equal(calls.length,prior,'native generic orb should be hidden');
 const fx={move:{name:supported[i]},at:100,duration:1000,from:[100,220],to:[320,190],times:[.66]};
 const rendered=preview.window.PokemonTorreV360Paint(ctx,fx,820,engine);
 assert.equal(rendered,true,'real image draw for '+supported[i]);
 const drawings=calls.slice(prior);
 assert.ok(drawings.length>=1,'empty animation '+supported[i]);
 assert.ok(drawings.every(a=>a[0] instanceof Image),'source must be authentic pixel sprite');
 assert.ok(drawings.every(a=>a[1]>=0&&a[1]<=15*128),'frame index out of 16');
 assert.equal(api.diagnostics().last.name,supported[i]);
 assert.equal(api.diagnostics().last.syncNativeDamage,true);
}
assert.ok(api.diagnostics().casts===4);
assert.ok(api.diagnostics().errors.length===0);
const markCode=get('effects/ui/move-approved-mark-v122.js');
assert.ok(markCode.includes('title="Golpe salvo ou aprovado"'));
assert.ok(markCode.includes('>+</i>'));
assert.ok(!markCode.includes('✅'));
const markWindow={};
let originalMarks=0;
const markDom={head:{appendChild(){}},createElement:()=>({})};
const htmlSkill=s=>'<button class="skillV8"><span class="skillName"><b>'+s.name+'</b><small>Veneno</small></span></button>';
const markSandbox=vm.createContext({window:markWindow,document:markDom,
 location:{search:'',hostname:'localhost'},URLSearchParams,
 skillMarkup:s=>{originalMarks++;return htmlSkill(s)}});
vm.runInContext(markCode,markSandbox,{timeout:2500});
assert.ok(markSandbox.skillMarkup({name:'Rain Dance'},0).includes('>+</i>'));
assert.ok(markSandbox.skillMarkup({name:'Venoshock'},1).includes('>+</i>'));
assert.ok(markSandbox.skillMarkup({name:'Golpe de Veneno'},2).includes('>+</i>'));
assert.ok(markSandbox.skillMarkup({name:'Toxina Pesada'},3).includes('>+</i>'));
assert.ok(markSandbox.skillMarkup({name:'Rajada Ácida'},4).includes('>+</i>'));
assert.equal(originalMarks,5);
const layout=get('effects/ui/battle-proportion-v122.js');
for(const word of ['orientation:portrait','orientation:landscape','grid-template-columns','requestFullscreen','screen.orientation','height:clamp(370px,57dvh','drawMon'])
 assert.ok(layout.includes(word),'UI responsive feature missing '+word);
assert.ok(!layout.includes('hitTarget('));
const perf=get('effects/performance/cast-smooth-v122.js');
for(const word of ['particlesAt','particleCap','warm','requestIdleCallback','castMsMax','oldUse.apply'])
 assert.ok(perf.includes(word),'FPS stabilizer missing '+word);
assert.ok(!perf.includes('.hp=')&&!perf.includes('cooldowns['));
// V127.1 — user confirmed the four old fighting test statuses as approved.
assert.equal(approved.moves.filter(m=>m.status==='em_teste').length,0);
for(const name of ['Chute','Golpe de Karatê','Cross Chop','Brick Break']){
 const row=approved.moves.find(m=>m.move===name);
 assert.equal(row?.status,'aprovado',name+' must keep V127.1 acceptance');
 assert.equal(row?.protect,true);
}
assert.equal(approved.moves.filter(m=>m.version==='V122'&&m.status==='aprovado'&&m.protect).length,4);
assert.equal(approved.moves.find(m=>m.move==='Venoshock')?.previous_approved?.version,'V111');
assert.ok(approved.moves.some(m=>m.move==='Rain Dance'&&m.protect));
console.log('PASS V122 official Poison: four protected 16-frame effects, rollback V111 intact, native damage, approved + labels, mobile responsive layout and cast budget');
