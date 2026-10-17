/* Pokémon Torre V168 FlameTower sprint — four FULL animated WebGL sprite atlases.
 * New isolated playable laboratory; NEVER replaces approved moves in official game.
 * 32 / 32 / 32 / 24 hand-authored frames, own flame choreography, native battle retained.
 */
(()=>{
'use strict';
const P=window.PIXI;
if(!window.__V168_LAB||!P||typeof BattleEngine!=='function')return;
const now=()=>performance.now(),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const data={
 version:'168.0-fire-sprite-lab',installed:true,active:false,webgl:false,
 flames:0,framesDrawn:0,contactDashes:0,completed:0,impacts:0,
 fps:0,errors:[],loadReady:0,loadFailed:0,savedMovesUntouched:true,
 originalCampaignPreserved:true,atlasFrames:{tower:32,flamethrower:32,blast:32,punch:24},
 previews:[],maxConcurrent:4
};
const specs={
 tower:{name:'Flame Tower',file:'flame-tower-32.png',count:32,duration:1230},
 flamethrower:{name:'Lança-Chamas',file:'flamethrower-32.png',count:32,duration:1090},
 blast:{name:'Fire Blast',file:'fire-blast-32.png',count:32,duration:1070},
 punch:{name:'Soco de Fogo',file:'fire-punch-24.png',count:24,duration:790}
};
const raw=new Map(),textures=new Map(),casts=[],path='assets/flame-v168/';
let app=null,root=null,owner=null,visible=false,lastFpsAt=0,lastTick=now(),smoothFps=60;
const warn=e=>{const msg=String(e?.message||e);if(!data.errors.includes(msg))data.errors.push(msg);data.errors=data.errors.slice(-7);};
for(const [kind,spec] of Object.entries(specs)){
 const img=new Image();img.decoding='async';
 img.onload=()=>{
  if(img.naturalWidth!==8*192||img.naturalHeight!==Math.ceil(spec.count/8)*192){
   data.loadFailed++;warn(Error('Atlas com dimensões erradas: '+spec.file));return;}
  raw.set(kind,img);data.loadReady++;
 };
 img.onerror=()=>{data.loadFailed++;warn(Error('Atlas indisponível: '+spec.file));};
 img.src=path+spec.file+'?art=v168.0';
}
const live=e=>!!(e?.canvas?.isConnected&&typeof battle!=='undefined'&&battle?.active);
function acquire(e){
 if(!live(e))return null;
 const access=window.PokemonTorrePixelFlyingBridge?.labStage?.(e);
 const candidate=access?.app;
 if(!candidate?.renderer?.gl)return null;
 if(e!==owner||candidate!==app||!root?.parent){
  for(const fx of casts)if(!fx.sprite.destroyed)fx.sprite.destroy();
  casts.length=0;
  if(root&&!root.destroyed)root.destroy({children:true});
  app=candidate;owner=e;
  root=new P.Container();app.stage.addChild(root);
 }
 data.active=true;data.webgl=true;
 return root;
}
function frames(kind){
 if(textures.has(kind))return textures.get(kind);
 const img=raw.get(kind),spec=specs[kind];
 if(!img)return null;
 try{
  const bt=P.BaseTexture.from(img);bt.scaleMode=P.SCALE_MODES.NEAREST;
  if(!bt.valid)return null;
  const tiles=Array.from({length:spec.count},(_,i)=>
   new P.Texture(bt,new P.Rectangle((i%8)*192,Math.floor(i/8)*192,192,192)));
  textures.set(kind,tiles);
  return tiles;
 }catch(e){warn(e);return null;}
}
const ease=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
function dash(u){
 // Physical collision never changes. Only the displayed player moves into range.
 if(u<.12)return 0;
 if(u<.45)return ease((u-.12)/.33)*.91;
 if(u<.61)return .91;
 if(u<.88)return .91*(1-ease((u-.61)/.27));
 return 0;
}
function launch(kind){
 const e=owner;if(!live(e)||!acquire(e))return false;
 const spec=specs[kind],atlas=frames(kind);
 if(!spec||!atlas){warn(Error('Aguarde o carregamento da animação '+kind));return false;}
 const player=e.player,enemy=e.enemy;
 const from={x:player.x,y:player.y-e.h*.13};
 const to={x:enemy.x,y:enemy.y-e.h*.13};
 const sprite=new P.Sprite(atlas[0]);
 sprite.anchor.set(.5);sprite.blendMode=P.BLEND_MODES.NORMAL;
 if(kind==='tower'){sprite.anchor.set(.5,.91);sprite.width=Math.min(e.h*.44,240);sprite.height=Math.min(e.h*.65,360);}
 if(kind==='flamethrower'){sprite.anchor.set(.04,.5);sprite.width=Math.max(90,Math.hypot(to.x-from.x,to.y-from.y));sprite.height=Math.min(e.h*.31,172);}
 if(kind==='blast'){sprite.width=Math.min(e.h*.42,220);sprite.height=sprite.width;}
 if(kind==='punch'){sprite.width=Math.min(e.h*.32,170);sprite.height=sprite.width;}
 root.addChild(sprite);
 casts.push({kind,spec,sprite,atlas,from,to,start:now(),duration:spec.duration,lastFrame:-1,impacted:false});
 data.flames++;data.previews.push(kind);data.previews=data.previews.slice(-16);
 if(casts.length>4){const old=casts.shift();old.sprite.destroy();}
 if(kind==='punch')data.contactDashes++;
 return true;
}
function update(e){
 const view=acquire(e);if(!view)return;
 const t=now(),dt=Math.max(1,t-lastTick);lastTick=t;
 smoothFps=.95*smoothFps+.05*Math.min(1000/dt,144);
 data.fps=Math.round(smoothFps);
 for(let i=casts.length-1;i>=0;i--){
  const c=casts[i],u=clamp((t-c.start)/c.duration,0,1),sp=c.sprite;
  if(u>=1){sp.destroy();casts.splice(i,1);data.completed++;continue;}
  const frame=Math.min(c.atlas.length-1,Math.floor(u*c.atlas.length));
  if(frame!==c.lastFrame){sp.texture=c.atlas[frame];data.framesDrawn++;c.lastFrame=frame;}
  const {from,to,kind}=c;
  if(kind==='tower'){
   sp.position.set(to.x,to.y+e.h*.135);
   sp.alpha=1;
  }else if(kind==='flamethrower'){
   sp.position.set(from.x,from.y);
   sp.rotation=Math.atan2(to.y-from.y,to.x-from.x);
  }else if(kind==='blast'){
   const p=ease(clamp((u-.07)/.75,0,1));
   sp.position.set(from.x+(to.x-from.x)*p,from.y+(to.y-from.y)*p-Math.sin(p*Math.PI)*e.h*.095);
   sp.rotation=Math.sin(u*10)*.055;
  }else if(kind==='punch'){
   const d=dash(u),px=from.x+(to.x-from.x)*d,py=from.y+(to.y-from.y)*d;
   if(u<.45){sp.position.set(px+Math.sign(to.x-from.x)*e.h*.055,py-e.h*.02);}
   else {sp.position.set(to.x,to.y);}
   sp.rotation=(to.x<from.x?Math.PI:0)+Math.sin(u*17)*.07;
  }
  if(!c.impacted&&u>=(kind==='tower'?.56:kind==='punch'?.55:.78)){
   c.impacted=true;data.impacts++;
   // Impact glint is drawn within the animated atlas, not a duplicate projectile.
  }
 }
 if(!casts.length)root.visible=false;else root.visible=true;
}
const nativeDraw=BattleEngine.prototype.draw;
BattleEngine.prototype.draw=function(t){
 const result=nativeDraw.apply(this,arguments);
 try{if(live(this))update(this);}catch(err){warn(err);}
 if(now()-lastFpsAt>500){
  lastFpsAt=now();
  const active=!!(owner&&live(owner));
  if(active!==visible){visible=active;panel.style.display=active?'flex':'none';}
  const hud=document.getElementById('v168-fire-perf');
  if(hud&&active)hud.textContent=data.fps+' FPS · '+data.loadReady+'/4 atlases · '+(data.webgl?'WebGL':'aguardando GPU');
 }
 return result;
};
const nativeDrawMon=BattleEngine.prototype.drawMon;
BattleEngine.prototype.drawMon=function(actor,id,enemy,clock){
 if(!enemy&&this===owner&&actor===this.player){
  const punch=[...casts].reverse().find(c=>c.kind==='punch'&&(now()-c.start)<c.duration);
  if(punch){
   const u=clamp((now()-punch.start)/punch.duration,0,1);
   const d=dash(u);
   if(d>.01){
    const shown={...actor,x:actor.x+(punch.to.x-punch.from.x)*d,
       y:actor.y+(punch.to.y-punch.from.y)*d*.45};
    return nativeDrawMon.call(this,shown,id,enemy,clock);
   }
  }
 }
 return nativeDrawMon.apply(this,arguments);
};
const nativeDestroy=BattleEngine.prototype.destroy;
BattleEngine.prototype.destroy=function(){
 if(this===owner){for(const x of casts)x.sprite?.destroy();casts.length=0;
  if(root&&!root.destroyed)root.destroy({children:true});
  root=null;owner=null;app=null;data.active=false;
 }
 return nativeDestroy.apply(this,arguments);
};
// One collapsible inspector in the experimental battle. No large overlay on gameplay.
const panel=document.createElement('section');panel.id='v168-flame-controls';
panel.style.cssText='position:fixed;right:9px;bottom:10px;z-index:9450;display:none;flex-direction:column;align-items:flex-end;gap:5px;pointer-events:none;font-family:system-ui,sans-serif';
const toggle=document.createElement('button');
toggle.id='v168-panel-toggle';toggle.type='button';toggle.textContent='🔥 FlameTower · 24/32 quadros';
toggle.style.cssText='pointer-events:auto;border:1px solid #ffb246b8;border-radius:9px;background:#241313f0;color:#ffe4aa;font:bold 11px system-ui;padding:8px 10px;box-shadow:0 4px 14px #100c0799;max-width:240px';
panel.appendChild(toggle);
const body=document.createElement('div');body.id='v168-move-panel';
body.style.cssText='display:none;pointer-events:auto;max-width:265px;background:#120e19ee;border:1px solid #9b5632;border-radius:10px;padding:9px;box-shadow:0 7px 22px #000b;color:#fff';
body.innerHTML='<b style="font-size:12px;color:#ffcf85">MOVES FLAMETOWER · V168</b><div id="v168-fire-perf" style="font-size:10px;color:#cab8ac;margin:4px 0"></div><div id="v168-fire-buttons" style="display:grid;grid-template-columns:1fr 1fr;gap:5px"></div><div style="font-size:9px;opacity:.75;margin-top:6px">Prévia durante a batalha. Golpes salvos e dano preservados.</div>';
panel.insertBefore(body,toggle);
toggle.addEventListener('click',()=>{body.style.display=body.style.display==='none'?'block':'none';});
const buttons=body.querySelector('#v168-fire-buttons');
for(const [kind,spec] of Object.entries(specs)){
 const b=document.createElement('button');b.type='button';b.dataset.flame168=kind;
 b.textContent=spec.name+' · '+spec.count;
 b.style.cssText='background:#562413;color:#fff1d6;border:1px solid #bd682d;border-radius:6px;font:bold 10px system-ui;padding:7px 4px;cursor:pointer';
 b.addEventListener('click',()=>{if(!launch(kind))b.title='Espere carregar o atlas';});
 buttons.appendChild(b);
}
document.head.insertAdjacentHTML('beforeend','<style id="flame-v168-ui">#v167-lab-controls{display:none!important}#v168-flame-controls button:focus-visible{outline:2px solid #ffd64c}#v168-flame-controls button:active{filter:brightness(1.35)}</style>');
document.body.appendChild(panel);
window.PokemonTorreFlameTowerV168=Object.freeze({
 start:kind=>launch(kind),
 diagnostics:()=>({...data,activeCasts:casts.length,ready:Object.keys(specs).filter(k=>raw.has(k)),
  loadedFrames:Object.fromEntries([...textures].map(([kind,frames])=>[kind,frames.length]))})
});
})();