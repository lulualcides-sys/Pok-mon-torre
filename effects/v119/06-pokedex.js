/* V119 · Pokédex utility filters and real collection statistics.
 * Preserve existing Kanto 151 cards, unlock rules and local save.
 */
(()=>{
'use strict';
if(new URLSearchParams(location.search).get('kanto119')!=='1')return;
const stats={opens:0,filters:0,last:'all'};
const native=showPokedex;
showPokedex=function(){
 const result=native.apply(this,arguments);
 const grid=document.querySelector('#modal .dexGrid'),heading=document.querySelector('#modal .sectionhead');
 if(!grid||!heading)return result;
 const seen=new Set(save.seen||[]),caught=new Set(save.caught||[]);
 const shiny=new Set([...(save.shinyCaught||[]),...(save.v119ShinySeen||[])]);
 const summary=document.createElement('div');
 summary.style.cssText='display:flex;gap:8px;flex-wrap:wrap;justify-content:center;font-size:11px;margin:10px 0';
 for(const label of [
  '👁 '+seen.size+'/151 vistos','🔴 '+caught.size+'/151 capturados',
  '✨ '+shiny.size+' espécies shiny encontradas']){
  const chip=document.createElement('span');chip.className='pill';chip.textContent=label;summary.append(chip);
 }
 grid.insertAdjacentElement('beforebegin',summary);
 const form=document.createElement('div');
 form.style.cssText='display:flex;gap:7px;flex-wrap:wrap;margin:8px 0 12px';
 const search=document.createElement('input');
 search.type='search';search.placeholder='Pesquisar nome ou número';search.autocomplete='off';
 search.style.cssText='min-width:135px;flex:1;background:#152433;color:white;border:1px solid #49718c;border-radius:8px;padding:9px;font-size:12px';
 const selector=document.createElement('select');
 selector.style.cssText='background:#152433;color:white;border:1px solid #49718c;border-radius:8px;padding:9px;font-size:12px';
 for(const [value,label] of [['all','Todos'],['seen','Vistos'],['caught','Capturados'],['shiny','Shinies'],['missing','Não vistos']]){
  const opt=document.createElement('option');opt.value=value;opt.textContent=label;selector.append(opt);
 }
 const counter=document.createElement('div');
 counter.style.cssText='width:100%;font-size:10px;color:#b9d5ee';
 form.append(search,selector,counter);summary.insertAdjacentElement('afterend',form);
 const cards=[...grid.querySelectorAll('.dexCard')];
 function filter(){
  let visible=0,term=search.value.toLowerCase().trim();
  cards.forEach((card,index)=>{
   const id=index+1;
   const category=selector.value;
   const passes=category==='all'||category==='seen'&&seen.has(id)||
    category==='caught'&&caught.has(id)||category==='shiny'&&shiny.has(id)||
    category==='missing'&&!seen.has(id);
   const name=String(D[id]?.name||'').toLowerCase();
   const text=String(id).padStart(3,'0');
   const match=!term||name.includes(term)&&seen.has(id)||text.includes(term);
   card.hidden=!(passes&&match);
   card.style.display=card.hidden?'none':'';
   if(!card.hidden)visible++;
  });
  counter.textContent=visible+' de 151 Pokémon exibidos';
  stats.filters++;stats.last=category;
 }
 search.addEventListener('input',filter);selector.addEventListener('change',filter);
 filter();stats.opens++;
 return result;
};
window.PokemonTorrePokedexV119=Object.freeze({installed:true,previewOnly:true,
 diagnostics:()=>({...stats})});
})();