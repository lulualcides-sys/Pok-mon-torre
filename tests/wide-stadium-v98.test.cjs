'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('effects/arena/wide-camera-v98.js','utf8');
const idx=fs.readFileSync('index.html','utf8');
const pixi=fs.readFileSync('effects/moves/_runtime/pixi-layer.js','utf8');
assert.ok(idx.includes('effects/arena/wide-camera-v98.js'));
assert.ok(pixi.includes("engine._stadiumV98"));
function run(on){
 const style={};const parent={getBoundingClientRect(){return{
  left:0,top:0,right:400,bottom:750,width:400,height:750};
 }};
 const canvas={style,parentElement:parent,
  getBoundingClientRect(){const width=400*(parseFloat(style.width)||100)/100;
   return{left:-(parseFloat((style.transform||'').match(/translate3d\((-?[\d.]+)/)?.[1])||0),
    width,height:750,top:0,right:width,bottom:750};
  }};
 class BattleEngine{
  constructor(){this.canvas=canvas;this.w=400;this.h=750;
   this.player={x:85,y:420,r:24};this.enemy={x:310,y:280,r:20};
  }
  resize(){const r=this.canvas.getBoundingClientRect();this.w=r.width;
   this.h=r.height;this.resizeCount=(this.resizeCount||0)+1;}
  bounds(p){p.x=Math.max(this.w*.065,Math.min(this.w*.94,p.x));
   p.y=Math.max(this.h*.24,Math.min(this.h*.84,p.y));}
  draw(){this.frameCount=(this.frameCount||0)+1;}
 }
 const window={},battle={active:true},location={search:on?'?arena_preview=cinematic':'?none'};
 vm.runInNewContext(source,{window,location,BattleEngine,battle,URLSearchParams,
  Math,console,performance:{now:()=>1000}});
 const e=new BattleEngine();e.resize();return {e,window,style};
}
const orig=run(false);
assert.equal(orig.e.w,400);
assert.equal(orig.window.PokemonTorreArenaWideV98.enabled,false);
assert.equal(orig.style.width,undefined);
const {e,window,style}=run(true);
assert.equal(window.PokemonTorreArenaWideV98.enabled,true);
assert.equal(e.w,620);
assert.equal(e._stadiumMaxPan,220);
assert.equal(e._stadiumViewportW,400);
assert.equal(style.width,'155%');
assert.equal(e._stadiumV98,true);
// Expand genuine movement range; old engine could not pass 94% of full world.
const oldRight=e.w*.94,actor={x:e.w*.975,y:900};e.bounds(actor);
assert.ok(actor.x>oldRight,'Pokémon must exit former square into side lanes');
assert.equal(actor.y,e.h*.84,'Do not change existing vertical HUD safety margin');
const initial=e._stadiumCameraX;
e.player.x=592;e.enemy.x=583;
for(let i=1;i<=60;i++)e.draw(1000+i*16);
assert.ok(e._stadiumCameraX>initial+20,'Camera follows fighter to the far side');
assert.ok(e._stadiumCameraX<=220,'Camera should not pan outside world');
assert.ok(style.transform.startsWith('translate3d(-'),'Camera offset should be applied to actual canvas');
const d=window.PokemonTorreArenaWideV98.diagnostics();
assert.equal(d.worldW,620);assert.equal(d.viewportW,400);
assert.ok(d.draws>=60);
console.log('PASS V98: actual 155% horizontal world, Pokémon beyond old frame, camera tracks, old arena untouched');
