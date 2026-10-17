/* Pokémon Torre V147 — cinematic arena lighting baked ONCE into the V97 backdrop.
 * This is environment rendering, not attack artwork. No Python, CSS overlay,
 * extra GPU context or replacement textures. Lights align with real V97 props.
 * ?lightmap147=0 or ?lighting146=0 completely restores V97/V146 comparison.
 */
(()=>{
'use strict';
if(typeof BattleEngine!=='function'||!BattleEngine.prototype.generateBackdrop)return;
if(window.PokemonTorreLightmapV147?.installed)return;
const q=new URLSearchParams(location.search);
const enabled=q.get('lightmap147')!=='0'&&q.get('lighting146')!=='0'&&
 q.get('safe')!=='1'&&q.get('arena_preview')!=='off';
const baseGenerate=BattleEngine.prototype.generateBackdrop;
const MAX_CACHE=3,cached=new Map();
const stat={builds:0,hits:0,failures:0,lightPools:0,litTiles:0,lastSize:null,error:null};
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const PI=Math.PI;
function box(g,x,y,w,h,color){g.fillStyle=color;g.fillRect(x,y,w,h);}
function poly(g,pts,color){
 g.fillStyle=color;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);
 for(let j=1;j<pts.length;j++)g.lineTo(pts[j][0],pts[j][1]);
 g.closePath();g.fill();
}
function radial(g,x,y,rx,ry,rgb,a){
 // Preserve and light the EXISTING tile texture; gradients are a static
 // lightmap, not procedural Pokémon artwork.
 g.save();g.translate(x,y);g.scale(rx,ry);
 const grad=g.createRadialGradient(0,0,0,0,0,1);
 grad.addColorStop(0,'rgba('+rgb+','+a+')');
 grad.addColorStop(.20,'rgba('+rgb+','+(a*.79)+')');
 grad.addColorStop(.48,'rgba('+rgb+','+(a*.40)+')');
 grad.addColorStop(.76,'rgba('+rgb+','+(a*.085)+')');
 grad.addColorStop(1,'rgba('+rgb+',0)');
 g.fillStyle=grad;g.fillRect(-1,-1,2,2);g.restore();stat.lightPools++;
}
function paint(base,w,h){
 const canvas=document.createElement('canvas');
 canvas.width=w;canvas.height=h;canvas.complete=true;
 canvas.naturalWidth=w;canvas.naturalHeight=h;
 const g=canvas.getContext('2d');
 if(!g)throw Error('Backdrop Canvas2D unavailable');
 // Draw the exact approved V97 stadium backdrop ONCE, preserving its tiles.
 g.drawImage(base,0,0,w,h);
 const u=w/960,H=h/u;
 g.save();g.setTransform(u,0,0,u,0,0);

 // 1. Lightmap darkness: dimensional, not a transparent spotlight at one corner.
 // Keep the battle center readable, but cool wall/floor values into nighttime.
 const tone=g.createLinearGradient(0,125,0,H);
 tone.addColorStop(0,'rgba(4,10,29,.64)');
 tone.addColorStop(.27,'rgba(5,17,34,.46)');
 tone.addColorStop(.59,'rgba(7,24,42,.37)');
 tone.addColorStop(.88,'rgba(7,18,38,.49)');
 tone.addColorStop(1,'rgba(3,9,27,.70)');
 box(g,0,0,960,H,tone);
 const sides=g.createLinearGradient(0,0,960,0);
 sides.addColorStop(0,'rgba(2,8,28,.33)');
 sides.addColorStop(.17,'rgba(6,15,31,.09)');
 sides.addColorStop(.44,'rgba(4,14,30,0)');
 sides.addColorStop(.76,'rgba(4,14,30,.03)');
 sides.addColorStop(1,'rgba(2,8,28,.35)');
 box(g,0,0,960,H,sides);

 // 2. Directional architectural occlusion. Unlike V146, wall depth is
 // baked into the backdrop rather than a floating circle above Pokémon.
 const canopy=g.createLinearGradient(0,150,0,268);
 canopy.addColorStop(0,'rgba(1,7,21,.77)');
 canopy.addColorStop(.17,'rgba(2,13,31,.51)');
 canopy.addColorStop(.48,'rgba(2,13,31,.20)');
 canopy.addColorStop(1,'rgba(2,13,31,0)');
 box(g,0,150,960,118,canopy);
 const south=g.createLinearGradient(0,H-215,0,H-64);
 south.addColorStop(0,'rgba(2,12,28,0)');
 south.addColorStop(.62,'rgba(3,12,28,.18)');
 south.addColorStop(1,'rgba(1,8,24,.65)');
 box(g,0,H-215,960,155,south);
 poly(g,[[0,147],[960,147],[960,160],[0,165]],'rgba(3,15,31,.58)');
 poly(g,[[0,H-68],[960,H-68],[960,H-55],[0,H-50]],'rgba(2,9,22,.59)');
 const west=g.createLinearGradient(20,0,121,0);
 west.addColorStop(0,'rgba(2,10,25,.72)');
 west.addColorStop(.26,'rgba(2,12,27,.38)');
 west.addColorStop(1,'rgba(2,12,27,0)');
 box(g,20,163,101,Math.max(0,H-315),west);
 const east=g.createLinearGradient(839,0,940,0);
 east.addColorStop(0,'rgba(2,12,27,0)');
 east.addColorStop(.75,'rgba(2,12,27,.33)');
 east.addColorStop(1,'rgba(2,10,25,.72)');
 box(g,839,163,101,Math.max(0,H-315),east);

 // 3. Light sources tied to architectural fixtures and existing gold seals.
 // Multiple evenly-spaced pools are visible in the camera's 1.55x world.
 g.globalCompositeOperation='screen';
 const wells=[
  {x:110,y:192,r:185,c:'255,190,110',a:.59},
  {x:329,y:169,r:153,c:'86,206,255',a:.47},
  {x:606,y:169,r:157,c:'91,216,248',a:.46},
  {x:850,y:H-142,r:185,c:'255,181,96',a:.60},
  {x:49,y:H*.52,r:176,c:'36,148,247',a:.40},
  {x:913,y:H*.48,r:175,c:'51,165,245',a:.39},
  {x:266,y:H*.30,r:126,c:'228,188,116',a:.31},
  {x:716,y:H*.72,r:132,c:'166,202,255',a:.30},
  {x:475,y:H*.48,r:244,c:'61,163,200',a:.29}
 ];
 for(const l of wells){
  radial(g,l.x,l.y,l.r,l.r*.77,l.c,l.a);
  // short specular reflection in the polished ceramic immediately below
  radial(g,l.x+13,l.y+75,l.r*.46,l.r*.18,l.c,l.a*.20);
 }
 g.globalCompositeOperation='source-over';

 // 4. Light-dependent grout facets: normal-map-like edge treatment.
 // Individual squares catch directional cyan/warm illumination.
 const k=64;
 for(let y=162;y<H-83;y+=k)for(let x=0;x<960;x+=k){
  let R=0,G=0,B=0,energy=0;
  for(const w of wells){
   const dx=(x+32-w.x)/w.r,dy=(y+32-w.y)/(w.r*.80);
   const p=clamp(1-Math.sqrt(dx*dx+dy*dy));
   const s=p*p*w.a;
   if(s>.001){const parts=w.c.split(',').map(Number);
    R+=parts[0]*s;G+=parts[1]*s;B+=parts[2]*s;energy+=s;}
  }
  const E=clamp(energy*1.5,0,.60);
  if(E>.04){
   const r=Math.round(clamp(R/(energy||1),0,255));
   const gg=Math.round(clamp(G/(energy||1),0,255));
   const b=Math.round(clamp(B/(energy||1),0,255));
   // No luminous square fills: only 1px bevels on the actual V97 tiles.
   box(g,x+3,y+3,Math.min(k-8,56),1,'rgba('+r+','+gg+','+b+','+E*.49+')');
   box(g,x+3,y+4,1,Math.min(k-9,53),'rgba('+r+','+gg+','+b+','+E*.24+')');
   stat.litTiles++;
  }
  box(g,x+3,y+k-3,Math.min(k-7,55),1,'rgba(0,9,24,.11)');
 }

 // 5. Physically grounded luminaires, placed in the APPROVED wall shape.
 for(const x of [110,329,606,851]){
  const cool=x===329||x===606;
  box(g,x-17,148,34,4,'rgba(5,20,38,.78)');
  box(g,x-12,150,24,2,cool?'rgba(114,222,255,.87)':'rgba(255,219,139,.90)');
  box(g,x-8,154,16,1,cool?'rgba(196,247,255,.44)':'rgba(255,243,200,.42)');
  radial(g,x,155,55,35,cool?'86,215,255':'255,203,121',.22);
 }
 // Embossed wall faces: shaded depth and a sharp upper edge (no soft blur).
 for(const x of [7,114,224,338,630,742,854]){
  box(g,x,55,5,68,'rgba(5,16,36,.29)');
  box(g,x+6,57,2,56,'rgba(170,226,244,.24)');
  box(g,x+6,124,86,3,'rgba(1,12,27,.35)');
 }
 box(g,0,155,960,2,'rgba(94,208,241,.34)');
 box(g,0,H-76,960,2,'rgba(109,210,243,.21)');
 // Three cast shadows beside raised fixtures, restrained on the tile floor.
 poly(g,[[95,211],[130,213],[163,263],[106,254]],'rgba(1,10,26,.27)');
 poly(g,[[826,H-138],[862,H-141],[899,H-83],[840,H-85]],'rgba(1,10,26,.28)');
 poly(g,[[377,159],[581,159],[631,241],[355,241]],'rgba(3,13,29,.14)');

 // 6. Warm metal seam on the official staircase. Preserve red landing.
 box(g,453,34,2,128,'rgba(255,186,118,.39)');
 box(g,520,34,2,128,'rgba(255,194,135,.36)');
 const under=g.createLinearGradient(0,160,0,240);
 under.addColorStop(0,'rgba(111,28,47,.25)');
 under.addColorStop(1,'rgba(111,28,47,0)');
 box(g,451,160,77,80,under);

 g.restore();
 stat.builds++;stat.lastSize={width:w,height:h,logicalH:Math.round(H)};
 return canvas;
}
BattleEngine.prototype.generateBackdrop=function(){
 const result=baseGenerate.apply(this,arguments);
 if(!enabled||!this.bg||typeof this.bg.getContext!=='function')return result;
 const base=this.bg;
 if(base._lightmap147) return result;
 const key=String(base.width)+'x'+String(base.height);
 try{
  const record=cached.get(key);
  if(record&&record.base===base){stat.hits++;this.bg=record.lit;return result;}
  const lit=paint(base,base.width,base.height);
  lit._lightmap147=true;
  cached.set(key,{base,lit});
  if(cached.size>MAX_CACHE)cached.delete(cached.keys().next().value);
  this.bg=lit;this._lightmapV147=true;
 }catch(e){stat.failures++;stat.error=String(e?.message||e);}
 return result;
};
window.PokemonTorreLightmapV147=Object.freeze({
 installed:true,enabled,version:'147.0',build:'once per resized V97 backdrop',
 map:'original V97 cyan tiles with shaded architecture, multiple physical light pools and reflective grout',
 rollback:'?lightmap147=0',
 diagnostics:()=>({...stat})
});
})();
