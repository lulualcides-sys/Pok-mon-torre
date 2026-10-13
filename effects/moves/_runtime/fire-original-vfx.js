/* Pokemon Torre: fire moves sourced from user's original sprite animations.
 * Four isolated move timelines; NO generated SVG, shape shaders, or CSS VFX.
 * All image pixels copied (transparency extracted) from user-supplied fire GIFs.
 * The silhouette retains a 1px dark rim, imageSmoothingEnabled=false.
 * Approved Tri Attack / Confusion / Psybeam / Psychic Storm / Vine Whip untouched.
 */
const originalFireFX=(()=>{
 'use strict';
 const file='effects/moves/fire-original/fire-original-4-atlas.png?v=fire4v1';
 const image=new Image(); image.decoding='async'; image.src=file;
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
 const names={punhodefogo:'punch',firepunch:'punch',girodefogo:'spin',firespin:'spin',
 explosaodefogo:'explosion',rajadaignea:'blast',fireblast:'blast'};

 const clamp=(x,lo=0,hi=1)=>Math.max(lo,Math.min(hi,x));
 const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
 const lerp=(a,b,t)=>a+(b-a)*t;
 const group={
  punch:{start:0,count:7},
  punchFlame:{start:7,count:7},
  funnel:{start:14,count:1},
  spinRing:{start:15,count:11},
  explosion:{start:26,count:11},
  explosionBurst:{start:37,count:13},
  firebolt:{start:50,count:12},
  fireburst:{start:62,count:12},
  flame:{start:74,count:1}
 };
 const records={};let error=null;
 image.onerror=()=>{error='Original fire atlas could not load';};
 const handles=f=>!!names[norm(f?.move?.name||f?.name)];
 // Preserve the original pixel art: stamp ONE cropped sprite cell,
 // never stretch an image from the player to the target.
 function stamp(ctx,idx,x,y,w,h,alpha=1,angle=0,flip=false){
  if(alpha<=.015||!image.complete||!image.naturalWidth)return false;
  ctx.save();ctx.globalAlpha=clamp(alpha);ctx.imageSmoothingEnabled=false;
  ctx.translate(x,y);ctx.rotate(angle);if(flip)ctx.scale(-1,1);
  ctx.drawImage(image,(idx%8)*96,Math.floor(idx/8)*96,96,96,-w/2,-h/2,w,h);
  ctx.restore();return true;
 }
 const id=(which,frame=0)=>group[which].start+((Math.max(0,Math.floor(frame)))%group[which].count);
 function paint(g,f,now,engine){
  const kind=names[norm(f?.move?.name||f?.name)];
  if(!kind)return false;
  // Claim the complete visual for these four while the PNG finishes loading;
  // otherwise the old generic effect would flash in its place.
  if(!image.complete||!image.naturalWidth)return true;
  if(!g||!Array.isArray(f?.from)||!Array.isArray(f?.to))return true;
  const A=f.from,B=f.to,dx=B[0]-A[0],dy=B[1]-A[1],
    angle=Math.atan2(dy,dx),len=Math.hypot(dx,dy),
    nx=-Math.sin(angle),ny=Math.cos(angle),tau=Math.PI*2,
    t=clamp((now-f.at)/Math.max(350,f.duration||1000)),
    scale=clamp((engine?.h||420)/420,.79,1.10),
    age=Math.max(0,now-f.at), frame=Math.floor(age/85),
    fade=1-ease((t-.90)/.10);
  const draw=(gname,k,x,y,w,h,a=1,theta=0,flip=false)=>stamp(g,id(gname,k),x,y,w*scale,h*scale,a,theta,flip);
  g.save();g.imageSmoothingEnabled=false;
  if(kind==='punch'){
   // Brief ignition at the attacking Pokemon: a FIRE PUNCH hits at close range.
   const ignition=1-ease((t-.28)/.12);
   draw('flame',0,A[0]+nx*9,A[1]+ny*9,30,38,ignition*.87,angle);
   // Compact advancing fire fist: no 500px fire laser.
   const step=ease((t-.19)/.40);
   const show=ease((t-.16)/.12)*(1-ease((t-.72)/.14));
   const x=lerp(A[0],B[0],step),y=lerp(A[1],B[1],step);
   draw('punch',Math.min(5,Math.floor(step*6)),x,y,39,40,show*.95,angle*.16);
   if(step>.38&&step<.95){
    const trail=.17+step*.35;
    draw('punchFlame',Math.min(5,frame%7),lerp(A[0],B[0],trail),lerp(A[1],B[1],trail),19,22,show*.48);
   }
   const hit=ease((t-.50)/.13),out=1-ease((t-.79)/.15);
   if(hit>0){
    draw('punch',Math.min(6,Math.floor(Math.max(0,t-.51)*18)),B[0],B[1],52,52,hit*out*.90,angle*.1);
    draw('punchFlame',Math.min(6,frame%7),B[0]+nx*8,B[1]+ny*6,38,41,hit*out*.74);
   }
  }else if(kind==='spin'){
   // Real FIRE TORNADO plus the artist's animated FIRE RING at the target.
   const enter=ease((t-.04)/.19),exit=1-ease((t-.86)/.13);
   const spinFrame=Math.floor(age/80),pulse=Math.sin(age*.008);
   const height=72+4*pulse;
   draw('funnel',0,B[0],B[1]-height*.23,68,height,enter*exit*.94,0,spinFrame%2===1);
   for(let i=0;i<3;i++){
    const a=tau*i/3+age*.004*(i%2?1:-1),r=22+i*6+Math.sin(age*.011+i)*3;
    const x=B[0]+Math.cos(a)*r,y=B[1]+Math.sin(a)*r*.53;
    draw('spinRing',spinFrame+i*3,x,y,27+i*3,23+i*2,enter*exit*(.68-i*.07),a*.16);
   }
   // Fire spin is persistent, unlike a one-frame blast.
   draw('spinRing',spinFrame+5,B[0],B[1]+19,48,25,enter*exit*.80);
  }else if(kind==='explosion'){
   // Source fire blast grows, fragments and dissipates, frame by frame.
   const prime=ease((t-.08)/.23),boom=ease((t-.26)/.20),
     settle=1-ease((t-.85)/.15);
   if(t<.40)draw('explosion',Math.floor(clamp(t/.41)*3),B[0],B[1],40+26*prime,45+24*prime,prime*.95);
   if(t>.23){
    const anim=clamp((t-.22)/.68),u=anim*12;
    draw('explosionBurst',Math.floor(u),B[0],B[1],73+11*Math.sin(t*17),77+9*Math.sin(t*13),boom*settle*.96);
    draw('explosion',Math.floor(u*.82),B[0]-26,B[1]+7,47,52,boom*settle*.65,Math.sin(age*.007)*.2);
    draw('explosion',Math.floor(u*.78)+2,B[0]+27,B[1]-5,44,50,boom*settle*.61,Math.sin(age*.006)*-.15);
   }
  }else if(kind==='blast'){
   // A rapid BARRAGE of genuine flame projectiles with fiery explosion.
   const fly=ease((t-.13)/.58),head=Math.min(11,Math.floor(fly*12));
   const windup=1-ease((t-.20)/.16);
   draw('flame',0,A[0],A[1],30,36,windup*.92,angle*.4);
   for(let i=0;i<6;i++){
    const u=fly-i*.104;if(u<=0||u>=1.07)continue;
    const p=clamp(u),wobble=Math.sin(age*.015+i*1.8)*4;
    const x=lerp(A[0],B[0],p)+nx*wobble,y=lerp(A[1],B[1],p)+ny*wobble;
    draw('firebolt',Math.max(0,Math.floor((p*7+i*.7)%12)),x,y,26+(i===0?6:0),29,
     fade*(.91-i*.10),angle-Math.PI*.50);
   }
   const impact=ease((t-.60)/.20),out=1-ease((t-.92)/.08);
   if(impact>0){
    draw('fireburst',Math.min(11,Math.floor(clamp((t-.58)/.42)*12)),B[0],B[1],56,60,impact*out*.96);
    draw('explosion',Math.min(10,Math.floor((t-.59)*18)),B[0]+nx*12,B[1]+ny*7,37,40,impact*out*.70);
   }
  }
  g.restore();
  records[kind]=(records[kind]||0)+1;
  return true;
 }
 // Explosão de Fogo exists as a learned move, but wasn't in the catalog's
 // name registry; register only when absent to preserve the combat scheduler.
 if(!pick('Explosão de Fogo')){
  registerMove('fire_original_explosao',['Explosão de Fogo'],()=>{},1300);
 }
 return {paint,handles,diagnostics:()=>({
   version:'fire4v1',source:'fire GIF animations supplied by user',
   loaded:!!image.naturalWidth,frameCount:75,
   attacks:['Punho de Fogo','Giro de Fogo','Explosão de Fogo','Rajada Ígnea'],
   rendered:{...records},error
 })};
})();
window.PokemonTorreFireOriginalFX=()=>originalFireFX.diagnostics();
