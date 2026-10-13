/* V46 BOOT REPAIR — injected INSIDE the original V32 catalogue closure.
 * The actual v32Catalogue and skillSet are NOT window globals. This bridge
 * deliberately captures their lexical bindings and exposes a safe installer.
 * No changes are made until the optional canonical module calls the hook.
 */
(function(){
 'use strict';
 let v46TypeHookInstalled=false;
 window.PokemonTorreInstallMoveTypesV46=function(canonical,normalize,stats){
  if(v46TypeHookInstalled)return true;
  if(typeof v32Catalogue!=='function'||typeof skillSet!=='function'||
     typeof v32MoveKey!=='function')
   throw Error('V46: internal catalogue unavailable at install time');
  if(typeof canonical!=='function'||typeof normalize!=='function')
   throw Error('V46: canonicalizer invalid');
  const oldCatalogueV46=v32Catalogue;
  const oldSkillSetV46=skillSet;
  v32Catalogue=function(mon){
   const original=oldCatalogueV46(mon);
   if(!Array.isArray(original)||!original.length)return original;
   const tester=Number(mon?.id)===150&&mon?.v3566MewtwoTest===true;
   const names=new Map(),rows=[];
   for(const entry of original){
    if(!entry?.move?.name)continue;
    const move=canonical(entry.move),key=v32MoveKey(move),name=normalize(move.name);
    const item={...entry,move,key};
    if(tester&&names.has(name)){
     const previous=names.get(name);
     if(!previous.available&&item.available)Object.assign(previous,item);
     stats.duplicates++;
     continue;
    }
    names.set(name,item);rows.push(item);
   }
   if(tester)rows.sort((a,b)=>a.move.type.localeCompare(b.move.type)||
     a.move.name.localeCompare(b.move.name,'pt-BR'));
   // Saved old-type keys must still equip exactly the original four moves.
   if(mon&&Array.isArray(mon.v32Slots)){
    const mapped=mon.v32Slots.map(old=>{
     if(rows.some(x=>x.key===old))return old;
     const oldName=normalize(String(old).split('|')[0]);
     return names.get(oldName)?.key||old;
    });
    if(mapped.some((key,i)=>key!==mon.v32Slots[i])){
     stats.migratedSlots+=mapped.filter((key,i)=>key!==mon.v32Slots[i]).length;
     mon.v32Slots=mapped;
     if(typeof persist==='function')persist();
    }
   }
   return rows;
  };
  skillSet=function(mon){
   const selected=oldSkillSetV46(mon);
   return Array.isArray(selected)?selected.map(canonical):selected;
  };
  v46TypeHookInstalled=true;
  return true;
 };
})();
