'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const index=read('index.html'),source=read('effects/moves/v77-preview/render.js'),v75=read('effects/moves/v72-battle/render.js');
const ids=['dragon-claw','x-scissor','dragon-pulse','aura-sphere'];
assert.ok(index.includes("get('battle_preview')==='v77'"),'Opt-in V77 query not supported');
assert.ok(index.includes('fxFiles[i]="effects/moves/v77-preview/render.js"'),'V77 renderer not installed');
assert.ok(index.includes('"effects/moves/v72-battle/render.js"'),'Normal V75 battle path lost');
assert.ok(!index.includes('effects/atelier-v70/entry.js'), 'No in-game Atelier allowed');
assert.ok(!source.includes('getContext('),'V77 effects must be PixiJS, not Canvas 2D');
assert.ok(source.includes("effects/moves/v77-preview/sprites/"),'Old sprites still in use');
for(const id of ids){
 const sprite=path.join(root,'effects/moves/v77-preview/sprites',id+'.webp');
 const data=fs.readFileSync(sprite);
 assert.equal(data.toString('ascii',0,4),'RIFF','Invalid preview RIFF: '+id);
 assert.equal(data.toString('ascii',8,12),'WEBP','Invalid preview WebP: '+id);
 assert.ok(data.length>45000,'V77 missing authored art: '+id);
}
const approved=['catalog_thunder','catalog_discharge','catalog_thunderwave'];
class Container {constructor(){this.children=[];this.destroyed=false}addChild(x){this.children.push(x);return x}}
class Sprite {constructor(texture){this.texture=texture;this.anchor={set:()=>{}};this.position={set:(x,y)=>{this.x=x;this.y=y}}}}
class Texture {constructor(base,rect){this.baseTexture=base;this.frame=rect}}
Texture.EMPTY={};
class Rectangle{constructor(x,y,w,h){this.x=x;this.y=y;this.w=w;this.h=h}}
let requests=[];
const PIXI={Container,Sprite,Texture,Rectangle,Assets:{load:async uri=>{requests.push(uri);return {baseTexture:{valid:true,width:3840,height:240}}}}};
const context=vm.createContext({PIXI,window:{PIXI},console});
vm.runInContext(source,context);
const renderer=vm.runInContext('battleFourV72',context);
assert.equal(context.window.PokemonTorreBattlePreviewV77.version,'77.0','Visible confirmation missing');
const all=['catalog_dragonclaw','catalog_dragonpulse','catalog_aurasphere','catalog_cortex','catalog_xscissor'];
for(const k of approved)assert.equal(renderer.accepts(k),false,'Approved move redirected: '+k);
for(const key of all){
 assert.equal(renderer.accepts(key),true,key);
 const app={stage:new Container(),screen:{width:620,height:330}};
 const f={from:[82,147],to:[470,147],at:100,duration:1000};
 const item=renderer.install(app,f,key);assert.ok(item?.v72);
 // PIXI.Assets.load resolves as a microtask; continue after setImmediate.
 (async()=>{})();
 assert.equal(f.duration,1000,'Modified gameplay timeline');
}
(async()=>{
 const app={stage:new Container(),screen:{width:620,height:330}};
 const f={from:[82,147],to:[470,147],at:100,duration:1000};
 const item=renderer.install(app,f,'catalog_dragonclaw');
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(item.frames.length,8,'Not eight real frames');
 assert.equal(item.visualDuration,1800,'V75 slow timing altered');
 const results=[];
 for(const i of [1,3,4,5,6]){
   renderer.animate(item,100+1800*(i+.25)/8);
   results.push(item.sprite.texture.frame.x);
 }
 assert.deepEqual(results,[480,1440,1920,2400,2880],'Claws still share a single sprite frame');
 assert.ok(context.window.PokemonTorreBattlePreviewV77.phase().includes('Dragon Claw'),'Cast not visible in preview indicator');
 assert.ok(requests.some(u=>u.includes('v77-preview/sprites/dragon-claw.webp')),'Wrong asset path');
 renderer.dispose(item);
 assert.ok(item.disposed);
 console.log('PASS V77: real staged raster frames, hit before three different claws, visible test indicator, original V75 preserved');
})().catch(e=>{console.error(e);process.exitCode=1});
