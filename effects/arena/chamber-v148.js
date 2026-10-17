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

// V149: second pass of hand-authored pixel-dungeon details, baked ONCE into
// the scene texture. Attack animation, collision, positions and Pixi GPU effects
// never use this 2D drawing context. Blue and lava compositions share geometry.
function polishDepth(g,W,H,top,floor){
 const r=rng(149079),hot=lava,cyan=hot?'255,136,56':'104,217,255';
 const hi=hot?'#ffcc7c':'#cef8ff',face=hot?'#49302a':'#294061';
 const ink=hot?'#160e18':'#09152e';
 const floorEnd=H-54;
 const block=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
 // Reinforce the recessed architecture; paired niches frame the central gate.
 for(const s of [-1,1]){
  const x=W/2+s*180-32;
  polygon(g,[[x-34,top-145],[x+34,top-145],[x+28,top-13],[x-28,top-13]],
   hot?'#27131a':'#101e3d',rgba(cyan,.13),2.5);
  polygon(g,[[x-28,top-146],[x+26,top-146],[x+17,top-133],[x-17,top-133]],
   hot?'#77503d':'#3c5580');
  for(let k=0;k<4;k++){
   const y=top-125+k*25;
   stroke(g,[[x-29,y],[x+28,y]],rgba(cyan,.10+k*.01),1.4);
  }
  // A warm/cool inset lantern, not a detached bright disk.
  glow(g,x,top-85,43,77,cyan,.16);
  block(x-11,top-104,22,32,hot?'#391718':'#163351');
  block(x-8,top-100,16,23,hot?'#e68a42':'#63c4ed');
  block(x-3,top-98,6,20,hi);
  block(x-15,top-107,30,5,hot?'#71503a':'#4a6688');
 }
 // Door arch: dark aperture, stone lintel and one focal crystal.
 polygon(g,[[399,top-10],[399,top-106],[411,top-132],[549,top-132],
            [561,top-106],[561,top-10]],hot?'#2a1720':'#1d3053',
            rgba(cyan,.2),3);
 polygon(g,[[415,top-8],[415,top-101],[427,top-119],[533,top-119],
            [545,top-101],[545,top-8]],hot?'#100c14':'#08162f');
 for(let y=top-88;y<top-12;y+=20)
  stroke(g,[[420,y],[540,y]],rgba(cyan,.13),1.8);
 // Center niche jewel behind the stairs: strongly faceted, small and precise.
 const cx=480,cy=top-31,ht=69;
 glow(g,cx,cy-ht*.46,73,91,cyan,.32);
 polygon(g,[[cx,cy-ht],[cx-20,cy-ht*.51],[cx-18,cy],
            [cx+6,cy+8]],hot?'#ffba5d':'#6fe1ff');
 polygon(g,[[cx,cy-ht],[cx+20,cy-ht*.48],[cx+18,cy],
            [cx+6,cy+8]],hot?'#ac391e':'#338bc0');
 polygon(g,[[cx-4,cy-ht*.85],[cx-7,cy-ht*.27],[cx+4,cy+3]],hi);
 stroke(g,[[cx,cy-ht],[cx+3,cy-ht*.52],[cx+8,cy-2]],rgba(cyan,.95),1.6);
 // Depth over the risers: horizontal highlight + front-face undershadow.
 for(let i=0;i<4;i++){
  const y=top-2+i*17,w=410+i*74,x=(960-w)/2;
  polygon(g,[[x,y],[x+w,y],[x+w-12,y+10],[x+12,y+10]],
   hot?'rgba(25,12,15,.41)':'rgba(7,16,38,.35)');
  stroke(g,[[x+17,y],[x+w-17,y]],rgba(cyan,i===3?.23:.13),1.5);
  stroke(g,[[x+9,y+10],[x+w-9,y+10]],rgba('2,8,23',.52),2.2);
 }
 // Three-dimensional masonry on left/right walls. All blocks face inwards.
 for(const s of [-1,1]){
  for(let i=0;i<8;i++){
   const y=top+12+i*Math.max(24,(H-top)*.080);
   if(y>floorEnd-135)break;
   const x=s<0?22:W-22,dx=s<0?1:-1,w=22+i*1.6;
   polygon(g,[[x,y],[x+dx*w,y-9],[x+dx*w,y+17],[x,y+23]],
    hot?'rgba(89,46,38,.51)':'rgba(49,74,106,.49)');
   stroke(g,[[x,y],[x+dx*w,y-9]],rgba(cyan,.23),1.5);
   stroke(g,[[x+dx*w,y-9],[x+dx*w,y+17]],rgba('3,11,31',.5),2);
  }
 }
 // Dense yet subtle wear: sharp pixel chips, bevels, wet tile glints.
 for(let k=0;k<630;k++){
  const t=.055+r()*.88;
  const yy=floor.row(t),xx=floor.lx(30+r()*900,t);
  if(yy<top+70||yy>floorEnd-22)continue;
  const w=.7+r()*2.6,h=.5+r()*1.6;
  block(Math.round(xx),Math.round(yy),w,h,r()<.57?
    (hot?'rgba(224,130,80,.18)':'rgba(157,204,238,.19)'):
    'rgba(1,8,23,.15)');
 }
 // Emissive stone seams. Short, branching fragments with a hot core.
 const cracks=hot?49:24;
 for(let k=0;k<cracks;k++){
  const t=.22+r()*.72,yy=floor.row(t);
  if(yy>floorEnd-14)continue;
  const xx=floor.lx(50+r()*860,t);
  const a=(r()-.5)*.55,span=10+r()*35;
  const nodes=[[xx-span*.6,yy-1],[xx-span*.22,yy-4+a*4],
   [xx+span*.13,yy+2-a*4],[xx+span*.58,yy-3]];
  stroke(g,nodes,rgba(cyan,hot?.24:.10),hot?7:5);
  stroke(g,nodes,rgba(cyan,hot?.62:.32),hot?2.8:1.9);
  stroke(g,nodes,rgba(hot?'255,230,155':'207,249,255',hot?.90:.51),.75);
  if(k%4===0)glow(g,xx,yy,span,14,cyan,hot?.16:.055);
  stats.emissiveCracks++;
 }
 // Four stone pedestals visually anchor the V148 crystal sculptures.
 const pedestals=[
  [105,top+143,50],[842,top+165,59],
  [180,Math.min(H-220,top+(H-top)*.58)+11,46],
  [788,Math.min(H-170,top+(H-top)*.77)+12,52]
 ];
 for(const [x,y,w] of pedestals){
  const h=w*.34;
  glow(g,x,y+18,w*2.7,39,cyan,.055);
  polygon(g,[[x-w*.68,y],[x+w*.70,y],[x+w*.62,y+h],
    [x-w*.56,y+h]],ink);
  polygon(g,[[x-w*.70,y-8],[x+w*.59,y-8],[x+w*.76,y+2],
    [x-w*.56,y+2]],hot?'#664636':'#395477');
  stroke(g,[[x-w*.51,y-5],[x+w*.49,y-5]],rgba(cyan,.32),1.6);
  // The small stones cast contact shadows across adjacent grout.
  g.fillStyle='rgba(0,5,18,.23)';g.beginPath();
  g.ellipse(x+12,y+h+12,w*.95,11,-.07,0,Math.PI*2);g.fill();
 }
 // Faceted shards along walls, never on top of the action center.
 function shard(x,y,size){
  const shade=hot?'#bd4d27':'#4387aa';
  glow(g,x,y-size*.70,size*1.6,size*2.1,cyan,hot?.19:.12);
  polygon(g,[[x,y-size*2],[x-size*.36,y-size],
    [x-size*.27,y],[x+size*.18,y+4]],hot?'#ffbb65':'#a0eeff');
  polygon(g,[[x,y-size*2],[x+size*.36,y-size*.95],
    [x+size*.27,y],[x+size*.18,y+4]],shade);
  stroke(g,[[x,y-size*1.85],[x+1,y-size*.47]],rgba(cyan,.84),1.4);
 }
 shard(105,top+122,17);shard(842,top+142,20);
 shard(180,Math.min(H-220,top+(H-top)*.58)-2,15);
 shard(788,Math.min(H-170,top+(H-top)*.77)-4,18);
 // Real rubble: sharp contact shadows and dark faceted sides, mostly edges.
 const stones=[[71,.44,19],[902,.52,23],[116,.82,21],[860,.84,17],
               [245,.70,13],[700,.91,16],[764,.58,12],[291,.49,10],
               [627,.63,12],[370,.95,13]];
 for(const [x,f,s] of stones){
  const y=top+(floorEnd-top)*f;
  g.fillStyle='rgba(0,5,17,.37)';g.beginPath();
  g.ellipse(x+8,y+7,s*1.7,s*.40,-.12,0,Math.PI*2);g.fill();
  polygon(g,[[x-s,y],[x-s*.52,y-s*.85],[x+s*.27,y-s*.96],
   [x+s,y-s*.25],[x+s*.82,y+s*.34],[x-s*.9,y+s*.20]],face);
  polygon(g,[[x-s,y],[x-s*.52,y-s*.85],[x+s*.27,y-s*.96],[x,y-s*.36]],
   hot?'#6e5548':'#516b8a');
  polygon(g,[[x,y-s*.36],[x+s*.27,y-s*.96],[x+s,y-s*.25],
   [x+s*.82,y+s*.34]],hot?'#281923':'#132640');
  stroke(g,[[x-s*.52,y-s*.85],[x+s*.27,y-s*.96]],rgba(cyan,.17),1.3);
 }
 // Cool blue wet reflections / fiery mineral spill on visible foreground.
 for(const spot of [[131,top+246,78,13],[807,top+318,95,18],
    [206,H*.76,72,15],[742,H*.81,80,18]]){
  const [x,y,w,h]=spot;if(y>floorEnd-35)continue;
  glow(g,x,y,w,h,cyan,hot?.16:.15);
  for(let j=0;j<5;j++){
   const sx=x+(j-2)*w*.19,sy=y+(j%2)*2;
   stroke(g,[[sx-w*.045,sy],[sx+w*.065,sy]],rgba(cyan,.27-j*.026),.9);
  }
 }
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
 chest(g,469,top+157);
 polishDepth(g,W,H,top,floor);
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
window.PokemonTorreArenaV148=Object.freeze({installed:true,enabled,version:'149.0',theme:lava?'lava':'ice',
 mode:'V149 enhanced pixel-stone dungeon; native physics/camera unchanged',
 baseline:'V97 tiles and V147 fallback preserved behind ?arena148=0',
 diagnostics:()=>({...stats})});
})();
