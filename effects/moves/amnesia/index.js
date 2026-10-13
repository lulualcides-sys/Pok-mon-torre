/* AMNESIA V44 — SELF status in classic Pokemon style, NO water/projectile.
 * Real pixel-art question mark and subtle approved psychic sprite.
 * The new symbol lives in this move's own folder, isolated from other FX.
 */
const amnesiaMarkV44=new Image();
amnesiaMarkV44.decoding='async';
amnesiaMarkV44.src='effects/moves/amnesia/thought.svg?v=44.0';
waterSpriteV43.add('amnesia',{
 key:'amnesia',duration:1780,contact:false,status:true,selfTarget:true,mentalGlyph:true,
 paint(g,f,t,ms,s,K){
  const {mind,ease,clamp}=K,A=f.from;
  const alpha=ease(t/.12)*(1-ease((t-.86)/.14));
  if(alpha<=.008)return;
  const x=A[0],y=A[1]-28*s;
  // One small subtle approved psychic GIF-frame behind the Pokémon's head.
  // A short aura, not a large explosive ring or orbiting orbs.
  const pulse=.92+.06*Math.sin(ms*.005);
  mind(g,1,x,y-7*s,41*s*pulse,36*s*pulse,
    {alpha:alpha*.32});
  if(!amnesiaMarkV44.naturalWidth)return;
  // 3 sequential thought symbols appearing directly above the caster,
  // then fading like a moment of lost memory.
  const thoughts=[
    {dx:0,dy:-36,size:54,appear:.10},
    {dx:-29,dy:-63,size:34,appear:.27},
    {dx:29,dy:-66,size:34,appear:.40}
  ];
  for(const thought of thoughts){
   const onset=ease((t-thought.appear)/.13);
   const gone=1-ease((t-.80)/.19);
   const a=alpha*onset*gone;
   if(a<.02)continue;
   const bob=Math.sin(ms*.004+thought.dx*.10)*3*s;
   const size=thought.size*s*(.94+.04*Math.sin(ms*.006+thought.dx));
   const px=x+thought.dx*s,py=y+thought.dy*s+bob;
   g.save();
   g.imageSmoothingEnabled=false;
   g.globalAlpha=a*(thought.size>40?.96:.82);
   g.drawImage(amnesiaMarkV44,
    Math.round(px-size/2),Math.round(py-size/2),
    Math.round(size),Math.round(size));
   g.restore();
  }
  // A few real pixel-art psychic motes leave the caster's head at the end.
  if(t>.57&&t<.92){
   const rise=ease((t-.57)/.34);
   for(let i=0;i<3;i++){
    const off=(i-1)*24*s;
    mind(g,11+i*2,x+off,y-50*s-rise*(18+9*i)*s,
      14*s,16*s,
      {alpha:alpha*(1-rise)*.43});
   }
  }
 }
});
