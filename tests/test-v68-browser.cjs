'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),
  path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
const html=path.join(root,'previews/v68-4-golpes-referencia.html');
const chrome=process.env.CHROME_BIN||['/usr/bin/google-chrome','/usr/bin/google-chrome-stable',
 '/usr/bin/chromium','/usr/bin/chromium-browser'].find(fs.existsSync);
if(!chrome){console.log('SKIP: Chromium unavailable');process.exit(0)}
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'poke-v68-browser-'));
try {
 const url='file://'+html;
 const p=cp.spawnSync(chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
 '--disable-extensions','--no-first-run','--allow-file-access-from-files',
 '--disable-background-networking','--user-data-dir='+temp,'--virtual-time-budget=1600',
 '--dump-dom',url],{encoding:'utf8',timeout:30000,maxBuffer:4*1024*1024});
 assert.equal(p.status,0,(p.stderr||'').slice(-1500));
 const dom=p.stdout||'';
 assert.ok(dom.includes('Dragon Pulse'),'Missing V68 visual page');
 assert.ok(dom.includes('01/08')&&dom.includes('08/08'),
  'Browser did not execute the preview script to produce all 8 frames');
 assert.ok(dom.includes('id="player"'),'Animated viewer absent');
 assert.ok(dom.includes('canvas width="560" height="350"'),
  'Rendered preview canvases missing');
 console.log('PASS V68 Chromium: preview opens in real browser with all 8 frames and animated canvas.');
} finally {fs.rmSync(temp,{recursive:true,force:true})}
