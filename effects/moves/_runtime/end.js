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
 // The V86 preview is fully painted by its cast-owned Pixi scene; older
 // catalog painters must not draw unrelated circles behind it.
 if(typeof referenceFourV86!=='undefined'&&
   referenceFourV86.resolve(f?.move?.name||f?.name))return true;
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
   // beginV84() already installed the ONE currently selected preview.
   // Older native events may still be drawn by the engine, but must not
   // trigger an error or create a duplicate generic effect.
   pixiFX.paint(f,e,key84);
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
// V84 only: render the previously queued Pixi animation ON THE GAME FRAME.
// Historic V81 and V83 code paths do not enter this wrapper.
// V84.1: a cast is authoritative. Determine exactly which fresh queue object
// belongs to the move selected THIS time. Never revive prior Area attacks.
const previousGrassPreviewUseV841=BattleEngine.prototype.useMove;
BattleEngine.prototype.useMove=function(slot){
 if(typeof grassFourV84==='undefined')return previousGrassPreviewUseV841.apply(this,arguments);
 const actor=battle?.active?current():null;
 const name=actor&&Number.isInteger(slot)?skillSet(actor)?.[slot]?.name:null;
 const key=grassFourV84.resolve(name);
 const previousHits=new Set(this.v359Attacks||[]);
 const previousVisuals=new Set(this.v3580Visuals||[]);
 const result=previousGrassPreviewUseV841.apply(this,arguments);
 if(result===false||!battle?.active||battle.paused)return result;
 const created=[...(this.v359Attacks||[]).filter(f=>!previousHits.has(f)),
  ...(this.v3580Visuals||[]).filter(f=>!previousVisuals.has(f))];
 if(!key){
  // A different move must not inherit older preview vines or emissions.
  if(created.length)pixiFX.clearV84();
  return result;
 }
 const own=created.find(f=>grassFourV84.resolve(f?.move?.name||f?.name)===key&&
  Array.isArray(f.from)&&Array.isArray(f.to));
 if(own){
  if(!pixiFX.beginV84(this,own,key))
   window.PokemonTorreGrassPreviewErrorV84='Não foi possível iniciar o efeito '+name;
 }else{
  // Do not fake a cast from a stale old queue when the original engine
  // rejected it, or when a status move created no drawable attack.
  if(created.length)pixiFX.clearV84();
 }
 return result;
};
const previousGrassPreviewDrawV84=BattleEngine.prototype.draw;
BattleEngine.prototype.draw=function(now){
 const result=previousGrassPreviewDrawV84.apply(this,arguments);
 if(typeof grassFourV84!=='undefined')pixiFX.frameV84(now,this);
 return result;
};

// V86 preview: four exact names, their native hit/status queues remain
// authoritative. This wrapper only changes WebGL DRAWING for an accepted cast.
const previousReferencePainterV86=window.PokemonTorreV360Paint;
window.PokemonTorreV360Paint=function(g,f,now,engine){
 if(typeof referenceFourV86!=='undefined'&&
  referenceFourV86.resolve(f?.move?.name||f?.name))return true;
 return typeof previousReferencePainterV86==='function'?
  previousReferencePainterV86.apply(this,arguments):false;
};
const previousReferenceUseV86=BattleEngine.prototype.useMove;
BattleEngine.prototype.useMove=function(slot){
 if(typeof referenceFourV86==='undefined')return previousReferenceUseV86.apply(this,arguments);
 const move=battle?.active&&Number.isInteger(slot)?skillSet(current())?.[slot]:null;
 if(!referenceFourV86.resolve(move?.name))return previousReferenceUseV86.apply(this,arguments);
 const beforeCd=cooldowns?.[slot],beforeEnergy=battle?.energy,started=performance.now();
 const prior=new Set(this.v359Attacks||[]);
 const response=previousReferenceUseV86.apply(this,arguments);
 // Never animate an invalid cast, a move on cooldown or lack of energy.
 const accepted=response!==false&&battle?.active&&!battle?.paused&&
  ((Number(cooldowns?.[slot])>Number(beforeCd))||
   (Number(battle?.energy)<Number(beforeEnergy)));
 if(!accepted)return response;
 const n=referenceFourV86.resolve(move.name);
 const actual=(this.v359Attacks||[]).find(f=>
  !prior.has(f)&&referenceFourV86.resolve(f?.move?.name)===n);
 let hitAt=null;
 if(actual){
  const times=actual.times;
  if(Array.isArray(times)&&Number.isFinite(times[0]))
   hitAt=actual.at+actual.duration*times[0];
 }
 if(!pixiFX.beginV86(this,move,started,hitAt))
  window.PokemonTorreReferenceErrorV86='O renderizador PixiJS não iniciou '+move.name;
 return response;
};
const previousReferenceDrawV86=BattleEngine.prototype.draw;
BattleEngine.prototype.draw=function(now){
 const result=previousReferenceDrawV86.apply(this,arguments);
 if(typeof referenceFourV86!=='undefined')pixiFX.frameV86(now,this);
 return result;
};
// V85 — Haze, opt-in only. Do not touch the normal move renderer.
// Retains the native status/stage-reset behavior, casting rules and zero damage.
const oldHazePainterV85=window.PokemonTorreV360Paint;
window.PokemonTorreV360Paint=function(g,f,now,engine){
 if(typeof hazeV85!=='undefined'&&norm(f?.move?.name||f?.name)==='haze')
  return true; // never draw the old catalog snow-ring over the new fog
 return typeof oldHazePainterV85==='function'?
  oldHazePainterV85.apply(this,arguments):false;
};
const previousHazeUseV85=BattleEngine.prototype.useMove;
BattleEngine.prototype.useMove=function(slot){
 if(typeof hazeV85==='undefined')return previousHazeUseV85.apply(this,arguments);
 const move=battle?.active&&Number.isInteger(slot)?
   skillSet(current())?.[slot]:null;
 if(norm(move?.name)!=='haze')return previousHazeUseV85.apply(this,arguments);
 const beforeCd=cooldowns?.[slot],beforeEnergy=battle?.energy,
   start=performance.now();
 const result=previousHazeUseV85.apply(this,arguments);
 const accepted=result!==false&&battle?.active&&!battle?.paused&&
  ((Number(cooldowns?.[slot])>Number(beforeCd))||
    (Number(battle?.energy)<Number(beforeEnergy)));
 if(!accepted)return result;
 // Remove ONLY Haze-only generic VISUAL QUEUES from THIS cast.
 // Original status clearing has already run in previousHazeUseV85.
 if(Array.isArray(this.v3580Visuals))
  this.v3580Visuals=this.v3580Visuals.filter(f=>
    !(norm(f?.move?.name||f?.name)==='haze'&&f.at>=start-12));
 if(Array.isArray(this.v3568StatusFX))
  this.v3568StatusFX=this.v3568StatusFX.filter(f=>
    norm(f?.move?.name||f?.name)!=='haze');
 if(Array.isArray(this.v342StatusFx))
  this.v342StatusFx=this.v342StatusFx.filter(f=>
    norm(f?.move?.name||f?.name)!=='haze');
 if(this.v351StatusCast&&this.v351StatusCast.at>=start-12)
  this.v351StatusCast=null;
 if(!pixiFX.beginHazeV85(this,start))
  window.PokemonTorreHazeErrorV85='WebGL indisponível para Haze';
 return result;
};
const previousHazeDrawV85=BattleEngine.prototype.draw;
BattleEngine.prototype.draw=function(now){
 const result=previousHazeDrawV85.apply(this,arguments);
 if(typeof hazeV85!=='undefined')pixiFX.frameHazeV85(now,this);
 return result;
};


 // V87: all game paths (win, loss, lab, capture, reset) call stopTimers().
 // Kill GPU overlays BEFORE battleCanvas is removed; otherwise paused Pixi
 // sprites can remain visible above the next menu at z-index 9000.
 const previousStopTimersV87=stopTimers;
 stopTimers=function(){
  try{pixiFX.clearAll();}catch(e){console.warn('Pixi V87 cleanup:',e);}
  return previousStopTimersV87.apply(this,arguments);
 };
 // Some menus replace the modal without calling stopTimers (pause, return,
 // alternate flows). Observe only modal-level changes, not battle animations.
 function observePixiModalV87(){
  const modal=document.getElementById('modal'),backdrop=document.getElementById('backdrop');
  if(!modal||!backdrop)return;
  const observer=new MutationObserver(()=>pixiFX.onBattleUiChange());
  observer.observe(modal,{attributes:true,attributeFilter:['class'],childList:true});
  observer.observe(backdrop,{attributes:true,attributeFilter:['class']});
  pixiFX.onBattleUiChange();
 }
 if(document.readyState==='loading')
  document.addEventListener('DOMContentLoaded',observePixiModalV87,{once:true});
 else observePixiModalV87();


// V89: the original engine always spawns a small bullet/round leaf for
// bolt-like attacks. Keep its physics and hit detection, but DON'T draw
// that old circle above a properly installed, authored Pixi whip/leaf cast.
const previousGrassCastV89=BattleEngine.prototype.useMove;
BattleEngine.prototype.useMove=function(slot){
 const mon=battle?.active?current():null;
 const mv=mon&&Number.isInteger(slot)?skillSet(mon)?.[slot]:null;
 const key=typeof grassFourV84!=='undefined'?grassFourV84.resolve(mv?.name):'';
 if(!key)return previousGrassCastV89.apply(this,arguments);
 const beforeEnergy=battle.energy,beforeCd=Number(cooldowns?.[slot])||0;
 const beforePreview=pixiFX.diagnostics()?.activePreview?.id;
 const oldProjectiles=new Set(this.projectiles||[]);
 const oldParticles=this.particles?.length||0,oldRings=this.rings?.length||0;
 const started=performance.now();
 const result=previousGrassCastV89.apply(this,arguments);
 const accepted=result!==false&&battle?.active&&!battle?.paused&&
  ((Number(cooldowns?.[slot])||0)>beforeCd||Number(battle.energy)<beforeEnergy);
 if(!accepted)return result;
 // Some physical Grass moves have no v359 attack entry at all. Build a
 // VISUAL-ONLY cast from actual attacker/target coordinates in that case.
 let active=pixiFX.diagnostics()?.activePreview;
 if(!active||active.key!==key||active.id===beforePreview){
  const fx={name:mv.name,move:mv,
   from:[this.player.x,this.player.y-this.h*.10],
   to:[this.enemy.x,this.enemy.y-this.h*.12],
   at:started,duration:Math.max(850,Number(mv.duration)||1000),
   times:[.62],battle};
  if(!pixiFX.beginV84(this,fx,key)){
   window.PokemonTorreGrassErrorV89='Pixi não iniciou '+mv.name;
   return result; // leave the original projectile visible if WebGL fails
  }
  active=pixiFX.diagnostics()?.activePreview;
 }
 if(!active||active.key!==key)return result;
 // Only hide VISUAL pieces spawned by this one accepted Grass action.
 // Native projectiles still travel, collide and register the original damage.
 for(const bullet of this.projectiles||[])
  if(!oldProjectiles.has(bullet)&&bullet.from==='player')
   bullet.__v89HiddenGrassVisual=true;
 if(this.particles?.length>oldParticles)this.particles.length=oldParticles;
 if(this.rings?.length>oldRings)this.rings.length=oldRings;
 return result;
};
const previousGrassDrawProjectileV89=BattleEngine.prototype.drawProjectile;
if(typeof previousGrassDrawProjectileV89==='function')
 BattleEngine.prototype.drawProjectile=function(shot){
  if(shot?.__v89HiddenGrassVisual)return;
  return previousGrassDrawProjectileV89.apply(this,arguments);
};
window.PokemonTorreGrassV89=()=>({
 version:'90.0',pixi:pixiFX.diagnostics(),
 authored:typeof grassFourV84!=='undefined'?grassFourV84.diagnostics():null,
 missingWebPRequired:false
});
// Optional battle diagnostics: only visible with ?fx_debug=1, never in normal
// gameplay. Lets a phone screenshot expose why WebGL could not start.
if(new URLSearchParams(location.search).get('fx_debug')==='1'){
 const showGrassDebug=()=>{
  if(document.getElementById('pt-v90-fx-debug'))return;
  const el=document.createElement('div');el.id='pt-v90-fx-debug';
  el.style.cssText='position:fixed;top:4px;left:4px;right:4px;z-index:999999;'+
   'padding:5px 8px;background:#122636ed;color:#d9feda;border:1px solid #7eec9d;'+
   'border-radius:6px;font:11px monospace;pointer-events:none;white-space:pre-wrap';
  document.body.appendChild(el);
  const report=()=>{
   try{
    const info=window.PokemonTorreGrassV89();
    const d=info.pixi,m=info.authored,last=m?.last||null;
    el.textContent='GRASS V90 | '+(battle?.active?'BATALHA':'MENU')+
     ' | Pixi '+(d.ready?'ATIVO':d.gpu?'DISPONIVEL':'SEM WEBGL')+
     ' | FX '+(d.activePreview?.key||'nenhum')+
     ' | '+(last?.move||'-')+' '+(last?.frame||0)+'/'+(last?.total||0)+
     ' | quadros GPU '+(m?.generated||0)+
     ' | erro '+(window.PokemonTorreGrassErrorV89||d.error||m?.failures?.at(-1)||'nenhum');
   }catch(err){el.textContent='GRASS V90 DEBUG: '+String(err?.message||err);}
  };
  report();setInterval(report,400);
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',showGrassDebug,{once:true});
 else showGrassDebug();
}


// V91 guaranteed four-grass visibility on Android and devices without WebGL.
// Pixi remains the enhanced layer. This Canvas renderer is NOT the old generic
// projectile: it paints a black-outlined whip, multiple leaves or local roots.
const previousGrassUseV91=BattleEngine.prototype.useMove;
BattleEngine.prototype.useMove=function(slot){
 const actor=battle?.active?current():null;
 const move=actor&&Number.isInteger(slot)?skillSet(actor)?.[slot]:null;
 const key=typeof grassFallbackV91!=='undefined'?grassFallbackV91.keyOf(move?.name):'';
 if(!key)return previousGrassUseV91.apply(this,arguments);
 const beforeEnergy=battle.energy,oldCd=Number(cooldowns?.[slot])||0;
 const existing=new Set(this.projectiles||[]);
 const time=performance.now();
 const result=previousGrassUseV91.apply(this,arguments);
 const accepted=result!==false&&battle?.active&&!battle.paused&&(
  Number(battle.energy)<Number(beforeEnergy)||
  Number(cooldowns?.[slot])>oldCd);
 if(!accepted)return result;
 grassFallbackV91.start(this,move.name,time);
 // Native projectile remains in engine collision/hit queue; only its
 // obsolete circle is hidden AFTER a working alternative exists.
 for(const shot of this.projectiles||[])
  if(!existing.has(shot)&&shot?.from==='player'&&shot.type==='grass')
   shot.__v91CoveredByPlant=true;
 return result;
};
const previousGrassProjectilePainterV91=BattleEngine.prototype.drawProjectile;
if(typeof previousGrassProjectilePainterV91==='function')
 BattleEngine.prototype.drawProjectile=function(shot){
  if((shot?.__v91CoveredByPlant||
    (shot?.from==='player'&&shot?.type==='grass'&&
     grassFallbackV91.active(this,performance.now())))&&battle?.active)
   return; // no bolinha, projectile keeps moving/colliding
  return previousGrassProjectilePainterV91.apply(this,arguments);
};
// Both the V359 catalog painter and the native bolting-circle painter draw
// on the original Canvas. Suppress ONLY the same four names while V91 draws.
const previousCatalogPainterV91=window.PokemonTorreV360Paint;
window.PokemonTorreV360Paint=function(g,fx,now,owner){
 if(grassFallbackV91.suppressLegacy(owner,fx?.move?.name||fx?.name,now))
  return true;
 return typeof previousCatalogPainterV91==='function'?
  previousCatalogPainterV91.apply(this,arguments):false;
};
const previousGrassDrawV91=BattleEngine.prototype.draw;
BattleEngine.prototype.draw=function(now){
 const result=previousGrassDrawV91.apply(this,arguments);
 if(battle?.active)grassFallbackV91.draw(this,now);
 return result;
};
const previousClearGrassV91=stopTimers;
stopTimers=function(){
 if(typeof engine!=='undefined'&&engine)grassFallbackV91.clear(engine);
 return previousClearGrassV91.apply(this,arguments);
};

})();
