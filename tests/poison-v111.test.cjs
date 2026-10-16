'use strict';
/* V111 regression — 4 poison-only GBA image atlases + mobile DPR/HUD.
 * Native V359 is sole owner of the HP/damage clock and cooldown.
 * Runtime cannot call Canvas paths/gradients or create extra GPU surfaces.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const d='effects/moves/v111-poison/',ids=['picadatoxica','picadavenenosa','venoshock','ferraovenenoso'],
 names=['Picada Tóxica','Picada Venenosa','Venoshock','Ferrão Venenoso'],
 frames=[12,12,16,12],m=JSON.parse(fs.readFileSync(d+'manifest.json','utf8'));
const ix=fs.readFileSync('index.html','utf8'),wf=fs.readFileSync('.github/workflows/deploy.yml','utf8');
assert.ok(ix.includes('v111-poison-fps')&&ix.includes('mobile-fps.js'));
assert.ok(wf.includes('build-v111-poison.py'));
const approved=JSON.parse(fs.readFileSync('effects/moves/STATUS_APROVADOS.json','utf8'));
for(let i=0;i<4;i++){
 const row=approved.moves.find(x=>x.move===names[i]);
 assert.equal(row?.version,'V111');assert.equal(row?.status,'em_teste');assert.equal(row?.protect,true);
 assert.equal(row?.frames,frames[i]);
 const path=d+'sheets/'+ids[i]+'.webp',buf=fs.readFileSync(path);
 assert.equal(buf.toString('ascii',0,4),'RIFF');assert.equal(buf.toString('ascii',8,12),'WEBP');
 assert.ok(buf.length>500,'Missing illustrated pixel frames '+ids[i]);
 assert.equal(m.moves[ids[i]].frames,frames[i]);
 assert.ok(new Set(m.moves[ids[i]].painted).size>=3,'Not an animated sequence '+ids[i]);
}
const shots=[],painted=[],old=[],skills=names.map(name=>({name,type:'poison'}));
class FakeImage{
 constructor(){this.complete=false;this.naturalWidth=0;this.naturalHeight=0;}
 addEventListener(){}
 set src(s){const id=ids.find(v=>s.includes('/'+v+'.webp'));assert.ok(id);
 this.complete=true;this.naturalWidth=frames[ids.indexOf(id)]*96;this.naturalHeight=96;}
}
class Engine{
 constructor(){this.w=400;this.h=300;this.dpr=3;this.ctx={setTransform(){}};this.canvas={width:1200,height:900};
 this.player={x:40,y:150};this.enemy={x:310,y:150,r:34};this.projectiles=[];this.fps=55;}
 resize(){this.dpr=3;this.canvas.width=1200;this.canvas.height=900;}
 updateHud(){this.hudCalls=(this.hudCalls||0)+1;}
 useMove(){const shot={from:'player',type:'poison'};this.projectiles.push(shot);shots.push(shot);return true;}
 drawProjectile(shot){old.push(shot);}
}
const window={matchMedia:()=>({matches:true}),PokemonTorreV360Paint(){old.push('V359');return false;}};
const b={active:true},mon={};
const context=vm.createContext({window,navigator:{userAgent:'Android 14 Pixel 7'},
 Image:FakeImage,location:{hostname:'prod.example'},BattleEngine:Engine,battle:b,
 current:()=>mon,skillSet:()=>skills,performance:{now:()=>1100},console,Math});
for(const path of ['effects/moves/v111-performance/mobile-fps.js',d+'renderer.js']){
 vm.runInContext(fs.readFileSync(path,'utf8'),context,{filename:path,timeout:2500});
}
const engine=new Engine();engine.resize();
assert.equal(engine.dpr,1.25);
assert.equal(engine.canvas.width,500);
assert.equal(engine.canvas.height,375);
for(let time=0;time<1600;time+=80)engine.updateHud(time);
assert.ok(engine.hudCalls<=11&&engine.hudCalls>=8,'HUD refresh should be 6–8Hz');
const g={
 save(){},restore(){},imageSmoothingEnabled:true,
 drawImage(...args){painted.push(args);},
 lineTo(){throw Error('generic Canvas stroke forbidden')},
 beginPath(){throw Error('generic CSS-shape forbidden')},
 fill(){throw Error('generic Canvas CSS fill forbidden')}
};
for(let i=0;i<4;i++){
 engine.useMove(i);
 assert.equal(shots.at(-1).__v111PoisonVisual,ids[i]);
 const n=painted.length;
 const f={move:skills[i],at:100,duration:1000,times:[.64],
  from:[40,150],to:[310,140]};
 for(const t of [.08,.42,.64,.85]){
  const res=window.PokemonTorreV360Paint(g,f,100+t*1000,engine);
  assert.equal(res,true);
 }
 assert.equal(painted.length-n,4);
 const framesUsed=painted.slice(n).map(x=>x[1]);
 assert.ok(new Set(framesUsed).size>=3,'animated separate frames: '+names[i]);
 assert.equal(painted.at(-1)[3],96);assert.equal(painted.at(-1)[4],96);
 assert.equal(g.imageSmoothingEnabled,false);
 engine.drawProjectile(shots.at(-1));
 assert.ok(!old.includes(shots.at(-1)),'duplicate orb visual');
}
assert.equal(window.PokemonTorrePoisonV111.diagnostics().ready.length,4);
assert.ok(window.PokemonTorrePoisonV111.diagnostics().impacts>=4);
assert.equal(window.PokemonTorreMobilePerfV111.diagnostics().activeDpr,null);
const untouched={move:{name:'Surf'},at:0,duration:900};
window.PokemonTorreV360Paint(g,untouched,100,engine);
assert.ok(old.includes('V359'),'non-Poison visual must retain previous renderer');
console.log('PASS V111 four unique Poison GBA sprite animations, synchronized hit, generic orb hidden, DPR 1.25, HUD throttle');
