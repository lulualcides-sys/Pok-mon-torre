'use strict';
/* V85 Haze: validate one STATUS-only cast is 36 individually animated
 * GPU smoke wisps; no legacy V84/approved FX mutations. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const dir=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(dir,p),'utf8');
const buffer=fs.readFileSync(path.join(dir,'effects/moves/haze/v85-preview/sprites/haze-wisps.webp'));
assert.equal(buffer.toString('ascii',0,4),'RIFF');
assert.equal(buffer.toString('ascii',8,12),'WEBP');
assert.ok(buffer.length>2000,'Atlas not generated');
const js=read('effects/moves/haze/v85-preview/render.js');
const index=read('index.html'),pixi=read('effects/moves/_runtime/pixi-layer.js');
const end=read('effects/moves/_runtime/end.js');
assert.ok(index.includes("get('battle_preview')==='haze85'"));
assert.ok(index.includes('effects/moves/haze/v85-preview/render.js'));
assert.ok(end.includes("norm(move?.name)!=='haze'"));
assert.ok(end.includes('pixiFX.beginHazeV85(this,start)'));
assert.ok(end.includes('pixiFX.frameHazeV85(now,this)'));
assert.ok(pixi.includes('frameHazeV85'));
assert.ok(!js.includes('getContext(')&&!js.includes('document.createElement(\'canvas\''));
assert.ok(!read('effects/moves/v84-preview/render.js').includes('hazeV85'));
class Container{constructor(){this.children=[];this.parent=null;}
 addChild(...children){for(const c of children){this.children.push(c);c.parent=this;}return children[0];}
 removeChild(o){this.children=this.children.filter(x=>x!==o);o.parent=null;}
 destroy(){this.children.length=0;}}
class Graphics extends Container{
 lineStyle(){}beginFill(){}drawPolygon(){}endFill(){}clear(){}
}
class Sprite{constructor(tex){this.texture=tex;this.anchor={set(){}};
 this.position={set:(x,y)=>{this.x=x;this.y=y}};this.visible=false;}}
class Texture{constructor(base,rectangle){this.baseTexture=base;this.frame=rectangle;}}Texture.EMPTY={};
class Rectangle{constructor(x,y,w,h){Object.assign(this,{x,y,w,h});}}
const PIXI={Assets:{load:async()=>({baseTexture:{valid:true,width:960,height:112}})},
 Sprite,Graphics,Texture,Rectangle,Container,BLEND_MODES:{NORMAL:0}};
const window={PIXI},context=vm.createContext({window,PIXI,console});
vm.runInContext(js,context);
const haze=vm.runInContext('hazeV85',context);
(async()=>{
 const app={stage:new Container()},engine={w:760,h:440};
 const item=haze.cast(app,engine,100);
 await new Promise(resolve=>setImmediate(resolve));
 assert.ok(item.ready);assert.equal(item.frames.length,6);
 assert.equal(item.entries.length,36);
 const frame1=haze.animate(item,340);
 assert.ok(frame1);
 const coords=item.entries.map(x=>[x.sp.x,x.sp.y]);
 assert.ok(item.entries.every(x=>x.sp.texture instanceof Texture));
 haze.animate(item,1100);
 const distinct=item.entries.filter((x,i)=>x.sp.x!==coords[i][0]||x.sp.y!==coords[i][1]);
 assert.equal(distinct.length,36,'Every fog bank must MOVE independently');
 assert.ok(item.entries.some(x=>x.sp.alpha>.05));
 const stats=haze.diagnostics();
 assert.equal(stats.version,'85.0');assert.ok(stats.draws>=2);
 assert.equal(stats.wispCount,36);assert.equal(stats.atlasReady,true);
 assert.equal(haze.animate(item,2750),false);
 haze.destroy(item);assert.equal(app.stage.children.length,0);
 console.log('PASS V85 Haze: 36 animated Pixi fog banks, unique 6-frame WebP, non-damaging status integration, protected official moves');
})().catch(e=>{console.error(e);process.exitCode=1});
