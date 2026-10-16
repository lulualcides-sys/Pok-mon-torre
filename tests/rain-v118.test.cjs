'use strict';
/* Rain Dance restored using exact original V35.64 PMD PNG frames.
 * Normal casts respect native engine, no duplicated weather pass.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const script=fs.readFileSync('effects/moves/raindance-original-v118.js','utf8');
const legacy=fs.readFileSync('parts/p019.txt','utf8');
const s0=legacy.indexOf('const SRC={"weather_embers_00"'),s1=legacy.indexOf(';\n const sprites={}',s0);
assert.ok(s0>0&&s1>s0);
const source=JSON.parse(legacy.slice(s0+'const SRC='.length,s1));
const z0=script.indexOf(' const originalFrames='),z1=script.indexOf(';\n const nameKey=',z0);
assert.ok(z0>=0&&z1>z0);
const rain=JSON.parse(script.slice(z0+' const originalFrames='.length,z1));
assert.equal(Object.keys(rain).length,10);
for(let i=0;i<10;i++){
 const k='weather_rain_'+String(i).padStart(2,'0');
 assert.equal(rain[k],source[k],'Frame must be EXACT original PMD '+k);
}
assert.ok(!script.includes('hue-rotate')&&!script.includes('ImageDraw'));
assert.ok(!script.includes('.hp=')&&!script.includes('hitTarget('));
const html=fs.readFileSync('index.html','utf8');
assert.ok(html.includes('effects/moves/raindance-original-v118.js'));
function simulation(nativePaint){
 const weather={framesDrawn:0},drawCalls=[],battle={active:true,energy:50,v32Weather:'clear'};
 const cooldowns=[0,0,0,0],stats={casts:0,others:0};
 const current=()=>({id:25,hp:100});
 let selected={name:'Rain Dance',cat:'status',power:0,cost:6,cd:3400};
 class Image{
  constructor(){this.complete=true;this.naturalWidth=298;this.naturalHeight=200;this.decoding='async';}
  set src(value){this._src=value;}
  get src(){return this._src}
 }
 class Engine{
  constructor(){this.ctx={drawImage:(...args)=>drawCalls.push(args),save(){},restore(){},beginPath(){},rect(){},clip(){},imageSmoothingEnabled:true,globalAlpha:1};
   this.w=480;this.h=380;}
  useMove(slot){
   if(selected.name!=='Rain Dance'&&selected.name!=='Dança da Chuva'){stats.others++;return 'other';}
   if(!battle.active||battle.energy<selected.cost||cooldowns[slot]>1000)return false;
   battle.energy-=selected.cost;cooldowns[slot]=3000;
   stats.casts++;return true;
  }
  draw(){
   if(nativePaint&&battle.v32Weather==='rain')weather.framesDrawn++;
   return 'native-draw';
  }
 }
 const window={PokemonTorreV3564WeatherDiagnostics:()=>({...weather})};
 const context={BattleEngine:Engine,Image,window,location:{search:'',hostname:'testhost'},battle,current,
  skillSet:()=>[selected],cooldowns,performance:{now:()=>1000},console,Number,String,Math,Array,Object,Set,URLSearchParams};
 vm.runInNewContext(script,vm.createContext(context),{timeout:2500});
 const engine=new Engine();
 const api=window.PokemonTorreRainDanceV118;
 assert.equal(api.installed,true);
 assert.equal(api.source,'Original V35.64 PMD weather_rain_00..09');
 assert.equal(api.matches('Rain Dance'),true);
 assert.equal(api.matches('Dança da Chuva'),true);
 assert.equal(api.matches('Danca da Chuva'),true);
 assert.equal(api.matches('Raiva Dance'),false);
 assert.equal(api.matches('Sunny Day'),false);
 assert.equal(engine.useMove(0),true);
 assert.equal(battle.v32Weather,'rain');
 assert.equal(stats.casts,1);
 assert.equal(battle.energy,44);
 assert.equal(cooldowns[0],3000);
 assert.equal(engine.draw(1333),'native-draw');
 const state=api.diagnostics();
 assert.equal(state.activations,1);
 assert.equal(state.frameCount,10);
 assert.equal(state.framesReady,10);
 if(nativePaint){
  assert.equal(state.originalRendererFrames,1,'Do not duplicate the existing PMD rain');
  assert.equal(state.fallbackFrames,0);
  assert.equal(drawCalls.length,0);
 }else{
  assert.equal(state.fallbackFrames,1,'Must restore PMD rain from original sprites');
  assert.equal(drawCalls.length,12,'3x4 screen-spread original frames');
  assert.ok(drawCalls.every(row=>row[0].src.startsWith('data:image/png;base64,')));
 }
 battle.v32Weather='sun';
 const n=drawCalls.length;
 engine.draw(1500);
 assert.equal(drawCalls.length,n,'Do not change Sunny Day');
 const e=battle.energy;
 const y=engine.useMove(0);
 assert.equal(y,false,'Original cooldown respected');
 assert.equal(battle.energy,e);
 assert.equal(battle.v32Weather,'sun','Blocked cast must not change weather');
 assert.equal(api.diagnostics().blocked,1);
 selected={name:'Surf',power:90,cost:20};
 assert.equal(engine.useMove(1),'other');
 assert.equal(battle.v32Weather,'sun','Other moves are isolated');
 return state;
}
simulation(true);
simulation(false);
console.log('PASS V118 Rain Dance: 10 EXACT original PMD weather sprites, native renderer no double rain, fallback original PNG sequence, safe cooldown/energy, Sun/Surf unaffected');
