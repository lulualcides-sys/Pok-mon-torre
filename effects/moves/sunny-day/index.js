/* Sunny Day V42.5 — calm pixel-art SUN, no particles, fire rings or blasts.
 * Sprite stored alongside this isolated move at sun.svg. No CSS animation.
 */
const sunnyDaySpriteV425=new Image();
sunnyDaySpriteV425.decoding='async';
sunnyDaySpriteV425.src='effects/moves/sunny-day/sun.svg?v=42.5';
fireSpriteV41.add('sunnyday',{
 key:'sunnyDay',duration:4800,contact:false,status:true,weather:true,solarSprite:true,
 paint(g,f,t,ms,s,K){
  const {ease}=K;
  if(!sunnyDaySpriteV425.naturalWidth||!sunnyDaySpriteV425.naturalHeight)return;
  const A=f.from,B=f.to;
  const size=77*s;
  const x=(A[0]+B[0])*.5;
  // Position near the arena's upper center, away from the enemy hit area.
  const y=Math.max(80*s,Math.min(A[1],B[1])-127*s);
  // Continuous light: fixed-size sun, slowly breathing with NO burst/impact.
  const alpha=ease(t/.18)*(1-ease((t-.85)/.15));
  if(alpha<=.001)return;
  const bob=Math.sin(ms*.0019)*2*s;
  g.save();
  g.imageSmoothingEnabled=false;
  g.globalAlpha=alpha*(.86+.08*Math.sin(ms*.0017));
  g.drawImage(sunnyDaySpriteV425,
   Math.round(x-size*.5),Math.round(y-size*.5+bob),
   Math.round(size),Math.round(size));
  g.restore();
 }
});
