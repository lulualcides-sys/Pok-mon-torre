/* Pokémon Torre V174 regional — pixel-art environments rendered ONCE with
 * the EXISTING PixiJS WebGL renderer; combat stays 2D and unchanged.
 * No Three.js, extra WebGL context, Canvas2D painter, external asset, CSS scene,
 * dynamic shadow pass, save mutation or edits to approved moves.
 * Preview only in torre-v174-light-2p5d-lab.html.
 */
(()=>{
'use strict';
const query=new URLSearchParams(location.search);
const specs=[
 {id:'rock',place:'Grutas de Pewter',leader:'Brock',sky:0x9d9f91,wall:0x656d62,floor:0x817f70,deep:0x393f3c,tile:0x9a9984,edge:0xd3ceb3,light:0xece3ca,detail:0x51554c},
 {id:'water',place:'Piscinas de Cerulean',leader:'Misty',sky:0x78a9b8,wall:0x387d94,floor:0x437e9c,deep:0x17475e,tile:0x60acc4,edge:0xc0eafa,light:0xe0faff,detail:0x27718b},
 {id:'electric',place:'Usina de Vermilion',leader:'Lt. Surge',sky:0x8a9aa0,wall:0x586b78,floor:0x737f77,deep:0x253c47,tile:0x899797,edge:0xf3db78,light:0xfff1ba,detail:0x414b52},
 {id:'grass',place:'Jardins de Celadon',leader:'Erika',sky:0x9bbd95,wall:0x53795c,floor:0x567f51,deep:0x284d39,tile:0x7eac6c,edge:0xe5dca3,light:0xfaf2c9,detail:0x315d38},
 {id:'poison',place:'Dojo Oculto de Fuchsia',leader:'Koga',sky:0x9696ad,wall:0x5a5476,floor:0x665c79,deep:0x30253c,tile:0x867e9b,edge:0xc9a8cc,light:0xefd4ed,detail:0x443f62},
 {id:'psychic',place:'Salão de Saffron',leader:'Sabrina',sky:0x9d8ebc,wall:0x594977,floor:0x75618c,deep:0x2d2447,tile:0x9783a9,edge:0xf0c2ff,light:0xffe5ff,detail:0x494268},
 {id:'fire',place:'Cratera de Cinnabar',leader:'Blaine',sky:0xb97f68,wall:0x634942,floor:0x625451,deep:0x302d37,tile:0x8a6557,edge:0xf3a35a,light:0xffd79a,detail:0x413d40},
 {id:'ground',place:'Ruínas de Viridian',leader:'Giovanni',sky:0xa3a087,wall:0x736a50,floor:0x8c7d57,deep:0x3c3b31,tile:0xb09c6c,edge:0xd6c499,light:0xf1deb3,detail:0x65533d}
];
const info={installed:true,enabled:!!window.__V174_LAB&&query.get('arena_lab')==='regional174'&&query.get('safe')!=='1',
 version:'174.1-regional-pixel',renderer:'shared-PixiJS-WebGL-snapshot',three:false,extraWebGLContexts:0,
 canvas2dScenePainters:0,dynamicShadowPasses:0,regionCount:specs.length,cachedRooms:0,
 generated:0,applied:0,frames:0,region:null,leader:null,variant:null,leaderRoom:false,
 drawFps:0,errors:[],campaignUntouched:true,approvedMovesUntouched:true,sandboxOnly:true};
const api=Object.freeze({diagnostics:()=>({...info,errors:info.errors.slice()}),
 regions:()=>specs.map((s,i)=>({index:i,type:s.id,region:s.place,leader:s.leader})),
 themeFor:(gym,stage=0)=>choice(gym,stage)});
window.PokemonTorreV174Regional=api;
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
function choice(gym,stage=0){
 const test=query.get('arena174'),forced=/^[0-7]$/.test(test||'')?Number(test):null;
 const g=forced===null?clamp(Number(gym)||0,0,7):forced;
 const n=Math.max(0,Number(stage)||0);
 const limit=(typeof v29TrainerCount==='function')?v29TrainerCount(g):13+g*2;
 const leader=forced!==null?query.get('boss174')==='1':n>=limit;
 return {gym:g,stage:n,theme:specs[g].id,region:specs[g].place,leader:specs[g].leader,
  variant:leader?'leader':n%3,leaderRoom:leader,key:g+':'+(leader?'leader':n%3)};
}
if(!info.enabled||typeof BattleEngine!=='function')return;
const originalBg=BattleEngine.prototype.generateBackdrop;
const originalDraw=BattleEngine.prototype.draw;
const cache=new Map(), pending=new WeakMap();
let nextTry=0,lastFps=performance.now(),sampleFrames=0;
const PIXEL_W=480,PIXEL_H=300;
function err(e){
 const message=String(e?.message||e);
 if(!info.errors.includes(message))info.errors.push(message);
 if(info.errors.length>8)info.errors.shift();
}
function makeArtwork(PIXI,sel){
 const s=specs[sel.gym],g=new PIXI.Graphics();
 let seed=((sel.gym+17)*1117+(sel.variant==='leader'?9877:Number(sel.variant)*917))|0;
 const rng=()=>((seed=(Math.imul(seed,1664525)+1013904223)|0)>>>0)/4294967296;
 const r=(x,y,w,h,c)=>g.beginFill(c).drawRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h))).endFill();
 const path=(pts,color,w=1)=>{g.lineStyle(w,color,1,0);g.moveTo(Math.round(pts[0][0]),Math.round(pts[0][1]));
  for(let i=1;i<pts.length;i++)g.lineTo(Math.round(pts[i][0]),Math.round(pts[i][1]));g.lineStyle(0);};
 const diamond=(x,y,rx,ry,c)=>{
  g.beginFill(c).drawPolygon([x,y-ry,x+rx,y,x,y+ry,x-rx,y]).endFill();
 };
 const outline=(x,y,w,h,ink,fill)=>{
  r(x-2,y-2,w+4,h+4,ink);r(x,y,w,h,fill);r(x+2,y+2,w-4,2,s.light);
 };
 const pillar=(x,y,c=s.wall)=>{
  r(x-7,y+8,17,7,s.deep);outline(x-6,y-22,14,31,s.deep,c);r(x-9,y-23,20,5,s.tile);r(x-7,y+5,17,5,s.edge);
 };
 const stone=(x,y,n=1)=>{
  r(x-8*n,y+3*n,18*n,4*n,s.deep);
  diamond(x,y,9*n,6*n,s.wall);r(x-5*n,y-3*n,7*n,2*n,s.edge);r(x+3*n,y+1*n,4*n,2*n,s.deep);
 };
 const grass=(x,y)=>{
  r(x-1,y-7,2,10,s.detail);r(x-7,y-6,3,7,0x4a8c53);r(x+4,y-5,2,7,0x65ad61);
  r(x-3,y-3,3,3,0x99c66e);
 };
 const flower=(x,y,c)=>{
  r(x,y-3,2,9,0x34523b);for(const [dx,dy] of [[-3,-2],[3,-2],[0,-5],[0,2]])r(x+dx,y+dy,3,3,c);
  r(x,y-2,2,3,0xffe5a3);
 };
 const crystal=(x,y,c=s.edge)=>{
  r(x-7,y+4,16,5,s.deep);diamond(x,y,7,15,c);r(x-2,y-10,2,14,s.light);r(x+3,y-2,2,9,s.detail);
 };
 const water=(x,y,w,h)=>{
  r(x-2,y-2,w+4,h+4,s.deep);r(x,y,w,h,0x2d86ad);
  for(let k=0;k<Math.ceil(w/18);k++){const xx=x+k*18+4,yy=y+((k*13)%Math.max(4,h-8));
   r(xx,yy,9,2,0x98e8f1);r(xx+3,yy+3,8,2,0x5bb8d4);}
 };
 const lava=(x,y,w,h)=>{
  r(x-2,y-2,w+4,h+4,s.deep);r(x,y,w,h,0x8e392d);
  for(let k=0;k<Math.ceil(w/15);k++){let xx=x+k*15+2,yy=y+((k*7)%Math.max(4,h-6));
   r(xx,yy,11,3,0xe37d36);r(xx+3,yy+1,4,2,0xffd17b);}
 };
 const vine=(x,y)=>{
  r(x,y,3,20,0x326247);r(x-5,y+4,7,3,0x74b568);r(x+2,y+10,7,3,0x5ca055);
 };
 const torch=(x,y,c=s.edge)=>{
  r(x-6,y+7,13,4,s.deep);r(x-3,y+2,7,9,s.wall);r(x-5,y-3,11,7,c);r(x-2,y-7,6,5,s.light);
 };
 // Fixed low-resolution framebuffer: nearest-neighbour pixel art, no texture fetch.
 r(0,0,480,300,s.deep);
 r(0,0,480,62,s.sky);
 for(let y=0;y<68;y+=9){
  for(let x=0;x<480;x+=28){
   if(rng()>.40)r(x+Math.floor(rng()*8),y+Math.floor(rng()*4),4+Math.floor(rng()*14),2,s.light);
  }
 }
 // Back wall, columns and trim establish simple 2.5D occlusion.
 r(0,55,480,35,s.deep);r(9,60,462,28,s.wall);
 for(let x=11;x<470;x+=31){
  r(x,66,28,2,s.tile);r(x+(Math.floor(x/31)%2)*7,76,19,2,s.detail);
 }
 r(0,86,480,5,s.edge);r(0,91,480,7,s.deep);
 // Background: tiled ground with wider perspective rows toward the player.
 r(0,98,480,202,s.floor);
 for(let y=101,row=0;y<300;row++,y+=13+row*2.2){
  const tileWidth=20+row*4;
  const offset=(row%2)*tileWidth*.5;
  for(let x=-tileWidth+offset;x<480;x+=tileWidth){
   r(x+1,y,tileWidth-2,1,(row%3===0)?s.edge:s.detail);
   if(rng()>.48)r(x+Math.floor(rng()*(tileWidth-7))+3,y+4,4+Math.floor(rng()*4),2,(rng()>.5)?s.tile:s.detail);
  }
 }
 // The actual walkable lanes stay clear of tall scenery and attack effects.
 r(75,106,330,2,s.edge);
 r(76,282,328,2,s.deep);
 r(76,106,2,176,s.deep);r(403,106,2,176,s.deep);
 for(let i=0;i<12;i++){const x=99+i*24;r(x,108,12,1,s.tile);r(x,277,12,1,s.tile);}
 // Low pixel crest with region-specific ring and a boss-only inner insignia.
 const cx=240,cy=192;
 g.lineStyle(2,s.deep,1,0).drawEllipse(cx,cy,93,45);
 g.lineStyle(2,s.tile,1,0).drawEllipse(cx,cy,85,39);
 g.lineStyle(0);
 for(let i=0;i<12;i++){const a=i*Math.PI/6,x=Math.round(cx+85*Math.cos(a)),y=Math.round(cy+39*Math.sin(a));
  r(x-2,y-1,4,2,s.edge);}
 if(sel.leaderRoom){
  diamond(cx,cy,20,14,s.deep);diamond(cx,cy,15,10,s.edge);
  diamond(cx,cy,8,5,s.light);
 }else{
  diamond(cx,cy,8,4,s.tile);
 }
 // Thematic left/right perimeter props; all behind the 2D battle actors.
 for(let side=0;side<2;side++){
  const x=side?443:37;
  for(let j=0;j<3;j++){
   const y=122+j*64,dx=Math.floor(rng()*10)-5;
   switch(sel.gym){
    case 0: stone(x+dx,y,1.3);pillar(x,y-18,s.wall);break;
    case 1: water(x-16,y-10,33,28);stone(x+dx,y+18);break;
    case 2: outline(x-11,y-16,24,31,s.deep,s.wall);r(x-7,y-11,15,5,s.edge);r(x+3,y+1,3,8,0xf0c441);break;
    case 3: grass(x-12,y);grass(x+12,y+12);flower(x,y-7,j%2?0xf4a3ca:0xffd887);break;
    case 4: pillar(x+dx,y,s.deep);vine(x-15,y-10);vine(x+13,y-7);break;
    case 5: crystal(x,y,s.edge);stone(x-13,y+16);break;
    case 6: lava(x-16,y-11,31,26);stone(x+5,y+20);break;
    case 7: pillar(x+dx,y,s.wall);stone(x+11,y+17,1.4);break;
   }
  }
 }
 // Architecture and environment unique to each region and leader.
 switch(sel.gym){
  case 0: // Brock: Pewter rock gym, caves, cut stone and fossil edges.
   for(let x=0;x<480;x+=54){r(x,24,34,13,0x62655e);r(x+9,38,27,8,0x4f554e);}
   pillar(120,86);pillar(360,86);stone(87,89,1.25);stone(395,89,1.25);break;
  case 1: // Misty: falls and pools around tiled arena.
   for(let x of [16,425])water(x,97,39,182);
   for(let x=168;x<312;x+=16){r(x,59,8,27,0x4aa9cf);r(x+4,66,3,15,0xb0edf1);}
   for(let x of [140,331]){r(x,73,8,10,0x8fd3e4);r(x+1,68,5,4,s.light);}break;
  case 2: // Surge: generators, copper piping and danger strips.
   for(let x of [86,394]){r(x-14,57,27,31,s.deep);r(x-10,61,19,21,s.tile);r(x-3,65,7,13,s.edge);}
   for(let x=0;x<480;x+=18){r(x,93,10,3,0xf5d368);}break;
  case 3: // Erika: glasshouse trellises, vines and petals.
   for(let x=20;x<480;x+=47){vine(x,58);if(rng()>.4)flower(x+9,93,0xffb8ce);}
   for(let x of [127,348]){r(x-8,57,16,29,0x3f6744);r(x-18,49,36,11,0x74a464);r(x-11,42,22,11,0x91bd72);}break;
  case 4: // Koga: narrow purple temple and bamboo.
   for(let x=17;x<480;x+=42){r(x,58,3,32,0x3e503d);r(x-3,67,11,2,0x899368);}
   r(167,55,145,8,s.deep);r(188,44,102,15,s.wall);break;
  case 5: // Sabrina: concentric psychic conduits.
   for(let x of [97,383]){crystal(x,67,0xd5abf5);r(x-16,85,32,3,0xeeceff);}
   for(let x=154;x<=324;x+=34){r(x,61,13,2,0xd9a6e8);r(x+4,67,6,12,0x715fa3);}break;
  case 6: // Blaine: molten fissures and scorched masonry.
   lava(8,94,48,190);lava(424,94,48,190);
   for(let x of [141,339])torch(x,72,0xf18942);
   for(let x=0;x<480;x+=45){r(x,54,25,5,0x493438);r(x+5,59,18,3,0xaa5140);}break;
  case 7: // Giovanni: fossils, cracked ruin floor.
   pillar(123,90,s.tile);pillar(357,90,s.tile);
   for(let x of [36,440]){stone(x,107,1.3);stone(x,286);}
   for(let x=100;x<450;x+=66)path([[x,256],[x+6,264],[x-2,272]],s.deep,2);break;
 }
 // Boss room has prominent leader-specific gate; normal trainers keep a smaller door.
 const archX=201,archW=78;
 r(archX-9,39,archW+18,52,s.deep);
 r(archX-3,44,archW+6,42,s.wall);
 r(archX+9,53,archW-18,34,s.deep);
 r(archX+16,59,archW-32,24,sel.leaderRoom?s.detail:s.wall);
 r(archX-11,37,archW+22,6,s.tile);
 r(archX-14,89,archW+28,3,s.edge);
 if(sel.leaderRoom){
  for(let x=archX-28;x<=archX+archW+28;x+=10)r(x,34,5,5,s.edge);
  torch(archX-28,78);torch(archX+archW+28,78);
  r(archX+33,56,12,12,s.edge);r(archX+36,58,6,8,s.light);
 }
 // Scattered pixel props only on exterior corridors.
 for(let k=0;k<26;k++){
  const x=rng()>.5?8+Math.floor(rng()*55):418+Math.floor(rng()*54),y=106+Math.floor(rng()*186);
  if(sel.gym===3||sel.gym===4){if(rng()>.35)grass(x,y);}
  else if(sel.gym===1){r(x,y,4,2,0xa5dff0);}
  else if(sel.gym===6){r(x,y,3,2,rng()>.5?0xe9783c:s.deep);}
  else {r(x,y,2+Math.floor(rng()*6),2,rng()>.5?s.tile:s.deep);}
 }
 return g;
}
function apply(e,selected){
 const cached=cache.get(selected.key);
 if(!cached?.ready)return false;
 if(e.bg!==cached.image){e.bg=cached.image;info.applied++;}
 info.region=selected.region;info.leader=selected.leader;info.variant=selected.variant;info.leaderRoom=selected.leaderRoom;
 return true;
}
async function renderRoom(e,sel,bridge){
 const PIXI=window.PIXI,shared=bridge(e);
 if(!shared?.app?.renderer?.gl||!PIXI?.Graphics)return false;
 const app=shared.app;const root=makeArtwork(PIXI,sel);
 let url;
 try{
  // Extract ONCE per theme via the existing V174 Pixi renderer, no new GPU layer.
  const extracted=app.renderer.extract;
  if(typeof extracted?.base64!=='function')throw Error('Pixi WebGL extract unavailable');
  url=await extracted.base64(root,'image/png',1);
 }finally{root.destroy({children:true});}
 if(!url||!url.startsWith('data:image/'))throw Error('Pixel arena extraction returned no image');
 const image=new Image();
 const item={image,ready:false};cache.set(sel.key,item);
 while(cache.size>4){const first=cache.keys().next().value;cache.delete(first);}
 image.onload=()=>{
  if(image.naturalWidth<PIXEL_W||image.naturalHeight<PIXEL_H){cache.delete(sel.key);err('V174 regional pixel dimensions');return;}
  item.ready=true;info.generated++;info.cachedRooms=[...cache.values()].filter(x=>x.ready).length;
  if(e.canvas?.isConnected&&choice(save.gym,save.stage).key===sel.key)apply(e,sel);
 };
 image.onerror=()=>{cache.delete(sel.key);err('V174 regional scene load');};
 image.src=url;
 return true;
}
function update(e){
 if(!e?.canvas?.isConnected||!battle?.active||!e.w||!e.h)return;
 const s=choice(save.gym,save.stage);
 if(apply(e,s))return;
 if(cache.has(s.key))return;
 if(pending.get(e)===s.key||performance.now()<nextTry)return;
 const bridge=window.PokemonTorrePixelFlyingBridge?.labStage;
 if(typeof bridge!=='function'){nextTry=performance.now()+1500;return;}
 pending.set(e,s.key);
 renderRoom(e,s,bridge)
  .then(ok=>{if(!ok)nextTry=performance.now()+1100;})
  .catch(ex=>{err(ex);nextTry=performance.now()+1500;})
  .finally(()=>{if(pending.get(e)===s.key)pending.delete(e);});
}
BattleEngine.prototype.generateBackdrop=function(){
 const value=originalBg.apply(this,arguments);
 try{update(this);}catch(ex){err(ex);}
 return value;
};
BattleEngine.prototype.draw=function(now){
 try{
  if(this.canvas?.isConnected&&battle?.active){
   update(this);info.frames++;sampleFrames++;
   if(now-lastFps>1250){info.drawFps=Math.round(sampleFrames*1000/(now-lastFps));lastFps=now;sampleFrames=0;}
   // Pixelated background and PMD sprites, still drawn by the unmodified game engine.
   if(this.ctx)this.ctx.imageSmoothingEnabled=false;
  }
 }catch(ex){err(ex);}
 return originalDraw.apply(this,arguments);
};
})();
