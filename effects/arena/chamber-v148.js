/* Pokemon Torre V148 - original stylized 2.5D chamber, inspired by angled
 * blue stone dungeon visuals. Only the cached environmental backdrop is painted
 * by Canvas2D, never attack effects. The gameplay and existing camera are intact.
 * ?arena148=0 -> V147, ?arena148=lava -> volcanic palette, ?safe=1 -> native.
 */
(()=>{
'use strict';
if(typeof BattleEngine!=='function'||!BattleEngine.prototype.generateBackdrop||window.PokemonTorreArenaV148?.installed)return;
const qs=new URLSearchParams(location.search);
const enabled=qs.get('arena148')!=='0'&&qs.get('safe')!=='1'&&qs.get('arena_preview')!=='off'&&qs.get('lighting146')!=='0';
const lava=qs.get('arena148')==='lava';
const original=BattleEngine.prototype.generateBackdrop;
const cache=new Map(),LIMIT=3;
const stats={builds:0,hits:0,failures:0,tiles:0,walls:0,crystals:0,emissiveCracks:0,lastSize:null,lastError:null};
function rng(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296;};}
const r0=rng(14815);const lerp=(a,b,t)=>a+(b-a)*t;
const rgba=(rgb,a)=>`rgba(${rgb},${Math.max(0,Math.min(1,a))})`;
const palette=lava?{
 bg:'#100b16',dark:'#180c13',stone:'#422321',top:'#60382b',front:'#28161c',edge:'#ff9743',spark:'255,115,41',glow:'255,154,59',ice:'#ffba55',line:'#4b2620',tile:'#422a30',wall:'#1f1118',haze:'#30121b'
}:{bg:'#050d23',dark:'#0a1531',stone:'#253966',top:'#52699a',front:'#142446',edge:'#91e8ff',spark:'96,214,255',glow:'122,220,255',ice:'#c8f7ff',line:'#192b55',tile:'#344e81',wall:'#102043',haze:'#0b193b'};
function polygon(g,p,fill,outline=null,width=1){
 g.beginPath();g.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)g.lineTo(p[i][0],p[i][1]);g.closePath();
 if(fill){g.fillStyle=fill;g.fill();}if(outline){g.strokeStyle=outline;g.lineWidth=width;g.stroke();}
}
function stroke(g,p,color,width=2){g.beginPath();g.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)g.lineTo(p[i][0],p[i][1]);g.strokeStyle=color;g.lineWidth=width;g.stroke();}
function glow(g,x,y,radX,radY,rgb,alpha){
 g.save();g.translate(x,y);g.scale(radX,radY);
 const v=g.createRadialGradient(0,0,0,0,0,1);
 v.addColorStop(0,rgba(rgb,alpha));v.addColorStop(.15,rgba(rgb,alpha*.74));v.addColorStop(.50,rgba(rgb,alpha*.20));v.addColorStop(1,rgba(rgb,0));
 g.fillStyle=v;g.fillRect(-1,-1,2,2);g.restore();
}
function feature(g,x,y,size,seed){
 // Varying stone texture is baked; these are parts of environment, not spells.
 const r=rng(seed);g.save();g.translate(x,y);g.rotate((r()-.5)*.3);
 stroke(g,[[-size*.33,0],[-size*.08,-size*.10],[size*.05,0],[size*.36,-size*.035]],rgba(lava?'255,135,76':'138,175,238',.18),1.15);
 if(r()>.58)stroke(g,[[-size*.20,size*.12],[size*.15,size*.10]],rgba('3,10,26',.18),1.25);
 g.restore();
}
function prism(g,x,y,height,size,light){
 // Crystal = physical prism with visible dark and lit facets + shared shadows.
 const ice=light||palette.ice;
 glow(g,x,y-height*.45,size*2.5,height*1.35,palette.glow,.37);
 g.fillStyle='rgba(0,3,15,.35)';g.beginPath();g.ellipse(x+size*.40,y+size*.23,size*.95,size*.30,-.08,0,Math.PI*2);g.fill();
 const tip=[x-size*.03,y-height],left=[x-size*.45,y-height*.52],right=[x+size*.35,y-height*.62];
 const botL=[x-size*.48,y-size*.12],botR=[x+size*.43,y-size*.08];
 polygon(g,[tip,left,botL,[x,y+size*.06]],lava?'#c34b27':'#a1e9ff');
 polygon(g,[tip,[x,y+size*.06],botR,right],lava?'#ad3325':'#407eb1');
 polygon(g,[tip,[x-size*.08,y-height*.60],[x,y+size*.03]],lava?'#ffb64e':'#e9feff');
 stroke(g,[tip,[x+size*.15,y-height*.60],[x+size*.21,y-size*.15]],rgba(palette.glow,.68),1.4);
 stats.crystals++;
}
function perspectiveFloor(g,W,H,top){
 const floorEnd=H-54,pow=1.34,N=19,M=19;
 const row=t=>top+(floorEnd-top)*Math.pow(t,pow);
 const limit=t=>.77+.23*Math.pow(t,.53);
 const lx=(x,t)=>W*.5+(x-W*.5)*limit(t);
 const backY=row(0),leftTop=lx(0,0),rightTop=lx(W,0);
 const floorGrad=g.createLinearGradient(0,top,0,floorEnd);
 floorGrad.addColorStop(0,lava?'#271522':'#192f62');floorGrad.addColorStop(.55,lava?'#47302f':'#334e86');floorGrad.addColorStop(1,lava?'#392526':'#293f71');
 polygon(g,[[leftTop,backY],[rightTop,backY],[W,floorEnd],[0,floorEnd]],floorGrad);
 const rand=rng(145212);
 for(let j=0;j<N;j++)for(let i=0;i<M;i++){
  const t0=j/N,t1=(j+1)/N,x0=W*i/M,x1=W*(i+1)/M;
  const p=[[lx(x0,t0),row(t0)],[lx(x1,t0),row(t0)],[lx(x1,t1),row(t1)],[lx(x0,t1),row(t1)]];
  const tint=(rand()-.5)*17 + (j/N-0.4)*10;
  const R=lava?Math.round(59+tint):Math.round(43+tint*.65);
  const G=lava?Math.round(35+tint*.4):Math.round(64+tint*.70);
  const B=lava?Math.round(39+tint*.35):Math.round(110+tint*.78);
  polygon(g,p,`rgb(${Math.max(5,R)},${Math.max(10,G)},${Math.max(10,B)})`,rgba(lava?'28,13,18':'9,24,59',.48),1.2);
  // Each stone has a lit bevel and a dark contact edge, following perspective.
  stroke(g,[[p[0][0]+1,p[0][1]+1],[p[1][0]-1,p[1][1]+1]],rgba(lava?'183,97,71':'133,160,222',.15),Math.max(.6,.8+j*.027));
  stroke(g,[[p[1][0]-1,p[1][1]+1],[p[2][0]-1,p[2][1]-1]],rgba('4,13,39',.22),1);
  if((i+j*17)%4===0)feature(g,(p[0][0]+p[2][0])/2,(p[0][1]+p[2][1])/2,Math.max(12,(p[2][0]-p[0][0])*.63),i*1371+j*2181+1451);
  stats.tiles++;
 }
 // Ground haze and luminous blue shadow pools feel like stone reflecting crystals.
 const ambience=g.createLinearGradient(0,top,0,floorEnd);
 ambience.addColorStop(0,rgba(lava?'6,2,6':'4,12,36',.27));
 ambience.addColorStop(.38,rgba(lava?'17,4,7':'10,26,56',.04));
 ambience.addColorStop(1,rgba(lava?'11,3,6':'7,11,32',.26));
 g.fillStyle=ambience;g.fillRect(0,top,W,floorEnd-top);
 if(lava){
  // Molten fissures follow tile rows and share a bright emissive center.
  for(let k=0;k<26;k++){
   const j=2+(k*13)%N,i=(k*7)%M,t=(j+.45)/N,x=lx(W*(i+.55)/M,t),y=row(t);
   const p=[[x-22,y-1],[x-12,y+2],[x-4,y-3],[x+7,y+2],[x+22,y-1]];
   glow(g,x,y,63,22,'255,96,29',.35);stroke(g,p,'rgba(255,112,36,.50)',5);
   stroke(g,p,'rgba(255,208,79,.88)',2);
   stats.emissiveCracks++;
  }
 }else{
  for(let k=0;k<43;k++){
   const t=((k*53)%97)/100,x=lx(W*(.10+(k*37%83)/100),t),y=row(t);
   if(y>floorEnd-24||y<top+20)continue;
   const p=[[x-6,y],[x-1,y+3],[x+5,y-1]];
   stroke(g,p,rgba('119,211,255',.19),1.25);
   if(k%5===0)glow(g,x,y,15,9,'111,217,255',.09);
  }
 }
 return{top,floorEnd,row,lx,leftTop,rightTop};
}
function stoneBackWall(g,W,top){
 // Back wall made of blocks with top, face and inset shadow; stairs not a flat stripe.
 const wallH=Math.max(100,top-10),brickW=W/16,brickH=30;
 g.fillStyle=palette.wall;g.fillRect(0,0,W,wallH+4);
 const rand=rng(1487);
 for(let j=0,y=-10;y<wallH;j++,y+=brickH){
  for(let i=-1;i<17;i++){
   const xx=i*brickW+(j%2)*brickW*.5;
   const v=(rand()-.5)*18;
   g.fillStyle=lava?`rgb(${Math.round(43+v)},${Math.round(19+v*.4)},${Math.round(22+v*.3)})`:
     `rgb(${Math.round(19+v*.8)},${Math.round(34+v)},${Math.round(65+v*1.1)})`;
   g.fillRect(xx+1,y+1,brickW-2,brickH-2);
   g.fillStyle=rgba(lava?'199,90,53':'114,149,212',.22);
   g.fillRect(xx+2,y+2,brickW-4,2);
   g.fillStyle=rgba('1,7,24',.27);g.fillRect(xx+2,y+brickH-3,brickW-4,2);
   stats.walls++;
  }
 }
 // Thick wall cap, a top facet receiving sky-blue / volcanic overhead light.
 polygon(g,[[0,top-25],[W,top-25],[W,top-7],[0,top-7]],lava?'#42221e':'#1b3158');
 polygon(g,[[0,top-28],[W,top-28],[W,top-20],[0,top-20]],lava?'#745043':'#405981');
 stroke(g,[[0,top-10],[W,top-10]],rgba(lava?'255,131,65':'105,166,228',.26),2.5);
 // Jagged mineral veins appear embedded in the vertical wall surface.
 for(let k=0;k<11;k++){
  const x=47+k*89,y=22+(k*7)%4*21,p=[[x,y],[x-6,y+13],[x+5,y+21],[x+2,y+32],[x-5,y+45]];
  glow(g,x,y+25,24,39,palette.spark,.15);
  stroke(g,p,rgba(palette.spark,.47),3.6);stroke(g,p,rgba(lava?'255,181,76':'198,244,255',.83),1.4);
  stats.emissiveCracks++;
 }
 // A recessed gate set into the stone wall, not a rectangular colored patch.
 polygon(g,[[W*.43,top-6],[W*.43,top-104],[W*.57,top-104],[W*.57,top-6]],lava?'#0e0a11':'#09132b',rgba(lava?'148,67,37':'76,122,176',.3),5);
 polygon(g,[[W*.445,top-9],[W*.445,top-90],[W*.555,top-90],[W*.555,top-9]],lava?'#2d0f14':'#0c1b3b');
 for(let j=0;j<5;j++){const y=top-83+j*15;
  g.fillStyle=rgba(lava?'240,100,41':'85,164,241',.13);
  g.fillRect(W*.451,y,W*.098,2);
 }
}
function sideWall(g,W,H,floor){
 // Perspective-thickness on both sides. Faceted blocks are geometry, not glow.
 const end=Math.min(H-205,Math.max(floor.top+130,H*.73));
 for(const side of [-1,1]){
  const edge=side<0?0:W,inside=side<0?1:-1;
  const cap=side<0?floor.leftTop:floor.rightTop;
  const xfar=edge+inside*72,xnear=edge+inside*22;
  const pts=[[edge,floor.top-27],[xfar,floor.top+16],[xnear,end],[edge,end+42]];
  polygon(g,pts,lava?'#25141e':'#132347',rgba(lava?'105,51,42':'89,125,182',.3),3);
  polygon(g,[[edge,floor.top-27],[edge+inside*30,floor.top-44],[xfar+inside*13,floor.top],[xfar,floor.top+16]],lava?'#65422e':'#46608a');
  // Brick rows aligned with receding wall: dark lower face, lit top facets.
  for(let i=0;i<12;i++){
   const a=i/12,y0=lerp(floor.top+18,end,a),y1=lerp(floor.top+18,end,(i+1)/12);
   const xx=lerp(xfar,xnear,a),nx=lerp(xfar,xnear,(i+1)/12);
   stroke(g,[[edge,y0],[xx,y0-3]],rgba(lava?'119,60,40':'76,119,178',.36),1.3);
   stroke(g,[[xx,y0],[nx,y1]],rgba('3,10,30',.30),1);
   if(i%3===1){const y=(y0+y1)/2,x=lerp(edge,xx,.75);
     stroke(g,[[x,y-11],[x+inside*4,y-2],[x,y+8]],rgba(palette.spark,.63),2.5);
     glow(g,x,y,26,35,palette.spark,.14);stats.emissiveCracks++;
   }
  }
  // Continuous wall-to-floor shadow, proper directional occlusion.
  const sh=g.createLinearGradient(edge+inside*2,0,edge+inside*130,0);
  sh.addColorStop(0,rgba('2,7,25',.52));sh.addColorStop(1,rgba('2,7,25',0));
  g.fillStyle=sh;g.fillRect(side<0?0:W-130,floor.top,130,end-floor.top+25);
 }
}
function raisedLedge(g,W,top){
 // Three raised rows with actual stone front faces and lit top caps.
 const y=top+4, widths=[W*.86,W*.64,W*.43];
 for(let k=0;k<3;k++){
  const w=widths[k],x=(W-w)/2,dy=k*13,yy=y-29+dy,faceH=22+3*k;
  polygon(g,[[x,yy],[x+w,yy],[x+w-12,yy+faceH],[x+12,yy+faceH]],
   k===0?(lava?'#21141c':'#16294c'):(lava?'#301e23':'#233b63'));
  polygon(g,[[x+11,yy-12],[x+w-11,yy-12],[x+w,yy],[x,yy]],
   k===0?(lava?'#684432':'#4a6592'):(lava?'#52342c':'#3e5781'));
  stroke(g,[[x+12,yy-9],[x+w-12,yy-9]],rgba(lava?'255,164,89':'179,208,255',.27),1.7);
  const n=Math.ceil(w/52);
  for(let i=1;i<n;i++){
   const px=x+i*w/n;
   stroke(g,[[px,yy+1],[px-2,yy+faceH-2]],rgba('1,8,26',.32),1.15);
   if((i+k)%4===0)stroke(g,[[px+2,yy+4],[px-2,yy+10]],rgba(palette.spark,.3),1.3);
  }
 }
 const sh=g.createLinearGradient(0,top+15,0,top+102);
 sh.addColorStop(0,'rgba(2,7,25,.45)');sh.addColorStop(1,'rgba(2,7,25,0)');
 g.fillStyle=sh;g.fillRect(W*.25,top+15,W*.5,85);
}
function chest(g,x,y){
 // Optional original-style 3D prop, recognizable from the video.
 g.save();g.translate(x,y);const w=38,h=23;
 glow(g,0,-17,80,53,palette.spark,.15);
 polygon(g,[[-w*.6,3],[w*.7,3],[w*.92,-h],[0,-h*1.37],[-w,-h]],'#13192b');
 polygon(g,[[-w,-h],[0,-h*1.37],[w*.92,-h],[w*.22,-h*.68]],lava?'#86532b':'#947445');
 polygon(g,[[-w,-h],[w*.22,-h*.68],[w*.26,3],[-w*.6,3]],lava?'#684324':'#554329');
 polygon(g,[[w*.22,-h*.68],[w*.92,-h],[w*.7,3],[w*.26,3]],'#322b22');
 g.fillStyle='#f7c967';g.fillRect(-4,-h*.70,8,8);g.fillRect(-16,-h*.60,11,4);
 g.restore();
}
function build(base,width,height){
 const can=document.createElement('canvas');can.width=width;can.height=height;
 can.complete=true;can.naturalWidth=width;can.naturalHeight=height;
 const g=can.getContext('2d');if(!g)throw Error('2D static backdrop context unavailable');
 const scale=width/960,H=height/scale,W=960;
 g.save();g.setTransform(scale,0,0,scale,0,0);
 // Real V97 geometry and sprites remain available via ?arena148=0. The new
 // chamber replaces visual background ONLY; gameplay positions stay unchanged.
 const bg=g.createLinearGradient(0,0,0,H);
 bg.addColorStop(0,palette.bg);bg.addColorStop(.45,palette.stone);bg.addColorStop(1,palette.dark);
 g.fillStyle=bg;g.fillRect(0,0,W,H);
 const top=Math.min(193,Math.max(138,H*.21));
 stoneBackWall(g,W,top);
 const floor=perspectiveFloor(g,W,H,top);
 sideWall(g,W,H,floor);
 raisedLedge(g,W,top);
 // Light shafts, emissive fissures and floor reflections originate at crystals.
 const gems=[{x:106,y:top+127,s:20,h:77},{x:843,y:top+154,s:25,h:112},
   {x:180,y:Math.min(H-220,top+(H-top)*.58),s:18,h:81},
   {x:789,y:Math.min(H-170,top+(H-top)*.77),s:23,h:102}];
 for(const e of gems){
  glow(g,e.x,e.y-e.h*.38,112,177,palette.glow,.25);
  glow(g,e.x,e.y+28,145,39,palette.glow,.13);
  prism(g,e.x,e.y,e.h,e.s);
 }
 // Recessed fixture light on the floor, with no giant bright circle.
 for(const x of [264,530,716]){
  const y=floor.row((x%7+2)/13);
  glow(g,x,y,93,70,palette.spark,.13);
  stroke(g,[[x-11,y],[x-4,y+4],[x+6,y+1]],rgba(palette.spark,.38),1.2);
 }
 chest(g,340,top+145);
 // Global composition vignette avoids washing out the scene.
 const vign=g.createRadialGradient(W/2,H*.48,W*.12,W/2,H*.48,H*.82);
 vign.addColorStop(0,'rgba(2,6,24,0)');vign.addColorStop(.62,'rgba(3,5,17,.04)');
 vign.addColorStop(1,'rgba(2,5,17,.62)');
 g.fillStyle=vign;g.fillRect(0,0,W,H);
 const groundFog=g.createLinearGradient(0,top,0,H);
 groundFog.addColorStop(0,rgba(lava?'39,8,5':'6,11,39',.13));
 groundFog.addColorStop(.7,rgba(lava?'17,4,6':'5,16,45',0));
 groundFog.addColorStop(1,rgba(lava?'19,6,4':'5,10,31',.31));
 g.fillStyle=groundFog;g.fillRect(0,top,W,H-top);
 g.restore();
 stats.builds++;stats.lastSize={width,height,logicalH:Math.round(H)};
 return can;
}
BattleEngine.prototype.generateBackdrop=function(){
 const result=original.apply(this,arguments);
 if(!enabled||!this.bg||!this.w||!this.h)return result;
 if(this.bg._v148)return result;
 const key=`${Math.round(this.w)}x${Math.round(this.h)}:${lava?'lava':'ice'}`;
 try{
  const prev=cache.get(key);if(prev){this.bg=prev;stats.hits++;return result;}
  const art=build(this.bg,Math.round(this.w),Math.round(this.h));
  art._v148=true;this.bg=art;
  cache.set(key,art);if(cache.size>LIMIT)cache.delete(cache.keys().next().value);
 }catch(e){stats.failures++;stats.lastError=String(e?.message||e);}
 return result;
};
window.PokemonTorreArenaV148=Object.freeze({installed:true,enabled,theme:lava?'lava':'ice',
 mode:'2.5D perspective-projected static stone arena; native physics/camera unchanged',
 baseline:'V97 tiles and V147 fallback preserved behind ?arena148=0',
 diagnostics:()=>({...stats})});
})();
