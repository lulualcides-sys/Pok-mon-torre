/* Pokemon Torre V100: remove verified Portuguese/English move duplicates.
 * Preserve canonical original move objects and approved animation handlers.
 * This is a CATALOG / SAVED-SLOT normalization layer, not a VFX rewrite.
 * Distinct moves with similar names intentionally stay distinct.
 */
(()=>{
 'use strict';
 window.PokemonTorreMoveDedupScopeV100=Object.freeze({
  catalogue:typeof v32Catalogue,moveKey:typeof v32MoveKey,
  defaultSlots:typeof v32DefaultSlots,skillSet:typeof skillSet
 });
 if(typeof v32Catalogue!=='function'||typeof v32DefaultSlots!=='function')return;
 const normalize=s=>String(s||'').normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'').toLowerCase()
  .replace(/[\u2018\u2019\u0027]/g,'').replace(/[^a-z0-9]/g,'');
 // One canonical name per verified translated move, favoring an approved
 // move when the original English visual is specifically approved.
 // Custom moves (Chicote Duplo, Geada Persistente, etc) are NOT aliases.
 const groups=[
  ['Ácido','Acid'],
  ['Aerocorte','Air Slash'],
  ['Barreira Psíquica','Barrier'],
  ['Brasa','Ember'],
  ['Brilho Mágico','Dazzling Gleam'],
  ['Cabeçada','Headbutt'],
  ['Chicote de Vinha','Vine Whip'],
  ['Corte X','X-Scissor'],
  ['Descarga','Discharge'],
  ['Endurecer','Harden'],
  ['Fogo-Fátuo','Will-O-Wisp'],
  ['Folha Navalha','Razor Leaf'],
  ['Garra de Metal','Metal Claw'],
  ['Garra Dracônica','Dragon Claw'],
  ['Giro de Fogo','Fire Spin'],
  ['Golpe de Karatê','Karate Chop'],
  ['Hidro Bomba','Hydro Pump'],
  ['Ice Beam','Raio de Gelo'],  // preserve established Ice Beam renderer
  ['Jato de Água','Jato d’Água','Water Gun','Pistola d’Água'],
  ['Lambida','Lick'],
  ['Lança-Chamas','Flamethrower'],
  ['Luz da Lua','Moonlight'],
  ['Nevasca','Blizzard'],
  ['Osso Bumerangue','Bonemerang'],
  ['Pó do Sono','Sleep Powder'],
  ['Premonição','Future Sight'],
  ['Pulso de Água','Pulso d’Água','Water Pulse'],
  ['Pulso de Dragão','Dragon Pulse'],
  ['Raiva do Dragão','Dragon Rage'],
  ['Raio Solar','Solar Beam'],
  ['Recuperar','Recover'],
  ['Rock Slide','Deslizamento','Deslizamento de Pedra'],
  ['Rock Throw','Arremesso de Pedra'],
  ['Sombra Noturna','Night Shade'],
  ['Sopro do Dragão','Dragon Breath'],
  ['Tapa de Lama','Mud-Slap'],
  ['Thunderbolt','Raio'], // preserves the Thunderbolt animation
  ['Tri Attack','Tri Ataque'], // protected/approved original effect
  ['Trovão','Thunder'],
  ['Transformação','Transform','Transformar'],
  // Spellings which show up multiple times inside PT-only learnsets.
  ['Pulso de Água','Pulso d’Água'],
  ['Jato de Água','Jato d’Água'],
  ['Encantar','Encanto','Charm'],
  ['Pó do Sono','Pó de Sono']
 ];
 const alias=new Map(), canonicalNorm=new Map();
 for(const g of groups){
  const canon=g[0],canonical=normalize(canon);
  if(!canonical)throw Error('Invalid canonical move');
  for(const name of g){
   const n=normalize(name);
   if(alias.has(n)&&alias.get(n)!==canonical)
    throw Error('Conflicting move aliases: '+name);
   alias.set(n,canonical);
  }
  if(!canonicalNorm.has(canonical))canonicalNorm.set(canonical,canon);
 }
 const frozen=Object.freeze(groups.map(g=>Object.freeze([...g])));
 const canonicalOf=name=>{
  const n=normalize(name);
  return alias.get(n)||n;
 };
 const former=v32Catalogue;
 const formerlyDefault=v32DefaultSlots;
 let changes=0,slotMigrations=0;
 const counters={calls:0,removed:0,migrations:0,errors:0};
 function cleanup(mon,pool){
  if(!Array.isArray(pool))return pool;
  const byGroup=new Map();
  for(const entry of pool){
   if(!entry?.move?.name)continue;
   const type=String(entry.move.type||'normal');
   // Physical and status attacks named alike can still be different;
   // only different LANGUAGE variants within the SAME type are grouped.
   const unique=canonicalOf(entry.move.name)+'|'+type;
   if(!byGroup.has(unique))byGroup.set(unique,[]);
   byGroup.get(unique).push(entry);
  }
  const kept=new Map(),keyAlias=new Map();
  for(const list of byGroup.values()){
   if(list.length===1){kept.set(list[0].key,list[0]);continue;}
   const wanted=canonicalNorm.get(canonicalOf(list[0].move.name));
   let winner=list.find(x=>normalize(x.move.name)===normalize(wanted));
   if(!winner)winner=list.find(x=>x.available)||list[0];
   // Correctly keep a translation that was ALREADY unlocked, even if the
   // canonical translation by itself was a level/TM-locked entry.
   const hadUnlocked=list.some(x=>x.available);
   const earlier=Math.min(...list.map(x=>Math.max(1,Number(x.level)||1)));
   const copied={...winner,move:{...winner.move},
    level:earlier,tm:list.every(x=>x.tm),available:hadUnlocked};
   kept.set(winner.key,copied);
   for(const entry of list)if(entry.key!==winner.key)keyAlias.set(entry.key,winner.key);
  }
  counters.calls++;counters.removed+=keyAlias.size;
  // Migrate old save slots by EXACT old move key. This prevents a formerly
  // equipped translated alias silently falling back to a random move.
  if(mon&&Array.isArray(mon.v32Slots)&&mon.v32Slots.length===4){
   const previous=mon.v32Slots.slice();
   for(let i=0;i<4;i++){
    const oldKey=mon.v32Slots[i];
    let target=keyAlias.get(oldKey);
    if(!target&&!kept.has(oldKey)){
     // A saved translation might no longer be generated for THIS species,
     // while its canonical equivalent remains available in the catalogue.
     const [oldName,oldType,oldKind]=String(oldKey||'').split('|');
     const group=canonicalOf(oldName);
     const candidate=[...kept.values()].find(x=>
      canonicalOf(x.move.name)===group&&x.move.type===oldType&&
      (!oldKind||x.move.kind===oldKind))
      ||[...kept.values()].find(x=>
      canonicalOf(x.move.name)===group&&x.move.type===oldType);
     target=candidate?.key;
    }
    if(target)mon.v32Slots[i]=target;
   }
   if(previous.some((key,i)=>key!==mon.v32Slots[i])){
    counters.migrations++;changes++;slotMigrations++;
    // Autosave is deferred to avoid recursion while rendering catalogue UI.
    if(typeof queueMicrotask==='function')queueMicrotask(()=>{
     try{if(typeof persist==='function')persist()}
     catch(e){counters.errors++;}
    });
   }
  }
  const result=pool.filter(x=>kept.has(x.key));
  for(let i=0;i<result.length;i++)
   result[i]=kept.get(result[i].key);
  return result;
 }
 v32Catalogue=function(mon){
  return cleanup(mon,former(mon));
 };
 // The previously saved default slots can still contain English names.
 // Resolve them to canonical catalogue keys so the loadout editor displays
 // the SAME move as the battle.
 v32DefaultSlots=function(mon){
  const defaults=formerlyDefault(mon);
  if(!mon||!Array.isArray(defaults))return defaults;
  const cat=v32Catalogue(mon);
  const keys=new Set(cat.map(x=>x.key));
  // v34's default selector used to fall back to pool[i] when a translated
  // move (Thunder, e.g.) disappeared. That could silently replace a DAMAGE
  // attack with Thunder Wave, a STATUS move. Use the ACTUAL active move first.
  const active=!Array.isArray(mon.v32Slots)&&typeof skillSet==='function'
    ?skillSet(mon):null;
  return defaults.map((key,i)=>{
   if(active?.[i]?.name){
    const move=active[i],canonical=canonicalOf(move.name);
    const preserved=cat.find(x=>canonicalOf(x.move.name)===canonical&&
       x.move.type===move.type&&
       (Number(x.move.power)>0)===(Number(move.power)>0)&&x.available);
    if(preserved)return preserved.key;
   }
   if(keys.has(key))return key;
   const parts=String(key||'').split('|');
   const target=canonicalOf(parts[0]||'');
   const match=cat.find(x=>canonicalOf(x.move.name)===target &&
      (!parts[1]||x.move.type===parts[1]));
   return match?.key||cat[i]?.key||key;
  });
 };
 function report(speciesId=150,level=100){
  if(typeof mon!=='function')return{version:'100.0',error:'Species factory unavailable'};
  const creature=mon(Number(speciesId)||150,Number(level)||100);
  const original=former(creature);
  const cleaned=v32Catalogue(creature);
  const types=new Map(),duplicates=[];
  for(const item of original){
   const k=canonicalOf(item.move?.name)+'|'+item.move?.type;
   if(!types.has(k))types.set(k,[]);
   types.get(k).push(item.move?.name);
  }
  for(const entries of types.values())if(entries.length>1)
   duplicates.push([...new Set(entries)]);
  return {version:'100.0',pokemonId:creature.id,level:creature.level,
   before:original.length,after:cleaned.length,removed:original.length-cleaned.length,
   duplicateGroups:duplicates,
   afterStillDuplicated:cleaned.some((x,i)=>cleaned.some((y,j)=>j<i&&
    canonicalOf(y.move.name)===canonicalOf(x.move.name)&&y.move.type===x.move.type)),
   migrated:slotMigrations};
 }
 window.PokemonTorreMoveDedupV100=Object.freeze({
  installed:true,version:'100.0',aliasGroups:frozen,
  canonicalOf,report,diagnostics:()=>({...counters})
 });
})();