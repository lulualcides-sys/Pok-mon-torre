/* Pokemon Torre V47.2 — reliable real collisions with independent per-cast physics.
 * The original BattleEngine.hitTarget()/damage() remains the only damage source.
 * Projectiles steer toward the foe instead of missing on every sideways step.
 * Beams track the visible target on discharge; physical dashes actually connect.
 * Status moves never gain damage, enemy attacks and dodge mechanics remain.
 */
(function(){
 'use strict';
 const report={version:'47.2',casts:0,projectileCorrections:0,beamsAligned:0,
  contactFollowThrough:0,missingCollisionRecovered:0,realHits:0,
  ignoredOldShots:0,waitedForInvincibility:0,lastHit:null,lastCast:null};
 const savedHit=BattleEngine.prototype.hitTarget;
 BattleEngine.prototype.hitTarget=function(who,type,power){
  const victim=battle?.active?(who==='enemy'?foe():current()):null;
  const before=Number(victim?.hp);
  const result=savedHit.apply(this,arguments);
  const after=Number(victim?.hp);
  if(Number.isFinite(before)&&Number.isFinite(after)&&after<before){
   report.realHits++;
   report.lastHit={who,type,damage:before-after,time:performance.now()};
  }
  return result;
 };
 const savedCast=BattleEngine.prototype.useMove;
 BattleEngine.prototype.useMove=function(slot){
  const active=battle?.active&&!battle.paused;
  const owner=active?current():null;
  const selected=owner&&Number.isInteger(slot)?skillSet(owner)?.[slot]:null;
  const now=performance.now();
  const priorEnergy=Number(battle?.energy);
  const priorCooldown=Number(cooldowns[slot]||0);
  const victim=active?foe():null;
  const priorHP=Number(victim?.hp);
  // An existing projectile from an EARLIER move must never prevent THIS
  // move from generating an independent collision. Track the identity
  // of physics actors present BEFORE the new cast.
  const shotsBefore=new Set((this.projectiles||[]).filter(x=>x.from==='player'));
  const beamBefore=this.telegraph;
  const result=savedCast.apply(this,arguments);
  const accepted=!!(active&&selected&&battle?.active&&
    (Number(battle.energy)<priorEnergy||
      (Number(cooldowns[slot]||0)>now&&Number(cooldowns[slot]||0)!==priorCooldown)));
  if(!accepted)return result;
  report.casts++;report.lastCast=selected.name;
  // The real game catalogue marks some physical moves (e.g. Faísca,
  // Aqua Tail) as "bolt", although the approved animations are body contact.
  // Check their visual registration; don't trust the obsolete kind alone.
  const spriteContact=Boolean(
   (typeof electricSpriteV46!=='undefined'&&electricSpriteV46.resolve(selected)?.contact)||
   (typeof waterSpriteV43!=='undefined'&&waterSpriteV43.resolve(selected)?.contact)||
   (typeof fireSpriteV41!=='undefined'&&fireSpriteV41.resolve(selected)?.contact)
  );
  if((selected.kind==='dash'||spriteContact)&&selected.kind!=='status'&&
     selected.cat!=='status'&&Number(selected.power)>0&&
    victim===foe()&&Number(victim?.hp)>=priorHP){
   this.v47ContactToLand=(this.v47ContactToLand||[]).filter(f=>f.until>now);
   this.v47ContactToLand.push({
    at:now+380,until:now+2750,owner,victim,hpBefore:priorHP,
    type:selected.type,power:selected.power,name:selected.name
   });
  }else if(Number(selected.power)>0&&!spriteContact&&selected.kind!=='dash'&&
      selected.kind!=='status'&&selected.cat!=='status'&&
      victim===foe()&&Number(victim?.hp)>=priorHP){
   // Some older visual-move overrides consume cooldown and play an animation
   // without ever spawning a REAL projectile / beam. Recover ONLY those casts.
   // A real projectile/beam, or a previous damage event, cancels the fallback.
   this.v47MissingCollisions=(this.v47MissingCollisions||[]).filter(x=>x.until>now);
   const createdProjectiles=(this.projectiles||[]).filter(x=>
    x.from==='player'&&!shotsBefore.has(x)&&x.life>0);
   const createdBeam=this.telegraph?.from==='player'&&this.telegraph!==beamBefore;
   // Do not duplicate a REAL projectile or beam created by the same cast.
   // Other casts' shots do not affect this decision.
   if(!createdProjectiles.length&&!createdBeam){
    this.v47MissingCollisions.push({
     at:now+770,until:now+3200,owner,victim,type:selected.type,
     power:selected.power,hpBefore:priorHP,name:selected.name
    });
    report.ignoredOldShots+=shotsBefore.size;
   }
   // Wider matching between the visible projectile and the original game's
   // segmentTouches() collider, without changing the animation itself.
   for(const shot of createdProjectiles){
    shot.r=Math.max(Number(shot.r)||0,(this.h||560)*.031);
   }
  }
  return result;
 };
 const savedUpdate=BattleEngine.prototype.update;
 BattleEngine.prototype.update=function(dt,now){
  const ready=battle?.active&&!battle.paused&&current()?.hp>0&&foe()?.hp>0;
  if(ready&&this.enemy){
   const x=this.enemy.x,y=this.enemy.y;
   for(const projectile of this.projectiles||[]){
    if(projectile.from!=='player'||projectile.life<=0)continue;
    if(!Number.isFinite(projectile.vx)||!Number.isFinite(projectile.vy))continue;
    // Preserve direction and speed so hit physics and art agree.
    const dx=x-projectile.x,dy=y-projectile.y;
    const d=Math.hypot(dx,dy),speed=Math.hypot(projectile.vx,projectile.vy);
    if(d<1||speed<1)continue;
    const steer=Math.min(.95,Math.max(.50,(Number(dt)||.016)*43));
    const vx=projectile.vx*(1-steer)+dx/d*speed*steer;
    const vy=projectile.vy*(1-steer)+dy/d*speed*steer;
    const length=Math.hypot(vx,vy)||1;
    projectile.vx=vx/length*speed;projectile.vy=vy/length*speed;
    report.projectileCorrections++;
   }
   // The original beam checks an extremely thin static line aimed at the
   // enemy's OLD position. Aim its REAL collision at the current target.
   const t=this.telegraph;
   if(t?.from==='player'&&t.kind==='beam'&&t.remaining<=dt+.015){
    const dx=x-this.player.x,dy=y-this.player.y;
    const length=Math.hypot(dx,dy)||1;
    t.dx=dx/length;t.dy=dy/length;
    t.width=Math.max(t.width||0,(this.h||560)*.082);
    report.beamsAligned++;
   }
  }
  const result=savedUpdate.apply(this,arguments);
  // Dash impact at its actual animation contact moment, with original damage
  // and resistance logic. No instant fake hit, no double damage, no status hit.
  if(battle?.active&&this.v47ContactToLand?.length){
   const time=performance.now();
   const pending=[];
   for(const fx of this.v47ContactToLand){
    if(fx.until<=time||fx.victim!==foe()||fx.owner!==current())continue;
    if(Number(fx.victim.hp)<fx.hpBefore)continue;
    if(time<fx.at||this.enemy.inv>0){
     if(this.enemy.inv>0)report.waitedForInvincibility++;
     pending.push(fx);continue;
    }
    const hp=Number(fx.victim.hp);
    this.hitTarget('enemy',fx.type,fx.power);
    if(Number(fx.victim.hp)<hp)report.contactFollowThrough++;
    else if(time<fx.until)pending.push(fx);
   }
   this.v47ContactToLand=pending;
  }
  // A reliable impact, not a fake visual number: use the same damage()
  // and immunities as the base game if NO collision actor was ever created.
  if(battle?.active&&this.v47MissingCollisions?.length){
   const time=performance.now(),pending=[];
   for(const fx of this.v47MissingCollisions){
    if(fx.until<=time||fx.victim!==foe()||fx.owner!==current())continue;
    // Only this cast's physics is relevant. Previous casts can leave shots
    // alive in the arena; those must NOT silence this accepted hit.
    if(Number(fx.victim.hp)<fx.hpBefore)continue;
    if(time<fx.at||(this.enemy?.inv||0)>0){
     if((this.enemy?.inv||0)>0)report.waitedForInvincibility++;
     pending.push(fx);continue;
    }
    const hp=Number(fx.victim.hp);
    this.hitTarget('enemy',fx.type,fx.power);
    // Drop fallback after one ORIGINAL hit attempt, including immunities.
    if(Number(fx.victim.hp)<hp)report.missingCollisionRecovered++;
   }
   this.v47MissingCollisions=pending;
  }
  return result;
 };
 window.PokemonTorreCombatV47=()=>({
  ...report,active:!!battle?.active,
  enemyHp:battle?.active?foe()?.hp:null,
  pendingContact:engine?.v47ContactToLand?.length||0,
  pendingMissingCollision:engine?.v47MissingCollisions?.length||0
 });
 // Deterministic real-browser regression harness available ONLY on localhost.
 // No production site visitor can start test battles or alter saved creatures.
 if(/^(localhost|127\.0\.0\.1)$/.test(location.hostname)){
  window.PokemonTorreLocalCombatTestV47={
   start(allyId=25,foeId=143){
    if(battle?.active)stopTimers();
    save.team=[mon(Number(allyId),76)];
    const target=mon(Number(foeId),85);
    target.hp=target.maxHp*20;target.maxHp=target.hp;
    startBattle([target],'TESTE DE ACERTO',true);
    if(engine){engine.foeDodgeCD=999;engine.enemy.inv=0;engine.enemy.spawn=0;}
    return this.snapshot();
   },
   cast(slot=0){
    if(!engine||!battle?.active)return {error:'No active battle'};
    // Test harness must not remain in the tutorial/intro pause state.
    battle.paused=false;battle.energy=100;cooldowns[slot]=0;
    const selected=skillSet(current())[slot];
    const before=foe().hp;
    engine.useMove(slot);
    return {name:selected?.name,kind:selected?.kind,type:selected?.type,
     hpBefore:before,hpAfter:foe().hp,...this.snapshot()};
   },
   snapshot(){return {active:!!battle?.active,paused:!!battle?.paused,energy:battle?.energy,
    cooldowns:[...cooldowns],player:current()?.id,
    foe:foe()?.id,foeHp:foe()?.hp,playerHp:current()?.hp,
    moves:battle?.active?skillSet(current()).map(m=>({name:m.name,kind:m.kind,power:m.power,type:m.type})):[],
    projectiles:engine?.projectiles?.length||0,
    stats:window.PokemonTorreCombatV47()
   };}
  };
 }
})();