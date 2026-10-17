'use strict';
/* V144: checks actual user-supplied raster sprite atlas + Pixi battle bridge.
 * Four earlier V143 approved/saved sprites remain untouched.
 */
const fs=require('node:fs'),crypto=require('node:crypto'),vm=require('node:vm'),assert=require('node:assert/strict');
const get=x=>fs.readFileSync(x,'utf8');
const atlas=fs.readFileSync('effects/moves/v144-flying-original/atlas.png');
assert.equal(atlas.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
assert.equal(atlas.readUInt32BE(16),768);assert.equal(atlas.readUInt32BE(20),384);
assert.equal(crypto.createHash('sha256').update(atlas).digest('hex'),
 'b59bfadee158fa3dde8895a1ebc36cdae8022dca3b610ba81ac8c575694327d5',
 'cropped 32 original user sprite frames must remain unchanged');
assert.ok(atlas.length>3000&&atlas.length<15000,'authentic atlas must remain mobile lightweight');
const runtime=get('effects/moves/v144-flying-original/runtime.js');
const pixi=get('effects/moves/_runtime/pixi-layer.js');
const html=get('index.html');
const native=get('parts/p013.txt');
const approvals=JSON.parse(get('effects/moves/STATUS_APROVADOS.json')).moves;
assert.equal(approvals.length,46,'preserve V143 saved status count');
for(const name of ['Roost','Rajada','Bicada','Air Slash'])
 assert.ok(approvals.some(x=>x.move===name&&x.protect&&x.visual_scale_factor===.2),'V143 protected '+name);
for(const name of ['Bico Broca','Vendaval','Aerocorte','Pique'])
 assert.ok(!approvals.some(x=>x.move===name),'no fake approval for a V144 preview');
assert.doesNotThrow(()=>new vm.Script(runtime));
assert.doesNotMatch(runtime,/getContext\s*\(|drawImage\s*\(|requestAnimationFrame\s*\(|drawCatalogMove\s*\(|fillRect\s*\(/);
assert.match(pixi,/root\.scale\.set\(\(spec\.flying144\|\|spec\.flying145\)\?1:\.20\)/);
assert.match(pixi,/atlasFrame=\(spec\.frameStart\|\|0\)\+i/);
assert.match(pixi,/PIXI\.SCALE_MODES\.NEAREST:PIXI\.SCALE_MODES\.LINEAR/);
assert.match(pixi,/PokemonTorreFlyingOriginalV144/);
assert.match(native,/PokemonTorreFlyingOriginalV144/);
assert.ok(html.includes('effects/moves/v144-flying-original/runtime.js'));
assert.ok(html.includes("get('flying144')!=='0'"));
assert.ok(html.includes("get('safe')!=='1'"));
assert.ok(html.indexOf('effects/moves/v136-flying-pixel/runtime.js')<
          html.indexOf('effects/moves/v144-flying-original/runtime.js'));
const names=['Bico Broca','Vendaval','Aerocorte','Pique'];
const battle={active:true,energy:100};
const current=()=>({hp:99}),skillSet=()=>names.map(name=>({name,cd:1500,power:29,cost:7}));
class ImageMock{
 naturalWidth=768;naturalHeight=384;decoding='async';
 set src(v){this._src=v;this.onload?.();}
 get src(){return this._src;}
}
let mounts=[],fallbackCalls=0;
class BattleEngine{
 constructor(){this.player={x:140,y:190};this.enemy={x:310,y:220};
  this.canvas={isConnected:true};this.v359Attacks=[];}
 useMove(slot){battle.energy-=7;const move=skillSet()[slot];
  this.v359Attacks.push({move,battle,at:1000,end:1800,duration:800,from:[140,180],to:[310,200],times:[.64],hits:0});
  return true;
 }
}
function build(query=''){
 const window={PokemonTorrePixelFlyingBridge:{
  mountPixelFlying:(engine,fx,spec)=>{assert.equal(spec.image.naturalWidth,768);mounts.push(spec);return true;},
  diagnostics:()=>({gpu:true})
 },PokemonTorreV360Paint:()=>{fallbackCalls++;return false}};
 const context={window,Image:ImageMock,BattleEngine,skillSet,current,battle,URLSearchParams,
 location:{search:query},console};
 vm.runInNewContext(runtime,context,{timeout:4000});
 return window;
}
assert.equal(build('?flying144=0').PokemonTorreFlyingOriginalV144,undefined);
assert.equal(build('?safe=1').PokemonTorreFlyingOriginalV144,undefined);
const plugin=build('');
assert.equal(plugin.PokemonTorreFlyingOriginalV144.diagnostics().ready,4);
assert.deepEqual([...plugin.PokemonTorreFlyingOriginalV144.moves],names);
const engine=new BattleEngine();
const durations=[1270,1610,1270,1070];
for(let i=0;i<4;i++){
 const old=engine.v359Attacks.length,energy=battle.energy;
 assert.equal(engine.useMove(i),true);
 const fx=engine.v359Attacks[old];
 assert.equal(battle.energy,energy-7,'native energy changed');
 assert.equal(fx.duration,durations[i]);
 assert.equal(fx.times.length,1,'V144 must not damage twice');
 assert.equal(plugin.PokemonTorreV360Paint(new Proxy({}, {get(){throw Error('No Canvas 2D')} }),fx,1100,engine),true);
 assert.equal(mounts.at(-1).frameStart,i*8,'wrong row from original sprite atlas');
 assert.equal(mounts.at(-1).frameSize,96);
 assert.equal(mounts.at(-1).flying144,true);
}
assert.equal(plugin.PokemonTorreFlyingOriginalV144.diagnostics().casts,4);
assert.equal(plugin.PokemonTorreFlyingOriginalV144.diagnostics().mounted,4);
assert.equal(fallbackCalls,0);
assert.equal(plugin.PokemonTorreV360Paint({}, {move:{name:'Roost'}},1100,engine),false);
assert.equal(fallbackCalls,1,'old saved visual must remain delegated');
console.log('PASS V144: 32 authentic extracted sprite frames, 4 battle mounts, separate GPU rows, no procedural visuals, V143 protected.');
