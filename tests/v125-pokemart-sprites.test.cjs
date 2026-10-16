'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const file='effects/v125/pokemart-sprites.js',js=fs.readFileSync(file,'utf8');
const index=fs.readFileSync('index.html','utf8');
assert.ok(index.includes(file),'V125 module must be integrated in the normal game loader');
assert.ok(index.includes("get('mart125')!=='0'"),'isolated comparison switch');
assert.doesNotMatch(js,/save\.coins\s*[-+]?=|save\.v32\.tms\.push|\.onclick\s*=/,
 'Cosmetic V125 cannot change purchased TMs or prices');
assert.doesNotMatch(js,/BattleEngine\.prototype|hitTarget\s*=|damage\s*=/,
 'Combat and approved animations must remain unchanged');
const base='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/gen5/';
const itemCases=[
 ['potion','potion'],['super','super-potion'],['ball','poke-ball'],
 ['superball','great-ball'],['ultraball','ultra-ball'],
 ['leftovers','leftovers'],['quick','quick-claw'],['mystic','mystic-water'],
 ['charcoal','charcoal'],['focus','focus-band']];
const tmTypes=['electric','water','fire','grass','psychic','ground','normal','poison','ice','ghost'];
const noop=()=>{};
class Elm{
 constructor(name='div'){
  this.tagName=name;this.children=[];this.className='';this.style={};this.dataset={};
  this.attrs={};this.textContent='';this.onload=null;this.onerror=null;this.src='';
  this.classList={add:x=>this.className=(this.className+' '+x).trim(),contains:x=>this.className.split(' ').includes(x)};
 }
 append(...cs){this.children.push(...cs);cs.forEach(c=>c.parent=this)}
 prepend(c){this.children.unshift(c);c.parent=this}
 remove(){if(this.parent)this.parent.children=this.parent.children.filter(x=>x!==this)}
 setAttribute(k,v){this.attrs[k]=v;}
 hasAttribute(k){return Object.hasOwn(this.attrs,k)}
 querySelector(selector){
  if(selector==='[data-v125-sprite]')return this.children.find(c=>c.attrs?.['data-v125-sprite']!==undefined)||null;
  return null;
 }
}
const cases=[...itemCases.map(([id,name])=>({id,name})),...tmTypes.map(type=>({id:'tm-'+type,name:'tm-'+type}))];
const shopCards=cases.map(({id,name})=>{
 const card=new Elm(),action=new Elm('button'),icon=new Elm('div'),info=new Elm('div'),strong=new Elm('strong');
 action.dataset=id.startsWith('tm-')?{v32Tm:id.slice(3)}:{buy:id};
 if(id.startsWith('tm-'))action.setAttribute('data-v32-tm','');
 else action.setAttribute('data-buy','');
 icon.className='shopEmoji';icon.textContent='🎒';strong.textContent=name;
 info.querySelector=()=>strong;
 card.querySelector=selector=>selector==='[data-buy], [data-v32-tm]'?action:
  selector==='.shopEmoji'?icon:selector==='.shopInfo strong'?strong:null;
 return {card,action,icon,id,name};
});
const modal={
 querySelector:s=>s==='.shopList'?{}:null,
 querySelectorAll:s=>s==='.shopList .shopItem'?shopCards.map(x=>x.card):[]
};
const held=new Elm('small');held.className='v31Held';held.textContent='🎒 Mystic Water';
const doc={
 head:{children:[],appendChild(e){this.children.push(e)}},
 createElement:t=>new Elm(t),
 getElementById:id=>id==='modal'?modal:null,
 querySelectorAll:s=>s==='.v31Held'?[held]:[]
};
const sandbox={window:{},URLSearchParams,location:{search:''},document:doc,
 battle:{active:false},showShop(){return 'normal shop'},showTeam(){return 'native team'},console};
vm.runInNewContext(js,sandbox,{filename:file,timeout:2000});
assert.equal(sandbox.window.PokemonTorreMartSpritesV125.installed,true);
assert.equal(sandbox.showShop(),'normal shop');
for(const {icon,id,name} of shopCards){
 const img=icon.querySelector('[data-v125-sprite]');
 assert.ok(img,'Pixel image missing for '+id);
 assert.equal(img.src,base+name+'.png','Wrong original sprite for '+id);
 assert.equal(img.alt,name,'Alt text for '+id);
 assert.equal(img.loading,'lazy','Shop sprites lazy-loaded');
 assert.equal(icon.children.length,2,'Fallback emoji should be preserved');
 img.naturalWidth=30;img.onload();
 assert.equal(icon.children[1].style.display,'none','Emoji hidden after loaded');
}
assert.equal(sandbox.window.PokemonTorreMartSpritesV125.diagnostics().tmSprites,tmTypes.length);
assert.equal(sandbox.window.PokemonTorreMartSpritesV125.diagnostics().itemSprites,itemCases.length);
sandbox.showShop();
assert.equal(sandbox.window.PokemonTorreMartSpritesV125.diagnostics().decorated,cases.length,
 'Rerendering cannot duplicate sprites');
sandbox.showTeam();
assert.equal(held.children.length,1,'Held item icon shown once');
assert.equal(held.children[0].src,base+'mystic-water.png');
sandbox.showTeam();
assert.equal(held.children.length,1,'No duplicate held item icons');
const fail=shopCards[0].icon.children[0];fail.onerror();
assert.equal(fail.style.display,'none','Network error hides image');
assert.equal(shopCards[0].icon.children[1].style.display,'','Emoji fallback returns');
console.log('PASS V125: 10 original items + 10 type-matched TMs, verified sprite URLs, shop and held items pixelated, rerender safe, purchase/price/combat untouched');
