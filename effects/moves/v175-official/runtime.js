/* V175: USUM Kanto learnsets / canonical English labels.
 * Native move.name stays intact for existing effects (Bubble, Water Gun, Surf, Rain Dance).
 * No approved visual file, cooldown or damage routine is replaced.
 */
(()=>{
'use strict';
const data=window.PokemonTorreV175Learnsets;
if(!data?.species||typeof v32Catalogue!=='function'||typeof skillSet!=='function')return;
if(new URLSearchParams(location.search).get('moves175')==='0')return;
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const byEnglish=new Map(Object.entries(data.moves).map(([id,m])=>[norm(m[0]),+id]));
const aliases={
'bolhas':'Bubble','pistola dagua':'Water Gun','jato dagua':'Water Gun','pulso de agua':'Water Pulse',
'cauda de agua':'Aqua Tail','cachoeira':'Waterfall','hidro bomba':'Hydro Pump','mergulho':'Dive',
'lanca chamas':'Flamethrower','brasa':'Ember','roda de fogo':'Flame Wheel','punho de fogo':'Fire Punch',
'explosao de fogo':'Fire Blast','giro de fogo':'Fire Spin','dia ensolarado':'Sunny Day',
'fogo fatuo':'Will-O-Wisp','chicote de vinha':'Vine Whip','folha navalha':'Razor Leaf',
'absorver':'Absorb','mega dreno':'Mega Drain','raio solar':'Solar Beam','bomba de sementes':'Seed Bomb',
'po do sono':'Sleep Powder','esporos':'Spore','esporo':'Spore','onda eletrica':'Thunder Wave',
'choque do trovao':'Thunder Shock','faisca':'Spark','descarga':'Discharge','raio':'Thunderbolt',
'trovao':'Thunder','raio de gelo':'Ice Beam','nevasca':'Blizzard','vento gelado':'Icy Wind',
'sopro congelante':'Frost Breath','terremoto':'Earthquake','tapa de lama':'Mud-Slap',
'lancamento de areia':'Sand Attack','osso':'Bone Club','osso bumerangue':'Bonemerang',
'grande fissura':'Fissure','arremesso de pedra':'Rock Throw','deslizamento':'Rock Slide',
'confusao':'Confusion','psiquico':'Psychic','psicocorte':'Psycho Cut',
'futuro ataque':'Future Sight','picada venenosa':'Poison Sting','ferrao venenoso':'Poison Sting',
'acido':'Acid','nevoa venenosa':'Poison Gas','bomba de lodo':'Sludge Bomb',
'rajada acida':'Acid Spray','toxina pesada':'Toxic','golpe de veneno':'Poison Jab',
'golpe de karate':'Karate Chop','quebra tijolo':'Brick Break','soco cruzado':'Cross Chop',
'rajada':'Gust','bicada':'Peck','ataque de asa':'Wing Attack','aerocorte':'Air Cutter',
'furacao':'Hurricane','picada':'Bug Bite','ferroada':'Twineedle','corte x':'X-Scissor',
'ataque de inseto':'Bug Bite','pulso de dragao':'Dragon Pulse','sopro de dragao':'Dragon Breath',
'garra draconica':'Dragon Claw','raiva do dragao':'Dragon Rage','bola sombria':'Shadow Ball',
'garra sombria':'Shadow Claw','lambida':'Lick','mordida':'Bite','pulso sombrio':'Dark Pulse',
'golpe noturno':'Night Slash','garra de metal':'Metal Claw','canhao de ferro':'Flash Cannon',
'brilho magico':'Dazzling Gleam','poder da lua':'Moonblast','luz da lua':'Moonlight',
'investida':'Tackle','arranhao':'Scratch','rosnar':'Growl','abanar rabo':'Tail Whip',
'ataque rapido':'Quick Attack','endurecer':'Harden','salpicar':'Splash','transformar':'Transform',
'canto':'Sing','recuperar':'Recover','golpe de corpo':'Body Slam','hiper raio':'Hyper Beam',
'tri ataque':'Tri Attack','soco':'Pound'
};
const alias=new Map(Object.entries(aliases).map(([a,b])=>[norm(a),b]));
const translations=new Map([['Bolhas','Bubble'],['Pistola d’Água','Water Gun'],["Pistola d'Água",'Water Gun']]);
function canonical(name){const n=norm(name),id=byEnglish.get(n);return alias.get(n)||(id?data.moves[id]?.[0]:null)}
// Audit metadata only: the existing combat engine remains responsible for targeting,
// damage, healing and visual effects. Never fake a new projectile for a drain/status.
const selfTarget=new Set(['Recover','Roost','Rest','Synthesis','Moonlight','Growth',
 'Calm Mind','Harden','Iron Defense','Bulk Up','Agility','Amnesia','Dragon Dance',
 'Withdraw','Minimize','Acid Armor','Splash','Protect','Reflect','Light Screen']);
const fieldTarget=new Set(['Rain Dance','Sunny Day','Sandstorm','Hail','Electric Terrain',
 'Grassy Terrain','Misty Terrain','Psychic Terrain']);
const drainTarget=new Set(['Absorb','Mega Drain','Giga Drain','Leech Life',
 'Dream Eater','Drain Punch']);
const targetOf=name=>fieldTarget.has(name)?'field':drainTarget.has(name)?'enemy-to-self':
 selfTarget.has(name)?'self':'enemy';
function isOwnedTestMewtwo(m){
 if(Number(m?.id)!==150)return false;
 if(m.v3566MewtwoTest===true)return true;
 // Also support older saves whose owned Mewtwo lacks the test flag.
 return [...(save?.team||[]),...(save?.box||[])].some(owned=>owned===m);
}
const previousCatalogue=v32Catalogue,previousSkillSet=skillSet;
let nesting=0,invalidSaved=0,lastSpecies=null,displayEdits=0;
const icons={normal:'✦',fire:'🔥',water:'💧',grass:'🍃',electric:'⚡',ice:'❄',ground:'◆',rock:'⬟',
 psychic:'◈',poison:'☣',fighting:'✊',flying:'➤',bug:'✳',ghost:'◉',dragon:'✧',dark:'◆',steel:'⚙',fairy:'✧'};
const kindNames={'Absorb':'drain','Mega Drain':'drain','Giga Drain':'drain',
 'Leech Life':'drain','Dream Eater':'drain','Drain Punch':'dash',
 'Rock Throw':'bolt','Rock Slide':'area','Stone Edge':'area','Bonemerang':'pierce',
 'Bullet Seed':'pierce','Pin Missile':'pierce','Ice Shard':'pierce',
 'Tackle':'dash','Scratch':'dash','Quick Attack':'dash','Ember':'bolt',
 'Surf':'area','Hydro Pump':'beam','Rain Dance':'status','Bubble':'bolt',
 'Water Gun':'bolt','Water Pulse':'bolt','Aqua Jet':'dash','Aqua Tail':'dash',
 'Waterfall':'dash','Dive':'dash','Flamethrower':'beam','Fire Spin':'hazard','Fire Blast':'area',
 'Sunny Day':'status','Will-O-Wisp':'status','Thunder':'homing','Thunderbolt':'bolt',
 'Discharge':'area','Solar Beam':'beam','Earthquake':'area','Shadow Ball':'homing',
 'Ice Beam':'beam','Hyper Beam':'beam','Roost':'recover','Recover':'recover','Rest':'recover',
 'Fissure':'area','Vine Whip':'bolt','Razor Leaf':'pierce'};
function builtMove(id){
 const info=data.moves[id];if(!info)return null;
 const [name,type,officialPower,cls]=info;
 const kind=kindNames[name]||(cls===1?'status':cls===2?'dash':'bolt');
 // Zero listed power can mean variable damage, not necessarily a status move.
 const power=cls===1?0:Math.min(68,Math.max(15,Math.round((officialPower||40)*.62)));
 const cd=kind==='homing'?10000:kind==='area'?4650:kind==='hazard'?5900:
  kind==='beam'?4400:kind==='recover'?8500:kind==='status'?5900:kind==='dash'?1800:2400;
 return {name,type,kind,cat:cls===2?'physical':cls===3?'special':'status',
  power,cost:power===0?20:Math.min(52,Math.max(6,Math.round(power*.59))),
  cd,icon:icons[type]||'✧',v175MoveId:id};
}
function officialCatalogue(m){
 if(!m||!data.species[m.id])return [];
 const testMewtwo=isOwnedTestMewtwo(m);
 // Only the player's test Mewtwo may equip the entire 18 x 16 review catalogue.
 const source=testMewtwo?Object.keys(data.moves).map(id=>[Number(id),0,1]):data.species[m.id];
 let native=[];
 if(nesting===0){try{nesting++;native=previousCatalogue(m)||[]}catch(e){console.warn('V175: legacy catalogue unavailable',e)}finally{nesting--}}
 const availableNative=new Map();
 for(const item of native){
  const english=canonical(item?.move?.name);if(!english)continue;
  const id=byEnglish.get(norm(english));if(!id||!data.moves[id])continue;
  translations.set(item.move.name,english);
  const preferred=/^(Bolhas|Pistola d.|Surf|Rain Dance)$/i.test(item.move.name)?20:0;
  const score=preferred+(item.move.type===data.moves[id][1]?3:0);
  if(!availableNative.has(id)||score>availableNative.get(id).score)availableNative.set(id,{item,score});
 }
 const early=source.filter(x=>x[2]===1).slice().sort((a,b)=>a[1]-b[1]);
 const level=Number(m.level)||1,owned=new Set(save?.v32?.tms||[]);
 // A single canonical starter move is allowed if the species has no legal level-1 move.
 // Do not pre-unlock four late-level moves as V175 did.
 const hasNatural=early.some(x=>level>=x[1]);
 const beginner=new Set(!testMewtwo&&!hasNatural&&early.length?[early[0][0]]:[]);
 const equipped=new Set(Array.isArray(m.v32Slots)?m.v32Slots:[]),result=[],seen=new Set();
 for(const [id,requiredLevel,method] of source){
  if(seen.has(id))continue;seen.add(id);
  const info=data.moves[id];if(!info)continue;
  const original=availableNative.get(id)?.item;
  const move=original?{...original.move,
   // Historic visual dispatch uses the original name/kind/key; fix only inaccurate
   // type and category labels from the legacy catalog (e.g. Tackle = Normal).
   type:info[1],cat:info[3]===2?'physical':info[3]===3?'special':'status',
   v175MoveId:id}:builtMove(id);
 if(move){move.v176Target=targetOf(info[0]);move.v176ReviewType=info[1];}
  if(!move)continue;
  const key=original?.key||v32MoveKey(move);
  const unlocked=testMewtwo|| (method===1?(level>=requiredLevel||beginner.has(id)):
   owned.has(info[1])||equipped.has(key));
  result.push({key,move,level:method===1?requiredLevel:1,tm:method===4,available:unlocked,
   v175Id:id,v175English:info[0],v175Method:method});
 }
 const species=typeof D!=='undefined'?D[m.id]:null;
 const primary=species?.type,secondary=species?.type2;
 const affinity=row=>row.move.type===primary?0:row.move.type===secondary?1:2;
 const typeOrder=['normal','fire','water','grass','electric','ice','ground','rock',
  'psychic','poison','fighting','flying','bug','ghost','dragon','dark','steel','fairy'];
 result.sort((a,b)=>Number(b.available)-Number(a.available)||
  (testMewtwo?typeOrder.indexOf(a.move.type)-typeOrder.indexOf(b.move.type):affinity(a)-affinity(b))||
  Number(a.tm)-Number(b.tm)||a.level-b.level||
  a.v175English.localeCompare(b.v175English,'en'));
 lastSpecies=m.id;return result;
}
v32Catalogue=officialCatalogue;
skillSet=function(m){
 if(!m||!data.species[m.id])return previousSkillSet(m);
 const list=officialCatalogue(m),ready=list.filter(x=>x.available);
 if(!ready.length)return previousSkillSet(m);
 const stored=Array.isArray(m.v32Slots)?m.v32Slots:[],out=[],used=new Set();
 for(const key of stored){
  const found=list.find(x=>x.key===key&&x.available&&!used.has(x.key));
  if(found){out.push(found);used.add(found.key)}
  if(out.length>=4)break;
 }
 if(stored.length&&out.length<stored.length)invalidSaved++;
 for(const row of ready){if(out.length>=4)break;if(!used.has(row.key)){out.push(row);used.add(row.key)}}
 // Kanto exceptions (Ditto, Metapod, Kakuna, Magikarp) have 1–2 real moves.
 // Reuse a legal move for the engine's 4 fixed buttons, rather than inventing an illegal move.
 while(out.length<4)out.push(out[out.length%Math.max(1,used.size)]);
 return out.map(x=>({...x.move}));
};
const oShowTeam=showTeam,oRender=render,oRenderBattle=renderBattle;
showTeam=function(){const r=oShowTeam.apply(this,arguments);queueMicrotask(localize);return r};
render=function(){const r=oRender.apply(this,arguments);queueMicrotask(localize);return r};
renderBattle=function(){const r=oRenderBattle.apply(this,arguments);queueMicrotask(localize);return r};
// Native overlay is a const; observe modal text rather than assigning to it.
let modalObserver=null;
function trackModal(){
 const modal=document.getElementById('modal');
 if(!modal||modalObserver||typeof MutationObserver!=='function')return;
 modalObserver=new MutationObserver(()=>queueMicrotask(localize));
 modalObserver.observe(modal,{childList:true,subtree:true,characterData:true});
}
function localize(){
 if(!document.body||!translations.size)return;
 const names=[...translations.keys()].filter(k=>translations.get(k)!==k).sort((a,b)=>b.length-a.length);
 if(!names.length)return;
 const escapeRegex=s=>s.replace(/[.*+?^$()|[\]\\]/g,'\\$&');
 const rx=new RegExp('(^|[^A-Za-zÀ-ž])('+names.map(escapeRegex).join('|')+')(?=$|[^A-Za-zÀ-ž])','gi');
 const map=new Map([...translations].map(([a,b])=>[a.toLocaleLowerCase('pt-BR'),b]));
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),targets=[];
 while(walker.nextNode()){
  const n=walker.currentNode,p=n.parentElement;if(!p||/^(SCRIPT|STYLE|TEXTAREA|INPUT|OPTION)$/.test(p.tagName))continue;
  const v=n.nodeValue;if(!v||v.length>500)continue;rx.lastIndex=0;
  if(rx.test(v))targets.push(n);if(targets.length>=1500)break;
 }
 for(const node of targets){rx.lastIndex=0;const v=node.nodeValue.replace(rx,(s,p,n)=>p+(map.get(n.toLocaleLowerCase('pt-BR'))||n));
  if(v!==node.nodeValue){node.nodeValue=v;displayEdits++}}
}
window.PokemonTorreV175Diagnostics=()=>({version:'176.0',source:data.source,
 typeCounts:Object.fromEntries(Object.entries(data.types).map(([k,a])=>[k,a.length])),
 speciesCount:Object.keys(data.species).length,lastSpecies,invalidSaved,displayEdits,
 visualFilesModified:false,protectedMoves:['Surf','Rain Dance','Bubble','Water Gun'],
 ownedMewtwoReviewCount:officialCatalogue({id:150,level:50,v3566MewtwoTest:true}).filter(x=>x.available).length,
 targetFor:(name)=>targetOf(name),
 sample:(id,level=50)=>officialCatalogue({id,level,v32Slots:null}).map(x=>({name:x.v175English,level:x.level,tm:x.tm,available:x.available}))});
queueMicrotask(()=>{trackModal();localize();});
})();
