/* V156: ONE PixiJS/WebGL scene for floor, real PMD actors, Shadow Ball and Psychic.
 * This is a separate pilot; never alters protected game attacks or save data.
 * PMD credits https://github.com/PMDCollab/SpriteCollab
 */
(()=>{'use strict';
const el=id=>document.getElementById(id),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const note=(s)=>{if(el('message'))el('message').textContent=s;};
if(!window.PIXI?.Application){note('Não foi possível iniciar o PixiJS. Verifique a conexão.');return;}
const PIXI=window.PIXI;
PIXI.settings.SCALE_MODE=PIXI.SCALE_MODES.NEAREST;
const W=720,H=1150;
const app=new PIXI.Application({width:W,height:H,antialias:false,resolution:1,
 autoDensity:false,backgroundColor:0x21183e,powerPreference:'high-performance'});
el('stage').appendChild(app.view);
app.view.setAttribute('aria-label','Prévia jogável Mew contra Mewtwo');
const view=new PIXI.Container();app.stage.addChild(view);
const scenery=new PIXI.Container(),actorsLayer=new PIXI.Container(),fxLayer=new PIXI.Container();
view.addChild(scenery,actorsLayer,fxLayer);
const url="../assets/battle-v156/";
const SRC="https://raw.githubusercontent.com/PMDCollab/SpriteCollab/0b346b2be91935c16a95bd90939447289c3c83da/sprite/";
const LOCAL="../assets/pmd-spritecollab/";
const metaCache=new Map();
const fxUrl="../assets/battle-v156/";
const perf={mode:'auto',level:'high',window:[],avgFps:60,p95ms:17,slowFrames:0,
  sampled:0,changes:0,peakParticles:0,peakSpells:0};
const budget=()=>perf.level==='low'?28:perf.level==='medium'?54:104;
function qualityMode(){
 const modes=['auto','quality','economy'];
 perf.mode=modes[(modes.indexOf(perf.mode)+1)%modes.length];
 perf.level=perf.mode==='economy'?'low':'high';
 el('quality').textContent=perf.mode==='auto'?'Qualidade: AUTO':
   perf.mode==='quality'?'Qualidade: ALTA':'Qualidade: ECONOMIA';
 note('Gráficos: '+perf.mode.toUpperCase()+' · sem alterar o dano nem a velocidade dos Pokémon.');
}
const qBtn=el('quality');if(qBtn)qBtn.addEventListener('click',qualityMode);
function monitorPerformance(deltaMs){
 if(!Number.isFinite(deltaMs))return;
 perf.window.push(Math.min(200,Math.max(0,deltaMs)));
 if(perf.window.length<150)return;
 const sorted=[...perf.window].sort((a,b)=>a-b);
 perf.p95ms=sorted[Math.floor(sorted.length*.95)]||17;
 perf.avgFps=Math.round(1000/(perf.window.reduce((a,b)=>a+b,0)/perf.window.length));
 perf.slowFrames+=perf.window.filter(ms=>ms>33.3).length;
 perf.sampled+=perf.window.length;perf.window.length=0;
 if(perf.mode==='auto'){
  const next=perf.avgFps<42?'low':perf.avgFps<55?'medium':'high';
  if(perf.level!==next){perf.level=next;perf.changes++;}
 }
}
function metadataXml(xml){
 const documentXml=new DOMParser().parseFromString(xml,'text/xml'),data={};
 if(documentXml.querySelector('parsererror'))throw Error('PMD AnimData XML inválido');
 for(const anim of documentXml.querySelectorAll('Anims > Anim')){
  const name=anim.querySelector('Name')?.textContent?.trim();
  if(!name)continue;
  const w=Number(anim.querySelector('FrameWidth')?.textContent);
  const h=Number(anim.querySelector('FrameHeight')?.textContent);
  const durations=[...anim.querySelectorAll('Durations > Duration')]
   .map(node=>Number(node.textContent)).filter(n=>Number.isFinite(n)&&n>0);
  if(w>0&&h>0&&durations.length)data[name]=[w,h,durations];
 }
 return data;
}
async function pmdMeta(id){
 if(metaCache.has(id))return metaCache.get(id);
 const tryFetch=async uri=>{
  const resp=await fetch(uri,{cache:'force-cache'});
  if(!resp.ok)throw Error('PMD XML HTTP '+resp.status);
  return metadataXml(await resp.text());
 };
 const promise=tryFetch(LOCAL+id+'/AnimData.xml').catch(()=>
  tryFetch(SRC+id+'/AnimData.xml')).catch(()=>fallbackSpecs()[id]);
 metaCache.set(id,promise);return promise;
}
async function pmdTexture(id,action){
 const possible=[LOCAL+id+'/'+action+'-Anim.png',SRC+id+'/'+action+'-Anim.png'];
 let error;
 for(const uri of possible){
  try{
   const t=await image(uri);
   if(uri.startsWith(LOCAL))state.pmdLocal=(state.pmdLocal||0)+1;
   return t;
  }catch(e){error=e;}
 }
 throw error||Error('PMD '+id+' '+action+' não disponível');
}
const ACT=['Idle','Walk','Attack','Shoot','Hurt','Hover','Float','Faint'];
const cache=new Map();
const state={ready:false,playing:true,seconds:0,zoom:1,shake:0,notes:0,frames:0,fps:60,
 spells:[],particles:[],enemyNext:3,aim:null,touches:{x:0,y:0},keys:new Set(),fxSheets:{},
 nextPlayer:[0,0],shadowOrb:null,psychicRing:null,impact:null,shield:null,
 hero:null,foe:null,damageLog:[]};
window.PokemonTorreMewPilot=Object.freeze({installed:true,version:'156.0',type:'standalone noncommercial playable preview',diagnostics:()=>({
 ready:state.ready,fps:state.fps,spells:state.spells.length,particles:state.particles.length,
 heroHp:state.hero?.hp,foeHp:state.foe?.hp,cameraZoom:state.zoom,
 qualityMode:perf.mode,qualityLevel:perf.level,p95FrameMs:perf.p95ms,slowFrames:perf.slowFrames,
 samples:perf.sampled,qualityChanges:perf.changes,peakParticles:perf.peakParticles,
 peakSpells:perf.peakSpells,renderers:document.querySelectorAll('#stage canvas').length,
 pmdLocal:state.pmdLocal||0,metadata:state.metadata||0})});
const hex=(s)=>parseInt(s.replace('#',''),16);
function tex(path){return PIXI.Texture.from(path);}
function sprite(t,x,y,w,h,container=scenery){
 const s=new PIXI.Sprite(t);s.position.set(x,y);s.width=w;s.height=h;container.addChild(s);return s;
}
function circle(x,y,r,color,alpha,parent){
 const g=new PIXI.Graphics();g.beginFill(color,alpha);g.drawEllipse(0,0,r,r*.30);g.endFill();g.position.set(x,y);
 parent.addChild(g);return g;
}
function image(texPath){return new Promise((resolve,reject)=>{
 const t=PIXI.Texture.from(texPath);
 if(t.baseTexture.valid)return resolve(t);
 const done=()=>{t.baseTexture.off('error',fail);resolve(t)};
 const fail=e=>{t.baseTexture.off('loaded',done);reject(e||Error(texPath))};
 t.baseTexture.once('loaded',done);t.baseTexture.once('error',fail);
 // Asset timeout is guarded by browser's fetch; never stall a battle on XML.
});}
function fallbackSpecs(){
 return{
 "0150":{Idle:[32,64,[40,2,4,6,8,6,4,2]],Walk:[48,56,[12,6,6,12,6,6]],
 Attack:[80,88,[2,3,4,1,1,1,2,2,2,2,2]],Shoot:[56,64,Array(13).fill(2)],
 Hurt:[48,72,[2,8]],Hover:[48,72,[2,2,2,6,2,2,2,2,2,2,6,2,2]],
 Faint:[48,72,[4,6,6,6]]},
 "0151":{Idle:[32,56,[12,8,12,8]],Walk:[40,64,[8,8,8,8,8,8]],
 Attack:[64,88,[2,2,1,3,1,3,2,1,1,2,2,2,2,2]],Shoot:[40,64,[2,2,2,3,3,3,3,3,3,2,2,2]],
 Hurt:[40,64,[2,8]],Hover:[32,56,[12,8,12,8]],Faint:[32,56,[4,6,6,6]]}
 };}
async function sheet(id,action){
 const key=id+':'+action;if(cache.has(key))return cache.get(key);
 const specs=await pmdMeta(id);
 const details=specs[action]||fallbackSpecs()[id][action]||fallbackSpecs()[id].Idle;
 if(!details||!details[0]||!details[1])throw Error('Sem metadados para '+key);
 const texture=await pmdTexture(id,action);
 // Local import count is recorded at pmdTexture, independent of Pixi resource internals.
 const w=details[0],h=details[1],durations=details[2];
 const columns=Math.floor(texture.width/w),rows=Math.floor(texture.height/h);
 const count=Math.min(columns,durations.length);
 if(!Number.isFinite(w)||!Number.isFinite(h)||count<1||rows<1)
  throw Error('Spritesheet PMD incompatível com AnimData: '+key+' '+texture.width+'x'+texture.height);
 const directions=Array.from({length:rows},(_,row)=>
  Array.from({length:count},(_,i)=>new PIXI.Texture(texture.baseTexture,
   new PIXI.Rectangle(i*w,row*h,w,h))));
 const result={frames:directions,durations:durations.slice(0,count),w,h,count,rows};
 cache.set(key,result);state.metadata=(state.metadata||0)+1;return result;
}
async function animatedAtlas(name,w,h,count){
 const texture=await image(fxUrl+name);
 if(texture.width<4*w||texture.height<Math.ceil(count/4)*h)
  throw Error('Atlas cinematográfico incompleto: '+name);
 return Array.from({length:count},(_,i)=>new PIXI.Texture(texture.baseTexture,
  new PIXI.Rectangle((i%4)*w,Math.floor(i/4)*h,w,h)));
}
function castVisual(type){
 const key=type==='shadow'?'shadow':'psychic';
 const seq=state.fxSheets[key];
 if(!seq?.length)return new PIXI.Sprite(type==='shadow'?state.orb:state.ring);
 const s=new PIXI.AnimatedSprite(seq);s.loop=true;s.animationSpeed=type==='shadow'?.19:.15;s.play();
 return s;
}
function makeImpact(x,y){
 const frames=state.fxSheets.impact;
 const s=frames?.length?new PIXI.AnimatedSprite(frames):new PIXI.Sprite(state.impact);
 if(frames?.length){s.loop=false;s.animationSpeed=.34;s.play();}
 s.anchor.set(.5);s.position.set(x,y);s.width=162;s.height=162;
 s.blendMode=PIXI.BLEND_MODES.ADD;fxLayer.addChild(s);
 state.particles.push({s,life:.43,max:.43,vx:0,vy:0,kind:'impact'});
}
function actor(id,name,x,y,maxHp,scale){
 const c=new PIXI.Container();c.position.set(x,y);actorsLayer.addChild(c);
 const shadow=circle(0,0,34,0x11091d,.30,c);
 const halo=new PIXI.Graphics();halo.lineStyle(1.2,0xd4c2f7,.20).drawEllipse(0,0,44,18);
 halo.y=0;c.addChild(halo);
 const s=new PIXI.Sprite(PIXI.Texture.WHITE);s.anchor.set(.5,.84);c.addChild(s);
 const o={id,name,x,y,maxHp,hp:maxHp,baseScale:scale,cont:c,sp:s,shadow,halo,
 action:'Idle',actionAt:0,actionEnd:Infinity,sheets:new Map(),facing:id==='0151'?4:0,
 status:0,invuln:0,moveTime:0};
 return o;
}
function activate(a,name,duration=.55){
 if(!a.sheets.has(name))name='Idle';
 a.action=name;a.actionAt=state.seconds;a.actionEnd=state.seconds+duration;
}
function clipFrame(a){
 const meta=a.sheets.get(a.action)||a.sheets.get('Idle');if(!meta)return;
 const dt=Math.max(0,(state.seconds-a.actionAt)*60),loop=a.action==='Idle'||a.action==='Walk'||a.action==='Hover';
 const total=meta.durations.reduce((x,y)=>x+y,0);
 let frameTime=loop?dt%total:Math.min(total-.01,dt),frame=0;
 for(let i=0;i<meta.count;i++){if(frameTime<meta.durations[i]){frame=i;break;}
  frameTime-=meta.durations[i];frame=i;}
 const row=meta.rows>=8?a.facing:0;
 a.sp.texture=meta.frames[row][frame];
 // PMD source pixels displayed without smoothing; character does not resize
 // when switching from an Idle sheet to a broader attack sheet.
 a.sp.width=meta.w*a.baseScale;a.sp.height=meta.h*a.baseScale;
}
function selectActions(hero,foe){
 for(const a of [hero,foe]){
  if(a.action!=='Idle'&&state.seconds>a.actionEnd)activate(a,'Idle',100);
  clipFrame(a);
  a.cont.position.set(Math.round(a.x),Math.round(a.y)+Math.sin(state.seconds*2.9+(a===foe?1:0))*1.5);
  a.cont.alpha=a.invuln>0&&Math.floor(state.seconds*18)%2?0.72:1;
 }
}
function cameraFrame(){
 const z=state.zoom;
 view.pivot.set(W/2,H*.51);
 view.position.set(W/2+Math.random()*state.shake-state.shake*.5,
  H*.51+Math.random()*state.shake-state.shake*.5);
 view.scale.set(z);
 state.shake=Math.max(0,state.shake*.80-.10);
 state.zoom+=(1-state.zoom)*.035;
}
function updateBars(){
 for(const a of [state.hero,state.foe]){
  const key=a===state.hero?'mew':'mewtwo';
  el(key+'-hp').style.width=(100*a.hp/a.maxHp).toFixed(1)+'%';
  el(key+'-value').textContent=Math.round(a.hp)+'/'+a.maxHp;
 }
}
function hit(a,dmg,colors=[0xfdeaff,0xf4abff]){
 if(!state.playing||a.hp<=0)return;
 a.hp=Math.max(0,a.hp-dmg);a.invuln=.18;activate(a,'Hurt',.28);updateBars();
 state.shake=9;state.zoom=1.075;
 makeImpact(a.x,a.y-60);
 for(let i=0;i<(perf.level==='low'?8:perf.level==='medium'?14:24);i++){
  const angle=Math.PI*2*i/24,spread=25+Math.random()*70,sp=new PIXI.Sprite(state.orb);
  sp.anchor.set(.5);sp.position.set(a.x,a.y-54);sp.width=5+Math.random()*8;
  sp.height=sp.width;sp.tint=colors[i%colors.length];sp.blendMode=PIXI.BLEND_MODES.ADD;
  fxLayer.addChild(sp);state.particles.push({s:sp,life:.22+Math.random()*.32,max:.54,
   vx:Math.cos(angle)*spread,vy:Math.sin(angle)*spread,kind:'spark'});
 }
 if(a.hp===0){note(a===state.foe?'Mew venceu! Reinicie para jogar de novo.':'Mewtwo venceu! Tente novamente.');state.playing=false;activate(a,'Faint',10);}
}
function canCast(type){const index=type==='shadow'?0:1;return state.playing&&state.ready&&state.seconds>=state.nextPlayer[index];}
function cast(type,attacker=state.hero,victim=state.foe){
 if(attacker===state.hero&&!canCast(type))return;
 if(!attacker||!victim||attacker.hp<=0||victim.hp<=0)return;
 const user=attacker===state.hero;
 const isShadow=type==='shadow';
 if(user)state.nextPlayer[isShadow?0:1]=state.seconds+(isShadow?2.4:4.2);
 const action=isShadow?'Shoot':'Attack';
 activate(attacker,action,isShadow?.62:.78);
 const glow=castVisual(type);
 glow.anchor.set(.5);glow.position.set(attacker.x,attacker.y-65);
 glow.width=isShadow?47:135;glow.height=glow.width;
 glow.blendMode=PIXI.BLEND_MODES.ADD;fxLayer.addChild(glow);
 const shot={kind:type,user,attacker,victim,sprite:glow,t:0,
  charge:isShadow?.22:.45,travel:isShadow?.58:.67,hit:false,
  sx:attacker.x,sy:attacker.y-65,tx:victim.x,ty:victim.y-61};
 state.spells.push(shot);
 perf.peakSpells=Math.max(perf.peakSpells,state.spells.length);
 if(user)note(isShadow?'Mew usa Bola Sombria!':'Mew usa Psíquico!');
 else note('Mewtwo está preparando um ataque!');
}
function updateSpells(dt){
 for(const p of state.spells){
  p.t+=dt;const age=p.t-p.charge;
  if(age<0){
   const k=Math.min(1,p.t/p.charge);
   p.sprite.rotation+=dt*(p.kind==='shadow'?2:5);
   p.sprite.alpha=.24+.76*k;
   p.sprite.scale.set(.68+.3*k);
  }else{
   const u=clamp(age/p.travel,0,1),ease=u*u*(3-2*u);
   const target=p.victim;
   p.tx=target.x;p.ty=target.y-58;
   p.sprite.x=p.sx+(p.tx-p.sx)*ease;
   p.sprite.y=p.sy+(p.ty-p.sy)*ease-Math.sin(u*Math.PI)*20;
   p.sprite.rotation+=dt*(p.kind==='shadow'?3:8);
   if(p.kind==='psychic'){p.sprite.width=140+u*80;p.sprite.height=p.sprite.width;}
   else {p.sprite.width=54+Math.sin(p.t*20)*5;p.sprite.height=p.sprite.width;}
   if(Math.random()<(perf.level==='low'?.16:perf.level==='medium'?.28:.43)&&state.particles.length<budget()){
    const dot=new PIXI.Sprite(state.orb);dot.anchor.set(.5);
    dot.position.set(p.sprite.x+Math.random()*17-8,p.sprite.y+Math.random()*17-8);
    dot.width=7+Math.random()*6;dot.height=dot.width;
    dot.alpha=.64;dot.blendMode=PIXI.BLEND_MODES.ADD;fxLayer.addChild(dot);
    state.particles.push({s:dot,life:.25,max:.25,vx:Math.random()*45-22,vy:Math.random()*42-21,kind:'spark'});
    perf.peakParticles=Math.max(perf.peakParticles,state.particles.length);
   }
   if(u>=1&&!p.hit){
    p.hit=true;
    // HP changes ONLY when rendered projectile reaches the defender.
    hit(p.victim,p.kind==='shadow'?23:31);
   }
  }
 }
 for(let i=state.spells.length-1;i>=0;i--){
  const p=state.spells[i];if(p.hit&&p.t>p.charge+p.travel+.08){p.sprite.destroy();state.spells.splice(i,1);}
 }
}
function updateParticles(dt){
 for(let i=state.particles.length-1;i>=0;i--){
  const p=state.particles[i];p.life-=dt;
  if(p.life<=0){p.s.destroy();state.particles.splice(i,1);continue;}
  const t=p.life/p.max;
  p.s.alpha=p.kind==='impact'?t*.9:t*.8;
  if(p.kind==='impact'){p.s.width=185*(1+(1-t)*.45);p.s.height=p.s.width;}
  else{p.s.position.x+=p.vx*dt;p.s.position.y+=p.vy*dt;p.s.scale.set(t);}
 }
}
function face(a,b){
 const d=Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;
 const v=Math.round((90-d)/45);a.facing=((v%8)+8)%8;
}
function controls(dt){
 const hero=state.hero,foe=state.foe;
 const k=state.keys;let x=state.touches.x,y=state.touches.y;
 if(k.has('a')||k.has('arrowleft'))x-=1;if(k.has('d')||k.has('arrowright'))x+=1;
 if(k.has('w')||k.has('arrowup'))y-=1;if(k.has('s')||k.has('arrowdown'))y+=1;
 const n=Math.hypot(x,y);if(n){hero.x=clamp(hero.x+x/n*195*dt,65,W-65);
 hero.y=clamp(hero.y+y/n*195*dt,270,H-130);
 if(hero.action==='Idle')activate(hero,'Walk',.22);
 if(hero.action==='Walk')hero.actionEnd=state.seconds+.12;}
 face(hero,foe);face(foe,hero);
 // Mewtwo acts as a sparring opponent. No changes to the real game AI.
 if(state.seconds>state.enemyNext&&state.spells.length<3){
  cast(Math.random()>.47?'shadow':'psychic',foe,hero);
  state.enemyNext=state.seconds+2.1+Math.random()*1.7;
 }
 const dx=hero.x-foe.x,dy=hero.y-foe.y,dist=Math.hypot(dx,dy);
 if(dist<150&&foe.hp>0){
  foe.x=clamp(foe.x-dx/dist*54*dt,70,W-70);
  foe.y=clamp(foe.y-dy/dist*54*dt,230,580);
 }
 hero.invuln=Math.max(0,hero.invuln-dt);foe.invuln=Math.max(0,foe.invuln-dt);
}
function reset(){
 for(const a of [state.hero,state.foe]){a.hp=a.maxHp;activate(a,'Idle',100);a.invuln=0;}
 state.hero.x=361;state.hero.y=815;state.foe.x=361;state.foe.y=425;
 for(const s of state.spells)s.sprite.destroy();for(const p of state.particles)p.s.destroy();
 state.spells.length=state.particles.length=0;state.seconds=0;
 state.enemyNext=3;state.nextPlayer=[0,0];state.playing=true;
 note('Batalha de teste — mova Mew e use os dois golpes.');updateBars();
}
async function init(){
 note('Preparando arena, sprites do PMD e efeitos…');
 const names=['violet-stone-arena.png','psychic-ring.png','shadow-orb.png','psychic-impact.png'];
 let textures;
 try{textures=await Promise.all(names.map(n=>image(url+n)));
  const frames=await Promise.all([
   animatedAtlas('shadow-ball-16.png',128,128,16),
   animatedAtlas('psychic-glyph-16.png',160,160,16),
   animatedAtlas('impact-12.png',128,128,12)
  ]);
  state.fxSheets={shadow:frames[0],psychic:frames[1],impact:frames[2]};
 }
 catch(err){note('Falha ao carregar os recursos da arena. Atualize a página.');console.error(err);return;}
 const bg=sprite(textures[0],0,0,W,H,scenery);
 bg.texture.baseTexture.scaleMode=PIXI.SCALE_MODES.NEAREST;
 state.ring=textures[1];state.orb=textures[2];state.impact=textures[3];
 const hero=state.hero=actor('0151','Mew',361,815,158,2.5);
 const foe=state.foe=actor('0150','Mewtwo',361,425,240,2.55);
 // Fetch only the animations needed for this pilot. Others can be imported
 // for the full game later, with per-artist credits.
 const actions=['Idle','Walk','Attack','Shoot','Hurt','Faint'];
 let ok=0;
 for(const a of [hero,foe]){
  await Promise.all(actions.map(async action=>{
   try{a.sheets.set(action,await sheet(a.id,action));ok++;}
   catch(err){console.warn('PMD animation unavailable',a.id,action,err);}
  }));
  if(!a.sheets.has('Idle')){
   note('Sprite PMD indisponível. Verifique a conexão e recarregue.');return;
  }
  activate(a,'Idle',100);
 }
 state.ready=true;reset();
 el('loading').hidden=true;
 // A first frame becomes visible after the actual PMD idle sheets are decoded.
 app.ticker.add(dt=>{
  const sec=Math.min(.034,dt/60);
  if(!state.ready)return;
  state.seconds+=sec;
  if(state.playing){controls(sec);updateSpells(sec);}
  updateParticles(sec);selectActions(hero,foe);cameraFrame();
  state.frames++;state.fps=Math.round(app.ticker.FPS);
  monitorPerformance(Math.min(200,Math.max(0,dt*1000/60)));
  if(state.frames%10===0)el('fps').textContent='WebGL · '+state.fps+' FPS · '+perf.level.toUpperCase();
  for(const [i,type] of ['shadow','psychic'].entries()){
   const left=Math.max(0,state.nextPlayer[i]-state.seconds);
   const b=el(type);b.disabled=!state.playing||left>0;
   const badge=b.querySelector('small');
   badge.textContent=left>0?left.toFixed(1)+'s':'PRONTO';
  }
 });
 console.info('[V156] PMD sheets ready:',ok,'of',actions.length*2,'AnimData + 3 animated FX atlases');
}
function dodge(){
 if(!state.playing)return;
 const m=state.hero,foe=state.foe,dx=m.x-foe.x,dy=m.y-foe.y,n=Math.hypot(dx,dy)||1;
 m.x=clamp(m.x+(state.touches.x||dx/n)*76,62,W-62);
 m.y=clamp(m.y+(state.touches.y||dy/n)*76,280,H-105);
 m.invuln=.35;state.shake=3;note('Mew se esquivou!');
}
for(const key of ['shadow','psychic'])el(key).addEventListener('click',()=>cast(key));
el('dodge').addEventListener('click',dodge);
el('restart').addEventListener('click',reset);
window.addEventListener('keydown',e=>{
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();
 state.keys.add(e.key.toLowerCase());
 if(e.repeat)return;
 if(e.key==='1')cast('shadow');if(e.key==='2')cast('psychic');
 if(e.key===' ')dodge();
});
window.addEventListener('keyup',e=>state.keys.delete(e.key.toLowerCase()));
const joy=el('joystick'),knob=el('knob');
function moveStick(e){
 const rc=joy.getBoundingClientRect(),cx=rc.left+rc.width/2,cy=rc.top+rc.height/2;
 const dx=e.clientX-cx,dy=e.clientY-cy,l=Math.hypot(dx,dy)||1,u=Math.min(l,39)/l;
 state.touches.x=dx/l*Math.min(l/37,1);state.touches.y=dy/l*Math.min(l/37,1);
 knob.style.transform='translate('+Math.round(dx*u)+'px,'+Math.round(dy*u)+'px)';
}
joy.addEventListener('pointerdown',e=>{joy.setPointerCapture(e.pointerId);moveStick(e);});
joy.addEventListener('pointermove',e=>{if(joy.hasPointerCapture(e.pointerId))moveStick(e);});
for(const ev of ['pointerup','pointercancel'])joy.addEventListener(ev,()=>{
 state.touches.x=0;state.touches.y=0;knob.style.transform='translate(0px,0px)';
});
init().catch(e=>{console.error(e);note('Erro de inicialização da prévia: '+(e?.message||e));});
})();
