'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const index=read('index.html');
const source=read('effects/moves/v81-approved/render.js');
const sync=read('effects/moves/_runtime/impact-sync-v80.js');
const v80=read('effects/moves/v80-preview/render.js');
const v77=read('effects/moves/v77-preview/render.js');
assert.ok(index.includes('fxFiles[i]="effects/moves/v81-approved/render.js"'),'Approval is not default');
assert.ok(index.includes('fxFiles[i]="effects/moves/v80-preview/render.js"'),'Preview comparison route lost');
assert.ok(index.includes('if(new URLSearchParams(location.search).get(\'safe\')!==\'1\'){'),'Safe mode lost');
assert.ok(index.includes("impact-sync-v80.js?build=v81-approved-impact"),'Production hit sync not installed');
assert.ok(index.includes("fxFiles[i]=\"effects/moves/v81-approved/render.js\"")&&
 index.includes('V89 resilience: old V72/V78 WebP atlases'),
 'V81 must stay the approved renderer while absent legacy WebPs are optional');
assert.ok(!source.includes('function badge(){'),'Preview overlay must not appear in production');
assert.ok(source.includes('catalog_dragonclaw')&&source.includes('catalog_cortex'),'Contact approvals removed');
assert.ok(source.includes('catalog_dragonpulse')&&source.includes('catalog_aurasphere'),'Ranged approvals removed');
assert.ok(source.includes("effects/moves/v77-preview/sprites/"),'Saved V77 contact art changed');
assert.ok(source.includes("effects/moves/v78-preview/sprites/"),'Saved V78 ranged art changed');
assert.ok(sync.includes('window.PokemonTorreBattleArtV81?.synchronization'),'Normal V81 sync missing');
assert.ok(sync.includes('window.PokemonTorreBattlePreviewV80?.synchronization'),'Preview comparison sync changed');
assert.ok(!source.includes('getContext('),'No Canvas artwork');
class Container{constructor(){this.children=[]}addChild(c){this.children.push(c);return c}}
class Sprite{constructor(texture){this.texture=texture;this.anchor={set:()=>{}};this.position={set:(x,y)=>{this.x=x;this.y=y}}}}
class Texture{constructor(base,rect){this.baseTexture=base;this.frame=rect}}Texture.EMPTY={};
class Rectangle{constructor(x,y,w,h){Object.assign(this,{x,y,w,h})}}
const PIXI={Container,Sprite,Texture,Rectangle,Assets:{load:async()=>({baseTexture:{valid:true,width:3840,height:240}})}};
const context=vm.createContext({window:{PIXI},PIXI,console});
vm.runInContext(source,context);
const fx=vm.runInContext('battleFourV72',context);
const art=context.window.PokemonTorreBattleArtV81;
assert.equal(art.version,'81.0');
assert.equal(art.approved,true);
assert.equal(art.synchronization.impactFraction,5/8);
assert.equal(art.synchronization.rangedSlowdown,3.4);
assert.ok(!context.window.PokemonTorreBattlePreviewV80);
for(const k of ['catalog_thunder','catalog_discharge','catalog_thunderwave',
 'catalog_volttackle','catalog_leechseed','catalog_stunspore'])assert.equal(fx.accepts(k),false);
(async()=>{
 const app={stage:new Container(),screen:{width:620,height:330}};
 for(const [key,duration,asset] of [
  ['catalog_dragonclaw',1800,'dragon-claw'],['catalog_xscissor',1800,'x-scissor'],
  ['catalog_dragonpulse',3400,'dragon-pulse'],['catalog_aurasphere',3400,'aura-sphere']]){
  const f={from:[70,140],to:[460,140],at:100,duration:1000};
  const item=fx.install(app,f,key);
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(item.ready,true,key);
  assert.equal(item.frames.length,8,key);
  assert.equal(item.visualDuration,duration,key+' incorrect approved speed');
  fx.animate(item,100+duration*5/8);
  assert.equal(item.sprite.texture.frame.x,5*480,'Contact frame misaligned '+key);
  assert.equal(f.duration,1000,'Original gameplay cast duration altered');
  const uri=fx.source(asset);
  assert.ok(uri.includes(['dragon-claw','x-scissor'].includes(asset)?'v77-preview':'v78-preview'));
  fx.dispose(item);
 }
 assert.ok(v80.includes('RANGED_SLOWDOWN=3.4')&&v77.includes('catalog_dragonclaw'));
 console.log('PASS V81: four approved Pixi sprites, default gameplay sync, no preview overlay, contact and electric protected');
})().catch(err=>{console.error(err);process.exitCode=1});
