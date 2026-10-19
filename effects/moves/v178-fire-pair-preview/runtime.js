/* Pokémon Torre V178: TWO DISTINCT FIRE MOVES as opt-in animated GPU previews.
 * Flamethrower: uninterrupted organic flame stream. Fire Blast: compact
 * thicker fiery 大 glyph travels to target, then blooms ONLY on confirmed hit.
 * Uses shared PixiJS WebGL stage, native V359/V65 HP/cooldown, NO 2D canvas.
 * Neither V172 approved source nor old Fire Blast sprite renderer is overwritten.
 */
(()=>{
'use strict';
const params=new URLSearchParams(location.search);
if(params.get('fire178')!=='preview'||params.get('safe')==='1'||
 !window.PIXI||typeof BattleEngine!=='function'||window.PokemonTorreFirePairV178?.installed)return;
const P=window.PIXI,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const ease=x=>{x=clamp(x,0,1);return x*x*(3-2*x);},clock=()=>performance.now();
const VERT="precision mediump float;\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nuniform mat3 translationMatrix;\nuniform mat3 projectionMatrix;\nvarying vec2 vUv;\nvoid main(){\n vUv=aTextureCoord;\n vec3 p=translationMatrix*vec3(aVertexPosition,1.0);\n gl_Position=vec4((projectionMatrix*p).xy,0.0,1.0);\n}";
const FLAME="precision mediump float;\nvarying vec2 vUv;\nuniform float uTime;\nuniform float uReach;\nuniform float uAlpha;\nfloat noise1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}\nfloat n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(noise1(i),noise1(i+vec2(1.,0.)),f.x),mix(noise1(i+vec2(0.,1.)),noise1(i+vec2(1.,1.)),f.x),f.y);}\nvoid main(){\n vec2 uv=vUv;float x=uv.x,t=uTime;\n float n=n2(vec2(x*15.5-t*6.2,uv.y*7.2+t*.7));\n float hi=n2(vec2(x*33.0-t*13.0,uv.y*17.0-t*1.7));\n float pulse=sin(x*34.0-t*18.0+n*4.0);\n float center=.5+.012*sin(x*10.0-t*2.8)+.013*(n-.5);\n float r=(.105+.060*smoothstep(.04,.38,x)+.027*pulse+.019*(hi-.5));\n r*=.83+.17*smoothstep(.0,.18,x);\n r*=1.0-smoothstep(.84,1.02,x)*.93;\n float dist=abs(uv.y-center);\n float tongues=(.014+.015*hi)*sin(x*79.0-t*33.0+uv.y*9.0);\n float d=dist-r-tongues;\n float solid=1.0-smoothstep(-.011,.014,d);\n float outer=1.0-smoothstep(-.004,.040,d);\n float inside=clamp(1.0-dist/max(.025,r),0.0,1.0);\n float flameFlicker=.5+.5*sin(x*46.0-t*17.0+hi*4.0);\n vec3 col=mix(vec3(.12,.019,.009),vec3(.96,.10,.013),smoothstep(.02,.28,inside));\n col=mix(col,vec3(1.,.40,.027),smoothstep(.19,.52,inside));\n col=mix(col,vec3(1.,.78,.15),smoothstep(.47,.83,inside)*(.78+.22*flameFlicker));\n col=mix(col,vec3(1.,.94,.52),smoothstep(.80,.97,inside)*(.62+.30*n));\n float edgeGlow=(outer-solid)*.15;\n float mask=smoothstep(.0,.026,x)*(1.0-smoothstep(.969,1.002,x));\n mask*=1.0-smoothstep(uReach-.035,uReach+.006,x);\n float alpha=clamp((solid+edgeGlow)*mask*uAlpha,0.0,1.0);\n gl_FragColor=vec4(col*alpha,alpha);\n}";
const BLAST="precision mediump float;\nvarying vec2 vUv;\nuniform float uTime;\nuniform float uReach;\nuniform float uAlpha;\nfloat seg(vec2 p,vec2 a,vec2 b){vec2 q=b-a;return length(p-a-q*clamp(dot(p-a,q)/dot(q,q),0.0,1.0));}\nfloat noise1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}\nvoid main(){\n vec2 p=vUv;float t=uTime;\n // Recognizable original Fire Blast 大: crossbar, stem, and two legs.\n float bar=seg(p,vec2(.19,.29),vec2(.81,.29));\n float stem=seg(p,vec2(.51,.15),vec2(.51,.49));\n float legL=seg(p,vec2(.52,.43),vec2(.15,.87));\n float legR=seg(p,vec2(.52,.43),vec2(.85,.87));\n float d=min(min(bar,stem),min(legL,legR));\n float flow=sin(p.x*46.0+p.y*31.0-t*16.0)+.52*sin(p.x*91.0-p.y*55.0+t*21.0);\n float flick=.010*flow+.008*(noise1(floor(p*42.0+vec2(t*8.0,-t*5.0)))-.5);\n float width=.082+flick;\n float body=1.0-smoothstep(width-.017,width+.010,d);\n float edge=1.0-smoothstep(width+.010,width+.045,d);\n float hot=clamp((width-d)/max(width,.01),0.0,1.0);\n vec3 col=mix(vec3(.10,.015,.008),vec3(.79,.07,.01),smoothstep(.01,.32,hot));\n col=mix(col,vec3(1.,.36,.025),smoothstep(.23,.58,hot));\n col=mix(col,vec3(1.,.83,.19),smoothstep(.54,.88,hot));\n col=mix(col,vec3(1.,.95,.57),smoothstep(.85,1.0,hot)*.75);\n // Tiny rim tongues shimmer without changing the glyph into a sphere.\n float alpha=clamp(body+(edge-body)*.16,0.0,1.0)*uAlpha;\n gl_FragColor=vec4(col*alpha,alpha);\n}";
const IMPACT="precision mediump float;\nvarying vec2 vUv;\nuniform float uTime;\nuniform float uAlpha;\nuniform float uBlast;\nvoid main(){\n vec2 p=vUv*2.0-1.0;\n float angle=atan(p.y,p.x),r=length(vec2(p.x,p.y*1.1));\n float t=uTime;\n float tongues=.075*sin(angle*7.0+t*14.0)+.045*sin(angle*13.0-t*11.0);\n float edge=.50+tongues;\n float plume=1.0-smoothstep(edge-.13,edge+.06,r);\n float inner=1.0-smoothstep(.05,.40,r);\n float rim=1.0-smoothstep(.015,.12,abs(r-edge));\n float fill=clamp(plume*.67+inner*.58+rim*.28,0.0,1.0);\n vec3 col=mix(vec3(.80,.08,.012),vec3(1.,.48,.035),plume);\n col=mix(col,vec3(1.,.89,.33),inner*.86);\n col=mix(col,vec3(1.,.98,.70),pow(inner,2.0)*.4);\n float fade=1.0-smoothstep(.83,1.0,r);\n float alpha=fill*uAlpha*fade*(.60+.4*uBlast);\n gl_FragColor=vec4(col*alpha,alpha);\n}";
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const kind=s=>{const n=norm(s);return n==='flamethrower'||n==='lancachamas'?'flamethrower':
 n==='fireblast'||n==='explosaodefogo'?'fireblast':null;};
const stats={version:'178-preview',installed:true,approved:false,renderer:'shared PixiJS/WebGL',
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
   began:clock(),hitAt:instantHit?clock():0,impactAt:0,
   duration:name==='fireblast'?1560:1180,dead:false};
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
 const size=clamp(h*.20,66,111)*(.78+.21*eased);
 s.width=size;s.height=size*1.07;
 // Mesh vertices have X range 0..1 but Y -0.5..0.5: left shift half width.
 s.pivot.set(.5,0);
}
function confirmed(f){
 if(!f||f.dead||f.hitAt)return;
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
   shader.uReach=ease(u/.16);
   shader.uAlpha=ease(u/.075)*(1-ease((u-.87)/.13));
  }else{
   // Original 大 silhouette flies; never replaced by a generic glowing ball.
   const fly=f.hitAt?1:ease((u-.11)/.56);
   positionBlast(f,e,fly);
   shader.uReach=1;
   shader.uAlpha=ease((u-.04)/.10)*(f.hitAt?0:1-ease((u-.78)/.20));
  }
  if(f.hitAt&&!f.impact){
   try{
    f.impact=mesh(IMPACT,{uTime:0,uAlpha:0,uBlast:f.name==='fireblast'?1:.18});
    f.root.addChild(f.impact.sprite);
    f.impactAt=clock();
   }catch(err){failure(err);}
  }
  if(f.impact){
   const m=f.impact,ms=clock()-f.impactAt;
   const len=f.name==='fireblast'?480:260;
   const q=clamp(ms/len,0,1);
   if(q>=1){destroyMesh(m);f.impact=null;f.hitAt=0;f.impactAt=-1;}
   else{
    const h=e.h||420,diam=f.name==='fireblast'?clamp(h*.24,78,135):clamp(h*.08,25,44);
    m.sprite.rotation=0;
    m.sprite.position.set(e.enemy.x-diam*.5,e.enemy.y-h*.13);
    m.sprite.width=diam;m.sprite.height=diam;
    m.shader.uniforms.uTime=ms*.001;
    m.shader.uniforms.uAlpha=ease(q/.13)*(1-ease((q-.66)/.34));
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
window.PokemonTorreFirePairV178=Object.freeze({
 installed:true,approved:false,diagnostics:()=>({...stats,active:active.map(f=>f.name),
  phases:active.map(f=>f.impact?'impact':f.hitAt?'hit':'travel')})
});
})();
