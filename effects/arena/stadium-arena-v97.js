/* V97: arena inspirada na geometria do vídeo enviado (estádio tecnológico).
 * Prévia dentro da batalha. Apenas ?arena_preview=cinematic.
 * Chão azul de ladrilhos, paredes com chanfro, escadaria vermelha,
 * emblemas metálicos dourados e marcas discretas de combate.
 * NENHUM círculo gigante, árvores ou gramado. Não altera mecânica.
 */
(()=>{
'use strict';
if(typeof BattleEngine!=='function'||!BattleEngine.prototype.generateBackdrop)return;
if(window.PokemonTorreArenaV97?.installed)return;
const on=new URLSearchParams(location.search).get('arena_preview')==='cinematic';
const design=Object.freeze({version:'97.0',name:'Estádio Tecnológico Kanto',
 reference:'estádio azul-claro de piso quadriculado visto de cima',
 style:'pixel art 2D; piso livre; escadaria vermelha; metal/azul/roxo',
 preview:on});
const stats={builds:0,draws:0,cacheHits:0,failures:0,tiles:0,
 emblems:0,treeShapes:0,lastSize:null,error:null};
const cache=new Map(),LIMIT=3,TAU=Math.PI*2;
const srand=n=>()=>{n=(Math.imul(1664525,n)+1013904223)|0;
 return (n>>>0)/4294967296;};
const rng=srand(97502);
const between=(r,a,b)=>a+(b-a)*r();
const poly=(g,points,fill,stroke='#354754',line=3)=>{
 g.beginPath();g.moveTo(...points[0]);
 for(let i=1;i<points.length;i++)g.lineTo(...points[i]);
 g.closePath();if(fill){g.fillStyle=fill;g.fill();}
 if(stroke){g.lineWidth=line;g.strokeStyle=stroke;g.stroke();}
};
const circle=(g,x,y,r,fill,stroke,sw=2)=>{
 g.beginPath();g.arc(x,y,r,0,TAU);
 if(fill){g.fillStyle=fill;g.fill();}
 if(stroke){g.lineWidth=sw;g.strokeStyle=stroke;g.stroke();}
};
const rounded=(g,x,y,w,h,r,color)=>{
 if(typeof g.roundRect!=='function'){g.fillStyle=color;g.fillRect(x,y,w,h);return;}
 g.beginPath();g.roundRect(x,y,w,h,r);g.fillStyle=color;g.fill();
};
function tileFloor(g,H,r){
 // Every square is sized in SAME logical units on both axes.
 // Flat cyan ceramics, metallic grout, worn/gritty pixels, no fake oval pit.
 const pitch=64;
 g.fillStyle='#8fc8ce';g.fillRect(0,0,960,H);
 for(let y=-32;y<H+pitch;y+=pitch){
  for(let x=-32;x<960+pitch;x+=pitch){
   const tint=Math.floor(between(r,0,4)),palette=['#a9dfe1','#a2d7d9','#a6dbdc','#9cced0'];
   g.fillStyle=palette[tint];g.fillRect(x+2,y+2,pitch-3,pitch-3);
   g.fillStyle='rgba(218,251,249,.26)';g.fillRect(x+3,y+3,pitch-6,3);
   g.fillStyle='rgba(25,77,91,.08)';g.fillRect(x+pitch-3,y+4,2,pitch-6);
   stats.tiles++;
  }
 }
 // Floor is heavily stylized but understated, and never an empty flat fill.
 for(let i=0;i<2600;i++){
  const x=between(r,23,937),y=between(r,130,H-55);
  const v=r();
  g.globalAlpha=between(r,.06,.22);
  g.fillStyle=v<.55?'#56878c':v<.75?'#f4ffff':'#607d7f';
  g.fillRect(Math.round(x),Math.round(y),between(r,1,6),between(r,1,3));
 }
 g.globalAlpha=1;
}
function stain(g,x,y,radius,r){
 const count=22+Math.round(radius*.64);
 for(let i=0;i<count;i++){
  const a=between(r,0,TAU),f=Math.sqrt(r());
  const px=x+Math.cos(a)*radius*f,py=y+Math.sin(a)*radius*f*.69;
  g.fillStyle=i%3===0?'rgba(57,73,76,.22)':'rgba(78,96,92,.15)';
  g.fillRect(Math.round(px),Math.round(py),
   Math.round(between(r,2,7)),Math.round(between(r,1,5)));
 }
}
function crack(g,x,y,len,r){
 // Small persistent environmental battle scuffs; no enormous impact decals.
 const seg=7,rot=between(r,0,TAU),dx=Math.cos(rot),dy=Math.sin(rot);
 g.strokeStyle='rgba(56,79,81,.32)';g.lineWidth=1.5;
 g.beginPath();g.moveTo(x,y);
 for(let i=1;i<=seg;i++){
  const q=i/seg;
  g.lineTo(x+dx*len*q+Math.sin(q*21)*4,
   y+dy*len*q+Math.cos(q*17)*3);
 }g.stroke();
 g.strokeStyle='rgba(241,255,255,.24)';g.lineWidth=1;
 g.beginPath();g.moveTo(x+3,y+3);
 g.lineTo(x+dx*len*.6+4,y+dy*len*.6+3);g.stroke();
}
function seal(g,x,y,r){
 // Two understated Poké-ball-like bronze floor seals; NOT arena rings.
 g.save();g.translate(x,y);
 circle(g,2,5,r+4,'rgba(24,36,46,.16)');
 circle(g,0,0,r+3,'#3f5056','#202d39',3);
 circle(g,0,0,r,'#bd9556','#3f3631',4);
 circle(g,0,0,r-6,'#e2c785','#705530',3);
 let grad=g.createLinearGradient(0,-r,0,r);
 grad.addColorStop(0,'#dcc387');grad.addColorStop(.45,'#efdba5');
 grad.addColorStop(.46,'#a98752');grad.addColorStop(1,'#a47a41');
 circle(g,0,0,r-10,grad,'#8a6d42',1);
 g.save();g.beginPath();g.arc(0,0,r-12,0,TAU);g.clip();
 g.fillStyle='#364451';g.fillRect(-r,-5,r*2,11);
 g.restore();
 circle(g,0,0,r*.23,'#3b515e','#e6d7ac',5);
 circle(g,0,0,r*.14,'#bcf1f3','#586e72',2);
 // Eight detached gold pieces, deliberately floor-only.
 for(let i=0;i<8;i++){
  const a=i*TAU/8,rr=r+11,c=Math.cos(a),s=Math.sin(a);
  g.save();g.translate(c*rr,s*rr);g.rotate(a+Math.PI/2);
  rounded(g,-r*.19,-2,r*.38,5,1,'#f2d48d');
  g.strokeStyle='#76532b';g.lineWidth=1.5;g.strokeRect(-r*.19,-2,r*.38,5);
  g.restore();
 }
 g.restore();stats.emblems++;
}
function angledRoom(g,H){
 // Geometric fencing, octagonal bevels visible at bottom of video.
 const bottom=H-57,shoulder=H-158;
 const frame=[[0,155],[78,103],[882,103],[960,155],
  [960,shoulder],[837,bottom],[124,bottom],[0,shoulder]];
 // Gray walls with pale inner bevel and dark outside shadow.
 poly(g,frame,null,'#283b4c',22);
 poly(g,frame,null,'#e1e4e0',13);
 poly(g,frame,null,'#8a9ba1',3.5);
 // Side walls and blue structural rails.
 for(const side of [0,1]){
  const x=side===0?0:934;
  g.fillStyle='#24466e';g.fillRect(x,200,26,H*.55);
  g.fillStyle='#5a88ac';g.fillRect(x+(side?3:19),205,4,H*.55-10);
  for(let y=230;y<shoulder-8;y+=160){
   g.fillStyle='#32465b';g.fillRect(x,y,26,12);
   g.fillStyle='#74a9ca';g.fillRect(x,y+1,26,2);
  }
 }
}
function topStructures(g,H){
 const y0=0;
 // Architectural back wall remains visible just below HP overlay.
 const wall=g.createLinearGradient(0,0,0,200);
 wall.addColorStop(0,'#273344');wall.addColorStop(1,'#a5adb2');
 g.fillStyle=wall;g.fillRect(0,y0,960,167);
 g.fillStyle='#273953';g.fillRect(0,0,960,18);
 g.fillStyle='#73588a';g.fillRect(0,17,960,23);
 g.fillStyle='#41364f';g.fillRect(0,38,960,8);
 for(let i=0;i<9;i++){
  g.fillStyle=i%2?'#89969b':'#b5bab7';
  g.fillRect(i*114+6,53,98,68);
  g.fillStyle='#485b6b';g.fillRect(i*114+15,90,65,6);
  g.fillStyle='#627184';g.fillRect(i*114+28,105,50,3);
 }
 // Central red staircase / entry, backed by silver landing.
 g.fillStyle='#273344';g.fillRect(381,29,198,159);
 g.fillStyle='#e3e4df';g.fillRect(397,29,165,159);
 g.fillStyle='#aab9bd';g.fillRect(408,29,143,159);
 for(let i=0;i<7;i++){
  const y=28+i*20;
  g.fillStyle=i%2?'#b7c4c5':'#d8dcdd';
  g.fillRect(402,y,158,15);
  g.fillStyle='#82969e';g.fillRect(402,y+15,158,5);
 }
 g.fillStyle='#c72230';g.fillRect(458,25,62,163);
 for(let i=0;i<7;i++){
  g.fillStyle=i%2?'#e74443':'#8e1d2b';g.fillRect(460,33+i*22,57,4);
 }
 g.fillStyle='#f1e6c1';g.fillRect(454,25,4,163);
 g.fillRect(521,25,4,163);
 // Cool purple frames at top right, royal blue at top left.
 poly(g,[[820,0],[960,0],[960,135],[922,108]],'#715995','#2b3048',3);
 poly(g,[[0,0],[107,0],[55,111],[0,148]],'#325b87','#233749',3);
}
function bottomGate(g,H){
 const shoulder=H-158;
 const metal=g.createLinearGradient(0,H-178,0,H);
 metal.addColorStop(0,'#d3d6d6');metal.addColorStop(.5,'#7c8f9e');
 metal.addColorStop(1,'#424d69');
 poly(g,[[0,shoulder],[125,H-58],[835,H-58],[960,shoulder],
  [960,H],[0,H]],metal,'#27384a',4);
 poly(g,[[4,shoulder+9],[129,H-53],[830,H-53],[957,shoulder+9]],
  null,'#eaf0ee',3);
 for(let i=0;i<2;i++){
  const x=i===0?105:653;
  g.fillStyle='#17274b';g.fillRect(x,H-42,208,24);
  g.fillStyle='#18518c';g.fillRect(x+8,H-35,190,12);
  for(let j=0;j<7;j++){g.fillStyle='#5488c8';g.fillRect(x+10+j*28,H-32,16,3);}
  g.strokeStyle='#aebfc4';g.lineWidth=3;g.strokeRect(x,H-42,208,24);
 }
 const x=442;
 g.fillStyle='#64512b';g.fillRect(x,H-64,77,64);
 g.fillStyle='#c5a665';g.fillRect(x+5,H-61,67,61);
 g.fillStyle='#d8bd77';g.fillRect(x+9,H-57,59,50);
 g.fillStyle='#8b7943';g.fillRect(x+22,H-23,30,23);
}
function lamp(g,x,y){
 // Camera-facing compact corner lamp; no exaggerated sun effect.
 g.save();g.translate(x,y);
 g.fillStyle='rgba(18,35,38,.27)';g.fillRect(-22,21,45,9);
 g.fillStyle='#293547';g.fillRect(-11,2,21,30);
 g.fillStyle='#8a93a1';g.fillRect(-10,6,3,18);
 g.fillStyle='#b7ac7b';g.fillRect(-14,-10,28,14);
 g.fillStyle='#f6df9e';g.fillRect(-10,-13,20,8);
 const halo=g.createRadialGradient(0,-14,2,0,-14,35);
 halo.addColorStop(0,'rgba(255,245,187,.38)');
 halo.addColorStop(1,'rgba(255,245,187,0)');
 g.fillStyle=halo;g.fillRect(-40,-52,80,78);
 g.fillStyle='#fbf6c4';g.fillRect(-7,-20,14,9);
 g.restore();
}
function makeBackdrop(width,height){
 // Draw at native pixel resolution, with a 960-unit width coordinate system.
 // On portrait phones, logical height expands; tiles remain square.
 const W=Math.max(300,Math.min(960,Math.round(width))),
  D=Math.max(240,Math.min(1280,Math.round(height)));
 const canvas=document.createElement('canvas');
 canvas.width=W;canvas.height=D;canvas.complete=true;
 canvas.naturalWidth=W;canvas.naturalHeight=D;
 const g=canvas.getContext('2d');if(!g)throw Error('Canvas2D unavailable');
 const zoom=W/960,H=D/zoom;
 const r=srand(970052);
 g.save();g.setTransform(zoom,0,0,zoom,0,0);
 const base=g.createLinearGradient(0,0,0,H);
 base.addColorStop(0,'#1c2941');base.addColorStop(.6,'#47687a');
 base.addColorStop(1,'#212e49');
 g.fillStyle=base;g.fillRect(0,0,960,H);
 tileFloor(g,H,r);
 // Subtle grid remains correct in portrait and landscape.
 for(let i=0;i<25;i++){
  const x=between(r,35,922),y=between(r,178,H-120);
  stain(g,x,y,between(r,7,38),r);
 }
 for(let i=0;i<26;i++){
  const x=between(r,40,922),y=between(r,189,H-105);
  crack(g,x,y,between(r,14,53),r);
 }
 // One or two gold medallions, NOT a single huge arena outline.
 const emblemRadius=47;
 seal(g,266,H*.30,emblemRadius);
 if(H>730)seal(g,716,H*.72,emblemRadius*.85);
 // Trim and stage landmarks layered above the tiled floor.
 topStructures(g,H);
 bottomGate(g,H);
 angledRoom(g,H);
 lamp(g,110,192);
 lamp(g,851,H-142);
 // Mild cinematic glaze/contrast; screen center remains legible.
 const light=g.createLinearGradient(0,160,800,H);
 light.addColorStop(0,'rgba(238,255,253,.12)');
 light.addColorStop(.5,'rgba(135,202,221,0)');
 light.addColorStop(1,'rgba(25,43,73,.10)');
 g.fillStyle=light;g.fillRect(0,140,960,H-150);
 const corners=g.createRadialGradient(480,H*.54,180,480,H*.54,H*.9);
 corners.addColorStop(0,'rgba(10,19,33,0)');
 corners.addColorStop(.82,'rgba(13,23,43,.03)');
 corners.addColorStop(1,'rgba(10,17,31,.30)');
 g.fillStyle=corners;g.fillRect(0,0,960,H);
 g.restore();
 stats.builds++;stats.lastSize={W,D,logicalHeight:Math.round(H)};
 return canvas;
}
function fromCache(w,h){
 const key=Math.max(300,Math.min(960,Math.round(w)))+'x'+
  Math.max(240,Math.min(1280,Math.round(h)));
 if(cache.has(key)){stats.cacheHits++;return cache.get(key);}
 const can=makeBackdrop(w,h);cache.set(key,can);
 if(cache.size>LIMIT)cache.delete(cache.keys().next().value);
 return can;
}
const orig=BattleEngine.prototype.generateBackdrop;
BattleEngine.prototype.generateBackdrop=function(){
 const result=orig.apply(this,arguments);
 if(!on)return result;
 try{
  this.bg=fromCache(this.w,this.h);
  this._stadiumV97=true;
 }catch(e){stats.failures++;stats.error=String(e?.message||e);}
 return result;
};
const draw=BattleEngine.prototype.draw;
BattleEngine.prototype.draw=function(now){
 if(on&&this._stadiumV97){stats.draws++;}
 return draw.apply(this,arguments);
};
window.PokemonTorreArenaV97=Object.freeze({
 installed:true,enabled:on,design,
 diagnostics:()=>({...stats}),
 description:'Arena jogável de referência, sem alterações em golpes/Pokémon'
});
})();