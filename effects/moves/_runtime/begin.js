/* Pokemon Torre V35.80 - quatro golpes animados do Mewtwo
   Inserido no fechamento do IIFE original pelo index.html, sem modificar os 25 fragmentos.
   Os golpes ofensivos usam a fila v359 e o painter existente; Telecinese de status
   usa uma pequena fila exclusiva e o draw do motor. Sem CSS como animação de ataque. */
(function(){
'use strict';
// Registro isolado: cada golpe declara seus próprios nomes, duração e animação.
const registry=new Map(),nameToMove=new Map();
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const registerMove=(key,aliases,draw,duration)=>{
 if(registry.has(key)||typeof draw!=='function')throw Error('Golpe duplicado: '+key);
 registry.set(key,{draw,duration});
 for(const alias of aliases){const id=norm(alias);if(nameToMove.has(id))throw Error('Alias de golpe duplicado: '+alias);nameToMove.set(id,key);}
};
const pick=s=>nameToMove.get(norm(s))||'';
const C=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),M=(a,b,t)=>a+(b-a)*t,SM=t=>{t=C(t);return t*t*(3-2*t);};
const TWO=Math.PI*2;
const counts=Object.create(null);
// Reutiliza sprites reais do atlas DS fornecido pelo usuario; desenhos sao fallback dinamico.
const stamp=(g,name,x,y,w,h,rotation,opacity)=>typeof sprite3511==='function'&&sprite3511(g,name,x,y,w,h,rotation,opacity);
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
