/* Pokémon Torre V65 — original-game HP drain rules for every drain move.
 * Leech Seed is handled by the existing 2-second condition ticker:
 * 1/8 of target max HP per tick, actual HP transferred. This module
 * handles direct attacks, healing after a confirmed real HP loss.
 * NO art assets, approved sprites, energy costs or hitbox are changed.
 */
(function(){
 'use strict';
 const rates=Object.freeze({
  absorver:0.5,absorb:0.5,megadreno:0.5,megadrain:0.5,
  gigadreno:0.5,gigadrain:0.5,
  leechlife:0.5,dreinavida:0.5,sanguessuga:0.5,
  drainpunch:0.5,socodreno:0.5,
  hornleech:0.5,chifredreno:0.5,
  dreameater:0.5,devoradordesonhos:0.5,
  paraboliccharge:0.5,cargaparabolica:0.5,
  bitterblade:0.5,laminaamarga:0.5,
  matchagotcha:0.5,
  drainingkiss:0.75,beijodrenante:0.75,
  oblivionwing:0.75,asasdaobliviao:0.75
 });
 const normalize=name=>String(name||'').normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
 const drainRate=name=>rates[normalize(name)]||0;
 const drainedHP=(maxHP,currentHP)=>Math.min(Math.max(0,currentHP),
  Math.max(1,Math.floor(Math.max(0,maxHP)/8)));
 const healFromDamage=(actual,rate,missing)=>actual>0&&rate>0?
  Math.min(Math.max(0,missing),Math.max(1,Math.floor(actual*rate))):0;
 const metrics={casts:0,hitChecks:0,actualHits:0,healed:0,seedTicks:0,blockedDreamEater:0};
 const oldMove=BattleEngine.prototype.useMove;
 BattleEngine.prototype.useMove=function(slot){
  const p=battle?.active?current():null;
  const move=p&&Number.isInteger(slot)?skillSet(p)?.[slot]:null;
  const rate=drainRate(move?.name);
  const time=performance.now();
  if(!rate||!p)return oldMove.apply(this,arguments);
  if(normalize(move.name)==='dreameater'&&
      !this.v25?.stats?.enemy?.conditions?.includes('sleep')){
   metrics.blockedDreamEater++;
   if(this.v25Popup&&this.enemy)this.v25Popup(this.enemy.x,
    this.enemy.y-this.h*.25,'PRECISA ESTAR DORMINDO','#ffd0ae');
   return false;
  }
  const former=this.v65DrainCandidate;
  const cast={name:move.name,attacker:p,victim:foe(),
   type:move.type,rate,at:time,until:time+2650};
  // Dash/contact moves may hit synchronously inside oldMove().
  this.v65DrainCandidate=cast;
  const energy=battle.energy,cd=cooldowns[slot];
  const result=oldMove.apply(this,arguments);
  const accepted=battle?.active&&result!==false&&
   ((cooldowns[slot]||0)>time&&(cooldowns[slot]||0)!==cd||battle.energy<energy);
  if(accepted){metrics.casts++;if(!cast.consumed)this.v65DrainCandidate=cast;}
  else if(this.v65DrainCandidate===cast)this.v65DrainCandidate=former||null;
  return result;
 };
 const oldHit=BattleEngine.prototype.hitTarget;
 BattleEngine.prototype.hitTarget=function(who,type,power){
  const candidate=this.v65DrainCandidate;
  const target=who==='enemy'&&battle?.active?foe():null;
  const before=target?.hp;
  const result=oldHit.apply(this,arguments);
  if(!candidate||who!=='enemy'||candidate.consumed||
    candidate.victim!==target||!target||candidate.attacker?.hp<=0||
    type!==candidate.type)return result;
  metrics.hitChecks++;
  if(performance.now()>candidate.until){
   if(this.v65DrainCandidate===candidate)this.v65DrainCandidate=null;
   return result;
  }
  const actual=Math.max(0,before-target.hp);
  if(!actual)return result; // missed, dodged, invulnerable: never heal
  candidate.consumed=true;
  if(this.v65DrainCandidate===candidate)this.v65DrainCandidate=null;
  metrics.actualHits++;
  const p=candidate.attacker;
  const heal=healFromDamage(actual,candidate.rate,p.maxHp-p.hp);
  if(heal>0){
   p.hp=Math.min(p.maxHp,p.hp+heal);
   metrics.healed+=heal;
   if(typeof this.v25Popup==='function'&&this.player)
    this.v25Popup(this.player.x,this.player.y-this.h*.30,
       'DRENO +'+heal+' PV','#9cffb0');
  }
  this.v65LastDrain={move:candidate.name,damage:actual,
   rate:candidate.rate,healed:heal,remaining:p.hp,max:p.maxHp};
  return result;
 };
 // Read-only test hooks, for deterministic calculation and live battle checks.
 window.PokemonTorreDrainV65=()=>({
  version:'65.0',
  acceptedMoves:Object.keys(rates),
  percentage:Object.fromEntries(Object.entries(rates)),
  seedFraction:1/8,seedTickSeconds:2,
  metrics:{...metrics},
  active:engine?.v65DrainCandidate?.name||null,
  last:engine?.v65LastDrain||null,
  lastSeed:engine?.v65SeedStats||null
 });
 window.PokemonTorreDrainRulesV65={drainRate,drainedHP,healFromDamage};
})();
