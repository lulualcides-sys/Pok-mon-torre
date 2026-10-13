'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('index.html');
const files=[
'effects/moves/_runtime/water-sprite-kit.js',
'effects/moves/skull-bash/index.js',
'effects/moves/tsunami/index.js',
'effects/moves/amnesia/index.js',
'effects/moves/hydro-pump/index.js',
'effects/moves/aqua-jet/index.js',
'effects/moves/water-pulse/index.js',
'effects/moves/aqua-tail/index.js',
'effects/moves/water-gun/index.js',
'effects/moves/_runtime/water-sprite-integrate.js'
];
for(const f of files)assert.ok(html.includes('"'+f+'"'),'Missing water module in production loader '+f);
const png=fs.readFileSync(path.join(root,'effects/moves/water-original/water-original-v43-atlas.png'));
assert.equal(png.toString('hex',0,8),'89504e470d0a1a0a','Source water atlas must be a genuine PNG');
assert.equal(png.readUInt32BE(16),240,'Atlas must be 5 x 48px');
assert.equal(png.readUInt32BE(20),192,'Atlas must be 4 x 48px');
assert.match(read(files[0]),/source\.src='effects\/moves\/water-original\/water-original-v43-atlas\.png\?v=43\.1'/);
// V44: only the three rejected moves were rewritten; Skull Bash stays approved.
const skull=read('effects/moves/skull-bash/index.js');
assert.match(skull,/key:'skullBash',duration:1120,contact:true/);
const tsunami=read('effects/moves/tsunami/index.js');
const amnesia=read('effects/moves/amnesia/index.js');
const pump=read('effects/moves/hydro-pump/index.js');
const thought=read('effects/moves/amnesia/thought.svg');
assert.match(thought,/<svg[^>]+shape-rendering="crispEdges"/,'Amnesia must use real pixel-art symbol');
assert.match(tsunami,/waterWall:true/,'Tsunami is a real vertical advancing wave');
assert.match(tsunami,/tsunamiWaveV442/,'Animated Tsunami sprite must load independently');
assert.match(tsunami,/const strips=22/,'Tsunami must animate at least 22 columns of its own wave');
assert.match(tsunami,/const faceStrips=12/,'Angled front of Tsunami must animate independently');
assert.match(tsunami,/perspectiveFront:true/,'Tsunami must use three-quarter perspective');
assert.match(tsunami,/edgeDepth=/,'Original crest needs depth projection');
assert.match(tsunami,/tsunamiFrontV443\.src/,'Tsunami front sprite must be loaded independently');
assert.match(read('effects/moves/tsunami/front.svg'),/<svg[^>]+shape-rendering="crispEdges"/,
 'Frontal pixel-art wave must remain a genuine crisp sprite');
assert.match(tsunami,/Math\.sin\(ms\*\.007\+i\*\.46\)/,'Wave crest columns must have temporal deformation');
assert.match(read('effects/moves/tsunami/wave.svg'),/<svg[^>]+shape-rendering="crispEdges"/,'Wave must be pixel art');
assert.match(pump,/pressureStream:true/,'Hydro Pump has its own continuous jet');
assert.match(pump,/hydroJetV442/,'Hydro Pump sprite must load independently');
assert.match(pump,/for\(const side of \[-1,1\]\)/,'Exactly two mirrored streams');
assert.match(pump,/const offset=side\*converge/,'Both streams must converge at common point');
assert.match(pump,/if\(head>joinAt\)/,'Streams must connect into shared tip');
assert.match(pump,/joinAt=\.62/,'Both jets must connect before two-thirds of the travel distance');
assert.match(pump,/const converge=1-ease\(\(u-\.19\)\/\(joinAt-\.19\)\)/,
 'Hydro Pump must start merging early, not immediately before opponent');
assert.match(read('effects/moves/hydro-pump/jet.svg'),/<svg[^>]+shape-rendering="crispEdges"/,'Jet must be pixel art');
assert.match(amnesia,/amnesiaMarkV44\.src/,'Amnesia loads its own question-mark sprite');
assert.doesNotMatch(amnesia,/draw\(g,/,'Amnesia must not paint water at all');
assert.match(read(files[0]),/version:'45\.0'/);
const source=files.map(read).join('\n');
const fxMatch=html.match(/const fxFiles=(\[[^;]+?\]);let plugin=/);
const fsMatch=html.match(/const fireSpriteFiles=(\[[\s\S]*?\]);\s*const fireSpriteSections=/);
const newMatch=html.match(/const nextFourFireMoves=(\[[\s\S]*?\]);\s*const extraFireSections=/);
assert.ok(fxMatch&&fsMatch&&newMatch,'Preserved fire and game module bundles required');
const moduleFiles=JSON.parse(fxMatch[1]);
const fireOld=JSON.parse(fsMatch[1]),fireNew=JSON.parse(newMatch[1]);
const base=Array.from({length:25},(_,i)=>read('parts/p'+String(i).padStart(3,'0')+'.txt')).join('');
const insertion='\nrender();\n})();\n</script>';
const all=[...moduleFiles,...fireOld.slice(0,-1),...fireNew,fireOld.at(-1),...files];
const code=base.replace(insertion,'\n'+all.map(read).join('\n')+'\n'+insertion);
assert.notEqual(code,base);
new vm.Script(code.slice(code.indexOf('<script>')+8,code.indexOf('</script>')),{filename:'PokemonTorreV43AllParts'});
new vm.Script(html.slice(html.indexOf('<script>')+8,html.indexOf('</script>')),{filename:'V43Loader'});
console.log('PASS: 25 game parts + all previous fire attacks + 4 water modules compile');
for(const p of files.slice(1,-1)){
 const s=read(p);
 assert.doesNotMatch(s,/\.(?:fillRect|arc|lineTo|createRadialGradient|createLinearGradient)\s*\(/,'No generic Canvas VFX in '+p);
 assert.match(s,/waterSpriteV43\.add\(/);
}
const moves=['Skull Bash','Tsunami','Amnesia','Hydro Pump'];
let now=1000,draws=[],damages=0;
const battle={active:true,energy:200,paused:false},mon={id:150},opponent={id:25};
const cooldowns=[0,0,0,0],desc=moves.map(name=>({name,cost:10,cd:1300,kind:name==='Amnesia'?'status':'beam'}));
class ImageMock{
 constructor(){this.naturalWidth=0;this.naturalHeight=0;}
 set src(s){this.path=s;this.naturalWidth=s.includes('water-original')?240:576;this.naturalHeight=s.includes('water-original')?192:216;this.onload?.();}
}
class Graphics{
 constructor(){this.pos=[0,0,0];this.stack=[];}
 save(){this.stack.push([...this.pos]);}
 restore(){this.pos=this.stack.pop()||[0,0,0];}
 translate(x,y){this.pos[0]+=x;this.pos[1]+=y;}
 rotate(r){this.pos[2]+=r;}
 scale(){}
 drawImage(img,...args){draws.push({img:img.path,args,tx:this.pos[0],ty:this.pos[1],angle:this.pos[2]});}
}
class Engine{
 constructor(){this.h=560;this.w=940;this.player={x:190,y:350};this.enemy={x:680,y:250};this.ctx=new Graphics();this.v359Attacks=[];this.particles=[];this.rings=[];this.v19Impacts=[];this.v19Beams=[];this.v26Particles=[];}
 useMove(i){
  if(now<cooldowns[i])return false;
  cooldowns[i]=now+1300;battle.energy-=10;
  if(desc[i].kind==='status'){
    this.v3568StatusFX=[{move:{name:desc[i].name}}];
    this.particles.push({x:190,y:350,color:'#abc'});
  }else{
    this.v359Attacks.push({move:{name:desc[i].name},at:now,battle});
  }
  damages+=desc[i].kind==='status'?0:10;
  return true;
 }
 draw(){return true;}
}
const engine=new Engine();
const env={waterSpriteV43AtlasData:'',BattleEngine:Engine,Image:ImageMock,
 performance:{now:()=>now},battle,cooldowns,engine,console,
 window:{PokemonTorreV360Paint:()=>false,PokemonTorreFireSpriteV42:()=>({version:'42.5'})},
 current:()=>mon,foe:()=>opponent,skillSet:()=>desc,
 document:{getElementById:()=>null}};
vm.runInNewContext(source,env,{filename:'water-sprite-v43.js'});
assert.equal(typeof env.window.PokemonTorreWaterV43,'function');
const diagnostics=env.window.PokemonTorreWaterV43;
assert.equal(diagnostics().waterReady,true);
assert.equal(diagnostics().psychicReady,true);
assert.equal(diagnostics().registered.length,8);
assert.equal(diagnostics().version,'45.0','Published water version must be V45');
for(let i=0;i<4;i++){
 now=1000+i*4000;
 const before=draws.length;
 assert.equal(engine.useMove(i),true,moves[i]+' should accept valid cast');
 assert.equal(env.window.PokemonTorreV360Paint(engine.ctx,{move:{name:moves[i]}},now,engine),true,'Old attack visuals blocked');
 engine.draw(now+520);
 assert.ok(draws.length>before,moves[i]+' must draw ORIGINAL atlas sprites');
}
assert.equal(damages,30,'Status cast deals no damage; offensive casts unchanged');
assert.equal(diagnostics().originalFire,'42.5');
assert.ok(diagnostics().contactFrames>0,'Skull Bash player dashes for physical contact');
assert.equal(engine.player.x,190,'Physical dash must restore the player position');
assert.equal((engine.v3568StatusFX||[]).length,0,'Old Amnesia overlay suppressed');
assert.ok(draws.some(f=>f.img.includes('water-original')),'Actual original water source sprites drawn');
assert.ok(draws.some(f=>f.img.includes('psychic-original')),'Amnesia uses approved psychic original sprite');

// V44: test at peak animation: NO more tiny strips, dispersed bubbles or
// psychic orbit explosion; each cast must stamp its own source sprites.
now=31000;
engine.useMove(1); // Tsunami
let startFrame=draws.length;
engine.draw(now+1140);
let tsunamiDraws=draws.slice(startFrame);
assert.ok(tsunamiDraws.some(x=>x.img.includes('tsunami/wave.svg')),
 'The advancing Tsunami must render a single real full-height wave');
const waveStrips=tsunamiDraws.filter(x=>x.img.includes('tsunami/wave.svg'));
const frontWave=tsunamiDraws.filter(x=>x.img.includes('tsunami/front.svg'));
assert.equal(frontWave.length,12,'Front wave must form a 12-column visible rolling face');
assert.ok(frontWave.every(x=>x.args[3]===200),
 'Frontal wave must use entire true 3/4-angle sprite height');
assert.ok(frontWave.some(x=>x.args[7]>=160),
 'Front wave face must have substantial depth and not be a thin side profile');
assert.equal(waveStrips.length,22,'Tsunami now bends its own wave in 22 separate strips');
assert.ok(waveStrips.every(x=>x.args[2]<30&&x.args[6]<45),
 'No single giant rigid PNG should be stretched over the arena');
engine.draw(now+1210);
const waveStripsAfter=draws.slice(startFrame).filter(x=>x.img.includes('tsunami/wave.svg')).slice(-22);
assert.ok(waveStrips.some((x,i)=>x.args[5]!==waveStripsAfter[i].args[5]),
 'Tsunami contour must CHANGE during the cast, not just translate once');
now=35000;
engine.useMove(3); // Hydro Pump
startFrame=draws.length;
engine.draw(now+930);
let hydroDraws=draws.slice(startFrame);
assert.ok(hydroDraws.some(x=>x.img.includes('hydro-pump/jet.svg')),
 'Hydro Pump should render its real single-piece water sprite');
const twinJets=hydroDraws.filter(x=>x.img.includes('hydro-pump/jet.svg'));
assert.equal(twinJets.length,27,'Two equal 13-section jets must merge into one short section');
const upper=twinJets.slice(0,13),lower=twinJets.slice(13,26);
const joinPoint=twinJets[26];
const ratioFromActor=(joinPoint.tx-engine.player.x)/(engine.enemy.x-engine.player.x);
assert.ok(Math.abs(ratioFromActor-.62)<.02,
 'Jets must meet at 62% of the battlefield, not next to the target');
assert.ok(joinPoint.tx<engine.enemy.x-155,
 'Shared stream must begin visibly well before reaching the enemy');
assert.ok(Math.hypot(upper[0].tx-lower[0].tx,upper[0].ty-lower[0].ty)>=25,
 'The two jets must visibly begin SEPARATED');
assert.ok(Math.hypot(upper[12].tx-lower[12].tx,upper[12].ty-lower[12].ty)<8,
 'The two thin jets must JOIN near the target');
assert.ok(upper.every((x,i)=>Math.abs(x.args[7]-lower[i].args[7])<.01),
 'Both jet lanes must be the SAME thickness');
assert.ok(twinJets.every(x=>x.args[7]<=23),
 'Both Hydro Pump jets must stay THIN (not another fat laser)');
now=39000;
engine.useMove(2); // Amnesia
startFrame=draws.length;
engine.draw(now+990);
const amnesiaDraws=draws.slice(startFrame);
assert.ok(amnesiaDraws.some(x=>x.img.includes('amnesia/thought.svg')),
 'Amnesia must show dedicated crisp pixel-art question marks');
assert.ok(amnesiaDraws.every(x=>!x.img.includes('water-original')),
 'Amnesia must never use water splashes');
assert.ok(amnesiaDraws.some(x=>x.img.includes('psychic-original')),
 'Amnesia keeps approved authentic psychic accents');
assert.equal(engine.player.x,190,'Skull Bash movement restored as before');
console.log('PASS: V44.3 Tsunami with animated 3/4 angled front; twin Hydro jets merge at 62%; Amnesia and Skull Bash unchanged');


// V45 — four NEW sprites/animations must run independently, not replace
// the previously approved four, and their aliases must resolve.
const newPaths=[
 'effects/moves/aqua-jet/index.js',
 'effects/moves/water-pulse/index.js',
 'effects/moves/aqua-tail/index.js',
 'effects/moves/water-gun/index.js'
];
const newNames=['Aqua Jet','Pulso d’Água','Cauda de Água','Jato d’Água'];
const descriptors=['aquaJet','waterPulse','aquaTail','waterGun'];
for(let i=0;i<4;i++){
 const contents=read(newPaths[i]);
 assert.match(contents,new RegExp("key:'"+descriptors[i]+"'"));
 assert.doesNotMatch(contents,/\.(?:arc|fillRect|lineTo|stroke|createLinearGradient|createRadialGradient)\s*\(/,
  'New moves must be rendered using genuine sprite frames, not generic CSS/Canvas');
 desc.push({name:newNames[i],cost:10,cd:1300,kind:'bolt'});
 cooldowns.push(0);
}
assert.match(read(newPaths[1]),/orbPulse:true/,'Water Pulse must be a rotating orb');
assert.match(read(newPaths[0]),/contactStyle:'surge'/,'Aqua Jet requires physical dash');
assert.match(read(newPaths[2]),/contactStyle:'tail'/,'Aqua Tail is physical contact');
assert.match(read(newPaths[3]),/stream:true/,'Jato d’Água is a SINGLE slim jet');
assert.match(read(newPaths[3]),/water-gun-45/,'Water Gun uses dedicated stream cache');
const priorDamages=damages;
const priorCast=diagnostics().castsAccepted;
for(let i=4;i<8;i++){
 now=44000+(i-4)*4100;
 const before=draws.length;
 const beforeX=engine.player.x;
 assert.equal(engine.useMove(i),true,'V45 new move accepted: '+newNames[i-4]);
 assert.equal(env.window.PokemonTorreV360Paint(engine.ctx,{move:{name:newNames[i-4]}},now,engine),true,
  'Generic old painter must NOT draw '+newNames[i-4]);
 engine.draw(now+(i===5?850:i===7?690:600));
 assert.equal(engine.player.x,beforeX,'Player coordinates restored after '+newNames[i-4]);
 assert.ok(draws.length>before,'Original source pixel sprites must draw for '+newNames[i-4]);
 const current=engine.v43WaterFX.at(-1);
 assert.equal(current.move.name,newNames[i-4]);
 if(i===4||i===6){
  assert.ok(current.actor&&current.actor[0]>beforeX+45,
   'Pokemon actually charges forward for '+newNames[i-4]);
 }
 if(i===5)assert.ok(draws.slice(before).length>=20,
  'Water Pulse must display animated rings instead of static flat PNG');
 if(i===7){
  assert.ok(draws.slice(before).some(x=>x.img?.includes('hydro-pump/jet.svg')),
   'Jato d’Água must show a continuous but THIN source-sprite water jet');
 }
}
assert.equal(damages,priorDamages+40,'Each NEW offensive move keeps normal damage');
assert.equal(diagnostics().registered.length,8,'Four approved + four new moves are independent');
assert.equal(diagnostics().castsAccepted,priorCast+4,'Each new move casts once');
assert.equal(diagnostics().originalFire,'42.5','Approved fire attacks remain unchanged');
// Spelling variants in game/translation must not create a missing-effect cast.
const aliases=[
 ['Água Jet','aquaJet'],['Pulso de Água','waterPulse'],
 ['Water Pulse','waterPulse'],['Aqua Tail','aquaTail'],
 ['Water Gun','waterGun'],['Pistola d’Água','waterGun']
];
for(const [name,key] of aliases){
 desc[5].name=name;
 now+=2400;
 assert.equal(engine.useMove(5),true,'Variant cast should not break for '+name);
 assert.equal(engine.v43WaterFX.at(-1).move.name,name);
 const before=draws.length;
 engine.draw(now+540);
 assert.ok(draws.length>before,'Variant name must produce sprites for '+name);
}
desc[5].name=newNames[1];
console.log('PASS: V45 Aqua Jet real dash, Water Pulse orb, Aqua Tail physical arc, single thin Water Gun; aliases and V44.3 preserved');

console.log('PASS: Skull Bash contact, Tsunami wave, Amnesia self-status and Hydro Pump jet');
console.log(JSON.stringify({version:diagnostics().version,registered:diagnostics().registered,waterFrames:draws.length,previousFire:diagnostics().originalFire}));
