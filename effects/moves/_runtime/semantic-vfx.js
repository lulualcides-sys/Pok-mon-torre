/* Pokémon Torre V35.86 — semantic GPU animations.
 * No Canvas2D drawing. Animations are chosen by MOVE NAME first, then type.
 * PixiJS WebGL Graphics + true DS sprites + PixiJS Particle Emitter particles.
 */
const semanticVFX=(()=>{
'use strict';
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const palette={
 normal:[0xffecd0,0xf5c885,0x977c64],steel:[0xffffff,0xa9d3e9,0x566c7e],
 water:[0xe2fdff,0x41caff,0x277bd1],fire:[0xfff1aa,0xff872c,0xc93426],
 ice:[0xf6ffff,0x8defff,0x4fa6e8],electric:[0xffffff,0xffdf4b,0xe79420],
 grass:[0xecffd2,0x79da65,0x2d9a61],rock:[0xffe7b7,0xc29e72,0x695a49],
 ground:[0xffe4b5,0xbb8c56,0x775337],psychic:[0xffdcfc,0xd789ef,0x8e46c9],
 ghost:[0xeadfff,0x8a75c4,0x292c62],dark:[0xe5ddf4,0x8077a6,0x29263d],
 poison:[0xf5c8ef,0xa86dcb,0x674189],dragon:[0xd7fffa,0x728cf0,0x5841aa],
 bug:[0xf2ffc0,0x99ce50,0x55852d],fighting:[0xffebc4,0xe99860,0xa84b30],
 flying:[0xe1f9ff,0x8fcced,0x6393bb],fairy:[0xfff0fa,0xf2a0d7,0xba67a1]
};
const C=n=>Math.min(1,Math.max(0,n)),M=(a,b,q)=>a+(b-a)*q,PI=Math.PI,TAU=PI*2;
const profiles={
 'canhaodeferro':'cannon','canhaometalico':'cannon','flashcannon':'cannon',
 'fireblast':'fireglyph','explosaodefogo':'fireglyph',
 'surf':'wave','ondadagua':'wave','ondagigante':'wave','waterfall':'wave','cachoeira':'wave',
 'hydropump':'waterjet','hidrobomba':'waterjet','pistoladagua':'waterjet','jatodeagua':'waterjet',
 'jatodagua':'waterjet','bubblebeam':'bubbles','ondadebolhas':'bubbles','bolhas':'bubbles',
 'shadowball':'shadowball','bolasombria':'shadowball','esferaescura':'shadowball',
 'sludgebomb':'sludge','bombadelodo':'sludge','lodotoxico':'sludge',
 'thunderbolt':'lightning','thunder':'lightning','trovao':'lightning','raio':'lightning',
 'raiosolar':'solar','solarbeam':'solar','hyperbeam':'hyper','hiperraio':'hyper',
 'icebeam':'icebeam','raiodegelo':'icebeam','aurorabeam':'aurora',
 'earthquake':'quake','terremoto':'quake','rockslide':'rocks','deslizamento':'rocks',
 'razorleaf':'leaves','folhanavalha':'leaves','folhascortantes':'leaves',
 'dragonclaw':'slash','garradraconica':'slash','irontail':'strike',
 'machpunch':'strike','karatechop':'strike','soco':'strike','chute':'strike',
 'auraesfera':'orb','aurasphere':'orb'
};
function style(name,type,kind,category){
 const n=norm(name),t=type||'normal',k=kind||'bolt';
 if(profiles[n])return profiles[n];
 if(category==='status'||['status','recover','guard','shield','weather','buff','illusion'].includes(k))return 'aura';
 if(/canhao|cannon|canon/.test(n))return 'cannon';
 if(/surf|cachoeira|waterfall|ondadagua|ondadeagua|tsunami/.test(n))return 'wave';
 if(/bomba|bomb|explosion/.test(n))return t==='poison'?'sludge':t==='grass'?'leaves':'blast';
 if(/corte|slash|claw|garra|scissor|lamina|folhacort|aerocorte/.test(n))return 'slash';
 if(/punho|punch|soco|chute|kick|karate|bicada|martelo|cabecada|headbutt|cauda|tail|tackle|investida/.test(n))return 'strike';
 if(/quake|terremoto|fissura|fenda|earthpower|poderterrestre/.test(n))return 'quake';
 if(/rock|stone|pedra|avalan|meteor|cascalho|rochedo/.test(n))return 'rocks';
 if(/raiosolar|solarbeam/.test(n))return 'solar';
 if(/aurora/.test(n))return 'aurora';
 if(/icebeam|raiocongel|raiodegelo/.test(n))return 'icebeam';
 if(t==='electric'&&/thunder|trovao|raio|faisca|choque|volta|descarga|charge|volt/.test(n))return 'lightning';
 if(/bubble|bolha/.test(n))return 'bubbles';
 if(/sopro|breath|dragonpulse|pulsodragao/.test(n)&&t==='dragon')return 'dragonfire';
 if(/chama|fire|ember|brasa|fogo|flame|ign/.test(n))return 'flames';
 if(/ice|gelo|neve|blizzard|congela|geada|freeze|shard/.test(n))return 'ice';
 if(/folha|leaf|petala|semente|seed|chicote|vinha|plant/.test(n))return 'leaves';
 if(/wind|vento|furacao|rajada|gust|aero|airslash/.test(n))return 'wind';
 if(/lama|lodo|toxic|veneno|acid|acido|poison/.test(n))return 'sludge';
 if(/night|sombra|shadow|trevas|fantasma|ghost|dark/.test(n))return 'shadowball';
 if(k==='beam')return t==='water'?'waterjet':t==='ice'?'icebeam':t==='steel'?'cannon':'beam';
 if(k==='area'||k==='hazard')return t==='water'?'wave':t==='ground'?'quake':t==='rock'?'rocks':'storm';
 if(k==='dash'||k==='contact'||category==='physical')return 'strike';
 if(t==='water')return 'waterjet';
 if(t==='grass')return 'leaves';
 if(t==='electric')return 'lightning';
 if(t==='fire')return 'flames';
 if(t==='ice')return 'ice';
 if(t==='steel')return 'metalorb';
 if(t==='ground'||t==='rock')return 'rocks';
 if(t==='flying')return 'wind';
 if(t==='poison')return 'sludge';
 if(t==='fighting')return 'strike';
 if(t==='ghost'||t==='dark')return 'shadowball';
 return 'orb';
}
function shape(g,points,fill,alpha=1,stroke=0){
 g.lineStyle(stroke?1.8:0,stroke||0,alpha);g.beginFill(fill,alpha);
 g.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)g.lineTo(points[i][0],points[i][1]);
 g.closePath();g.endFill();
}
function star(g,x,y,r,col,alpha=1){
 g.lineStyle(2.5,col,alpha);g.moveTo(x-r,y);g.lineTo(x+r,y);g.moveTo(x,y-r);g.lineTo(x,y+r);
 g.beginFill(0xffffff,alpha);g.drawCircle(x,y,Math.max(.6,r*.16));g.endFill();
}
function ring(g,x,y,r,col,a=1,width=2){
 g.lineStyle(width,col,a);g.drawEllipse(x,y,Math.max(.01,r),Math.max(.01,r*.70));
}
function orb(g,x,y,r,c,alpha=1){
 g.beginFill(c[2],alpha*.90);g.drawCircle(x+2,y+3,r*1.17);g.endFill();
 g.beginFill(c[1],alpha);g.drawCircle(x,y,r);g.endFill();
 g.beginFill(c[0],alpha*.94);g.drawCircle(x-r*.22,y-r*.26,r*.55);g.endFill();
 star(g,x-r*.28,y-r*.24,r*.38,c[0],alpha);
}
function metal(g,x,y,r,c,alpha=1){
 g.beginFill(0x3d5264,alpha);g.drawCircle(x+2,y+3,r*1.18);g.endFill();
 g.beginFill(0x93a9bb,alpha);g.drawCircle(x,y,r);g.endFill();
 g.beginFill(0xe6f5ff,alpha);g.drawEllipse(x-r*.28,y-r*.35,r*.54,r*.43);g.endFill();
 g.lineStyle(2,0xffffff,alpha*.86);g.arc(x,y,r*.88,PI*1.09,PI*1.65);
}
function fragment(g,x,y,r,angle,c,alpha=1){
 const v=[[0,-r],[r*.68,-r*.20],[r*.42,r*.79],[-r*.38,r*.48],[-r*.8,-r*.22]];
 const p=v.map(([px,py])=>[x+Math.cos(angle)*px-Math.sin(angle)*py,y+Math.sin(angle)*px+Math.cos(angle)*py]);
 shape(g,p,c[1],alpha,c[2]);shape(g,[[x,y-r*.82],[x+r*.31,y],[x,y+r*.32],[x-r*.24,y]],c[0],alpha*.85);
}
function petal(g,x,y,r,a,c,alpha=1){
 const co=Math.cos(a),si=Math.sin(a);
 g.lineStyle(1,c[2],alpha*.5);g.beginFill(c[1],alpha);g.moveTo(x-co*r,y-si*r);g.quadraticCurveTo(x-si*r*.48,y+co*r*.48,x+co*r,y+si*r);
 g.quadraticCurveTo(x+si*r*.48,y-co*r*.48,x-co*r,y-si*r);g.endFill();
 g.lineStyle(1,c[0],alpha);g.moveTo(x-co*r,y-si*r);g.lineTo(x+co*r,y+si*r);
}
function water(g,x,y,r,c,alpha=1){
 g.beginFill(c[2],alpha*.9);g.drawEllipse(x,y+3,r*1.1,r*.85);g.endFill();
 g.beginFill(c[1],alpha*.95);g.drawEllipse(x-r*.12,y-r*.16,r*.75,r*.64);g.endFill();
 g.lineStyle(2,c[0],alpha);g.arc(x-r*.17,y-r*.21,r*.48,PI*.95,PI*1.67);
}
function bolt(g,A,B,t,c,seed,thick=6){
 const end=C((t-.19)/.37),length=Math.hypot(B[0]-A[0],B[1]-A[1])||1;
 const dx=(B[0]-A[0])/length,dy=(B[1]-A[1])/length,nx=-dy,ny=dx,count=14,points=[];
 for(let i=0;i<=count;i++){const q=i/count*end,m=(i===0||i===count)?0:Math.sin(i*17.3+seed)*11;
  points.push([M(A[0],B[0],q)+nx*m,M(A[1],B[1],q)+ny*m]);}
 g.lineStyle(thick+9,c[2],.32);g.moveTo(...points[0]);for(let i=1;i<points.length;i++)g.lineTo(...points[i]);
 g.lineStyle(thick,c[1],.92);g.moveTo(...points[0]);for(let i=1;i<points.length;i++)g.lineTo(...points[i]);
 g.lineStyle(Math.max(2,thick*.37),c[0],1);g.moveTo(...points[0]);for(let i=1;i<points.length;i++)g.lineTo(...points[i]);
}
function makeTexture(app,style,type){
 const t=palette[type]||palette.normal;
 const g=new PIXI.Graphics();
 if(style==='cannon'||type==='steel')fragment(g,15,15,12,.6,t);
 else if(type==='grass')petal(g,15,15,11,PI*.16,t);
 else if(type==='water')water(g,15,15,9,t);
 else if(type==='electric')bolt(g,[5,5],[25,25],.94,t,3,3);
 else if(type==='ice')fragment(g,15,15,11,.4,t);
 else if(type==='fire')petal(g,15,15,11,-PI*.30,t);
 else if(style==='sludge')water(g,15,15,10,t);
 else star(g,15,15,10,t[0]);
 const tex=app.renderer.generateTexture(g,{resolution:1.3,region:new PIXI.Rectangle(0,0,30,30)});
 g.destroy();return tex;
}
function create(opts){
 const {app,root,f,name,type,kind,cat,tex,particles}=opts,styleName=style(name,type,kind,cat);
 const c=palette[type]||palette.normal,A=f.from,B=f.to;
 const actor=styleName==='aura'?A:B,g=new PIXI.Graphics(),aux=new PIXI.Graphics();
 root.addChild(g,aux);
 const emitterParent=new PIXI.Container(),burstParent=new PIXI.Container();root.addChild(emitterParent,burstParent);
 const texture=makeTexture(app,styleName,type),trail=particles(emitterParent,texture,c,false),burst=particles(burstParent,texture,c,true);
 // Only theme-correct atlas sprites are used. Never tint psychic-purple frames for steel/water/ice.
 let sprites=[],fireBlast=null;
 const spec=styleName==='fireglyph'?Array.from({length:8},(_,i)=>tex('fireblast'+i)).filter(Boolean):
  styleName==='flames'?Array.from({length:5},(_,i)=>tex('flame'+i)).filter(Boolean):
  styleName==='leaves'?Array.from({length:4},(_,i)=>tex('leaf'+i)).filter(Boolean):
  styleName==='shadowball'?Array.from({length:6},(_,i)=>tex('shadow'+i)).filter(Boolean):[];
 if(spec.length){
  const n=styleName==='leaves'?11:styleName==='flames'?9:styleName==='fireglyph'?6:styleName==='shadowball'?4:0;
  for(let i=0;i<n;i++){
   const sp=new PIXI.AnimatedSprite(spec);sp.anchor.set(.5);sp.width=styleName==='fireglyph'?48:styleName==='flames'?25:styleName==='leaves'?18:26;
   sp.height=styleName==='fireglyph'?54:styleName==='flames'?32:styleName==='leaves'?23:28;
   sp.position.set(A[0],A[1]);sp.animationSpeed=.18;sp.alpha=.9;sp.play();root.addChild(sp);sprites.push(sp);
  }
 }
 let body=null;
 if(styleName==='cannon'){
  body=new PIXI.Graphics();root.addChild(body);
 }
 function draw(now,t,dt){
  g.clear();aux.clear();if(body)body.clear();
  const fade=C(Math.min(t*10,(1-t)*9)),u0=C((t-.12)/.63),u=u0*u0*(3-2*u0),hit=C((t-.66)/.34);
  const px=M(A[0],B[0],u),py=M(A[1],B[1],u),dx=B[0]-A[0],dy=B[1]-A[1],angle=Math.atan2(dy,dx),nx=-Math.sin(angle),ny=Math.cos(angle);
  const isBeam=['beam','icebeam','solar','hyper','aurora','waterjet'].includes(styleName);
  const headQ=isBeam?C((t-.20)/.35):u;
  const hx=M(A[0],B[0],headQ),hy=M(A[1],B[1],headQ);
  if(styleName==='cannon'){
   // Cannon muzzle extends from the Pokemon. Round steel barrel + internal grooves.
   if(t<.45){
    const sz=18,cs=Math.cos(angle),sn=Math.sin(angle);
    body.lineStyle(3,0x263b4c,.95);
    body.beginFill(0x72899c,.95);body.drawRoundedRect(-26,-14,50,28,8);body.endFill();
    body.beginFill(0xc5e1ef,.98);body.drawRoundedRect(-23,-12,41,12,5);body.endFill();
    body.lineStyle(4,0xf8fdff,.95);body.drawEllipse(24,0,9,13);
    body.beginFill(0x43596b);body.drawEllipse(24,0,5,9);body.endFill();
    body.position.set(A[0]+cs*22,A[1]+sn*22);body.rotation=angle;
   }
   if(t<.26){for(let j=0;j<3;j++)ring(g,A[0]+Math.cos(angle)*48,A[1]+Math.sin(angle)*48,(12+j*11)*(1-t),c[j%2],fade*.9,2);}
   if(t>.19&&t<.86){
    const bx=M(A[0],B[0],u),by=M(A[1],B[1],u);
    // Dense silver slug with bright rivets; NO purple generic beam.
    metal(g,bx,by,18,c,fade);for(let j=0;j<3;j++)metal(aux,bx-Math.cos(angle)*(20+j*15),by-Math.sin(angle)*(20+j*15),9-j*2,c,fade*(.5-j*.12));
    star(g,bx-5,by-7,13,c[0],fade);
   }
  }else if(styleName==='wave'||styleName==='waterjet'||styleName==='bubbles'){
   const isWave=styleName==='wave',width=isWave?65:styleName==='bubbles'?19:25;
   const amount=styleName==='bubbles'?12:9;
   if(isWave){
    const start=M(A[0],B[0],u*.82),end=M(A[0],B[0],u),y=M(A[1],B[1],u);
    const h=43+37*Math.sin(PI*t),w=Math.max(12,Math.abs(end-start)+80);
    const dir=dx>=0?1:-1;
    shape(g,[[end-dir*w,y+32],[end-dir*w*.85,y-18],[end-dir*w*.56,y-h],[end-dir*w*.33,y-h*.73],[end-dir*w*.16,y-h*.88],[end,y-12],[end+dir*15,y+20]],c[2],fade);
    g.lineStyle(7,c[0],fade);g.moveTo(end-dir*w*.6,y-h*.88);g.bezierCurveTo(end-dir*w*.34,y-h*1.18,end-dir*w*.14,y-h*.65,end,y-12);
   }else if(styleName==='waterjet'&&t>.12&&t<.87){
    g.lineStyle(width+14,c[2],fade*.3);g.moveTo(...A);g.lineTo(hx,hy);
    g.lineStyle(width,c[1],fade*.85);g.moveTo(...A);g.lineTo(hx,hy);
    g.lineStyle(width*.25,c[0],fade);g.moveTo(...A);g.lineTo(hx,hy);
   }
   for(let i=0;i<amount;i++){
    const q=C(u-i*.07),x=M(A[0],B[0],q)+nx*Math.sin(i*3.2+now*.014)*19;
    const y=M(A[1],B[1],q)+ny*Math.sin(i*3.2+now*.014)*19;
    water(aux,x,y,isWave?6+(i%3)*4:styleName==='bubbles'?6+(i%3)*3:5+(i%3)*2,c,fade*.8);
   }
  }else if(styleName==='lightning'){
   if(t>.16&&t<.9){bolt(g,A,B,t,c,Math.floor(now/70),8);for(let i=0;i<8;i++){
    const p=C(headQ-i*.06),x=M(A[0],B[0],p)+nx*Math.sin(i*7+now*.014)*15,y=M(A[1],B[1],p)+ny*Math.cos(i*7+now*.014)*15;
    star(aux,x,y,3+i%3,c[0],fade);}}
  }else if(styleName==='slash'||styleName==='strike'){
   const near=t<.45?px:B[0],nyy=t<.45?py:B[1],size=styleName==='slash'?48:32;
   for(let j=0;j<(styleName==='slash'?3:5);j++){
    const d=(j-2)*9,a=angle+PI/2+j*.23,sx=near+Math.cos(a)*size,sy=nyy+Math.sin(a)*size;
    g.lineStyle(12-j,c[2],fade*.40);g.moveTo(sx-30,sy+22+d);g.quadraticCurveTo(sx+size*.8,sy-20,sx+32,sy-39-d);
    g.lineStyle(4+j%2,c[0],fade);g.moveTo(sx-30,sy+22+d);g.quadraticCurveTo(sx+size*.8,sy-20,sx+32,sy-39-d);
   }
   if(styleName==='strike')orb(g,px,py,10,c,fade);
  }else if(styleName==='quake'||styleName==='rocks'){
   for(let i=0;i<11;i++){
    const x=B[0]+(i-5)*19,y=B[1]+22+(i%3)*6;
    const a=i*.35,rr=(styleName==='rocks'?14:8)+hit*(14+i%3*5);
    fragment(g,x,y-rr*hit,rr,a,c,fade*.8);
    if(styleName==='quake'){g.lineStyle(3,c[2],fade);g.moveTo(x-7,y+3);g.lineTo(x+7,y+12);g.lineTo(x+18,y+7);}
   }
  }else if(styleName==='leaves'){
   for(let i=0;i<12;i++){const q=C(u-(i%4)*.085),x=M(A[0],B[0],q)+nx*Math.sin(now*.01+i*2)*24,y=M(A[1],B[1],q)+ny*Math.cos(now*.01+i*2)*20;
    petal(g,x,y,7+i%3*3,angle+now*.006+i*.55,c,fade);}
  }else if(styleName==='fireglyph'||styleName==='flames'||styleName==='dragonfire'){
   if(t>.17&&t<.9){const width=styleName==='fireglyph'?23:12;
    g.lineStyle(width+15,c[2],fade*.45);g.moveTo(...A);g.lineTo(px,py);
    g.lineStyle(width,c[1],fade);g.moveTo(...A);g.lineTo(px,py);
    for(let i=0;i<13;i++){const q=C(u-i*.045),x=M(A[0],B[0],q)+nx*Math.sin(i*3.7+now*.009)*15,y=M(A[1],B[1],q)+ny*Math.sin(i*3.7+now*.009)*15;
     petal(aux,x,y,5+i%4*3,angle-PI*.5,c,fade*.86);}
   }
   if(styleName==='fireglyph'&&hit>0){
    // The characteristic Fire Blast five-point 大 silhouette, made from flame strokes.
    const x=B[0],y=B[1];g.lineStyle(17,c[1],fade);g.moveTo(x,y-47*hit);g.lineTo(x,y+48*hit);
    g.moveTo(x-41*hit,y-7*hit);g.lineTo(x+41*hit,y-7*hit);
    g.moveTo(x,y+7*hit);g.lineTo(x-43*hit,y+48*hit);
    g.moveTo(x,y+7*hit);g.lineTo(x+43*hit,y+48*hit);
    g.lineStyle(7,c[0],fade);g.moveTo(x,y-47*hit);g.lineTo(x,y+48*hit);
   }
  }else if(styleName==='sludge'){
   if(t>.14&&t<.89){
    const x=px,y=py;orb(g,x,y,15,c,fade);
    for(let j=0;j<9;j++){const a=j*2.4+now*.003,q=C(u-j*.06),xx=M(A[0],B[0],q)+Math.sin(a)*23,yy=M(A[1],B[1],q)+Math.cos(a)*18;
     water(aux,xx,yy,3+j%3*2,c,fade*.6);}
   }
  }else if(styleName==='aura'){
   const centre=A;
   for(let j=0;j<4;j++)ring(g,centre[0],centre[1]-j*5,(17+j*13+10*Math.sin(t*PI))*1.0,c[j%3],fade*(.85-j*.15),2.8);
   for(let j=0;j<13;j++){const a=j*2.399+now*.003,x=centre[0]+Math.cos(a)*(20+j%4*12),y=centre[1]+Math.sin(a)*(12+j%4*6)-t*15;
    star(aux,x,y,2+j%3,c[0],fade*.8);}
  }else if(styleName==='ice'||styleName==='icebeam'||styleName==='solar'||styleName==='aurora'||styleName==='hyper'||styleName==='beam'){
   if(isBeam&&t>.17&&t<.90){
    let col1=c[1],col0=c[0],col2=c[2];
    const thick=styleName==='hyper'?26:styleName==='solar'?20:styleName==='icebeam'?12:15;
    g.lineStyle(thick+20,col2,fade*.3);g.moveTo(...A);g.lineTo(hx,hy);
    g.lineStyle(thick,col1,fade*.95);g.moveTo(...A);g.lineTo(hx,hy);
    g.lineStyle(Math.max(3,thick*.28),col0,fade);g.moveTo(...A);g.lineTo(hx,hy);
    if(styleName==='aurora'){for(let j=0;j<5;j++){
     g.lineStyle(3,[0xff8ca9,0x92f8d9,0x89bdff,0xffe28b,0xcf9eff][j],fade);
     const shift=(j-2)*8;g.moveTo(A[0]+nx*shift,A[1]+ny*shift);
     g.quadraticCurveTo(hx*.5+A[0]*.5+nx*(shift+10*Math.sin(now*.01+j)),hy*.5+A[1]*.5+ny*(shift+10*Math.sin(now*.01+j)),hx+nx*shift,hy+ny*shift);
    }}
   }
   for(let j=0;j<9;j++){const q=C(u-j*.05),x=M(A[0],B[0],q)+nx*Math.sin(j*3+now*.011)*12,y=M(A[1],B[1],q)+ny*Math.sin(j*3+now*.011)*12;
    if(styleName==='ice'||styleName==='icebeam')fragment(aux,x,y,4+j%3*2,now*.004+j,c,fade);
    else star(aux,x,y,3+j%2*2,c[0],fade);}
  }else if(styleName==='shadowball'||styleName==='metalorb'||styleName==='orb'||styleName==='blast'||styleName==='bubbles'||styleName==='wind'||styleName==='storm'){
   if(t>.15&&t<.89){
    if(styleName==='metalorb')metal(g,px,py,17,c,fade);
    else orb(g,px,py,16,c,fade);
    for(let i=0;i<10;i++){const a=i*2.399+now*.008,r=13+i%4*7;
     if(styleName==='wind')ring(aux,px+Math.cos(a)*r,py+Math.sin(a)*r,3+i%3*3,c[0],fade*.8,1.3);
     else star(aux,px+Math.cos(a)*r,py+Math.sin(a)*r,2+i%2,c[0],fade*.75);}
   }
  }
  if(hit>0 && styleName!=='aura'){
   for(let i=0;i<12;i++){
    const a=i*TAU/12+now*.0004,r=8+hit*(38+i%3*7);
    if(styleName==='cannon'||styleName==='ice'||styleName==='icebeam'||styleName==='rocks'||styleName==='quake')fragment(aux,B[0]+Math.cos(a)*r,B[1]+Math.sin(a)*r,5+hit*5,a,c,fade);
    else if(styleName==='wave'||styleName==='waterjet')water(aux,B[0]+Math.cos(a)*r,B[1]+Math.sin(a)*r,5+hit*3,c,fade);
    else star(aux,B[0]+Math.cos(a)*r,B[1]+Math.sin(a)*r,4+hit*4,c[0],fade);
   }
   ring(g,B[0],B[1],12+hit*52,c[1],fade*(1-hit*.8),3);
  }
  for(let i=0;i<sprites.length;i++){
   const sp=sprites[i],q=C(u-i*.07),spread=Math.sin(now*.014+i*2.1)*12;
   sp.position.set(M(A[0],B[0],q)+Math.cos(angle+PI/2)*spread,M(A[1],B[1],q)+Math.sin(angle+PI/2)*spread);
   sp.rotation=angle+now*.003+i*.45;sp.alpha=fade*.87;
   if(styleName==='fireglyph'&&hit>.1){sp.position.set(B[0]+Math.cos(i*TAU/6)*hit*27,B[1]+Math.sin(i*TAU/6)*hit*27);sp.width=40+hit*40;sp.height=42+hit*50;}
  }
  if(trail){let tx=isBeam?hx:px,ty=isBeam?hy:py;
   if(styleName==='aura'){tx=A[0];ty=A[1];}
   if(styleName==='quake'||styleName==='rocks'||styleName==='storm'){tx=B[0];ty=B[1];}
   trail.updateOwnerPos(tx,ty);trail.emit=t>.15&&t<.82;trail.update(dt);
  }
  if(burst){burst.updateOwnerPos(B[0],B[1]);burst.emit=hit>.04&&hit<.62;burst.update(dt);}
 }
 return {style:styleName,draw,trail,burst,texture};
}
return {style,create,diagnostics:()=>({profiles:Object.keys(profiles).length})};
})();
