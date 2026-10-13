function paint(g,f,now,e,k){
 if(!f||!Array.isArray(f.from)||!Array.isArray(f.to)||!g)return false;
 const dur=Math.max(250,f.duration||950),t=C((now-f.at)/dur),s=C((e?.h||420)/430,.62,1.18);
 const low=!!(e?.fps>0&&e.fps<36);
 if(t<0||now<f.at||now>f.at+dur+30)return true;
 g.save();g.imageSmoothingEnabled=false;
 const entry=registry.get(k);if(!entry){g.restore();return false;}
 if(!pixiFX.paint(f,e,k))entry.draw(g,f,t,now,s,low);
 g.restore();counts[k]=(counts[k]||0)+1;return true;
}
// Render de golpes ofensivos: pipeline existente. O retorno true impede duplicação por Canvas/PNG antigos.
const prevPainter=window.PokemonTorreV360Paint;
window.PokemonTorreV360Paint=function(g,f,now,e){
 // These 4 named moves draw only the source GBA pixel sprites. Intercept
 // BEFORE Pixi/semantic/old Canvas to avoid duplicate generic VFX.
 // Fire-specific sprites take priority over the generic pipeline.
 if(legendaryFireFX.handles(f))return legendaryFireFX.paint(g,f,now,e);
 if(originalFireFX.handles(f))return originalFireFX.paint(g,f,now,e);
 if(originalGbaFX.handles(f))return originalGbaFX.paint(g,f,now,e);
 const k=pick(f?.move?.name||f?.name);if(k)return paint(g,f,now,e,k);
 // The original GBA painter above owns Psybeam and the other three moves.
 return typeof prevPainter==='function'?prevPainter(g,f,now,e):false;
};
// Status (sem projétil na fila v359) precisa ser animado mesmo quando não causa dano.
const previousUse=BattleEngine.prototype.useMove;
BattleEngine.prototype.useMove=function(i){
 const mon=battle?.active?current():null,mv=mon&&Number.isInteger(i)?skillSet(mon)?.[i]:null,k=pick(mv?.name);
 const before=this.v359Attacks?.length||0,energy=battle?.energy,oldCd=Number.isInteger(i)?cooldowns[i]:0,when=performance.now();
 const result=previousUse.apply(this,arguments);
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
 if(!accepted)return result;
 const duration=registry.get(k).duration;
 this.v3580Visuals||=[];
 this.v3580Visuals.push({move:mv,at:when,end:when+duration,duration,from:[this.player.x,this.player.y-this.h*.13],to:[this.enemy.x,this.enemy.y-this.h*.12]});
 this.v3580Visuals=this.v3580Visuals.slice(-8);
 return result;
};
const previousDraw=BattleEngine.prototype.draw;
BattleEngine.prototype.draw=function(now){
 pixiFX.ensure(this);
 const result=previousDraw.call(this,now);
 if(!battle?.active||!this.ctx){this.v3580Visuals=[];return result;}
 this.v3580Visuals=(this.v3580Visuals||[]).filter(f=>f.end>now);
 for(const fx of this.v3580Visuals){const k=pick(fx.move?.name);if(k)paint(this.ctx,fx,now,this,k);}
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
  return (n==='punhodefogo'||n==='firepunch')&&now>=fx.at&&now<fx.at+Math.max(350,fx.duration||1000);
 });
 if(!active.length||!this.player||!this.enemy||!battle?.active)return _firePunchDraw.call(this,now);
 const fx=active[active.length-1],p=this.player,q=this.enemy,ox=p.x,oy=p.y;
 const t=Math.max(0,Math.min(1,(now-fx.at)/Math.max(350,fx.duration||1000)));
 const smooth=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v)};
 const reach=smooth((t-.07)/.37)*(1-smooth((t-.56)/.32));
 const dx=q.x-ox,dy=q.y-oy,dist=Math.hypot(dx,dy)||1;
 const stop=Math.max(36,Math.min(58,this.h*.105));
 const travel=Math.max(0,dist-stop)*reach;
 p.x=ox+dx/dist*travel;p.y=oy+dy/dist*travel;
 try{return _firePunchDraw.call(this,now);}
 finally{p.x=ox;p.y=oy;}
};
})();
