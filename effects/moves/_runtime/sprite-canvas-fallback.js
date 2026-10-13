/* V36.05 — sprite animation fallback (no generic Canvas shapes).
   Only Confusion, Psychic Storm, Psybeam and Vine Whip. */
const spriteFallbackVFX=(()=>{
'use strict';
const defs={
 confusion:['confusion/assets/frames/ripple-',6,'confusion/assets/mind-impact.svg','confusion/assets/thought-fragment.svg'],
 tempestadepsiquica:['tempestade-psiquica/assets/frames/storm-',6,'tempestade-psiquica/assets/storm-impact.svg','tempestade-psiquica/assets/storm-shard.svg'],
 psybeam:['psybeam/assets/frames/beam-',6,'psybeam/assets/prism-impact.svg','psybeam/assets/prism-flare.svg'],
 chicotedevinha:['chicote-de-vinha/assets/frames/vine-',7,'chicote-de-vinha/assets/vine-impact.svg','chicote-de-vinha/assets/vine-leaf.svg']
};
const images=new Map(),counts={},normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const ease=x=>{x=Math.min(1,Math.max(0,x));return x*x*(3-2*x)};
const lerp=(a,b,t)=>a+(b-a)*t;
function image(path){
 const url='effects/moves/'+path+'?build=v3605';
 if(!images.has(url)){const im=new Image();im.decoding='async';im.src=url;images.set(url,im)}
 return images.get(url);
}
for(const [prefix,n,hit,decor] of Object.values(defs)){
 for(let j=0;j<n;j++)image(prefix+j+'.svg');
 image(hit);image(decor);
}
const inkCache=new WeakMap();
function inkSilhouette(im){
 if(inkCache.has(im))return inkCache.get(im);
 try{
  const c=document.createElement('canvas'),w=im.naturalWidth,h=im.naturalHeight;
  c.width=w;c.height=h;
  const g=c.getContext('2d');g.drawImage(im,0,0,w,h);
  g.globalCompositeOperation='source-in';g.fillStyle='#05080c';g.fillRect(0,0,w,h);
  inkCache.set(im,c);return c;
 }catch(err){return null;}
}
function stamp(ctx,im,x,y,w,h,rot,alpha,left=false){
 if(!im?.complete||!im.naturalWidth||w<=0||alpha<=.01)return false;
 ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.globalAlpha=Math.max(0,Math.min(1,alpha));
 const offset=left?0:-w/2,silhouette=inkSilhouette(im);
 if(silhouette){
  // Actual two-dimensional sprite contour; zero generic paths.
  for(const [ox,oy] of [[-1.7,0],[1.7,0],[0,-1.7],[0,1.7]])
   ctx.drawImage(silhouette,offset+ox,-h/2+oy,w,h);
 }
 ctx.shadowColor='rgba(0,0,0,.73)';ctx.shadowBlur=3;ctx.shadowOffsetX=2;ctx.shadowOffsetY=3;
 ctx.drawImage(im,offset,-h/2,w,h);ctx.restore();return true;
}
function paint(ctx,fx,now){
 const n=normalize(fx?.move?.name||fx?.name),d=defs[n],A=fx?.from,B=fx?.to;
 if(!d||!ctx||!Array.isArray(A)||!Array.isArray(B))return false;
 const [base,total,impact,deco]=d,t=Math.min(1,Math.max(0,(now-fx.at)/(fx.duration||950)));
 const angle=Math.atan2(B[1]-A[1],B[0]-A[0]),len=Math.hypot(B[0]-A[0],B[1]-A[1]);
 const q=ease((t-.15)/.54),impactQ=ease((t-.50)/.25),fade=1-ease((t-.84)/.16),idx=Math.max(0,Math.floor((now-fx.at)/75));
 const frame=i=>image(base+(idx+i)%total+'.svg'),hit=image(impact),particle=image(deco);
 let drew=false;
 if(n==='psybeam'||n==='chicotedevinha'){
  const vine=n==='chicotedevinha';
  for(let j=0;j<(vine?2:3);j++){
   const u=vine?ease((t-.10-j*.18)/.42):q;
   drew=stamp(ctx,frame(j*2),A[0],A[1]+(j-1)*6,Math.max(1,len*u),vine?41:31,
   angle,fade*(vine?1-ease((t-.52-j*.18)/.15):1)*(j?.72:.95),true)||drew;
  }
 }else{
  const count=n==='confusion'?3:5;
  for(let j=0;j<count;j++){
   const u=ease((t-j*.08)/.52),a=j*6.283/count+now*.003;
   const x=n==='confusion'?lerp(A[0],B[0],u):B[0]+Math.cos(a)*32;
   const y=n==='confusion'?lerp(A[1],B[1],u):B[1]+Math.sin(a)*24;
   drew=stamp(ctx,frame(j),x,y,n==='confusion'?86:88,n==='confusion'?78:36,a*.2,
   fade*(n==='confusion'?.77:impactQ*.82))||drew;
  }
 }
 for(let j=0;j<7;j++){
  const a=j*2.399+now*.004,r=17+impactQ*(14+j%3*8);
  drew=stamp(ctx,particle,B[0]+Math.cos(a)*r,B[1]+Math.sin(a)*r*.72,19,21,a,
  impactQ*fade*.65)||drew;
 }
 drew=stamp(ctx,hit,B[0],B[1],n==='tempestadepsiquica'?116:89,
 n==='tempestadepsiquica'?113:87,now*.001,impactQ*fade*.83)||drew;
 if(drew)counts[n]=(counts[n]||0)+1;
 return drew;
}
return {paint,diagnostics:()=>({version:'36.05',loaded:[...images.values()].filter(i=>i.complete&&i.naturalWidth).length,total:images.size,rendered:{...counts}})};
})();
window.PokemonTorreSpriteFallbackFX=()=>spriteFallbackVFX.diagnostics();