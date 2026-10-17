/* Pokemon Torre V151 — PokéSouls video-directed dungeon composition.
 * Visual reconstruction based on the user-supplied video (blue + lava stages).
 * Baked ONCE at native world size, then drawn by the existing battle engine.
 * Zero extra canvas instances per frame, no change to actors, physics or VFX.
 * ?arena151=0 restores V150; ?arena148=0 restores original V147.
 */
(()=>{
'use strict';
if(typeof BattleEngine!=='function'||!BattleEngine.prototype.generateBackdrop||window.PokemonTorreArenaV151?.installed)return;
const query=new URLSearchParams(location.search);
const enabled=query.get('arena151')!=='0'&&query.get('arena148')!=='0'&&query.get('safe')!=='1'&&query.get('lighting146')!=='0'&&query.get('arena_preview')!=='off';
const lava=query.get('arena148')==='lava';
const C=lava?{
back:'#240c0a',mortar:'#270e0b',base:'#521a11',tile:['#572018','#4c180f','#541b12','#4d180f','#5d2217','#49170f','#591c12'],
top:'#6d2b1c',edge:'#f7952c',core:'#ffe07a',side:'#230d0a',deep:'#120707',gem:'#ffa848',ice:'#fff0ac',
blue:'255,116,32',white:'255,231,148',wall:'#39130d'
}:{
back:'#0b1a38',mortar:'#14274b',base:'#284791',tile:['#284791','#254388','#2c4c94','#223e82','#294993','#25458d','#2c4b93'],
top:'#36558a',edge:'#70c7fb',core:'#ecfcff',side:'#111d3a',deep:'#08132b',gem:'#93eaff',ice:'#d7f9ff',
blue:'111,204,255',white:'229,251,255',wall:'#152a4e'};
const native=BattleEngine.prototype.generateBackdrop,store=new Map(),MAX=3;
const diag={builds:0,hits:0,failures:0,tiles:0,masonry:0,cracks:0,props:0,bevels:0,motes:0,theme:lava?'lava':'blue',lastError:null};
const R=(seed)=>()=>((seed=Math.imul(seed,1664525)+1013904223|0)>>>0)/4294967296;
const rgba=(rgb,a)=>'rgba('+rgb+','+Math.max(0,Math.min(1,a))+')';
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const path=(g,pts,fill,stroke,width=1)=>{
 g.beginPath();g.moveTo(pts[0][0],pts[0][1]);
 for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);
 g.closePath();if(fill){g.fillStyle=fill;g.fill();}
 if(stroke){g.strokeStyle=stroke;g.lineWidth=width;g.stroke();}
};
const line=(g,pts,color,w=1)=>{
 g.beginPath();g.moveTo(pts[0][0],pts[0][1]);
 for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);
 g.strokeStyle=color;g.lineWidth=w;g.stroke();
};
const light=(g,x,y,rx,ry,color,alpha)=>{
 g.save();g.translate(x,y);g.scale(rx,ry);
 const f=g.createRadialGradient(0,0,0,0,0,1);
 f.addColorStop(0,rgba(color,alpha));
 f.addColorStop(.27,rgba(color,alpha*.52));
 f.addColorStop(.70,rgba(color,alpha*.095));
 f.addColorStop(1,rgba(color,0));
 g.fillStyle=f;g.fillRect(-1,-1,2,2);g.restore();
};
function bricks(g,W,top){
 // Original video: massive flat back wall spanning 22% of the arena height,
 // horizontal stone courses and electric zigzag veins embedded in its joints.
 const r=R(15111),bh=31,bw=71;
 g.fillStyle=C.wall;g.fillRect(0,0,W,top+7);
 for(let j=-1,y=-14;y<top;j++,y+=bh){
  for(let i=-1;i<16;i++){
   const x=i*bw+(j%2)*bw*.5;
   const variation=Math.round(r()*15);
   const col=lava?['#35110a','#3d150d','#43180f','#38120c'][Math.floor(r()*4)]:
    ['#16294b','#1c3156','#21375f','#182e51'][Math.floor(r()*4)];
   g.fillStyle=col;g.fillRect(x+1,y+1,bw-3,bh-3);
   g.fillStyle=lava?'rgba(238,136,81,.08)':'rgba(146,191,246,.11)';
   g.fillRect(x+2,y+2,bw-6,2);
   g.fillStyle='rgba(2,6,17,.37)';g.fillRect(x+2,y+bh-5,bw-6,3);
   if(variation%4===0){
    line(g,[[x+11,y+bh*.37],[x+17,y+bh*.38],[x+20,y+bh*.58]],
      rgba(lava?'127,53,25':'128,173,216',.16),1.2);
   }
   diag.masonry++;
  }
 }
 // Walls and tower-like rear columns, with crisp top caps and occlusion.
 for(const x of [74,278,685,893]){
  const wide=(x===74||x===893)?57:46;
  const grad=g.createLinearGradient(x-wide/2,0,x+wide/2,0);
  grad.addColorStop(0,lava?'#100707':'#0a162c');
  grad.addColorStop(.48,lava?'#4b1d12':'#294772');
  grad.addColorStop(1,lava?'#210b08':'#0e1b37');
  path(g,[[x-wide*.55,12],[x+wide*.52,12],[x+wide*.60,top],
   [x-wide*.61,top]],grad);
  path(g,[[x-wide*.70,10],[x+wide*.65,10],[x+wide*.53,25],
   [x-wide*.58,25]],lava?'#65331d':'#395c84');
  path(g,[[x-wide*.73,top-12],[x+wide*.76,top-12],
   [x+wide*.62,top+7],[x-wide*.64,top+7]],
   lava?'#64301c':'#36567c');
  line(g,[[x-wide*.53,27],[x-wide*.53,top-14]],
   rgba(lava?'255,158,88':'160,209,253',.19),2);
 }
 // Blue engraved electric traces, or molten orange cuts, in vertical masonry.
 for(const x0 of [12,178,374,548,759,930]){
  const r2=R(x0+501);let y=38+r2()*28,x=x0;
  const pts=[[x,y]];
  for(let k=0;k<7;k++){x+=(-1+k%3)*8+(r2()-.5)*7;y+=10+r2()*8;pts.push([x,y]);}
  line(g,pts,rgba(C.blue,lava?.42:.18),9);
  line(g,pts,rgba(C.blue,lava?.85:.60),3.4);
  line(g,pts,rgba(C.white,lava?.84:.67),1.05);
  diag.cracks++;
 }
 // Top-to-floor wall junction and a low, broad rear landing (no giant staircase).
 const shadow=g.createLinearGradient(0,top-19,0,top+42);
 shadow.addColorStop(0,rgba('2,5,14',0));shadow.addColorStop(.40,rgba('1,5,15',.72));
 shadow.addColorStop(1,rgba('3,10,23',0));
 g.fillStyle=shadow;g.fillRect(0,top-19,W,62);
 for(const x of [365,480,600]){
  const width=x===480?170:100,yy=top-14;
  path(g,[[x-width*.5,yy],[x+width*.5,yy],
    [x+width*.5-6,yy+12],[x-width*.5+6,yy+12]],
    lava?'#3d160d':'#233958');
  line(g,[[x-width*.5+5,yy+2],[x+width*.5-5,yy+2]],
   rgba(C.white,.11),1.6);
 }
}
// V151.1: real material microtexture sampled from small, UI-free portions
// of the user-provided video (32px swatch per theme, 16-color packed pixels).
// Reassembled only ONCE when building a new static environment backdrop;
// it is not a sprite PNG, attack animation, image download or extra frame loop.
const footagePalette={blue:"2b4889,274488,254385,234182,213f81,213f7f,233e81,203e7e,233d83,223d80,223d7e,213c7e,1f3b7d,1f3a7c,1d397b,1b3679",lava:"e0742a,b65825,782a0c,50150b,47150f,45150f,4d140b,48130c,46140d,45130d,43140d,541004,46120c,400f09,3d1009,3e0e08"};
const footagePixels={blue:"44444333332222222222222357bceffd44433333221000000001222357bceffd33322222211000000002223337bcdefd22222210000000000012233357cdeeed00000000000011222222335557cddeec00001111122222333333335777bddeeb00112222233333335555577777ddddca2222233355554477777777777cdeebb933333355777754555777777ccedddba95555555555554455557777cceeddda995555555555444455577777ceeedcba66555555555544445577777ceeeedca966445555554444445555777eeeeeccba99445555554444445555777cceeedbaa99666655444444444555557ceeecbaaa99666655444444444444457ceec7baa966666666666666666666abcdeedbb99688666666666666666669abcfffc9996688999999999966669999bceffeb9996688b99999baaa9669999bcdfffd63666688cbbbbb99aaaa999bbcdefffd66666699eddcddccccbcccccddefffff99bbbbcceeeeffeeddddddeedeffffffddeeeeddeeefefeddddddddeeffffffedfffffddedccddccdcbbbcccdffffe6288999999ccbb999699bbbbaabdefe61011111122cbb99969999999abcefec20001111111bbbb9699999999acdffe610001111111bbbbbb99999999cdfffd210001111111bbbbbb9999999bcefffc100001111111bbbbbb999999bbdefff6100001111111cbbbbb99999bbdefffc2100001111111",lava:"aaaaeeeeefd99aa444444488999cc999aaaaeeeeefd9855444444448999cc999aaaeeddeeff9855444444447ccccc999aaeeeddeefd9455444444447ccccc999aeeeeddeefd945a77887777cccccc779deeeeffeefa845a77887777cccccc779ddddfffeed94488777777889999cccc7ddddfffeed94448744477889999cccc7deeeeeefdc844777766666699cccc777deeeeeefdcc88cc7766666699cccc77cddddfeeffd866bbbbbbbbbbbbbbbbbbbddddfeefdc833333333bbbb333333333ddddfeee563b22222222222222222222ddddfeea433221111111111111111111ddddfdda432210000000000000000000ddfffdda432110000000000000000000ddfffda4432211100111100000000000dffffa54433222222222222111100000dfffdaa4433bbbbbbbbbbbb222110000ffffda54466bbbbbbbbbbbbbb2211111fffdaaa487766bb66bbbbbbbbb222222fffdaa5487766bbb6bbbbbbbbbbbb222fffaa5588887c777766666667bbbbbbbffda555888877777766666677bbbbbbbffaa55a99888899cc777777676666663fda555a98888999c7777777666666663da555aa8888999977777777666666666da555aa8888999977777777666666666a555aaa4889999977777777666666666a555aa54889999977777777666666666555aa55889999997777777766666666655aaa5a9999999977777777666666666"};
function footageMaterial(g){
 if(typeof g.createImageData!=='function'||typeof g.putImageData!=='function')return null;
 const key=lava?'lava':'blue',colors=footagePalette[key].split(',').map(hex=>[
  parseInt(hex.slice(0,2),16),parseInt(hex.slice(2,4),16),parseInt(hex.slice(4,6),16)]);
 const pixels=footagePixels[key];
 if(pixels.length!==1024)return null;
 const tile=document.createElement('canvas');tile.width=32;tile.height=32;
 const ctx=tile.getContext('2d');if(!ctx?.createImageData||!ctx?.putImageData)return null;
 const img=ctx.createImageData(32,32);
 for(let i=0;i<1024;i++){
  const color=colors[parseInt(pixels.charAt(i),16)],p=i*4;
  img.data[p]=color[0];img.data[p+1]=color[1];
  img.data[p+2]=color[2];img.data[p+3]=255;
 }
 ctx.putImageData(img,0,0);
 return tile;
}

function floorMap(g,W,H,top){
 // Key comparison to the video: broad near-orthographic stone squares, only
 // gentle perspective, not the aggressively converging V148/V150 floor.
 const r=R(151204),bottom=H-20,n=17,ny=Math.max(11,Math.round((bottom-top)/58));
 const filmed=footageMaterial(g);
 const depth=t=>top+(bottom-top)*Math.pow(t,1.075);
 const project=(x,t)=>W*.5+(x-W*.5)*(.91+.09*t);
 g.fillStyle=C.base;g.fillRect(0,top,W,H-top);
 for(let j=0;j<ny;j++){
  let a=j/ny,b=(j+1)/ny,ya=depth(a),yb=depth(b);
  for(let i=0;i<n;i++){
   const x0=i*W/n,x1=(i+1)*W/n;
   const p=[[project(x0,a),ya],[project(x1,a),ya],
   [project(x1,b),yb],[project(x0,b),yb]];
   path(g,p,C.tile[Math.floor(r()*C.tile.length)],
    rgba(lava?'34,8,6':'8,25,57',lava?.49:.45),1.25);
   if(filmed){
    // Film-textured stone paint remains clipped INSIDE the native tile polygon,
    // including its gentle trapezoid projection (no distortion of hitboxes).
    g.save();g.beginPath();g.moveTo(p[0][0],p[0][1]);
    for(let v=1;v<4;v++)g.lineTo(p[v][0],p[v][1]);
    g.closePath();g.clip();
    g.globalAlpha=lava?.24:.38;
    g.drawImage(filmed,p[0][0],ya,p[1][0]-p[0][0],yb-ya);
    g.globalAlpha=1;g.restore();
   }

   const xx=(p[0][0]+p[1][0])*.5,yy=(ya+yb)*.5;
   const ww=p[1][0]-p[0][0],hh=yb-ya;
   // Chiseled borders / self-shadow make each quadrangle read as a slab.
   line(g,[[p[0][0]+2,ya+2],[p[1][0]-2,ya+2]],
    rgba(lava?'157,69,40':'107,151,219',lava?.17:.23),1);
   line(g,[[p[1][0]-2,ya+3],[p[2][0]-2,yb-3]],
    rgba('3,10,27',.27),1);
   if((i+j*4)%5===0&&!lava){
    // The source video repeatedly uses tiny two-segment chevron glyphs.
    const size=Math.min(10,ww*.22);
    line(g,[[xx-size,yy-size*.24],[xx,yy+size*.3],[xx+size,yy-size*.24]],
      rgba('145,201,246',.13),1.4);
   }
   if((i*7+j*3)%13===0){
    g.fillStyle=rgba(lava?'15,6,5':'9,19,42',.16);
    g.fillRect(xx-3,yy-2,5,3);
   }
   for(let k=0;k<3;k++){
    const sx=p[0][0]+5+r()*Math.max(3,ww-10);
    const sy=ya+4+r()*Math.max(2,hh-8);
    g.fillStyle=r()>.55?rgba(lava?'175,83,45':'151,190,246',.11):
      rgba('2,7,22',.15);
    g.fillRect(sx,sy,.6+r()*2.3,.6+r()*1.8);
   }
   diag.tiles++;
  }
 }
 // Tiny soft local lights falling on real tile joints (video's light accumulation).
 if(!lava){
  for(const [x,y,size] of [[105,H*.48,105],[613,H*.53,65],[780,H*.78,105]]){
   light(g,x,y,size,size*.75,C.blue,.115);
  }
 }
 // Clip-safe foreground vignette; keep fighters in the middle readable.
 const haze=g.createLinearGradient(0,top,0,H);
 haze.addColorStop(0,rgba('1,7,25',.27));
 haze.addColorStop(.45,rgba('1,7,25',0));
 haze.addColorStop(1,rgba('2,5,12',.31));
 g.fillStyle=haze;g.fillRect(0,top,W,H-top);
 return {top,bottom,depth,project};
}
function fissures(g,W,H,top,floor){
 if(!lava){
  // Occasional low brightness etchings from the original icy-blue map.
  const r=R(151999);
  for(let i=0;i<36;i++){
   const t=.07+r()*.85,xx=70+r()*(W-140),yy=floor.depth(t);
   line(g,[[xx-9,yy],[xx-2,yy+2],[xx+3,yy-1],[xx+12,yy+1]],
    rgba(C.blue,.10),1.4);
  }return;
 }
 const r=R(15132);
 // Lava footage: frequent HOT orange, short horizontal lightning cuts on
 // otherwise dark flat tiles. Avoid large rainbow glow pools or big cracks.
 for(let i=0;i<74;i++){
  const t=.025+r()*.93,yy=floor.depth(t),xx=45+r()*(W-90);
  const length=14+r()*40;
  const pts=[[xx-length*.57,yy-1],[xx-length*.28,yy+3],
    [xx,yy],[xx+length*.18,yy+2],[xx+length*.58,yy-2]];
  line(g,pts,rgba('255,91,17',.21),11);
  line(g,pts,rgba(C.blue,.74),3.8);
  line(g,pts,rgba(C.white,.87),1.25);
  if(i%3===0)light(g,xx,yy,length*1.4,18,C.blue,.16);
  diag.cracks++;
 }
}
function lowWalls(g,W,H,top){
 // Narrow massive side walls: top cap, inner side facet and deep shadow.
 const end=Math.min(H*.76,top+430);
 for(const side of [-1,1]){
  const left=side<0,edge=left?0:W,inward=left?1:-1;
  const far=73,near=20;
  path(g,[[edge,top-21],[edge+inward*far,top-2],
    [edge+inward*near,end],[edge,end+30]],
    C.side,rgba(C.white,.13),2);
  path(g,[[edge,top-32],[edge+inward*45,top-45],
    [edge+inward*(far+4),top],[edge,top-6]],
    lava?'#5b2918':'#37517a');
  for(let i=0;i<12;i++){
   const t=i/12,y=top+20+(end-top-30)*t;
   const xx=edge+inward*(far+(near-far)*t);
   line(g,[[edge,y],[xx,y-3]],rgba(C.white,.16),1.5);
   if(i%4===1){
    line(g,[[xx-3*inward,y-5],[xx+4*inward,y+5]],
     rgba(C.blue,.50),2);
   }
  }
  const shade=g.createLinearGradient(edge,0,edge+inward*140,0);
  shade.addColorStop(0,rgba('1,6,18',.46));
  shade.addColorStop(1,rgba('1,6,18',0));
  g.fillStyle=shade;g.fillRect(left?0:W-140,top,140,end-top+35);
 }
}
function crystal(g,x,y,s){
 // Small emissive white-blue obelisks in blue mode, as in video.
 light(g,x,y-s*.88,s*2.7,s*3.5,C.blue,.31);
 g.fillStyle='rgba(2,7,17,.38)';g.beginPath();
 g.ellipse(x+5,y+5,s*.8,s*.24,0,0,Math.PI*2);g.fill();
 path(g,[[x,y-s*2.4],[x-s*.42,y-s*1.25],[x-s*.34,y],
   [x+s*.15,y+4]],lava?'#e68d41':'#92dfff');
 path(g,[[x,y-s*2.4],[x+s*.51,y-s*1.34],[x+s*.43,y],
   [x+s*.15,y+4]],lava?'#a94a21':'#4b9fd3');
 path(g,[[x-2,y-s*2.05],[x-s*.11,y-s*.72],[x+2,y-8]],
   lava?'#ffe2a1':'#e8fcff');
 line(g,[[x,y-s*2.34],[x+2,y-s*1.42],[x+4,y-s*.25]],
   rgba(C.white,.89),1.5);
 diag.props++;
}
function pebble(g,x,y,s){
 g.fillStyle='rgba(0,4,13,.33)';g.beginPath();
 g.ellipse(x+3,y+4,s*1.12,s*.37,0,0,Math.PI*2);g.fill();
 path(g,[[x-s*.9,y],[x-s*.32,y-s*.72],[x+s*.39,y-s*.73],
   [x+s*.92,y-s*.03],[x+s*.78,y+s*.18],[x-s*.8,y+s*.16]],
   lava?'#472019':'#263e61');
 path(g,[[x-s*.9,y],[x-s*.32,y-s*.72],[x+s*.39,y-s*.73],[x,y-s*.32]],
   lava?'#74412a':'#4c6c8f');
 path(g,[[x,y-s*.32],[x+s*.39,y-s*.73],[x+s*.92,y-s*.03],
   [x+s*.78,y+s*.18]],lava?'#26100d':'#132643');
 diag.props++;
}
function chest(g,x,y,size){
 // Source footage features small dark chests with yellow cross latches.
 light(g,x,y-size*.45,size*1.7,size,C.blue,.11);
 path(g,[[x-size*.56,y-size*.45],[x+size*.52,y-size*.45],
   [x+size*.47,y+size*.37],[x-size*.56,y+size*.37]],
   '#5d361c');
 path(g,[[x-size*.61,y-size*.62],[x+size*.54,y-size*.62],
   [x+size*.63,y-size*.42],[x-size*.68,y-size*.42]],
   lava?'#8c4f2c':'#75502b');
 g.fillStyle='#f6cc4d';g.fillRect(x-size*.40,y-size*.40,size*.80,size*.13);
 g.fillRect(x-size*.10,y-size*.38,size*.22,size*.34);
 diag.props++;
}
function torch(g,x,y,size){
 // A video-like wall sconce on a short stone pedestal.
 light(g,x,y-size*1.15,size*4,size*5,C.blue,.40);
 pebble(g,x,y,size*.66);
 path(g,[[x-size*.30,y-size*.48],[x+size*.38,y-size*.48],
   [x+size*.27,y-size*1.17],[x-size*.27,y-size*1.17]],
   '#674029');
 path(g,[[x,y-size*2.14],[x-size*.48,y-size*1.20],[x-size*.27,y-size*.99],
   [x+size*.38,y-size*.99],[x+size*.47,y-size*1.42]],
   '#f57722');
 path(g,[[x,y-size*1.85],[x-size*.21,y-size*1.27],[x,y-size*1.10],
   [x+size*.26,y-size*1.33]],'#ffe477');
 diag.props++;
}
function scenery(g,W,H,top,floor){
 // Game center left empty: props live on the perimeter, not in combat path.
 const y=t=>floor.depth(t);
 if(lava){
  chest(g,148,y(.34),34);
  chest(g,522,y(.62),32);
  torch(g,295,y(.28),26);torch(g,745,y(.17),24);
  for(const a of [[74,.28,17],[875,.48,27],[126,.70,22],
   [826,.73,22],[332,.84,16],[690,.89,18]])pebble(g,a[0],y(a[1]),a[2]);
  // Glowing wall/floor border: keep natural stage dark and geometric.
  for(const k of [0,1])light(g,k?W-12:12,H*.55,115,H*.7,C.blue,.11);
 }else{
  chest(g,357,y(.18),34);
  crystal(g,115,y(.24),31);
  crystal(g,852,y(.22),38);
  crystal(g,166,y(.74),34);
  crystal(g,830,y(.72),31);
  // A small foreground crystal helps imitate the native video camera framing.
  crystal(g,565,y(.96),36);
  for(const a of [[84,.39,12],[903,.54,12],[124,.91,14],
     [815,.86,14],[670,.54,9],[361,.77,10]])pebble(g,a[0],y(a[1]),a[2]);
  // Energy motes, deliberately irregular and concentrated near fixtures.
  const r=R(151846);
  for(let i=0;i<57;i++){
   const xx=18+r()*925,yy=top+17+r()*(H-top-28),rad=.7+r()*2.3;
   light(g,xx,yy,5+r()*14,5+r()*14,C.blue,.14+r()*.26);
   g.fillStyle=rgba(C.white,.40+r()*.42);
   g.beginPath();g.arc(xx,yy,rad,0,Math.PI*2);g.fill();
   diag.motes++;
  }
 }
}
function build(w,h){
 const can=document.createElement('canvas');can.width=w;can.height=h;
 can.complete=true;can.naturalWidth=w;can.naturalHeight=h;
 const g=can.getContext('2d');if(!g)throw Error('V151 backdrop context missing');
 const scale=w/960,W=960,H=h/scale,top=clamp(H*.235,143,196);
 g.save();g.setTransform(scale,0,0,scale,0,0);
 const bg=g.createLinearGradient(0,0,0,H);
 bg.addColorStop(0,C.back);bg.addColorStop(.25,C.base);
 bg.addColorStop(1,lava?'#35110b':'#1b346a');
 g.fillStyle=bg;g.fillRect(0,0,W,H);
 bricks(g,W,top);
 const floor=floorMap(g,W,H,top);
 fissures(g,W,H,top,floor);
 lowWalls(g,W,H,top);
 scenery(g,W,H,top,floor);
 const vign=g.createRadialGradient(W*.5,H*.51,W*.14,W*.5,H*.51,H*.84);
 vign.addColorStop(0,rgba('0,2,9',0));
 vign.addColorStop(.7,rgba('0,2,9',.045));
 vign.addColorStop(1,rgba('0,2,9',.56));
 g.fillStyle=vign;g.fillRect(0,0,W,H);
 g.restore();diag.builds++;
 return can;
}
BattleEngine.prototype.generateBackdrop=function(){
 const result=native.apply(this,arguments);
 if(!enabled||!this.bg||!this.w||!this.h)return result;
 if(this.bg._video151)return result;
 const key=Math.round(this.w)+'x'+Math.round(this.h)+':'+(lava?'lava':'blue');
 try{
  const c=store.get(key);
  if(c){this.bg=c;diag.hits++;return result;}
  const out=build(Math.round(this.w),Math.round(this.h));
  out._video151=true;this.bg=out;
  store.set(key,out);
  if(store.size>MAX)store.delete(store.keys().next().value);
 }catch(e){diag.failures++;diag.lastError=String(e?.message||e);}
 return result;
};
window.PokemonTorreArenaV151=Object.freeze({
 installed:true,enabled,version:'151.0',theme:lava?'lava':'blue',
 source:'User-provided PokéSouls video scene composition and sampled color palette',
 baseline:'V150 ?arena151=0; original V147 ?arena148=0',
 diagnostics:()=>({...diag})
});
})();