/* Pokemon Torre V46: move typing is authoritative by move NAME, not owner type.
 * The old all-species test catalog mixed wrong types and duplicated entries.
 * Preserve power, cooldowns, learned restrictions and ALL accepted VFX.
 */
(function(){
 'use strict';
 const moveDex=Object.freeze({"absorver":"grass","acid":"poison","acido":"poison","aerocorte":"flying","agility":"psychic","agulhas":"bug","agulhasvelozes":"bug","airslash":"flying","amnesia":"psychic","ancientpower":"rock","aquajet":"water","arranhao":"bug","arremessodepedra":"rock","assombracao":"ghost","ataquedeinseto":"bug","ataqueduplo":"normal","ataqueveloz":"normal","aurasphere":"fighting","avalanche":"rock","barreirapsiquica":"psychic","barrier":"psychic","bicada":"flying","bicobroca":"flying","bind":"rock","blizzard":"ice","bolhas":"water","bombadesementes":"grass","brasa":"fire","brasaviva":"fire","brilhomagico":"fairy","bubblebeam":"water","bugbite":"bug","bugbuzz":"bug","bulkup":"fighting","cabecada":"normal","cacodegelo":"ice","calmmind":"psychic","campoeletrico":"electric","campogelado":"ice","canhaodeferro":"steel","canhaometalico":"steel","canto":"normal","cargarelampago":"electric","cascalho":"rock","casulo":"bug","caudadeagua":"water","chama":"fire","chamaardente":"fire","chamacircular":"fire","chamasdemoltres":"fire","charge":"electric","charm":"fairy","chicotedevinha":"grass","chicoteduplo":"grass","chicotesemarea":"grass","choque":"electric","choquedotrovao":"electric","choquemagnetico":"electric","choquemetalico":"steel","chute":"fighting","chutealto":"fighting","chuvademeteoritos":"rock","confuseray":"ghost","corte":"bug","cortedeaco":"steel","cortex":"bug","crunch":"dark","dazzlinggleam":"fairy","defensecurl":"normal","descarga":"electric","descargaeletrica":"electric","deslizamento":"rock","dig":"ground","discharge":"electric","doubleteam":"normal","dragonbreath":"dragon","dragonclaw":"dragon","dragondance":"dragon","dragonpulse":"dragon","dragonrage":"dragon","drainingkiss":"fairy","dreameater":"ghost","drillpeck":"electric","earthpower":"ground","ember":"fire","encantar":"normal","encanto":"fairy","endurecer":"normal","enxame":"bug","esferaescura":"ghost","esporos":"grass","estilhacosdegelo":"ice","explosaodeestrelas":"fairy","explosaomagmatica":"fire","explosion":"rock","extremespeed":"fire","fagulha":"electric","fairywind":"fairy","faisca":"electric","faiscadejolteon":"electric","faiscadopikachu":"electric","fendarasa":"ground","ferraoduplo":"bug","ferraovenenoso":"poison","ferroada":"bug","firespin":"fire","flashcannon":"steel","focusenergy":"normal","fogofatuo":"fire","folhascortantes":"grass","fragmentosdegelo":"ice","furycutter":"bug","futuresight":"psychic","garradeareia":"ground","garradefogo":"fire","garrademetal":"steel","garradraconica":"dragon","garrasombria":"ghost","geadapersistente":"ice","girodefogo":"fire","golpeconcentrado":"fighting","golpedeaura":"fighting","golpedecorpo":"normal","golpedekarate":"fighting","golpedeveneno":"poison","golpeduplo":"normal","golpefurioso":"fighting","golperapido":"normal","grandefissura":"ground","growl":"normal","growth":"grass","harden":"normal","haze":"ice","headbutt":"normal","hex":"ghost","hiperpresa":"normal","hiperraiodragao":"dragon","hypnosis":"psychic","iceshard":"ice","impactoestelar":"normal","impactofeerico":"fairy","impactoglacial":"ice","impactopoderoso":"normal","impactosupersonico":"normal","investida":"normal","investidadragao":"dragon","investidaforte":"fighting","irondefense":"steel","irontail":"steel","jatodagua":"water","jatodeagua":"water","karatechop":"fighting","lamacorrosiva":"poison","lambida":"ghost","laminademetal":"steel","laminaprateada":"steel","laminascortantes":"bug","lancadeareia":"ground","lancamentodeareia":"ground","leechlife":"bug","leechseed":"grass","leer":"normal","lick":"ghost","lightscreen":"psychic","lodotoxico":"poison","luzdalua":"fairy","machpunch":"fighting","maldicaoespectral":"ghost","martelada":"water","martelorochoso":"rock","megadreno":"grass","megahorn":"bug","megasoco":"normal","mergulho":"water","metalclaw":"steel","metronome":"normal","minimize":"poison","moonlight":"fairy","mudshot":"ground","mudslap":"ground","nevasca":"ice","nevascaemarea":"ice","nevoatoxica":"poison","nevoavenenosa":"poison","nightshade":"ghost","ondadebolhas":"water","ondadechoque":"fighting","ondadraconica":"dragon","ondaeletrica":"electric","ondagigante":"water","ondamental":"psychic","ondapsiquica":"psychic","orbemistico":"psychic","osso":"ground","ossobumerangue":"ground","outrage":"dragon","parededeaco":"steel","pedra":"rock","pedraafiada":"rock","pedrada":"rock","pedrasemarea":"rock","petalas":"grass","petalascortantes":"grass","picada":"bug","picadatoxica":"poison","picadavenenosa":"poison","pinmissile":"bug","pique":"flying","pistoladagua":"water","podegelo":"ice","poderdalua":"fairy","poderterrestre":"ground","podosono":"grass","poisonjab":"poison","poisonpowder":"poison","pomistico":"bug","premonicao":"psychic","protect":"normal","psicocorte":"psychic","pulsacaomental":"psychic","pulsodagua":"water","pulsodeagua":"water","pulsodedragao":"dragon","pulsofantasma":"ghost","punhodefogo":"fire","quickattack":"electric","raio":"electric","raiocongelante":"ice","raioencantado":"fairy","raivadodragao":"dragon","raizesviolentas":"grass","rajada":"flying","rajadaacida":"poison","rajadaflamejante":"fire","rajadaignea":"fire","rapidspin":"water","rastrodefogo":"fire","recover":"normal","recuperar":"normal","reflect":"psychic","rest":"psychic","roar":"normal","rochedo":"rock","rockblast":"rock","rockslide":"rock","rockthrow":"rock","rocktomb":"rock","rodadefogo":"fire","roost":"flying","safeguard":"normal","salpicar":"water","sandattack":"ground","sandstorm":"rock","scaryface":"normal","screech":"normal","skullbash":"water","slam":"bug","sleeppowder":"grass","smokescreen":"normal","soco":"fighting","socodepedra":"rock","socodeterra":"ground","socodinamico":"fighting","socorapido":"fighting","socosismico":"fighting","sombra":"ghost","sombranoturna":"ghost","sombraviva":"ghost","soprocongelante":"ice","soprododragao":"dragon","stoneedge":"rock","stringshot":"bug","stunspore":"grass","submission":"fighting","sunnyday":"fire","supersonic":"normal","swift":"normal","swordsdance":"normal","synthesis":"grass","tailwhip":"normal","tapadelama":"ground","teiacortante":"bug","tempestadedefolhas":"grass","tempestadedeinsetos":"bug","tempestadederaios":"electric","tempestadedraconica":"dragon","tempestademetalica":"steel","tempestadepsiquica":"psychic","thrash":"poison","thunder":"electric","thunderbolt":"electric","thunderwave":"electric","toxic":"poison","toxinapesada":"poison","transform":"psychic","transformacao":"normal","transformar":"normal","trevaseternas":"ghost","trovao":"electric","trovaoteleguiado":"electric","vendaval":"flying","venoshock":"poison","ventocortante":"flying","ventodefada":"fairy","ventogelado":"ice","vinewhip":"grass","volttackle":"electric","vozencantadora":"normal","willowisp":"fire","withdraw":"water","xscissor":"bug"});
 const overrides=Object.freeze({"drillpeck":["flying","physical"],"quickattack":["normal","physical"],"skullbash":["normal","physical"],"arranhao":["normal","physical"],"corte":["normal","physical"],"slam":["normal","physical"],"thrash":["normal","physical"],"bind":["normal","physical"],"explosion":["normal","physical"],"rapidspin":["normal","physical"],"extremespeed":["normal","physical"],"minimize":["normal","status"],"dreameater":["psychic","special"],"vozencantadora":["fairy","special"],"avalanche":["ice","physical"],"laminaprateada":["bug","special"],"transform":["normal","status"],"encantar":["fairy","status"],"ondadechoque":["electric","special"],"faisca":["electric","physical"],"aquajet":["water","physical"],"caudadeagua":["water","physical"],"agility":["psychic","status"],"rest":["psychic","status"],"hydropump":["water","special"],"amnesia":["psychic","status"],"pulsodagua":["water","special"],"pulsodeagua":["water","special"],"waterpulse":["water","special"],"cargarelampago":["electric","physical"],"volttackle":["electric","physical"],"faiscadopikachu":["electric","physical"],"faiscadejolteon":["electric","physical"],"trovao":["electric","special"],"tempestadederaios":["electric","special"],"discharge":["electric","special"],"raiodotrovao":["electric","special"],"watergun":["water","special"],"jatodagua":["water","special"],"raiosolar":["grass","special"],"punhodefogo":["fire","physical"],"garradefogo":["fire","physical"],"punhodegelo":["ice","physical"],"pistoladagua":["water","special"],"jatodeagua":["water","special"],"girodefogo":["fire","special"],"willowisp":["fire","status"],"sunnyday":["fire","status"],"socorapido":["fighting","physical"]});
 const normalize=name=>String(name||'').normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
 const stats={corrected:0,duplicates:0,migratedSlots:0,known:0,unknown:0,samples:[]};
 const canonical=function(move){
  if(!move||!move.name)return move;
  const key=normalize(move.name),custom=overrides[key];
  const properType=custom?.[0]||moveDex[key]||null;
  const properCategory=custom?.[1]||null;
  if(!properType){stats.unknown++;return {...move};}
  stats.known++;
  const fixed={...move,type:properType};
  if(properCategory)fixed.cat=properCategory;
  if(fixed.type!==move.type||fixed.cat!==move.cat){
   stats.corrected++;
   if(stats.samples.length<24)stats.samples.push({
    name:move.name,from:move.type,to:fixed.type,
    categoryFrom:move.cat||null,categoryTo:fixed.cat||null
   });
  }
  return fixed;
 };
 const beforeCatalogue=v32Catalogue;
 v32Catalogue=function(mon){
  const original=beforeCatalogue(mon);
  if(!Array.isArray(original)||!original.length)return original;
  const tester=Number(mon?.id)===150&&mon?.v3566MewtwoTest===true;
  const names=new Map(),rows=[];
  for(const entry of original){
   if(!entry?.move?.name)continue;
   const move=canonical(entry.move);
   const key=v32MoveKey(move),name=normalize(move.name);
   const item={...entry,move,key};
   // The sandbox of 415 moves used to include the SAME move with several
   // different types. Present just one actual move name in that test catalog.
   if(tester&&names.has(name)){
    const previous=names.get(name);
    if(!previous.available&&item.available)Object.assign(previous,item);
    stats.duplicates++;
    continue;
   }
   names.set(name,item);
   rows.push(item);
  }
  if(tester)rows.sort((a,b)=>a.move.type.localeCompare(b.move.type)||
   a.move.name.localeCompare(b.move.name,'pt-BR'));
  // Keep equipment selections compatible with saved old "name|WRONGTYPE|kind"
  // keys; no reset of the user's team, energy, levels or active battle.
  if(mon&&Array.isArray(mon.v32Slots)){
   const remapped=mon.v32Slots.map(old=>{
    if(rows.some(x=>x.key===old))return old;
    const oldName=normalize(String(old).split('|')[0]);
    const candidate=names.get(oldName);
    return candidate?.key||old;
   });
   if(remapped.some((k,i)=>k!==mon.v32Slots[i])){
    stats.migratedSlots+=remapped.filter((k,i)=>k!==mon.v32Slots[i]).length;
    mon.v32Slots=remapped;
    if(typeof persist==='function')persist();
   }
  }
  return rows;
 };
 const beforeSkillSet=skillSet;
 skillSet=function(mon){
  const selected=beforeSkillSet(mon);
  return Array.isArray(selected)?selected.map(canonical):selected;
 };
 window.PokemonTorreMoveTypesV46=()=>({
  version:'46.0',referenceNames:Object.keys(moveDex).length,
  curatedCorrections:Object.keys(overrides).length,...stats,
  lookup:name=>{
   const key=normalize(name),change=overrides[key];
   return change?{type:change[0],category:change[1]}:
    moveDex[key]?{type:moveDex[key]}:null;
  },
  preview:name=>({type:canonical({name,type:'electric',cat:'special'}).type}),
  catalogue:mon=>v32Catalogue(mon)
 });
})();