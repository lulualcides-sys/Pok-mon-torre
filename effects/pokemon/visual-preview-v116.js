/* Pokémon Torre V116 — OFFICIAL after user approved the battle preview
 * Existing source sprites unchanged. Size balance, authentic shiny entrance
 * timing, and short damage recoil applied to sprite draw calls ONLY.
 * V95 Mewtwo and V115 global approved finish are left intact.
 */
(()=>{
 'use strict';
 const qs=new URLSearchParams(location.search);
 const selected=qs.get('pokemon_visual_preview');
 const approved=qs.get('pokemon_polish')!=='off'&&(selected===null||selected==='v116');
 if(!approved||typeof BattleEngine!=='function'||!BattleEngine.prototype.drawMon||
    window.PokemonTorreVisualPreviewV116?.installed)return;
 const small=new Set([1,4,7,10,11,13,14,16,19,21,23,25,27,29,32,35,39,43,46,48,50,52,56,60,63,66,69,72,74,79,81,84,90,92,96,98,100,102,104,109,116,118,120,129,132,133,138,140,147,151]);
 const large=new Set([3,6,9,18,24,28,31,34,36,38,40,45,49,55,57,59,62,65,67,68,71,73,76,78,80,82,85,87,89,91,94,97,99,101,103,105,106,107,110,112,115,117,119,121,123,124,125,126,127,128,130,131,134,135,136,137,139,141,142,143,144,145,146,148,149]);
 const giant=new Set([95,130,131,142,143,149]);
 // Conservative visually pleasing size classes, never literal 8.8m Onix on screen.
 const scaleFor=id=>giant.has(id)?1.27:large.has(id)?1.115:small.has(id)?.865:1;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const metrics={draws:0,frames:0,species:new Set(),sizeClasses:new Set(),
  shinyDraws:0,shinyEntranceCorrections:0,recoilFrames:0,maxRecoil:0,
  previousMewtwoPreserved:true,noHitboxChanges:true,last:null,errors:[]};
 const original=BattleEngine.prototype.drawMon;
 BattleEngine.prototype.drawMon=function(actor,id,enemy,now){
  const species=Number(id),ctx=this.ctx;
  if(!actor||!ctx||typeof ctx.drawImage!=='function'||!Number.isInteger(species)||
     species<1||species===150)return original.apply(this,arguments);
  const scale=scaleFor(species);
  const hurt=clamp(Number(actor.flash)||0,0,.26);
  const progress=1-hurt/.26;
  const recoil=hurt>0?Math.sin(Math.PI*progress)*Math.min(8,(this.h||500)*.015):0;
  const other=enemy?this.player:this.enemy;
  const direction=Math.sign((actor.x||0)-(other?.x??actor.x-1))||1;
  const offsetX=recoil*direction,offsetY=-recoil*.24;
  const before=ctx.drawImage;
  let installed=false;
  try{
   ctx.drawImage=function(img,...args){
    const isNine=args.length===8,isFive=args.length===4;
    if(!isNine&&!isFive)return before.call(ctx,img,...args);
    const d=isNine?4:0;
    const x=args[d],y=args[d+1],w=args[d+2],h=args[d+3];
    if(![x,y,w,h].every(Number.isFinite)||w===0||h===0)
     return before.call(ctx,img,...args);
    const ww=w*scale,hh=h*scale;
    const dx=x+(w-ww)/2+offsetX;
    const dy=y+(h-hh)+offsetY; // preserve feet/ground line
    args[d]=dx;args[d+1]=dy;args[d+2]=ww;args[d+3]=hh;
    metrics.frames++;
    return before.call(ctx,img,...args);
   };
   installed=ctx.drawImage!==before;
  }catch(e){metrics.errors.push(String(e?.message||e));}
  let result;
  try{result=original.apply(this,arguments);}
  finally{
   if(installed){try{ctx.drawImage=before}catch(e){metrics.errors.push(String(e?.message||e));}}
  }
  metrics.draws++;metrics.species.add(species);metrics.sizeClasses.add(scale);
  if(hurt>0&&recoil>.1){metrics.recoilFrames++;metrics.maxRecoil=Math.max(metrics.maxRecoil,recoil);}
  // The game already provides protected true-colour shiny sprites (when present).
  // Do not recolour missing palettes: no generic hue-rotation of regular art.
  const mon=typeof foe==='function'&&typeof current==='function'?
    (enemy?foe():current()):null;
  if(mon?.shiny||mon?.isShiny){
   metrics.shinyDraws++;
   if(typeof battle!=='undefined'&&battle?.active&&Number.isFinite(now)){
    const key=enemy?'v3559EnemyEntryUntil':'v3559PlayerEntryUntil';
    // Existing native stars last 2.2 seconds; reduce to approx. 1.5 s.
    const prev=Number(battle[key]);
    if(Number.isFinite(prev)&&prev>now+1500){
     battle[key]=now+1500;metrics.shinyEntranceCorrections++;
    }
   }
  }
  metrics.last={id:species,scale,faceUnchanged:true,recoil:Math.round(recoil*100)/100,shiny:!!mon?.shiny};
  return result;
 };
 // Localhost QA hooks only, never exposed as a player editor.
 if(/^(localhost|127\.0\.0\.1)$/.test(location.hostname||'')&&
    window.PokemonTorreLocalCombatTestV47){
  const qa=window.PokemonTorreLocalCombatTestV47;
  qa.prepareVisualV116=function(id,shiny=false,hurt=false){
   qa.start(id,143);
   if(shiny){current().shiny=true;battle.v3559PlayerIdentity=null;}
   if(hurt)engine.player.flash=.26;
   return {id,shiny,hurt,scale:scaleFor(id),active:!!battle?.active};
  };
  qa.readVisualV116=()=>({
   global:window.PokemonTorrePokemonPolishV115?.diagnostics(),
   mewtwo:window.PokemonTorrePokemonPolishV95?.diagnostics(),
   currentShiny:!!current()?.shiny,
   entryUntil:battle?.v3559PlayerEntryUntil,
   engineTime:engine?.time,
   visual:window.PokemonTorreVisualPreviewV116?.diagnostics(),
   arena:!!window.PokemonTorreArenaWideV98?.enabled
  });
 }
 window.PokemonTorreVisualPreviewV116=Object.freeze({
  installed:true,previewOnly:false,approved:true,version:'116.0-official',
  scaleFor,
  diagnostics:()=>({...metrics,species:[...metrics.species].slice(0,60),
   sizeClasses:[...metrics.sizeClasses],errors:metrics.errors.slice(-4)})
 });
})();
