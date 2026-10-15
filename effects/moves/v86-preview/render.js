/* V86 opt-in preview. Official-idea animations: Frenzy Plant-style giant
 * brown roots, original persistent frost hazard, Frost Breath icy cone,
 * Double Hit-style TWO sequential vine whips. Pixi/WebGL, no runtime CSS/VFX
 * canvas, no damage/cooldown edits. One scene owns one real accepted cast.
 */
var referenceFourV86=(()=>{
 'use strict';
 const VERSION='94.0',W=480,H=240;
 const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
   .toLowerCase().replace(/[^a-z0-9]/g,'');
 const specs=Object.freeze({
  raizesviolentas:{name:'Raízes Violentas',asset:'raizes-violentas',weight:'heavy',time:1860,scope:'target',size:.92,thick:.82,impact:.62},
  geadapersistente:{name:'Geada Persistente',asset:'geada-persistente',weight:'heavy',time:1940,scope:'target',size:.88,thick:.66,impact:.58},
  soprocongelante:{name:'Sopro Congelante',asset:'sopro-congelante',weight:'medium',time:1300,scope:'line',size:.94,thick:.49,impact:.58},
  chicoteduplo:{name:'Chicote Duplo',asset:'chicote-duplo',weight:'medium',time:1600,scope:'line',size:.93,thick:.51,impact:.55}
 });
 const resolve=s=>Object.prototype.hasOwnProperty.call(specs,normalize(s))?normalize(s):'';
 const source=key=>{
  const id=specs[key].asset;
  return 'effects/moves/'+id+'/v86-preview/sprites/'+id+'.webp?v=94.0';
 };
 const assets=new Map(),errors=[];
 const counters={version:VERSION,casts:0,draws:0,overlapsPrevented:0,perMove:{},frames:0};
 const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
 const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
 function load(key){
  if(assets.has(key))return assets.get(key);
  const promise=PIXI.Assets.load(source(key)).then(tex=>{
   const b=tex?.baseTexture;
   const count=b?.width/W;
   if(!b?.valid||b.height!==H||!Number.isInteger(count)||
     ![8,12,16].includes(count))
    throw Error('V86 inválido: '+key);
   return Array.from({length:count},(_,i)=>
    new PIXI.Texture(b,new PIXI.Rectangle(i*W,0,W,H)));
  }).catch(e=>{assets.delete(key);errors.push(String(e?.message||e));return null});
  assets.set(key,promise);return promise;
 }
 function cast(app,engine,from,to,name,now,hitAt){
  const key=resolve(name);
  if(!key||!app?.stage||!window.PIXI?.Assets)return null;
  const spec=specs[key];
  const root=new PIXI.Container();
  const art=new PIXI.Sprite(PIXI.Texture.EMPTY);
  const fade=new PIXI.Sprite(PIXI.Texture.EMPTY);
  const flecks=new PIXI.Graphics();
  art.anchor.set(.5);fade.anchor.set(.5);
  root.addChild(art,fade,flecks);
  app.stage.addChild(root);
  const item={v86:true,app,engine,key,spec,root,art,fade,flecks,
   from:from.slice(),to:to.slice(),started:now,hitAt:Number.isFinite(hitAt)?hitAt:null,
   duration:spec.time,ready:false,alive:true,frames:[],stage:-1,painted:0};
  counters.casts++;
  const record=counters.perMove[spec.name]||(counters.perMove[spec.name]={casts:0,draws:0,framesMask:0,lastFrame:0,atlas:source(key)});
  record.casts++;
  load(key).then(frames=>{
   if(!item.alive||!frames)return;
   item.frames=frames;item.ready=true;
   // Existing published atlases remain at eight frames until regenerated;
   // the new policy records 12/16 as targets without assuming missing art.
   if(typeof framePolicyV87!=='undefined'){
    item.framePlan=framePolicyV87.plan({weight:item.spec.weight,
     nativeFrames:frames.length,mobile:!!window.matchMedia?.('(pointer:coarse)')?.matches});
    const record=counters.perMove[item.spec.name];
    if(record){record.targetFrames=item.framePlan.frames;
     record.nativeFrames=frames.length;record.weight=item.framePlan.weight;}
   }
  });
  return item;
 }
 function animate(fx,now){
  if(!fx?.alive||!fx.ready)return !!fx?.alive;
  const {spec,key,art,fade,flecks,from,to,app}=fx;
  const t=clamp((now-fx.started)/fx.duration);
  // Stages 5/8 align with native attack's scheduled impact when available,
  // without altering any damage queue or cooldown. For multi-hit Double Whip,
  // the two visible slashes remain separate, gameplay stays untouched.
  const contact=Math.max(.15,Math.min(.85,
    Number.isFinite(fx.hitAt)?(fx.hitAt-fx.started)/fx.duration:spec.impact));
  const progress=t<=contact?(t/contact)*spec.impact:
    spec.impact+(t-contact)/(1-contact)*(1-spec.impact);
  const total=fx.frames.length;
  const p=clamp(progress)*total,step=Math.min(total-1,Math.floor(p));
  const fraction=clamp(p-step);
  art.texture=fx.frames[step];art.visible=true;
  // No future impact frame blended into pre-impact image.
  const cross=step>=total-1||step===Math.round(total*.5)||
   step===Math.round(total*.625)?0:clamp((fraction-.37)/.63)*.24;
  fade.texture=fx.frames[Math.min(total-1,step+1)];fade.visible=cross>.005;
  art.alpha=(1-cross)*(step===total-1?clamp((1-t)*12):1);
  fade.alpha=cross*art.alpha;
  const ax=from[0],ay=from[1],bx=to[0],by=to[1];
  const dx=bx-ax,dy=by-ay,dist=Math.hypot(dx,dy)||1;
  const isArea=spec.scope==='target';
  const fieldW=app.screen.width||640;
  // Source atlas contains transparent margins. Bound the VISIBLE target-side
  // figure by the opponent's combat radius rather than a whole-screen percent.
  const foeR=Math.max(14,Math.min(50,Number(fx.engine?.enemy?.r)||fieldW*.055));
  const width=isArea?Math.min(fieldW*.36,foeR*3.95):
    Math.min(fieldW*.96,dist*1.15+40);
  // Strong enough to read next to the Pokemon, still bounded on mobile.
  const finalW=Math.max(isArea?112:132,width*spec.size);
  const finalH=finalW*(H/W)*spec.thick;
  // Distinct cinematic motion on TOP of each authored sprite stage;
  // no cross-use of the Grass atlas or generic move graphics.
  const rise=key==='raizesviolentas'?(1-smooth(t/.42))*11:0;
  const frostPulse=key==='geadapersistente'?.94+.06*Math.sin(t*Math.PI*2):1;
  const doublePulse=key==='chicoteduplo'?1+.04*Math.sin(t*Math.PI*4):1;
  const breathDrift=key==='soprocongelante'?Math.sin(t*Math.PI*2)*3:0;
  const dynamicScale=frostPulse*doublePulse;
  // The geometry source stays in local 480x240 authored coordinates.
  // For root/frost, anchor the action near defender (x in art ~355);
  // Breath/double travel across the actual from-to line.
  const centerX=isArea?bx-(355-W/2)*finalW/W:(ax+bx)/2;
  const centerY=(isArea?by-(139-H/2)*finalH/H:(ay+by)/2)+rise+breathDrift;
  const angle=isArea?0:Math.atan2(dy,dx);
  for(const sp of [art,fade]){
   sp.width=finalW*dynamicScale;sp.height=finalH*dynamicScale;
   sp.position.set(centerX,centerY);
   sp.rotation=angle;
  }
  // Independent particle specks: ice crystals for both ice moves, greenery
  // for roots/whips; subtle, no generic cross-type explosion.
  flecks.clear();
  const r=isArea?foeR*.42:foeR*.55;
  const color=(key==='soprocongelante'||key==='geadapersistente')?0xb1e9ff:0x94d86b;
  const on=smooth((t-.22)/.24)*(1-smooth((t-.79)/.20));
  if(on>.015){
   const budget=fx.framePlan?.maxParticles||14;
   for(let i=0;i<Math.min(7,budget);i++){
    const a=2.39996*i+fx.started*.001+t*4*(i%2?1:-1);
    const len=(3+(i%5)*2.5)*on+r*.28;
    const x=(isArea?bx:bx-12)+Math.cos(a)*len;
    const y=by+Math.sin(a)*len*.7;
    flecks.lineStyle(.6,0x102319,on*.4);
    flecks.beginFill(color,on*(.25+.05*(i%4)));
    flecks.drawEllipse(x,y,.8+(i%3)*.45,1.1+(i%2)*.5);
    flecks.endFill();
   }
  }
  if(fx.stage!==step){fx.stage=step;counters.frames++;}
  fx.painted++;counters.draws++;
  const rec=counters.perMove[spec.name];rec.draws++;rec.framesMask|=1<<step;
  rec.lastFrame=step+1;
  return t<1;
 }
 function destroy(fx){
  if(!fx?.alive)return;
  fx.alive=false;fx.ready=false;
  if(fx.root?.parent)fx.root.parent.removeChild(fx.root);
  fx.root?.destroy({children:true});
  fx.frames.length=0;
 }
 function diagnostics(){return {version:VERSION,...counters,atlases:assets.size,
  errors:errors.slice(-5),perMove:Object.fromEntries(Object.entries(counters.perMove)
   .map(([name,stat])=>[name,{...stat}]))};}
 if(typeof window!=='undefined'){
  window.PokemonTorreReferenceFourV86={version:VERSION,diagnostics};
  if(window.PIXI?.Assets)for(const key of Object.keys(specs))load(key);
  // The normal battle must not show a preview badge in front of menus.
  if(typeof document!=='undefined'&&
    new URLSearchParams(location.search).get('battle_preview')==='v86'){
   const badge=()=>{
    if(document.getElementById('pokemon-v86-label'))return;
    const label=document.createElement('div');label.id='pokemon-v86-label';
    label.textContent='PRÉVIA V88 · RAÍZES / GEADA / SOPRO / DUPLO';
    label.style.cssText='position:fixed;left:6px;bottom:6px;z-index:9999;'+
      'color:#c6f6ff;background:#152439e8;border:1px solid #6cbbd9;'+
      'border-radius:6px;padding:5px 8px;font:700 10px system-ui;pointer-events:none';
    document.body.appendChild(label);
   };
   if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',badge,{once:true});
   else badge();
  }
 }
 return {resolve,source,specs,load,cast,animate,destroy,diagnostics};
})();
