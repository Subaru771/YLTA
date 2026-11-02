'use strict';

// Run only in a browser-capable environment. Screenshots use the app's
// bundled fictional sample data; no user account or NPSSO is involved.
const { chromium } = require('playwright');
const { mkdirSync } = require('node:fs');
const { join } = require('node:path');

const URL = 'http://127.0.0.1:8000/';
const dir = join(__dirname, '..', 'assets', 'screenshots');

async function ready(page) {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => {
    const list = document.getElementById('tally');
    return list && list.textContent.includes('Points');
  }, null, { timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
}

async function main() {
  mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  try {
    const desktop = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce'
    });
    const page = await desktop.newPage();
    page.on('pageerror', e => errors.push('Desktop: ' + e.message));
    await ready(page);
    await page.evaluate(() => document.getElementById('tab-dashboard').click());
    await page.waitForFunction(() => {
      const el = document.getElementById('view-dashboard');
      return el && !el.hidden && el.textContent.length > 250;
    });
    await page.screenshot({
      path: join(dir, 'dashboard-desktop.png'),
      animations: 'disabled'
    });
    await page.evaluate(() => document.getElementById('tab-stats').click());
    await page.waitForFunction(() => {
      const el = document.getElementById('view-stats');
      return el && !el.hidden && el.textContent.length > 250;
    });
    await page.screenshot({
      path: join(dir, 'analytics-desktop.png'),
      animations: 'disabled'
    });
    await desktop.close();

    const mobile = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
      reducedMotion: 'reduce'
    });
    const mobilePage = await mobile.newPage();
    mobilePage.on('pageerror', e => errors.push('Mobile: ' + e.message));
    await ready(mobilePage);
    await mobilePage.evaluate(() => document.getElementById('tab-dashboard').click());
    await mobilePage.waitForFunction(() => {
      const el = document.getElementById('view-dashboard');
      return el && !el.hidden && el.textContent.length > 250;
    });
    await mobilePage.screenshot({
      path: join(dir, 'dashboard-mobile.png'),
      animations: 'disabled'
    });
    await mobile.close();
    if (errors.length) throw new Error('Page errors:\n' + errors.join('\n'));
    console.log('Captured 3 real browser screenshots using fictional sample trophies.');
  } finally {
    await browser.close();
  }
}
main().catch(err => { console.error(err); process.exitCode = 1; });
