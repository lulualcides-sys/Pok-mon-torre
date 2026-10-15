/* V89 | Four battle-specific 12/16 frame PixiJS sprites.
 * All artwork is drawn into small GPU textures; no missing WebP or CSS VFX.
 * Original BattleEngine still owns damage, collision, cooldown and HP.
 */
var grassFourV84=(()=>{
 'use strict';
 const FW=420,FH=200;
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const smooth=v=>{v=clamp(v);return v*v*(3-2*v)};
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .toLowerCase().replace(/[^a-z0-9]/g,'');
 const specs=Object.freeze({
  chicotedevinha:{name:'Chicote de Vinha',count:12,life:1280,impact:.62,weight:'medium',kind:'lash'},
  folhanavalha:{name:'Folha Navalha',count:12,life:1430,impact:.68,weight:'medium',kind:'leaves'},
  chicotesemarea:{name:'Chicotes em Área',count:16,life:1370,impact:.67,weight:'heavy',kind:'area'},
  vinewhip:{name:'Vine Whip',count:12,life:1270,impact:.62,weight:'medium',kind:'coil'}
 });
 const accepts=k=>Object.prototype.hasOwnProperty.call(specs,k);
 const resolve=s=>{const k=norm(s);return accepts(k)?k:''};
 const sheets=new WeakMap(),statistics={casts:0,draws:0,generated:0,failures:[],last:null};
 function point(g,x,y){g.lineTo(x,y);}
 function curve(t,a,b,c,d){
  const u=1-t;return {x:u*u*u*a.x+3*u*u*t*b.x+3*u*t*t*c.x+t*t*t*d.x,
   y:u*u*u*a.y+3*u*u*t*b.y+3*u*t*t*c.y+t*t*t*d.y};
 }
 function leaf(g,x,y,rx,ry,angle,hue=0x58bd44,opacity=1){
  const cs=Math.cos(angle),sn=Math.sin(angle);
  const project=(xx,yy)=>[x+xx*cs-yy*sn,y+xx*sn+yy*cs];
  const coords=[...project(-rx,0),...project(-rx*.08,-ry),...project(rx,0),
   ...project(-rx*.07,ry)];
  g.lineStyle(2.5,0x11281b,opacity);g.beginFill(hue,opacity);
  g.drawPolygon(coords);g.endFill();
  const a=project(-rx*.72,0),b=project(rx*.75,0);
  g.lineStyle(1.35,0xc6f987,opacity*.85);g.moveTo(...a);point(g,...b);
  g.lineStyle(0);
 }
 function slash(g,pts,baseWidth,tint=0x318a39){
  if(pts.length<2)return;
  const paint=(w,color,alpha=1)=>{
   g.lineStyle(w,color,alpha,.5);g.moveTo(pts[0].x,pts[0].y);
   for(let j=1;j<pts.length;j++)point(g,pts[j].x,pts[j].y);
  };
  paint(baseWidth+6,0x0d2116);paint(baseWidth,0x2a7838);
  paint(Math.max(3,baseWidth*.48),tint,.92);
  paint(1.65,0xc3f190,.83);
 }
 function vine(g,progress,mode,frame){
  const start=mode==='coil'?{x:34,y:159}:{x:24,y:132};
  const end=mode==='coil'?{x:391,y:98}:{x:402,y:90};
  const a=mode==='coil'?{x:122,y:193}:{x:133,y:36};
  const b=mode==='coil'?{x:263,y:6}:{x:278,y:184};
  const n=Math.max(0,Math.floor(progress*44)),pts=[];
  for(let k=0;k<=n;k++){
   const t=n?progress*k/n:0;
   const q=curve(t,start,a,b,end);
   const side=(mode==='coil'?1:-1)*Math.sin(t*6.28+frame*.3)*Math.sin(t*Math.PI)*5;
   pts.push({x:q.x,y:q.y+side});
  }
  slash(g,pts,mode==='coil'?13:15,mode==='coil'?0x49aa62:0x5bb63d);
  for(let k=8;k<pts.length-2;k+=8){
   const p=pts[k],u=(k/pts.length);
   leaf(g,p.x,p.y+(k%2?8:-8),7.4,3.9,(k%2?-1:1)*.58+u*.25,
    mode==='coil'?0x54d07b:0x75d550,.91);
  }
  if(progress>.71&&progress<1){
   const p=pts[pts.length-1];if(p){
    for(let i=0;i<7;i++){const angle=i*Math.PI*2/7+frame*.19;
     leaf(g,p.x+Math.cos(angle)*12,p.y+Math.sin(angle)*11,5,2.7,angle,0xb0eb75,.8);}
   }
  }
 }
 function leafAttack(g,progress,frame){
  // A barrage of individually shaped, pointed leaves across the whole field.
  for(let i=0;i<16;i++){
   const stagger=(i%5)*.055+Math.floor(i/5)*.028;
   const q=clamp((progress-stagger)/(1-stagger));
   if(q<=.015)continue;
   const band=(i%8-3.5)*14;
   const x=50+330*smooth(q),y=103+band+Math.sin(q*8+i*1.1)*(8+q*7);
   const angle=-.18+q*5.6+(i%4)*.32;
   leaf(g,x,y,10+(i%3)*3,5+(i%2)*2,angle,
     [0x59cc49,0x328b3c,0x89df56,0x3c9e63][i%4],1-clamp((q-.90)/.10));
   if(q>.15&&q<.87){
    g.lineStyle(1.2,0x1b5f35,.45);g.moveTo(x-17,y+3);point(g,x-5,y+1);
   }
  }
 }
 function areaAttack(g,progress,frame){
  // Short, independent entangling roots anchored around the ENEMY ONLY.
  const roots=[{x:269,y:189,tx:311,ty:79,t:0},
   {x:306,y:199,tx:341,ty:49,t:.09},
   {x:345,y:195,tx:364,ty:77,t:.17},
   {x:385,y:190,tx:389,ty:69,t:.12}];
  for(let i=0;i<roots.length;i++){
   const r=roots[i],q=clamp((progress-r.t)/(1-r.t));
   if(q<.01)continue;
   const a={x:r.x-30,y:129},b={x:r.tx+30-i*10,y:104};
   const steps=Math.max(2,Math.floor(q*24)),pts=[];
   for(let j=0;j<=steps;j++){
    const u=q*j/steps,pt=curve(u,{x:r.x,y:r.y},a,b,{x:r.tx,y:r.ty});
    pts.push({x:pt.x+Math.sin(u*9+frame*.08+i)*3,y:pt.y});
   }
   slash(g,pts,12+(i%2)*4,[0x388949,0x538f43,0x3ca44e][i%3]);
   for(let j=7;j<pts.length-2;j+=9){
    const p=pts[j];leaf(g,p.x+(i%2?7:-7),p.y,5.5,3,
     i%2?-.6:.7,0x77ba42,.9);
   }
  }
  if(progress>.59){g.lineStyle(1.8,0x213b22,.7);
   g.drawEllipse(346,188,74*progress,12*progress);}
 }
 function burst(g,kind,progress,frame){
  const onset=kind==='area'?.49:kind==='leaves'?.64:.65;
  const life=clamp((progress-onset)/.30);
  if(life<=0||life>=1)return;
  const cx=kind==='area'?348:387,cy=kind==='area'?100:94;
  for(let i=0;i<10;i++){
   const a=i*2.39996+frame*.13,r=6+life*(11+i%4*5);
   const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.76;
   leaf(g,x,y,3.2+(i%3)*1.5,2.2,a,
    i%2?0x81c948:0xb0e980,.85*(1-life));
  }
 }
 function paintFrame(g,key,i,count){
  const p=i/(count-1);
  // The silhouette grows, strikes, retracts and fully dissipates at frame end.
  const approach=smooth(clamp(p/.69));
  const fade=1-smooth(clamp((p-.75)/.25));
  const reach=approach*fade;
  if(key==='folhanavalha')leafAttack(g,reach,i);
  else if(key==='chicotesemarea')areaAttack(g,reach,i);
  else vine(g,reach,key==='vinewhip'?'coil':'lash',i);
  burst(g,specs[key].kind,p,i);
 }
 function getSheet(app,key){
  const renderer=app?.renderer;
  if(!renderer||typeof renderer.generateTexture!=='function')return null;
  let cached=sheets.get(renderer);
  if(!cached){cached=new Map();sheets.set(renderer,cached);}
  if(cached.has(key))return cached.get(key);
  const result=[],count=specs[key].count;
  try{
   for(let i=0;i<count;i++){
    const graphic=new PIXI.Graphics();
    paintFrame(graphic,key,i,count);
    const texture=renderer.generateTexture(graphic,{
      resolution:1,region:new PIXI.Rectangle(0,0,FW,FH)});
    graphic.destroy();
    result.push(texture);
   }
  }catch(e){
   for(const tx of result)try{tx.destroy(true)}catch(_){}
   statistics.failures.push(String(e?.message||e));return null;
  }
  cached.set(key,result);statistics.generated+=result.length;
  return result;
 }
 function install(app,f,key){
  if(!accepts(key)||!app?.stage||!Array.isArray(f?.from)||!Array.isArray(f?.to))return null;
  const frames=getSheet(app,key);if(!frames?.length)return null;
  const root=new PIXI.Container(),sprite=new PIXI.Sprite(frames[0]),
    blend=new PIXI.Sprite(frames[0]);
  sprite.anchor.set(.5);blend.anchor.set(.5);blend.visible=false;
  root.addChild(sprite,blend);app.stage.addChild(root);
  const spec=specs[key];
  const fx={v84:true,root,sprite,blend,frames,app,f,key,spec,
    visualDuration:spec.life,ready:true,disposed:false,stage:-1,
    source:'pixi-generated-v90',lastFrame:0};
  statistics.casts++;return fx;
 }
 function animate(fx,now){
  if(!fx?.ready||fx.disposed)return;
  const {f,spec,frames,sprite,blend,app,key}=fx;
  const t=clamp((now-f.at)/fx.visualDuration);
  const impactTime=Array.isArray(f.times)&&Number.isFinite(f.times[0])?
   clamp(f.times[0]*(Number(f.duration)||fx.visualDuration)/fx.visualDuration,.25,.86):spec.impact;
  const progress=t<=impactTime?(t/impactTime)*spec.impact:
   spec.impact+(t-impactTime)/(1-impactTime)*(1-spec.impact);
  const n=frames.length,part=clamp(progress)*n,index=Math.min(n-1,Math.floor(part));
  const u=clamp(part-index);
  sprite.texture=frames[index];
  const safe=index<n-1&&index!==Math.floor(spec.impact*n)-1;
  const alpha=safe?smooth((u-.28)/.72)*.30:0;
  blend.texture=frames[Math.min(n-1,index+1)];blend.visible=alpha>.001;
  const A=f.from,B=f.to,dx=B[0]-A[0],dy=B[1]-A[1],dist=Math.hypot(dx,dy)||1;
  const isArea=key==='chicotesemarea';
  const width=isArea?
   Math.min(app.screen.width*.66,Math.max(132,dist*.78)):
   Math.min(app.screen.width*.94,Math.max(150,dist*1.15));
  const height=width*FH/FW*(isArea?.86:1);
  const x=isArea?B[0]-(345-FW/2)*width/FW:(A[0]+B[0])/2;
  const y=isArea?B[1]-(103-FH/2)*height/FH:(A[1]+B[1])/2;
  const rotation=isArea?0:Math.atan2(dy,dx);
  for(const sp of [sprite,blend]){
   sp.position.set(x,y);sp.width=width;sp.height=height;sp.rotation=rotation;
  }
  sprite.alpha=(1-alpha)*(index===n-1?clamp((1-t)*13):1);
  blend.alpha=alpha*sprite.alpha;fx.stage=index;fx.lastFrame=index+1;
  statistics.draws++;statistics.last={move:spec.name,frame:index+1,
   total:n,width:Math.round(width),origin:fx.source};
 }
 function dispose(fx){
  if(!fx||fx.disposed)return;
  fx.disposed=true;fx.ready=false;fx.frames=[];
  // The central Pixi owner destroys its root; cached textures are renderer scoped.
 }
 function diagnostics(){return {...statistics,version:'90.0',
  frames:Object.fromEntries(Object.values(specs).map(s=>[s.name,s.count]))};}
 if(typeof window!=='undefined'){
  window.PokemonTorreGrassFourPreviewV84={version:'90.0',enabled:true,
   diagnostics,renderer:'PixiJS GPU-generated 12/16 frame sprites'};
 }
 // The shared pixi-layer diagnostics have referenced source() since V84.
 // Keep this method even when frames are authored on the GPU and have no URL.
 const source=key=>accepts(key)?'pixi-generated-v90:'+key:'';
 return {accepts,resolve,source,install,animate,dispose,specs,diagnostics};
})();
