/* Pokémon Torre V40.1 | Fire VFX hotfix - four isolated move timelines.
   Injected inside the game's original IIFE, AFTER the modular VFX system.
   Uses real fire GIF atlas cells with a cyan/blue palette variant for Moltres.
   Visual-only: no modifications to damage, cooldown or target selection. */
(function(){
'use strict';
const VERSION='40.1';
const normalise=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const names=new Map([
 ['chamasdemoltres','moltres'],['rajadaflamejante','stream'],
 ['chamacircular','circle'],['garradefogo','claw']
]);
const counts={moltres:0,stream:0,circle:0,claw:0};
const events={casts:0,painted:0,lastMove:'',error:''};
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
const mix=(a,b,t)=>a+(b-a)*t;
const TAU=Math.PI*2;
const nameOf=f=>normalise(f&&((f.move&&f.move.name)||f.name));
const kindOf=f=>names.get(nameOf(f));
const source=new Image();
source.decoding='async';
let blue=null;
source.onload=()=>{
 try{
  const cv=document.createElement('canvas');cv.width=source.naturalWidth;cv.height=source.naturalHeight;
  const c=cv.getContext('2d',{willReadFrequently:true});
  c.drawImage(source,0,0);
  const pixels=c.getImageData(0,0,cv.width,cv.height),data=pixels.data;
  for(let i=0;i<data.length;i+=4){
   if(data[i+3]<8)continue;
   const r=data[i],g=data[i+1],b=data[i+2];
   const v=Math.max(r,g,b)/255;
   if(v<.19){data[i]=5;data[i+1]=17;data[i+2]=72;}
   else{
    const bright=clamp((v-.18)/.82);
    data[i]=Math.round(3+bright*135);
    data[i+1]=Math.round(46+bright*203);
    data[i+2]=Math.round(157+bright*98);
   }
  }
  c.putImageData(pixels,0,0);blue=cv;
 }catch(error){events.error='blue palette: '+error.message;}
};
source.onerror=()=>{events.error='Não foi possível carregar o atlas de fogo';};
source.src='effects/moves/fire-original/fire-original-4-atlas.png?v=fire-v40-1';
function sprite(g,id,x,y,w,h,alpha=1,angle=0,isBlue=false){
 const img=isBlue&&blue?blue:source;
 if(!img||!img.width||!img.height||img===source&&!source.naturalWidth)return false;
 g.save();g.translate(x,y);g.rotate(angle);g.globalAlpha=clamp(alpha);g.imageSmoothingEnabled=false;
 g.drawImage(img,(id%8)*96,Math.floor(id/8)*96,96,96,-w/2,-h/2,w,h);
 g.restore();return true;
}
function spark(g,x,y,r,color,alpha=1){
 g.save();g.globalAlpha=clamp(alpha);g.fillStyle=color;g.shadowColor=color;g.shadowBlur=7;
 g.fillRect(Math.round(x-r),Math.round(y-r),Math.max(2,Math.round(r*2)),Math.max(2,Math.round(r*2)));
 g.restore();
}
function glow(g,x,y,r,color,alpha=1){
 const grad=g.createRadialGradient(x,y,0,x,y,Math.max(2,r));
 grad.addColorStop(0,color);grad.addColorStop(1,'rgba(0,0,0,0)');
 g.save();g.globalAlpha=clamp(alpha);g.fillStyle=grad;
 g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.restore();
}
function beam(g,A,B,reach,width,outer,inner,alpha,now){
 if(reach<=0)return;
 const dx=B[0]-A[0],dy=B[1]-A[1],len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
 for(let band=0;band<3;band++){
  g.save();g.strokeStyle=[outer,inner,'#f4ffff'][band];g.globalAlpha=clamp(alpha*(band===0?.52:band===1?.8:.78));
  g.lineWidth=width*[1,.55,.16][band];g.lineJoin='round';g.lineCap='round';
  g.shadowColor=outer;g.shadowBlur=band===0?15:7;
  g.beginPath();
  for(let j=0;j<=18;j++){
   const p=reach*j/18,wave=Math.sin(p*24-now*.016+j*.49)*width*.22*(j/18);
   const x=A[0]+dx*p+nx*wave,y=A[1]+dy*p+ny*wave;
   j?g.lineTo(x,y):g.moveTo(x,y);
  }
  g.stroke();g.restore();
 }
}
function moltres(g,f,t,now,s){
 const A=f.from,B=f.to,reach=ease((t-.09)/.58),a=clamp((1-t)*7),dx=B[0]-A[0],dy=B[1]-A[1],angle=Math.atan2(dy,dx),len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
 glow(g,A[0],A[1],32*s,'#188fff',a*.34);
 beam(g,A,B,reach,19*s,'#003dff','#08caff',a,now);
 for(let j=0;j<32;j++){
  const p=clamp(reach-j*.026),x=mix(A[0],B[0],p),y=mix(A[1],B[1],p);
  const swirl=Math.sin(j*1.7+now*.017)*14*s;
  if(j%2===0)sprite(g,50+(Math.floor(now/75)+j)%12,x+nx*swirl,y+ny*swirl,25*s,30*s,a*.88,angle-Math.PI/2,true);
  if(j%3===0)sprite(g,74,x+nx*(swirl+10),y+ny*(swirl+10),25*s,36*s,a*.88,angle-Math.PI/2,true);
  spark(g,x+nx*swirl*.6,y+ny*swirl*.6,1.5*s,j%3?'#1399ff':'#ddffff',a*.85);
 }
 const hit=ease((t-.56)/.12)*(1-ease((t-.90)/.10));
 if(hit>0){
  glow(g,B[0],B[1],75*s,'#00b9ff',hit*.54);
  sprite(g,37+Math.floor(now/69)%13,B[0],B[1],100*s,102*s,hit*.98,0,true);
  for(let j=0;j<20;j++){const ang=j*TAU/20,rad=(20+39*ease((t-.58)/.38))*s;
   spark(g,B[0]+Math.cos(ang)*rad,B[1]+Math.sin(ang)*rad,2.7*s,j%2?'#76efff':'#0066ff',hit);}
 }
}
function stream(g,f,t,now,s){
 const A=f.from,B=f.to,reach=ease((t-.09)/.24),a=clamp(Math.min(t*12,(1-t)*8));
 const dx=B[0]-A[0],dy=B[1]-A[1],len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len,rot=Math.atan2(dy,dx)-Math.PI/2;
 beam(g,A,B,reach,17*s,'#fa3211','#ffb21e',a*.8,now);
 for(let j=0;j<30;j++){
  const p=clamp(j/29*reach),wiggle=Math.sin(j*2.5+now*.024)*9*s;
  const x=mix(A[0],B[0],p)+nx*wiggle,y=mix(A[1],B[1],p)+ny*wiggle;
  sprite(g,50+((Math.floor(now/65)+j)%12),x,y,28*s,31*s,a*.80,rot);
  if(j%3===0)sprite(g,74,x+nx*8*s,y+ny*8*s,30*s,33*s,a*.78,rot);
  if(j%2===0)spark(g,x+nx*wiggle*.6,y+ny*wiggle*.6,1.8*s,j%3?'#ff5e11':'#fff9ae',a);
 }
 if(t>.24){
  const hit=ease((t-.25)/.22)*(1-ease((t-.90)/.1));
  glow(g,B[0],B[1],55*s,'#ffa41b',hit*.45);
  sprite(g,37+Math.floor(now/75)%13,B[0],B[1],65*s,76*s,hit*.92);
 }
}
function circle(g,f,t,now,s){
 const B=f.to,enter=ease((t-.05)/.17),fade=(1-ease((t-.85)/.15)),a=enter*fade;
 const spin=now*.009;
 glow(g,B[0],B[1],70*s,'#ed4b16',a*.22);
 for(let ring=0;ring<4;ring++){
  const height=(ring-1.4)*18*s,rad=(22+ring*8)*s;
  for(let j=0;j<12;j++){
   const angle=spin*(ring%2?1:-1)+j*TAU/12+ring;
   const x=B[0]+Math.cos(angle)*rad,y=B[1]+height+Math.sin(angle)*rad*.32;
   sprite(g,15+(Math.floor(now/70)+j+ring*3)%11,x,y,(23+ring*2)*s,29*s,a*(.9-ring*.07),angle*.2);
   if(j%2===0)spark(g,x,y,2*s,j%3?'#ff8e0a':'#fff2b2',a);
  }
 }
 sprite(g,14,B[0],B[1]-16*s,72*s,94*s,a*.69);
 const end=ease((t-.72)/.12)*(1-ease((t-.94)/.06));
 if(end>0)sprite(g,37+Math.floor(now/75)%13,B[0],B[1],75*s,78*s,end*.9);
}
function claw(g,f,t,now,s){
 const B=f.to,charge=ease((t-.11)/.3),strike=ease((t-.38)/.12)*(1-ease((t-.76)/.18));
 const dx=B[0]-f.from[0],dy=B[1]-f.from[1],angle=Math.atan2(dy,dx)-Math.PI/2;
 if(t<.46){
  const x=mix(f.from[0],B[0],charge*.76),y=mix(f.from[1],B[1],charge*.76);
  sprite(g,7+Math.floor(now/72)%7,x,y,27*s,31*s,(1-charge*.55)*.86,angle);
 }
 if(strike>.005){
  glow(g,B[0],B[1],58*s,'#ff6321',strike*.40);
  for(let i=0;i<3;i++){
   const offset=(i-1)*14*s,x=B[0]+offset,y=B[1]+offset*.46;
   g.save();g.translate(x,y);g.rotate(-.45);g.globalAlpha=strike;g.lineCap='round';
   g.strokeStyle='#ff4215';g.shadowColor='#ff5c0f';g.shadowBlur=14;g.lineWidth=12*s;
   g.beginPath();g.moveTo(-23*s,-31*s);g.quadraticCurveTo(2*s,0,24*s,30*s);g.stroke();
   g.strokeStyle='#fff4a0';g.lineWidth=4*s;g.stroke();g.restore();
   sprite(g,7+(i+Math.floor(now/75))%7,x+11*s,y,32*s,36*s,strike*.94,angle);
  }
  sprite(g,37+Math.floor(now/85)%13,B[0],B[1],57*s,62*s,strike*.66);
 }
}
function drawEffect(g,f,now,e){
 const k=kindOf(f);if(!k||!g||!Array.isArray(f.from)||!Array.isArray(f.to))return false;
 const t=clamp((now-f.at)/f.duration);if(now<f.at||now>f.at+f.duration)return true;
 const s=clamp((e.h||560)/560,.72,1.24);
 g.save();
 try{
  if(k==='moltres')moltres(g,f,t,now,s);
  else if(k==='stream')stream(g,f,t,now,s);
  else if(k==='circle')circle(g,f,t,now,s);
  else claw(g,f,t,now,s);
  counts[k]++;events.painted++;
 }catch(error){events.error='paint '+k+': '+error.message;console.warn('[Fire V40]',error);}
 finally{g.restore();}
 return true;
}
const priorUse=BattleEngine.prototype.useMove;
BattleEngine.prototype.useMove=function(slot){
 const mon=battle&&battle.active?current():null,move=mon&&Number.isInteger(slot)?skillSet(mon)[slot]:null;
 const k=kindOf(move);
 if(!k)return priorUse.apply(this,arguments);
 const b=battle,energy=b.energy,beforeCd=cooldowns[slot]||0,now=performance.now();
 const result=priorUse.apply(this,arguments);
 const cast=b===battle&&b.active&&(((cooldowns[slot]||0)>now&&(cooldowns[slot]||0)!==beforeCd)||b.energy<energy);
 if(!cast)return result;
 const duration={moltres:1550,stream:1250,circle:1500,claw:1080}[k];
 const fx={move:{name:move.name},battle:b,at:now,end:now+duration,duration,
  from:[this.player.x,this.player.y-this.h*.13],to:[this.enemy.x,this.enemy.y-this.h*.12]};
 this.v40FireFX=this.v40FireFX||[];
 this.v40FireFX.push(fx);this.v40FireFX=this.v40FireFX.slice(-10);
 events.casts++;events.lastMove=move.name;
 return result;
};
// Prevent the legacy generic animation from covering these four new visuals.
// The dedicated canvas layer is painted after all existing layers.
const oldPainter=window.PokemonTorreV360Paint;
window.PokemonTorreV360Paint=function(ctx,fx,now,e){
 if(kindOf(fx))return true;
 return typeof oldPainter==='function'?oldPainter(ctx,fx,now,e):false;
};
const oldDraw=BattleEngine.prototype.draw;
BattleEngine.prototype.draw=function(now){
 const attacks=(this.v40FireFX||[]).filter(f=>f.battle===battle&&now<f.end);
 this.v40FireFX=attacks;
 const strike=attacks.findLast?attacks.findLast(f=>kindOf(f)==='claw'):attacks.filter(f=>kindOf(f)==='claw').pop();
 const p=this.player,q=this.enemy,ox=p&&p.x,oy=p&&p.y;
 if(strike&&p&&q){
  const t=clamp((now-strike.at)/strike.duration);
  const reach=ease((t-.07)/.34)*(1-ease((t-.65)/.23));
  const dx=q.x-ox,dy=q.y-oy,len=Math.hypot(dx,dy)||1,dist=Math.max(0,len-48)*reach;
  p.x=ox+dx/len*dist;p.y=oy+dy/len*dist;
 }
 let out;
 try{out=oldDraw.call(this,now);}
 finally{if(p&&strike){p.x=ox;p.y=oy;}}
 if(!battle||!battle.active||!this.ctx)return out;
 for(const f of attacks)drawEffect(this.ctx,f,now,this);
 return out;
};
function showBuild(){
 document.title='Pokémon Torre V'+VERSION+' · Fogo redesenhado';
 let badge=document.getElementById('ptFireV40Badge');
 if(!badge){
  badge=document.createElement('span');badge.id='ptFireV40Badge';
  badge.style.cssText='position:fixed;left:8px;bottom:8px;z-index:2147483637;padding:4px 6px;border:1px solid #267aa8;border-radius:6px;background:#0d2439e8;color:#8feeff;font:700 10px system-ui;pointer-events:none';
  document.body.appendChild(badge);
 }
 badge.textContent='🔥 FOGO V'+VERSION;
}
showBuild();
window.PokemonTorreFireV40Diagnostics=()=>({version:VERSION,sourceLoaded:!!source.naturalWidth,blueAtlasReady:!!blue,animated:{...counts},...events,queued:(engine&&engine.v40FireFX||[]).length});
})();
