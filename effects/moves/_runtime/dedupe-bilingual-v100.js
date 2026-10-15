/* Pokemon Torre V100 — bilingual catalogue deduplication, non-destructive.
 * Keep move implementations, sprites, stats, saves and legacy slot keys.
 * Only the chooser's list is condensed; combat uses the ORIGINAL catalogue.
 */
(()=>{
 'use strict';
 if(typeof v32Catalogue!=='function'||typeof skillSet!=='function')return;
 if(window.PokemonTorreMoveCatalogV100?.installed)return;
 const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
   .toLowerCase().replace(/[^a-z0-9]/g,'');
 // Verified translations of the SAME Pokémon movement, not merely moves
 // sharing a type, color or visual category. Keep one menu entry, not one FX.
 // The preferred entry is Portuguese when no existing saved slot uses another.
 const PAIRS=Object.freeze([
  ['Acid','Ácido'],
  ['Air Slash','Aerocorte'],
  ['Aqua Tail','Cauda de Água'],
  ['Aurora Beam','Raio Aurora'],
  ['Blizzard','Nevasca'],
  ['Confusion','Confusão'],
  ['Dark Pulse','Pulso Sombrio'],
  ['Dragon Claw','Garra Dracônica'],
  ['Dragon Pulse','Pulso de Dragão'],
  ['Fire Blast','Explosão de Fogo'],
  ['Flamethrower','Lança-Chamas'],
  ['Hydro Pump','Hidro Bomba'],
  ['Hyper Beam','Hiper Raio'],
  ['Ice Beam','Raio de Gelo'],
  ['Ice Shard','Caco de Gelo'],
  ['Icy Wind','Vento Gelado'],
  ['Leech Seed','Semente Sanguessuga'],
  ['Leaf Storm','Tempestade de Folhas'],
  ['Psychic','Psíquico'],
  ['Quick Attack','Ataque Rápido'],
  ['Razor Leaf','Folha Navalha'],
  ['Rock Slide','Deslizamento'],
  ['Rock Throw','Arremesso de Pedra'],
  ['Sand Attack','Lançamento de Areia'],
  ['Shadow Ball','Bola Sombria'],
  ['Shadow Claw','Garra Sombria'],
  ['Sludge Bomb','Bomba de Lodo'],
  ['Solar Beam','Raio Solar'],
  ['Thunder','Trovão'],
  ['Thunderbolt','Raio'],
  ['Vine Whip','Chicote de Vinha'],
  ['Water Gun','Pistola d’Água']
 ]);
 const canonical=new Map();
 const displayName=new Map();
 for(const [en,pt] of PAIRS){
  const key=normalize(pt);canonical.set(normalize(en),key);
  canonical.set(normalize(pt),key);displayName.set(key,pt);
 }
 const before=v32Catalogue,originalSkillSet=skillSet;
 let combatDepth=0;
 const diagnostics={catalogCalls:0,removedChoices:0,groupsMatched:0,
  slotReads:0,lastRemoved:[],lastPokemonId:null};
 const semantic=m=>canonical.get(normalize(m?.name))||normalize(m?.name);
 const group=e=>String(e?.move?.type||'normal')+'|'+semantic(e?.move);
 const fullCatalogue=m=>before(m);
 function selectRepresentative(entries,monster){
  if(entries.length===1)return entries[0];
  // Preserve an equipped alias as the visible representative rather than
  // silently changing the saved slot or its approved visual implementation.
  const slots=Array.isArray(monster?.v32Slots)?monster.v32Slots:[];
  const equipped=entries.find(e=>slots.includes(e.key));
  if(equipped)return equipped;
  const available=entries.filter(e=>e.available);
  const choices=available.length?available:entries;
  return choices.find(e=>normalize(e.move.name)===semantic(e.move))||
    choices[0];
 }
 function condensed(monster){
  const all=fullCatalogue(monster);
  if(!Array.isArray(all)||!all.length)return all;
  const bucket=new Map(),order=[];
  for(const entry of all){
   if(!entry?.move?.name){order.push({unmatched:entry});continue;}
   const id=group(entry);
   if(!bucket.has(id)){bucket.set(id,[]);order.push({id});}
   bucket.get(id).push(entry);
  }
  const out=[];
  const hidden=[];
  for(const item of order){
   if(item.unmatched){out.push(item.unmatched);continue;}
   const arr=bucket.get(item.id);
   // Never merge different types, or different unrecognized names that
   // merely look similar; only exact duplicate names or verified pairs.
   const chosen=selectRepresentative(arr,monster);
   out.push(chosen);
   if(arr.length>1) {
    diagnostics.groupsMatched++;
    diagnostics.removedChoices+=arr.length-1;
    hidden.push(...arr.filter(x=>x!==chosen).map(x=>x.move.name));
   }
  }
  diagnostics.lastRemoved=hidden;
  diagnostics.lastPokemonId=monster?.id??null;
  return out;
 }
 v32Catalogue=function(m){
  diagnostics.catalogCalls++;
  // Gameplay/slot selection uses the full original list, protecting saved
  // keys and every previously approved sprite, cooldown and damage value.
  return combatDepth?fullCatalogue(m):condensed(m);
 };
 skillSet=function(m){
  combatDepth++;diagnostics.slotReads++;
  try{return originalSkillSet.apply(this,arguments);}
  finally{combatDepth--;}
 };
 const findSaved=(monster,key)=>{
  if(!key)return null;
  // When two aliases were already equipped, the chooser displays both
  // true equipped names, even though the alternatives list has one entry.
  const all=fullCatalogue(monster);
  return all?.find(x=>x.key===key)||null;
 };
 const isEquivalent=(a,b)=>!!a&&!!b&&
  a.move?.type===b.move?.type&&semantic(a.move)===semantic(b.move);
 window.PokemonTorreMoveCatalogV100=Object.freeze({
  installed:true,version:'100.0',
  pairs:PAIRS.map(p=>p.slice()),semantic,
  findSaved,isEquivalent,
  diagnostics:()=>({...diagnostics}),
  note:'Apenas catálogo consolidado; FX e saves preservados.'
 });
})();