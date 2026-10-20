'use strict';
/* Fire Blast: 16 unique, 2x pixel-art frames with the authentic 大/daimonji silhouette.
   Offline asset generator. No Canvas2D, shaders, SVG or moving CSS. */
const fs=require('node:fs'),zlib=require('node:zlib'),path=require('node:path');
const OUT=process.argv[2]||'effects/moves/v183-daimonji/sheet.png';
const W=96,H=64,FRAME_W=192,FRAME_H=128,COLS=4,FRAMES=16;
const COLORS=[ [0,0,0,0],[17,7,8,255],[61,12,9,255],[116,17,8,255],
 [185,31,8,255],[225,54,7,255],[248,83,12,255],[255,119,16,255],
 [255,163,25,255],[255,202,46,255],[255,232,90,255],[255,249,169,255],
 [255,255,223,255] ];
const pixels=new Uint8Array((FRAME_W*COLS)*(FRAME_H*4)*4);
const hash=(x,y,s)=>{let a=(x*374761393+y*668265263+s*1274126177)|0;a=Math.imul(a^(a>>>13),1274126177);return ((a^(a>>>16))>>>0)/4294967296};
const dist=(x,y,a,b,c,d)=>{let t=Math.max(0,Math.min(1,((x-a)*(c-a)+(y-b)*(d-b))/((c-a)**2+(d-b)**2)));return Math.hypot(x-a-t*(c-a),y-b-t*(d-b))};
function kanji(x,y,k){
 const size=k<8?Math.min(1,.23+.77*(k-4)/3):k>12?1+.04*(k-12):1;
 const X=(x-49)/size+49,Y=(y-32)/size+32;
 return Math.min(
  dist(X,Y,49,11,49,32),
  dist(X,Y,27,27,70,25),
  dist(X,Y,49,30,40,43),dist(X,Y,40,43,24,55),
  dist(X,Y,50,31,59,43),dist(X,Y,59,43,74,56));
}
function plot(frame,x,y,color){if(x<0||x>=W||y<0||y>=H)return;
 const cellX=(frame%COLS)*FRAME_W,cellY=Math.floor(frame/COLS)*FRAME_H;
 const rgba=COLORS[color],fullW=FRAME_W*COLS;
 for(let oy=0;oy<2;oy++)for(let ox=0;ox<2;ox++){
  const i=((cellY+y*2+oy)*fullW+cellX+x*2+ox)*4;
  pixels.set(rgba,i);
 }
}
for(let k=0;k<FRAMES;k++){
 const early=k<4,finish=k>=12;
 const ignition=early?(k+1)/4:1;
 const fade=finish?Math.max(.1,(16-k)/4):1;
 for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
  let d;
  if(early){
   const bx=38+k*1.4,by=32+(k%2)*.25;
   d=Math.hypot((x-bx)*.86,(y-by)*1.06);
   const trail=x<bx&&x>bx-(8+k*2)&&Math.abs(y-by+Math.sin((x+k)*.55)*2)<3+k*.2;
   if(trail)d=Math.min(d,2.5+Math.abs(y-by)*.3);
  }else d=kanji(x,y,k);
  const wobble=Math.sin(x*.66+y*.17+k*.69)*.75+
      Math.sin(x*.19-y*.53-k*.42)*.6;
  const cluster=(hash(x>>1,y>>1,k)-.5)*1.2;
  const radius=early?3.3+9*ignition:4.9;
  const edge=radius+wobble+cluster;
  if(finish && hash(x,y,k)<(1-fade)*.57)continue;
  if(d>edge+1.55)continue;
  let tone=1;
  if(d<edge-4.9)tone=12;
  else if(d<edge-4.1)tone=11;
  else if(d<edge-3.2)tone=10;
  else if(d<edge-2.4)tone=9;
  else if(d<edge-1.3)tone=8;
  else if(d<edge-.4)tone=7;
  else if(d<edge+.25)tone=6;
  else if(d<edge+.75)tone=5;
  else if(d<edge+1.18)tone=3;
  else tone=1;
  if(early&&tone>8)tone=Math.min(12,tone+1);
  if(finish)tone=Math.max(2,tone-Math.floor((1-fade)*4));
  plot(k,x,y,tone);
 }
 const embers=early?2+k*2:finish?14+(k-12)*4:9;
 for(let j=0;j<embers;j++){
  const angle=hash(j,1,k)*Math.PI*2;
  const r=(early?10:24)+hash(j,2,k)*(early?5:10);
  const x=Math.round(49+Math.cos(angle)*r),y=Math.round(32+Math.sin(angle)*r*.8);
  if(hash(j,4,k)>.18)plot(k,x,y,5+Math.floor(hash(j,3,k)*4));
 }
}
function crc(buf){let c=0xffffffff;for(let v of buf){c^=v;for(let j=0;j<8;j++)c=c&1?0xedb88320^(c>>>1):c>>>1}return(c^0xffffffff)>>>0}
function chunk(type,data){const name=Buffer.from(type),b=Buffer.alloc(12+data.length);b.writeUInt32BE(data.length,0);name.copy(b,4);data.copy(b,8);b.writeUInt32BE(crc(b.subarray(4,b.length-4)),b.length-4);return b}
const sw=FRAME_W*COLS,sh=FRAME_H*4;
const scan=Buffer.alloc(sh*(1+sw*4));for(let y=0;y<sh;y++){
 const at=y*(1+sw*4);scan[at]=0;Buffer.from(pixels.buffer, y*sw*4,sw*4).copy(scan,at+1);
}
const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(sw,0);ihdr.writeUInt32BE(sh,4);ihdr[8]=8;ihdr[9]=6;
const png=Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(scan,{level:9})),chunk('IEND',Buffer.alloc(0))]);
fs.mkdirSync(path.dirname(OUT),{recursive:true});fs.writeFileSync(OUT,png);
const crypto=require('node:crypto');const hashes=[];
for(let i=0;i<16;i++){
 const block=[];let count=0;for(let y=0;y<64;y++)for(let x=0;x<96;x++){
  const px=(Math.floor(i/4)*128+y*2)*sw+(i%4)*192+x*2,p=px*4;
  block.push(...pixels.slice(p,p+4));if(pixels[p+3])count++;
 }
 if(count<12)throw Error('Blank glyph frame '+i);
 hashes.push(crypto.createHash('sha256').update(Buffer.from(block)).digest('hex'));
}
if(new Set(hashes).size!==16)throw Error('Repeated frames');
console.log('V183 16 frames RGBA, 4x4, 192x128, exact 大 silhouette, bytes',png.length);
