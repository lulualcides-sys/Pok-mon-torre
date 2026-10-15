/* Pokemon Torre V95 — global Pokemon presentation pipeline, Mewtwo pilot.
 * Works on the EXISTING Idle/Walk/Attack/Hurt assets. Never redraws species,
 * changes body parts, Mega forms, attacks, HP, hitboxes or battle timings.
 * Scope stays explicitly 150 until the user approves the result.
 */
(()=>{
 'use strict';
 if(typeof BattleEngine!=='function'||!BattleEngine.prototype.drawMon)return;
 if(window.PokemonTorrePokemonPolishV95?.installed)return;
 const setting=Object.freeze({
  version:'95.0',scope:'mewtwo-pilot',pokemonIds:Object.freeze([150]),
  outlineSourcePx:1,contrast:1.075,saturation:1.055,
  rimAmount:11,lowerShade:0.055,cacheMaxPerImage:96
 });
 const stats={draws:0,polished:0,framesGenerated:0,cacheHits:0,
  skipped:0,failed:0,lastPokemonId:null,lastAssetSource:null,lastError:null};
 const allowed=new Set(setting.pokemonIds.map(String));
 const caches=new WeakMap();
 const clamp=(v,a=0,b=255)=>Math.max(a,Math.min(b,v));
 function frame(image,sx,sy,sw,sh){
  if(!image||typeof image!=='object'||!Number.isInteger(sw)||
     !Number.isInteger(sh)||sw<2||sh<2||sw>1024||sh>1024)return null;
  let cache=caches.get(image);
  if(!cache){cache=new Map();caches.set(image,cache);}
  const key=[sx,sy,sw,sh].join(':');
  if(cache.has(key)){stats.cacheHits++;return cache.get(key);}
  let result=null;
  try{
   const raw=document.createElement('canvas');
   raw.width=sw;raw.height=sh;
   const cx=raw.getContext('2d',{willReadFrequently:true});
   if(!cx)throw Error('2D pixel extraction unavailable');
   cx.imageSmoothingEnabled=false;
   cx.drawImage(image,sx,sy,sw,sh,0,0,sw,sh);
   const pixels=cx.getImageData(0,0,sw,sh).data;
   const pad=2,W=sw+pad*2,H=sh+pad*2;
   const canvas=document.createElement('canvas');
   canvas.width=W;canvas.height=H;
   const ctx=canvas.getContext('2d');
   if(!ctx)throw Error('Canvas2D output unavailable');
   const imageData=ctx.createImageData(W,H),dst=imageData.data;
   const alpha=(x,y)=>x>=0&&y>=0&&x<sw&&y<sh?
    pixels[(y*sw+x)*4+3]:0;
   const rgb=(x,y,c)=>pixels[(y*sw+x)*4+c];
   for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const ox=x-pad,oy=y-pad,di=(y*W+x)*4;
    const a=alpha(ox,oy);
    if(a>24){
     const top=!alpha(ox,oy-1)||!alpha(ox-1,oy);
     const rim=top?setting.rimAmount:0;
     const shade=oy>sh*.56?setting.lowerShade*(oy/sh-.56)*2.25:0;
     const lum=.2126*rgb(ox,oy,0)+.7152*rgb(ox,oy,1)+.0722*rgb(ox,oy,2);
     for(let c=0;c<3;c++){
      const v=rgb(ox,oy,c);
      const sat=lum+(v-lum)*setting.saturation;
      dst[di+c]=clamp((sat-125)*setting.contrast+125+rim-shade*sat);
     }
     dst[di+3]=a;
    }else{
     let edge=false;
     for(let yy=-1;yy<=1&&!edge;yy++)
      for(let xx=-1;xx<=1;xx++)
       if(xx!==0||yy!==0)
        if(alpha(ox+xx,oy+yy)>72){edge=true;break;}
     if(edge){
      dst[di]=14;dst[di+1]=19;dst[di+2]=29;dst[di+3]=235;
     }
    }
   }
   ctx.putImageData(imageData,0,0);
   result={canvas,width:W,height:H,sw,sh,pad};
   stats.framesGenerated++;
  }catch(err){
   // Keep the original sprite if a remote image isn't CORS-clean.
   stats.failed++;stats.lastError=String(err?.message||err);
  }
  cache.set(key,result);
  if(cache.size>setting.cacheMaxPerImage)cache.delete(cache.keys().next().value);
  return result;
 }
 function interceptedDraw(ctx,native,image,args){
  const nine=args.length===8;
  const five=args.length===4;
  if(!nine&&!five){stats.skipped++;return native.call(ctx,image,...args);}
  const natW=Number(image?.naturalWidth||image?.width||0);
  const natH=Number(image?.naturalHeight||image?.height||0);
  const rect=nine?args:[0,0,natW,natH,...args];
  const [sx,sy,sw,sh,dx,dy,dw,dh]=rect;
  if([sx,sy,sw,sh,dx,dy,dw,dh].some(v=>!Number.isFinite(Number(v)))||
      !Number.isInteger(sw)||!Number.isInteger(sh)||
      !Number.isInteger(sx)||!Number.isInteger(sy)||dw===0||dh===0){
   stats.skipped++;return native.call(ctx,image,...args);
  }
  const art=frame(image,sx,sy,sw,sh);
  if(!art){stats.skipped++;return native.call(ctx,image,...args);}
  const mx=art.pad*dw/sw,my=art.pad*dh/sh;
  const old=ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled=false;
  try{
   const value=native.call(ctx,art.canvas,dx-mx,dy-my,
    dw+2*mx,dh+2*my);
   stats.polished++;stats.lastAssetSource=String(image?.src||'embedded-frame').slice(0,160);
   return value;
  }finally{ctx.imageSmoothingEnabled=old;}
 }
 const originalDrawMon=BattleEngine.prototype.drawMon;
 BattleEngine.prototype.drawMon=function(entity,id,enemy,now){
  if(!allowed.has(String(id)))return originalDrawMon.apply(this,arguments);
  const ctx=this.ctx;
  if(!ctx||typeof ctx.drawImage!=='function')return originalDrawMon.apply(this,arguments);
  // Intercept ONLY while Mewtwo's body is being painted. The arena,
  // attack particles, opponent and HUD never use these filters.
  const originalDraw=ctx.drawImage;
  let installed=false;
  try{
   ctx.drawImage=function(image,...args){
    return interceptedDraw(ctx,originalDraw,image,args);
   };
   installed=ctx.drawImage!==originalDraw;
  }catch(e){stats.lastError=String(e?.message||e);}
  stats.draws++;stats.lastPokemonId=String(id);
  try{return originalDrawMon.apply(this,arguments);}
  finally{
   if(installed){try{ctx.drawImage=originalDraw;}catch(e){
    stats.lastError=String(e?.message||e);
   }}
  }
 };
 window.PokemonTorrePokemonPolishV95=Object.freeze({
  installed:true,version:'95.0',config:setting,
  diagnostics:()=>({...stats}),
  scopeDescription:'Apenas Mewtwo (id 150); padrão reutilizável para todos, após aprovação'
 });
})();
