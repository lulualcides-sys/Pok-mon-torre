/* Four independent fire move animations — Pokemon Torre */
const legendaryFireFX=(()=>{
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
 const kinds={chamasdemoltres:'moltres',rajadaflamejante:'stream',chamacircular:'circle',garradefogo:'claw'};
 const frames={};const clamp=x=>Math.max(0,Math.min(1,x));const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
 const sprite=new Image();sprite.src='effects/moves/fire-original/fire-original-4-atlas.png?v=fire4v1';
 const cell=(g,n,x,y,w,h,a=1,angle=0)=>{if(!sprite.complete||!sprite.naturalWidth)return;g.save();g.globalAlpha=clamp(a);g.translate(x,y);g.rotate(angle);g.imageSmoothingEnabled=false;g.drawImage(sprite,(n%8)*96,Math.floor(n/8)*96,96,96,-w/2,-h/2,w,h);g.restore()};
 const orb=(g,x,y,r,color,a=1)=>{g.save();g.globalAlpha=clamp(a);g.fillStyle=color;g.shadowColor=color;g.shadowBlur=12;g.beginPath();g.arc(x,y,Math.max(.5,r),0,Math.PI*2);g.fill();g.restore()};
 const stroke=(g,x,y,x2,y2,width,color,a)=>{g.save();g.globalAlpha=clamp(a);g.strokeStyle=color;g.lineWidth=width;g.lineCap='round';g.shadowColor=color;g.shadowBlur=10;g.beginPath();g.moveTo(x,y);g.lineTo(x2,y2);g.stroke();g.restore()};
 function paint(g,f,now,e){
  const kind=kinds[norm(f?.move?.name||f?.name)];if(!kind)return false;
  if(!g||!f?.from||!f?.to)return true;
  const A=f.from,B=f.to,dx=B[0]-A[0],dy=B[1]-A[1],len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
  const t=clamp((now-f.at)/Math.max(500,f.duration||1000)),age=now-f.at,scale=Math.max(.7,Math.min(1.2,(e?.h||420)/420));
  const fade=1-ease((t-.87)/.13),tau=Math.PI*2;
  g.save();g.imageSmoothingEnabled=false;
  if(kind==='moltres'){
   const reach=ease((t-.08)/.62);
   for(let j=0;j<34;j++){const p=clamp(reach-j*.019),wave=Math.sin(p*17-age*.016+j)*15*scale;
    const x=A[0]+dx*p+nx*wave,y=A[1]+dy*p+ny*wave;
    orb(g,x,y,(4+j%4)*scale,j%3===0?'#c6ffff':j%3===1?'#078cff':'#0448f9',fade*(.85-j*.012));
    if(j%3===0){stroke(g,x,y,x-dx/len*23+nx*wave*.3,y-dy/len*23+ny*wave*.3,7*scale,'#008cff',fade*.8);}
   }
   for(let i=0;i<14;i++){const p=clamp(reach-i*.038),a=i*2.4+age*.009;
    orb(g,A[0]+dx*p+Math.cos(a)*17*scale,A[1]+dy*p+Math.sin(a)*14*scale,2.4*scale,'#a5faff',fade*.9);}
   if(t>.60)for(let i=0;i<12;i++){const a=i*tau/12+age*.005,r=(12+ease((t-.60)/.35)*38)*scale;
    orb(g,B[0]+Math.cos(a)*r,B[1]+Math.sin(a)*r,4*scale,i%2?'#0b7bff':'#d2ffff',fade);}
  }else if(kind==='stream'){
   const reach=ease((t-.08)/.27);
   for(let j=0;j<26;j++){const p=(j+.5)/26*reach,wiggle=Math.sin(age*.021+j*1.4)*8*scale;
    const x=A[0]+dx*p+nx*wiggle,y=A[1]+dy*p+ny*wiggle;
    cell(g,74,x,y,26*scale,33*scale,fade*.78,Math.atan2(dy,dx)-Math.PI/2);
    orb(g,x,y,(5+j%3)*scale,j%3?'#ff7814':'#fff0a1',fade*.75);
   }
   if(t>.28)cell(g,37+Math.floor(age/65)%13,B[0],B[1],64*scale,65*scale,fade*.92);
  }else if(kind==='circle'){
   const active=ease((t-.04)/.18)*fade;
   for(let i=0;i<4;i++){const angle=age*.006*(i%2?1:-1)+i*tau/4;
    for(let j=0;j<11;j++){const a=angle+j*tau/11,r=(23+i*6)*scale,y=B[1]+Math.sin(a)*r*.47-(j%3)*11*scale;
     const x=B[0]+Math.cos(a)*r;
     cell(g,15+((Math.floor(age/75)+j+i*3)%11),x,y,23*scale,26*scale,active*.86,a);
    }
   }
   cell(g,14,B[0],B[1]-15*scale,65*scale,87*scale,active*.65,0);
  }else if(kind==='claw'){
   const hit=ease((t-.33)/.13)*(1-ease((t-.78)/.15));
   const x=B[0]-dx/len*18,y=B[1]-dy/len*18;
   for(let i=0;i<3;i++){const shift=(i-1)*12*scale;
    stroke(g,x-26*scale+nx*shift,y-31*scale+ny*shift,x+26*scale+nx*shift,y+31*scale+ny*shift,11*scale,'#ef3a12',hit*.86);
    stroke(g,x-23*scale+nx*shift,y-28*scale+ny*shift,x+23*scale+nx*shift,y+28*scale+ny*shift,5*scale,'#ffe79b',hit);
    cell(g,7+(Math.floor(age/65)+i)%7,x+nx*shift,y+ny*shift,32*scale,36*scale,hit*.83);
   }
   if(t>.43)cell(g,37+Math.floor(age/75)%13,B[0],B[1],51*scale,54*scale,hit*.8);
  }
  g.restore();frames[kind]=(frames[kind]||0)+1;return true;
 }
 return {paint,handles:f=>!!kinds[norm(f?.move?.name||f?.name)],diagnostics:()=>({moves:Object.keys(kinds),frames:{...frames}})};
})();
// Register names in the battle scheduler so accepted attacks are queued and painted.
for(const [key,aliases,duration] of [
 ['moltresblue',['Chamas de Moltres'],1450],
 ['flamestream',['Rajada Flamejante'],1100],
 ['firecircle',['Chama Circular'],1400],
 ['fireclaw',['Garra de Fogo'],980]
]){if(!pick(aliases[0]))registerMove('legendary_'+key,aliases,()=>{},duration);}
window.PokemonTorreLegendaryFireFX=()=>legendaryFireFX.diagnostics();
