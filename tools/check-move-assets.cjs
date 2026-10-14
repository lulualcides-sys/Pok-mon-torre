#!/usr/bin/env node
'use strict';
/**
 * Pokémon Torre V54 — fast, isolated move validation.
 * This script only reads the repository: no artwork regeneration or game changes.
 * Usage: node tools/check-move-assets.cjs [--changed|--all|--move=faisca]
 */
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const exists=p=>fs.existsSync(path.join(root,p));
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const index=read('effects/moves/registry.json');
assert.equal(index.schemaVersion,1,'Unexpected registry schema');
assert.ok(exists(index.catalog),'Existing move catalog must stay in its original location');
const catalog=read(index.catalog);
assert.ok(Array.isArray(catalog.moves)&&catalog.moves.length>=300,'Legacy catalog must remain intact');
for(const m of catalog.moves)assert.ok(exists(m.path),'Missing existing catalog move '+m.path);
const electric=index.grouped.electric;
assert.equal(electric.length,4,'Four isolated electric moves must remain registered');
const configs=electric.map(p=>{assert.ok(exists(p),'Missing move config '+p);return read(p)});
const ids=new Set();
for(const cfg of configs){
 assert.match(cfg.id,/^[a-z0-9-]+$/);
 assert.ok(!ids.has(cfg.id),'Duplicate move ID '+cfg.id);ids.add(cfg.id);
 assert.equal(cfg.type,'electric');
 assert.ok(['physical','special'].includes(cfg.category));
 assert.ok(exists(cfg.path),'Move code absent '+cfg.path);
 assert.ok(exists(cfg.renderer)&&exists(cfg.integrator),'Missing shared runtime for '+cfg.id);
 assert.ok(cfg.durationMs>0&&cfg.durationMs<10000,'Invalid animation time');
 assert.equal(cfg.animation.frames,8);assert.equal(cfg.animation.impacts,4);
 const base='effects/moves/'+cfg.id+'/';
 assert.ok(cfg.path.startsWith(base),'Move file escaped its isolated folder');
 assert.ok(cfg.animation.framePattern.startsWith(base)&&cfg.animation.impactPattern.startsWith(base));
}
function changedFiles(){
 try{
  const base=process.env.VFX_BASE_SHA||'HEAD^';
  return cp.execFileSync('git',['diff','--name-only',base,'HEAD'],{cwd:root,encoding:'utf8'})
    .split(/\r?\n/).filter(Boolean);
 }catch(err){
  console.warn('No comparison commit; checking all move assets instead.');
  return null;
 }
}
const flags=process.argv.slice(2);
const explicit=flags.find(a=>a.startsWith('--move='));
if(explicit)assert.ok(ids.has(explicit.slice(7)),'Unknown move '+explicit.slice(7));
const changed=flags.includes('--changed')?changedFiles():null;
const runtimeTouched=changed?.some(p=>p.startsWith('effects/moves/_runtime/')||
 p==='effects/moves/registry.json'||p==='tools/check-move-assets.cjs');
const selected=explicit?new Set([explicit.slice(7)]):
 flags.includes('--all')||!changed||runtimeTouched?new Set(ids):
 new Set(configs.filter(c=>changed.some(p=>p.startsWith('effects/moves/'+c.id+'/'))).map(c=>c.id));
const validated=[];
function checkPng(p){
 assert.ok(exists(p),'Missing PNG '+p);
 const fd=fs.openSync(path.join(root,p),'r');
 try{
  const header=Buffer.alloc(24);
  assert.equal(fs.readSync(fd,header,0,24,0),24,'Truncated PNG '+p);
  assert.equal(header.subarray(0,8).toString('hex'),'89504e470d0a1a0a','Not PNG: '+p);
  assert.ok(header.readUInt32BE(16)>=8&&header.readUInt32BE(20)>=8,'Invalid dimensions '+p);
 }finally{fs.closeSync(fd)}
}
for(const c of configs){
 if(!selected.has(c.id))continue;
 const asset=a=>{for(let i=1;i<=a.count;i++)checkPng(a.pattern.replace('{NN}',String(i).padStart(2,'0')))};
 asset({count:c.animation.frames,pattern:c.animation.framePattern});
 asset({count:c.animation.impacts,pattern:c.animation.impactPattern});
 for(const extra of c.animation.extra||[])asset(extra);
 validated.push(c.id);
}
const results={catalogEntries:catalog.moves.length,registeredMoves:configs.length,
  assetChecked:validated,mode:explicit?'single':flags.includes('--changed')?'changed':'all'};
console.log('PASS Pokémon Torre V54 move registry: '+JSON.stringify(results));
