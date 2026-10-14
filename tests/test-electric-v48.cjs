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
assert.equal(kit.diagnostics().version,'52.0','Must run newest electric V52 engine');
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
 if(kind==='discharge'){
  const links=g.blits.filter(b=>b.src.includes('/arcs/arc_'));
  assert.ok(links.length>=4,'Discharge must connect actor to target with animated lightning assets');
  assert.ok(links.some(b=>b.args[2]>100),'Bolt visibly travels toward the opponent');
  assert.equal(kit.diagnostics().arcsReady,8,'Every directional arc frame is preloaded');
 }
 assert.ok(g.blits.every(b=>b.args.every(Number.isFinite)),'Image drawing bounds are finite');
 assert.ok(g.blits.every(b=>b.args[2]<=600&&b.args[3]<=340),
  'Effects stay within mobile arena proportions');

 report.push({name,phaseSizes,strokes:g.strokes,blits:g.blits.length});
}
const kitSource=read(files[0]);
assert.doesNotMatch(kitSource,/setInterval|setTimeout/,'No background timers or ticker leaks');
const html=read('index.html');
for(const f of files)assert.ok(html.includes(f),'The game loader must include '+f);
// An actual PNG sequence is required; a painted string or stale SVG does not count.
const moveDirs=['faisca','discharge','tempestade-de-raios','trovao'];
for(const dir of moveDirs){
 const original=[];
 for(let i=1;i<=8;i++){
  const image=read; // Use Buffer directly to verify real file bytes, not source strings.
  const p='effects/moves/'+dir+'/sprites/frame_'+String(i).padStart(2,'0')+'.png';
  const data=fs.readFileSync(path.join(root,p));
  assert.deepEqual([...data.subarray(0,8)],[137,80,78,71,13,10,26,10],p+' must be real PNG');
  assert.equal(data.readUInt32BE(16),280,'PNG authored width');
  assert.equal(data.readUInt32BE(20),320,'PNG authored height');
  original.push(data.toString('base64'));
 }
 assert.equal(new Set(original).size,8,dir+' must have eight different frames');
 for(let i=1;i<=4;i++){
  const p='effects/moves/'+dir+'/impact/hit_'+String(i).padStart(2,'0')+'.png';
  assert.ok(fs.statSync(path.join(root,p)).size>600,'real impact sprite '+p);
 }
}
assert.ok(read('index.html').includes('Carregando sprites elétricos finais'),'Asset preflight must run before battle');
const arcs=[];
for(let i=1;i<=8;i++){
 const p='effects/moves/discharge/arcs/arc_'+String(i).padStart(2,'0')+'.png';
 const data=fs.readFileSync(path.join(root,p));
 assert.equal(data.readUInt32BE(16),384,'Directional sprite width must be 384px');
 assert.equal(data.readUInt32BE(20),144,'Directional sprite height must be 144px');
 arcs.push(data.toString('base64'));
}
assert.equal(new Set(arcs).size,8,'All directional discharges must animate');
assert.ok(read('index.html').includes('/arcs/arc_'),'Target arcs preloaded before combat');
assert.doesNotMatch(read('effects/moves/_runtime/combat-hit-reliability-v47.js'),/gameVersion\.textContent='ACERTO REAL V47/,'Footer cannot display legacy combat engine version');


console.log('PASS V52: all four sprite animations, 8 animated target-reaching Discharge arcs, no old V47 footer');
console.log(JSON.stringify(report));
