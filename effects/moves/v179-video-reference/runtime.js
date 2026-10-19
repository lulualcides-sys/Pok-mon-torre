/* Pokémon Torre V179: FIRE MOVES REBUILT AGAINST THREE USER VIDEOS as opt-in animated GPU previews.
 * Flamethrower: continuous overlapping flame tongues, hot core, ember edges.
 * Fire Blast: concentrated fire projectile -> 5-tip fiery star on confirmed hit.
 * Uses shared PixiJS WebGL stage, native V359/V65 HP/cooldown, NO 2D canvas.
 * Neither V172 approved source nor old Fire Blast sprite renderer is overwritten.
 */
(()=>{
'use strict';
const params=new URLSearchParams(location.search);
if(params.get('fire179')!=='preview'||params.get('safe')==='1'||
 !window.PIXI||typeof BattleEngine!=='function'||window.PokemonTorreFirePairV179?.installed)return;
const P=window.PIXI,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const ease=x=>{x=clamp(x,0,1);return x*x*(3-2*x);},clock=()=>performance.now();
const VERT="precision mediump float;\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nuniform mat3 translationMatrix;\nuniform mat3 projectionMatrix;\nvarying vec2 vUv;\nvoid main(){\n vUv=aTextureCoord;\n vec3 p=translationMatrix*vec3(aVertexPosition,1.0);\n gl_Position=vec4((projectionMatrix*p).xy,0.0,1.0);\n}";
const FLAME="precision mediump float;\nvarying vec2 vUv;\nuniform float uTime, uReach, uAlpha;\nfloat hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\nfloat noise(vec2 p){\n vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);\n return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),\n mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);\n}\nvoid main(){\n float x=vUv.x,t=uTime;\n float adv=x*17.0-t*9.7;\n float n=noise(vec2(adv*.65,vUv.y*7.0+t*.6));\n float hi=noise(vec2(adv*2.25,vUv.y*17.0-t*1.7));\n float lobes=.5+.5*sin(adv*2.30+hi*5.0);\n float backward=.5+.5*sin(adv*4.2-1.1*n);\n float center=.5+.016*sin(x*17.0-t*4.0)+.013*(n-.5);\n float envelope=1.0-smoothstep(.89,1.04,x);\n float width=(.127+.047*pow(lobes,1.8)+.014*backward+.021*(hi-.5))*envelope;\n width*=.78+.22*smoothstep(.0,.15,x);\n float dist=abs(vUv.y-center);\n float tongues=.018*sin(x*95.0-t*34.0+n*8.0)+.010*sin(x*157.0-t*44.0);\n float edge=width+tongues;\n float body=1.0-smoothstep(edge-.013,edge+.014,dist);\n float rim=1.0-smoothstep(edge+.004,edge+.04,dist);\n float heat=clamp(1.0-dist/max(.015,width),0.0,1.0);\n vec3 col=mix(vec3(.19,.019,.009),vec3(.86,.09,.012),smoothstep(.02,.24,heat));\n col=mix(col,vec3(1.0,.34,.019),smoothstep(.16,.52,heat));\n col=mix(col,vec3(1.0,.67,.085),smoothstep(.44,.80,heat));\n col=mix(col,vec3(1.0,.94,.51),smoothstep(.75,.98,heat)*(.82+.16*hi));\n float mask=smoothstep(.0,.024,x)*(1.0-smoothstep(.971,1.0,x));\n mask*=1.0-smoothstep(uReach-.040,uReach+.008,x);\n float sparks=(rim-body)*.075*step(.81,hi)*smoothstep(.15,.65,x);\n float alpha=clamp(body+sparks,0.0,1.0)*mask*uAlpha;\n gl_FragColor=vec4(col*alpha,alpha);\n}";
const BLAST="precision mediump float;\nvarying vec2 vUv;\nuniform float uTime, uReach, uAlpha;\nfloat hash(vec2 p){return fract(sin(dot(p,vec2(91.1,181.7)))*41758.53);}\nvoid main(){\n float x=vUv.x,t=uTime;\n float y=abs(vUv.y-.5-.028*sin(t*13.0+x*17.0));\n float tip=1.0-smoothstep(.69,1.01,x);\n float tail=smoothstep(.0,.16,x);\n float tongues=.042*sin(x*35.0-t*19.0)+.021*sin(x*75.0+t*26.0);\n float thick=(.18+(.040*tongues/.042))*(.60+.40*tail)*tip;\n float core=clamp(1.0-y/max(thick,.016),0.0,1.0);\n float body=1.0-smoothstep(thick-.017,thick+.017,y);\n vec3 col=mix(vec3(.40,.027,.011),vec3(.98,.21,.016),smoothstep(.03,.37,core));\n col=mix(col,vec3(1.,.66,.09),smoothstep(.28,.68,core));\n col=mix(col,vec3(1.,.98,.67),smoothstep(.74,.99,core));\n float droplets=step(.87,hash(floor(vUv*vec2(37.,23.)+t*8.)))*.07;\n float alpha=clamp(body+droplets*body,0.,1.)*uAlpha;\n alpha*=smoothstep(.0,.045,x)*(1.-smoothstep(.97,1.,x));\n gl_FragColor=vec4(col*alpha,alpha);\n}";
const IMPACT="precision mediump float;\nvarying vec2 vUv;\nuniform float uTime, uAlpha, uBlast;\nvoid main(){\n vec2 p=(vUv*2.0-1.0)*vec2(1.,1.06);\n float a=atan(p.y,p.x),r=length(p),t=uTime;\n // Five burning star tips, like video at 48 seconds; NOT a round explosion.\n float rays=pow(max(0.,.5+.5*cos(5.0*a-1.57+t*.8)),6.0);\n float ripples=.018*sin(a*19.0-t*21.0)+.012*sin(a*31.0+t*30.0);\n float edge=(.35+.36*rays+ripples)*(uBlast>.5?1.0:.66);\n float fill=1.-smoothstep(edge-.055,edge+.028,r);\n float rim=1.-smoothstep(.008,.075,abs(r-edge));\n float core=1.-smoothstep(.04,.28,r);\n float heat=clamp(1.-r/max(.12,edge),0.,1.);\n vec3 col=mix(vec3(.57,.045,.008),vec3(1.,.26,.012),smoothstep(.02,.44,heat));\n col=mix(col,vec3(1.,.69,.075),smoothstep(.30,.69,heat));\n col=mix(col,vec3(1.,.97,.57),core*.83);\n float alpha=clamp(fill*.91+rim*.22+core*.21,0.,1.)*uAlpha;\n gl_FragColor=vec4(col*alpha,alpha);\n}";
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const kind=s=>{const n=norm(s);return n==='flamethrower'||n==='lancachamas'?'flamethrower':
 n==='fireblast'||n==='explosaodefogo'?'fireblast':null;};
const stats={version:'179-video-reference-preview',installed:true,approved:false,renderer:'shared PixiJS/WebGL',
 starts:{flamethrower:0,fireblast:0},frames:0,confirmedImpacts:0,removed:0,
 suppressedOld:0,gpuFailures:[],nativeDamageUntouched:true};
let active=[];
const failure=e=>{stats.gpuFailures.push(String(e?.message||e));stats.gpuFailures=stats.gpuFailures.slice(-5);};
const live=e=>!!(battle?.active&&e?.canvas?.isConnected&&e.player&&e.enemy);
function gpu(e){
 try{const a=window.PokemonTorrePixelFlyingBridge?.labStage?.(e)?.app;
  if(a?.renderer?.gl&&!a.renderer.gl.isContextLost?.())return a;
 }catch(err){failure(err);}
 return null;
}
function mesh(fragment,uniforms){
 const geo=new P.Geometry()
 .addAttribute('aVertexPosition',new Float32Array([0,-.5,1,-.5,1,.5,0,.5]),2)
 .addAttribute('aTextureCoord',new Float32Array([0,0,1,0,1,1,0,1]),2)
 .addIndex([0,1,2,0,2,3]);
 const shader=P.Shader.from(VERT,fragment,uniforms),sprite=new P.Mesh(geo,shader);
 sprite.blendMode=P.BLEND_MODES.NORMAL;return{sprite,shader,geo};
}
function destroyMesh(m){
 if(!m)return;
 try{m.sprite.destroy({children:true});}catch(_){}
 try{m.shader.destroy();}catch(_){}
 try{m.geo.destroy();}catch(_){}
}
function dispose(f){
 if(f.dead)return;
 f.dead=true;destroyMesh(f.visual);destroyMesh(f.impact);
 try{f.root.destroy({children:true});}catch(_){}
 active=active.filter(x=>x!==f);stats.removed++;
}
function clear(e){for(const f of active.slice())if(!e||f.engine===e)dispose(f);}
function start(e,name,instantHit=false){
 if(!live(e))return null;
 const app=gpu(e);if(!app){stats.gpuFailures.push('WebGL unavailable for '+name);return null;}
 clear(e);
 try{
  const root=new P.Container();
  root.interactiveChildren=false;app.stage.addChild(root);
  const visual=mesh(name==='fireblast'?BLAST:FLAME,{uTime:0,uReach:0,uAlpha:0});
  root.addChild(visual.sprite);
  const f={engine:e,app,root,visual,impact:null,name,
   began:clock(),hitAt:instantHit?clock():0,impactAt:0,impactConsumed:false,
   duration:name==='fireblast'?1500:1320,dead:false};
  active.push(f);stats.starts[name]++;return f;
 }catch(err){failure(err);return null;}
}
function positionFlame(f,e){
 const h=e.h||420,p=e.player,t=e.enemy,dir=t.x>=p.x?1:-1;
 const ax=p.x+dir*Math.min(20,h*.034),ay=p.y-h*.14;
 const bx=t.x-dir*Math.min(13,h*.027),by=t.y-h*.13;
 const dx=bx-ax,dy=by-ay;
 const s=f.visual.sprite;
 s.position.set(ax,ay);s.rotation=Math.atan2(dy,dx);
 s.width=Math.max(32,Math.hypot(dx,dy));s.height=clamp(h*.106,36,61);
}
function positionBlast(f,e,progress){
 const h=e.h||420,p=e.player,t=e.enemy;
 const ax=p.x,ay=p.y-h*.16,bx=t.x,by=t.y-h*.14;
 const eased=ease(progress),s=f.visual.sprite;
 s.rotation=0;
 s.position.set(ax+(bx-ax)*eased,ay+(by-ay)*eased);
 const size=clamp(h*.12,40,68)*(.77+.23*eased);
 s.width=size;s.height=size*.70;
 s.rotation=Math.atan2(by-ay,bx-ax);
 // Mesh vertices have X range 0..1 but Y -0.5..0.5: left shift half width.
 s.pivot.set(.5,0);
}
function confirmed(f){
 if(!f||f.dead||f.hitAt||f.impactConsumed)return;
 f.hitAt=clock();stats.confirmedImpacts++;
}
function update(e){
 if(!active.length)return;
 for(const f of active.slice()){
  if(f.engine!==e)continue;
  if(!live(e)||!f.root.parent||f.app.renderer?.gl?.isContextLost?.()){dispose(f);continue;}
  const elapsed=clock()-f.began,u=clamp(elapsed/f.duration,0,1);
  if(u>=1){dispose(f);continue;}
  const shader=f.visual.shader.uniforms;
  shader.uTime=elapsed*.001;
  if(f.name==='flamethrower'){
   positionFlame(f,e);
   shader.uReach=ease(u/.18);
   shader.uAlpha=ease(u/.085)*(1-ease((u-.89)/.11));
  }else{
   // Short concentrated projectile grows into star ONLY at the confirmed impact.
   const fly=f.hitAt?1:ease((elapsed-70)/620);
   positionBlast(f,e,fly);
   shader.uReach=1;
   shader.uAlpha=ease((u-.04)/.10)*(f.hitAt?0:1-ease((u-.78)/.20));
  }
  if(f.hitAt&&!f.impactConsumed){
   f.impactConsumed=true;
   try{
    f.impact=mesh(IMPACT,{uTime:0,uAlpha:0,uBlast:f.name==='fireblast'?1:.18});
    f.root.addChild(f.impact.sprite);
    f.impactAt=clock();
   }catch(err){failure(err);}
  }
  if(f.impact){
   const m=f.impact,ms=clock()-f.impactAt;
   const len=f.name==='fireblast'?560:310;
   const q=clamp(ms/len,0,1);
   if(q>=1){destroyMesh(m);f.impact=null;f.impactAt=-1;}
   else{
    const h=e.h||420,diam=f.name==='fireblast'?clamp(h*.33,104,167):clamp(h*.105,29,52);
    m.sprite.rotation=0;
    m.sprite.position.set(e.enemy.x-diam*.5,e.enemy.y-h*.13);
    m.sprite.width=diam;m.sprite.height=diam;
    m.shader.uniforms.uTime=ms*.001;
    m.shader.uniforms.uAlpha=ease(q/.12)*(1-ease((q-.57)/.43));
   }
  }
  stats.frames++;
 }
}
const previousPaint=window.PokemonTorreV360Paint;
if(typeof previousPaint==='function')window.PokemonTorreV360Paint=function(g,fx,time,e){
 const n=kind(fx?.move?.name||fx?.name);
 if(n&&active.some(f=>f.engine===e&&f.name===n&&!f.dead)){
  stats.suppressedOld++;return true;
 }
 return previousPaint.apply(this,arguments);
};
// V41 paints Fire Blast separately from V360, so suppress just that old sprite
// while our WebGL glyph is alive; other fire moves keep their original painter.
if(typeof fireSpriteV41!=='undefined'&&typeof fireSpriteV41.paint==='function'){
 const oldFirePaint=fireSpriteV41.paint;
 fireSpriteV41.paint=function(ctx,fx,time,e){
  if(kind(fx?.move?.name||fx?.name)==='fireblast'&&
     active.some(f=>f.engine===e&&f.name==='fireblast'&&!f.dead)){
   stats.suppressedOld++;return true;
  }
  return oldFirePaint.apply(this,arguments);
 };
}
const originalUse=BattleEngine.prototype.useMove;
BattleEngine.prototype.useMove=function(slot){
 if(!live(this)||!Number.isInteger(slot))return originalUse.apply(this,arguments);
 const actor=typeof current==='function'?current():null;
 const m=actor&&typeof skillSet==='function'?skillSet(actor)?.[slot]:null;
 const n=kind(m?.name);
 if(!n)return originalUse.apply(this,arguments);
 const energy=Number(battle.energy),cd=typeof cooldowns==='object'?cooldowns[slot]:null;
 const hp=typeof foe==='function'?Number(foe()?.hp):NaN;
 const result=originalUse.apply(this,arguments);
 const accepted=result!==false&&live(this)&&(Number(battle.energy)<energy||
  (typeof cooldowns==='object'&&cooldowns[slot]!==cd));
 if(accepted){
  const currentHp=typeof foe==='function'?Number(foe()?.hp):NaN;
  start(this,n,Number.isFinite(hp)&&Number.isFinite(currentHp)&&currentHp<hp);
 }
 return result;
};
const originalHit=BattleEngine.prototype.hitTarget;
BattleEngine.prototype.hitTarget=function(who,type,power){
 const hp=who==='enemy'&&typeof foe==='function'?Number(foe()?.hp):NaN;
 const result=originalHit.apply(this,arguments); // native damage is authoritative
 const after=who==='enemy'&&typeof foe==='function'?Number(foe()?.hp):NaN;
 if(who==='enemy'&&Number.isFinite(hp)&&Number.isFinite(after)&&after<hp){
  const f=active.find(x=>x.engine===this&&!x.dead&&!x.hitAt&&
    x.impactAt!==-1&&(!type||type==='fire')&&clock()-x.began<1900);
  if(f)confirmed(f);
 }
 return result;
};
const originalDraw=BattleEngine.prototype.draw;
BattleEngine.prototype.draw=function(t){
 const result=originalDraw.apply(this,arguments);
 try{update(this);}catch(err){failure(err);clear(this)}
 return result;
};
const originalDestroy=BattleEngine.prototype.destroy;
BattleEngine.prototype.destroy=function(){clear(this);return originalDestroy.apply(this,arguments);};
window.PokemonTorreFirePairV179=Object.freeze({
 installed:true,approved:false,diagnostics:()=>({...stats,active:active.map(f=>f.name),
  phases:active.map(f=>f.impact?'impact':f.hitAt?'hit':'travel')})
});
})();
