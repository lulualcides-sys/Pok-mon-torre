'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const hotfix=read('effects/moves/_runtime/fire-v40-override.js');
const index=read('index.html');
const names=['Chamas de Moltres','Rajada Flamejante','Chama Circular','Garra de Fogo'];
assert.match(index,/fire-v40-override\.js/);
assert.match(index,/const hotfixAnchor/);
assert.match(index,/game=game\.replace\(hotfixAnchor/);
new vm.Script(hotfix,{filename:'fire-v40-override.js'});
const game=Array.from({length:25},(_,i)=>read('parts/p'+String(i).padStart(3,'0')+'.txt')).join('');
const anchor='\nrender();\n})();\n</script>';
assert.ok(game.includes(anchor),'Must inject inside game IIFE before render');
const compiled=game.replace(anchor,'\n'+hotfix+'\n'+anchor);
assert.ok(compiled.includes('PokemonTorreFireV40Diagnostics'),'Hotfix must reach assembled game source');
const scriptStart=compiled.indexOf('<script>');
const scriptEnd=compiled.indexOf('</script>',scriptStart+8);
assert.ok(scriptStart>=0&&scriptEnd>scriptStart,'Main game inline script present');
new vm.Script(compiled.slice(scriptStart+8,scriptEnd),{filename:'assembled-game.js'});
console.log('PASS: 25 parts compiled with V40 inside main IIFE');
let clock=1000;
const cooldowns=[0,0,0,0],battle={active:true,paused:false,energy:300};
const mon={id:150}, moves=names.map(name=>({name,cost:20}));
const draws=[];
class MockEngine{
 constructor(){this.ctx={
 save(){},restore(){},translate(){},rotate(){},fillRect(){},drawImage(){},beginPath(){},arc(){},fill(){},stroke(){},moveTo(){},lineTo(){},quadraticCurveTo(){},setTransform(){},
 createRadialGradient(){return {addColorStop(){}}}
 };this.h=560;this.player={x:150,y:340};this.enemy={x:640,y:220};}
 useMove(i){if(cooldowns[i]>clock||battle.energy<moves[i].cost)return false;cooldowns[i]=clock+1600;battle.energy-=moves[i].cost;return true;}
 draw(now){draws.push({now,playerX:this.player.x});return true;}
}
class MockImage{constructor(){this.naturalWidth=0;this.width=0;this.height=0;}set src(s){this.path=s;}}
const elements=[];
const window={PokemonTorreV360Paint(){return false}};
const sandbox={BattleEngine:MockEngine,window,Image:MockImage,document:{
 createElement(){return {style:{},getContext(){return {}}}},
 getElementById(){return null},
 body:{appendChild(x){elements.push(x)}}
},performance:{now:()=>clock},battle,cooldowns,
current:()=>mon,skillSet:()=>moves,console,
get engine(){return engineInstance}
};
const engineInstance=new MockEngine();
vm.runInNewContext(hotfix,sandbox,{filename:'fire-v40-override.js'});
assert.equal(typeof window.PokemonTorreFireV40Diagnostics,'function');
const initialX=engineInstance.player.x;
names.forEach((name,i)=>{
 clock=1000+i*4000;
 assert.equal(engineInstance.useMove(i),true,'Cast '+name);
 engineInstance.draw(clock+500);
 assert.equal(engineInstance.player.x,initialX,'Actor position restored after draw');
});
const stats=window.PokemonTorreFireV40Diagnostics();
assert.equal(stats.casts,4);
assert.equal(stats.painted,4);
assert.ok(Object.values(stats.animated).every(n=>n>0));
assert.ok(draws[3].playerX>initialX,'Fire Claw must move actor into contact during render');
console.log('PASS: four distinct combat animations executed, Fire Claw approaches and actor resets');
console.log('V40 diagnostics:',JSON.stringify(stats));
