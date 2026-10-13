/* TSUNAMI V44.1 — ONE coherent tidal wave in crisp original-style pixel art.
 * A real animated sprite crosses the battlefield; the separately supplied
 * original water-sheet pixels appear as whitewater ONLY on the actual crash.
 * No straight ribbon, no staircase of splashes, no circles/CSS.
 */
const tsunamiWaveV441=new Image();
tsunamiWaveV441.decoding='async';
tsunamiWaveV441.src='effects/moves/tsunami/wave.svg?v=44.1';
waterSpriteV43.add('tsunami',{
 key:'tsunami',duration:1940,area:true,contact:false,waterWall:true,
 paint(g,f,t,ms,s,K){
  const {draw,ease,lerp,clamp}=K,A=f.from,B=f.to;
  const dx=B[0]-A[0],dy=B[1]-A[1],dist=Math.hypot(dx,dy)||1;
  const ux=dx/dist,uy=dy/dist,nx=-uy,ny=ux;
  const growth=ease((t-.08)/.32);
  const travel=ease((t-.14)/.57);
  const fade=1-ease((t-.83)/.15);
  if(t<.24){
   const starter=ease(t/.18)*(1-ease((t-.18)/.06));
   draw(g,6,A[0]+ux*35*s,A[1]+uy*35*s,
        (50+52*starter)*s,(36+42*starter)*s,{alpha:starter*.7});
  }
  if(t>.13&&t<.98&&tsunamiWaveV441.naturalWidth){
   const x=lerp(A[0],B[0],travel),y=lerp(A[1],B[1],travel);
   const width=(175+205*growth)*s,height=(114+126*growth)*s;
   // The curved top rises above combat, the lower half covers the opponent.
   const bounce=Math.sin(ms*.006)*3*s;
   g.save();g.imageSmoothingEnabled=false;g.globalAlpha=fade;
   g.drawImage(tsunamiWaveV441,
      Math.round(x-width*.5),Math.round(y-height*.72+bounce),
      Math.round(width),Math.round(height));
   g.restore();
   // Small source-sprite foam stays anchored to the breaking front.
   if(t>.34){
    const foam=ease((t-.34)/.12)*fade;
    for(let j=0;j<4;j++){
     const side=(j-1.5)*36*s;
     draw(g,5+((Math.floor(ms/115)+j)%5),
       x+nx*side+ux*width*.18,
       y+ny*side-height*.32+Math.sin(ms*.012+j)*5*s,
       (40+j%2*11)*s,(48+j%2*10)*s,
       {alpha:foam*(.65-j*.09),flipX:j%2===0});
    }
   }
  }
  if(t>.62){
   const hit=ease((t-.62)/.12)*(1-ease((t-.92)/.08));
   if(hit>.015){
    // Four REAL original splash frames form the forward water impact.
    for(let j=0;j<4;j++){
     const side=(j-1.5)*41*s;
     draw(g,5+((Math.floor(ms/83)+j)%5),
       B[0]+nx*side+ux*(j%2*9)*s,
       B[1]+ny*side-(17+j%2*18)*s,
       (64+j%2*13)*s,(80+j%2*14)*s,
       {alpha:hit*(.91-j*.12),flipX:j%2===1});
    }
   }
  }
 }
});
