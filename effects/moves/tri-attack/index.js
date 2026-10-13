/* Pokemon Torre V35.91: Tri Attack (fire, electricity, ice simultaneously).
 * Native PixiJS shader sprites and real Pixi Particle Emitters. No generic orb. */
const TriAttackVFX=(()=>{
 'use strict';
 const ELEMENTS=[
  {id:'fire',palette:['#f65c22','#fff0b5','#701b16'],mode:7,parts:[0xff8038,0xffe4b1,0xaa2a1b]},
  {id:'electric',palette:['#ffdc42','#ffffff','#9c6612'],mode:4,parts:[0xffda39,0xffffff,0xe69a28]},
  {id:'ice',palette:['#4ac7ee','#f0ffff','#1c5796'],mode:9,parts:[0x42c5f0,0xffffff,0x528be0]}
 ];
 const smooth=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v)};
 const mix=(a,b,t)=>a+(b-a)*t;
 const gpuTextures=new WeakMap();
 function particleTex(app,i,tex){
  if(i===0){const img=tex('flame1');if(img)return img;}
  let cache=gpuTextures.get(app.renderer);if(!cache){cache=[];gpuTextures.set(app.renderer,cache);}
  if(cache[i])return cache[i];
  const g=new PIXI.Graphics();
  g.beginFill(0xffffff);
  if(i===1){g.moveTo(15,1);g.lineTo(20,9);g.lineTo(14,9);g.lineTo(9,25);g.lineTo(11,13);g.lineTo(6,14);}
  else if(i===2){g.moveTo(13,1);g.lineTo(23,13);g.lineTo(13,25);g.lineTo(3,13);}
  else{g.moveTo(13,1);g.lineTo(22,16);g.lineTo(13,26);g.lineTo(4,16);}
  g.closePath();g.endFill();
  cache[i]=app.renderer.generateTexture(g,{region:new PIXI.Rectangle(0,0,28,28)});
  g.destroy();return cache[i];
 }
 function emitterGroup(arr){
  return {cleanup(){for(const e of arr)if(e){e.emit=false;e.cleanup();}},
   destroy(){for(const e of arr)if(e)e.destroy();}};
 }
 function create({app,root,f,tex,particles}){
  const A=f.from,B=f.to;if(!Array.isArray(A)||!Array.isArray(B))return null;
  const dx=B[0]-A[0],dy=B[1]-A[1],angle=Math.atan2(dy,dx),nx=-Math.sin(angle),ny=Math.cos(angle);
  const styles=[],trails=[],bursts=[],S=cinematicVFX.makeShader;
  for(let i=0;i<3;i++){
   const elem=ELEMENTS[i],offset=(i-1)*30;
   const start=[A[0]+nx*offset,A[1]+ny*offset],end=[B[0]+nx*offset*.40,B[1]+ny*offset*.40];
   const spin=S(root,0,elem.palette,67,62,true);
   const ray=S(root,elem.mode,elem.palette,510,i===0?67:i===1?49:54,true);
   const tip=S(root,0,elem.palette,46,46,true);
   const blast=S(root,2,elem.palette,140,139,true);
   ray.sprite.anchor.set(0,.5);
   const pRoot=new PIXI.Container(),bRoot=new PIXI.Container();root.addChild(pRoot,bRoot);
   const particle=particleTex(app,i,tex);
   pRoot.scale.set(.85);bRoot.scale.set(.85);
   const trail=particles(pRoot,particle,elem.parts,false);
   const burst=particles(bRoot,particle,elem.parts,true);
   if(trail)trails.push(trail);if(burst)bursts.push(burst);
   styles.push({elem,start,end,spin,ray,tip,blast,trail,burst,
    angle:Math.atan2(end[1]-start[1],end[0]-start[0]),dist:Math.hypot(end[0]-start[0],end[1]-start[1])});
  }
  const endFlash=S(root,2,['#91bce9','#ffffff','#3665a9'],183,183,true);
  function draw(now,t,dt){
   const init=smooth(t/.22),travel=smooth((t-.21)/.48),hit=smooth((t-.66)/.34);
   for(let i=0;i<3;i++){
    const v=styles[i],a=v.start,b=v.end,x=mix(a[0],b[0],travel),y=mix(a[1],b[1],travel);
    for(const obj of [v.spin,v.ray,v.tip,v.blast]){
     obj.filter.uniforms.uTime=now*.001+i*.13;obj.filter.uniforms.uPhase=hit;
    }
    v.spin.sprite.position.set(a[0],a[1]);
    v.spin.sprite.alpha=t<.30?(.52+.48*init)*(1-smooth((t-.22)/.08)):0;
    v.spin.sprite.scale.set(.62+init*.51);
    v.ray.sprite.position.set(a[0],a[1]);v.ray.sprite.rotation=v.angle;
    v.ray.sprite.width=Math.max(1,v.dist*travel);
    v.ray.sprite.height=(i===0?64:i===1?51:55)*(1+.085*Math.sin(now*.017+i));
    v.ray.sprite.alpha=t>.20&&t<.87?Math.min(1,(t-.20)*14)*Math.min(1,(.88-t)*12):0;
    v.tip.sprite.position.set(x,y);v.tip.sprite.alpha=t>.21&&t<.87?Math.min(1,(t-.21)*13)*Math.min(1,(.88-t)*12):0;
    v.tip.sprite.scale.set(.58+.29*Math.abs(Math.sin(now*.012+i)));
    v.blast.sprite.position.set(b[0],b[1]);
    v.blast.sprite.alpha=hit>.005?Math.min(1,hit*5)*(1-hit*.82):0;
    v.blast.sprite.scale.set(.42+hit*.82);
    if(v.trail){v.trail.updateOwnerPos(x,y);v.trail.emit=t>.20&&t<.82;v.trail.update(dt);}
    if(v.burst){v.burst.updateOwnerPos(b[0],b[1]);v.burst.emit=hit>.11&&hit<.69;v.burst.update(dt);}
   }
   endFlash.filter.uniforms.uTime=now*.001;endFlash.filter.uniforms.uPhase=hit;
   endFlash.sprite.position.set(B[0],B[1]);
   endFlash.sprite.alpha=hit>0?Math.min(1,hit*4)*(1-hit*.93):0;
   endFlash.sprite.scale.set(.45+hit*1.09);
  }
  return {draw,style:'triattack',trail:emitterGroup(trails),burst:emitterGroup(bursts),
   shaderCount:13,elements:['fire','electric','ice'],simultaneous:true};
 }
 return {create};
})();
const previousTriFXCreate=cinematicVFX.create;
cinematicVFX.create=function(options){
 const n=String(options?.name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
 if(n==='triataque'||n==='triattack')return TriAttackVFX.create(options);
 return previousTriFXCreate(options);
};
window.PokemonTorreTriAttackFX=()=>({version:'35.91',elements:['fire','electric','ice'],simultaneous:true});
