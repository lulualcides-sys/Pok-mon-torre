/* Pokémon Torre V41 — sprite-only fire engine.
   Original user-supplied 75-frame fire atlas, frame cells 96x96, 8 columns.
   NO procedural attack drawings, paths, circles, CSS animations or gradients. */
const fireSpriteV41=(()=>{
'use strict';
const atlasPath='effects/moves/fire-original/fire-original-4-atlas.png?v=sprite-fire-v41';
const groups=Object.freeze({
 punch:[0,7],punchFlame:[7,7],funnel:[14,1],spinRing:[15,11],
 explosion:[26,11],explosionBurst:[37,13],firebolt:[50,12],
 fireburst:[62,12],flame:[74,1]
});
const moves=new Map(),frames=Object.create(null),times=Object.create(null);
const source=new Image();source.decoding='async';
let blueSheet=null,ready=false,error='';
const clamp=(n,lo=0,hi=1)=>Math.min(hi,Math.max(lo,n));
const ease=n=>{n=clamp(n);return n*n*(3-2*n)};
const lerp=(a,b,t)=>a+(b-a)*t;
const image=(useBlue=false)=>useBlue?blueSheet:ready?source:null;
source.onload=()=>{
 ready=!!source.naturalWidth;
 if(!ready){error='Atlas original vazio';return;}
 try{
  const canvas=document.createElement('canvas');
  canvas.width=source.naturalWidth;canvas.height=source.naturalHeight;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  if(!ctx)throw Error('Canvas de conversão indisponível');
  ctx.drawImage(source,0,0);
  const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
  const data=pixels.data;
  for(let i=0;i<data.length;i+=4){
   if(data[i+3]<4)continue;
   const r=data[i],g=data[i+1],b=data[i+2];
   const lum=Math.max(r,g,b);
   // Retain the dark sprite outline; recolor just the existing fire pixels.
   if(lum<38){data[i]=4;data[i+1]=10;data[i+2]=30;continue;}
   const v=clamp((lum-38)/217);
   data[i]=Math.round(7+v*169);
   data[i+1]=Math.round(34+v*218);
   data[i+2]=Math.round(126+v*129);
  }
  ctx.putImageData(pixels,0,0);
  blueSheet=canvas;
 }catch(e){error='Falha ao converter sprites de Moltres: '+e.message;}
};
source.onerror=()=>{ready=false;error='Atlas original indisponível: '+atlasPath;};
source.src=atlasPath;
/* Render real atlas frames only. Every visual calls drawImage on existing pixels. */
function draw(ctx,group,frame,x,y,w,h,options={}){
 const descriptor=groups[group];if(!descriptor||!ctx)return false;
 const pic=image(!!options.blue);
 if(!pic||!pic.width||!pic.height)return false;
 const id=descriptor[0]+((Math.floor(frame)%descriptor[1]+descriptor[1])%descriptor[1]);
 const alpha=clamp(options.alpha===undefined?1:options.alpha);
 if(alpha<.025||w<=0||h<=0)return false;
 ctx.save();
 ctx.globalAlpha=alpha;
 ctx.imageSmoothingEnabled=false;
 ctx.translate(x,y);
 ctx.rotate(options.rotation||0);
 if(options.flipX)ctx.scale(-1,1);
 ctx.drawImage(pic,(id%8)*96,Math.floor(id/8)*96,96,96,-w/2,-h/2,w,h);
 ctx.restore();
 frames[group]=(frames[group]||0)+1;
 return true;
}
function add(name,descriptor){
 if(moves.has(name)||typeof descriptor.paint!=='function')throw Error('Fire sprite duplicated: '+name);
 moves.set(name,Object.freeze(descriptor));
}
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const resolve=fx=>moves.get(normalize(fx?.move?.name||fx?.name))||null;
function paint(ctx,fx,now,engine){
 const m=resolve(fx);if(!m)return false;
 if(!Array.isArray(fx.from)||!Array.isArray(fx.to))return true;
 if(!Number.isFinite(now)||now<fx.at)return true;
 const duration=fx.duration||m.duration;
 const t=clamp((now-fx.at)/duration),ms=now-fx.at;
 const s=clamp((engine?.h||560)/560,.75,1.18);
 try{m.paint(ctx,fx,t,ms,s,{draw,clamp,ease,lerp});times[m.key]=(times[m.key]||0)+1;}
 catch(e){error='Golpe '+m.key+': '+e.message;console.error('[Fogo V41]',e);}
 return true;
}
return {add,resolve,paint,draw,clamp,ease,lerp,source,diagnostics:()=>({
 version:'41.0',mode:'source-sprites-only',originalAtlasReady:ready,blueAtlasReady:!!blueSheet,
 src:atlasPath,registered:[...moves.keys()],frames:{...frames},paintCounts:{...times},error
})};
})();
