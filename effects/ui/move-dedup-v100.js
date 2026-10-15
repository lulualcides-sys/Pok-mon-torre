/* Pokémon Torre V100: hide duplicate Portuguese/English move entries in editors.
 * Purely presentation: preserve every internal move key, stored v32Slots,
 * approved animations, move damage/cooldown, AI and battle registration.
 * The most specific names are grouped only when they mean the SAME move.
 */
(()=>{
 'use strict';
 if(window.PokemonTorreMoveDedupV100?.installed)return;
 const GROUPS=[
 ['Ácido','Acid'],
 ['Brilho Mágico','Dazzling Gleam'],
 ['Chicote de Vinha','Vine Whip'],
 ['Folha Navalha','Razor Leaf'],
 ['Aurora Beam','Raio Aurora','Raio da Aurora'],
 ['Raio de Gelo','Ice Beam','Raio Congelante'],
 ['Hidro Bomba','Hydro Pump'],
 ['Hiper Raio','Hyper Beam'],
 ['Raio Solar','Solar Beam'],
 ['Lança-Chamas','Flamethrower'],
 ['Brasa','Ember'],
 ['Giro de Fogo','Fire Spin'],
 ['Fogo-Fátuo','Will-O-Wisp'],
 ['Faísca do Pikachu'], // signature: NOT merged into ordinary Spark
 ['Descarga','Discharge','Descarga Elétrica'],
 ['Trovão','Thunder'],
 ['Raio','Thunderbolt'],
 ['Onda Elétrica','Thunder Wave'],
 ['Pistola d’Água','Pistola de Água','Water Gun','Jato d’Água','Jato de Água'],
 ['Pulso de Água','Pulso d’Água','Water Pulse'],
 ['Onda de Bolhas','Bubble Beam'],
 ['Garra de Metal','Metal Claw'],
 ['Canhão de Ferro','Flash Cannon'],
 ['Lambida','Lick'],
 ['Luz da Lua','Moonlight'],
 ['Sombra Noturna','Night Shade'],
 ['Bola Sombria','Shadow Ball'],
 ['Bomba de Lodo','Sludge Bomb'],
 ['Terremoto','Earthquake'],
 ['Poder Terrestre','Earth Power'],
 ['Cabeçada','Headbutt'],
 ['Arremesso de Pedra','Rock Throw'],
 ['Deslizamento','Rock Slide'],
 ['Pedra Afiada','Stone Edge'],
 ['Corte X','X-Scissor'],
 ['Ataque de Asa','Wing Attack'],
 ['Furacão','Hurricane'],
 ['Garra Dracônica','Dragon Claw'],
 ['Pulso de Dragão','Dragon Pulse'],
 ['Sopro do Dragão','Dragon Breath'],
 ['Raiva do Dragão','Dragon Rage'],
 ['Golpe de Karatê','Karate Chop'],
 ['Ataque Rápido','Ataque Veloz','Quick Attack'],
 ['Recuperar','Recover'],
 ['Barreira Psíquica','Barrier'],
 ['Pó do Sono','Sleep Powder'],
 ['Transformar','Transformação','Transform'],
 ['Tri Ataque','Tri Attack'],
 ['Confusão','Confusion'],
 ['Psíquico','Psychic'],
 ['Dança das Pétalas','Petal Dance'],
 ['Punho de Fogo','Fire Punch'],
 ['Soco Dinâmico','Dynamic Punch'],
 ['Bico Broca','Drill Peck'],
 ['Soco Rápido','Mach Punch'],
 ['Dança da Chuva','Rain Dance'],
 ['Dia de Sol','Sunny Day'],
 ['Golpe de Corpo','Body Slam'],
 ['Nevasca','Blizzard'],
 ['Tapa de Lama','Mud-Slap'],
 ['Lança de Areia','Lançamento de Areia','Sand Attack']
 ];
 const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]/g,'');
 const groups=new Map(),preferred=new Map();
 GROUPS.forEach((items,i)=>items.forEach((s,j)=>{
  const k=normalize(s),g='equivalent-'+i;
  if(groups.has(k)&&groups.get(k)!==g)
   throw Error('Move equivalence overlap: '+s);
  groups.set(k,g);
  if(!preferred.has(g))preferred.set(g,normalize(items[0]));
 }));
 const groupOf=s=>groups.get(normalize(s))||'unique-'+normalize(s);
 const fullName=b=>b?.querySelector('.pt61Label')?.textContent?.trim()||
  String(b?.textContent||'').replace(/^[^a-zA-ZÀ-ÿ0-9]+/u,'').trim();
 const choiceName=row=>fullName(row.querySelector('b'));
 const stats={version:'100.0',redraws:0,hidden:0,groupCount:0,
  uniqueInEditor:0,menuBefore:0,fullBefore:null,fullAfter:null,
  savedSlotsPreserved:true,approvedFxPreserved:true,lastNames:[]};
 function uniqueCount(rows){
  return new Set(rows.map(x=>groupOf(x?.move?.name||x?.name||''))).size;
 }
 function actualCatalogue(){
  try{
   if(typeof v32Catalogue!=='function'||typeof save==='undefined'||
      typeof D==='undefined')return null;
   const head=document.querySelector('#modal .sectionhead h2')?.textContent||'';
   const n=head.match(/(.+?)\s*·\s*Nv\.\s*(\d+)/);
   if(!n)return null;
   const name=n[1].replace(/^[^\p{L}\p{N}]+/u,'').trim();
   const level=Number(n[2]);
   const mons=[...(save.team||[]),...(save.box||[])];
   const m=mons.find(x=>D[x.id]?.name===name&&Number(x.level)===level)||
    mons.find(x=>D[x.id]?.name===name);
   return m?v32Catalogue(m):null;
  }catch(e){return null;}
 }
 function recount(modal,list){
  const rows=[...list.querySelectorAll(':scope > .v331Choice')];
  const shown=rows.filter(row=>!row.classList.contains('ptFilteredOut')&&
   row.style.display!=='none'&& !row.hidden).length;
  const msg=shown+' golpe(s) neste filtro';
  for(const sel of ['.ptTypeCount','#v3566FindCount']){
   const el=modal.querySelector(sel);if(el&&el.textContent!==msg)el.textContent=msg;
  }
  const catalog=actualCatalogue();
  const mode=modal.querySelector('.v331Tabs [data-v331-filter].gold')?.dataset.v331Filter||
   'available';
  // The editor can be closed over a private v32Catalogue; in that case
  // count the actual rendered catalogue. The ALL tab contains locked moves,
  // while LIBERADOS contains every available entry, not just type matches.
  const all=catalog?uniqueCount(catalog):mode==='all'?rows.length:null;
  const available=catalog?uniqueCount(catalog.filter(x=>x.available)):
   mode==='available'?rows.length:
   mode==='all'?rows.filter(x=>!x.disabled).length:null;
  if(catalog){stats.fullBefore=catalog.length;stats.fullAfter=all;}
  else if(mode==='all'){stats.fullAfter=all;}
  for(const button of modal.querySelectorAll('.v331Tabs [data-v331-filter]')){
   const kind=button.dataset.v331Filter;
   const count=kind==='all'?all:kind==='available'?available:null;
   if(count===null)continue;
   const label=kind==='all'?'Todos':'Liberados';
   const wanted=label+' ('+count+')';
   if(button.textContent!==wanted)button.textContent=wanted;
  }
 }
 function mount(){
  const modal=document.querySelector('#modal');
  const list=modal?.querySelector('.v331MoveList');
  if(!list)return;
  const rows=[...list.querySelectorAll(':scope > .v331Choice')];
  if(!rows.length)return;
  // Keep the equipped alias visible in the selection list even if its
  // language differs from the preferred one: never invalidate old save slots.
  const chosenNames=[...modal.querySelectorAll('.v331Slots .v331Slot b')]
   .map(b=>fullName(b).replace(/^\d+\.\s*/,'')); 
  const chosen=new Set(chosenNames.map(normalize));
  const byGroup=new Map();
  rows.forEach((row,i)=>{
   const name=choiceName(row),key=groupOf(name),equipped=
    row.classList.contains('equipped')||chosen.has(normalize(name));
   const rec={row,name,key,index:i,
    weight:(equipped?10000:0)+(row.disabled?0:1000)+
     (normalize(name)===preferred.get(key)?100:0)-i*.00001};
   const old=byGroup.get(key);
   if(!old||rec.weight>old.weight)byGroup.set(key,rec);
  });
  const keep=new Set([...byGroup.values()].map(x=>x.row));
  const removed=[];
  rows.forEach(row=>{
   if(!keep.has(row)){
    removed.push(choiceName(row));
    // Removing only the HTML row does NOT delete move definitions,
    // referenced sprites or saved loadouts. data-v331-pick stays intact.
    row.remove();
   }
  });
  stats.redraws++;stats.hidden+=removed.length;stats.groupCount=byGroup.size;
  stats.uniqueInEditor=keep.size;stats.menuBefore=rows.length;
  stats.lastNames=removed.slice(0,30);
  recount(modal,list);
 }
 let queued=false,activeList=null;
 const listObserver=new MutationObserver(()=>schedule());
 const modalObserver=new MutationObserver(()=>{watch();schedule();});
 const bodyObserver=new MutationObserver(()=>{watch();schedule();});
 function watch(){
  const modal=document.querySelector('#modal');
  if(modal&&modalObserver.target!==modal){
   modalObserver.disconnect();
   modalObserver.observe(modal,{childList:true});
   modalObserver.target=modal;
  }
  const list=modal?.querySelector('.v331MoveList');
  if(list!==activeList){
   listObserver.disconnect();activeList=list;
   if(list)listObserver.observe(list,{childList:true});
  }
 }
 function schedule(){
  if(queued)return;queued=true;
  requestAnimationFrame(()=>{queued=false;watch();mount();});
 }
 // Observe structural changes, not the HP/particle subtree every frame.
 bodyObserver.observe(document.body,{childList:true});
 watch();schedule();
 // Block the otherwise possible bilingual duplicate in DIFFERENT equipped
 // slots, while leaving existing saved slots and their cast routines intact.
 document.addEventListener('click',event=>{
  const button=event.target?.closest?.('#modal .v331MoveList .v331Choice');
  if(!button||button.disabled)return;
  const group=groupOf(choiceName(button));
  const slots=[...document.querySelectorAll('#modal .v331Slots .v331Slot')];
  const editing=slots.findIndex(el=>el.classList.contains('active'));
  const inAnother=slots.some((slot,i)=>i!==editing&&
   groupOf(fullName(slot.querySelector('b')).replace(/^\d+\.\s*/,''))===group);
  if(!inAnother)return;
  event.preventDefault();event.stopImmediatePropagation();
  const feedback=document.querySelector('#modal #v331Feedback');
  if(feedback)feedback.textContent='Este golpe já ocupa outra posição, mesmo que tenha outro nome.';
 },true);
 window.PokemonTorreMoveDedupV100=Object.freeze({
  installed:true,version:'100.0',groupOf,
  diagnostics:()=>({...stats,aliasGroups:GROUPS.filter(x=>x.length>1).length})
 });
})();