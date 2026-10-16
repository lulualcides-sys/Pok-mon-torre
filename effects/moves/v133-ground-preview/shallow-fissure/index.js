/* Fenda Rasa: a fast shallow rippling crack travelling over the ground.
 * Narrow fracture with angular offshoots, low mineral dust and modest depth.
 * Deliberately distinct from approved deep Grande Fissura.
 */
window.PokemonTorreGroundV133?.register({
 name:'Fenda Rasa',aliases:[],ms:1430,frames:12,
 draw(g,p){
  const {t,hit,from:A,to:B,scale:s,engine:e,clamp,ease,mix,poly,shard,grain,crack}=p;
  const feet=e.enemy?.y||B[1]+30*s;
  const targetGround=feet+(e.enemy?.r||34)*.32;
  const startX=A[0],startY=(e.player?.y||A[1]+35*s)+(e.player?.r||34)*.27;
  const endX=B[0],endY=targetGround;
  const grow=ease((t-.08)/(hit-.08)),fade=1-ease((t-.85)/.15);
  const n=15,last=Math.floor(grow*(n-1)),pts=[];
  // Receding terrain perspective: zig-zag narrow surface line, no giant abyss.
  for(let i=0;i<=last;i++){
   const u=i/(n-1),x=mix(startX,endX,u);
   const yy=mix(startY,endY,u)+(Math.sin(i*2.68)*3+Math.sin(i*5.7)*1.5)*s*u;
   pts.push([x,yy]);
  }
  if(last<n-1){
   const u=grow,x=mix(startX,endX,u),y=mix(startY,endY,u)+(Math.sin(last*2.68)*3)*s*u;
   pts.push([x,y]);
  }
  if(pts.length>1){
   // Dark split in dirt with two chipped mineral banks.
   g.save();g.globalAlpha*=fade;
   crack(g,pts,(1.4+1.25*grow)*s);
   for(let i=2;i<pts.length-1;i+=2){
    const [x,y]=pts[i],up=(i%4?1:-1),
     side=(8+i%3*3)*s;
    crack(g,[[x,y],[x+up*side*.43,y-5*s],
     [x+up*side,y-(10+i%3*2)*s]],.88*s,.79);
    // Subtle displaced triangular soil pieces near the seam.
    poly(g,[[x-4*s,y-3*s],[x+2*s,y-(2+i%4)*s],
      [x+6*s,y+1*s]],i%3?'#92785d':'#77624c','#2c241e',.9*s);
   }
   g.restore();
  }
  if(t>=hit){
   const u=clamp((t-hit)/(1-hit)),alpha=1-ease(u);
   // A small heave of broken dirt around the target, no deep chasm.
   for(let i=0;i<17;i++){
    const theta=i*2.399,r=(5+29*ease(u))*(.8+i%4*.11)*s;
    shard(g,endX+Math.cos(theta)*r,endY-6*s+Math.sin(theta)*r*.43,
      (1.7+i%4*.85)*s,theta,alpha*.79,i%2?'#8a7157':'#a68b6e');
   }
   for(let i=0;i<14;i++){
    const d=(i*2.13)%(2*Math.PI),r=(5+30*u)*s;
    grain(g,endX+Math.cos(d)*r,endY-5*s+Math.sin(d)*r*.55,
      (1+i%3*.42)*s,alpha*.61,'#a48e73');
   }
  }
 }
});