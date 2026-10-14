/* Pokemon Torre V36.02: type selector for EVERY Pokémon move editor.
 * Works with existing tabs, name-search and saved equipment slots.
 * Pure DOM enhancement: does NOT modify catalogue/save/game rules.
 */
(function(){
 'use strict';
 // Plain text remains accessible in the fallback native selector.
 // The custom V62 menu renders original SVG glyphs beside every name.
 const types=[
 ['all','Todos os tipos'],['normal','Normal'],['fire','Fogo'],
 ['water','Água'],['electric','Elétrico'],['grass','Planta'],
 ['ice','Gelo'],['fighting','Lutador'],['poison','Veneno'],
 ['ground','Terra'],['flying','Voador'],['psychic','Psíquico'],
 ['bug','Inseto'],['rock','Pedra'],['ghost','Fantasma'],
 ['dragon','Dragão'],['dark','Sombrio'],['steel','Aço'],
 ['fairy','Fada']
 ];
 const aliases={
 normal:['normal'],fire:['fogo','fire'],water:['agua','water'],electric:['eletrico','electric'],
 grass:['planta','grama','grass'],ice:['gelo','ice'],fighting:['lutador','luta','fighting'],
 poison:['veneno','poison'],ground:['terra','ground'],flying:['voador','flying'],
 psychic:['psiquico','psychic'],bug:['inseto','bug'],rock:['pedra','rock'],
 ghost:['fantasma','ghost'],dragon:['dragao','dragon'],dark:['sombrio','noturno','dark'],
 steel:['aco','steel','metal'],fairy:['fada','fairy']
 };
 const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 let chosen='all',term='',scheduled=false,working=false,lastModal=null;
 const css=document.createElement('style');
 css.id='ptMoveTypeCss';
 css.textContent='.ptTypeBar{display:flex;align-items:center;gap:8px;margin:7px 0 9px}.ptTypeBar label{font-size:12px;color:#a9d7d7;flex:0 0 auto}.ptTypeSelect{min-width:0;flex:1;max-width:100%;border:1px solid #6b9ba4;border-radius:10px;padding:10px 9px;background:#123142;color:#f0fbff;font:600 13px system-ui;min-height:42px;outline-offset:2px}.ptTypeCount{font-size:11px;color:#a9d7d7;text-align:right;margin-bottom:6px}.v331Choice.ptFilteredOut{display:none!important}@media(max-width:390px){.ptTypeBar label{font-size:11px}.ptTypeSelect{font-size:12px}}';
 document.head.appendChild(css);
 function matchesType(row){
  if(chosen==='all')return true;
  const category=normalize(row.querySelector('small')?.textContent||'').split('·')[0].trim();
  return (aliases[chosen]||[]).some(label=>category===label);
 }
 function apply(modal,list){
  if(working)return;working=true;
  try{
   let showing=0;
   const search=modal.querySelector('#v3566FindMove');
   if(search)term=search.value||'';
   const q=normalize(term);
   for(const row of list.querySelectorAll('.v331Choice')){
    const match=matchesType(row)&&normalize(row.textContent).includes(q);
    row.classList.toggle('ptFilteredOut',!match);
    // Search from V35.66 may have previously hidden the row. Reset that
    // inline style; our one CSS class owns visibility for both filters.
    if(row.style.display==='none')row.style.display='';
    if(match)showing++;
   }
   const counter=modal.querySelector('.ptTypeCount');
   const message=showing+' golpe(s) neste filtro';
   if(counter&&counter.textContent!==message)counter.textContent=message;
   const legacy=modal.querySelector('#v3566FindCount');
   if(legacy&&legacy.textContent!==message)legacy.textContent=message;
  }finally{working=false;}
 }
 function mount(){
  const modal=document.querySelector('#modal');
  const list=modal?.querySelector('.v331MoveList');
  if(!modal||!list){lastModal=null;return;}
  if(lastModal!==list){term='';lastModal=list;}
  let bar=modal.querySelector('.ptTypeBar');
  if(!bar){
   bar=document.createElement('div');bar.className='ptTypeBar';
   const label=document.createElement('label');label.htmlFor='ptTypeSelect';label.textContent='Filtrar tipo:';
   const select=document.createElement('select');select.id='ptTypeSelect';select.className='ptTypeSelect';
   select.setAttribute('aria-label','Filtrar golpes por tipo de Pokémon');
   for(const [value,title] of types){const option=document.createElement('option');option.value=value;option.textContent=title;select.appendChild(option);}
   select.value=chosen;
   select.addEventListener('change',()=>{chosen=select.value;apply(modal,list);});
   bar.append(label,select);
   const search=modal.querySelector('.v3566Search');
   if(search)search.insertAdjacentElement('afterend',bar);
   else list.insertAdjacentElement('beforebegin',bar);
   const count=document.createElement('div');count.className='ptTypeCount';bar.insertAdjacentElement('afterend',count);
   // Native search listener runs first; this event callback makes both filters
   // effective without altering its existing implementation.
  }
  // V35.66 installs search asynchronously. Link it even when search appears
  // after the type control, and on every editor re-render.
  const input=modal.querySelector('#v3566FindMove');
  if(input&&!input.dataset.ptTypeLinked){
   input.dataset.ptTypeLinked='yes';
   input.addEventListener('input',()=>{term=input.value;apply(modal,list);});
  }
  apply(modal,list);
 }
 const observer=new MutationObserver(()=>{
  if(working||scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;mount();});
 });
 // Editor root is repainted directly; monitoring all descendants made the
 // filter run on every combat log update and caused mobile frame drops.
 observer.observe(document.querySelector('#modal')||document.body,{subtree:false,childList:true});
 // The original modal is repainted by the editor; mount on initial and later
 // frame updates as a fallback for installations where #modal is replaced.
 const bodyObserver=new MutationObserver(()=>{
  if(scheduled)return;
  scheduled=true;requestAnimationFrame(()=>{scheduled=false;mount();});
 });
 bodyObserver.observe(document.body,{childList:true,subtree:false});
 mount();
 window.PokemonTorreTypeFilter=()=>({version:'36.02',selected:chosen,options:types.length,mounted:!!document.querySelector('.ptTypeSelect')});
})();
