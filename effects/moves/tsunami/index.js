/* TSUNAMI V44.3 — THREE-QUARTER BREAKING WAVE of the user-approved pixel-art wave.
 * The crest bends and rolls in 22 independently animated sprite strips.
 * Original wave/splash-sheet frames move ALONG the face and break on the foe.
 * Never slide a single rigid PNG, never use CSS or procedural circles/paths.
 */
const tsunamiWaveV442=new Image();
tsunamiWaveV442.decoding='async';
tsunamiWaveV442.src='effects/moves/tsunami/wave.svg?v=44.3';
const tsunamiFrontV443=new Image();
tsunamiFrontV443.decoding='async';
tsunamiFrontV443.src='effects/moves/tsunami/front.svg?v=44.3';
waterSpriteV43.add('tsunami',{
 key:'tsunami',duration:2070,area:true,contact:false,
 waterWall:true,animatedCrest:true,perspectiveFront:true,followTarget:true,
 paint(g,f,t,ms,s,K){
  const {draw,ease,lerp,clamp}=K,A=f.from,B=f.to;
  const dx=B[0]-A[0],dy=B[1]-A[1],distance=Math.hypot(dx,dy)||1;
  const ux=dx/distance,uy=dy/distance,nx=-uy,ny=ux;
  const grow=ease((t-.07)/.33);
  const advance=ease((t-.12)/.63);
  const foamIn=ease((t-.27)/.18);
  const fade=1-ease((t-.85)/.14);
  const bend=ease((t-.31)/.32);
  const x=lerp(A[0],B[0],advance),y=lerp(A[1],B[1],advance);
  const width=(172+196*grow)*s,height=(108+126*grow)*s;
  if(t<.23){
   const swell=ease(t/.17)*(1-ease((t-.18)/.05));
   draw(g,2,A[0]+ux*24*s,A[1]+uy*24*s+11*s,
     (71+85*swell)*s,(25+42*swell)*s,{alpha:swell*.76});
  }
  if(t>.12&&t<.99&&tsunamiWaveV442.naturalWidth){
   const strips=22;
   const srcWidth=320,srcHeight=192;
   const baseY=y-height*.72;
   // The actual WAVE SILHOUETTE flexes each frame. Every strip samples
   // a different region of the PNG; changing y per strip deforms the crest,
   // rather than sliding a hard image across the arena.
   g.save();
   g.imageSmoothingEnabled=false;
   g.globalAlpha=fade*.98;
   for(let i=0;i<strips;i++){
    const u=(i+.5)/strips;
    const sx=Math.floor(i*srcWidth/strips);
    const ex=Math.floor((i+1)*srcWidth/strips);
    const sw=Math.max(1,ex-sx);
    const dw=width/strips;
    const depth=u*u;
    // Perspective: distant edge smaller; near edge leans INTO the target.
    // This prevents the whole wave reading as a flat side-on cartoon.
    const left=x-width*.5+i*dw+ux*width*.17*depth;
    const edgeDepth=(u-.5)*height*.115;
    const swell=Math.sin(ms*.007+i*.46)*7*s;
    const backflow=Math.sin(ms*.0033-i*.22)*5*s;
    const crestCurl=Math.sin(ms*.011-i*.33)*4*s*bend;
    const dy=baseY+edgeDepth+swell+backflow+crestCurl;
    const stretch=.83+.26*u+.035*Math.sin(ms*.0038+i*.24)+.018*bend*Math.sin(ms*.008+i*.53);
    // Adjacent columns overlap 1.5px to avoid visible seams.
    g.drawImage(tsunamiWaveV442,sx,0,sw,srcHeight,
      Math.round(left),Math.round(dy),
      Math.ceil(dw+1.8*s),Math.round(height*stretch));
   }
   g.restore();
   // The front-facing plunging face extends TOWARDS the opponent and camera.
   // Twelve independent sprite columns animate the diagonal breaking lip;
   // this layer supplies depth while preserving the approved 22-strip wave.
   if(tsunamiFrontV443.naturalWidth){
    const frontWidth=(150+112*grow)*s;
    const frontHeight=(115+92*grow)*s;
    const frontX=x+ux*width*.22;
    const frontY=y+height*.12+uy*width*.12;
    const frontCurl=Math.sin(ms*.0062)*8*s;
    const faceStrips=12;
    g.save();
    g.globalAlpha=fade*foamIn*.94;
    g.imageSmoothingEnabled=false;
    for(let j=0;j<faceStrips;j++){
     const u=(j+.5)/faceStrips;
     const sx=Math.floor(j*240/faceStrips);
     const sw=Math.floor((j+1)*240/faceStrips)-sx;
     // Face has near/far perspective and its frothy lip rolls independently.
     const perspective=.78+.40*u;
     const yy=frontY-frontHeight*.66+
        (u-.5)*22*s+Math.sin(ms*.010+j*.72)*6*s+
        frontCurl*Math.sin(u*Math.PI);
     const xx=frontX-frontWidth*.5+j*frontWidth/faceStrips+
        ux*Math.sin(u*Math.PI)*15*s;
     g.drawImage(tsunamiFrontV443,sx,0,sw,200,
       Math.round(xx),Math.round(yy),
       Math.ceil(frontWidth/faceStrips+1.6*s),
       Math.round(frontHeight*perspective));
    }
    g.restore();
   }
   // Foam constantly rolls from behind the crest towards the breaking tip.
   // Original source frames 0–4 are animated wave crests; 5–9 are splashes.
   for(let i=0;i<7;i++){
    const offset=((i*.151+ms*.00031)%1);
    const across=(offset-.5)*width*.83;
    const px=x+nx*across+ux*(18+18*bend)*s;
    const py=baseY+height*(.15+.21*offset)+ny*across*.23
     +Math.sin(ms*.011+i*1.38)*9*s;
    draw(g,Math.floor((ms/112+i*2)%5),
      px,py,(35+i%3*7)*s,(23+i%3*7)*s,
      {alpha:fade*foamIn*(.38+.14*Math.sin(ms*.006+i)),flipX:i%2===1});
   }
   // The curling lip moves independently of the main body, like surf.
   for(let i=0;i<6;i++){
    const side=(i-2.5)*width*.13;
    const pulse=Math.sin(ms*.009+i*.91)*6*s;
    const px=x+nx*side+ux*(width*.29+16*s);
    const py=baseY+height*.25+ny*side*.14+pulse;
    draw(g,5+((Math.floor(ms/95)+i)%5),
      px,py,(37+i%2*9)*s,(46+i%3*8)*s,
      {alpha:fade*foamIn*(.62-i*.060),flipX:i%2===0});
   }
   // Animated undercurrent advances *behind* the crest; not a floor line.
   if(t>.42){
    const under=ease((t-.42)/.18)*fade;
    for(let i=0;i<5;i++){
     const q=((i*.22+ms*.00020)%1);
     const xx=x+nx*(q-.5)*width*.82-ux*17*s;
     const yy=y+height*.16+ny*(q-.5)*width*.22;
     draw(g,5+((Math.floor(ms/128)+i)%5),
      xx,yy,(43+i%2*12)*s,(42+i%3*7)*s,
      {alpha:under*(.35+.12*Math.sin(ms*.008+i))});
    }
   }
  }
  // Foamy collision also MOVES: spray rises and disperses instead of freezing.
  if(t>.60){
   const hit=ease((t-.60)/.14)*(1-ease((t-.91)/.09));
   if(hit>.012){
    const rise=ease((t-.61)/.29);
    for(let i=0;i<9;i++){
     const side=(i-4)*25*s;
     const lift=(9+22*rise+(i%3)*8*rise)*s;
     draw(g,5+((Math.floor(ms/76)+i*2)%5),
      B[0]+nx*side+ux*Math.sin(ms*.008+i)*8*s,
      B[1]+ny*side-lift,
      (45+i%3*8)*s,(52+i%2*11)*s,
      {alpha:hit*(.87-i*.052),flipX:i%2===0});
    }
   }
  }
 }
});
