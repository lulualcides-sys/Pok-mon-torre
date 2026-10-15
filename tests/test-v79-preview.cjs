'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const ui=read('effects/ui/move-library-v61.js');
const oldPreview=read('effects/moves/v78-preview/render.js');
const newPreview=read('effects/moves/v79-preview/render.js');
const game=read('index.html');
const approved=read('effects/moves/v77-preview/render.js');
const fallback=read('effects/moves/v72-battle/render.js');
assert.ok(game.includes("get('battle_preview')==='v79'"),'New preview flag missing');
assert.ok(game.includes('fxFiles[i]="effects/moves/v79-preview/render.js"'),'New preview renderer not selected');
assert.ok(game.includes('"effects/moves/v72-battle/render.js"'),'Official fallback unexpectedly replaced');
assert.ok(newPreview.includes("VISUAL_SLOWDOWN=1.8"),'Contact attacks timing changed');
assert.ok(newPreview.includes('RANGED_SLOWDOWN=3.4'), 'Ranged preview pacing was not increased');
assert.ok(!newPreview.includes('getContext('),'No Canvas drawing in the attack art');
const markMatch=ui.match(/const MODIFIED_MOVES=new Set\((\[[^\n]+\])\)/);
assert.ok(markMatch,'Modified-move registry missing');
const marks=new Set(JSON.parse(markMatch[1]));
for(const slug of ['chamasdemoltres','rajadaflamejante','chamacircular','garradefogo',
  'girodefogo','sunnyday','amnesia','tempestadederaios','dragonclaw','cortex','xscissor']){
 assert.ok(marks.has(slug),'Visual effect has no + marker: '+slug);
}
assert.ok(ui.includes("markEdited(skillLabel.querySelector('b')||skillLabel,skillName)"),
 'Plus sign should be next to the move NAME in combat, not the type below');
assert.ok(ui.includes('<path d="M12 7.7v8.6M7.7 12h8.6"/>'), 'Hand-drawn SVG + missing');
assert.ok(approved.includes('v77-preview/sprites/'),'Approved contact art modified');
assert.ok(fallback.includes("effects/moves/v77-preview/sprites/"),'Approved contact art not in normal game');
class Container {constructor(){this.children=[]}addChild(x){this.children.push(x);return x}}
class Sprite {constructor(tex){this.texture=tex;this.anchor={set:()=>{}};this.position={set:(x,y)=>{this.x=x;this.y=y}}}}
class Texture{constructor(base,rect){this.baseTexture=base;this.frame=rect}}Texture.EMPTY={};
class Rectangle{constructor(x,y,w,h){Object.assign(this,{x,y,w,h})}}
const PIXI={Container,Sprite,Texture,Rectangle,Assets:{load:async()=>({baseTexture:{valid:true,width:3840,height:240}})}};
function make(s){const context=vm.createContext({PIXI,window:{PIXI},console});vm.runInContext(s,context);return {context,fx:vm.runInContext('battleFourV72',context)};}
(async()=>{
 const original=make(oldPreview),current=make(newPreview);
 assert.equal(current.context.window.PokemonTorreBattlePreviewV79.version,'79.0');
 const gameApp={stage:new Container(),screen:{width:620,height:330}};
 const moves=[
  ['catalog_dragonpulse',3400,'v78-preview/sprites/dragon-pulse.webp'],
  ['catalog_aurasphere',3400,'v78-preview/sprites/aura-sphere.webp'],
  ['catalog_cortex',1800,'v77-preview/sprites/x-scissor.webp'],
  ['catalog_dragonclaw',1800,'v77-preview/sprites/dragon-claw.webp']
 ];
 for(const [name,duration,url] of moves){
  const f={from:[70,100],to:[460,110],duration:1000,at:100};
  const item=current.fx.install(gameApp,f,name);
  await new Promise(resolve=>setImmediate(resolve));
  assert.ok(item.ready,name+' sprite cache not ready');
  assert.equal(item.visualDuration,duration,name+' wrong visual lifetime');
  assert.equal(f.duration,1000,name+' touched gameplay cast duration');
  assert.ok(current.fx.source(current.fx.specs[name].asset).includes(url),'Approved art was replaced: '+name);
  current.fx.animate(item,100+duration*.48);
  assert.equal(item.sprite.texture.frame.x,480*3,name+' frame selected at wrong time');
  if(duration===3400){
   assert.equal(item.sprite.texture.frame.x,1440,'Still too fast '+name);
   assert.equal(original.fx.diagnostics().visualSlowdown,1.8,'Old benchmark changed');
   // At 1800 ms the new move is still in its travel phase, not already finished.
   current.fx.animate(item,1900);
   assert.ok(item.sprite.texture.frame.x < 7*480,'Ranged attack finished prematurely');
  }
  current.fx.dispose(item);
 }
 for(const name of ['catalog_thunder','catalog_discharge','catalog_thunderwave'])
  assert.equal(current.fx.accepts(name),false,'Protected electrical move intercepted: '+name);
 const diagnostics=current.fx.diagnostics();
 assert.equal(diagnostics.rangedVisualSlowdown,3.4);
 console.log('PASS V79: 3.4x slower ranged preview, V77 contact timing untouched, Moltres and missing authored moves have vector +');
})().catch(err=>{console.error(err);process.exitCode=1});