/* Pokemon Torre V61 — all 18 types: authored game icons, power ascending.
   Read-only visual enhancement. Original move buttons keep their handlers. */
(function(){
'use strict';
const SVG={
 normal:'<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/>',
 fire:'<path d="M13 2c3 4 0 6 2 8 2-2 2-4 2-4 7 8 4 16-5 16-8 0-11-7-7-14 1 4 3 4 4 3 2-4 3-5 4-9Z"/><path d="M12 20c-3 0-4-3-1-7 2 2 4 7 1 7Z"/>',
 water:'<path d="M12 2C8 8 5 12 5 15a7 7 0 0 0 14 0c0-3-3-7-7-13Z"/><path d="M8 15c0 3 2 5 5 5"/>',
 electric:'<path d="m14 2-9 11h6l-1 9 9-12h-6l1-8Z"/>',
 grass:'<path d="M21 3C10 4 4 9 4 16c0 9 17 8 17-13Z"/><path d="M4 20c3-6 8-10 15-13"/>',
 ice:'<path d="M12 1v22M2.5 6.5l19 11M2.5 17.5l19-11M9 3l3 3 3-3M9 21l3-3 3 3M4 10l4 0-1-4M20 14l-4 0 1 4M4 14l4 0-1 4M20 10l-4 0 1-4"/>',
 fighting:'<path d="M4 13V7a2 2 0 0 1 4 0v4M8 10V5a2 2 0 0 1 4 0v5M12 10V6a2 2 0 0 1 4 0v4M16 11V9a2 2 0 0 1 4 0v5l-3 6-5 2H9a5 5 0 0 1-5-5v-4Z"/>',
 poison:'<circle cx="12" cy="12" r="2.8"/><path d="M11 5C5 1 0 8 4 14l5-2M13 5c6-4 11 3 7 9l-5-2M7 16l-2 4c4 4 10 4 14 0l-2-4"/>',
 ground:'<path d="m2 19 6-13 4 9 4-11 6 15H2Z"/><path d="m3 22 5-2 4 1 5-2 4 2M8 6l2 6 2 3M16 4l-1 5 3 4"/>',
 flying:'<path d="M21 3C11 4 6 8 3 17l4 4c9-3 13-8 14-18Z"/><path d="M5 19 18 6M10 14l-2-5M14 10l4 2"/>',
 psychic:'<path d="M2 12C8 2 16 2 22 12c-6 10-14 10-20 0Z"/><circle cx="12" cy="12" r="5"/><path d="M14 10a3 3 0 1 0-2 5"/>',
 bug:'<path d="M12 5c4 0 6 4 6 8s-2 9-6 9-6-5-6-9 2-8 6-8Z"/><path d="M9 5 7 2M15 5l2-3M6 11H2M6 16l-3 3M18 11h4M18 16l3 3M12 5v16"/>',
 rock:'<path d="m5 22-3-10 7-9 9 2 4 9-8 8H5Z"/><path d="m9 3 2 10-6 9M11 13l11 1M11 13l7-8"/>',
 ghost:'<path d="M4 20v-9a8 8 0 0 1 16 0v9l-4-3-4 3-4-3-4 3Z"/><path d="M8 12h1M15 12h1M9 16c2 1 4 1 6 0"/>',
 dragon:'<path d="m19 4-4 3-6-2 2 5-5 3-3 6 9-1c5-1 8-5 7-10l2-4h-2Z"/><path d="m13 11-2 4M17 9h.1"/>',
 dark:'<path d="M17 2C7 4 3 11 6 17c3 6 11 7 16 3-10 0-15-8-5-18Z"/><path d="m4 4 1 2M3 9l-1 1M10 2 9 4"/>',
 steel:'<path d="M9 2h6l1 3 3 1 3-1 2 6-3 2v3l2 2-4 5-3-2h-3l-2 2-6-3 1-3-2-3-3-1 1-6 3-1 1-3 3-1Z"/><circle cx="12" cy="12" r="4"/>',
 fairy:'<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z"/><path d="M20 2v5M17.5 4.5h5M4 18v4M2 20h4"/>'
};
const TYPES=[
 ['normal','Normal','#bfc4d1'],['fire','Fogo','#ff9752'],
 ['water','Água','#6fcbff'],['electric','Elétrico','#ffdf64'],
 ['grass','Planta','#84d47c'],['ice','Gelo','#91e7fc'],
 ['fighting','Lutador','#ef9b81'],['poison','Veneno','#c894eb'],
 ['ground','Terra','#d8bb80'],['flying','Voador','#acd6fa'],
 ['psychic','Psíquico','#e492d5'],['bug','Inseto','#a8c86f'],
 ['rock','Pedra','#c7b4a0'],['ghost','Fantasma','#bea7ff'],
 ['dragon','Dragão','#909bf8'],['dark','Sombrio','#9d93ac'],
 ['steel','Aço','#b7d1dd'],['fairy','Fada','#edaddf']
];
const synonyms={normal:['normal'],fire:['fogo','fire'],water:['agua','water'],
 electric:['eletrico','electric'],grass:['planta','grama','grass'],ice:['gelo','ice'],
 fighting:['lutador','luta','fighting'],poison:['veneno','poison'],
 ground:['terra','terrestre','ground'],flying:['voador','flying'],psychic:['psiquico','psychic'],
 bug:['inseto','bug'],rock:['pedra','rock'],ghost:['fantasma','ghost'],
 dragon:['dragao','dragon'],dark:['sombrio','noturno','dark'],steel:['aco','steel','metal'],
 fairy:['fada','fairy']};
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const lookup=new Map(),info=new Map();
for(const [k,name,color] of TYPES){
 info.set(k,{name,color});
 for(const alias of synonyms[k])lookup.set(alias,k);
}
function typeIcon(type){
 const n=info.get(type)||info.get('normal');
 const span=document.createElement('span');
 span.className='pt61Icon';span.dataset.type=type;
 span.setAttribute('aria-hidden','true');span.style.color=n.color;
 span.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">'+(SVG[type]||SVG.normal)+'</svg>';
 return span;
}
const css=document.createElement('style');css.id='pt61MoveCss';
css.textContent=[
 '.pt61Icon{display:inline-flex;justify-content:center;align-items:center;width:26px;height:26px;flex:0 0 26px;box-sizing:border-box;line-height:0;vertical-align:middle}',
 '.pt61Icon svg{width:23px;height:23px;display:block;margin:auto;flex:none;overflow:visible}',
 '.v331MoveList .v331Choice{align-items:center!important;min-height:61px!important;padding:10px 11px!important;gap:8px!important;border-radius:11px!important;background:linear-gradient(160deg,#142838,#102333)!important}',
 '.v331MoveList .v331Choice.equipped{border-color:#d6c079!important}',
 '.v331MoveList .v331Choice>span:first-child{min-width:0;flex:1}',
 '.v331MoveList .v331Choice b{display:flex!important;align-items:center;gap:9px;font:650 14px/1.25 Inter,"Segoe UI",Arial,sans-serif!important;color:#eff8ff;letter-spacing:.02px}',
 '.v331MoveList .v331Choice b .pt61Label{overflow-wrap:anywhere;min-width:0}',
 '.v331MoveList .v331Choice small{font:500 10px/1.45 Inter,"Segoe UI",Arial,sans-serif!important;color:#b5c9d7!important;margin-left:35px!important}',
 '.v331MoveList .v331Choice .pillSmall{flex-shrink:0;min-width:54px!important}',
 '.v331Slots .v331Slot b{display:flex!important;align-items:center;gap:5px!important;font:600 11px/1.3 Inter,"Segoe UI",Arial,sans-serif!important}',
 '.v331Slots .v331Slot .pt61Icon{width:20px;height:20px;flex-basis:20px}',
 '.v331Slots .v331Slot .pt61Icon svg{width:18px;height:18px;margin:auto}',
 '.v331MoveList .v331Choice b>.pt61Icon{display:flex;justify-content:center;align-items:center;line-height:0;align-self:center;margin:0;transform:none}',
 '.skillV8 .skillIcon{display:flex!important;align-items:center!important;justify-content:center!important;box-sizing:border-box;line-height:1!important;padding:0!important;text-align:center!important}',
 '.skillV8 .skillIcon .pt61Icon{display:flex!important;justify-content:center!important;align-items:center!important;width:32px;height:32px;flex:0 0 32px;margin:0!important;transform:none!important}',
 '.skillV8 .skillIcon .pt61Icon svg{width:26px;height:26px;margin:auto!important}',
 '@media(max-width:480px){.v331MoveList .v331Choice b{font-size:13px!important}.v331MoveList .v331Choice{min-height:56px!important;padding:8px!important}}'
].join('');
document.head.appendChild(css);
const numeric=(s,regex)=>{const m=String(s||'').match(regex);return m?Number(m[1].replace(',','.')):0};
const getPower=s=>numeric(s,/(-?\d+(?:[.,]\d+)?)\s*for[cç]a/i);
const getCost=s=>numeric(s,/(\d+(?:[.,]\d+)?)\s*energia/i);
const getCd=s=>numeric(s,/(\d+(?:[.,]\d+)?)\s*s\b/i);
const strip=s=>String(s||'').replace(/^[^\p{L}\p{N}]+/u,'').trim();

function paintCombatSkills(){
 // The battle hotkey slots MUST preserve their original order; only swap art.
 for(const button of document.querySelectorAll('.skillV8[data-skill]')){
  const target=button.querySelector('.skillIcon');
  if(!target||target.dataset.pt61Styled==='1')continue;
  const meta=button.querySelector('.skillName small');
  const typeName=(meta?.textContent||'').split('·')[0].trim();
  const type=lookup.get(norm(typeName))||'normal';
  target.dataset.pt61Styled='1';
  target.replaceChildren(typeIcon(type));
  // Keep category text but drop system emoji from the battle hotbar.
  if(meta){
   const parts=meta.textContent.split('·');
   if(parts.length>1){
    const category=strip(parts.slice(1).join('·'));
    meta.textContent=typeName+' · '+category;
   }
  }
 }
}
function mount(){
 paintCombatSkills();
 const modal=document.querySelector('#modal'),list=modal?.querySelector('.v331MoveList');
 if(!list)return;
 const rows=[...list.querySelectorAll(':scope > .v331Choice')];
 if(!rows.length)return;
 const named=new Map();
 const records=rows.map((row,index)=>{
  const b=row.querySelector('b'),small=row.querySelector('small');
  if(!b||!small)return null;
  const smallText=small.textContent||'';
  const type=lookup.get(norm(smallText.split('·')[0]))||'normal';
  const label=b.querySelector('.pt61Label')?.textContent||strip(b.textContent);
  if(!b.dataset.pt61Styled){
   b.dataset.pt61Styled='1';b.textContent='';
   const caption=document.createElement('span');caption.className='pt61Label';caption.textContent=label;
   b.append(typeIcon(type),caption);
  }
  named.set(norm(label),type);
  return {row,index,power:getPower(smallText),cost:getCost(smallText),cd:getCd(smallText),label};
 }).filter(Boolean);
 for(const b of modal.querySelectorAll('.v331Slots .v331Slot b')){
  if(b.dataset.pt61Styled)continue;
  const txt=b.textContent||'',m=txt.match(/^(\d+)\.\s*(.+)$/);
  const number=m?m[1]+'. ':'';
  const label=strip(m?m[2]:txt),type=named.get(norm(label))||'normal';
  b.dataset.pt61Styled='1';b.textContent='';
  if(number)b.append(document.createTextNode(number));
  b.append(typeIcon(type),document.createTextNode(label));
 }
 const select=modal.querySelector('.ptTypeSelect');
 if(select){
  for(const option of select.options){
   const data=info.get(option.value);
   const expected=data?data.name:'Todos os tipos';
   if(option.textContent!==expected)option.textContent=expected;
  }
  const bar=modal.querySelector('.ptTypeBar');
  if(bar){
   let iconHolder=bar.querySelector('.pt61IconHolder');
   if(!iconHolder){iconHolder=document.createElement('span');iconHolder.className='pt61IconHolder';
     if(select.parentNode===bar)bar.insertBefore(iconHolder,select);}
   const desired=select.value==='all'?'normal':select.value;
   if(iconHolder.firstElementChild?.dataset.type!==desired)iconHolder.replaceChildren(typeIcon(desired));
  }
 }
 // The older editor sorts strongest-first; resort ascending without changing
 // data-v331-pick ids, saved equipment slots, or onclick handlers.
 const sorted=records.slice().sort((a,b)=>a.power-b.power||a.cost-b.cost||a.cd-b.cd||a.label.localeCompare(b.label,'pt-BR')||a.index-b.index);
 if(sorted.some((rec,i)=>rec.row!==rows[i])){
  const fragment=document.createDocumentFragment();
  for(const rec of sorted)fragment.appendChild(rec.row);
  list.appendChild(fragment);
 }
 list.setAttribute('data-v346-sorted','1');
 list.dataset.pt61Ascending='1';
}
// V61.1: no full-subtree MutationObserver during a real-time battle.
// The old observer fired for combat labels/HP and ran an entire editor scan
// every frame on phones, causing severe stutter and battery drain.
let queued=false,busy=false,runs=0,watchingModal=null,watchingCombat=null;
const modalObserver=new MutationObserver(schedule);
const battleObserver=new MutationObserver(schedule);
const bodyObserver=new MutationObserver(schedule);
function watchStructuralChanges(){
 const modal=document.querySelector('#modal');
 if(watchingModal!==modal){
  modalObserver.disconnect();watchingModal=modal;
  if(modal)modalObserver.observe(modal,{childList:true});
 }
 const combat=modal?.querySelector('#combatContainer');
 if(watchingCombat!==combat){
  battleObserver.disconnect();watchingCombat=combat;
  if(combat)battleObserver.observe(combat,{childList:true});
 }
}
function schedule(){
 if(queued||busy)return;
 queued=true;
 requestAnimationFrame(()=>{
  queued=false;
  if(busy)return;
  busy=true;
  try{watchStructuralChanges();mount();runs++;}finally{busy=false;}
 });
}
// Watch only top-level structural changes, not every animation update.
bodyObserver.observe(document.body,{childList:true});
watchStructuralChanges();schedule();
window.PokemonTorreMoveUIV61=()=>({
 version:'61.1',types:TYPES.length,
 modifiedRows:document.querySelectorAll('.v331MoveList .pt61Icon').length,
 ascending:!!document.querySelector('.v331MoveList[data-pt61-ascending="1"]'),
 runs
});
})();
