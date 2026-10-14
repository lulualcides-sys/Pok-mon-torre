'use strict';
// V49 final regression: 4 live moves, 8 phases, tight outlines and zero giant SVGs.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const files=[
 'effects/moves/_runtime/electric-sprite-kit.js',
 'effects/moves/faisca/index.js',
 'effects/moves/discharge/index.js',
 'effects/moves/tempestade-de-raios/index.js',
 'effects/moves/trovao/index.js'
];
const src=files.map(read).join('\n');
new vm.Script(src,{filename:'ElectricCinematicV48'});
class TestImage {
 constructor(){this.naturalWidth=124;this.naturalHeight=224;}
 set src(value){this.url=value;}
}
class TestContext {
 constructor(){this.strokes=[];this.stamps=0;this.pending=0;this.coords=[];this.maxLineWidth=0;}
 save(){}restore(){}translate(){}rotate(){}scale(){}
 drawImage(){this.stamps++;}
 beginPath(){this.pending=0;}
 moveTo(x,y){this.pending++;this.coords.push([x,y]);}
 lineTo(x,y){this.pending++;this.coords.push([x,y]);}
 arc(x,y,r){this.coords.push([x-r,y-r],[x+r,y+r]);}
 fill(){}
 stroke(){this.strokes.push({color:this.strokeStyle,width:this.lineWidth,points:this.pending});this.maxLineWidth=Math.max(this.maxLineWidth,this.lineWidth||0);}
}
const context=vm.createContext({Image:TestImage,console,window:{}});
vm.runInContext(src,context);
const kit=vm.runInContext('electricSpriteV46',context);
assert.equal(kit.diagnostics().registered.length,4);
assert.equal(typeof kit.cinematic,'function');
const cases=[
 ['Faísca','faisca',980],
 ['Discharge','discharge',1550],
 ['Tempestade de Raios','tempestade',2450],
 ['Trovão','trovao',2100]
];
const report=[];
for(const [name,kind,duration] of cases){
 const g=new TestContext();
 const fx={move:{name},from:[140,320],to:[370,210],actor:[325,235],at:1200,duration};
 const phaseSizes=[];
 for(let i=0;i<8;i++){
  const before=g.strokes.length;
  const now=fx.at+duration*(i+.5)/8;
  assert.equal(kit.paint(g,fx,now,{h:560}),true,name+' paints frame '+(i+1));
  phaseSizes.push(g.strokes.length-before);
  assert.ok(kit.diagnostics().stamps['phase-'+kind+'-'+(i+1)]>=1,
   name+' draws exact storyboard phase '+(i+1));
 }
 assert.ok(g.strokes.some(x=>x.color==='#090717'),name+' uses black ink outline');
 assert.ok(g.strokes.some(x=>x.color==='#ffffff'),name+' uses white-hot lightning core');
 assert.equal(g.stamps,0,name+' must not paint stacked V47/V48 bolt SVGs');
 assert.ok(g.maxLineWidth<16,name+' draws clean fine lightning, not huge cable-like strokes');
 assert.ok(g.coords.every(([x,y])=>Number.isFinite(x)&&Number.isFinite(y)),'No non-finite particle coordinates');
 assert.ok(phaseSizes.filter(x=>x>0).length>=7,name+' changes through at least seven phases');
 assert.ok(new Set(phaseSizes).size>=3,name+' has distinct animation rhythms');
 report.push({name,phaseSizes,strokes:g.strokes.length,spritePasses:g.stamps});
}
const kitSource=read(files[0]);
assert.doesNotMatch(kitSource,/setInterval|setTimeout/,'No background timers or ticker leaks');
const html=read('index.html');
for(const f of files)assert.ok(html.includes(f),'The game loader must include '+f);
console.log('PASS V49 FINAL: 32 moving phases, tiny outlined lightning, no giant pasted sprites');
console.log(JSON.stringify(report));
