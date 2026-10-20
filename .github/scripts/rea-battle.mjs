import fs from 'node:fs';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('/tmp/rea-play/node_modules/playwright-core');
const base = 'rea-report';
fs.mkdirSync(base, { recursive: true });
const target = 'https://www.pokearena2d.com/';
const results = { target, stages: [], errors: [], network: [], consoleErrors: [] };
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
if (!context) throw new Error('No CDP browser context');
const page = context.pages().find(p => p.url().startsWith(target)) || context.pages()[0] || await context.newPage();
await page.setViewportSize({ width: 780, height: 437 });

page.on('response', r => {
  const url = r.url();
  if (url.startsWith(target) && results.network.length < 1800) {
    results.network.push({ url, status: r.status(), type: r.request().resourceType(), contentType: r.headers()['content-type'] || '' });
  }
});
page.on('pageerror', e => { if(results.errors.length < 40) results.errors.push(String(e).slice(0, 500)); });
page.on('console', m => { if (m.type() === 'error' && results.consoleErrors.length < 40) results.consoleErrors.push(m.text().slice(0, 500)); });

async function stage(name) {
  const screenshotPath = base + '/' + name + '.png';
  const png = await page.screenshot({ path: screenshotPath, timeout: 30000 });
  let runtime = {};
  try {
    runtime = await page.evaluate(() => {
      const el = document.querySelector('canvas');
      const r = el?.getBoundingClientRect();
      const gameCandidates = Object.keys(window).filter(k => /game|phaser|scene|sprite|arena/i.test(k)).slice(0, 35);
      const controls = Array.from(document.querySelectorAll('button,a,[role="button"]')).slice(0, 40)
        .map(x => ({ tag: x.tagName, text: (x.textContent || '').trim().slice(0, 100) }));
      return { url: location.href, title: document.title, bodyText: (document.body?.innerText || '').slice(0, 1200),
        canvas: r ? { x:r.x, y:r.y, width:r.width, height:r.height, pixelWidth:el.width, pixelHeight:el.height } : null,
        gameCandidates, controls,
        resources: performance.getEntriesByType('resource').slice(0, 1200).map(e => e.name)
          .filter(s => s.startsWith(location.origin)).slice(0, 800) };
    });
  } catch (e) { runtime = { error: String(e) }; }
  const item = { stage:name, shot:screenshotPath, pngSha256:crypto.createHash('sha256').update(png).digest('hex'),
    runtime, time:new Date().toISOString() };
  results.stages.push(item);
  fs.writeFileSync(base + '/' + name + '.json', JSON.stringify(item, null, 2));
  return item;
}

try {
  await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(12000);
  const before = await stage('00-home');
  let click;
  if (before.runtime.canvas && before.runtime.canvas.width > 150) {
    const r = before.runtime.canvas;
    click = { x: Math.round(r.x + r.width * 0.5), y:Math.round(r.y + r.height * 0.418) };
  } else {
    click = { x:390, y:183 };
  }
  results.click = click;
  await page.mouse.click(click.x, click.y);
  await page.waitForTimeout(6000);
  let after = await stage('01-after-play');
  results.clickedPlayChangedPixels = after.pngSha256 !== before.pngSha256;
  if (!results.clickedPlayChangedPixels) {
    await page.mouse.click(390,183);
    await page.waitForTimeout(5000);
    after = await stage('02-after-fallback-click');
    results.fallbackChangedPixels = after.pngSha256 !== before.pngSha256;
  }
  if (results.clickedPlayChangedPixels) {
    // Training button observed on the actual 780x437 screenshot after Play.
    await page.mouse.click(390, 282);
    await page.waitForTimeout(6500);
    const training = await stage('02-training');
    results.trainingChangedPixels = training.pngSha256 !== after.pngSha256;
    after = training;
  }
  if (results.trainingChangedPixels) {
    // Coordinates recorded from the actual Training selection screenshot.
    await page.mouse.click(112, 76); // Select Charmander as player.
    await page.waitForTimeout(950);
    await stage('03-charmander-selection');
    await page.mouse.click(558, 242); // Focus the Dummy pane.
    await page.waitForTimeout(450);
    await page.mouse.click(670, 78); // Select Pikachu as dummy.
    await page.waitForTimeout(950);
    const dummy = await stage('04-dummy-selection');

    await page.mouse.click(685, 392); // Fight!
    await page.waitForTimeout(5400);
    const combat = await stage('05-after-fight');
    results.fightChangedPixels = combat.pngSha256 !== dummy.pngSha256;

    // Evidence only: exercise visible controls and record frames for timing/impact.
    async function burst(label, frames=10) {
      fs.mkdirSync(base + '/frames', {recursive:true});
      for (let i=0; i<frames; i++) {
        await page.screenshot({path:base + '/frames/' + label + '-' + String(i).padStart(2,'0') + '.png',timeout:10000});
        await page.waitForTimeout(95);
      }
    }
    // Study the two requested fire moves separately. Aim at the dummy's
    // position observed in the first actual battle screenshot.
    await page.mouse.move(512, 199);
    await page.mouse.click(512, 199, {button:'right'}); // RMB = Flamethrower
    await burst('flamethrower', 22);
    await stage('06-after-flamethrower');
    await page.waitForTimeout(1500);
    await page.mouse.move(512, 199);
    await page.keyboard.press('e'); // E = Fire Blast
    await burst('fire-blast', 22);
    await stage('07-after-fire-blast');
  }
  const controls = after.runtime.controls || [];
  const next = controls.find(c => /solo|single|training|train|practice|offline|quick battle/i.test(c.text) && !/online/i.test(c.text));
  if (next && next.text) {
    const candidate = page.getByText(next.text, {exact:true});
    if (await candidate.count() === 1) {
      await candidate.click({ timeout:4000 });
      await page.waitForTimeout(7000);
      await stage('03-after-solo-control');
      results.clickedNextControl = next.text;
    }
  }
} catch(e) {
  results.errors.push('navigation: ' + String(e));
}
fs.writeFileSync(base + '/navigation-summary.json', JSON.stringify(results, null, 2));
console.log(JSON.stringify({
  stages:results.stages.map(s=>({stage:s.stage, url:s.runtime.url,bodyText:s.runtime.bodyText?.slice(0,250),canvas:s.runtime.canvas,sha:s.pngSha256})),
  clickedPlayChangedPixels:results.clickedPlayChangedPixels,
  networkResources:results.network.length, errors:results.errors
},null,2));
// Leave the externally launched Chrome running for REA's CDP inspection.

// Playwright keeps its CDP socket alive. Exit after flushing synchronous evidence,
// leaving the separately launched Chrome available for REA.
process.exit(0);
