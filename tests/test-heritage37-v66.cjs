'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const file=path.join(root,'effects/moves/_runtime/heritage-37-v66.js');
const code=fs.readFileSync(file,'utf8');
const context={window:{}};
vm.runInNewContext(code,context,{filename:file,timeout:2500});
const fx=context.window.PokemonTorreHeritage37;
assert.ok(fx&&fx.ACTIONS,'Missing exported renderer');
const keys=Object.keys(fx.ACTIONS);
assert.equal(keys.length,37,'Must render exactly 37 requested move ids');
const forbidden=['catalog_thunder','catalog_discharge','catalog_descarga','catalog_descargaeletrica',
'catalog_thunderwave','catalog_trovao','thunder','discharge','thunderwave'];
for(const key of forbidden)assert.equal(fx.accepts(key),false,'Protected move intercepted: '+key);
const approved=['catalog_nevasca','catalog_volttackle','catalog_stunspore',
'catalog_podosono','catalog_leechseed','catalog_esporos','catalog_triataque',
'catalog_faiscadopikachu','catalog_tempestadepsiquica','catalog_chicotedevinha',
'catalog_firespin','catalog_brasaviva'];
for(const key of approved)assert.equal(fx.accepts(key),false,'Approved move intercepted: '+key);
const methods=['save','restore','beginPath','moveTo','lineTo','stroke','closePath','fill',
'ellipse','arc','translate','rotate'];
let calls=0;const ctx={};for(const key of methods)ctx[key]=()=>{calls++;};
let painted=0;
for(const key of keys){
 assert.equal(fx.accepts(key),true,'No allowlist entry: '+key);
 for(let frame=0;frame<8;frame++){
  const state={from:[45,100],to:[175,100],duration:960,at:0,move:{name:fx.labels[key]}};
  const before=calls;
  const result=fx.paint(ctx,state,(frame+.5)/8,frame*100,.95,false,key);
  assert.ok(calls>before,'Move did not paint any visual: '+key+' frame '+frame);
  assert.equal(result,true,'Could not draw '+key+' frame '+frame);
  painted++;
 }
}
assert.equal(fx.paint(ctx,{from:[1,2],to:[3,4]},.5,0,1,false,'catalog_thunder'),false);
assert.equal(fx.inspect().failures,0,'Renderer threw an exception');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const end=fs.readFileSync(path.join(root,'effects/moves/_runtime/end.js'),'utf8');
assert.ok(index.includes('effects/moves/_runtime/heritage-37-v66.js'),'Loader missing V66');
const pos=index.indexOf('const fxFiles=[');
assert.ok(pos>=0,'Loader array absent');
const loader=index.slice(pos,index.indexOf('];let plugin=',pos));
assert.ok(loader.indexOf('heritage-37-v66.js')>=0&&loader.indexOf('heritage-37-v66.js')<loader.indexOf('effects/moves/_runtime/end.js'),'Wrong renderer ordering');
assert.ok(end.includes("heritage37V66.accepts(k)"),'Battle engine hook missing');
console.log('PASS: 37 isolated effects, 296 frame samples, protected moves untouched in allowlist');
