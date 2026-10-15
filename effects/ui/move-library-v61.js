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
 '.pt78Edited{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;min-width:18px;flex:0 0 18px;margin-left:1px;color:#83dccb;line-height:0;vertical-align:middle}',
 '.pt78Edited svg{width:18px;height:18px;display:block;fill:none}',
 '.v331Slots .pt78Edited,.skillV8 .pt78Edited{width:15px;height:15px;min-width:15px;flex-basis:15px;margin-left:2px}',
 '.v331Slots .pt78Edited svg,.skillV8 .pt78Edited svg{width:15px;height:15px}',
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
 '.ptTypeBar.pt62Enhanced .ptTypeSelect{position:absolute!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important;clip-path:inset(50%)!important;overflow:hidden!important}',
 '.ptTypeBar.pt62Enhanced{width:100%;min-width:0;align-items:center;display:flex;gap:8px!important}',
 '.ptTypeBar.pt62Enhanced .pt62TypeButton{background:#123142;border:1px solid #6b9ba4;border-radius:12px;min-width:0;min-height:45px;padding:8px 12px;flex:1;display:flex;align-items:center;gap:10px;text-align:left;color:#f0fbff;font:650 13px Inter,"Segoe UI",sans-serif;cursor:pointer;touch-action:manipulation}',
 '.pt62TypeButton .pt62TypeTitle{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
 '.pt62TypeButton .pt62Chevron{width:11px;height:11px;border-bottom:2px solid #a7dbe7;border-right:2px solid #a7dbe7;transform:rotate(45deg);margin:-4px 3px 0 0;flex-shrink:0;transition:transform .1s}',
 '.pt62TypeButton[aria-expanded="true"] .pt62Chevron{transform:rotate(225deg);margin:4px 3px 0 0}',
 '.pt62TypePopup{box-sizing:border-box;position:fixed;z-index:2147483000;padding:7px;background:#152838;border:1px solid #668b9c;border-radius:15px;box-shadow:0 15px 40px #000b;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y}',
 '.pt62TypeOption{box-sizing:border-box;display:flex;align-items:center;gap:11px;width:100%;min-height:46px;padding:8px 12px;background:transparent;border:1px solid transparent;border-radius:9px;font:550 14px/1.3 Inter,"Segoe UI",Arial,sans-serif;text-align:left;color:#f0fbff;cursor:pointer;touch-action:manipulation}',
 '.pt62TypeOption .pt62OptionName{min-width:0;flex:1}',
 '.pt62TypeOption[aria-selected="true"]{background:#25495a;border-color:#74b1bf}',
 '.pt62TypeOption:focus-visible,.pt62TypeButton:focus-visible{outline:2px solid #a6dbf3;outline-offset:2px}',
 '.pt62TypeOption .pt62Selected{color:#a4e9d5;font-size:18px;font-weight:800;min-width:17px}',
 '.pt62TypePopup .pt61Icon,.pt62TypeButton .pt61Icon{filter:none;display:inline-flex;align-items:center;justify-content:center;flex:0 0 26px;margin:0}',
 '.pt62TypePopup .pt61Icon svg,.pt62TypeButton .pt61Icon svg{width:22px;height:22px}',
 '.pt62TypePopup .pt62TypeOption:hover{background:#254455}',
 '@media(max-width:480px){.v331MoveList .v331Choice b{font-size:13px!important}.v331MoveList .v331Choice{min-height:56px!important;padding:8px!important}}'
].join('');
document.head.appendChild(css);
const numeric=(s,regex)=>{const m=String(s||'').match(regex);return m?Number(m[1].replace(',','.')):0};
const getPower=s=>numeric(s,/(-?\d+(?:[.,]\d+)?)\s*for[cç]a/i);
const getCost=s=>numeric(s,/(\d+(?:[.,]\d+)?)\s*energia/i);
const getCd=s=>numeric(s,/(\d+(?:[.,]\d+)?)\s*s\b/i);
const strip=s=>String(s||'').replace(/^[^\p{L}\p{N}]+/u,'').trim();
// V78 — modified-art identifier. This is a non-emoji, hand-drawn SVG PLUS,
// matching the 18 type icons. These names come from catalog protected effects,
// V66 authored moves and saved V60/V63/earlier move art. Not all 312 catalog
// entries are marked. The mark is visual only; it does not certify approval.
const MODIFIED_MOVES=new Set(["abaloterrestre","absorver","aerialace","airslash","aquajet","aquatail","ataquedeasa","aurasphere","aurorabeam","bolasombria","bombadelodo","bombadesementes","boneclub","bonemerang","brickbreak","bugbuzz","cachoeira","calmmind","campoeletrico","ceutempestuoso","chicotedevinha","chutebaixo","chuvadedanca","closecombat","confusao","confuseray","confusion","cortex","crosschop","dancadaspetalas","descarga","dig","discharge","doubleteam","dragonaura","dragonbreath","dragonclaw","dragondance","dragonpulse","dynamicpunch","earthpower","earthquake","esporos","explosaodefogo","explosaomagmatica","extremespeed","fairywind","faiscadopikachu","fireblast","firepunch","flamethrower","flashcannon","fly","folhanavalha","furacao","furiaancestral","furycutter","gust","hidrobomba","hiperraio","hurricane","hydropump","hyperbeam","icebeam","irontail","labaredafinal","lancachamas","leechlife","leechseed","lowkick","megadreno","mordida","nevasca","nightshade","ossobumerangue","petaldance","podosono","poisonjab","psiquico","psybeam","psychic","punhodefogo","quebratijolo","quickattack","raindance","raioaurora","raiodaaurora","raiodegelo","raiosolar","razorleaf","recover","rockslide","shadowball","skullbash","sludgebomb","sococruzado","solarbeam","soprodedragao","stoneedge","stunspore","surf","swordsdance","synthesis","telecinese","telekinesis","tempestadedefolhas","tempestadedeneve","tempestadepsiquica","terremoto","thunder","thunderwave","toxic","tremor","triataque","triattack","trovao","tsunami","volttackle","waterfall","watergun","waterpulse","willowisp","wingattack","xscissor"]);
const moveKey=value=>norm(value).replace(/[^a-z0-9]/g,'');
function editedIcon(){
 const outer=document.createElement('span');
 outer.className='pt78Edited';
 outer.setAttribute('role','img');
 outer.setAttribute('aria-label','Golpe com efeito visual alterado');
 outer.title='Efeito visual já modificado';
 outer.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5.3"/><path d="M12 7.7v8.6M7.7 12h8.6"/></svg>';
 return outer;
}
function markEdited(container,label){
 if(!container||!MODIFIED_MOVES.has(moveKey(label))||container.querySelector('.pt78Edited'))return;
 container.append(editedIcon());
}


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
  const skillLabel=button.querySelector('.skillName');
  if(skillLabel){
   const skillName=(skillLabel.childNodes[0]?.textContent||skillLabel.textContent||'').trim();
   markEdited(skillLabel,skillName);
  }
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
// V62: Android/Chrome's native <select> cannot display SVG inside an open
// option list. Keep that select as accessible state + existing filter listener,
// and add a game-drawn, scrollable popup with the original 18 type symbols.
// Popup is attached to body so the move editor's scrolling area cannot clip it.
let activeTypePopup=null;
function closeTypePopup(refocus=false){
 const open=activeTypePopup;if(!open)return;
 activeTypePopup=null;
 open.button.setAttribute('aria-expanded','false');
 open.panel.remove();
 document.removeEventListener('pointerdown',open.outside,true);
 document.removeEventListener('keydown',open.keyHandler,true);
 window.removeEventListener('resize',open.reposition);
 document.removeEventListener('scroll',open.reposition,true);
 if(refocus&&open.button.isConnected)open.button.focus();
}
function mountTypePicker(select,bar){
 if(!bar)return;
 const old=bar.querySelector('.pt61IconHolder');
 if(old)old.remove();
 let button=bar.querySelector('.pt62TypeButton');
 if(!button){
  button=document.createElement('button');
  button.type='button';
  button.className='pt62TypeButton';
  button.setAttribute('aria-label','Filtrar golpes por tipo de Pokémon');
  button.setAttribute('aria-haspopup','listbox');
  button.setAttribute('aria-expanded','false');
  const iconSlot=document.createElement('span');iconSlot.className='pt62IconSlot';
  const caption=document.createElement('span');caption.className='pt62TypeTitle';
  const caret=document.createElement('span');caret.className='pt62Chevron';
  caret.setAttribute('aria-hidden','true');
  button.append(iconSlot,caption,caret);
  bar.append(button);
  bar.classList.add('pt62Enhanced');
  // The visible label must open our SVG picker too; linking it to the
  // visually-hidden native select would reopen Android's plain options.
  const label=bar.querySelector('label');
  if(label){
   label.removeAttribute('for');
   label.style.cursor='pointer';
   label.addEventListener('click',()=>button.click());
  }
  // Unchanged native select listener still applies filter, search, and count.
  button.addEventListener('click',()=>openTypePopup(button,select));
  button.addEventListener('keydown',event=>{
   if(event.key==='ArrowDown'||event.key===' '){
    event.preventDefault();
    if(!activeTypePopup||activeTypePopup.button!==button)openTypePopup(button,select,true);
   }
  });
  select.addEventListener('change',()=>syncTypeButton(select,button));
 }
 syncTypeButton(select,button);
}
function syncTypeButton(select,button){
 const id=info.has(select.value)?select.value:'all';
 const title=info.get(id)?.name||'Todos os tipos';
 const iconSlot=button.querySelector('.pt62IconSlot');
 if(iconSlot?.firstElementChild?.dataset.type!==(id==='all'?'normal':id))
  iconSlot?.replaceChildren(typeIcon(id==='all'?'normal':id));
 const caption=button.querySelector('.pt62TypeTitle');
 if(caption&&caption.textContent!==title)caption.textContent=title;
}
function openTypePopup(button,select,focusSelected=false){
 if(activeTypePopup?.button===button){closeTypePopup();return;}
 closeTypePopup();
 const panel=document.createElement('div');panel.className='pt62TypePopup';
 panel.setAttribute('role','listbox');
 panel.setAttribute('aria-label','Escolher tipo de golpe');
 const choices=[['all','Todos os tipos'],...TYPES.map(([id,name])=>[id,name])];
 for(const [id,label] of choices){
  const item=document.createElement('button');
  item.type='button';item.className='pt62TypeOption';
  item.dataset.type=id;item.setAttribute('role','option');
  item.setAttribute('aria-selected',String(id===select.value));
  const name=document.createElement('span');name.className='pt62OptionName';name.textContent=label;
  const selected=document.createElement('span');selected.className='pt62Selected';
  selected.setAttribute('aria-hidden','true');selected.textContent=id===select.value?'✓':'';
  item.append(typeIcon(id==='all'?'normal':id),name,selected);
  item.addEventListener('click',()=>{
   if(!select.isConnected)return closeTypePopup();
   select.value=id;
   select.dispatchEvent(new Event('change',{bubbles:true}));
   syncTypeButton(select,button);
   closeTypePopup(true);
  });
  panel.append(item);
 }
 document.body.append(panel);
 button.setAttribute('aria-expanded','true');
 function reposition(){
  if(!button.isConnected||!select.isConnected){closeTypePopup();return;}
  const rect=button.getBoundingClientRect(),vw=window.innerWidth,vh=window.innerHeight;
  const width=Math.min(Math.max(240,rect.width),vw-20);
  const left=Math.min(Math.max(10,rect.left),vw-width-10);
  const below=vh-rect.bottom-12,above=rect.top-12;
  const down=below>=Math.min(290,above)||below>=above;
  const space=Math.max(120,down?below:above);
  const height=Math.min(440,Math.floor(vh*.67),space);
  panel.style.width=width+'px';
  panel.style.maxHeight=height+'px';
  panel.style.left=left+'px';
  panel.style.top=(down?rect.bottom+5:Math.max(8,rect.top-height-5))+'px';
 }
 const outside=event=>{
  if(!panel.contains(event.target)&&!button.contains(event.target))closeTypePopup();
 };
 const keyHandler=event=>{
  if(event.key==='Escape'){event.preventDefault();closeTypePopup(true);return;}
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){
   if(!panel.contains(document.activeElement)&&document.activeElement!==button)return;
   event.preventDefault();
   const options=[...panel.querySelectorAll('.pt62TypeOption')];
   const current=options.indexOf(document.activeElement);
   const fallback=Math.max(0,options.findIndex(el=>el.dataset.type===select.value));
   const index=current<0?fallback:Math.max(0,Math.min(options.length-1,
     current+(event.key==='ArrowDown'?1:-1)));
   options[index]?.focus();
  }else if(event.key==='Home'||event.key==='End'){
   if(!panel.contains(document.activeElement))return;
   event.preventDefault();
   const options=[...panel.querySelectorAll('.pt62TypeOption')];
   options[event.key==='Home'?0:options.length-1]?.focus();
  }
 };
 activeTypePopup={panel,button,select,outside,keyHandler,reposition};
 reposition();
 document.addEventListener('pointerdown',outside,true);
 document.addEventListener('keydown',keyHandler,true);
 window.addEventListener('resize',reposition);
 document.addEventListener('scroll',reposition,true);
 if(focusSelected)panel.querySelector('[aria-selected="true"]')?.focus();
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
   markEdited(b,label);
  }
  markEdited(b,label);
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
  markEdited(b,label);
 }
 const select=modal.querySelector('.ptTypeSelect');
 if(select)mountTypePicker(select,modal.querySelector('.ptTypeBar'));
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
 if(activeTypePopup&&!activeTypePopup.button.isConnected)closeTypePopup();
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
 version:'78.0',types:TYPES.length,
 modifiedCount:MODIFIED_MOVES.size,marked:document.querySelectorAll('.pt78Edited').length,
 dropdown:!!document.querySelector('.pt62TypeButton'),
 optionsInOpenMenu:activeTypePopup?.panel.querySelectorAll('.pt62TypeOption').length||0,
 modifiedRows:document.querySelectorAll('.v331MoveList .pt61Icon').length,
 ascending:!!document.querySelector('.v331MoveList[data-pt61-ascending="1"]'),
 runs
});
})();
