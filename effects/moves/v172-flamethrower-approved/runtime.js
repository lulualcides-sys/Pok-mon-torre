/* Pokémon Torre: V172 APPROVED FLAMETHROWER visual in the main playable game.
 * Exact accepted GPU organic jet + independent small hit puff from V172 lab.
 * No debug UI, no sandbox flag; old move visual available via ?flame172=0.
 * Gameplay damage, energy, cooldown, V128 protected water and all other moves preserved.
 */
(()=>{
'use strict';
if(!window.PIXI||typeof BattleEngine!=='function'||
 new URLSearchParams(location.search).get('flame172')==='0'||
 new URLSearchParams(location.search).get('safe')==='1'||
 window.PokemonTorreFlamethrowerApprovedV172?.installed)return;
const P=window.PIXI,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
const clock=()=>performance.now();
const info={version:'172.0-organic-flame',webgl:false,casts:0,moveCasts:0,previews:0,
 shaderFrames:0,activeStreams:0,maxStreams:2,finished:0,impacts:0,impactFrames:0,errors:[],
 suppressedLegacy:0,preservedOriginal:true,approved:true,sandboxOnly:false,
 flameMode:'organic-uv-mesh-flame-with-contact'};
const VERT="precision mediump float;\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nuniform mat3 translationMatrix;\nuniform mat3 projectionMatrix;\nvarying vec2 vFireUv;\nvoid main(){\n vFireUv=aTextureCoord;\n vec3 world=translationMatrix*vec3(aVertexPosition,1.0);\n gl_Position=vec4((projectionMatrix*world).xy,0.0,1.0);\n}";
const FRAG="precision mediump float;\nvarying vec2 vFireUv;\nuniform sampler2D uSampler;\nuniform float uTime;\nuniform float uReach;\nuniform float uOpacity;\n\nfloat rand(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }\nfloat noise(vec2 p){\n vec2 i=floor(p), f=fract(p);\n f=f*f*(3.0-2.0*f);\n return mix(mix(rand(i),rand(i+vec2(1.,0.)),f.x),\n            mix(rand(i+vec2(0.,1.)),rand(i+vec2(1.,1.)),f.x),f.y);\n}\nfloat fbm(vec2 p){\n return .51*noise(p)+.31*noise(p*2.04+5.5)+.18*noise(p*4.14-11.1);\n}\nvoid main(){\n vec2 uv=vFireUv;\n float x=uv.x,t=uTime;\n // Texture advects FROM emitter to target; width stays stable.\n float travel=x*12.6-t*3.9;\n float n1=fbm(vec2(travel*.65,uv.y*4.4+t*.28));\n float n2=fbm(vec2(travel*1.7,uv.y*9.3-t*.55));\n float n3=noise(vec2(x*58.-t*10., uv.y*17.+t*.8));\n float slosh=sin(travel*3.6+n2*5.0);\n float center=.5+.009*sin(x*12.-t*1.5)+.006*(n1-.5);\n float dist=abs(uv.y-center);\n float r=.205 + .016*sin(travel*4.1+n1*5.3)\n        + .014*sin(travel*7.5+n2*5.6)\n        + .027*(n2-.5)+.010*(n3-.5);\n r*=.86+.14*smoothstep(.018,.16,x);\n // Rounded tip, no orange wall, no top/bottom rectangle.\n float end=clamp((x-.876)/.123,0.,1.);\n float tip=sqrt(max(0.,1.-end*end));\n r=max(.002,r*tip);\n float aa=.010;\n float silhouette=1.0-smoothstep(r-.035,r+aa,dist);\n float side=clamp(dist/max(r,.002),0.,1.);\n float sphere=sqrt(max(0.,1.-side*side));\n float band1=sin(travel*7.7+n2*6.1+slosh*.9);\n float band2=sin(travel*15.3+n1*4.7+n3*2.0);\n float band3=sin(travel*3.5+uv.y*22.-t*2.2);\n float intensity=clamp(.62 + .19*band1 + .14*band2 + .08*band3,0.,1.);\n float hot=clamp((sphere-.12)*1.08,0.,1.);\n vec3 soot=vec3(.29,.022,.012);\n vec3 red=vec3(.72,.045,.013);\n vec3 amber=vec3(1.,.285,.025);\n vec3 gold=vec3(1.,.68,.09);\n vec3 yellow=vec3(1.,.91,.43);\n vec3 col=mix(soot,red,(1.-smoothstep(.48,.96,side)));\n col=mix(col,amber,clamp(.29+.62*hot+.13*n2,0.,1.));\n col=mix(col,gold,smoothstep(.39,.86,intensity)*pow(hot,.74)*.91);\n col=mix(col,yellow,smoothstep(.79,.98,intensity)*pow(hot,2.0)*.43);\n float nozzle=smoothstep(.0,.029,x);\n float visible=1.-smoothstep(uReach-.045,uReach+.012,x);\n float right=1.-smoothstep(.970,.999,x);\n float alpha=silhouette*nozzle*visible*right*uOpacity;\n // Delicate smoky fringe, always transparent, never spikes or polygons.\n float fringe=max(0.,1.-smoothstep(r+.005,r+.057,dist));\n float edgeNoise=clamp((n2-.4)*.13,0.,.08);\n alpha=clamp(alpha+fringe*edgeNoise*visible*uOpacity*.48,0.,1.);\n gl_FragColor=vec4(col*alpha,alpha);\n}";
const IMPACT_FRAG="precision mediump float;\nvarying vec2 vFireUv;\nuniform float uTime;\nuniform float uOpacity;\nfloat rand(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\nvoid main(){\n vec2 p=vFireUv*2.-1.;\n float a=atan(p.y,p.x),r=length(vec2(p.x,p.y*1.08));\n float flick=sin(a*7.0+uTime*14.)*.053+sin(a*13.0-uTime*9.0)*.024;\n float edge=.56+flick;\n float rim=1.-smoothstep(.075,.24,abs(r-edge));\n float ember=max(0.,sin(a*13.+uTime*14.))*max(0.,.6-r);\n float flare=1.-smoothstep(.0,.35,r);\n vec3 orange=vec3(1.,.25,.016),yellow=vec3(1.,.75,.13),bright=vec3(1.,.93,.57);\n vec3 col=mix(orange,yellow,clamp(rim*.62+flare*.7,0.,1.));\n col=mix(col,bright,flare*.24);\n float alpha=clamp((rim*.72+ember*.17+flare*.28)*uOpacity,0.,1.);\n alpha*=1.-smoothstep(.78,1.,r);\n gl_FragColor=vec4(col*alpha,alpha);\n}";
let owner=null,app=null,root=null;
const active=[];
const error=e=>{const s=String(e?.message||e);if(!info.errors.includes(s))info.errors.push(s);info.errors=info.errors.slice(-6);};
const live=e=>!!(e?.canvas?.isConnected&&typeof battle!=='undefined'&&battle?.active);
function dispose(x){
 try{x.impact?.sprite?.destroy({children:true});}catch(_){}
 try{x.impact?.shader?.destroy();}catch(_){}
 try{x.sprite?.destroy({children:true});}catch(_){}
 try{x.shader?.destroy();}catch(_){}
}
function clear(){
 active.forEach(dispose);active.length=0;
 if(root&&!root.destroyed)root.destroy({children:true});
 owner=null;app=null;root=null;info.activeStreams=0;
}
function mount(e){
 if(!live(e))return false;
 const pixi=window.PokemonTorrePixelFlyingBridge?.labStage?.(e)?.app;
 if(!pixi?.renderer?.gl)return false;
 if(e!==owner||pixi!==app||!root?.parent){
  clear();owner=e;app=pixi;root=new P.Container();app.stage.addChild(root);
 }
 info.webgl=true;return true;
}
function position(f,e){
 const a=e.player,b=e.enemy,sign=b.x>=a.x?1:-1;
 const fx=a.x+sign*Math.min(18,e.h*.036),fy=a.y-e.h*.145;
 const tx=b.x-sign*Math.min(15,e.h*.033),ty=b.y-e.h*.135;
 const dx=tx-fx,dy=ty-fy;
 f.sprite.position.set(fx,fy);
 f.sprite.rotation=Math.atan2(dy,dx);
 f.sprite.width=Math.max(50,Math.hypot(dx,dy));
 f.sprite.height=Math.min(66,Math.max(46,e.h*.115));
}
function start(e,source='preview'){
 if(!mount(e))return false;
 if(active.length>=info.maxStreams)dispose(active.shift());
 let shader,sprite;
 try{
  // True geometry UVs eliminate Pixi filter-area coordinate distortion.
  // The triangle pair is INVISIBLE; the transparent shader is the only flame.
  const geo=new P.Geometry()
   .addAttribute('aVertexPosition',new Float32Array([0,-.5,1,-.5,1,.5,0,.5]),2)
   .addAttribute('aTextureCoord',new Float32Array([0,0,1,0,1,1,0,1]),2)
   .addIndex([0,1,2,0,2,3]);
  shader=P.Shader.from(VERT,FRAG,{uTime:0,uReach:0,uOpacity:0});
  sprite=new P.Mesh(geo,shader);
  sprite.blendMode=P.BLEND_MODES.NORMAL;
  root.addChild(sprite);
 }catch(ex){error(ex);return false;}
 const f={sprite,shader,began:clock(),duration:1210,source,impact:null,hit:false};
 active.push(f);info.casts++;
 if(source==='move')info.moveCasts++;else info.previews++;
 position(f,e);info.activeStreams=active.length;
 return true;
}
function tick(e){
 if(!active.length||!mount(e))return;
 const now=clock();
 for(let i=active.length-1;i>=0;i--){
  const f=active[i],u=clamp((now-f.began)/f.duration,0,1);
  if(u>=1){dispose(f);active.splice(i,1);info.finished++;continue;}
  // 17% onset, 67% uninterrupted burn, 16% taper.
  f.shader.uniforms.uTime=(now-f.began)*.001;
  f.shader.uniforms.uReach=smooth(u/.17);
  f.shader.uniforms.uOpacity=smooth(u/.10)*(1-smooth((u-.84)/.16));
  position(f,e);info.shaderFrames++;
  // At the target: small independent GPU fire curl, not a massive explosion.
  if(u>.27&&u<.78&&!f.hit){
   f.hit=true;
   try{
    const geometry=new P.Geometry()
     .addAttribute('aVertexPosition',new Float32Array([0,0,1,0,1,1,0,1]),2)
     .addAttribute('aTextureCoord',new Float32Array([0,0,1,0,1,1,0,1]),2)
     .addIndex([0,1,2,0,2,3]);
    const shader=P.Shader.from(VERT,IMPACT_FRAG,{uTime:0,uOpacity:0});
    const sprite=new P.Mesh(geometry,shader);
    sprite.blendMode=P.BLEND_MODES.NORMAL;
    root.addChild(sprite);
    f.impact={sprite,shader,started:now};
    info.impacts++;
   }catch(err){error(err);}
  }
  if(f.impact){
   const h=f.impact,tau=clamp((now-h.started)/390,0,1);
   if(tau>=1){
    try{h.sprite.destroy({children:true});}catch(_){}
    try{h.shader.destroy();}catch(_){}
    f.impact=null;
   }else{
    const d=Math.min(47,Math.max(27,e.h*.068));
    h.sprite.position.set(e.enemy.x-d*.5,e.enemy.y-e.h*.13-d*.5);
    h.sprite.width=d;h.sprite.height=d;
    h.shader.uniforms.uTime=(now-h.started)*.001;
    h.shader.uniforms.uOpacity=(1-smooth(tau))*smooth(tau/.16);
    info.impactFrames++;
   }
  }
 }
 info.activeStreams=active.length;
}
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const isFlame=s=>/^(lanca[- ]?chamas|flamethrower)$/.test(norm(s).trim());
// Consume ONLY the deprecated 2D effect paint, never the move event itself.
const oldPaint=window.PokemonTorreV360Paint;
if(typeof oldPaint==='function')window.PokemonTorreV360Paint=function(g,f,t,e){
 if(live(e)&&isFlame(f?.move?.name||f?.name)){info.suppressedLegacy++;return true;}
 return oldPaint.apply(this,arguments);
};
const oldUse=BattleEngine.prototype.useMove;
BattleEngine.prototype.useMove=function(slot){
 if(!live(this))return oldUse.apply(this,arguments);
 const mon=typeof current==='function'?current():null;
 const move=mon&&typeof skillSet==='function'?skillSet(mon)?.[slot]:null;
 if(!isFlame(move?.name))return oldUse.apply(this,arguments);
 const oldEnergy=Number(battle.energy);
 const oldCooldown=typeof cooldowns==='object'?cooldowns[slot]:null;
 const result=oldUse.apply(this,arguments);
 const newCooldown=typeof cooldowns==='object'?cooldowns[slot]:null;
 if(result!==false&&(Number(battle.energy)<oldEnergy||
  (newCooldown!=null&&newCooldown!==oldCooldown)))start(this,'move');
 return result;
};
const oldDraw=BattleEngine.prototype.draw;
BattleEngine.prototype.draw=function(t){
 const out=oldDraw.apply(this,arguments);
 try{if(live(this)){if(!owner)mount(this);tick(this);}}catch(ex){error(ex);}

 return out;
};
const oldDestroy=BattleEngine.prototype.destroy;
BattleEngine.prototype.destroy=function(){
 if(this===owner)clear();
 return oldDestroy.apply(this,arguments);
};
// Production: do not add buttons, galleries, CSS panels, or visual debug overlays.
window.PokemonTorreFlamethrowerApprovedV172=Object.freeze({
 installed:true,version:'172.0',approved:true,
 diagnostics:()=>({...info,activeStreams:active.length,
  uniforms:active.map(f=>({uTime:Number(f.shader.uniforms.uTime),
   uReach:Number(f.shader.uniforms.uReach),
   uOpacity:Number(f.shader.uniforms.uOpacity)})),sources:active.map(f=>f.source)})
});
})();
