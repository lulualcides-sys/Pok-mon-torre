/* Pokémon Torre V105: pixel-ink authored fighting sprites, no cartoon stars.
 * Generates actual per-frame low-res 2D pixel sprites and plays them in the
 * real Canvas battle at 60FPS. No PNG stills, HTML elements or flying shots.
 * Four individually authored styles; fallback covers other Fighting contact.
 */
window.PokemonTorreFightingInkV105=(()=>{
'use strict';
const cache=new Map(), stats={version:'105.0',atlases:0,frames:0,pixels:0,draws:0,unique:[],
 perStyle:{},fallback:0,last:null,errors:[]};
const C=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const hash=(x,y,k=0)=>{let z=Math.imul((x+31)*374761393 ^ (y+127)*668265263 ^ (k+23)*2246822519,3266489917);z^=z>>>13;return (Math.imul(z,1274126177)>>>0)/4294967295};
const palettes={
 kick:[null,'#111722','#543028','#994926','#e38a43','#ffcf78','#fff7d0','#777c82','#b29e88'],
 karate:[null,'#111522','#363149','#695a82','#a19bc3','#f0edfc','#ffffff','#494758','#7d8b9c'],
 cross:[null,'#150f1c','#471b30','#9b254b','#e64170','#ff95b1','#fff2ee','#793445','#be6585'],
 brick:[null,'#151721','#42363b','#76605a','#c18e69','#f0c692','#fff7d7','#5e6670','#9599a1'],
 punch:[null,'#151923','#53372d','#a96842','#e6a066','#ffdb92','#fff5e4','#6a6463','#9f9487'],
 aura:[null,'#101626','#303858','#576fa5','#8aa9df','#d5e6ff','#ffffff','#555b75','#8797ae']
};
const PHASES={kick:8,karate:12,cross:16,brick:16,punch:12,aura:12};
function disc(u,v,x,y,rx,ry=rx){const a=(u-x)/rx,b=(v-y)/ry;return a*a+b*b;}
function ribbon(u,v,angle,dist,thick){
 const cs=Math.cos(angle),sn=Math.sin(angle),ax=u*cs+v*sn,ay=-u*sn+v*cs;
 return {side:Math.abs(ay),along:ax,inside:Math.abs(ax)<dist&&Math.abs(ay)<thick};
}
function pixel(style,x,y,f,total){
 const u=x-36,v=y-34,contact=style==='kick'?.59:style==='karate'?.59:style==='cross'?.62:style==='brick'?.63:.59,
  t=(f+.5)/total,pre=t<contact,p=C(pre?t/contact:(t-contact)/(1-contact));
 const seed=style.length*53+f*13,n=hash(x,y,seed),spec=n>.90;
 let base=0;
 // Strong black rim + stepped highlights from actual shape fields.
 if(pre){
  if(p<.36)return 0;
  const reach=(p-.36)/.64;
  if(style==='kick'){
   const rr=ribbon(u+10-reach*12,v-7, -.42,8+reach*15,2+reach*2);
   if(rr.inside)base=Math.abs(rr.side)<1.15?6:5;
   if(disc(u,v,-10+reach*10,-4,4+reach*2,2+reach) <1)base=spec?6:4;
  }else if(style==='karate'){
   const stroke=ribbon(u+4-reach*5,v+8-reach*11,-.93,5+reach*15,1.8+reach*1.4);
   if(stroke.inside)base=stroke.side<1.3?6:5;
  }else if(style==='cross'){
   for(const a of [-.78,.78]){const line=ribbon(u+6-reach*7,v,a,4+reach*17,1.5+reach*2);
    if(line.inside)base=line.side<1.3?6:4;}
  }else if(style==='brick'){
   const str=ribbon(u+10-reach*9,v+12-reach*17,Math.PI/2+.14,7+reach*14,2.2+reach*2);
   if(str.inside)base=str.side<1.5?6:5;
  }else {
   const line=ribbon(u+10-reach*12,v,0,7+reach*13,2.1+reach*1.8);
   if(line.inside)base=line.side<1?6:5;
  }
  if(base&&n<.12)base=4;
 }else{
  const decay=1-p,expansion=6+p*27,noise=(n-.5)*1.7;
  if(style==='kick'){
   // Crescent of force sweeping from below, with small directional splinters.
   const rot=Math.atan2(v*.88,u),rad=Math.hypot(u,v*.88);
   const sector=(rot>-.94&&rot<1.07 && u>-8);
   if(sector&&Math.abs(rad-(10+p*11))<4.4*decay+1.0)
    base=Math.abs(rad-(10+p*11))<1.8?6:(spec?5:4);
   const foot=ribbon(u-8,v+5,-.30,9+8*decay,2.0+2.4*decay);
   if(foot.inside&&u<22)base=foot.side<1.6?6:5;
  }else if(style==='karate'){
   // Sharp asymmetric diagonal handblade; no starburst.
   const blad=ribbon(u,v,-.82,19-p*5,3.8*decay+1.0);
   const cut=Math.max(0,1-Math.abs(blad.along)/(19-p*5));
   if(blad.inside&&cut>.04)base=blad.side<Math.max(.85,2.1*decay)?6:(spec?5:4);
   const back=ribbon(u+6*decay,v+5*decay,-.74,16,1.2+decay);
   if(back.inside)base=4;
  }else if(style==='cross'){
   // Twin true X-slashes, with overlapping core.
   for(const angle of [-.79,.79]){
    const l=ribbon(u,v,angle,21-p*7,4.5*decay+1.2);
    if(l.inside)base=l.side<1.5?6:(l.side<3?5:4);
   }
  }else if(style==='brick'){
   // Two jagged fractures over a vertical heavy chop.
   const hammer=ribbon(u-1,v+3,Math.PI*.51,17-p*6,4.0*decay+1.1);
   if(hammer.inside)base=hammer.side<1.4?6:spec?5:4;
   const cut=Math.abs(v - 2*Math.sin(u*.17+seed)-.35*u);
   if(cut<1.4+p*1.2&&Math.abs(u)<20+p*5 && v>0)base=6;
   if(v>8&&Math.abs(v-13-3*Math.sin(u*.2))<1.7&&Math.abs(u)<23)base=4;
  }else if(style==='aura'){
   const disk=disc(u,v,0,0,10*decay+6,11*decay+6);
   if(disk<1)base=disk<.42?6:(disk<.76?5:4);
  }else{
   // Punch: asymmetric stepped white hit-face, not a ball.
   const head=disc(u,v,0,0,13*decay+5,9*decay+3);
   if(head<1)base=head<.55?6:4;
   const edge=ribbon(u-8,v+3,-.27,14,2.8*decay+1);
   if(edge.inside)base=5;
  }
  // Deterministic post-contact chips: anisotropic sharp pixel fragments,
  // timed to shrink as the swing dissipates.
  const pieces=style==='brick'?14:style==='cross'?11:style==='karate'?8:10;
  for(let i=0;i<pieces;i++){
   const a=i*2.399963229728653+seed*.017;
   const radius=11+p*(17+i%4*2.5);
   const px=Math.round(Math.cos(a)*radius),py=Math.round(Math.sin(a)*radius*.77);
   const w=(1.2+(i%3)*.6)*(1-p*.62);
   if(Math.abs(u-px)<w+noise*.11&&Math.abs(v-py)<w*.75)base=spec?6:(i%2?5:4);
  }
  // Fine dark smoke grit is near contact only, mostly on the bottom.
  if(p>.28&&v>6&&Math.abs(u)<28&&n>.955)
   base=8;
 }
 // Subtle hand-authored edge: shadow 1px around every colored stroke.
 return base;
}
function makeAtlas(style,frames){
 const W=72,H=68,dir=palettes[style]||palettes.punch;
 const atlas={frames,tiles:[],hash:0,filled:0,style};
 if(typeof document==='undefined'||typeof document.createElement!=='function'){
  return atlas; // Node tests render fallback, without fake window/document APIs.
 }
 for(let f=0;f<frames;f++){
  const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
  const cg=canvas.getContext('2d',{alpha:true});
  if(!cg){stats.errors.push('Canvas unavailable for '+style);continue;}
  const img=cg.createImageData(W,H);
  const vals=new Uint8Array(W*H),out=img.data;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
   const index=y*W+x,p=pixel(style,x,y,f,frames);
   if(p){vals[index]=p;atlas.filled++;atlas.hash=(Math.imul(atlas.hash,33)+p*17+x+y*7)>>>0;}
  }
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
   const i=y*W+x,p=vals[i];
   if(!p)continue;
   const left=x>0?vals[i-1]:0,right=x<W-1?vals[i+1]:0,
    top=y>0?vals[i-W]:0,bottom=y<H-1?vals[i+W]:0;
   // Ink pixel outline is dark charcoal, never a big cartoon vector stroke.
   const edge=(!left||!right||!top||!bottom)&&p!==8;
   const hex=dir[edge?1:p]||'#151922';
   const k=i*4;out[k]=parseInt(hex.slice(1,3),16);out[k+1]=parseInt(hex.slice(3,5),16);
   out[k+2]=parseInt(hex.slice(5,7),16);out[k+3]=p===8?100:255;
  }
  cg.putImageData(img,0,0);
  atlas.tiles.push(canvas);
 }
 stats.atlases++;stats.frames+=atlas.tiles.length;stats.pixels+=atlas.filled;
 stats.unique.push({style,checksum:atlas.hash,frames,painted:atlas.filled});
 return atlas;
}
function render(g,a,style='punch'){
 const phase=a.frame??Math.floor(C(a.t)*(a.frames||12)),frames=a.frames||PHASES[style]||12;
 const n=Math.min(frames-1,Math.max(0,phase)),key=style+'|'+frames;
 let atlas=cache.get(key);if(!atlas){atlas=makeAtlas(style,frames);cache.set(key,atlas);}
 const x=a.to[0],y=a.to[1],scale=C(a.scale||1,.68,1.35);
 // Graphics localized at the point of physical impact, never between fighters.
 const size=scale*1.24,px=72*size,py=68*size;
 g.save();g.globalAlpha*=a.t>.87?C((1-a.t)/.13):1;
 if(atlas.tiles[n]&&typeof g.drawImage==='function'){
  if('imageSmoothingEnabled'in g)g.imageSmoothingEnabled=false;
  g.drawImage(atlas.tiles[n],Math.round(x-px*.5),Math.round(y-py*.53),Math.round(px),Math.round(py));
 }else{ // Offscreen not available in test canvas only; still a real framed animation.
  stats.fallback++;
  for(let yy=0;yy<68;yy+=2)for(let xx=0;xx<72;xx+=2){
   const p=pixel(style,xx,yy,n,frames);
   if(!p)continue;
   g.fillStyle=(palettes[style]||palettes.punch)[p];
   g.fillRect?.(Math.round(x+(xx-36)*size),Math.round(y+(yy-36)*size),Math.max(1,Math.round(size*2)),Math.max(1,Math.round(size*2)));
  }
 }
 g.restore();
 stats.draws++;stats.perStyle[style]=(stats.perStyle[style]||0)+1;
 stats.last={style,frame:n+1,of:frames,contactAt:a.hit,anchor:'enemy contact'};
}
const generic=(g,a)=>render(g,a,a.style in palettes?a.style:'punch');
return {render,generic,diagnostics:()=>({...stats,unique:stats.unique.slice(),perStyle:{...stats.perStyle},
 palette:'indexed-pixel-art',interpolation:'nearest-neighbor'})};
})();
