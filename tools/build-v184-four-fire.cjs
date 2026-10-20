'use strict';
/* Pokemon Torre V184: four distinct original fire attacks, editable LibreSprite/ASE.
 * Build time only: individual hand-timed indexed-pixel frames. No Canvas2D/Python.
 * Exact reference semantics: Flame Wheel physical spinning cloak; Inferno enemy engulf;
 * Ember tiny fired flames; Eruption volcanic jets from ground.
 */
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const ROOT='effects/moves/v184-fire-four',W=96,H=64,ZOOM=2;
const COLORS=[
 null,[18,8,15],[48,13,13],[92,17,12],[149,25,13],[202,39,13],
 [234,58,16],[252,88,20],[255,124,23],[255,160,30],
 [255,196,47],[255,229,92],[255,245,161],[255,253,212]
];
const SPECS={ember:8,'flame-wheel':12,inferno:16,eruption:16};
function hash(a,b,k){let s=(Math.imul((a+113)|0,374761393)+Math.imul((b+19)|0,668265263)+Math.imul((k+7)|0,1274126177))|0;s=Math.imul(s^(s>>>13),1274126177);return((s^(s>>>16))>>>0)/4294967296}
function clamp(x,a,b){return Math.max(a,Math.min(b,x))}
function ease(x){x=clamp(x,0,1);return x*x*(3-2*x)}
class Art{
 constructor(){this.p=new Uint8Array(W*H)}
 set(x,y,c){x=Math.round(x);y=Math.round(y);if(x>0&&x<W-1&&y>0&&y<H-1&&c>this.p[y*W+x])this.p[y*W+x]=c}
 brush(cx,cy,rx,ry,power=1){
  if(rx<=0||ry<=0)return;
  for(let y=Math.max(1,Math.floor(cy-ry-1));y<Math.min(H-1,Math.ceil(cy+ry+1));y++)
  for(let x=Math.max(1,Math.floor(cx-rx-1));x<Math.min(W-1,Math.ceil(cx+rx+1));x++){
   const d=Math.hypot((x-cx)/rx,(y-cy)/ry);
   if(d>1)continue;
   const c=d<.24?13:d<.43?12:d<.60?11:d<.73?10:d<.82?9:d<.91?7:5;
   this.set(x,y,Math.max(3,Math.min(13,Math.round(c*power))));
  }
 }
 spark(x,y,idx){this.set(x,y,idx);if(idx>8)this.set(x+1,y,Math.max(5,idx-2))}
 border(){
  const copy=this.p.slice();
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)if(!copy[y*W+x]){
   let near=false;
   for(let yy=-1;yy<=1&&!near;yy++)for(let xx=-1;xx<=1;xx++)if(copy[(y+yy)*W+x+xx]>=4){near=true;break}
   if(near)this.p[y*W+x]=1;
  }
 }
 rgba(){
  const b=Buffer.alloc(W*H*ZOOM*ZOOM*4),rw=W*ZOOM;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
   const color=COLORS[this.p[y*W+x]];if(!color)continue;
   for(let sy=0;sy<ZOOM;sy++)for(let sx=0;sx<ZOOM;sx++){
    const j=((y*ZOOM+sy)*rw+x*ZOOM+sx)*4;
    b[j]=color[0];b[j+1]=color[1];b[j+2]=color[2];b[j+3]=255;
   }
  }
  return b;
 }
}
function flame(a,cx,base,tip,spread,k,heat=1){
 // Organic upward taper; orange margins + inner yellow lick, never round balls.
 if(tip>=base)return;
 for(let y=Math.floor(tip);y<=Math.ceil(base);y++){
  const t=clamp((base-y)/Math.max(1,base-tip),0,1);
  const width=spread*Math.pow(1-t,.78)*(0.84+.16*Math.sin(t*10+k*.7));
  const drift=Math.sin(t*8+k*.52+cx*.17)*spread*.26;
  const tongue=1.7*Math.sin(t*15-k*.9)+1.0*Math.sin(t*28+k*.44);
  const edge=Math.max(.1,width+(tongue)*t*(1-t));
  const center=cx+drift;
  for(let x=Math.ceil(center-edge-1);x<=Math.floor(center+edge+1);x++){
   const d=Math.abs(x-center)/edge,rough=(hash(x>>1,y>>1,k)-.5)*.15;
   if(d>1+rough)continue;
   const level=d<.24?12:d<.47?11:d<.65?9:d<.83?7:4;
   a.set(x,y,Math.max(4,Math.floor(level*heat)));
  }
 }
}
function ember(k){
 const a=new Art(),progress=k/7,fade=k>=6?.7:.99;
 if(k<6){
  const x=31+k*5.0;
  for(let j=0;j<3;j++){
   const ox=(j-1)*9,oy=(j%2?3:-2),s=.66+.11*((k+j)%3);
   a.brush(x+ox,32+oy,5.5*s,4.0*s,1);
   flame(a,x+ox-3,32+oy+2,32+oy-8,3.5*s,k+j);
   for(let t=0;t<2;t++)a.spark(x+ox-9-t*3,31+oy+((k+j+t)%4-2)*2,t?5:8);
  }
 }else{
  for(let j=0;j<5-(k-6)*2;j++){
   const cx=35+j*7,cy=31+(j%2)*7;
   flame(a,cx,cy+4,cy-8,4*(1-progress*.6)+1,k+j);
   a.spark(cx+7,cy-6,8-k+5);
  }
 }
 a.border();return a;
}
function wheel(k){
 const a=new Art(),growth=k<3?ease((k+1)/4):k>9?1-ease((k-9)/3)*.62:1;
 const ring=18*growth,inner=9*growth;
 for(let y=2;y<H-2;y++)for(let x=2;x<W-2;x++){
  const dx=x-48,dy=y-33,r=Math.hypot(dx,dy),ang=Math.atan2(dy,dx);
  const turn=ang+k*.42,spike=Math.pow(Math.max(0,Math.sin(turn*9)),5)*5;
  const flick=Math.sin(turn*17)*1.35+Math.sin(turn*6-k*.35)*.75;
  const outer=ring+spike+flick*growth;
  if(r<inner||r>outer||growth<.1)continue;
  const depth=outer-r;
  const c=depth<1.4?4:depth<3?6:depth<5?8:depth<7?10:depth<9?11:12;
  a.set(x,y,c);
 }
 // Embers swirl around the cloak rather than flying ahead as projectiles.
 for(let j=0;j<8;j++){
  const ang=j*Math.PI/4+k*.46,rad=ring+6+(j%3)*1.6;
  a.spark(48+Math.cos(ang)*rad,33+Math.sin(ang)*rad*.89,j%3===0?10:6);
 }
 if(k>=8){ // contact splash (short flare on the facing/right edge)
  const opacity=1-ease((k-8)/4);
  for(let i=0;i<4;i++)flame(a,69+i*4,40-i*3,24-i*2,2.5*opacity+1.1,k+i);
 }
 a.border();return a;
}
function inferno(k){
 const a=new Art(),rise=k<5?ease((k+1)/6):k>12?1-ease((k-12)/4)*.82:1;
 for(const [i,cx,base,h,w] of [[0,28,55,31,9],[1,43,59,44,10],[2,59,57,37,11],[3,70,55,28,8]]){
  const tip=base-h*rise+(i%2?Math.sin(k*.7+i)*3:0);
  flame(a,cx,base,tip,w*(.78+.22*rise),k*2+i,.93);
 }
 // A central fire channel burns inside an enclosure. No projectile and no spherical explosion.
 if(rise>.48)flame(a,51,50,53-25*rise,5,k+8,.99);
 const sparks=Math.floor(4+rise*13);
 for(let j=0;j<sparks;j++){
  const x=24+hash(j,2,k)*48,y=14+hash(j,3,k)*41;
  if(hash(j,6,k)>.32)a.spark(x,y,6+Math.floor(hash(j,7,k)*5));
 }
 a.border();return a;
}
function eruption(k){
 const a=new Art(),power=k<5?ease((k+1)/6):k>11?1-ease((k-11)/5)*.87:1;
 // Irregular narrow volcanic fissure, not a generic radial bomb.
 for(let x=17;x<79;x++) {
  const y=56+Math.sin(x*.33+k*.14)*1.4;
  if((x+k)%5!==0){a.set(x,y,3);a.set(x,y-1,(x%6)?5:9)}
 }
 for(const [i,x,depth,height,spread] of [[0,32,55,30,7],[1,49,59,44,11],[2,66,56,36,8]]){
  const top=depth-height*power+(i===1?Math.sin(k*.5)*1.4:0);
  flame(a,x,depth,top,spread*(.62+.38*power),k*2+i,.95);
  if(power>.32)flame(a,x+(i-1)*4,depth-8*power,top+8,4.5*power,k+i+11);
 }
 // Ejected magma/rock chunks are compact and angular, not glowing magic orbs.
 for(let j=0;j<19;j++){
  const flight=hash(j,3,2),spread=hash(j,8,5);
  const x=49+(spread-.5)*75+Math.sin(k*.6+j)*2,
        y=56-(10+flight*34)*power+Math.sin(j+k*.8)*3;
  if(hash(j,k,4)<power*.70) {
   const color=j%4===0?2:j%3===0?5:8;
   a.set(x,y,color);a.set(x+1,y,color);if(j%2===0)a.set(x,y+1,color);
   if(color>=8)a.spark(x+1,y-2,10);
  }
 }
 a.border();return a;
}
const DRAW={ember,wheel,inferno,eruption};
function chunk(type,data){const b=Buffer.alloc(data.length+6);b.writeUInt32LE(b.length,0);b.writeUInt16LE(type,4);data.copy(b,6);return b}
function ase(arts,w,h){
 const header=Buffer.alloc(128);header.writeUInt16LE(0xa5e0,4);header.writeUInt16LE(arts.length,6);
 header.writeUInt16LE(w,8);header.writeUInt16LE(h,10);header.writeUInt16LE(32,12);
 header.writeUInt32LE(1,14);header.writeUInt16LE(72,18);header[34]=1;header[35]=1;
 const layer=Buffer.alloc(16);layer.writeUInt16LE(3,0);layer[12]=255;
 const title=Buffer.from('Original pixel FX 2026');const name=Buffer.alloc(title.length+2);
 name.writeUInt16LE(title.length,0);title.copy(name,2);
 const packets=[header];
 for(let k=0;k<arts.length;k++){
  const cel=Buffer.alloc(20);cel[6]=255;cel.writeUInt16LE(2,7);
  cel.writeUInt16LE(w,16);cel.writeUInt16LE(h,18);
  const chunks=[];
  if(k===0)chunks.push(chunk(0x2004,Buffer.concat([layer,name])));
  chunks.push(chunk(0x2005,Buffer.concat([cel,zlib.deflateSync(arts[k],{level:8})])));
  const fh=Buffer.alloc(16);fh.writeUInt32LE(16+chunks.reduce((sum,b)=>sum+b.length,0),0);
  fh.writeUInt16LE(0xf1fa,4);fh.writeUInt16LE(chunks.length,6);fh.writeUInt16LE(72,8);
  packets.push(fh,...chunks);
 }
 const result=Buffer.concat(packets);result.writeUInt32LE(result.length,0);return result;
}
for(const [move,n] of Object.entries(SPECS)){
 const art=Array.from({length:n},(_,i)=>(move==='flame-wheel'?DRAW.wheel:DRAW[move])(i).rgba());
 const hashes=art.map(buf=>crypto.createHash('sha256').update(buf).digest('hex'));
 assert.equal(new Set(hashes).size,n,'Repeated stills '+move);
 assert.ok(art.every(buf=>buf.filter((v,i)=>i%4===3&&v>0).length>75),'Blank art '+move);
 const folder=path.join(ROOT,move);fs.mkdirSync(folder,{recursive:true});
 fs.writeFileSync(path.join(folder,'animation.aseprite'),ase(art,W*ZOOM,H*ZOOM));
 console.log('V184 '+move+': '+n+' original 192x128 animated LibreSprite source frames');
}
