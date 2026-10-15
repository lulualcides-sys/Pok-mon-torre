/* Pokémon Torre V96 — Clareira Cinematográfica (arena piloto).
 * Native Canvas2D backdrop, rendered ONCE per resize and cached as a bitmap.
 * Only active with ?arena_preview=cinematic. No changes to Pokemon, moves,
 * physics, collision, props, menu, damage, FPS loop or approved arena skins.
 */
(()=>{
 'use strict';
 if(typeof BattleEngine!=='function'||!BattleEngine.prototype.generateBackdrop)return;
 if(window.PokemonTorreArenaV96?.installed)return;
 const params=new URLSearchParams(location.search);
 const enabled=params.get('arena_preview')==='cinematic';
 const design={version:'96.0',name:'Clareira Cinematográfica de Kanto',
  width:960,height:600,render:'Canvas2D pre-rendered',optIn:enabled};
 const stats={builds:0,draws:0,cacheHits:0,failures:0,lastError:null,
  lastSize:null,lastScene:null,canvasReady:false};
 const backdrops=new Map(),MAX_CACHE=3;
 const PI=Math.PI;
 const randomSeed=seed=>()=>{seed=(Math.imul(1664525,seed)+1013904223)|0;
  return (seed>>>0)/4294967296;};
 const rand=randomSeed(962026);
 const range=(r,a,b)=>a+(b-a)*r();
 const pick=(r,a)=>a[Math.floor(r()*a.length)];
 const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
 function shape(g,pts,fill,outline='#1a3029',thick=2){
  g.beginPath();g.moveTo(...pts[0]);
  for(let i=1;i<pts.length;i++)g.lineTo(...pts[i]);
  g.closePath();g.fillStyle=fill;g.fill();
  if(outline){g.lineWidth=thick;g.strokeStyle=outline;g.stroke();}
 }
 function oval(g,x,y,rx,ry,col){
  g.beginPath();g.ellipse(x,y,rx,ry,0,0,PI*2);
  g.fillStyle=col;g.fill();
 }
 function grass(g,x,y,size,r,color){
  const k=.5+size;g.strokeStyle='#0f2925';g.lineWidth=1.2;
  g.beginPath();g.moveTo(x,y+2);g.lineTo(x-4*k,y-7*k);
  g.moveTo(x,y+2);g.lineTo(x+1*k,y-10*k);
  g.moveTo(x,y+2);g.lineTo(x+6*k,y-6*k);g.stroke();
  g.strokeStyle=color;g.lineWidth=2.1;
  g.beginPath();g.moveTo(x,y);g.lineTo(x-4*k,y-7*k);
  g.moveTo(x,y);g.lineTo(x+k,y-10*k);
  g.moveTo(x,y);g.lineTo(x+6*k,y-6*k);g.stroke();
 }
 function flagstone(g,x,y,w,h,rot=0){
  g.save();g.translate(x,y);g.rotate(rot);
  oval(g,2,5,w*.56,h*.57,'rgba(6,19,20,.30)');
  shape(g,[[-w*.53,0],[-w*.35,-h*.58],[w*.12,-h*.68],
   [w*.52,-h*.31],[w*.44,h*.40],[-w*.28,h*.48]],
   '#697971','#233c3b',2);
  g.strokeStyle='#a1a79b';g.lineWidth=1.5;
  g.beginPath();g.moveTo(-w*.32,-h*.38);g.lineTo(w*.07,-h*.46);
  g.lineTo(w*.30,-h*.27);g.stroke();
  g.restore();
 }
 function flowers(g,x,y,r){
  for(let i=0;i<4;i++){
   const a=i*PI/2;
   oval(g,x+Math.cos(a)*2.8*r,y+Math.sin(a)*2.6*r,
    2.1*r,1.4*r,i%2?'#f4df97':'#efe9cd');
  }
  oval(g,x,y,2.3*r,2.3*r,'#dbb75c');
 }
 function shrub(g,x,y,r,color='#365e42'){
  oval(g,x+3,y+6,r*1.03,r*.42,'rgba(7,19,20,.35)');
  shape(g,[[x-r*.94,y+1],[x-r*.82,y-r*.47],[x-r*.37,y-r*.76],
   [x+r*.04,y-r*.61],[x+r*.48,y-r*.95],[x+r*.88,y-r*.43],
   [x+r*.93,y+1],[x+r*.25,y+r*.22],[x-r*.51,y+r*.21]],
   color,'#172f2c',2.4);
  for(let i=0;i<5;i++){
   const dx=(-.55+i*.27)*r,dy=-r*(.30+(i%2)*.24);
   oval(g,x+dx,y+dy,Math.max(1,r*.13),Math.max(1,r*.055),
    i%2?'#80a66a':'#63916b');
  }
 }
 function pine(g,x,y,r,variant=0){
  // Tall layered pines drawn only in the perimeter, NEVER obscuring attacks.
  oval(g,x+7,y+r*.52,r*.93,r*.31,'rgba(5,14,19,.42)');
  g.fillStyle='#4f4832';g.fillRect(x-r*.11,y-r*.31,r*.22,r*.98);
  g.fillStyle='#8e8052';g.fillRect(x-r*.055,y-r*.21,r*.04,r*.75);
  const palettes=variant%2?
   ['#173c38','#205147','#2d6a51','#54845c']:
   ['#17392f','#245744','#397253','#6d985f'];
  for(let i=0;i<3;i++){
   const k=1.07-i*.18,cy=y+r*.06-i*r*.40;
   const pts=[[x,cy-r*.75*k],
    [x-r*.91*k,cy+r*.23*k],[x-r*.41*k,cy+r*.12*k],
    [x-r*.82*k,cy+r*.49*k],[x+r*.82*k,cy+r*.49*k],
    [x+r*.41*k,cy+r*.12*k],[x+r*.91*k,cy+r*.23*k]];
   shape(g,pts,palettes[i], '#0b2827',2.5);
   g.strokeStyle=palettes[3];g.lineWidth=2;
   g.beginPath();g.moveTo(x-r*.29*k,cy-r*.28*k);
   g.lineTo(x-r*.51*k,cy+r*.06*k);g.stroke();
  }
 }
 function build(width,height){
  const canvas=document.createElement('canvas');
  // Resolution capped at 960x600. One-time raster cost, then a single blit.
  const w=Math.max(300,Math.min(960,Math.round(width)));
  const h=Math.max(240,Math.min(600,Math.round(height)));
  canvas.width=w;canvas.height=h;
  const g=canvas.getContext('2d');
  if(!g)throw Error('Canvas2D indisponível');
  g.save();g.setTransform(w/960,0,0,h/600,0,0);
  const r=randomSeed(962026);
  // Soft, physically coherent dusk light; no full-screen CSS filters.
  const soil=g.createLinearGradient(0,0,870,600);
  soil.addColorStop(0,'#294b3d');
  soil.addColorStop(.31,'#426b4a');
  soil.addColorStop(.70,'#446749');
  soil.addColorStop(1,'#233b32');
  g.fillStyle=soil;g.fillRect(0,0,960,600);
  // Forest floor microtextures: immutable, deterministic after build.
  const grassPal=['#426e4a','#4e7750','#335d48','#53794d','#2b5846'];
  for(let i=0;i<2900;i++){
   const x=range(r,0,960),y=range(r,0,600),sz=range(r,2.2,8.2);
   g.globalAlpha=range(r,.15,.53);g.fillStyle=pick(r,grassPal);
   g.fillRect(Math.round(x),Math.round(y),Math.round(sz),Math.max(1,sz*.40));
  }
  g.globalAlpha=1;
  // Stone edging: not circles behind characters; part of the terrain.
  oval(g,480,354,383,205,'rgba(12,28,24,.39)');
  oval(g,480,344,374,190,'#61745b');
  oval(g,480,341,361,178,'#384f40');
  oval(g,480,336,348,166,'#516447');
  // Main footprint: open, readable fighting field at both Pokémon anchors.
  const floor=g.createLinearGradient(0,170,0,537);
  floor.addColorStop(0,'#8a8664');floor.addColorStop(.46,'#8a805d');
  floor.addColorStop(1,'#63583d');
  g.save();g.beginPath();g.ellipse(480,339,335,159,0,0,PI*2);
  g.clip();g.fillStyle=floor;g.fillRect(120,166,725,365);
  // Earth-colored irregular lighter patches, no intrusive grid.
  for(let i=0;i<830;i++){
   const x=range(r,165,795),y=range(r,185,503),
    dx=(x-480)/335,dy=(y-339)/159;
   if(dx*dx+dy*dy>.95)continue;
   g.globalAlpha=range(r,.11,.39);
   g.fillStyle=pick(r,['#b19e72','#706947','#d0b989','#565941','#817f57']);
   g.fillRect(x,y,range(r,2,13),range(r,1,3.5));
  }
  g.globalAlpha=1;
  // Vegetation only along edge; battle core remains completely readable.
  for(let i=0;i<58;i++){
   const angle=i*PI*2/58+range(r,-.025,.025);
   const x=480+Math.cos(angle)*range(r,334,365),
    y=339+Math.sin(angle)*range(r,163,179);
   grass(g,x,y,range(r,.7,1.45),r,
    pick(r,['#527e50','#3d7247','#699157']));
  }
  g.restore();
  // Irregular stone paving around outer clearing, tiny and subdued.
  for(let i=0;i<45;i++){
   const a=i*PI*2/45+.13,rr=range(r,.94,1.06);
   const x=480+Math.cos(a)*381*rr,y=346+Math.sin(a)*207*rr;
   flagstone(g,x,y,range(r,9,23),range(r,6,13),a*.27);
  }
  // Small cobbles, moss and herb beds near the arena rim.
  for(let i=0;i<105;i++){
   const x=range(r,22,938),y=range(r,65,575),
    dx=(x-480)/335,dy=(y-339)/157;
   if(dx*dx+dy*dy<.79)continue;
   if(r()<.52)grass(g,x,y,range(r,.55,1.2),r,pick(r,grassPal));
   else if(r()<.50)oval(g,x,y,range(r,2,6),range(r,1,3),'#576d53');
   else flowers(g,x,y,range(r,.45,.8));
  }
  // Canopy creates depth without covering fighters' heads.
  for(let i=0;i<13;i++){
   const x=i*79-12+range(r,-18,18);
   pine(g,x,range(r,15,83),range(r,38,61),i);
  }
  // Nearer layered woods restricted to narrow side strips.
  for(let i=0;i<7;i++){
   pine(g,range(r,-42,62),138+i*77,range(r,30,49),i);
   pine(g,range(r,915,1002),135+i*76,range(r,30,49),i+1);
  }
  for(let i=0;i<24;i++){
   const x=i%2?range(r,4,98):range(r,863,954);
   const y=range(r,105,585);
   shrub(g,x,y,range(r,8,20));
  }
  // Sunlight slipping diagonally across foliage; restrained alpha.
  g.save();g.globalAlpha=.085;
  shape(g,[[210,0],[295,0],[593,521],[479,521]],'#fff1c0',null);
  shape(g,[[508,0],[551,0],[804,480],[747,480]],'#e1ffcb',null);
  g.restore();
  // Soft vignette anchored to perimeter, painted ONCE.
  const vignette=g.createRadialGradient(480,290,128,480,300,590);
  vignette.addColorStop(0,'rgba(4,13,20,0)');
  vignette.addColorStop(.62,'rgba(5,14,20,0)');
  vignette.addColorStop(1,'rgba(6,14,20,.66)');
  g.fillStyle=vignette;g.fillRect(0,0,960,600);
  // Keep the old backdrop path unchanged: Canvas exposes Image-like metadata.
  canvas.complete=true;canvas.naturalWidth=w;canvas.naturalHeight=h;
  g.restore();
  stats.builds++;stats.canvasReady=true;
  stats.lastSize={width:w,height:h};stats.lastScene=design.name;
  return canvas;
 }
 function getBackdrop(w,h){
  const key=Math.max(300,Math.min(960,Math.round(w)))+'x'+
   Math.max(240,Math.min(600,Math.round(h)));
  if(backdrops.has(key)){stats.cacheHits++;return backdrops.get(key);}
  const scene=build(w,h);backdrops.set(key,scene);
  if(backdrops.size>MAX_CACHE)backdrops.delete(backdrops.keys().next().value);
  return scene;
 }
 const oldBackdrop=BattleEngine.prototype.generateBackdrop;
 BattleEngine.prototype.generateBackdrop=function(){
  const original=oldBackdrop.apply(this,arguments);
  if(!enabled)return original;
  try{
   this.bg=getBackdrop(this.w,this.h);
   this._cinematicArenaV96=true;
  }catch(e){
   this._cinematicArenaV96=false;
   stats.failures++;stats.lastError=String(e?.message||e);
  }
  return original;
 };
 const oldDraw=BattleEngine.prototype.draw;
 BattleEngine.prototype.draw=function(now){
  if(!enabled)return oldDraw.apply(this,arguments);
  if(!this._cinematicArenaV96){ // gracefully recover a missing canvas
   try{this.bg=getBackdrop(this.w,this.h);this._cinematicArenaV96=true;}
   catch(e){stats.lastError=String(e?.message||e);}
  }
  stats.draws++;
  return oldDraw.apply(this,arguments);
 };
 window.PokemonTorreArenaV96=Object.freeze({
  installed:true,enabled,design,diagnostics:()=>({...stats}),
  mode:'opt-in pilot; original arena remains default'
 });
})();
