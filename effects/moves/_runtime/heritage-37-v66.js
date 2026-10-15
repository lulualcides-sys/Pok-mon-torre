/* Pokémon Torre — V66 Heritage 37.
 * Hand-authored, continuous Canvas battle VFX for 37 named moves. This is NOT the
 * previous generic 40-atlas draft. Four animation phases; pixel-art accents;
 * each attack has a recognisable canonical action, not a recoloured generic bolt.
 * No damage, range, status, cooldown, hitbox, or saved-game mutation here.
 * Never match Thunder, Discharge, Thunder Wave, or approved V60/V63 art.
 */
var heritage37V66 = (() => {
 'use strict';
 const ACTIONS = Object.freeze({
  catalog_aurasphere:'aura', catalog_dragonpulse:'dragonpulse',
  catalog_dragonclaw:'claw', catalog_earthpower:'earth',catalog_dig:'dig',
  catalog_rockslide:'rockfall', catalog_quickattack:'rush',
  catalog_doubleteam:'copies',catalog_swordsdance:'swords',
  catalog_airslash:'windslash',catalog_cortex:'cross',
  catalog_nightshade:'night',catalog_irontail:'tail',
  catalog_ossobumerangue:'bone',catalog_campoeletrico:'terrain',
  catalog_willowisp:'wisp', catalog_explosaomagmatica:'magma',
  catalog_bombadesementes:'seed',catalog_absorver:'absorb',
  catalog_megadreno:'megadrain',catalog_leechlife:'lifedrain',
  catalog_poisonjab:'jab',catalog_toxic:'toxic',
  catalog_bugbuzz:'bugbuzz', catalog_dragondance:'dragon dance',
  catalog_flashcannon:'cannon',catalog_aquajet:'aquajet',
  catalog_calmmind:'calm',catalog_recover:'recover',
  catalog_synthesis:'synthesis',catalog_confuseray:'confuse',
  catalog_extremespeed:'extreme',catalog_fairywind:'fairy',
  catalog_dragonbreath:'breath',catalog_furycutter:'fury',
  catalog_stoneedge:'stoneedge',catalog_tempestadedefolhas:'leafstorm'
 });
 const labels=Object.freeze({
  catalog_aurasphere:'Aura Sphere',catalog_dragonpulse:'Dragon Pulse',catalog_dragonclaw:'Dragon Claw',
  catalog_earthpower:'Earth Power',catalog_dig:'Dig',catalog_rockslide:'Rock Slide',
  catalog_quickattack:'Quick Attack',catalog_doubleteam:'Double Team',catalog_swordsdance:'Swords Dance',
  catalog_airslash:'Air Slash',catalog_cortex:'X-Scissor',catalog_nightshade:'Night Shade',
  catalog_irontail:'Iron Tail',catalog_ossobumerangue:'Bone Boomerang',catalog_campoeletrico:'Electric Terrain',
  catalog_willowisp:'Will-O-Wisp',catalog_explosaomagmatica:'Explosão Magmática',
  catalog_bombadesementes:'Seed Bomb',catalog_absorver:'Absorver',catalog_megadreno:'Mega Dreno',
  catalog_leechlife:'Leech Life',catalog_poisonjab:'Poison Jab',catalog_toxic:'Toxic',
  catalog_bugbuzz:'Bug Buzz',catalog_dragondance:'Dragon Dance',catalog_flashcannon:'Flash Cannon',
  catalog_aquajet:'Aqua Jet',catalog_calmmind:'Calm Mind',catalog_recover:'Recover',
  catalog_synthesis:'Synthesis',catalog_confuseray:'Confuse Ray',catalog_extremespeed:'Extreme Speed',
  catalog_fairywind:'Fairy Wind',catalog_dragonbreath:'Dragon Breath',catalog_furycutter:'Fury Cutter',
  catalog_stoneedge:'Stone Edge',catalog_tempestadedefolhas:'Leaf Storm'
 });
 const forbidden=new Set(['catalog_thunder','catalog_discharge','catalog_descarga',
 'catalog_descargaeletrica','catalog_thunderwave','catalog_trovao','thunder','discharge','thunderwave']);
 const stats={draws:0,failures:0,last:null};
 const PI=Math.PI, TAU=PI*2, clip=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const ease=t=>{t=clip(t);return t*t*(3-2*t);},lerp=(a,b,t)=>a+(b-a)*t;
 const rng=n=>{let x=Math.sin(n*127.1+78.233)*43758.5453;return x-Math.floor(x);};
 function line(g,p,w,c,alpha=1,outline=1.9){
  if(p.length<2)return;g.save();g.globalAlpha=clip(alpha);g.lineCap='round';g.lineJoin='round';
  const draw=()=>{g.beginPath();p.forEach((pt,i)=>i?g.lineTo(pt[0],pt[1]):g.moveTo(pt[0],pt[1]));g.stroke();};
  if(outline){g.strokeStyle='#060b19';g.lineWidth=w+outline*2;draw();}
  g.strokeStyle=c;g.lineWidth=w;draw();g.restore();
 }
 function polygon(g,p,c,a=1,stroke='#07101b',sw=2){
  g.save();g.globalAlpha=clip(a);g.beginPath();p.forEach((v,i)=>i?g.lineTo(v[0],v[1]):g.moveTo(v[0],v[1]));
  g.closePath();g.fillStyle=c;g.fill();if(sw){g.lineWidth=sw;g.strokeStyle=stroke;g.stroke();}g.restore();
 }
 function ellipse(g,x,y,rx,ry,c,a=1,sw=2){
  g.save();g.globalAlpha=clip(a);g.beginPath();g.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,TAU);
  g.fillStyle=c;g.fill();if(sw){g.lineWidth=sw;g.strokeStyle='#080c18';g.stroke();}g.restore();
 }
 function arc(g,x,y,r,start,end,c,w=2,alpha=1){
  g.save();g.globalAlpha=clip(alpha);g.beginPath();g.arc(x,y,Math.max(.1,r),start,end);
  g.lineCap='round';g.strokeStyle='#070917';g.lineWidth=w+3;g.stroke();
  g.strokeStyle=c;g.lineWidth=w;g.stroke();g.restore();
 }
 function ray(g,A,B,col,light,w,alpha=1){
  line(g,[A,B],w,col,alpha,3);line(g,[A,B],Math.max(1,w*.28),light,alpha*.96,0);
 }
 function sparkle(g,x,y,r,c,a=1){
  line(g,[[x-r,y],[x+r,y]],Math.max(1,r*.28),c,a,1);
  line(g,[[x,y-r],[x,y+r]],Math.max(1,r*.28),c,a,1);
  ellipse(g,x,y,Math.max(1,r*.25),Math.max(1,r*.25),'#fffdf1',a,0);
 }
 function spatter(g,x,y,r,count,c,t,seed=0,low=false){
  let n=low?Math.ceil(count*.55):count;
  for(let i=0;i<n;i++){
   let a=i*2.39996+seed, rad=r*(.3+.8*rng(i*13+seed))*ease(t),px=x+Math.cos(a)*rad,py=y+Math.sin(a)*rad*.76;
   let sz=(1+rng(i+seed)*2.9)*clip(1-t*.55,.1,1);
   polygon(g,[[px,py-sz*1.7],[px+sz,py],[px,py+sz],[px-sz,py]],c,clip(t*4)*clip((1-t)*5), '#0b101c',.8);
  }
 }
 function stone(g,x,y,r,phase,flame=false){
  const p=[];for(let i=0;i<7;i++){let a=i*TAU/7,rr=r*(.80+.25*rng(i+phase*17));p.push([x+rr*Math.cos(a),y+rr*Math.sin(a)]);}
  polygon(g,p,flame?'#584036':'#807866',1,'#080e16',2.8);
  polygon(g,[[x-r*.45,y-r*.56],[x+r*.35,y-r*.7],[x+r*.11,y-r*.08],[x-r*.58,y+r*.04]],flame?'#ec9b31':'#d7ccb0',.8,'#32271e',1.2);
  line(g,[[x+r*.1,y],[x+r*.36,y+r*.46],[x+r*.66,y+r*.19]],1.6,'#262e32',.7,0);
 }
 function leaf(g,x,y,size,ang,green='#a8e45e',alpha=1){
  g.save();g.translate(x,y);g.rotate(ang);g.globalAlpha=clip(alpha);
  polygon(g,[[0,-size*.2],[size*.68,-size*.41],[size,0],[size*.62,size*.30],[0,size*.22],[-size*.25,0]],green,1,'#0e2412',2);
  line(g,[[-size*.22,0],[size*.83,0]],1.2,'#e9ffb7',.85,0);g.restore();
 }
 function flame(g,x,y,r,h,t,col='#1499f7'){
  const flick=Math.sin(t*16+x*.11)*r*.16, dark=col==='#1499f7'?'#09497d':'#8d2c17';
  polygon(g,[[x-r*.75,y+h*.2],[x-r*.84,y],[x-r*.20,y-h*.43],[x+flick,y-h],[x+r*.14,y-h*.4],
   [x+r*.71,y-h*.64],[x+r*.66,y+h*.14],[x+r*.15,y+h*.36]],dark,1,'#040918',2.6);
  polygon(g,[[x-r*.46,y+h*.22],[x-r*.46,y-h*.09],[x+r*.02,y-h*.54],[x+r*.14,y-h*.21],
   [x+r*.42,y-h*.35],[x+r*.45,y+h*.22]],col,.96,'#081021',1.3);
  polygon(g,[[x-r*.12,y+h*.17],[x,y-h*.24],[x+r*.16,y-h*.11],[x+r*.18,y+h*.22]],'#e7fbff',.88,'#298dd5',.5);
 }
 function draw(g,fx,t,time,s,low,key){
  const mode=ACTIONS[key];if(!mode||!g||!fx||!Array.isArray(fx.from)||!Array.isArray(fx.to))return false;
  const U=fx.from,V=fx.to;
  if(U.length!==2||V.length!==2||![...U,...V].every(Number.isFinite))return false;
  const t0=clip(t),k=clip(s||1,.60,1.25),frame=Math.min(7,Math.floor(t0*8)),phase=t0*TAU*2;
  const from=[U[0],U[1]],to=[V[0],V[1]],dist=Math.hypot(to[0]-from[0],to[1]-from[1])||1;
  const ux=(to[0]-from[0])/dist,uy=(to[1]-from[1])/dist,nx=-uy,ny=ux;
  const point=(u,off=0)=>[lerp(from[0],to[0],u)+nx*off*k,lerp(from[1],to[1],u)+ny*off*k];
  const end=to,push=ease((t0-.13)/.65),hit=ease((t0-.60)/.22),fade=clip((1-t0)*5);
  const center=point(push);
  const at=(base,a,b)=>[base[0]+a*k,base[1]+b*k];
  g.save();try{
   switch(mode){
    case 'aura':{
     const p=point(ease((t0-.20)/.65)),r=(12+7*Math.sin(t0*PI))*k;
     for(let i=0;i<4;i++)arc(g,p[0],p[1],r*(.95+i*.22),phase*(i%2?-.6:.8)+i,phase*(i%2?-.6:.8)+i+PI*.7,'#16acf8',2.1*k,fade*.8);
     ellipse(g,p[0],p[1],r,r,'#086bc3',fade,3);ellipse(g,p[0]-r*.16,p[1]-r*.16,r*.63,r*.59,'#74d9ff',fade,1.3);
     ellipse(g,p[0]-r*.2,p[1]-r*.19,r*.31,r*.31,'#f0ffff',fade,0);
     spatter(g,p[0],p[1],r*1.7,19,'#21a9ff',t0,8,low);
     if(hit)spatter(g,end[0],end[1],36*k,28,'#b1f3ff',hit,81,low);
     break;
    }
    case 'dragonpulse': case 'breath':{
     const p=point(push),r=(mode==='breath'?13:18)*k;
     for(let j=0;j<(low?4:7);j++){
      const q=clip(push-j*.12);if(q<=0)continue;const b=point(q,Math.sin(phase+j)*10);
      flame(g,b[0],b[1],r*(.6+j*.075),r*2.1,t0+j,mode==='breath'?'#38b9ff':'#8853f6');
     }
     if(mode==='dragonpulse'){
      polygon(g,[at(p,-r*1.1,-r*.55),at(p,r*.05,-r*.85),at(p,r*.96,-r*.14),
      at(p,r*.4,r*.35),at(p,r*.9,r*.85),at(p,-r*.22,r*.56)],'#6f3acb',fade,'#081025',3);
      ellipse(g,p[0]+r*.21,p[1]-r*.20,r*.13,r*.13,'#d8e4ff',fade,.6);
     } else ray(g,point(.05),p,'#1670d9','#bdffff',8*k,fade*.9);
     spatter(g,p[0],p[1],24*k,13,mode==='breath'?'#ff812f':'#b17bff',push,9,low);
     if(hit)spatter(g,end[0],end[1],38*k,22,'#86d8ff',hit,34,low);break;
    }
    case 'claw': case 'cross':case 'fury':case 'windslash':case 'tail':{
     const n=mode==='claw'?3:mode==='cross'?2:mode==='fury'?Math.max(1,Math.ceil(t0*5)):mode==='tail'?1:4;
     const col=mode==='claw'?'#a65fff':mode==='windslash'?'#b7eaff':mode==='tail'?'#cadfe9':mode==='cross'?'#8cf13b':'#baf554';
     for(let j=0;j<n;j++){
      const shift=mode==='cross'?0:(j-(n-1)/2)*9*k;
      const r=mode==='windslash'?49*k:mode==='tail'?53*k:42*k;
      const a=(mode==='cross'?(j?-.9:.9):-.78)+(mode==='fury'?Math.sin(j*3)*.23:0);
      const x=end[0]+shift*nx,y=end[1]+shift*ny;
      const q=clip((t0-.13-j*.075)/.57);
      if(q<=0)continue;
      const p1=[x-r*.65,y-r*.80],p2=[x+r*.52,y+r*.78];
      g.save();g.translate(x,y);g.rotate(a);
      const shape=[[-r*.72,-r*.45],[-r*.3,-r*.48],[r*.53,-r*.32],[r*.85,0],[r*.52,r*.19],[-r*.24,r*.27]];
      polygon(g,shape.map(([px,py])=>[px,py*q]),col,fade,'#050c16',2.5);
      line(g,[[-r*.5,-r*.19],[r*.6,-r*.02]],2*k,'#fff',fade,0);
      g.restore();
      spatter(g,p2[0],p2[1],r*.68,6,col,q,20+j,low);
     }
     break;
    }
    case 'earth':case 'stoneedge':case 'magma':case 'dig':case 'rockfall':{
     const x=end[0],y=end[1]+22*k;
     ellipse(g,x,y+9*k,60*k,14*k,'#29251d',clip(t0*6)*fade,3);
     for(let j=0;j<(mode==='stoneedge'?9:6);j++){
      const spread=(j-2.5)*(mode==='stoneedge'?13:18)*k;
      const q=ease((t0-.12-j*.036)/.45),h=(22+26*rng(j+2))*q*k,xx=x+spread;
      line(g,[[x,y+5*k],[xx,y+3*k],[xx+spread*.24,y+12*k]],2.7,'#f0b353',q*fade,1.5);
      if(mode==='stoneedge'||mode==='earth'||mode==='magma'){
       polygon(g,[[xx-8*k,y],[xx-5*k,y-h*.42],[xx+(j%2?0:7)*k,y-h],
       [xx+9*k,y-h*.25],[xx+11*k,y]],mode==='stoneedge'?'#96866e':mode==='magma'?'#b94c24':'#c4a56c',q*fade,'#15130f',2.5);
       line(g,[[xx-3*k,y-h*.25],[xx+2*k,y-h*.77]],1.4,mode==='magma'?'#ffe18b':'#f6d58e',q,0);
      }
     }
     if(mode==='rockfall')for(let j=0;j<10;j++){
      const q=ease((t0-.08-j*.033)/.70),yy=y-(1-q)*(90+j%4*23)*k;
      stone(g,x+(j-4.5)*13*k,yy,7*k+(j%3)*3*k,j);
     }
     if(mode==='dig'){
      ellipse(g,from[0],from[1]+23*k,35*k,9*k,'#17130d',clip(t0*8)*fade,3);
      spatter(g,from[0],from[1]+12*k,25*k,11,'#b58c55',t0,31,low);
     }
     if(mode==='magma')for(let j=0;j<5;j++){
       let xx=x+(j-2)*22*k,yy=y-(20+j%3*18)*ease((t0-.15)/.55)*k;
       flame(g,xx,yy,8*k,29*k,t0+j,'#ff7c26');
     }
     if(hit)spatter(g,x,y,52*k,22,mode==='magma'?'#ff7b1e':'#d3bd86',hit,6,low);break;
    }
    case 'rush':case 'extreme':case 'aquajet':{
     const p=point(ease((t0-.06)/.65));
     const cc=mode==='aquajet'?'#68d6ff':'#ecffff',wide=mode==='extreme'?44:32;
     for(let j=0;j<8;j++){
      const q=clip(push-j*.065);if(!q)continue;
      const a=point(q,Math.sin(j*2.1+phase)*4);
      line(g,[at(a,-wide*.85,-3),at(a,wide*.35,1)],Math.max(1,(7-j*.6)*k),cc,fade*(.77-j*.07),2);
     }
     if(mode==='aquajet'){
      polygon(g,[[p[0]-24*k*ux+18*k*nx,p[1]-24*k*uy+18*k*ny],
       [p[0]+32*k*ux,p[1]+32*k*uy],[p[0]-26*k*ux-18*k*nx,p[1]-26*k*uy-18*k*ny]],
        '#31a6ef',fade,'#081b31',2.7);
      for(let j=0;j<9;j++)ellipse(g,p[0]-j*5*k*ux+Math.sin(j*2)*11*k*nx,
       p[1]-j*5*k*uy+Math.sin(j*2)*11*k*ny,2*k,4*k,'#a7f8ff',fade*.8,.6);
     }else sparkle(g,p[0],p[1],10*k,mode==='extreme'?'#fffbc6':'#efffff',fade);
     if(hit)spatter(g,end[0],end[1],39*k,17,cc,hit,23,low);break;
    }
    case 'copies':{
     // No fabricated human/Pokémon silhouettes: mirrored motion echoes around
     // the ACTUAL Pokémon are added by the optional game draw integration.
     for(let j=0;j<5;j++){
      const theta=TAU*(j/5+t0*.12),r=(19+24*ease((t0-.04)/.44))*k;
      const xx=from[0]+Math.cos(theta)*r,yy=from[1]+Math.sin(theta)*r*.5;
      arc(g,xx,yy,(8+3*Math.sin(t0*TAU+j))*k,theta,theta+PI*1.3,'#a2daff',3*k,fade*.77);
      sparkle(g,xx,yy,2.5*k,'#e9f9ff',fade*.7);
     }break;
    }
    case 'leafstorm':{
     // Sharp botanical vortex: many individually turning leaves, seeded
     // positions, darker undersides and fine veins, not one green projectile.
     for(let j=0;j<(low?14:25);j++){
       const q=(j/25),angle=phase*1.3+j*2.399,spiral=(7+q*50)*k;
       const cx=lerp(from[0],end[0],ease((t0-.09-q*.12)/.76));
       const cy=lerp(from[1],end[1],ease((t0-.09-q*.12)/.76));
       const px=cx+Math.cos(angle)*spiral,py=cy+Math.sin(angle)*spiral*.66;
       leaf(g,px,py,(6+j%4*2.4)*k,angle+PI*.4,j%3?'#84d64c':'#b7f866',fade);
       if(typeof sprite3511==='function'&&j%4===0)
         sprite3511(g,'leaf'+(j%4),px,py,15*k,12*k,angle,fade*.7);
     }
     if(hit)spatter(g,end[0],end[1],38*k,19,'#bcfc5c',hit,73,low);
     break;
    }
    case 'swords':{
     for(let i=0;i<4;i++){
      const a=TAU*(i/4+t0*.9),rad=(26+16*ease(t0/.4))*k;
      const x=from[0]+Math.cos(a)*rad,y=from[1]+Math.sin(a)*rad*.58;
      g.save();g.translate(x,y);g.rotate(a-PI/2);
      polygon(g,[[0,-32*k],[-5*k,-13*k],[-3*k,15*k],[3*k,15*k],[5*k,-13*k]],'#d6f7ff',fade,'#142945',2.5);
      line(g,[[-9*k,12*k],[9*k,12*k]],3.5*k,'#ffd35e',fade,1.5);
      line(g,[[0,-27*k],[0,10*k]],1.2*k,'#fff',fade,0);g.restore();
     }
     sparkle(g,from[0],from[1],7*k,'#ffe889',fade);break;
    }
    case 'bone':{
     const q=t0<.53?ease(t0/.53):1-ease((t0-.53)/.47);
     const p=point(q,Math.sin(PI*q)*(-33)),a=phase*2;
     g.save();g.translate(p[0],p[1]);g.rotate(a);
     line(g,[[-20*k,0],[20*k,0]],10*k,'#eadfc5',fade,3.6);
     for(let i of [-1,1])for(let j of [-1,1])ellipse(g,i*21*k,j*5*k,5*k,5*k,'#fff6da',fade,1.3);
     g.restore();for(let j=0;j<5;j++)spatter(g,p[0],p[1],14*k,3,'#eedbc2',q,8+j,low);break;
    }
    case 'terrain':{
     for(let j=0;j<5;j++){
      const a=TAU*j/5;
      arc(g,from[0],from[1]+36*k,(22+10*j)*k,a+t0,a+TAU*.9,'#f5d649',2.3*k,fade);
     }
     for(let j=0;j<14;j++){
      const xx=from[0]+(rng(j+40)-.5)*160*k,yy=from[1]+(rng(j+80)-.5)*76*k+33*k;
      let hh=(9+rng(j+111)*29)*k;
      line(g,[[xx-6*k,yy],[xx,yy-hh],[xx+4*k,yy-hh*.4],[xx+8*k,yy]],2.1*k,'#fff179',fade*.8);
     }break;
    }
    case 'wisp':{
     for(let j=0;j<4;j++){
      const q=ease((t0-.06-j*.095)/.68),p=point(q,Math.sin(phase+j*1.3)*(10+j*4));
      flame(g,p[0],p[1],(9+j%2*4)*k,(24+j*3)*k,phase+j,'#1499f7');
      spatter(g,p[0],p[1],14*k,5,'#6ee7ff',q,j,low);
     }break;
    }
    case 'seed':{
     const p=point(push);
     ellipse(g,p[0],p[1],14*k,12*k,'#477d28',fade,2.8);
     ellipse(g,p[0]-3*k,p[1]-4*k,5*k,4*k,'#cff176',fade,.9);
     leaf(g,p[0],p[1]-13*k,11*k,-1.0,'#74b743',fade);
     if(hit)for(let j=0;j<9;j++)leaf(g,end[0]+Math.cos(j*TAU/9)*hit*24*k,
      end[1]+Math.sin(j*TAU/9)*hit*19*k,12*k,j,'#c6e879',fade);
     break;
    }
    case 'absorb':case 'megadrain':case 'lifedrain':{
     let q=ease((t0-.17)/.59);const count=mode==='megadrain'?6:mode==='lifedrain'?4:3;
     for(let j=0;j<count;j++){
       const p=point(1-q,Math.sin(q*PI*2+j*TAU/count)*18);
       ellipse(g,p[0],p[1],(4+j%2*2.2)*k,(4+j%2*2)*k,'#70db4f',fade,1.5);
       arc(g,p[0],p[1],9*k,q*8+j,q*8+j+PI*.65,'#c2ffad',2,fade);
       line(g,[to,at(p,0,0),from],1.1*k,mode==='megadrain'?'#8dfc45':'#58d961',fade*.48,0);
     }
     if(mode==='lifedrain')for(let j=0;j<3;j++)
       polygon(g,[[end[0]-19*k+j*12*k,end[1]-9*k],[end[0]-12*k+j*12*k,end[1]+16*k],
        [end[0]-23*k+j*12*k,end[1]+12*k]],'#deec95',fade,'#203419',2);
     if(q>.65)spatter(g,from[0],from[1],23*k,17,'#baf77b',q,5,low);break;
    }
    case 'jab':case 'toxic':{
     if(mode==='jab'){
      const p=point(push);
      polygon(g,[[p[0]-22*k*ux+9*k*nx,p[1]-22*k*uy+9*k*ny],
       [p[0]+30*k*ux,p[1]+30*k*uy],[p[0]-22*k*ux-9*k*nx,p[1]-22*k*uy-9*k*ny]],
       '#b64bf0',fade,'#1b0a2b',3);
      ray(g,point(.04),p,'#8031c1','#e8b0ff',7*k,fade);
     }else{
      for(let j=0;j<9;j++){let x=end[0]+(j-4)*8*k,y=end[1]-25*k+(j%3)*7*k+push*42*k;
       ellipse(g,x,y,(4+j%3)*k,(7+j%3)*k,'#9d40ce',fade,2);
      }
     }
     if(hit)spatter(g,end[0],end[1],40*k,24,'#b445ea',hit,11,low);break;
    }
    case 'bugbuzz':case 'confuse':case 'calm':case 'recover':case 'synthesis':case 'fairy':case 'dragon dance':{
     const self=['calm','recover','synthesis','dragon dance'].includes(mode);
     const p=self?from:end, color=mode==='bugbuzz'?'#bbf258':
      mode==='confuse'?'#ef86ff':mode==='dragon dance'?'#4da9fb':
      mode==='calm'?'#e999fb':mode==='recover'?'#a1fbe6':
      mode==='synthesis'?'#fdf39c':'#ffafe3';
     if(mode==='fairy'){
       for(let j=0;j<14;j++){let q=clip(push-j*.04),px=point(q,Math.sin(j+phase)*22);
        leaf(g,px[0],px[1],(4+j%3*2)*k,j*.47+phase,color,fade);
       }
     } else if(mode==='synthesis'){
       for(let j=0;j<7;j++){
        const xx=p[0]+(j-3)*14*k;
        ray(g,[xx-13*k,p[1]-110*k],[p[0]+(j-3)*6*k,p[1]],'#e2c94b','#fff9d2',(3+j%2*2)*k,fade*.67);
       }
     } else if(mode==='dragon dance'){
       for(let j=0;j<20;j++){
        const q=j/20,theta=q*TAU*2+phase*1.4;
        ellipse(g,p[0]+Math.cos(theta)*(14+27*q)*k,p[1]+Math.sin(theta)*(14+27*q)*.8*k,
        3*k,4*k,q>.15?'#39a9ee':'#eee4ff',fade,1);
       }
     } else {
      const count=mode==='bugbuzz'?6:mode==='confuse'?4:mode==='calm'?5:3;
      for(let j=0;j<count;j++){
       const q=clip((t0-.04-j*.08)/.79),rr=(8+q*48)*k;
       arc(g,p[0],p[1],rr,phase*.15+j*.5,phase*.15+j*.5+PI*1.65,color,(mode==='bugbuzz'?2.8:2.3)*k,fade*(1-q*.55));
      }
     }
     spatter(g,p[0],p[1],(mode==='synthesis'?43:33)*k,18,color,t0,33,low);
     if(mode==='recover'||mode==='synthesis')for(let j=0;j<7;j++)
        sparkle(g,p[0]+Math.cos(j)*24*k,p[1]-easeFix(t0)*45*k+j*2*k,3*k,'#f5ffe1',fade);
     break;
    }
    case 'cannon':{
     const p=point(push);
     for(let j=0;j<5;j++)arc(g,from[0],from[1],(12+j*8)*k,phase+j,phase+j+PI*.88,'#e2edf6',2.6*k,fade);
     ray(g,point(.05),p,'#a0b5cd','#fff',19*k,fade);ray(g,point(.05),p,'#e5efff','#fff',7*k,fade);
     if(hit)spatter(g,end[0],end[1],44*k,25,'#e6f5fe',hit,75,low);break;
    }
    case 'night':{
     const p=point(push);
     for(let j=0;j<6;j++){
       const a=j*TAU/6+phase*.18,xx=p[0]+Math.cos(a)*16*k,yy=p[1]+Math.sin(a)*18*k;
       flame(g,xx,yy,6*k,17*k,phase+j,'#1499f7');
     }
     ellipse(g,p[0],p[1],21*k,22*k,'#402465',fade,2.7);
     ellipse(g,p[0]-8*k,p[1]-4*k,4*k,6*k,'#d3a0ff',fade,1);
     ellipse(g,p[0]+8*k,p[1]-4*k,4*k,6*k,'#d3a0ff',fade,1);
     polygon(g,[[p[0]-5*k,p[1]+9*k],[p[0]+5*k,p[1]+9*k],[p[0],p[1]+16*k]],'#d3a0ff',fade,'#211039',1);
     if(hit)spatter(g,end[0],end[1],43*k,19,'#8c55da',hit,5,low);break;
    }
   }
   stats.draws++;stats.last={key,frame};
  } catch(err){stats.failures++;return false;} finally{g.restore();}
  return true;
 }
 function easeFix(t){return ease(t);}
 const accepts=k=>typeof k==='string'&&!forbidden.has(k)&&Object.prototype.hasOwnProperty.call(ACTIONS,k);
 const api={accepts,paint:draw,labels,ACTIONS,inspect:()=>({...stats,count:Object.keys(ACTIONS).length,protected:[...forbidden]})};
 if(typeof window!=='undefined')window.PokemonTorreHeritage37=api;
 return api;
})();
