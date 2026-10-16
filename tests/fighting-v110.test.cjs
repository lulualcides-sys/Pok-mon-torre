'use strict';
// V110: 3 GBA sprite-only IMPACT effects. All pre-contact frames TRANSPARENT.
// Cross Chop red X unchanged in size, lowered to the enemy torso.
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const root='effects/moves/v110-fighting/';
const specs={chute:[8,.59],karate:[12,.59],brick:[16,.63]};
const index=fs.readFileSync('index.html','utf8'),
      pages=fs.readFileSync('.github/workflows/deploy.yml','utf8'),
      reg=JSON.parse(fs.readFileSync('effects/moves/STATUS_APROVADOS.json','utf8'));
assert.ok(index.includes('v110-impact-only'));assert.ok(pages.includes('build-v110-fighting.py'));
for(const name of ['Chute','Golpe de Karatê','Cross Chop','Brick Break']){
 const row=reg.moves.find(x=>x.move===name);
 assert.equal(row?.version,'V110');
 assert.equal(row?.status,'em_teste');assert.equal(row?.protect,true);
}
const old=fs.readFileSync('effects/moves/v107-fighting/real-sprites.js','utf8');
assert.ok(old.includes("name==='cross'?.30:1"),'keep Cross visual & original 30% size');
assert.ok(old.includes("name==='cross'?38*scale:0"),'place X on target torso, not head');
const manifest=JSON.parse(fs.readFileSync(root+'manifest.json','utf8'));
const callbacks=new Map(),imgs=[];
class Img {
 constructor(){this.complete=false;this.naturalWidth=0;this.naturalHeight=0;}
 addEventListener(){}
 set src(url){
  const match=/sheets\/(chute|karate|brick)\.webp/.exec(url);
  assert.ok(match,url);
  this.complete=true;this.naturalWidth=specs[match[1]][0]*96;this.naturalHeight=96;imgs.push(url);
 }
}
const window={PokemonTorreFightingV104:{retexture(name,fn){callbacks.set(name,fn)}}};
const context=vm.createContext({window,Image:Img,console,Math});
vm.runInContext(fs.readFileSync(root+'impact-only.js','utf8'),context,{filename:'impact-only.js'});
assert.equal(callbacks.size,3);
assert.equal(window.PokemonTorreFightingContactV110.diagnostics().ready.length,3);
const draw=[];
const g={globalAlpha:1,imageSmoothingEnabled:true,save(){},restore(){},
 drawImage(...args){draw.push(args)},
 beginPath(){throw Error('CSS-like vector path forbidden')},
 stroke(){throw Error('CSS-like stroke forbidden')},
 fill(){throw Error('CSS-like polygon forbidden')}};
for(const [name,key] of [['Chute','chute'],['Golpe de Karatê','karate'],['Brick Break','brick']]){
 const [n,hit]=specs[key];
 const meta=manifest.moves[key];
 assert.equal(meta.frames,n);
 for(let i=0;i<n;i++){
  const mustBeBlank=(i+.5)/n<hit;
  if(mustBeBlank)assert.equal(meta.painted[i],0,key+' no impact before contact');
  else if(i<n-1)assert.ok(meta.painted[i]>0,key+' impact must be visible after contact');
 }
 const before=draw.length;
 for(let i=0;i<n;i++){
  callbacks.get(name)(g,{to:[320,250],t:(i+.5)/n,scale:1,hit,frames:n,frame:i});
  const args=draw.at(-1);
  assert.equal(args[1],i*96,'different atlas frame every tick');
  assert.equal(args[3],96);assert.equal(args[4],96);
  assert.ok(args[7]<=110 && args[8]<=110,'local sprite only');
  assert.ok(args[6]+args[8]*.5>275,'impact lower than previous head anchor');
  assert.equal(g.imageSmoothingEnabled,false,'pixel rendering');
 }
 assert.equal(draw.length-before,n);
 const data=fs.readFileSync(root+'sheets/'+key+'.webp');
 assert.equal(data.toString('ascii',0,4),'RIFF');
 assert.equal(data.toString('ascii',8,12),'WEBP');
}
assert.equal(window.PokemonTorreFightingContactV110.diagnostics().canvasFrames,36);
console.log('PASS V110: blank before contact, GBA pixels only at impact, Cross X centered');
