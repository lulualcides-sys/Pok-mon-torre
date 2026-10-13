/* Pokémon Torre — move sprites extracted directly from the user's original
 * Pokémon Ruby & Sapphire (GBA) effect sheet, credited to Neslug.
 * 13 isolated original sprite crops; the only edit is 1px black alpha contour.
 * Runs in Canvas2D intentionally to keep ORIGINAL pixel art on mobile/offline,
 * even when WebGL/CDN particle emitters are not available.
 * Scope: Confusion, Tempestade Psíquica, Psybeam, Chicote de Vinha ONLY.
 * Tri Attack is approved and is NOT touched.
 */
const originalGbaFX=(()=>{
'use strict';
const IMAGE='effects/moves/gba-assets/ruby-sapphire-move-sprites.png?build=gba-original-v1';
const sheet=new Image();
sheet.decoding='async';
sheet.src=IMAGE;
const crops={
 conf_eye:[2,2,40,36],conf_spiral:[46,2,65,60],
 storm_slash:[115,2,32,33],storm_dust:[151,2,33,33],
 psy_zig0:[188,2,15,32],psy_zig1:[2,66,31,38],
 psy_zig2:[37,66,23,29],psy_zig3:[64,66,30,35],
 vine_0:[98,66,24,25],vine_1:[126,66,31,33],
 vine_2:[161,66,32,22],vine_3:[2,108,32,23],
 vine_4:[38,108,26,32]
};
const aliases={
 confusion:'confusion',confusao:'confusion',
 tempestadepsiquica:'tempestadepsiquica',
 psybeam:'psybeam',psibeam:'psybeam',
 chicotedevinha:'chicotedevinha',vinewhip:'chicotedevinha'
};
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const clamp=x=>Math.min(1,Math.max(0,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
const lerp=(a,b,q)=>a+(b-a)*q;
const draws=Object.create(null),errors=Object.create(null);
sheet.onerror=()=>{errors.atlas='Imagem GBA original não carregou';};
function blit(g,name,x,y,w,h,rot=0,alpha=1,mirror=false){
 const r=crops[name];if(!r||alpha<=.01||!sheet.complete||!sheet.naturalWidth)return false;
 g.save();g.translate(x,y);g.rotate(rot);g.globalAlpha=clamp(alpha);
 if(mirror)g.scale(-1,1);
 // GBA original was designed for nearest-neighbor scaling.
 g.imageSmoothingEnabled=false;
 // Pixel-perfect black outline is already part of the cropped PNG.
 g.drawImage(sheet,r[0],r[1],r[2],r[3],-w/2,-h/2,w,h);
 g.restore();return true;
}
function name(f){return aliases[normalize(f?.move?.name||f?.name)]||null;}
function handles(f){return !!name(f)}
function paint(g,f,now,e){
 const n=name(f);if(!n)return false;
 // Suppress all older generic renderers for these 4 even during preloading.
 if(!sheet.complete||!sheet.naturalWidth){errors[n]='aguardando atlas PNG';return true;}
 if(!Array.isArray(f.from)||!Array.isArray(f.to))return true;
 const A=f.from,B=f.to,ms=Math.max(350,f.duration||1050),t=clamp((now-f.at)/ms);
 const dx=B[0]-A[0],dy=B[1]-A[1],ang=Math.atan2(dy,dx),tau=Math.PI*2;
 const s=Math.max(.76,Math.min(1.06,(e?.h||420)/430));
 const fade=1-ease((t-.86)/.14),power=ease((t-.48)/.22);
 const put=(id,x,y,w,h,r=0,a=1,fl=false)=>blit(g,id,x,y,w*s,h*s,r,a,fl);
 g.save();g.imageSmoothingEnabled=false;
 if(n==='confusion'){
  const charge=1-ease((t-.13)/.11);
  put('conf_eye',A[0],A[1],18,16,0,charge*.9);
  for(let i=0;i<3;i++){
   const p=ease((t-.14-i*.075)/.52),local=1-ease((t-.63-i*.04)/.20);
   if(t<.14+i*.075)continue;
   put('conf_spiral',lerp(A[0],B[0],p),lerp(A[1],B[1],p),
     27+i*3,26+i*3,now*.0016*(i%2?1:-1),fade*local*.83);
  }
  const impact=ease((t-.56)/.19);
  put('conf_spiral',B[0],B[1],38,37,now*.002,impact*fade*.86);
  put('conf_eye',B[0],B[1],19,17,now*.001,impact*fade*.86);
 }else if(n==='tempestadepsiquica'){
  const build=ease((t-.10)/.31);
  for(let i=0;i<6;i++){
   const a=i*tau/6+now*.003*(i%2?-1:1),radius=(13+i%3*7)+build*12;
   const x=B[0]+Math.cos(a)*radius,y=B[1]+Math.sin(a)*radius*.68;
   const id=['psy_zig1','psy_zig2','psy_zig3'][i%3];
   put(id,x,y,21+i%2*3,24,ang+a*.20,build*fade*.85);
  }
  for(let i=0;i<4;i++){
   const a=i*tau/4-now*.0024,r=18+build*19;
   put('storm_dust',B[0]+Math.cos(a)*r,B[1]+Math.sin(a)*r*.67,
     20,19,a,build*fade*.75);
  }
  put('conf_spiral',B[0],B[1],34,33,now*.002,power*fade*.68);
 }else if(n==='psybeam'){
  const travel=ease((t-.12)/.59),angle=ang+Math.PI/2;
  // Real multicolor GBA jagged sprites traveling downrange; no stretched quad.
  for(let j=0;j<7;j++){
   const p=travel-j*.052;
   if(p<=0||p>=1.06)continue;
   const v=clamp(p),shift=Math.sin(now*.019+j*1.47)*4;
   const x=lerp(A[0],B[0],v)-Math.sin(ang)*shift;
   const y=lerp(A[1],B[1],v)+Math.cos(ang)*shift;
   put(['psy_zig1','psy_zig3','psy_zig2','psy_zig0'][j%4],
     x,y,22+j%2*3,29,angle,fade*(.89-j*.055));
  }
  const impact=ease((t-.68)/.20);
  put('conf_eye',B[0],B[1],22,20,0,impact*fade*.88);
  put('storm_dust',B[0],B[1],24,23,now*.003,impact*fade*.74);
 }else if(n==='chicotedevinha'){
  // Two whip swipes assembled from THE FIVE authentic green GBA vine frames.
  for(let wave=0;wave<2;wave++){
   const start=.12+wave*.29,tip=ease((t-start)/.40);
   const out=1-ease((t-start-.44)/.13);
   if(t<start||out<=0)continue;
   for(let j=0;j<6;j++){
    const p=tip-j*.052;
    if(p<=0)continue;
    const u=clamp(p),sway=Math.sin(u*10+now*.012+wave)*7;
    const x=lerp(A[0],B[0],u)-Math.sin(ang)*sway;
    const y=lerp(A[1],B[1],u)+Math.cos(ang)*sway;
    put('vine_'+((j+wave)%5),x,y,29,25,ang+(j%2?.07:-.05),
      out*(.94-j*.07),wave===1);
   }
  }
  const hit=ease((t-.65)/.15);
  put('vine_1',B[0]-7,B[1]-4,27,24,ang-.35,hit*fade);
  put('vine_3',B[0]+6,B[1]+3,24,22,ang+.29,hit*fade*.88,true);
 }
 g.restore();
 draws[n]=(draws[n]||0)+1;
 return true;
}
return {handles,paint,diagnostics:()=>({version:'GBA original v1',source:'user supplied Ruby/Sapphire sprite atlas; ripped by Neslug',
    loaded:!!sheet.naturalWidth,sheet:[sheet.naturalWidth||0,sheet.naturalHeight||0],
    originalSprites:Object.keys(crops).length,names:Object.keys(aliases),rendered:{...draws},errors:{...errors}})};
})();
window.PokemonTorreOriginalGBAFX=()=>originalGbaFX.diagnostics();
