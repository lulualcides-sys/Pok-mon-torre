/* Pokemon Torre V85 — HAZE opt-in battle preview.
 * Haze is a non-damaging field-clearing status move, not an attack beam.
 * Six transparent author-created smoke wisps are animated as 36 independent
 * PixiJS WebGL sprites. No Canvas2D/CSS/video attack rendering.
 */
var hazeV85=(()=>{
 'use strict';
 const VERSION='85.0',LIFE=2550,W=160,H=112,N=6;
 const URI='effects/moves/haze/v85-preview/sprites/haze-wisps.webp?v=85.0';
 const metrics={version:VERSION,casts:0,draws:0,frames:0,wispCount:0,atlasReady:false,errors:[],
  last:null};
 let promise=null;
 const clamp=(v,min=0,max=1)=>Math.min(max,Math.max(min,v));
 const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
 function load(){
  if(promise)return promise;
  promise=PIXI.Assets.load(URI).then(texture=>{
   const b=texture?.baseTexture;
   if(!b?.valid||b.width!==W*N||b.height!==H)
    throw Error('Haze V85: spritesheet 960×112 inválido');
   metrics.atlasReady=true;
   return Array.from({length:N},(_,i)=>
    new PIXI.Texture(b,new PIXI.Rectangle(i*W,0,W,H)));
  }).catch(e=>{metrics.errors.push(String(e));promise=null;return null});
  return promise;
 }
 function cast(app,engine,now){
  if(!app?.stage||!window.PIXI?.Assets)return null;
  const root=new PIXI.Container(),under=new PIXI.Container(),over=new PIXI.Container();
  root.addChild(under,over);app.stage.addChild(root);
  const entries=[];
  for(let i=0;i<36;i++){
   const sp=new PIXI.Sprite(PIXI.Texture.EMPTY);
   sp.anchor.set(.5);sp.visible=false;
   sp.blendMode=PIXI.BLEND_MODES.NORMAL;
   (i<18?under:over).addChild(sp);
   entries.push({sp,i,phase:i*2.39996,tint:[0x9fa9c2,0x888daf,0x767795,0xb2b6c7,0x625c7e,0x727e9e][i%6]});
  }
  // A handful of glimmering shards mark stat-stage changes clearing;
  // only a visual motif. No modifications to actual battle stats.
  const glints=new PIXI.Graphics();
  over.addChild(glints);
  const item={root,entries,glints,ready:false,alive:true,frames:[],started:now,
   last:-1,app,engine,draws:0};
  metrics.casts++;metrics.wispCount=36;
  load().then(frames=>{
   if(!item.alive||!frames)return;
   item.frames=frames;item.ready=true;
  });
  return item;
 }
 function animate(item,now){
  if(!item?.alive||!item.ready)return false;
  const t=clamp((now-item.started)/LIFE),{engine,entries}=item;
  const fieldW=engine.w||680,fieldH=engine.h||400;
  const fade=smooth(t/.17)*(1-smooth((t-.76)/.24));
  const cover=smooth((t-.06)/.48);
  // Rolling three-level fog: local charge → curling field cover → dissipate.
  const middleX=fieldW*.50,middleY=fieldH*.52;
  for(const {sp,i,phase,tint} of entries){
   const depth=i<18?0:1;
   const column=i%12,row=Math.floor(i/12);
   const u=clamp((t-(column%5)*.027)/.66);
   const spread=smooth(u);
   // Independent flowing trajectories; do not drag one giant fog PNG across screen.
   const restX=(column-5.5)*fieldW*.070+(row%2?19:-21);
   const x=middleX+restX*spread+Math.sin(phase+t*11.0)*14+(t-.5)*fieldW*.075;
   const y=middleY+(row-1.2)*fieldH*.13
     -18*spread+Math.sin(phase*1.7+t*8.5)*(7+3*depth);
   const breath=1+.12*Math.sin(phase*.8+t*15);
   const size=(.79+((i*7)%8)*.075)*breath;
   sp.texture=item.frames[i%N];sp.visible=fade>.008;
   sp.position.set(x,y);
   sp.width=(80+fieldW*.043+20*depth)*size;
   sp.height=(54+fieldH*.018+6*depth)*size;
   sp.rotation=Math.sin(phase*.66+t*6)*.13;
   sp.alpha=clamp(fade*(depth?.45:.35)*(.55+.45*spread));
   sp.tint=tint;
  }
  const graphics=item.glints;graphics.clear();
  // Crystal-like trails suspended in the fog; fine dark strokes are included
  // in source sprite, glints provide subtle animated precision.
  if(t>.34&&t<.88){
   for(let i=0;i<13;i++){
    const p=i*2.399+t*2.1;
    const x=middleX+Math.cos(p)*fieldW*(.13+.025*(i%4));
    const y=middleY+Math.sin(p)*fieldH*.18-19;
    const scale=(.4+.6*Math.sin(Math.PI*clamp((t-.34)/.54)))*(.7+(i%3)*.21);
    graphics.lineStyle(1.2,0x182339,scale*.65);
    graphics.beginFill(i%3===0?0xd7edf5:0x9ca7d7,scale*.70);
    graphics.drawPolygon([x,y-3.3*scale,x+2*scale,y,x,y+3.3*scale,x-2*scale,y]);
    graphics.endFill();
   }
  }
  item.draws++;metrics.draws++;metrics.frames=Math.max(metrics.frames,Math.floor(t*8)+1);
  metrics.last={opacity:+fade.toFixed(3),cover:+cover.toFixed(3),visibleWisps:entries.filter(x=>x.sp.visible).length,
   t:+t.toFixed(3),w:fieldW,h:fieldH};
  return t<1;
 }
 function destroy(item){
  if(!item||!item.alive)return;
  item.alive=false;item.ready=false;
  if(item.root?.parent)item.root.parent.removeChild(item.root);
  item.root?.destroy({children:true});
  item.entries.length=0;
 }
 function diagnostics(){return {...metrics,errors:metrics.errors.slice(-4),last:metrics.last&&{...metrics.last}}}
 if(typeof window!=='undefined'){
  window.PokemonTorreHazePreviewV85={version:VERSION,diagnostics};
  if(window.PIXI?.Assets)load();
 }
 return {cast,animate,destroy,load,diagnostics,LIFE,URI};
})();
