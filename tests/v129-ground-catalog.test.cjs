'use strict';
/* V129: Terra catalogue restoration regression test; no game save or move VFX mutation. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('effects/ui/move-type-filter.js','utf8');
const moves=fs.readFileSync('parts/p008.txt','utf8');
const index=fs.readFileSync('index.html','utf8');
for(const name of ['Tapa de Lama','Soco de Terra','Tremor','Abalo Terrestre','Terremoto'])
 assert.ok(moves.includes(name),'original Ground move definition missing '+name);
assert.ok(index.includes('effects/ui/move-type-filter.js'),'type filter must load');
assert.ok(source.includes("['ground','Terra']"),'Terra must be a native selectable category');
assert.doesNotMatch(source,/save\.|localStorage\.|\.power\s*=|\.level\s*=|BattleEngine\.prototype/,'UI filter must not rewrite progress, power or combat');
function node(tag){
 const el={tag,children:[],style:{},dataset:{},listeners:{},textContent:'',value:'',_attrs:{},_classes:new Set(),isConnected:true};
 el.classList={contains(x){return el._classes.has(x)},add(x){el._classes.add(x)},remove(x){el._classes.delete(x)},
  toggle(x,force){if(force===undefined)force=!el._classes.has(x);if(force)el._classes.add(x);else el._classes.delete(x);return force}};
 el.appendChild=x=>{el.children.push(x);return x};
 el.append=(...nodes)=>{el.children.push(...nodes)};
 el.setAttribute=(name,val)=>{el._attrs[name]=val};
 el.addEventListener=(name,fn)=>{el.listeners[name]=fn};
 el.insertAdjacentElement=(direction,what)=>{if(el.onInsert)el.onInsert(what)};
 return el;
}
function row(name,label,mode='text'){
 const r=node('button');r.textContent=name+' '+label+' · 30 força';
 const small=node('small');small.textContent=mode==='glyph'?'':' '+label+' · 30 força';
 const icon=node('span');icon.dataset.type='ground';icon.className='pt61Icon';
 r.querySelector=(q)=>q==='small'?small:q==='.pt61Icon[data-type]'?icon:null;
 r._classes.add('v331Choice');
 return r;
}
const terra=row('Tremor','Terra'),water=row('Bolhas','Água');
const modal=node('div'),list=node('div'),head=node('head'),body=node('body'),search=node('input');
search.value='água';
list.rows=[terra,water];list.querySelectorAll=q=>q==='.v331Choice'?list.rows:[];
let bar=null,count=null,tabAll=node('button'),clicks=0;
tabAll.click=()=>{clicks++;tabAll._classes.add('gold');list.rows=[terra,water];};
search.onInsert=what=>{if(what.className==='ptTypeBar')bar=what;};
modal.querySelector=q=>{
 if(q==='.v331MoveList')return list;
 if(q==='.ptTypeBar')return bar;
 if(q==='.v3566Search')return search;
 if(q==='#v3566FindMove')return search;
 if(q==='.ptTypeCount')return count;
 if(q==='#v3566FindCount')return null;
 if(q==='[data-v331-filter="all"]')return tabAll;
 return null;
};
const prevInsert=search.insertAdjacentElement;
const allInserted=[];
const createElement=tag=>{
 const e=node(tag);
 const before=e.insertAdjacentElement;
 e.insertAdjacentElement=(at,what)=>{allInserted.push(what);if(e===bar)count=what;before(at,what)};
 return e;
};
const document={createElement,head,body,querySelector:q=>q==='#modal'?modal:q==='.ptTypeSelect'?bar?.children.find(x=>x.tag==='select')||null:q==='.v331MoveList'?list:null};
const watchers=[];
class MutationObserver{constructor(fn){watchers.push(fn)}observe(){}disconnect(){}}
const env={window:{},document,MutationObserver,requestAnimationFrame:cb=>cb(),console};
vm.runInNewContext(source,env,{timeout:1000,filename:'move-type-filter.js'});
const select=bar?.children.find(x=>x.tag==='select');
assert.ok(select&&select.listeners.change,'type selector must initialize');
assert.ok(terra.classList.contains('ptFilteredOut'),'stale Água search should initially exclude Terra');
select.value='ground';select.listeners.change();
assert.equal(search.value,'','switch to Terra clears stale Água search');
assert.ok(!terra.classList.contains('ptFilteredOut'),'Tremor must show under Terra');
assert.ok(water.classList.contains('ptFilteredOut'),'other types must be filtered');
assert.equal(count.textContent,'1 golpe(s) neste filtro');
assert.equal(env.window.PokemonTorreTypeFilter().groundVisible,1);
assert.equal(clicks,0,'Todos must not be forced if Terra is present');
// In a restricted tab with no Terra, automatically show existing Todos
// while preserving original locked buttons and game save.
list.rows=[water];tabAll._classes.delete('gold');select.listeners.change();
assert.equal(clicks,1,'Terra missing from selected tab must open Todos');
watchers[0]();
assert.ok(!terra.classList.contains('ptFilteredOut'),'Terra must be restored after expanding catalogue');
assert.equal(env.window.PokemonTorreTypeFilter().groundVisible,1);
console.log('PASS V129: Terra moves remain defined, stale Água search cleared, Terra visible, Todos fallback, V128 and progression untouched.');
