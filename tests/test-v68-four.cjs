'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const base=path.join(__dirname,'..'),s=[
 'core.js','dragon-pulse/index.js','aura-sphere/index.js','x-scissor/index.js','dragon-claw/index.js'
];
const ctx=vm.createContext({window:{},console});for(const p of s)vm.runInContext(
 fs.readFileSync(path.join(base,'effects/moves/v68-four',p),'utf8'),ctx,{filename:p,timeout:3000});
const fx=ctx.window.PokemonTorreFidelityFourV68;
assert.ok(fx,'v68 export');
const valid=['catalog_dragonpulse','catalog_aurasphere','catalog_xscissor','catalog_cortex','catalog_dragonclaw'];
assert.deepEqual([...fx.inspect().keys].sort(),[...valid].sort(),'Unexpected move intercepted');
for(const v of ['catalog_thunder','catalog_discharge','catalog_thunderwave','catalog_descarga','catalog_descargaeletrica',
 'catalog_trovao','catalog_volttackle','catalog_stunspore','catalog_esporos','catalog_leechseed','catalog_nevasca'])
 assert.equal(fx.accepts(v),false,'Protected: '+v);
let calls=0;
const fake={globalAlpha:1,globalCompositeOperation:'source-over'};
for(const k of ['save','restore','beginPath','moveTo','lineTo','closePath','fill','stroke','arc','ellipse','translate','rotate'])fake[k]=()=>{calls++};
fake.createRadialGradient=fake.createLinearGradient=()=>({addColorStop(){calls++}});
for(const key of valid){
 const sizes=[];
 for(let n=0;n<8;n++){
  const before=calls;
  assert.equal(fx.paint(fake,{from:[86,161],to:[588,161]},(n+.40)/8,n*170,1.15,false,key),true);
  const count=calls-before;assert.ok(count>0,key+' blank frame '+n);sizes.push(count);
 }
 assert.ok(new Set(sizes).size>=4,'Not enough visual variation: '+key);
}
const dragon=fs.readFileSync(path.join(base,'effects/moves/v68-four/dragon-pulse/index.js'),'utf8');
assert.ok(dragon.includes('beam(g,')&&dragon.includes('spinRing('),'Dragon Pulse lacks reference beam/coil');
assert.ok(!dragon.includes('dragon head')&&!dragon.includes('serpentine blast'),'Old cartoon Dragon Pulse detected');
const scissor=fs.readFileSync(path.join(base,'effects/moves/v68-four/x-scissor/index.js'),'utf8');
assert.ok(scissor.includes('ribbon(g,...path1')&&scissor.includes('ribbon(g,...path2'),'X-Scissor not two passes');
const preview=fs.readFileSync(path.join(base,'previews/v68-4-golpes-referencia.html'),'utf8');
for(const p of s)assert.ok(preview.includes('/v68-four/'+p));
console.log('PASS V68: 4 effects, both X-Scissor aliases, 40 frames, beam/coils, protected move isolation');
