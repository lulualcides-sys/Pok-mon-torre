/* V125 — Original Kanto/Gen 5 Pokémon item & type-TM pixel sprites.
 * Only decorates existing shop/held UI. No purchase logic, savedata,
 * move VFX, hitbox, type damage or prices changed.
 * Image source: PokeAPI/sprites (image contents © The Pokémon Company).
 */
(()=>{
'use strict';
if(window.PokemonTorreMartSpritesV125?.installed)return;
if(new URLSearchParams(location.search).get('mart125')==='0')return;
const SOURCE='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/gen5/';
const ITEM={
 potion:'potion',super:'super-potion',ball:'poke-ball',
 superball:'great-ball',ultraball:'ultra-ball',
 leftovers:'leftovers',quick:'quick-claw',mystic:'mystic-water',
 charcoal:'charcoal',focus:'focus-band'
};
const TMS=new Set(['normal','fire','water','electric','grass','ice','fighting',
 'poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel']);
const stats={shopRuns:0,decorated:0,tmSprites:0,itemSprites:0,heldSprites:0,
 loaded:0,failed:0,skipped:0,lastItem:null};
function iconKey(id){
 const raw=String(id||'').toLowerCase();
 if(ITEM[raw])return ITEM[raw];
 if(raw.startsWith('tm-')){
  const type=raw.slice(3);
  if(TMS.has(type))return 'tm-'+type;
 }
 return null;
}
function setSprite(holder,key,name,kind){
 if(!holder||!key||holder.querySelector?.('[data-v125-sprite]')){stats.skipped++;return false;}
 const original=holder.textContent||'';
 const img=document.createElement('img'),fallback=document.createElement('span');
 img.setAttribute('data-v125-sprite','');
 img.className='v125ItemPixel';img.alt=name||'Item Pokémon';
 img.loading='lazy';img.decoding='async';img.width=46;img.height=46;
 fallback.className='v125Fallback';fallback.textContent=original||'🎒';
 holder.textContent='';
 holder.classList.add('v125SpriteHolder');
 holder.append(img,fallback);
 img.onload=()=>{
  if(!img.naturalWidth){stats.failed++;img.style.display='none';return;}
  fallback.style.display='none';stats.loaded++;
 };
 img.onerror=()=>{
  // Missing CDN or offline? Existing shop remains fully operational.
  img.style.display='none';fallback.style.display='';stats.failed++;
 };
 img.src=SOURCE+key+'.png';
 stats.decorated++;stats.lastItem=key;
 if(kind==='tm')stats.tmSprites++;
 else if(kind==='held')stats.heldSprites++;
 else stats.itemSprites++;
 return true;
}
function decorateShop(){
 const root=document.getElementById('modal');
 if(!root||!root.querySelector('.shopList'))return;
 stats.shopRuns++;
 for(const card of root.querySelectorAll('.shopList .shopItem')){
  const action=card.querySelector('[data-buy], [data-v32-tm]');
  if(!action)continue;
  const id=action.hasAttribute('data-v32-tm')?'tm-'+action.dataset.v32Tm:action.dataset.buy;
  const key=iconKey(id);if(!key)continue;
  const holder=card.querySelector('.shopEmoji');
  const name=card.querySelector('.shopInfo strong')?.textContent||id;
  setSprite(holder,key,name,id.startsWith('tm-')?'tm':'item');
 }
}
// Also expose original held-item pixels next to their displayed item names
// on Pokémon cards, without changing equipment controls or the browser select.
function decorateHeld(){
 const labels={leftovers:'leftovers',quick:'quick-claw',mystic:'mystic-water',
  charcoal:'charcoal',focus:'focus-band'};
 for(const el of document.querySelectorAll('.v31Held')){
  if(el.querySelector('[data-v125-sprite]'))continue;
  const text=el.textContent||'';
  const pair=Object.entries(labels).find(([k])=>({
   leftovers:/leftovers/i,quick:/quick claw/i,mystic:/mystic water/i,
   charcoal:/charcoal/i,focus:/focus band/i
  }[k]).test(text));
  if(!pair)continue;
  const image=document.createElement('img');
  image.setAttribute('data-v125-sprite','');
  image.className='v125HeldPixel';
  image.alt='Item equipado: '+pair[0];
  image.width=24;image.height=24;image.loading='lazy';image.decoding='async';
  image.onerror=()=>{image.remove();stats.failed++;};
  image.onload=()=>{stats.loaded++;};
  image.src=SOURCE+pair[1]+'.png';
  el.prepend(image);stats.heldSprites++;
 }
}
const previousShop=showShop;
showShop=function(){
 const result=previousShop.apply(this,arguments);
 if(!battle?.active)decorateShop();
 return result;
};
const previousTeam=showTeam;
showTeam=function(){
 const result=previousTeam.apply(this,arguments);
 decorateHeld();
 return result;
};
const css=document.createElement('style');
css.id='v125-pokemart-original-sprites';
css.textContent='.shopEmoji.v125SpriteHolder{display:flex;justify-content:center;align-items:center;'+
 'position:relative;flex-shrink:0;width:clamp(50px,13vw,64px);height:clamp(50px,13vw,64px);'+
 'min-width:50px;border-radius:12px;overflow:hidden;background:linear-gradient(145deg,#29465b,#1c344c)}'+
 '.v125ItemPixel{display:block;width:46px;height:46px;max-width:88%;max-height:88%;'+
 'object-fit:contain;image-rendering:pixelated;image-rendering:crisp-edges;'+
 'filter:drop-shadow(0 2px 1px #021521aa)}'+
 '.v125Fallback{font-size:30px;line-height:1;position:absolute;inset:0;'+
 'display:grid;place-items:center;pointer-events:none}'+
 '.v125HeldPixel{display:inline-block;width:24px;height:24px;image-rendering:pixelated;'+
 'vertical-align:middle;margin-right:4px;object-fit:contain}'+
 '@media(max-width:430px){.shopEmoji.v125SpriteHolder{width:52px;height:52px;min-width:52px}'+
 '.v125ItemPixel{width:42px;height:42px}}';
document.head.appendChild(css);
window.PokemonTorreMartSpritesV125=Object.freeze({
 installed:true,version:'125.0',official:true,assetSource:SOURCE,
 mapping:Object.freeze({...ITEM}),tmTypes:[...TMS],
 diagnostics:()=>({...stats,priceChanges:false,moveChanges:false}),
 refresh:()=>{decorateShop();decorateHeld();}
});
})();