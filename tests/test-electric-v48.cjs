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
 constructor(){this.blits=[];this.strokes=0;}
 save(){}restore(){}translate(){}rotate(){}scale(){}
 drawImage(img,...args){this.blits.push({src:img.url,args});}
 beginPath(){}moveTo(){}lineTo(){}arc(){}fill(){}
 stroke(){this.strokes++;}
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
  const before=g.blits.length;
  const now=fx.at+duration*(i+.5)/8;
  assert.equal(kit.paint(g,fx,now,{h:560}),true,name+' paints frame '+(i+1));
  const added=g.blits.slice(before);
  phaseSizes.push(added.length);
  assert.ok(kit.diagnostics().stamps['phase-'+kind+'-'+(i+1)]>=1,
   name+' draws storyboard phase '+(i+1));
  assert.ok(added.some(b=>b.src.includes('/sprites/frame_'+String(i+1).padStart(2,'0')+'.png')),
   name+' uses an individual authored frame '+(i+1));
  assert.ok(added.every(b=>!b.src.includes('.svg')),'Old SVG lightning prohibited');
 }
 assert.equal(g.strokes,0,'No Canvas line art allowed');
 assert.ok(g.blits.some(b=>b.src.includes('/impact/hit_')),'Draw real transparent impacts');
 assert.ok(g.blits.every(b=>b.args.every(Number.isFinite)),'Image drawing bounds are finite');
 assert.ok(g.blits.every(b=>b.args[2]<=220&&b.args[3]<=260),
  'Effects stay within mobile arena proportions');

 report.push({name,phaseSizes,strokes:g.strokes.length,spritePasses:g.stamps});
}
const kitSource=read(files[0]);
assert.doesNotMatch(kitSource,/setInterval|setTimeout/,'No background timers or ticker leaks');
const html=read('index.html');
for(const f of files)assert.ok(html.includes(f),'The game loader must include '+f);
console.log('PASS V50: 32 authored PNG animation frames, real impact images, no runtime Canvas strokes');
console.log(JSON.stringify(report));
