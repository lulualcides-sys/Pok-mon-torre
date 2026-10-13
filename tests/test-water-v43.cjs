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
assert.match(tsunami,/tsunamiWaveV441/,'Tsunami must use the large coherent curved wave sprite');
assert.match(read('effects/moves/tsunami/wave.svg'),/<svg[^>]+shape-rendering="crispEdges"/,'Wave must be pixel art');
assert.match(pump,/pressureStream:true/,'Hydro Pump has its own continuous jet');
assert.match(pump,/hydroJetV441/,'Hydro Pump must use ONE unbroken pixel-water sprite');
assert.match(read('effects/moves/hydro-pump/jet.svg'),/<svg[^>]+shape-rendering="crispEdges"/,'Jet must be pixel art');
assert.match(amnesia,/amnesiaMarkV44\.src/,'Amnesia loads its own question-mark sprite');
assert.doesNotMatch(amnesia,/draw\(g,/,'Amnesia must not paint water at all');
assert.match(read(files[0]),/version:'44\.0'/);
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
 save(){}restore(){}translate(){}rotate(){}scale(){}
 drawImage(img,...args){draws.push({img:img.path,args});}
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
assert.equal(diagnostics().registered.length,4);
assert.equal(diagnostics().version,'44.0','Published water version must be V44');
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
assert.ok(tsunamiDraws.some(x=>x.img.includes('tsunami/wave.svg')&&x.args[2]>=270&&x.args[3]>=175),
 'Tsunami crest must be wide AND tall, never the old thin water stripe');
now=35000;
engine.useMove(3); // Hydro Pump
startFrame=draws.length;
engine.draw(now+930);
let hydroDraws=draws.slice(startFrame);
assert.ok(hydroDraws.some(x=>x.img.includes('hydro-pump/jet.svg')),
 'Hydro Pump should render its real single-piece water sprite');
assert.ok(hydroDraws.some(x=>x.img.includes('hydro-pump/jet.svg')&&x.args[6]>=310&&x.args[7]>=38),
 'Hydro Pump must draw one LONG THICK jet rather than little scattered bubbles');
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
console.log('PASS: V44.1 coherent tidal wave, continuous thick Hydro Pump, self-target Amnesia symbols');

console.log('PASS: Skull Bash contact, Tsunami wave, Amnesia self-status and Hydro Pump jet');
console.log(JSON.stringify({version:diagnostics().version,registered:diagnostics().registered,waterFrames:draws.length,previousFire:diagnostics().originalFire}));
