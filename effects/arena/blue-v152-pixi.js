/* Pokémon Torre · Arena Azul 152 · playable battle experiment only.
 * Opt-in: ?arena_lab=blue152. Live V150 stays the official default.
 * Independent WebGL Pixi arena BEHIND transparent native battle canvas.
 * Tile/prop atlas is real original pixel texture data, rasterized to GPU;
 * no CSS geometry, Canvas2D scenery, copied video frames or static PNG.
 */
(()=>{
'use strict';
if(typeof BattleEngine!=='function'||window.PokemonTorreBlue152?.installed)return;
const params=new URLSearchParams(location.search);
const enabled=params.get('arena_lab')==='blue152'&&params.get('safe')!=='1';
const nativeBackdrop=BattleEngine.prototype.generateBackdrop;
const nativeDraw=BattleEngine.prototype.draw;
const nativeDestroy=BattleEngine.prototype.destroy;
const gpu=new WeakMap(),live=new Set();
const info={installed:true,enabled,version:'152.0',format:'64px authored pixel atlas -> PixiJS/WebGL',
 starts:0,tiles:0,props:0,glows:0,frames:0,failures:0,lastError:'',contexts:0,
 preserved:'all approved Pokémon sprites, damage, attacks, controls, and campaign'};
if(!enabled){window.PokemonTorreBlue152=Object.freeze({installed:true,enabled:false,diagnostics:()=>({...info})});return;}
const P=()=>window.PIXI;
function seed(n){return()=>((n=Math.imul(n,1664525)+1013904223|0)>>>0)/4294967296;}
const pal={
 floor:[30,54,105],floor2:[36,65,128],edge:[88,121,170],grout:[9,22,49],
 wall:[21,38,75],wallLight:[68,101,147],dark:[8,18,39],
 moon:[187,237,251],glow:[76,195,255],chest:[129,86,42]
};
const SZ=64,AT=512,cols=8,mem=new Uint8Array(AT*AT*4);
function rgb(v){if(Array.isArray(v))return v;const hex=v.replace('#','');return[parseInt(hex.slice(0,2),16),parseInt(hex.slice(2,4),16),parseInt(hex.slice(4,6),16)];}
function pt(id,x,y,col,a=255){
 if(x<0||y<0||x>=SZ||y>=SZ)return;
 const ax=(id%cols)*SZ+x,ay=Math.floor(id/cols)*SZ+y,k=(ay*AT+ax)*4;
 const c=rgb(col);if(a>=255){mem[k]=c[0];mem[k+1]=c[1];mem[k+2]=c[2];mem[k+3]=255;return;}
 const f=a/255,old=mem[k+3]/255,q=f+old*(1-f);
 if(q===0)return;
 for(let j=0;j<3;j++)mem[k+j]=Math.round((c[j]*f+mem[k+j]*old*(1-f))/q);
 mem[k+3]=Math.round(q*255);
}
function box(id,x,y,w,h,color,a=255){
 const sx=Math.max(0,Math.floor(x)),sy=Math.max(0,Math.floor(y));
 for(let yy=sy;yy<Math.min(SZ,Math.ceil(y+h));yy++)
  for(let xx=sx;xx<Math.min(SZ,Math.ceil(x+w));xx++)pt(id,xx,yy,color,a);
}
function line(id,x0,y0,x1,y1,c,a=255){
 const n=Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0)));
 for(let i=0;i<=n;i++){
  let u=i/Math.max(n,1);
  pt(id,Math.round(x0+(x1-x0)*u),Math.round(y0+(y1-y0)*u),c,a);
 }
}
function poly(id,pts,c){
 let minY=Math.max(0,Math.floor(Math.min(...pts.map(p=>p[1]))));
 let maxY=Math.min(63,Math.ceil(Math.max(...pts.map(p=>p[1]))));
 for(let y=minY;y<=maxY;y++)for(let x=0;x<64;x++){
  let inside=false;
  for(let a=0,b=pts.length-1;a<pts.length;b=a++){
   const A=pts[a],B=pts[b];
   if(((A[1]>y)!==(B[1]>y))&&x<(B[0]-A[0])*(y-A[1])/(B[1]-A[1])+A[0])inside=!inside;
  }
  if(inside)pt(id,x,y,c);
 }
}
function tile(id){
 const r=seed(15022+id*1711),v=(id%6)-3;
 const base=[pal.floor[0]+v,pal.floor[1]+v*2,pal.floor[2]+v*2];
 box(id,0,0,64,64,pal.grout);
 for(let y=3;y<60;y++){
  const yy=y/64,lit=Math.round((.48-yy)*9);
  box(id,3,y,57,1,base.map(k=>k+lit));
 }
 box(id,3,3,57,2,pal.edge,89);
 box(id,3,5,1,53,pal.wallLight,65);
 box(id,60,2,3,62,pal.dark,220);
 box(id,2,59,60,4,pal.dark,185);
 box(id,5,57,53,1,pal.grout,145);
 for(let i=0;i<210;i++){
  const x=5+(r()*53|0),y=6+(r()*50|0),amount=(r()-.54)*23;
  pt(id,x,y,[Math.max(0,base[0]+amount|0),Math.max(0,base[1]+amount|0),Math.max(0,base[2]+amount|0)]);
  if(r()>.77)pt(id,x+1,y,base.map(t=>Math.max(0,t-18)),170);
 }
 // Natural hairline fractures: small, branching, not full-tile neon strokes.
 if(id%3===1){
  let x=13+(r()*40|0),y=19+(r()*27|0);
  for(let i=0;i<5;i++){const nx=x+(r()*11-5|0),ny=y+(r()*11-2|0);
   line(id,x,y,nx,ny,[16,32,67],165);x=nx;y=ny;}
 }
 // Very subtle cyan engraved chevron, characteristic of footage.
 if(id%4===0){
  const x=23+(r()*15|0),y=29+(r()*13|0);
  line(id,x-8,y-4,x,y,[70,121,173],90);
  line(id,x,y,x+8,y-4,[70,121,173],90);
 }
}
function wall(id){
 const r=seed(id*277),v=id%4*3;
 box(id,0,0,64,64,pal.grout);
 for(let y=2;y<61;y++){
  let p=Math.round((1-y/64)*18);
  box(id,2,y,60,1,[21+v+p/5|0,39+v+p/3|0,75+v+p|0]);
 }
 box(id,2,2,60,3,pal.wallLight,120);
 box(id,3,6,1,53,pal.edge,40);
 box(id,2,59,60,4,pal.dark,210);
 box(id,60,5,4,59,pal.dark,220);
 for(let i=0;i<150;i++){
  const x=4+(r()*53|0),y=6+(r()*50|0);
  pt(id,x,y,r()>.48?[64,94,144]:[12,27,59],58+(r()*130|0));
 }
 if(id===14||id===15){
  line(id,20,5,24,22,[71,138,205],125);
  line(id,24,22,17,31,[119,208,243],190);
  line(id,17,31,23,48,[67,154,230],170);
  line(id,23,48,17,60,[119,218,255],165);
 }
}
function pillar(id){
 const r=seed(701+id);
 box(id,0,0,64,64,[8,17,35],0);
 poly(id,[[8,2],[53,2],[56,61],[4,61]],[23,43,80]);
 poly(id,[[11,4],[19,4],[19,58],[8,58]],[67,100,147]);
 poly(id,[[19,4],[50,4],[52,58],[19,58]],[32,56,101]);
 box(id,4,0,53,8,[65,98,145]);
 box(id,3,55,55,9,[44,75,121]);
 box(id,6,55,50,2,[91,135,189],140);
 for(let i=0;i<54;i++)pt(id,13+(r()*36|0),10+(r()*43|0),[75,101,145],45+(r()*145|0));
}
function crystal(id){
 // True RGBA pixel sprite with separate light/shadow facets, no gradient CSS.
 const yShift=id===20?0:8;
 poly(id,[[31,2+yShift],[11,25+yShift],[14,61],[49,61],[53,26+yShift]],[74,178,233]);
 poly(id,[[31,2+yShift],[30,60],[14,61],[11,25+yShift]],[164,241,255]);
 poly(id,[[31,2+yShift],[53,26+yShift],[49,61],[30,60]],[43,112,181]);
 poly(id,[[31,5+yShift],[34,24+yShift],[31,55],[28,56]],[229,253,255]);
 poly(id,[[16,26+yShift],[29,17+yShift],[26,56],[17,54]],[207,248,255]);
 line(id,32,7+yShift,31,56,[255,255,255],235);
 line(id,14,29+yShift,15,51,[227,255,255],190);
 box(id,20,57,29,2,[192,240,250],160);
}
function rock(id){
 poly(id,[[4,53],[12,24],[23,15],[44,18],[58,39],[53,57]],[19,34,58]);
 poly(id,[[9,39],[21,17],[41,20],[31,41]],[69,95,135]);
 poly(id,[[31,41],[41,20],[57,38],[52,54]],[29,45,75]);
 poly(id,[[9,39],[31,41],[52,54],[53,58],[4,56]],[17,28,53]);
 line(id,21,19,39,21,[139,170,192],160);
}
function chest(id){
 box(id,6,30,53,25,[34,23,28]);
 poly(id,[[4,27],[20,16],[59,20],[54,35]],[158,105,44]);
 poly(id,[[5,30],[26,34],[26,53],[5,50]],[104,67,35]);
 poly(id,[[26,34],[57,28],[57,49],[26,54]],[53,38,31]);
 box(id,23,32,8,7,[255,216,92]);
 box(id,14,32,8,4,[243,185,69]);
 box(id,26,37,4,13,[112,73,26]);
}
function plinth(id){
 poly(id,[[4,38],[16,27],[52,27],[61,39],[57,58],[7,58]],[12,25,50]);
 poly(id,[[4,34],[16,20],[52,20],[60,35],[48,43],[12,43]],[58,88,127]);
 poly(id,[[13,43],[49,43],[57,55],[9,55]],[24,44,83]);
 line(id,17,23,52,23,[129,179,224],165);
}
function stairs(id){
 box(id,1,20,62,41,[12,24,49]);
 poly(id,[[0,18],[64,18],[59,37],[5,37]],[46,70,109]);
 line(id,4,20,59,20,[128,161,215],120);
 box(id,5,36,54,4,[6,17,38]);
 box(id,8,42,48,14,[25,42,73]);
 line(id,9,43,56,43,[99,149,211],94);
}
function buildAtlas(Pixi){
 for(let i=0;i<12;i++)tile(i);
 for(let i=12;i<16;i++)wall(i);
 pillar(16);pillar(17);pillar(18);
 crystal(20);crystal(21);rock(22);chest(23);plinth(24);stairs(25);
 // 64x64 glimmer sprite for reusable animated WebGL lighting, not map art.
 for(let y=0;y<64;y++)for(let x=0;x<64;x++){
  const d=Math.hypot((x-31.5)/31.5,(y-31.5)/31.5);
  const a=Math.max(0,1-d);
  pt(26,x,y,[228,249,255],Math.round(255*a*a*(3-2*a)));
 }
 // Cyan magic particle (4 sprite pixels) near player-free edges.
 for(let y=27;y<37;y++)for(let x=27;x<37;x++){
  const d=Math.hypot((x-31.5)/5,(y-31.5)/5);
  if(d<1)pt(27,x,y,d<.42?[225,255,255]:[86,208,250],Math.round((1-d)*245));
 }
 const whole=Pixi.Texture.fromBuffer(mem,AT,AT,{scaleMode:Pixi.SCALE_MODES.NEAREST});
 const base=whole.baseTexture;
 const arr=Array.from({length:28},(_,id)=>new Pixi.Texture(base,
  new Pixi.Rectangle((id%8)*64,(id/8|0)*64,64,64)));
 return{textures:arr,base};
}
function create(engine){
 const Pixi=P();if(!Pixi?.Application||!Pixi?.Texture?.fromBuffer)return null;
 const old=gpu.get(engine);if(old&&old.w===engine.w&&old.h===engine.h)return old;
 if(old)dispose(engine);
 const host=engine.canvas.parentElement;if(!host||!engine.canvas.isConnected)return null;
 const w=Math.round(engine.w),h=Math.round(engine.h),u=w/960,H=h/u;
 if(w<200||h<200)return null;
 let app=null;
 try{
  app=new Pixi.Application({width:w,height:h,backgroundColor:0x0a1a39,
   backgroundAlpha:1,antialias:false,resolution:1,autoDensity:false,
   powerPreference:'low-power'});
  if(!app.renderer?.gl)throw Error('Pixi WebGL GPU unavailable');
  const atlas=buildAtlas(Pixi),textures=atlas.textures;
  const root=new Pixi.Container();root.scale.set(u);root.sortableChildren=false;app.stage.addChild(root);
  const add=(id,x,y,bw,bh,opts={})=>{
   const sp=new Pixi.Sprite(textures[id]);sp.position.set(x,y);sp.width=bw;sp.height=bh;
   if(opts.tint)sp.tint=opts.tint;
   if(opts.alpha!=null)sp.alpha=opts.alpha;
   root.addChild(sp);return sp;
  };
  // Large handcrafted wall with inset lines and joint shadow.
  const back=Math.max(145,Math.min(193,H*.245));
  add(12,0,0,960,back);
  const wallCols=16,wallRows=Math.ceil(back/48);
  for(let row=0;row<wallRows;row++)for(let col=-1;col<=wallCols;col++){
   add(12+(row*7+col*3+19)%4,col*60+(row%2)*30,row*48,61,49);
  }
  // Recessed central gate framed by vertical stone columns and a short landing.
  add(15,424,17,112,back-22,{tint:0x435d90});
  add(16,410,7,39,back-7);add(16,528,7,39,back-7);
  for(const x of [0,162,755,913]){
   add(16,x,-5,44,back+22);
   add(17,x-6,Math.max(60,back-30),56,31);
  }
  // Stage floor: perspective in spacing, not old 3D tapered polygon strokes.
  const N=16,step=960/N,rows=Math.ceil((H-back)/60)+1;
  const floorY=t=>back+(H-back)*Math.pow(t,1.075);
  for(let row=0;row<rows;row++){
   const t0=row/rows,t1=(row+1)/rows,y0=floorY(t0),y1=floorY(t1);
   const taper=.925+.075*t0;
   for(let col=0;col<N;col++){
    const x=480+(col*step-480)*taper,wc=step*taper+.6;
    const id=(col*13+row*7+Math.floor(col/4))%12;
    const sp=add(id,x,y0,wc,y1-y0+.6);
    sp.alpha=.96;
    info.tiles++;
   }
  }
  // Long horizontal dark wall/floor boundary in the video.
  add(25,280,back-18,400,52,{alpha:.72});
  add(24,429,back-24,100,35);
  // Props live outside walk lane. Objects are sprites, not CSS boxes.
  const crystalNodes=[
   [85,back+122,72,128],[885,back+144,81,142],
   [180,Math.min(H-126,back+(H-back)*.70),70,121],
   [812,Math.min(H-130,back+(H-back)*.75),79,134]
  ];
  for(const [x,y,bw,bh] of crystalNodes){
   add(24,x-bw*.59,y-17,bw*1.18,41);
   add(20,x-bw*.5,y-bh,bw,bh);info.props++;
  }
  add(23,300,back+67,67,60);info.props++;
  for(const r of [[71,.37,38],[881,.47,44],[109,.89,46],[858,.84,49],[334,.80,22],[680,.92,32]]){
   const y=back+(H-back)*r[1];
   add(22,r[0],y-r[2],r[2]*1.2,r[2]);
   info.props++;
  }
  // Existing pixi WebGL app owns both the background and ambient bounce lights.
  const lamps=[];
  const glow=(x,y,bw,bh,alpha,tint)=>{
   const s=add(26,x-bw/2,y-bh/2,bw,bh,{alpha,tint});
   s.blendMode=Pixi.BLEND_MODES.ADD;lamps.push(s);info.glows++;return s;
  };
  glow(120,back+120,380,360,.17,0x64d8ff);
  glow(854,back+145,410,370,.19,0x76dfff);
  glow(182,Math.min(H-100,back+(H-back)*.65),330,330,.16,0x5dceff);
  glow(821,Math.min(H-110,back+(H-back)*.74),340,340,.14,0x76dfff);
  glow(480,back-24,300,220,.10,0xc4ddff);
  const shadows=[
   add(26,-200,-200,80,23,{alpha:.34,tint:0x050d1c}),
   add(26,-200,-200,80,23,{alpha:.34,tint:0x050d1c})
  ];shadows.forEach(s=>s.blendMode=Pixi.BLEND_MODES.NORMAL);
  const motes=Array.from({length:14},(_,i)=>{
   const rng=seed(15207+i*379),s=add(27,25+rng()*905,back+15+rng()*(H-back-80),
    5+rng()*6,5+rng()*6,{alpha:.42+rng()*.3});
   s.blendMode=Pixi.BLEND_MODES.ADD;return {sp:s,phase:rng()*6.28,y:s.y};
  });
  const stage=app.view;
  stage.dataset.pokemonArena='blue152';
  stage.style.cssText='position:absolute;left:0;top:0;pointer-events:none;z-index:0;max-width:none;transform-origin:top left;';
  // Canvas takes screen-space layers > GPU stage while its actual world still moves.
  engine.canvas.style.position='absolute';
  engine.canvas.style.zIndex='1';
  engine.canvas.style.background='transparent';
  host.insertBefore(stage,engine.canvas);
  const instance={app,atlas,root,engine,stage,w,h,u,lamps,shadows,motes,lastAt:0,lastLight:0};
  gpu.set(engine,instance);live.add(instance);info.contexts++;info.starts++;
  app.ticker.add(()=>{
   if(!engine.canvas.isConnected||!engine.running||!battle?.active){if(app.ticker.started)app.ticker.stop();return;}
   if(app.ticker.lastTime-instance.lastLight<40)return;
   instance.lastLight=app.ticker.lastTime;
   const t=instance.lastLight;
   for(let i=0;i<lamps.length;i++)lamps[i].alpha=.11+Math.sin(t*.0013+i*1.7)*.027;
   motes.forEach((m,i)=>{m.sp.y=m.y+Math.sin(t*.0008+m.phase)*3;
    m.sp.alpha=.24+.26*(.5+.5*Math.sin(t*.002+i));});
   info.frames++;
  });
  return instance;
 }catch(e){info.failures++;info.lastError='mount: '+String(e?.message||e);
  try{app?.destroy(true,{children:true,texture:false,baseTexture:false});}catch(_){}
  return null;}
}
function dispose(engine){
 const s=gpu.get(engine);if(!s)return;
 gpu.delete(engine);live.delete(s);
 try{s.app.destroy(true,{children:true,texture:true,baseTexture:true});}catch(e){}
 try{s.stage.remove();}catch(e){}
}
function sync(engine){
 const s=gpu.get(engine);if(!s)return;
 if(!engine.canvas.isConnected){dispose(engine);return;}
 // Follow EXACT wide-camera V98 CSS translation on the in-world Pixi art.
 s.stage.style.width=engine.canvas.style.width||'100%';
 s.stage.style.height=engine.canvas.style.height||'100%';
 s.stage.style.transform=engine.canvas.style.transform||'none';
 s.stage.style.left=engine.canvas.style.left||'0px';
 s.stage.style.top=engine.canvas.style.top||'0px';
 for(let i=0;i<2;i++){
  const o=i?engine.enemy:engine.player,p=s.shadows[i];
  p.position.set((o.x-46*s.u)/s.u,(o.y-7*s.u)/s.u);
 }
}
BattleEngine.prototype.generateBackdrop=function(){
 const result=nativeBackdrop.apply(this,arguments);
 if(!this.canvas?.isConnected||!P()?.Application)return result;
 const s=create(this);if(!s)return result; // native V97 remains on GPU failure
 // Transparent source prevents 2D engine from flattening our Pixi tiles.
 // No 2D context is requested on this placeholder.
 const empty=document.createElement('canvas');
 empty.width=Math.max(1,Math.ceil(this.w));
 empty.height=Math.max(1,Math.ceil(this.h));
 empty.complete=true;empty.naturalWidth=empty.width;empty.naturalHeight=empty.height;
 this.bg=empty;sync(this);
 return result;
};
BattleEngine.prototype.draw=function(now){
 // Alpha-enabled battle canvas is cleared to transparent each frame; game
 // still draws the original actors, attacks, aim, numbers, dodge and hit effects.
 if(gpu.has(this))this.ctx.clearRect(0,0,this.w,this.h);
 const result=nativeDraw.apply(this,arguments);
 if(gpu.has(this))sync(this);
 return result;
};
BattleEngine.prototype.destroy=function(){
 dispose(this);
 return nativeDestroy.apply(this,arguments);
};
window.PokemonTorreBlue152=Object.freeze({installed:true,enabled:true,
 diagnostics:()=>({...info,active:live.size,gpu:!![...live].find(s=>s.app?.renderer?.gl),
  // The visible game itself determines whether the background is mounted.
  mounted:[...live].some(s=>s.stage?.isConnected)})});
})();
