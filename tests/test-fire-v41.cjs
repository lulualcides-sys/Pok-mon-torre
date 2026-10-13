'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const index=read('index.html');
const names=['Chamas de Moltres','Rajada Flamejante','Chama Circular','Garra de Fogo'];
const fireRoot=[
 'effects/moves/_runtime/fire-sprite-kit.js',
 'effects/moves/chamas-de-moltres/index.js',
 'effects/moves/rajada-flamejante/index.js',
 'effects/moves/chama-circular/index.js',
 'effects/moves/garra-de-fogo/index.js',
 'effects/moves/_runtime/fire-sprite-integrate.js'
];
const filesMatch=index.match(/const fireSpriteFiles=(\[[\s\S]*?\]);\s*const fireSpriteSections=/);
assert.ok(filesMatch,'V41 loader must fetch six independent sprite scripts');
assert.deepEqual(JSON.parse(filesMatch[1]),fireRoot,'loader must use the exact V41 scripts, not V40 code');
assert.ok(!index.includes("const hotfixPath="),'Old V40 module must not load');
assert.ok(!index.includes("fire-v40-override.js"),'V40 must no longer load');
const png=fs.readFileSync(path.join(root,'effects/moves/fire-original/fire-original-4-atlas.png'));
assert.equal(png.toString('hex',0,8),'89504e470d0a1a0a','PNG atlas must exist');
const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
assert.ok(width>=768&&height>=960&&width%96===0&&height%96===0,'Atlas must contain all 75 cropped frames');
const fireScripts=fireRoot.map(read);
const source=fireScripts.join('\n');
const fxMatch=index.match(/const fxFiles=(\[[^;]+?\]);let plugin=/);
assert.ok(fxMatch,'Old modular game code still loaded for unchanged moves');
const modules=JSON.parse(fxMatch[1]).map(read).join('\n');
assert.ok(modules.includes('PokemonTorreMewtwo4FX'),'Existing effects preserved');
assert.equal((source.match(/fireSpriteV41.add\(/g)||[]).length,4,'Four and only four sprite animations');
for(const script of fireScripts.slice(1,5)){
 assert.doesNotMatch(script,/\.fillRect\(|\.arc\(|\.lineTo\(|\.stroke\(|createRadialGradient|linear-gradient|CSSStyleSheet/,
  'Combat animation must only stamp original frames');
}
new vm.Script(source,{filename:'fire-v41-modules.js'});
const loader=index.slice(index.indexOf('<script>')+8,index.indexOf('</script>'));
new vm.Script(loader,{filename:'index-loader.js'});
const game=Array.from({length:25},(_,i)=>read('parts/p'+String(i).padStart(3,'0')+'.txt')).join('');
const anchor='\nrender();\n})();\n</script>';
assert.ok(game.includes(anchor),'Original IIFE anchor must still exist');
const assembled=game.replace(anchor,'\n'+modules+'\n'+source+'\n'+anchor);
const scriptStart=assembled.indexOf('<script>'),scriptEnd=assembled.indexOf('</script>',scriptStart+8);
assert.ok(scriptStart>=0&&scriptEnd>scriptStart);
new vm.Script(assembled.slice(scriptStart+8,scriptEnd),{filename:'complete-game-with-fire-v41.js'});
console.log('PASS: all 25 game parts and previous FX compile with V41; original 75-frame atlas found');
let clock=1000,drawn=0,blueDrawn=0,orangeDrawn=0;
let battle={active:true,energy:500,paused:false};
const mon={id:146},moves=names.map(name=>({name,cost:12}));
const cooldowns=[0,0,0,0],positions=[];
class FakeContext{
 save(){}restore(){}translate(){}rotate(){}scale(){}
 drawImage(img){drawn++;if(img.__isCanvas)blueDrawn++;else orangeDrawn++;}
}
class FakeCanvas{
 constructor(){this.width=0;this.height=0;this.__isCanvas=true;}
 getContext(){const cv=this;return {
  drawImage(){},
  getImageData(){return {data:new Uint8ClampedArray(cv.width*cv.height*4)};},
  putImageData(){},
 };}
}
class FakeImage{
 constructor(){this.width=width;this.height=height;this.naturalWidth=width;this.naturalHeight=height;}
 set src(value){this.uri=value;this.onload?.();}
}
const window={PokemonTorreV360Paint(){return false}};
const elements=[];
class BattleEngine{
 constructor(){this.player={x:180,y:380};this.enemy={x:650,y:250};this.ctx=new FakeContext();this.h=560;}
 useMove(slot){
  if(cooldowns[slot]>clock||battle.energy<moves[slot].cost)return false;
  cooldowns[slot]=clock+1600;battle.energy-=moves[slot].cost;return true;
 }
 draw(now){positions.push({now,x:this.player.x});return true;}
}
const engine=new BattleEngine();
const sandbox={window,Image:FakeImage,BattleEngine,battle,cooldowns,performance:{now:()=>clock},
 document:{createElement:()=>new FakeCanvas(),getElementById:()=>null,body:{appendChild:el=>elements.push(el)}},
 current:()=>mon,skillSet:()=>moves,console,engine};
vm.runInNewContext(source,sandbox,{filename:'fire-v41-runtime.js'});
assert.equal(typeof window.PokemonTorreFireSpriteV41,'function');
assert.equal(window.PokemonTorreFireSpriteV41().originalAtlasReady,true);
assert.equal(window.PokemonTorreFireSpriteV41().blueAtlasReady,true);
const baseX=engine.player.x;
names.forEach((name,i)=>{
 clock=1000+i*4000;
 assert.equal(engine.useMove(i),true,'Cast accepted: '+name);
 assert.equal(window.PokemonTorreV360Paint(engine.ctx,{move:{name},from:[0,0],to:[1,1],at:clock,duration:1000},clock,engine),true,
  'Old legacy fire painter suppressed for '+name);
 engine.draw(clock+500);
 assert.equal(engine.player.x,baseX,'Sprite cast must restore actor coordinates for '+name);
});
const d=window.PokemonTorreFireSpriteV41();
assert.equal(d.casts,4);
assert.equal(d.drawEvents,4);
assert.ok(drawn>50,'Must draw genuine atlas frames rather than procedural effects');
assert.ok(blueDrawn>0,'Moltres must draw recolored BLUE atlas frames');
assert.ok(orangeDrawn>0,'Other attacks must draw original-color atlas frames');
assert.ok(positions[3].x>baseX,'Fire Claw actual attacker moves toward contact');
assert.ok(Object.values(d.paintCounts).every(v=>v>0),'Four registered timelines should paint');
console.log('PASS: four accepted attacks, blue original-frame Moltres, original-color fire, real contact dash, no CSS');
console.log(JSON.stringify({version:d.version,casts:d.casts,frameDrawCalls:drawn,blueDraws:blueDrawn,orangeDraws:orangeDrawn,paintCounts:d.paintCounts}));
