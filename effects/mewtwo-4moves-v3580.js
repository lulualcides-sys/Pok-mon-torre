/* Pokemon Torre V35.80 - quatro golpes animados do Mewtwo
   Inserido no fechamento do IIFE original pelo index.html, sem modificar os 25 fragmentos.
   Os golpes ofensivos usam a fila v359 e o painter existente; Telecinese de status
   usa uma pequena fila exclusiva e o draw do motor. Sem CSS como animação de ataque. */
(function(){
'use strict';
const names=new Set(['psiquico','psychic','confusion','confusao','lancachamas','flamethrower','telecinese','telekinesis']);
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const pick=s=>{const k=norm(s);if(k==='psiquico'||k==='psychic')return'psychic';if(k==='confusion'||k==='confusao')return'confusion';if(k==='lancachamas'||k==='flamethrower')return'flame';if(k==='telecinese'||k==='telekinesis')return'telekinesis';return'';};
const C=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),M=(a,b,t)=>a+(b-a)*t,SM=t=>{t=C(t);return t*t*(3-2*t);};
const TWO=Math.PI*2;
const counts={psychic:0,confusion:0,flame:0,telekinesis:0};
function dot(g,x,y,r,color,alpha=1,glow=0){
 g.save();g.globalAlpha=C(alpha);g.fillStyle=color;if(glow){g.shadowColor=color;g.shadowBlur=glow;}g.beginPath();g.arc(x,y,Math.max(.1,r),0,TWO);g.fill();g.restore();
}
function line(g,pts,color,w,alpha=1,glow=0){
 if(pts.length<2)return;g.save();g.globalAlpha=C(alpha);g.strokeStyle=color;g.lineWidth=w;g.lineCap='round';g.lineJoin='round';if(glow){g.shadowColor=color;g.shadowBlur=glow;}g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();g.restore();
}
function ring(g,x,y,r,color,alpha=.9,w=2,flat=.72,rot=0){
 if(r<=0)return;g.save();g.globalAlpha=C(alpha);g.strokeStyle=color;g.lineWidth=w;g.translate(x,y);g.rotate(rot);g.beginPath();g.ellipse(0,0,r,r*flat,0,0,TWO);g.stroke();g.restore();
}
function glow(g,x,y,r,inner,outer,alpha=1){
 g.save();g.globalAlpha=C(alpha);const grd=g.createRadialGradient(x,y,1,x,y,Math.max(2,r));grd.addColorStop(0,inner);grd.addColorStop(.43,outer);grd.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=grd;g.beginPath();g.arc(x,y,r,0,TWO);g.fill();g.restore();
}
function star(g,x,y,r,color,alpha){
 line(g,[[x-r,y],[x+r,y]],color,1.6,alpha,3);line(g,[[x,y-r],[x,y+r]],color,1.6,alpha,3);dot(g,x,y,r*.26,'#fff',alpha);
}
function stone(g,x,y,r,spin,alpha){
 g.save();g.globalAlpha=C(alpha);g.translate(x,y);g.rotate(spin);g.fillStyle='#3b2859';g.strokeStyle='#d59bff';g.lineWidth=1.5;g.beginPath();g.moveTo(-r*.6,-r*.55);g.lineTo(r*.55,-r);g.lineTo(r*.95,r*.25);g.lineTo(-r*.15,r);g.lineTo(-r,r*.2);g.closePath();g.fill();g.stroke();g.restore();
}
function drawPsychic(g,f,t,now,s){
 const A=f.from,B=f.to,u=SM(C((t-.06)/.68));const x=M(A[0],B[0],u),y=M(A[1],B[1],u);
 const fade=C(Math.min(t*9,(1-t)*6,1)),hit=C((t-.67)/.26),r=(13+8*Math.sin(t*10))*s;
 glow(g,x,y,r*3.2,'#fffbff','#a93bfa',fade*.88);dot(g,x,y,r,'#c655ff',fade,.0);dot(g,x,y,r*.54,'#ffdeff',fade,4);
 for(let i=0;i<4;i++){
  const q=C((t-i*.055)/.70),ox=M(A[0],B[0],SM(q)),oy=M(A[1],B[1],SM(q));
  ring(g,ox,oy,(11+i*3)*s,'#e8a9ff',fade*(.70-i*.11),1.5*s,.46,now*.004+i*.9);
 }
 for(let j=0;j<12;j++){
  const th=j*TWO/12+now*.009,rr=(19+j%3*7)*s;
  dot(g,x+Math.cos(th)*rr,y+Math.sin(th)*rr*.7,(1.5+j%3)*s,j%3?'#fa85f5':'#ffffff',fade*.86,2*s);
 }
 if(hit>0){glow(g,B[0],B[1],(28+hit*25)*s,'#ffebff','#8e39ef',(1-hit)*.8);
  for(let j=0;j<3;j++)ring(g,B[0],B[1],(13+hit*(24+j*14))*s,'#efadff',(1-hit)*(.9-j*.20),2*s,.6,now*.002+j);
  for(let j=0;j<7;j++){const a=j*TWO/7;star(g,B[0]+Math.cos(a)*(14+hit*42)*s,B[1]+Math.sin(a)*(10+hit*34)*s,3.2*s,'#f8d9ff',fade*(1-hit));}}
}
function drawConfusion(g,f,t,now,s){
 const B=f.to,A=f.from,fade=C(Math.min(t*7,(1-t)*5,1)),speed=now*.0055;
 const v=SM(C((t-.04)/.29));
 for(let i=0;i<5;i++){const p=SM(C((t-i*.065)/.46));
  ring(g,M(A[0],B[0],p),M(A[1],B[1],p),(10+i*2)*s,i%2?'#c57dff':'#97a1ff',(1-p*.38)*fade,1.8*s,.55,speed+i*1.3);}
 glow(g,B[0],B[1],(30+v*24)*s,'#ffe7ff','#7934ca',fade*.7);
 for(let j=0;j<4;j++){
  const rad=(17+j*7+Math.sin(speed*2+j)*3)*s;
  ring(g,B[0],B[1],rad,'#f9aaff',fade*(.92-j*.18),2.4*s,.55,speed*(j%2?1:-1)+j);
 }
 for(let j=0;j<15;j++){
  const a=j*TWO/15+speed*(j%2?1:-1),rad=(13+(j%5)*7)*s;
  const x=B[0]+Math.cos(a)*rad,y=B[1]+Math.sin(a)*rad*.63;
  if(j%4===0)star(g,x,y,4*s,'#ffeaff',fade*.83);else dot(g,x,y,2*s,j%2?'#9e7dff':'#ff9eed',fade,.7*s);
 }
 if(t>.42){const p=C((t-.42)/.51);ring(g,B[0],B[1],(20+30*p)*s,'#f6d9ff',(1-p)*.7,2*s,.63,speed);}
}
function drawFlame(g,f,t,now,s,low){
 const A=f.from,B=f.to,fade=C(Math.min(t*10,(1-t)*9,1)),reach=SM(C(t/.35)),dx=B[0]-A[0],dy=B[1]-A[1],len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
 for(let layer=0;layer<3;layer++){
  const color=['#d83f1e','#ff851d','#ffe48d'][layer];
  for(let j=0;j<(low?12:19);j++){
   const q=j/18*reach,noise=Math.sin(q*19-now*.023+j*1.7),wide=(13+Math.sin(q*6)*8)*(1-q*.40)*s;
   const x=A[0]+dx*q+nx*noise*wide*.18,y=A[1]+dy*q+ny*noise*wide*.18;
   const upper=wide*(1-layer*.30),pts=[[x-nx*upper,y-ny*upper],[x+nx*upper,y+ny*upper]];
   line(g,pts,color,(layer===0?13:layer===1?9:4.3)*s,fade,layer===0?4*s:0);
   dot(g,x,y,(layer===0?10:layer===1?7:3.6)*s,color,fade,layer===1?4*s:0);
  }
 }
 for(let i=0;i<(low?16:34);i++){
  const q=((i*.139+now*.0007)%1)*reach,drift=Math.sin(i*17.2+now*.009)*21*s*(q+.1);
  const x=M(A[0],B[0],q)+nx*drift,y=M(A[1],B[1],q)+ny*drift;
  dot(g,x,y,(1.7+i%4)*s,i%3===0?'#fff2b2':i%3===1?'#ffaf37':'#ff512b',fade*(1-q*.32),2*s);
 }
 if(t>.48){const h=C((t-.48)/.24);glow(g,B[0],B[1],(17+h*31)*s,'#fff7ce','#ef6c24',fade*.55);
  for(let i=0;i<7;i++){const a=i*TWO/7+now*.003;dot(g,B[0]+Math.cos(a)*(8+h*24)*s,B[1]+Math.sin(a)*(8+h*18)*s,(3+i%2)*s,'#ffd276',fade*.76,1*s);}}
}
function drawTelekinesis(g,f,t,now,s){
 const B=f.to,fade=C(Math.min(t*8,(1-t)*6,1)),rise=SM(C(t/.70)),pulse=Math.sin(now*.013);
 const x=B[0],y=B[1]-rise*17*s;
 glow(g,x,y,62*s,'#ead2ff','#8636dd',fade*.54);
 for(let i=0;i<5;i++){
  const yy=y+(i-2)*13*s;
  const rad=(24+i*5+Math.sin(now*.011+i)*3)*s;
  ring(g,x,yy,rad,'#e9a5ff',fade*(.9-i*.1),2.1*s,.31,now*.002*(i%2?1:-1));
 }
 for(let j=0;j<11;j++){
  const a=j*2.399+now*.003,rad=(14+(j%4)*12)*s,lev=Math.sin(now*.008+j)*10*s;
  stone(g,x+Math.cos(a)*rad,y+Math.sin(a)*rad*.61+lev,2.4*s+(j%3)*1.2*s,a*.7,fade*(.85-j*.035));
 }
 for(let j=0;j<9;j++){
  const a=j*TWO/9+now*.004,rad=(22+j%3*14)*s;
  if(j%2===0)star(g,x+Math.cos(a)*rad,y+Math.sin(a)*rad*.85,3.1*s,'#ffe8ff',fade*.75);
  else dot(g,x+Math.cos(a)*rad,y+Math.sin(a)*rad*.85,2*s,'#ffafff',fade,1*s);
 }
 if(t>.70){const p=C((t-.70)/.30);ring(g,x,y,(16+p*38)*s,'#f7ddff',fade*(1-p),2.5*s,.50);}
}
function paint(g,f,now,e,k){
 if(!f||!Array.isArray(f.from)||!Array.isArray(f.to)||!g)return false;
 const dur=Math.max(250,f.duration||950),t=C((now-f.at)/dur),s=C((e?.h||420)/430,.62,1.18);
 const low=!!(e?.fps>0&&e.fps<36);
 if(t<0||now<f.at||now>f.at+dur+30)return true;
 g.save();g.imageSmoothingEnabled=false;
 if(k==='psychic')drawPsychic(g,f,t,now,s);
 if(k==='confusion')drawConfusion(g,f,t,now,s);
 if(k==='flame')drawFlame(g,f,t,now,s,low);
 if(k==='telekinesis')drawTelekinesis(g,f,t,now,s);
 g.restore();counts[k]++;return true;
}
// Render de golpes ofensivos: pipeline existente. O retorno true impede duplicação por Canvas/PNG antigos.
const prevPainter=window.PokemonTorreV360Paint;
window.PokemonTorreV360Paint=function(g,f,now,e){
 const k=pick(f?.move?.name||f?.name);if(k)return paint(g,f,now,e,k);
 return typeof prevPainter==='function'?prevPainter(g,f,now,e):false;
};
// Status (sem projétil na fila v359) precisa ser animado mesmo quando não causa dano.
const previousUse=BattleEngine.prototype.useMove;
BattleEngine.prototype.useMove=function(i){
 const mon=battle?.active?current():null,mv=mon&&Number.isInteger(i)?skillSet(mon)?.[i]:null,k=pick(mv?.name);
 const before=this.v359Attacks?.length||0,energy=battle?.energy,oldCd=Number.isInteger(i)?cooldowns[i]:0,when=performance.now();
 const result=previousUse.apply(this,arguments);
 if(!k||!battle?.active)return result;
 const added=(this.v359Attacks||[]).slice(before).some(f=>f?.move?.name===mv.name);
 if(added)return result;
 const accepted=result!==false && (((cooldowns[i]||0)>when&&(cooldowns[i]||0)!==oldCd)||(battle.energy<energy));
 if(!accepted)return result;
 const duration=k==='telekinesis'?1080:k==='confusion'?870:k==='flame'?940:960;
 this.v3580Visuals||=[];
 this.v3580Visuals.push({move:mv,at:when,end:when+duration,duration,from:[this.player.x,this.player.y-this.h*.13],to:[this.enemy.x,this.enemy.y-this.h*.12]});
 this.v3580Visuals=this.v3580Visuals.slice(-8);
 return result;
};
const previousDraw=BattleEngine.prototype.draw;
BattleEngine.prototype.draw=function(now){
 const result=previousDraw.call(this,now);
 if(!battle?.active||!this.ctx){this.v3580Visuals=[];return result;}
 this.v3580Visuals=(this.v3580Visuals||[]).filter(f=>f.end>now);
 for(const fx of this.v3580Visuals){const k=pick(fx.move?.name);if(k)paint(this.ctx,fx,now,this,k);}
 return result;
};
window.PokemonTorreMewtwo4FX=()=>({version:'35.80',animatedMoves:['Psíquico','Confusion','Lança-Chamas','Telecinese'],renderedFrames:{...counts},activeStatus:(engine?.v3580Visuals||[]).length,activeAttacks:(engine?.v359Attacks||[]).filter(f=>!!pick(f?.move?.name)).length});
})();
