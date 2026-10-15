// V64 — these TWO Portuguese status names were in the selectable catalogue
// but absent from the original engine's condition definitions. In V35.1,
// defFor() reads __V351_STATUS_DEFS[move.name] when no normal alias exists.
// Attach semantic definitions, not animation-only replacements: sleep applies
// to the target with the exact existing cooldown, energy and immunity rules.
window.__V351_STATUS_DEFS=window.__V351_STATUS_DEFS||{};
for(const [name,kind] of [['Pó do Sono','sleep'],['Esporos','sleep']]){
 if(!window.__V351_STATUS_DEFS[name])
  window.__V351_STATUS_DEFS[name]=[name,'grass','status',0,kind,4800];
}
const grassFourKeys=new Set(['catalog_stunspore','catalog_podosono','catalog_leechseed','catalog_esporos']);
const grassFourStatusReport={casts:0,rejected:0,statusApplied:0,visualQueues:0,legacyParticlesRemoved:0,names:[]};
window.PokemonTorrePlantStatusV64=()=>({
 version:'64.0',...grassFourStatusReport,
 activeVisuals:(engine?.v3580Visuals||[]).filter(f=>grassFourKeys.has(pick(f?.move?.name))).length,
 actualEnemyConditions:engine?.v25?.stats?.enemy?.conditions?.slice()||[]
});
function paint(g,f,now,e,k){
 if(!f||!Array.isArray(f.from)||!Array.isArray(f.to)||!g)return false;
 const dur=Math.max(250,f.duration||950),t=C((now-f.at)/dur),s=C((e?.h||420)/430,.62,1.18);
 const low=!!(e?.fps>0&&e.fps<36);
 if(t<0||now<f.at||now>f.at+dur+30)return true;
 g.save();g.imageSmoothingEnabled=false;
 const entry=registry.get(k);if(!entry){g.restore();return false;}
 // These four move-specific sprite animators take priority over the generic
 // Pixi shader path; all other moves retain the exact previous pipeline.
 // The four approved Grass status animations replace their original catalog
 // visuals completely. Never draw the previous status particles underneath.
 if(typeof plantFourV63!=='undefined'&&plantFourV63.accepts(k)){
  plantFourV63.paint(g,f,t,now,s,low,k);
 }else  if(typeof cinematicFourV60!=='undefined'&&cinematicFourV60.accepts(k)){
  if(!cinematicFourV60.paint(g,f,t,now,s,low,k))entry.draw(g,f,t,now,s,low);
 }else if(typeof battleFourV72!=='undefined'&&battleFourV72.accepts(k)){
  // The four approved cinematic sprites are drawn on the existing Pixi/WebGL overlay.
  // Legacy V66 procedural painter is only a compatibility fallback without WebGL.
  if(!pixiFX.paint(f,e,k)){
   if(typeof heritage37V66!=='undefined'&&heritage37V66.accepts(k))heritage37V66.paint(g,f,t,now,s,low,k);
   else entry.draw(g,f,t,now,s,low);
  }
 }else if(typeof library16V59!=='undefined'&&library16V59.accepts(k)){
  // V59 uses only a verified catalog allowlist. Older approved effects
  // have their own modules and never enter this branch.
  if(!library16V59.paint(g,f,t,now,s,low,k))entry.draw(g,f,t,now,s,low);
 }else if(typeof elementalEightV58!=='undefined'&&elementalEightV58.accepts(k)){
  // Sprite atlas owns these water/ice catalog visuals only. If the atlas
  // has not finished loading, retain the original painter for continuity.
  if(!elementalEightV58.paint(g,f,t,now,s,low,k))entry.draw(g,f,t,now,s,low);
 }else if(typeof catalogElectricFourV56!=='undefined'&&catalogElectricFourV56.accepts(k))
  entry.draw(g,f,t,now,s,low);
 else if(typeof heritage37V66!=='undefined'&&heritage37V66.accepts(k)){
  // Opt-in only to the 37 new V66 visuals. Three excluded Electric moves and
  // all older approved sprites retain their original rendering paths.
  if(!heritage37V66.paint(g,f,t,now,s,low,k))entry.draw(g,f,t,now,s,low);
 }
 else if(!pixiFX.paint(f,e,k))entry.draw(g,f,t,now,s,low);
 g.restore();counts[k]=(counts[k]||0)+1;return true;
}
// Render de golpes ofensivos: pipeline existente. O retorno true impede duplicação por Canvas/PNG antigos.
const prevPainter=window.PokemonTorreV360Paint;
window.PokemonTorreV360Paint=function(g,f,now,e){
 // V84 opt-in: mandatory GPU preview, never let old Canvas paint over it.
 if(typeof grassFourV84!=='undefined'){
  const key84=grassFourV84.resolve(f?.move?.name||f?.name);
  if(key84){
   // Detect a missing GPU instead of silently displaying a legacy attack.
   if(!pixiFX.paint(f,e,key84)){
    window.PokemonTorreGrassPreviewErrorV84='PixiJS/WebGL indisponível';
   }
   return true;
  }
 }
 // V83 opt-in: four uniquely authored grass sprite animations in the REAL battle.
 // Original V81 and all other approved effects remain intact without the flag.
 if(typeof grassFourV83!=='undefined'){
  const v83key=grassFourV83.resolve(f?.move?.name||f?.name);
  if(v83key&&pixiFX.paint(f,e,v83key))return true;
 }
 // V82 opt-in only: test the FOUR moves equipped in the screenshot. The
 // official V81 + approved original Chicote remain intact without the flag.
 if(typeof equippedGrassV82!=='undefined'){
  const key=equippedGrassV82.resolve(f?.move?.name||f?.name);
  if(key&&pixiFX.paint(f,e,key))return true;
 }
 // These 4 named moves draw only the source GBA pixel sprites. Intercept
 // BEFORE Pixi/semantic/old Canvas to avoid duplicate generic VFX.
 // Fire-specific sprites take priority over the generic pipeline.
 // Only the specifically requested non-catalog snowstorm uses a named hook.
 if(typeof cinematicFourV60!=='undefined'&&cinematicFourV60.supportsName(f?.move?.name||f?.name)){
  if(cinematicFourV60.paintNamed(g,f,now,e))return true;
 }
 if(legendaryFireFX.handles(f))return legendaryFireFX.paint(g,f,now,e);
 if(originalFireFX.handles(f))return originalFireFX.paint(g,f,now,e);
 if(originalGbaFX.handles(f))return originalGbaFX.paint(g,f,now,e);
 const rawName=f?.move?.name||f?.name;
 const k=pick(rawName);if(k)return paint(g,f,now,e,k);
 // Tempestade de Neve exists in the original engine even when not present
 // in the modular catalog; this path changes only the visual rendering.
 if(typeof elementalEightV58!=='undefined'&&elementalEightV58.supportsName(rawName)){
  if(elementalEightV58.paintNamed(g,f,now,e))return true;
 }
 // The original GBA painter above owns Psybeam and the other three moves.
 return typeof prevPainter==='function'?prevPainter(g,f,now,e):false;
};
// Status (sem projétil na fila v359) precisa ser animado mesmo quando não causa dano.
const previousUse=BattleEngine.prototype.useMove;
BattleEngine.prototype.useMove=function(i){
 const mon=battle?.active?current():null,mv=mon&&Number.isInteger(i)?skillSet(mon)?.[i]:null,k=pick(mv?.name);
 const approvedGrass=grassFourKeys.has(k);
 const beforeParticles=approvedGrass?(this.particles?.length||0):0;
 const before=this.v359Attacks?.length||0,energy=battle?.energy,oldCd=Number.isInteger(i)?cooldowns[i]:0,when=performance.now();
 const result=previousUse.apply(this,arguments);
 if(approvedGrass){
  grassFourStatusReport.casts++;
  grassFourStatusReport.names.push({name:mv?.name,result:result!==false,at:when});
  grassFourStatusReport.names=grassFourStatusReport.names.slice(-12);
 }
 if(!k||!battle?.active)return result;
 // Avoid double-painting the older automatic STATUS effects for registered catalog moves.
 if(k.startsWith('catalog_')&&Array.isArray(this.v3568StatusFX)){
  this.v3568StatusFX=this.v3568StatusFX.filter(fx=>pick(fx?.move?.name||fx?.name)!==k);
 }
 const addedFx=(this.v359Attacks||[]).slice(before).find(f=>f?.move?.name===mv.name);
 if(addedFx){
  // Only the four new beams rescale their existing attack; engine still owns ONE hit.
  const timing={hyperbeam:[1230,.72],aurorabeam:[1010,.65],icebeam:[1130,.69],solarbeam:[1370,.77],catalog_triataque:[1320,.78]}[k];
  if(timing){addedFx.duration=timing[0];addedFx.end=addedFx.at+timing[0];addedFx.times=[timing[1]];}
  return result;
 }
 const accepted=result!==false && (((cooldowns[i]||0)>when&&(cooldowns[i]||0)!==oldCd)||(battle.energy<energy));
 if(approvedGrass){
  if(!accepted){grassFourStatusReport.rejected++;return result;}
  // The original status engine spawned its own generic halo and particles.
  // Remove ONLY visual debris from this synchronous cast, not status logic.
  if(this.v351StatusCast?.at>=when-8)this.v351StatusCast=null;
  if(Array.isArray(this.v342StatusFx))
   this.v342StatusFx=this.v342StatusFx.filter(fx=>pick(fx?.name)!==k);
  if(Array.isArray(this.v3568StatusFX))
   this.v3568StatusFX=this.v3568StatusFX.filter(fx=>pick(fx?.move?.name||fx?.name)!==k);
  if(Array.isArray(this.particles)&&this.particles.length>beforeParticles){
   grassFourStatusReport.legacyParticlesRemoved+=this.particles.length-beforeParticles;
   this.particles.splice(beforeParticles);
  }
  if(this.v25?.stats?.enemy?.conditions?.length)grassFourStatusReport.statusApplied++;
 }
 if(!accepted)return result;
 const duration=registry.get(k).duration;
 this.v3580Visuals||=[];
 this.v3580Visuals.push({move:mv,at:when,end:when+duration,duration,from:[this.player.x,this.player.y-this.h*.13],to:[this.enemy.x,this.enemy.y-this.h*.12]});
 this.v3580Visuals=this.v3580Visuals.slice(-8);
 if(approvedGrass)grassFourStatusReport.visualQueues++;
 return result;
};
const previousDraw=BattleEngine.prototype.draw;
BattleEngine.prototype.draw=function(now){
 // V61.3 performance: 4 approved Canvas atlas animations do not need WebGL.
 // Creating a Pixi application here used to open a second GPU canvas on
 // every battle, even when no move called pixiFX.paint(). The WebGL layer is
 // now initialized lazily by pixiFX.paint for moves that actually need it.
 const result=previousDraw.call(this,now);
 if(!battle?.active||!this.ctx){this.v3580Visuals=[];return result;}
 this.v3580Visuals=(this.v3580Visuals||[]).filter(f=>f.end>now);
 for(const fx of this.v3580Visuals){if(legendaryFireFX.handles(fx)){legendaryFireFX.paint(this.ctx,fx,now,this);continue;}const k=pick(fx.move?.name);if(k)paint(this.ctx,fx,now,this,k);}
 return result;
};
window.PokemonTorreMewtwo4FX=()=>({version:'35.83',animatedMoves:['Psíquico','Confusion','Lança-Chamas','Telecinese'],modules:['psychic','confusion','flame','telekinesis'],renderedFrames:{...counts},engine:'Canvas 2D + atlas DS',activeStatus:(engine?.v3580Visuals||[]).length,activeAttacks:(engine?.v359Attacks||[]).filter(f=>!!pick(f?.move?.name)).length});
window.PokemonTorreBeamFX=()=>({
 version:'35.83',modules:['hyperbeam','aurorabeam','icebeam','solarbeam'],
 names:['Hyper Beam','Aurora Beam','Ice Beam','Solar Beam'],
 registered:['hyperbeam','aurorabeam','icebeam','solarbeam'].every(key=>registry.has(key)),
 renderedFrames:Object.fromEntries(['hyperbeam','aurorabeam','icebeam','solarbeam'].map(key=>[key,counts[key]||0])),
 activeAttacks:(engine?.v359Attacks||[]).filter(f=>['hyperbeam','aurorabeam','icebeam','solarbeam'].includes(pick(f?.move?.name))).length,
 engine:'Canvas 2D + existing DS atlas'
});

window.PokemonTorreCatalogFX=()=>({version:'35.84',registered:([...registry.keys()].filter(k=>k.startsWith('catalog_'))).length,approved:8,allRegistered:registry.size,active:(engine?.v359Attacks||[]).filter(f=>pick(f?.move?.name)?.startsWith('catalog_')).length,frames:Object.fromEntries(Object.entries(counts).filter(([k])=>k.startsWith('catalog_'))),engine:'Canvas 2D + DS sprites'});

window.PokemonTorrePixiFX=()=>pixiFX.diagnostics();

// Fire Punch contact: advance the actual Pokémon, show the existing approved
// impact, and retreat. Restore coordinates after paint to avoid gameplay side effects.
const _firePunchDraw=BattleEngine.prototype.draw;
BattleEngine.prototype.draw=function(now){
 const active=(this.v359Attacks||[]).filter(fx=>{
  const n=String(fx?.move?.name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  return (n==='punhodefogo'||n==='firepunch'||n==='faiscadopikachu'||n==='volttackle'||n==='xscissor'||n==='cortex'||n==='dragonclaw')&&now>=fx.at&&now<fx.at+Math.max(350,fx.duration||1000);
 });
 if(!active.length||!this.player||!this.enemy||!battle?.active)return _firePunchDraw.call(this,now);
 const fx=active[active.length-1],p=this.player,q=this.enemy,ox=p.x,oy=p.y;
 const t=Math.max(0,Math.min(1,(now-fx.at)/Math.max(350,fx.duration||1000)));
 const smooth=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v)};
 const electric=n=>n==='faiscadopikachu'||n==='volttackle';
 const isElectric=electric(String(fx?.move?.name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,''));
 const reach=isElectric?smooth((t-.05)/.53)*(1-smooth((t-.77)/.20)):smooth((t-.07)/.37)*(1-smooth((t-.56)/.32));
 const dx=q.x-ox,dy=q.y-oy,dist=Math.hypot(dx,dy)||1;
 const stop=Math.max(36,Math.min(58,this.h*.105));
 const travel=Math.max(0,dist-stop)*reach;
 p.x=ox+dx/dist*travel;p.y=oy+dy/dist*travel;
 try{return _firePunchDraw.call(this,now);}
 finally{p.x=ox;p.y=oy;}
};
// V66 — draw movement/Double Team with the real selected Pokémon sprite.
// Restore coordinates after painting: no collision, physics or save mutation.
const _heritage37DrawMon=BattleEngine.prototype.drawMon;
BattleEngine.prototype.drawMon=function(actor,id,isEnemy,now){
 if(isEnemy||actor!==this.player||!battle?.active)return _heritage37DrawMon.apply(this,arguments);
 const normalize=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
 const moves=new Set(['quickattack','extremespeed','aquajet','irontail','dig','doubleteam']);
 const entries=(this.v359Attacks||[]).concat(this.v3580Visuals||[]);
 const fx=entries.find(v=>moves.has(normalize(v?.move?.name))&&now>=v.at&&now<v.at+Math.max(400,v.duration||950));
 if(!fx)return _heritage37DrawMon.apply(this,arguments);
 const idMove=normalize(fx.move.name),dur=Math.max(400,fx.duration||950);
 const t=Math.max(0,Math.min(1,(now-fx.at)/dur)),ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
 const ox=actor.x,oy=actor.y,dx=this.enemy.x-ox,dy=this.enemy.y-oy,dist=Math.hypot(dx,dy)||1;
 const reach=idMove==='doubleteam'?0:idMove==='dig'?ease((t-.37)/.18)*(1-ease((t-.72)/.19)):ease((t-.08)/.37)*(1-ease((t-.65)/.28));
 const step=Math.max(0,dist-Math.max(34,this.h*.1))*reach;
 actor.x=ox+dx/dist*step;actor.y=oy+dy/dist*step+(idMove==='dig'&&t<.37?33*ease(t/.37):0);
 try{
  let result;
  if(idMove==='dig')this.ctx.save();
  try{
   if(idMove==='dig')this.ctx.globalAlpha*=1-.8*ease((t-.19)/.14)*(1-ease((t-.38)/.14));
   result=_heritage37DrawMon.call(this,actor,id,isEnemy,now);
  }finally{if(idMove==='dig')this.ctx.restore();}
  if(idMove==='doubleteam'){
   // All echoes come from the existing real sprite renderer, never silhouettes.
   for(const n of [-2,-1,1,2]){
    const alpha=(.48-.075*Math.abs(n))*(1-ease((t-.72)/.22));
    if(alpha<=.01)continue;
    actor.x=ox+n*(17+21*ease(t/.3));actor.y=oy+(n%2?7:-6)*ease(t/.3);
    this.ctx.save();this.ctx.globalAlpha*=alpha;
    try{_heritage37DrawMon.call(this,actor,id,isEnemy,now);}
    finally{this.ctx.restore();}
   }
  }
  return result;
 }finally{actor.x=ox;actor.y=oy;}
};
})();
