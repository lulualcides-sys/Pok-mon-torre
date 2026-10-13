/* Pokémon Torre V35.90 — CINEMATIC VFX.
 * Actual GPU fragment shaders (volumetric beam, fluid wave, forked lightning,
 * metallic projectile, hot flames, crystalline shards, shadow vortex).
 * Uses PixiJS Filter, existing DS sprite frames and PixiJS Particle Emitter.
 * No Canvas 2D drawing in the visual path; independent from gameplay damage.
 */
const cinematicVFX=(()=>{
'use strict';
const FRAGMENT=String.raw`precision mediump float;
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float uTime;
uniform float uPhase;
uniform float uMode;
uniform float uOpacity;
uniform float uSeed;
uniform vec3 uMain;
uniform vec3 uHot;
uniform vec3 uDark;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){
 vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
 return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);
}
float fbm(vec2 p){
 float v=0.,a=.5;
 for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.02+17.17;a*=.5;}
 return v;
}
float lineMask(float x,float w){return 1.-smoothstep(w*.60,w,x);}
float glow(float x,float r){return exp(-x*x/max(.0001,r*r));}
void main(){
 vec2 uv=vTextureCoord, p=uv*2.-1.;
 float tm=uTime, n=fbm(p*5.1+vec2(tm*.31,-tm*.23)+uSeed);
 float n2=fbm(p*11.-vec2(tm*.52,tm*.18)+uSeed*1.7);
 float a=0., h=0., cool=0., spark=0., radius=length(p);
 vec3 col=uMain;
 // 0: volumetric energy orb with turbulent rotating plasma
 if(uMode<.5){
  vec2 q=p+vec2(sin(atan(p.y,p.x)*7.+tm*3.)*.055,cos(atan(p.y,p.x)*5.-tm*2.)*.045);
  float d=length(q);
  float edge=.54+.14*n-.09*n2;
  a=(1.-smoothstep(edge-.11,edge+.15,d))*.96;
  h=glow(d,.28)+glow(d,.53)*.47;
  spark=pow(max(0.,sin(atan(p.y,p.x)*11.+tm*5.)*.5+.5),11.)*glow(d-.55,.12);
  cool=1.-smoothstep(.08,.72,d);
 }
 // 1: luminous beam: longitudinal plasma filaments with a bright, tapered core
 else if(uMode<1.5){
  float w=(.23+.06*sin(uv.x*23.-tm*5.)+.08*n);
  float y=p.y+.048*sin(uv.x*21.+tm*4.)+.065*(n2-.5);
  a=glow(y,w)*(.69+.31*n);
  h=glow(y,.09)+glow(y,.19)*.8;
  spark=pow(max(0.,sin(uv.x*71.-tm*17.+n*6.)),20.)*glow(y,.33)*.8;
  a*=smoothstep(.0,.065,uv.x)*(1.-smoothstep(.91,1.,uv.x));
  cool=h;
 }
 // 2: impact burst, layered shockwave + hot fractured corona
 else if(uMode<2.5){
  float ring=abs(radius-(.18+.76*uPhase));
  float rays=pow(max(0.,sin(atan(p.y,p.x)*19.+tm*.8+n*3.)*.5+.5),8.);
  float shards=rays*glow(radius-(.22+.78*uPhase),.20);
  a=glow(ring,.055)+shards*.88+glow(radius,.28)*(1.-uPhase)*.94;
  h=glow(ring,.030)+glow(radius,.12)*(1.-uPhase);
  spark=shards;cool=1.-uPhase;
  a*=1.-smoothstep(.94,1.28,radius);
 }
 // 3: moving body of water with foam crests, refraction ripples
 else if(uMode<3.5){
  float surface=-.23+.24*sin(p.x*3.8-tm*2.7)+.13*sin(p.x*9.+tm*3.6)+.11*(n-.5);
  float inside=smoothstep(surface-.04,surface+.07,p.y)*(1.-smoothstep(.83,1.10,p.y));
  float foam=glow(p.y-surface,.085)*(1.-smoothstep(.7,1.09,abs(p.x)));
  float forward=1.-smoothstep(.7,1.07,abs(p.x));
  a=(inside*(.62+.35*n)+foam)*forward;
  h=foam*1.3+glow(p.y-surface-.24,.30)*.28;
  spark=pow(n2,9.)*inside*.6;cool=foam;
 }
 // 4: multi-fork lightning / electrical arc with moving plasma tips
 else if(uMode<4.5){
  float bend=.23*sin(p.x*8.+tm*12.)+.095*sin(p.x*22.-tm*19.)+.08*(n-.5);
  float branch1=bend+.33*sin(p.x*6.+tm*5.);
  float branch2=bend-.29*cos(p.x*7.-tm*3.);
  float main=glow(p.y-bend,.033);
  float sub=(glow(p.y-branch1,.024)+glow(p.y-branch2,.021))*.43;
  a=main+sub+glow(p.y-bend,.15)*.45;
  h=main*1.5+sub*.5;
  spark=pow(max(0.,sin(p.x*53.+tm*21.)),17.)*glow(p.y-bend,.23);
  cool=main;
 }
 // 5: sharp curved arc slash with motion-blurred luminous edges
 else if(uMode<5.5){
  float curve=p.y-(.40*p.x*p.x-.23)+.055*sin(p.x*8.+tm*4.);
  float taper=1.-smoothstep(.70,1.04,abs(p.x));
  a=(glow(curve,.045)+glow(curve-.09,.17)*.42)*taper;
  h=glow(curve,.020)*taper;
  spark=glow(curve+.20,.09)*taper*.35;
  cool=h;
 }
 // 6: metal slug / steel energy shell with specular highlight & faceted facets
 else if(uMode<6.5){
  vec2 q=vec2(p.x/.92,p.y/.69);
  float d=length(q),surface=smoothstep(.99,.89,d);
  a=surface*.98+glow(d-.93,.10)*.32;
  float gleam=glow(q.y+.34+.16*q.x,.18)*smoothstep(-.9,-.1,q.x);
  float facet=smoothstep(.17,.82,noise(floor(q*vec2(10.,7.))+.31));
  h=gleam*1.20+glow(d-.89,.055)*.75;
  spark=facet*.30*surface;
  cool=gleam+smoothstep(.3,-.55,q.y)*.46;
  a*=1.-smoothstep(.90,1.15,d);
 }
 // 7: fiery turbulent flames + turbulent uplift
 else if(uMode<7.5){
  vec2 q=vec2(p.x,p.y+.20*n+tm*.17);
  float tongue=abs(p.x)+.13*sin(p.y*13.+tm*5.)+.13*(n-.5);
  float border=.36*(.88-p.y)+.06*sin(p.y*20.-tm*6.);
  float body=1.-smoothstep(border-.08,border+.15,tongue);
  float bottom=smoothstep(-1.03,-.45,p.y);
  float tip=1.-smoothstep(.42,.95,p.y+.18*n2);
  a=body*bottom*tip;
  h=body*glow(tongue,.16)+glow(p.y+.52,.46)*body;
  spark=pow(n2,5.)*body;cool=glow(tongue,.18);
 }
 // 8: toxic fluid / inky shadow cloud with flowing membranes
 else if(uMode<8.5){
  float d=radius+.20*(n-.5)+.12*sin(atan(p.y,p.x)*8.+tm*3.);
  a=1.-smoothstep(.42,.71,d);
  h=glow(d,.31)*.4+glow(d-.42,.11)*.62;
  spark=pow(n2,7.)*a;cool=glow(d,.20);
 }
 // 9: ice crystal, fracture + aurora inner refraction
 else {
  float facet=abs(p.x)*.72+abs(p.y)*.9+.13*abs(p.x+p.y);
  a=1.-smoothstep(.63,.89,facet);
  float fissure=abs(sin(p.x*18.+p.y*12.+n*4.));
  h=(1.-smoothstep(.10,.22,fissure))*.85*a+glow(p.x+p.y*.2,.18)*a;
  spark=pow(n2,9.)*a;cool=glow(radius,.31);
 }
 float alpha=clamp(a*(.84+.24*n2)+spark*.18,0.,1.)*uOpacity;
 col=mix(uDark,uMain,clamp(.35+h*.45+n*.17,0.,1.));
 col=mix(col,uHot,clamp(h*.66+cool*.22+spark*.26,0.,1.));
 col+=vec3(spark*.17);
 gl_FragColor=vec4(col*alpha,alpha);
}`;
const palettes={
 normal:['#e8d7bc','#ffffff','#5b5164'],steel:['#7fa7c2','#f9fdff','#1e3349'],
 water:['#0b80d8','#e7ffff','#0b396f'],ice:['#4bbff2','#f7ffff','#255e9d'],
 electric:['#ffd32b','#ffffff','#c56810'],fire:['#fb5417','#fff2ac','#651421'],
 grass:['#46cb53','#f1ffb7','#146642'],psychic:['#b04ff4','#ffeaff','#35106c'],
 ghost:['#5642a1','#d4b9ff','#0c0c30'],dark:['#4f476f','#e0d7fa','#110e24'],
 dragon:['#6c68d9','#e5faff','#29277d'],poison:['#8751ad','#f2cdfb','#28123c'],
 rock:['#c39a64','#ffefd0','#544332'],ground:['#bd8953','#fff2bd','#47311b'],
 bug:['#82b932','#edffd5','#274e19'],fighting:['#da7947','#fff2ca','#772f23'],
 flying:['#6dc7f9','#ffffff','#2e6397'],fairy:['#e58acb','#ffffff','#8c4678']
};
const rgb=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)/255);
const ease=v=>{v=Math.min(1,Math.max(0,v));return v*v*(3-2*v)};
const lerp=(a,b,v)=>a+(b-a)*v;
const types={cannon:'steel',waterjet:'water',wave:'water',bubbles:'water',
 icebeam:'ice',ice:'ice',solar:'grass',lightning:'electric',sludge:'poison',
 shadowball:'ghost',flames:'fire',fireglyph:'fire',leaves:'grass'};
const texCache=new WeakMap();
function particleTexture(renderer,type,tex){
 const special={flames:'flame1',fireglyph:'fireblast2',leaves:'leaf1',
  shadowball:'shadow1',rocks:'rock1',quake:'crack1'}[type];
 if(special){const t=tex(special);if(t)return t;}
 let cache=texCache.get(renderer);if(!cache){cache=new Map();texCache.set(renderer,cache);}
 if(cache.has(type))return cache.get(type);
 const g=new PIXI.Graphics(),p=palettes[type]||palettes.normal;
 const toHex=s=>parseInt(s.slice(1),16);
 if(type==='cannon'||type==='steel'||type==='ice'||type==='icebeam'){
  g.beginFill(toHex(p[1]));g.moveTo(12,0);g.lineTo(19,9);
  g.lineTo(12,24);g.lineTo(5,10);g.closePath();g.endFill();
 }else if(type==='waterjet'||type==='wave'){
  g.beginFill(toHex(p[1]));g.drawEllipse(12,12,9,6);g.endFill();
 }else{
  g.beginFill(toHex(p[1]));g.drawCircle(12,12,7);g.endFill();
 }
 const t=renderer.generateTexture(g,{region:new PIXI.Rectangle(0,0,24,24)});g.destroy();
 cache.set(type,t);return t;
}
function profile(name,type,kind,cat){
 const raw=semanticVFX.style(name,type,kind,cat);
 if(raw==='metalorb')return 'cannon';
 if(raw==='fireglyph')return 'fireglyph';
 return raw;
}
function shaderSprite(root,mode,pal,w,h,additive=true){
 const s=new PIXI.Sprite(PIXI.Texture.WHITE);
 s.anchor.set(.5);s.width=w;s.height=h;
 s.blendMode=additive?PIXI.BLEND_MODES.ADD:PIXI.BLEND_MODES.NORMAL;
 const filter=new PIXI.Filter(undefined,FRAGMENT,{
  uTime:0,uPhase:0,uMode:mode,uOpacity:1,uSeed:1,
  uMain:rgb(pal[0]),uHot:rgb(pal[1]),uDark:rgb(pal[2])
 });
 filter.padding=0;s.filters=[filter];root.addChild(s);
 return {sprite:s,filter};
}
function makeSprites(root,style,tex){
 let ids=[];
 if(style==='fireglyph')ids=Array.from({length:8},(_,i)=>'fireblast'+i);
 else if(style==='flames')ids=Array.from({length:5},(_,i)=>'flame'+i);
 else if(style==='leaves')ids=['leaf0','leaf1','leaf2','leaf3'];
 else if(style==='shadowball')ids=['shadow0','shadow1','shadow2','shadow3','shadow4','shadow5'];
 else if(style==='quake'||style==='rocks')ids=['rock0','rock1','rock2','rock3'];
 const sequence=ids.map(tex).filter(Boolean);
 if(sequence.length<2)return [];
 const count=style==='leaves'?14:style==='quake'||style==='rocks'?8:style==='fireglyph'?5:style==='flames'?8:3;
 const arr=[];
 for(let i=0;i<count;i++){
  const s=new PIXI.AnimatedSprite(sequence);s.anchor.set(.5);
  s.width=style==='fireglyph'?48:style==='rocks'||style==='quake'?28:style==='leaves'?22:30;
  s.height=style==='fireglyph'?56:style==='rocks'||style==='quake'?28:style==='leaves'?27:36;
  s.animationSpeed=.13+i%3*.045;s.alpha=0;
  s.play();root.addChild(s);arr.push(s);
 }
 return arr;
}
function create({app,root,f,name,type,kind,cat,tex,particles}){
 if(!Array.isArray(f.from)||!Array.isArray(f.to))return null;
 const style=profile(name,type,kind,cat),p=palettes[type]||palettes.normal;
 const a=f.from,b=f.to,dx=b[0]-a[0],dy=b[1]-a[1],angle=Math.atan2(dy,dx),distance=Math.hypot(dx,dy);
 const beamStyles=['beam','icebeam','solar','hyper','aurora','waterjet','dragonfire','lightning'].includes(style);
 const wave=style==='wave',contact=['slash','strike'].includes(style),status=style==='aura';
 const isCannon=style==='cannon',liquid=style==='waterjet'||wave||style==='bubbles';
 const lightning=style==='lightning',flame=style==='flames'||style==='fireglyph';
 const iBeam=lightning?4:liquid?1:flame?7:style==='icebeam'?9:1;
 const iProj=isCannon?6:flame?7:style==='ice'||style==='icebeam'?9:
   style==='sludge'||style==='shadowball'?8:wave?3:contact?5:0;
 const base=new PIXI.Container();root.addChild(base);
 const dust=shaderSprite(base,0,p,110,105);
 const charge=shaderSprite(base,isCannon?6:0,p,82,78,true);
 const ribbon=shaderSprite(base,iBeam,p,Math.max(2,distance),isCannon?56:style==='hyper'?88:
    style==='solar'?72:liquid?80:style==='icebeam'?47:56,!wave);
 const form=shaderSprite(base,wave?3:iProj,p,wave?245:style==='hyper'?130:isCannon?110:100,
   wave?150:style==='hyper'?115:100,!isCannon&&!wave);
 const atmosphere=shaderSprite(base,0,p,190,175,true);
 const explosion=shaderSprite(base,2,p,180,176,true);
 const cut=contact?shaderSprite(base,5,p,205,160,true):null;
 const extra=lightning?shaderSprite(base,4,p,Math.max(50,distance*.88),44,true):null;
 const originalSprites=makeSprites(root,style,tex);
 const emitterRoot=new PIXI.Container(),burstRoot=new PIXI.Container();
 root.addChild(emitterRoot,burstRoot);
 const emitterTex=particleTexture(app.renderer,style==='cannon'?'steel':style,tex);
 const particleColors=(type==='steel'?[0xa9d3e9,0xffffff,0x63839e]:
   type==='water'?[0x31b1ed,0xe9ffff,0x286aa6]:
   (type==='fire'?[0xff8f39,0xffe5ab,0xc43b16]:
   (type==='grass'?[0x9ded69,0xf4ffd6,0x3a8d55]:
    [0xb3a4f5,0xffffff,0x7563af])));
 const trail=particles(emitterRoot,emitterTex,particleColors,false);
 const burst=particles(burstRoot,emitterTex,particleColors,true);
 const shaderNodes=[dust,charge,ribbon,form,atmosphere,explosion,cut,extra].filter(Boolean);
 let last=0;
 function draw(now,t,dt){
  const chargeQ=ease(Math.min(1,t/.29)),headQ=ease((t-.24)/.45),hit=ease((t-.68)/.31);
  const x=lerp(a[0],b[0],headQ),y=lerp(a[1],b[1],headQ),ct=Math.cos(angle),st=Math.sin(angle);
  const pulse=1+.055*Math.sin(now*.025);
  for(let i=0;i<shaderNodes.length;i++){const u=shaderNodes[i].filter.uniforms;u.uTime=now*.001;u.uPhase=hit;u.uSeed=1.27+i*.41;}
  dust.sprite.position.set(a[0],a[1]);dust.sprite.alpha=t<.34?(1-chargeQ*.45)*.55:0;
  dust.sprite.scale.set(.7+chargeQ*.6);
  charge.sprite.position.set(a[0]+ct*28,a[1]+st*28);
  charge.sprite.alpha=t<.36?(.42+.56*chargeQ):0;
  charge.sprite.scale.set((.55+chargeQ*.75)*pulse);
  charge.sprite.rotation=now*.002;
  ribbon.sprite.visible=beamStyles&&!isCannon;
  ribbon.sprite.alpha=t>.21&&t<.88?Math.min(1,(t-.21)*9)*Math.min(1,(.89-t)*11):0;
  ribbon.sprite.anchor.set(0,.5);ribbon.sprite.position.set(a[0]+ct*21,a[1]+st*21);
  ribbon.sprite.rotation=angle;ribbon.sprite.width=Math.max(1,(distance-21)*headQ);
  ribbon.sprite.height=style==='hyper'?88:style==='solar'?74:liquid?75:lightning?52:style==='icebeam'?46:54;
  if(extra){
   extra.sprite.anchor.set(0,.5);extra.sprite.position.set(a[0]+ct*29,a[1]+st*29);
   extra.sprite.rotation=angle;extra.sprite.width=Math.max(1,(distance-29)*headQ);
   extra.sprite.alpha=ribbon.sprite.alpha*.83;
  }
  form.sprite.position.set(status?a[0]:wave?x:isCannon?x:contact?b[0]:x,
    status?a[1]:wave?y:isCannon?y:contact?b[1]:y);
  form.sprite.alpha=t>.22&&t<.92?Math.min(1,(t-.22)*8)*Math.min(1,(.94-t)*10):0;
  form.sprite.rotation=wave?0:isCannon?angle:contact?angle:0;
  form.sprite.scale.set((isCannon?1.1:1)*pulse);
  if(wave){form.sprite.width=250+headQ*65;form.sprite.height=180+35*Math.sin(t*Math.PI);}
  atmosphere.sprite.position.set(b[0],b[1]);
  atmosphere.sprite.alpha=hit>0?Math.min(.43,hit*.8)*(1-hit*.3):0;
  atmosphere.sprite.scale.set(.85+hit*.62);
  explosion.sprite.position.set(b[0],b[1]);
  explosion.sprite.alpha=hit>0?Math.min(1,hit*5)*(1-hit*.72):0;
  explosion.sprite.scale.set(.54+hit*1.17);
  if(cut){
   cut.sprite.position.set(b[0],b[1]);cut.sprite.rotation=angle;
   cut.sprite.alpha=t>.25&&t<.85?Math.sin((t-.25)/.60*Math.PI):0;
   cut.sprite.scale.set(.55+headQ*.85,.65+headQ*.35);
  }
  for(let i=0;i<originalSprites.length;i++){
   const sp=originalSprites[i],offset=(i+.5)/originalSprites.length;
   if(flame||style==='shadowball'){
    const v=Math.max(0,headQ-offset*.43),spread=Math.sin(now*.009+i*3)*15;
    sp.position.set(lerp(a[0],b[0],v)-st*spread,lerp(a[1],b[1],v)+ct*spread);
    sp.alpha=t>.20&&t<.92?.78*(1-offset*.3):0;
    sp.rotation=angle-Math.PI*.5+now*.001*(i%2?1:-1);
    if(style==='fireglyph'&&hit>.20){
      sp.position.set(b[0]+Math.cos(i*2.4)*hit*22,b[1]+Math.sin(i*2.4)*hit*22);
      sp.width=58+hit*33;sp.height=64+hit*39;
    }
   }else if(style==='leaves'){
    const v=Math.max(0,headQ-offset*.34),spread=Math.sin(now*.011+i*2.3)*32;
    sp.position.set(lerp(a[0],b[0],v)-st*spread,lerp(a[1],b[1],v)+ct*spread);
    sp.alpha=t>.20&&t<.92?.95:0;sp.rotation=angle+now*.008+i*2.1;
   }else{
    const r=24+hit*(38+i%3*10),ph=i*2.399+now*.003;
    sp.position.set(b[0]+Math.cos(ph)*r,b[1]+Math.sin(ph)*r*.67);
    sp.alpha=hit*.87;sp.rotation=ph;
   }
  }
  if(trail){
   let ex=beamStyles?lerp(a[0],b[0],headQ):contact?b[0]:status?a[0]:x,
       ey=beamStyles?lerp(a[1],b[1],headQ):contact?b[1]:status?a[1]:y;
   trail.updateOwnerPos(ex,ey);
   trail.emit=t>.20&&t<.84;trail.update(dt);
  }
  if(burst){
   burst.updateOwnerPos(b[0],b[1]);burst.emit=hit>.08&&hit<.65;burst.update(dt);
  }
  last=now;
 }
 return {draw,trail,burst,style,shaderCount:shaderNodes.length,originalFrames:originalSprites.length};
}
return {create,profile,diagnostics:()=>({version:'35.90',rendering:'GPU fragment shaders',
 families:31,phases:['charge','execution','collision','afterglow']})};
})();
