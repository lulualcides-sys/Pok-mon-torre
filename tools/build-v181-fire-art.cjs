'use strict';
// Pokémon Torre V181: hand-authored ORIGINAL 16-frame flame contours.
// Writes editable .aseprite 32-bit animation sources; LibreSprite CLI exports PNG.
// No Python, Canvas2D, shader-generated silhouette, CSS or scraped game assets.
const fs=require('node:fs'),zlib=require('node:zlib'),path=require('node:path'),assert=require('node:assert/strict');
const ROOT='effects/moves/v181-hand-drawn-fire';
const COLORS=[null,[13,12,21],[78,20,20],[157,35,20],[231,73,25],[255,146,29],[255,213,64],[255,246,177]];
const SIZES={flamethrower:[144,48],fireblast:[48,40],impact:[112,112]};
class Picture{
 constructor(w,h){this.w=w;this.h=h;this.p=new Uint8Array(w*h);}
 dot(x,y,c){x=Math.round(x);y=Math.round(y);if(x>=0&&x<this.w&&y>=0&&y<this.h)this.p[y*this.w+x]=c}
 rect(x,y,w,h,c){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)this.dot(xx,yy,c)}
 shape(pts,c){const min=Math.max(0,Math.floor(Math.min(...pts.map(p=>p[1])))),max=Math.min(this.h-1,Math.ceil(Math.max(...pts.map(p=>p[1]))));
  for(let y=min;y<=max;y++){const cross=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];if((a[1]<=y+.5&&b[1]>y+.5)||(b[1]<=y+.5&&a[1]>y+.5))cross.push(a[0]+(y+.5-a[1])*(b[0]-a[0])/(b[1]-a[1]));}
   cross.sort((a,b)=>a-b);for(let i=0;i+1<cross.length;i+=2)for(let x=Math.ceil(cross[i]);x<cross[i+1];x++)this.dot(x,y,c);
  }
 }
 oval(cx,cy,rx,ry,c){for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++)if(((x-cx)/rx)**2+((y-cy)/ry)**2<=1)this.dot(x,y,c)}
 brush(x,y,xx,yy,r,c){const n=Math.ceil(Math.hypot(xx-x,yy-y)*2)||1;for(let i=0;i<=n;i++){const t=i/n;this.oval(x+(xx-x)*t,y+(yy-y)*t,r,r,c)}}
 outline(){const p=this.p.slice();for(let y=1;y<this.h-1;y++)for(let x=1;x<this.w-1;x++)if(!p[y*this.w+x]){
  let edge=false;for(let dy=-1;dy<=1&&!edge;dy++)for(let dx=-1;dx<=1;dx++)if(p[(y+dy)*this.w+x+dx]>=3){edge=true;break}
  if(edge)this.p[y*this.w+x]=1;
 }}
 rgba(){const b=Buffer.alloc(this.w*this.h*4);for(let i=0;i<this.p.length;i++){const c=COLORS[this.p[i]];if(!c)continue;b[i*4]=c[0];b[i*4+1]=c[1];b[i*4+2]=c[2];b[i*4+3]=255;}return b}
}
const FORMS=[
 [[-16,4],[-12,-1],[-13,-7],[-7,-5],[-6,-12],[-3,-8],[2,-11],[5,-6],[9,-8],[15,-2],[16,3],[11,7],[6,6],[3,10],[-1,6],[-6,9],[-10,5]],
 [[-17,5],[-13,1],[-14,-5],[-10,-3],[-8,-10],[-3,-6],[-1,-13],[3,-6],[8,-9],[11,-3],[16,1],[17,4],[9,8],[4,5],[0,10],[-5,6],[-10,9]],
 [[-17,2],[-13,-3],[-9,-1],[-10,-10],[-5,-7],[-1,-12],[2,-5],[7,-10],[9,-3],[16,0],[14,6],[8,8],[3,5],[-2,10],[-8,6],[-12,8]],
 [[-16,6],[-13,0],[-15,-6],[-9,-4],[-7,-12],[-3,-7],[0,-9],[3,-3],[9,-9],[12,-2],[16,1],[14,7],[7,5],[2,9],[-4,6],[-9,10]],
 [[-18,3],[-13,-2],[-12,-8],[-8,-5],[-5,-13],[-2,-7],[2,-9],[7,-4],[10,-7],[17,-1],[16,4],[9,9],[4,6],[-1,9],[-6,5],[-13,7]],
 [[-17,5],[-13,-1],[-11,-5],[-8,-3],[-6,-11],[-1,-7],[2,-13],[4,-5],[10,-7],[16,-1],[16,3],[11,7],[5,6],[1,11],[-5,6],[-11,8]],
 [[-16,3],[-12,-2],[-14,-8],[-8,-4],[-5,-13],[-1,-6],[3,-10],[6,-4],[13,-7],[17,1],[14,5],[10,8],[4,5],[0,11],[-4,7],[-10,9]],
 [[-17,4],[-14,-2],[-11,-4],[-10,-10],[-5,-6],[-2,-12],[2,-6],[6,-9],[9,-3],[15,0],[16,5],[10,7],[6,5],[2,11],[-5,6],[-10,9]]
];
const place=(p,x,y,sx,sy)=>p.map(([a,b])=>[x+a*sx,y+b*sy]);
function lick(a,x,y,v,size=1){
 const sx=size,sy=size*(.86+(v%3)*.08);
 a.shape(place(FORMS[v%8],x,y,sx,sy),3);
 a.shape(place([[-13,3],[-10,0],[-9,-5],[-5,-4],[-3,-9],[0,-5],[4,-7],[8,-3],[12,0],[12,3],[7,5],[3,3],[-1,7],[-5,4],[-9,6]],x,y,sx*.91,sy*.83),4);
 a.shape(place([[-11,2],[-8,-1],[-5,-1],[-3,-6],[0,-3],[3,-5],[6,-1],[9,1],[8,3],[3,2],[1,5],[-4,3],[-7,4]],x+1,y,sx*.84,sy*.70),5);
 a.shape(place([[-8,1],[-4,0],[-2,-3],[0,-1],[3,-3],[5,0],[7,2],[3,2],[1,3],[-2,1]],x+1,y,sx*.83,sy*.66),6);
 if(v%2===0)a.brush(x-3*sx,y+sy,x+sx,y+sy,1,7);
}
function stream(k){const a=new Picture(...SIZES.flamethrower);
 for(let j=0;j<8;j++){
  const x=4+(j*17+k*6.2)%148,y=24+[0,-2,3,-1,2,-4,1,0][(j+k)%8];
  const scale=[.77,.95,1.15,.85,.99,.82,1.09,.88][(j+k)%8];lick(a,x,y,(j+k*3)%8,scale);
 }
 for(let x=8;x<139;x+=4){const y=24+[-1,0,1,1,-1,0,2][(Math.floor(x/4)+k)%7];a.oval(x,y,4,2.1,4);a.oval(x+1,y,3,1.4,6);}
 for(let j=0;j<10;j++){const x=4+(j*17+k*11)%134,y=11+(j*9+k*3)%27;if((j+k)%3===0){a.rect(x,y,2,2,4);a.dot(x+1,y,6)}}
 a.outline();return a;
}
function ball(k){const a=new Picture(...SIZES.fireblast),x=28,y=19;
 lick(a,x,y,k%8,.77);lick(a,x-7,y+2,(k+4)%8,.50);
 a.oval(x+1,y,8.7,8,4);a.oval(x+1,y,6.5,6,5);a.oval(x+2,y,3.5,3.8,7);
 for(let i=0;i<5;i++)a.rect(3+i*3+(k*3+i*7)%6,15+(k+i*3)%9,1+i%2,1+i%2,i%3===0?6:4);
 a.outline();return a;
}
const ARMS=[
 [[0,0],[-4,-12],[-1,-24],[1,-35],[5,-41],[8,-32],[7,-22],[12,-14]],
 [[0,0],[12,-7],[21,-14],[29,-22],[35,-20],[31,-13],[26,-3],[18,3]],
 [[0,0],[14,8],[25,14],[31,28],[24,31],[15,26],[7,21],[2,14]],
 [[0,0],[-10,13],[-15,23],[-28,28],[-34,25],[-24,18],[-18,7]],
 [[0,0],[-16,-5],[-27,-10],[-34,-21],[-39,-18],[-32,-11],[-27,-2],[-15,2]]
];
function impact(k){const a=new Picture(...SIZES.impact),cx=56,cy=56;
 const progress=[.35,.53,.73,.86,1,1.08,1.07,1.06,1,.93,.82,.69,.56,.45,.33,.18][k];
 for(let j=0;j<5;j++){
  const p=ARMS[j],s=progress*(1+(k%4===0&&j%2===0?.05:0));
  a.shape(place(p,cx,cy,s,s),3);
  a.shape(place(p,cx,cy,s*.85,s*.85),4);
  const m=p[Math.min(3,p.length-2)],n=p[Math.min(5,p.length-1)];
  a.brush(cx+m[0]*s*.28,cy+m[1]*s*.28,cx+n[0]*s*.70,cy+n[1]*s*.70,2.2*s,5);
  a.brush(cx+m[0]*s*.43,cy+m[1]*s*.43,cx+n[0]*s*.62,cy+n[1]*s*.62,1.1*s,6);
 }
 a.oval(cx,cy,10.5*progress,9.5*progress,4);a.oval(cx,cy,7.4*progress,6.6*progress,6);a.oval(cx,cy,3.6*progress,3.2*progress,7);
 if(k>=5&&k<14)for(let j=0;j<5;j++){const tip=ARMS[j][ARMS[j].length-2];a.rect(Math.round(cx+tip[0]*progress*(1+(k-5)*.038)),Math.round(cy+tip[1]*progress*(1+(k-5)*.038)),2+j%2,2,k<10?5:3);}
 a.outline();return a;
}
function chunk(type,data){const b=Buffer.alloc(data.length+6);b.writeUInt32LE(b.length,0);b.writeUInt16LE(type,4);data.copy(b,6);return b}
function ase(arts,w,h){
 const header=Buffer.alloc(128);header.writeUInt16LE(0xa5e0,4);header.writeUInt16LE(arts.length,6);header.writeUInt16LE(w,8);header.writeUInt16LE(h,10);header.writeUInt16LE(32,12);header.writeUInt32LE(1,14);header.writeUInt16LE(64,18);header[34]=1;header[35]=1;
 const layer=Buffer.alloc(16);layer.writeUInt16LE(3,0);layer[12]=255;const title=Buffer.from('Painted original fire');const titlePart=Buffer.alloc(title.length+2);titlePart.writeUInt16LE(title.length,0);title.copy(titlePart,2);
 const parts=[header];
 for(let i=0;i<arts.length;i++){
  const cel=Buffer.alloc(20);cel[6]=255;cel.writeUInt16LE(2,7);cel.writeUInt16LE(w,16);cel.writeUInt16LE(h,18);
  const chunks=[];if(i===0)chunks.push(chunk(0x2004,Buffer.concat([layer,titlePart])));
  chunks.push(chunk(0x2005,Buffer.concat([cel,zlib.deflateSync(arts[i].rgba(),{level:8})])));
  const fh=Buffer.alloc(16);fh.writeUInt32LE(16+chunks.reduce((a,b)=>a+b.length,0),0);fh.writeUInt16LE(0xf1fa,4);fh.writeUInt16LE(chunks.length,6);fh.writeUInt16LE(64,8);parts.push(fh,...chunks);
 }
 const out=Buffer.concat(parts);out.writeUInt32LE(out.length,0);return out;
}
for(const type of Object.keys(SIZES)){
 const [w,h]=SIZES[type],art=Array.from({length:16},(_,i)=>type==='flamethrower'?stream(i):type==='fireblast'?ball(i):impact(i));
 const unique=new Set(art.map(x=>zlib.deflateSync(x.rgba()).toString('base64')));
 assert.equal(unique.size,16,'All sprites must have distinct hand-timed frames');
 assert.ok(art.every(x=>x.p.filter(y=>y>=3).length>25),'No blank animation frame');
 const dir=path.join(ROOT,type);fs.mkdirSync(dir,{recursive:true});
 fs.writeFileSync(path.join(dir,'animation.aseprite'),ase(art,w,h));
 console.log('V181 hand-painted',type,'16 distinct',w+'x'+h,'editable LibreSprite frames');
}
