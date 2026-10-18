/* V171: GPU Flamethrower video-accurate continuous flame jet.
 * User reference: Sambam Studios Blender procedural flame cylinder.
 * One WebGL filter and one sprite, no polygon sprites, no fake frame count.
 * Isolated playable game copy; real moves retain damage and cooldowns.
 */
(()=>{
'use strict';
if(!window.__V171_LAB||!window.PIXI||typeof BattleEngine!=='function')return;
const P=window.PIXI,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
const clock=()=>performance.now();
const info={version:'171.1-fluid-cylinder',webgl:false,casts:0,moveCasts:0,previews:0,
 shaderFrames:0,activeStreams:0,maxStreams:2,finished:0,errors:[],
 suppressedLegacy:0,preservedOriginal:true,sandboxOnly:true,
 flameMode:'true-UV-mesh-continuous-fire'};
const VERT="precision mediump float;\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nuniform mat3 translationMatrix;\nuniform mat3 projectionMatrix;\nvarying vec2 vFireUv;\nvoid main(){\n vFireUv=aTextureCoord;\n vec3 world=translationMatrix*vec3(aVertexPosition,1.0);\n gl_Position=vec4((projectionMatrix*world).xy,0.0,1.0);\n}";
const FRAG="precision mediump float;\nvarying vec2 vFireUv;\nuniform sampler2D uSampler;\nuniform float uTime;\nuniform float uReach;\nuniform float uOpacity;\nfloat hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\nfloat noise(vec2 p){\n vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);\n float a=hash(i),b=hash(i+vec2(1.0,0.0));\n float c=hash(i+vec2(0.0,1.0)),d=hash(i+vec2(1.0,1.0));\n return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);\n}\nfloat fbm(vec2 p){\n return .53*noise(p)+.28*noise(p*2.02+6.7)+.19*noise(p*4.08-13.2);\n}\nvoid main(){\n vec2 uv=vFireUv;\n float x=uv.x,t=uTime;\n float adv=x*12.3-t*3.6;\n float turbulence=fbm(vec2(adv,uv.y*6.2+t*.15));\n float ridge=fbm(vec2(adv*1.8,uv.y*10.0-t*.45));\n float roll=sin(x*20.0-t*7.3+turbulence*4.0);\n float center=.5+.009*sin(x*15.0-t*2.2)+.006*(turbulence-.5);\n float delta=abs(uv.y-center);\n // Sustained cylinder, not a widening orange cone. Only its nozzle opens.\n float bodyRadius=.202+.018*sin(adv*3.0+ridge*5.0)+.012*(turbulence-.5);\n bodyRadius*=.82+.18*smoothstep(.015,.115,x);\n bodyRadius+=.010*roll;\n // Ellipsoidal hemispherical tip; NO hard vertical pixel cut.\n float tipX=clamp((x-.875)/.123,0.0,1.0);\n float cap=sqrt(max(0.0,1.0-tipX*tipX));\n float radius=max(.003,bodyRadius*cap);\n float silhouette=1.0-smoothstep(radius-.035,radius+.006,delta);\n float shade=clamp(delta/max(radius,.001),0.0,1.0);\n float surface=sqrt(max(0.0,1.0-shade*shade));\n float movingBands=sin(adv*8.5+ridge*6.0)+.55*sin(adv*16.4+turbulence*6.0);\n float detail=fbm(vec2(adv*1.8,uv.y*3.8+t*.5));\n float bright=clamp(.65+movingBands*.25+(detail-.5)*.40,0.0,1.0);\n float core=pow(surface,1.25);\n vec3 edge=vec3(.39,.018,.007);\n vec3 burnt=vec3(.77,.065,.008);\n vec3 orange=vec3(1.0,.29,.012);\n vec3 gold=vec3(1.0,.64,.075);\n vec3 pale=vec3(1.0,.89,.46);\n vec3 color=mix(edge,burnt,1.0-smoothstep(.22,.93,shade));\n color=mix(color,orange,smoothstep(.07,.50,bright)*(.46+.43*core));\n color=mix(color,gold,smoothstep(.35,.78,bright)*(.16+.76*core));\n color=mix(color,pale,smoothstep(.78,.98,bright)*pow(core,2.0)*.49);\n color*=.93+.12*surface;\n float tail=smoothstep(.0,.035,x);\n float front=1.0-smoothstep(uReach-.047,uReach+.009,x);\n float fadeEnd=1.0-smoothstep(.958,.999,x);\n float alpha=silhouette*tail*front*fadeEnd*uOpacity;\n alpha*=.96+.04*sin(t*17.0+adv*2.0);\n alpha=clamp(alpha,0.0,1.0);\n gl_FragColor=vec4(color*alpha,alpha);\n}";
let owner=null,app=null,root=null,panel=null,button=null,lastPanelAt=0;
const active=[];
const error=e=>{const s=String(e?.message||e);if(!info.errors.includes(s))info.errors.push(s);info.errors=info.errors.slice(-6);};
const live=e=>!!(e?.canvas?.isConnected&&typeof battle!=='undefined'&&battle?.active);
function dispose(x){try{x.sprite.destroy({children:true});}catch(_){}try{x.shader?.destroy();}catch(_){}}
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
 const f={sprite,shader,began:clock(),duration:1210,source};
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
 if(clock()-lastPanelAt>400){
  lastPanelAt=clock();
  if(panel)panel.style.display=live(this)&&info.webgl?'block':'none';
 }
 return out;
};
const oldDestroy=BattleEngine.prototype.destroy;
BattleEngine.prototype.destroy=function(){
 if(this===owner)clear();
 return oldDestroy.apply(this,arguments);
};
panel=document.createElement('aside');panel.id='v171-stream-panel';
panel.style.cssText='position:fixed;right:10px;bottom:12px;z-index:9860;display:none';
button=document.createElement('button');button.id='v171-stream-button';
button.type='button';button.textContent='🔥 Testar fogo contínuo V171';
button.style.cssText='background:#311508f2;border:1px solid #f7a046;border-radius:9px;color:#ffe6b5;padding:9px 12px;font:bold 12px system-ui;box-shadow:0 5px 18px #0009';
button.addEventListener('click',()=>{if(owner)start(owner,'preview');});
panel.appendChild(button);
const style=document.createElement('style');style.id='v171-lab-style';
style.textContent='#v167-lab-controls{display:none!important}';
document.head.appendChild(style);document.body.appendChild(panel);
window.PokemonTorreFlamethrowerV171=Object.freeze({
 test:()=>owner?start(owner,'preview'):false,
 diagnostics:()=>({...info,activeStreams:active.length,
  uniforms:active.map(f=>({uTime:Number(f.shader.uniforms.uTime),uReach:Number(f.shader.uniforms.uReach),uOpacity:Number(f.shader.uniforms.uOpacity)})),sources:active.map(f=>f.source)})
});
})();