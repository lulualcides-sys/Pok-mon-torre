/* Pokémon Torre · Tri Attack V36.00 — sprite-only cinematic attack.
  Authored elemental sprites (fire / lightning / ice) with transparent backgrounds.
  No generic GPU rectangles, shader quads, solid disks, triangles, or purple overlays.
  Independent folder. Attack damage/cooldowns are controlled by the game.
*/
const TriAttackVFX=(()=>{
 'use strict';
 const BASE='effects/moves/tri-attack/assets/';
 const PARTS=[
  {name:'fire',projectile:'fire.svg',impact:'fire-impact.svg',particle:'ember.svg',colors:[0xffa02c,0xffffff,0xcc3419],width:84,height:34,impactSize:57},
  {name:'electric',projectile:'electric.svg',impact:'electric-impact.svg',particle:'spark.svg',colors:[0xffd23e,0xffffff,0xefaa17],width:91,height:37,impactSize:60},
  {name:'ice',projectile:'ice.svg',impact:'ice-impact.svg',particle:'crystal.svg',colors:[0x7edbfa,0xffffff,0x4c94d9],width:85,height:34,impactSize:58}
 ];
 const file=p=>BASE+p;
 const cache=new Map();
 const load=p=>{
  const path=file(p);
  if(!cache.has(path)){
   // The image begins loading when the texture is requested; preload at boot.
   cache.set(path,PIXI.Texture.from(path));
  }
  return cache.get(path);
 };
 function preload(){
  if(!window.PIXI?.Texture)return false;
  for(const item of PARTS){load(item.projectile);load(item.impact);load(item.particle);}
  return true;
 }
 const clamp=v=>Math.max(0,Math.min(1,v));
 const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
 const lerp=(a,b,t)=>a+(b-a)*t;
 function makeSprite(root,texture,additive=false){
  const sprite=new PIXI.Sprite(texture);
  sprite.anchor.set(.5);
  sprite.alpha=0;
  sprite.blendMode=additive?PIXI.BLEND_MODES.ADD:PIXI.BLEND_MODES.NORMAL;
  root.addChild(sprite);
  return sprite;
 }
 function aggregate(list){
  return {cleanup(){for(const e of list)if(e){e.emit=false;e.cleanup();}},
   destroy(){for(const e of list)if(e)e.destroy();}};
 }
 function create({root,f,particles}){
  const A=f.from,B=f.to;
  if(!Array.isArray(A)||!Array.isArray(B))return null;
  preload();
  const angle=Math.atan2(B[1]-A[1],B[0]-A[0]),sideX=-Math.sin(angle),sideY=Math.cos(angle);
  const lanes=[],trails=[],bursts=[];
  for(let i=0;i<3;i++){
   const e=PARTS[i],offset=(i-1)*21;
   const from=[A[0]+sideX*offset,A[1]+sideY*offset];
   const to=[B[0]+sideX*offset*.33,B[1]+sideY*offset*.33];
   const texture=load(e.projectile);
   // Unique hand-authored projectile. Not rendered as a big filtered rectangle.
   const main=makeSprite(root,texture);
   main.width=e.width;main.height=e.height;main.rotation=angle;
   const echoes=[];
   for(let j=0;j<4;j++){
    const echo=makeSprite(root,texture,true);
    echo.width=e.width*(.83-j*.13);
    echo.height=e.height*(.81-j*.12);
    echo.rotation=angle;echoes.push(echo);
   }
   const charge=makeSprite(root,texture,true);
   charge.width=29;charge.height=12;charge.rotation=angle;
   const impact=makeSprite(root,load(e.impact));
   impact.width=e.impactSize;impact.height=e.impactSize;
   // Real ember, jagged electric and shard particles: no generic white circles.
   const vtrail=new PIXI.Container(),vburst=new PIXI.Container();
   root.addChild(vtrail,vburst);
   const particleTex=load(e.particle);
   const emitter=particles(vtrail,particleTex,e.colors,false);
   const hitEmitter=particles(vburst,particleTex,e.colors,true);
   if(emitter)trails.push(emitter);
   if(hitEmitter)bursts.push(hitEmitter);
   lanes.push({from,to,e,main,echoes,charge,impact,emitter,hitEmitter});
  }
  // Each blast is independent. We deliberately do NOT add a full-screen flash.
  function draw(now,t,dt){
   const chargeQ=smooth(t/.17),travel=smooth((t-.17)/.54),burst=smooth((t-.71)/.25);
   for(let i=0;i<lanes.length;i++){
    const L=lanes[i],A=L.from,B=L.to;
    const x=lerp(A[0],B[0],travel),y=lerp(A[1],B[1],travel);
    const fadeIn=smooth((t-.16)/.08),fadeOut=1-smooth((t-.73)/.11);
    const alpha=fadeIn*fadeOut;
    const pulse=1+.045*Math.sin(now*.015+i*2.2);
    L.charge.position.set(A[0]+Math.cos(angle)*16,A[1]+Math.sin(angle)*16);
    L.charge.alpha=t<.20?chargeQ*(1-smooth((t-.13)/.07))*.85:0;
    L.main.position.set(x,y);L.main.alpha=alpha;
    L.main.width=L.e.width*pulse;L.main.height=L.e.height*pulse;
    for(let j=0;j<L.echoes.length;j++){
     const sp=L.echoes[j],q=clamp(travel-(j+1)*.065),off=(j%2?1:-1)*(j+1)*2.2;
     sp.position.set(lerp(A[0],B[0],q)+sideX*off,lerp(A[1],B[1],q)+sideY*off);
     sp.alpha=alpha*(.22-j*.037);
    }
    L.impact.position.set(B[0],B[1]);
    L.impact.rotation=(i-1)*.13+burst*.26*(i%2?1:-1);
    L.impact.alpha=burst>0?(1-smooth((t-.83)/.16))*Math.min(1,burst*3):0;
    L.impact.scale.set(.48+.49*burst);
    if(L.emitter){
     L.emitter.updateOwnerPos(x,y);
     L.emitter.emit=t>.20&&t<.74;
     L.emitter.update(dt);
    }
    if(L.hitEmitter){
     L.hitEmitter.updateOwnerPos(B[0],B[1]);
     L.hitEmitter.emit=t>.70&&t<.85;
     L.hitEmitter.update(dt);
    }
   }
  }
  return {style:'triattack_sprite',draw,trail:aggregate(trails),burst:aggregate(bursts),
   elements:['fire','electric','ice'],assets:9,projectiles:3};
 }
 return {create,preload,diagnostics:()=>({version:'36.00',source:'hand-authored sprites',
  effects:['fire','electric','ice'],spriteAssets:9,threeSeparateProjectiles:true})};
})();
const triAttackPrevCreate=cinematicVFX.create;
cinematicVFX.create=function(opts){
 const k=String(opts?.name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
 if(k==='triataque'||k==='triattack')return TriAttackVFX.create(opts);
 return triAttackPrevCreate(opts);
};
window.PokemonTorreTriAttackFX=()=>TriAttackVFX.diagnostics();
// Libraries are already loaded before this plugin executes inside game HTML.
TriAttackVFX.preload();
