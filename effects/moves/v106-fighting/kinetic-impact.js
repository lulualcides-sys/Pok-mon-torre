/* Pokémon Torre V106 — quatro golpes Lutador com MASSA visual.
 * Pinta silhuetas preenchidas frame-a-frame: NÃO risco, projétil, imagem,
 * PNG estático, CSS, vídeo nem o mesmo efeito genérico para quatro ataques.
 * Inspiração geométrica do X-Scissor V68 (duas lâminas curvas cruzando), mas
 * Cross Chop é VERMELHO, físico, espesso e preso ao corpo do oponente.
 * NÃO altera movimento, alcance, energia, HP, saves ou momento do dano V104.
 */
window.PokemonTorreFightingKineticV106=(()=>{
 'use strict';
 const C=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const E=v=>{v=C(v);return v*v*(3-2*v)};
 const L=(a,b,u)=>a+(b-a)*u;
 const state={version:'106.0',frames:0,draws:{},filled:0,contactFrames:0,
  distinct:['chute','karate','cross','brick'],last:null,errors:[]};
 const palettes={
  chute:{ink:'#1b1822',dark:'#8e4626',body:'#ed9350',light:'#ffdd9a',core:'#fff7d8',glow:'#ff9e48'},
  karate:{ink:'#201a30',dark:'#574c79',body:'#b9b0df',light:'#e7dfff',core:'#ffffff',glow:'#b5a9f4'},
  cross:{ink:'#250713',dark:'#790c2c',body:'#dc1441',light:'#ff4b71',core:'#fff1f1',glow:'#fc1647'},
  brick:{ink:'#221b21',dark:'#614b42',body:'#be8c63',light:'#f1c48d',core:'#fff4cb',glow:'#ed914d'}
 };
 function shape(g,points,fill,ink,width=3,alpha=1){
  if(alpha<=0||points.length<3)return;
  g.save();g.globalAlpha*=C(alpha);g.lineJoin='round';g.lineCap='round';
  g.beginPath();g.moveTo(points[0][0],points[0][1]);
  for(const p of points.slice(1))g.lineTo(p[0],p[1]);
  g.closePath();g.fillStyle=fill;g.fill();
  if(ink){g.strokeStyle=ink;g.lineWidth=width;g.stroke();}
  g.restore();state.filled++;
 }
 function oval(g,x,y,rx,ry,col,alpha=1){
  if(alpha<=0)return;
  g.save();g.globalAlpha*=C(alpha);g.beginPath();
  g.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,Math.PI*2);
  g.fillStyle=col;g.fill();g.restore();state.filled++;
 }
 function radial(g,x,y,r,color,alpha){
  if(alpha<=0)return;
  g.save();g.globalAlpha*=C(alpha);
  const grad=g.createRadialGradient(x,y,0,x,y,r);
  grad.addColorStop(0,color);grad.addColorStop(.35,color);
  grad.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=grad;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();
  g.restore();state.filled++;
 }
 function shard(g,x,y,len,angle,palette,alpha=1){
  const v=[Math.cos(angle),Math.sin(angle)],n=[-v[1],v[0]];
  shape(g,[
   [x-v[0]*len*.3-n[0]*len*.24,y-v[1]*len*.3-n[1]*len*.24],
   [x+v[0]*len*.63,y+v[1]*len*.63],
   [x-v[0]*len*.12+n[0]*len*.20,y-v[1]*len*.12+n[1]*len*.20]
  ],palette.body,palette.ink,1.4,alpha);
  shape(g,[[x-v[0]*len*.05,y-v[1]*len*.05],
    [x+v[0]*len*.34,y+v[1]*len*.34],
    [x-v[0]*len*.07+n[0]*len*.08,y-v[1]*len*.07+n[1]*len*.08]],
    palette.core,null,0,alpha*.73);
 }
 function sprinkles(g,p,time,alpha,count=12,extent=42){
  if(alpha<=0)return;
  for(let i=0;i<count;i++){
   const a=i*2.39996+.38,travel=10+extent*E(time)*(0.56+(i%4)*.13),
    x=Math.cos(a)*travel,y=Math.sin(a)*travel*.75;
   shard(g,x,y,(3+i%4*2.4)*(1-.4*time),a,p,alpha*(.81-i%3*.12));
  }
 }
 // Cubic Bézier sampled into a CLOSED filled swept ribbon.
 // Multilayered bevel = actual 20–29px broad RED blade, no thin strokes.
 function blade(g,c,progress,width,palette,alpha){
  const total=20,steps=Math.max(2,Math.round(total*C(progress)));
  if(progress<=0)return;
  const b=(u)=>{
   const v=1-u;
   return [
    v*v*v*c[0][0]+3*v*v*u*c[1][0]+3*v*u*u*c[2][0]+u*u*u*c[3][0],
    v*v*v*c[0][1]+3*v*v*u*c[1][1]+3*v*u*u*c[2][1]+u*u*u*c[3][1]
   ];
  };
  const band=(w,fill,shadow=0)=>{
   const up=[],dn=[];
   for(let j=0;j<=steps;j++){
    const u=progress*j/steps,point=b(u),prev=b(Math.max(0,u-.02)),next=b(Math.min(1,u+.02));
    let dx=next[0]-prev[0],dy=next[1]-prev[1],d=Math.hypot(dx,dy)||1,
     nx=-dy/d,ny=dx/d;
    const taper=.20+.80*Math.pow(Math.sin(Math.PI*(u*.86+.07)),.55);
    const wid=w*taper*.50;
    up.push([point[0]+nx*wid,point[1]+ny*wid]);
    dn.push([point[0]-nx*wid,point[1]-ny*wid]);
   }
   shape(g,up.concat(dn.reverse()),fill,shadow?palette.ink:null,shadow,alpha);
  };
  band(width+9,palette.ink,0);band(width,palette.body,1.4);
  band(width*.61,palette.light,0);
  // Off-centre white cutting edge, always inside the red silhouette.
  const highlight=[];
  for(let j=0;j<=steps;j++){
   const u=progress*j/steps,p=b(u),n=b(Math.min(1,u+.018)),v=b(Math.max(0,u-.018)),
    dx=n[0]-v[0],dy=n[1]-v[1],d=Math.hypot(dx,dy)||1;
   highlight.push([p[0]-dy/d*width*.07,p[1]+dx/d*width*.07]);
  }
  g.save();g.globalAlpha*=C(alpha*.88);g.beginPath();g.moveTo(...highlight[0]);
  for(const p of highlight.slice(1))g.lineTo(...p);
  g.lineWidth=Math.max(2.1,width*.11);g.lineCap='round';g.strokeStyle=palette.core;g.stroke();g.restore();
 }
 function kick(g,t,h,p){
  const q=E((t-.25)/(h-.25)),impact=t>=h?E((t-h)/.30):0;
  if(t>=.25 && t<h){
   // A LEG and planted sole, broad polygon rather than a travelling streak.
   const off=(1-q)*34;
   shape(g,[[-44-off,-16],[-29-off,-24],[-3-off,-18],
    [9-off,-7],[12-off,5],[-9-off,13],[-22-off,8],[-43-off,-1]],
     p.body,p.ink,4.3,q);
   shape(g,[[-16-off,-13],[2-off,-14],[13-off,-7],[7-off,1],[-7-off,2]],
    p.light,null,0,q);
   oval(g,3-off,-3,8,6,p.core,q*.74);
  }
  if(t>=h){
   const fade=1-E((t-.76)/.24);
   radial(g,0,0,55+13*impact,p.glow,.37*fade*(1-impact*.4));
   shape(g,[[-37,-26],[-11,-31],[13,-23],[36,-9],[43,3],
     [18,6],[29,16],[12,28],[-15,20],[-23,8],[-42,4]],
    p.body,p.ink,5,fade);
   shape(g,[[-30,-21],[-1,-24],[22,-15],[34,-3],[11,0],[18,11],
    [4,19],[-15,11]],p.light,null,0,fade*.92);
   oval(g,7,-3,15,10,p.core,fade*(1-impact*.7));
   sprinkles(g,p,impact,fade,13,41);
  }
 }
 function karate(g,t,h,p){
  const prep=E((t-.24)/(h-.24)),hit=t>=h?E((t-h)/.28):0,
   fade=1-E((t-.82)/.18);
  if(t>=.24&&t<h){
   const offset=(1-prep)*22;
   shape(g,[[-37-offset,32],[-28-offset,5],[-21-offset,-24],
    [-8-offset,-43],[2-offset,-31],[14-offset,-10],
    [12-offset,15],[-7-offset,35]],p.body,p.ink,4,prep);
   shape(g,[[-18-offset,-23],[-9-offset,-35],[1-offset,-22],
    [7-offset,-6],[-7-offset,-9]],p.core,null,0,prep*.88);
  }
  if(t>=h){
   radial(g,0,0,49+16*hit,p.glow,fade*.27);
   // 31px wide blade shape as a filled hand-shaped chopping shock.
   blade(g,[[-32,34],[-31,-14],[18,-34],[36,-41]],1,31,p,fade);
   shape(g,[[-10,18],[6,-3],[29,-18],[32,-6],
    [18,12],[-1,26]],p.light,p.ink,2,fade*.9);
   oval(g,9,1,9,7,p.core,fade*(1-hit*.75));
   sprinkles(g,p,hit,fade*.79,9,42);
  }
 }
 function cross(g,t,h,p){
  const one=E((t-.31)/Math.max(.12,h-.31)),two=E((t-.39)/Math.max(.11,h-.39)),
   after=t>=h?E((t-h)/.30):0;
  const fade=1-E((t-.83)/.17);
  // Similar motion language to V68 X-Scissor: two offset curved sweeps.
  // Unlike that move, two huge DARK-OUTLINED scarlet blades slash a red X.
  if(t>=.30){
   if(t>=h)radial(g,0,0,68+9*after,p.glow,fade*.28*(1-after*.3));
   const r1=[[-56,-56],[-42,-42],[24,40],[56,58]];
   const r2=[[-56,55],[-29,31],[25,-33],[56,-58]];
   blade(g,r1,one,27,p,fade);
   blade(g,r2,t>=h?1:two,29,p,fade);
   if(t>=h){
    // A luminous centre with real area rather than a tiny star/white line.
    shape(g,[[-22,-14],[-13,-25],[0,-13],[12,-25],[24,-9],
     [13,3],[23,17],[6,24],[-5,12],[-20,24],[-25,7],[-13,1]],
      p.light,p.ink,3,fade*(1-after*.76));
    oval(g,0,0,15*(1-after*.25),12*(1-after*.25),p.core,fade*(1-after*.78));
    sprinkles(g,p,after,fade*.86,15,61);
   }
  }
 }
 function brick(g,t,h,p){
  const q=E((t-.24)/(h-.24)),after=t>=h?E((t-h)/.28):0,fade=1-E((t-.86)/.14);
  if(t>=.24&&t<h){
   const off=(1-q)*30;
   shape(g,[[-22,-56-off],[-8,-62-off],[16,-38-off],
    [18,-14-off],[7,3-off],[-8,4-off],[-20,-22-off]],
    p.body,p.ink,4.5,q);
   shape(g,[[-11,-52-off],[1,-54-off],[9,-37-off],[9,-16-off],
    [-1,-9-off]],p.light,null,0,q);
  }
  if(t>=h){
   radial(g,0,0,59+9*after,p.glow,fade*.34);
   shape(g,[[-29,-48],[-7,-52],[17,-31],[20,-7],
    [11,10],[-12,16],[-28,-4]],p.body,p.ink,4.7,fade);
   shape(g,[[-16,-42],[-3,-43],[9,-28],[10,-9],[0,-1]],
    p.light,null,0,fade);
   // Visible shattered ROCK plates, 10–21px broad, under a true hammer strike.
   const blocks=[
    [[-39,9],[-12,-2],[-7,13],[-25,27]],
    [[1,-5],[33,-9],[39,10],[13,17]],
    [[-37,26],[-17,12],[-4,30],[-20,49]],
    [[11,17],[37,13],[29,35],[6,42]],
    [[-6,12],[11,10],[5,27],[-10,28]]
   ];
   for(let k=0;k<blocks.length;k++){
    const a=k*1.91,q2=after*(12+k%2*5),
     pts=blocks[k].map(v=>[v[0]+Math.cos(a)*q2,v[1]+Math.sin(a)*q2*.6]);
    shape(g,pts,k%2?p.dark:p.body,p.ink,2.7,fade*(1-after*.16));
    const cx=pts.reduce((n,v)=>n+v[0],0)/pts.length,cy=pts.reduce((n,v)=>n+v[1],0)/pts.length;
    shape(g,[[cx-5,cy-3],[cx+2,cy-6],[cx+7,cy-1]],p.light,null,0,fade*.86);
   }
   oval(g,-1,8,13*(1-after*.4),9*(1-after*.5),p.core,fade*(1-after*.75));
   sprinkles(g,p,after,fade*.77,12,48);
  }
 }
 const paints={chute:kick,karate, cross,brick};
 function render(g,a,style){
  const fn=paints[style];if(!fn||!g)throw Error('V106 unknown visual '+style);
  const t=C(a.t),h=C(a.hit||.6),col=palettes[style],
   x=a.to[0],y=a.to[1],size=C(a.scale||1,.74,1.32);
  const count=a.frames||12,frame=Math.max(0,Math.min(count-1,Math.floor(t*count)));
  g.save();
  try{
   // Local impact area: visually large, but absolutely anchored on enemy.
   g.translate(x,y);g.scale(size,size);
   fn(g,t,h,col);
   if(t>=h)state.contactFrames++;
  }catch(err){state.errors.push(String(err));throw err;}
  finally{g.restore()}
  state.frames++;state.draws[style]=(state.draws[style]||0)+1;
  state.last={style,frame:frame+1,of:count,impact:h,anchor:'enemy',filled:state.filled};
 }
 return {render,diagnostics:()=>({...state,draws:{...state.draws},errors:state.errors.slice()})};
})();
