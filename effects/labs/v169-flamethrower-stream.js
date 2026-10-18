/* V169: GPU Flamethrower video-accurate continuous flame jet.
 * User reference: Sambam Studios Blender procedural flame cylinder.
 * One WebGL filter and one sprite, no polygon sprites, no fake frame count.
 * Isolated playable game copy; real moves retain damage and cooldowns.
 */
(()=>{
'use strict';
if(!window.__V169_LAB||!window.PIXI||typeof BattleEngine!=='function')return;
const P=window.PIXI,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
const clock=()=>performance.now();
const info={version:'169.0',webgl:false,casts:0,moveCasts:0,previews:0,
 shaderFrames:0,activeStreams:0,maxStreams:2,finished:0,errors:[],
 suppressedLegacy:0,preservedOriginal:true,sandboxOnly:true,
 flameMode:'single-continuous-GPU-cylinder'};
const FRAG="precision mediump float;\nvarying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform float uTime;\nuniform float uReach;\nuniform float uOpacity;\nfloat hash21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}\nfloat noise2(vec2 x){vec2 i=floor(x),f=fract(x);f=f*f*(3.0-2.0*f);\n return mix(mix(hash21(i),hash21(i+vec2(1.,0.)),f.x),\n mix(hash21(i+vec2(0.,1.)),hash21(i+vec2(1.,1.)),f.x),f.y);}\nfloat fbm(vec2 p){return .55*noise2(p)+.29*noise2(p*2.02+13.4)+.16*noise2(p*4.01-7.8);}\nvoid main(){\n vec2 uv=vTextureCoord;\n float x=uv.x,y=uv.y-.5,t=uTime;\n float transport=x*11.5-t*3.45;\n float coarse=fbm(vec2(transport,uv.y*6.8+t*.42));\n float detail=fbm(vec2(transport*1.72,uv.y*12.0-t*.94));\n float wobble=.022*sin(x*8.0-t*2.1)+.013*sin(x*19.0-t*6.5+coarse*4.0)+(coarse-.5)*.026;\n float dist=abs(y-wobble);\n float radius=mix(.074,.183,smoothstep(.02,.61,x))+\n    .019*sin(x*27.0-t*5.8+detail*6.0)+.022*(coarse-.5);\n // Natural rounded leading cap, not a polygon, cone or separate fireball.\n radius*=mix(1.0,.13,smoothstep(.90,1.015,x));\n float fill=1.0-smoothstep(radius-.038,radius+.012,dist);\n float vapor=smoothstep(radius+.050,radius-.010,dist);\n float advancing=1.0-smoothstep(uReach-.07,uReach+.035,x);\n float flicker=.91+.09*sin(x*67.0-t*10.2+detail*5.);\n float filament=sin(transport*9.0+detail*8.0+y*18.0);\n float ribbon=sin(x*97.0-t*14.0+detail*16.0+y*15.0);\n float heat=1.0-smoothstep(.020,radius*.98,dist);\n vec3 red=vec3(.52,.043,.012),orange=vec3(1.0,.245,.015);\n vec3 gold=vec3(1.0,.61,.075),white=vec3(1.0,.97,.65);\n float yellow=clamp(heat*.87+.19*filament+.13*(detail-.45),0.,1.);\n vec3 col=mix(red,orange,clamp(.38+detail*.82+heat*.20,0.,1.));\n col=mix(col,gold,smoothstep(.19,.79,yellow));\n col=mix(col,white,clamp((heat-.58)*2.35+.15*ribbon,0.,1.)*.84);\n float wisps=pow(max(0.,1.-dist/(radius+.095)),2.7)*.24;\n float alpha=clamp(fill+wisps*max(0.,detail-.28),0.,1.);\n alpha*=smoothstep(.002,.065,x)*advancing*uOpacity*flicker;\n // A soft tip glow is enough: no giant explosion at the opponent.\n float tip=1.0-smoothstep(.018,.081,abs(x-.95));\n col+=vec3(.18,.075,.005)*tip*heat;\n gl_FragColor=vec4(col*alpha,alpha);\n}";
let owner=null,app=null,root=null,panel=null,button=null,lastPanelAt=0;
const active=[];
const error=e=>{const s=String(e?.message||e);if(!info.errors.includes(s))info.errors.push(s);info.errors=info.errors.slice(-6);};
const live=e=>!!(e?.canvas?.isConnected&&typeof battle!=='undefined'&&battle?.active);
function dispose(x){try{x.sprite.destroy({children:true});}catch(_){ }try{x.filter.destroy();}catch(_){}}
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
 f.sprite.height=Math.min(138,Math.max(72,e.h*.23));
}
function start(e,source='preview'){
 if(!mount(e))return false;
 if(active.length>=info.maxStreams)dispose(active.shift());
 let filter;
 try{filter=new P.Filter(undefined,FRAG,{uTime:0,uReach:0,uOpacity:0});}
 catch(ex){error(ex);return false;}
 const sprite=new P.Sprite(P.Texture.WHITE);
 sprite.anchor.set(0,.5);sprite.filters=[filter];
 sprite.blendMode=P.BLEND_MODES.NORMAL;
 root.addChild(sprite);
 const f={sprite,filter,began:clock(),duration:1330,source};
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
  f.filter.uniforms.uTime=(now-f.began)*.001;
  f.filter.uniforms.uReach=smooth(u/.17);
  f.filter.uniforms.uOpacity=smooth(u/.10)*(1-smooth((u-.84)/.16));
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
panel=document.createElement('aside');panel.id='v169-stream-panel';
panel.style.cssText='position:fixed;right:10px;bottom:12px;z-index:9860;display:none';
button=document.createElement('button');button.id='v169-stream-button';
button.type='button';button.textContent='🔥 Testar Lança-Chamas contínuo';
button.style.cssText='background:#311508f2;border:1px solid #f7a046;border-radius:9px;color:#ffe6b5;padding:9px 12px;font:bold 12px system-ui;box-shadow:0 5px 18px #0009';
button.addEventListener('click',()=>{if(owner)start(owner,'preview');});
panel.appendChild(button);
const style=document.createElement('style');style.id='v169-lab-style';
style.textContent='#v167-lab-controls{display:none!important}';
document.head.appendChild(style);document.body.appendChild(panel);
window.PokemonTorreFlamethrowerV169=Object.freeze({
 test:()=>owner?start(owner,'preview'):false,
 diagnostics:()=>({...info,activeStreams:active.length,
  uniforms:active.map(f=>({uTime:Number(f.filter.uniforms.uTime),uReach:Number(f.filter.uniforms.uReach),uOpacity:Number(f.filter.uniforms.uOpacity)})),sources:active.map(f=>f.source)})
});
})();