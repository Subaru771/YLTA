'use strict';

// Execute the app's actual pure functions, not copied/reimplemented logic.
// The UI bootstrapping stays out of this sandbox; it requires a browser.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

const source = readFileSync(join(__dirname, '..', 'js', 'ylta-1.js'), 'utf8');
const pureStart = source.indexOf('var TYPES=');
const pureEnd = source.indexOf('/* ---------- sample data ---------- */');
const importStart = source.indexOf('function parseCSV(');
const importEnd = source.indexOf('function nameKey(');
assert(pureStart >= 0 && pureEnd > pureStart, 'Pure trophy functions section exists');
assert(importStart >= 0 && importEnd > importStart, 'Import parser section exists');

const context = vm.createContext({
  normalizeGoals: goals => goals // Only used to verify backup pass-through.
});
vm.runInContext(
  source.slice(pureStart, pureEnd) + '\n' +
  source.slice(importStart, importEnd),
  context,
  { filename: 'ylta-1.js pure functions' }
);

test('rarity tiers preserve exact 5, 15 and 50 percent boundaries', () => {
  assert.equal(context.tierOf(0).key, 'ultra');
  assert.equal(context.tierOf(4.99).key, 'ultra');
  assert.equal(context.tierOf(5).key, 'very');
  assert.equal(context.tierOf(14.99).key, 'very');
  assert.equal(context.tierOf(15).key, 'rare');
  assert.equal(context.tierOf(49.99).key, 'rare');
  assert.equal(context.tierOf(50).key, 'common');
});

test('escape untrusted trophy names before adding to HTML', () => {
  assert.equal(context.esc('<img src="x" onerror=\'run()\'>&'), '&lt;img src=&quot;x&quot; onerror=&#39;run()&#39;&gt;&amp;');
});

test('CSV supports quoted commas, double-quotes and multiline descriptions', () => {
  const csv = 'game,name,type,rarity,description\r\n"Game, One","Hero ""Gold""",gold,4.8,"Line 1\nLine 2"';
  const rows = context.parseCSV(csv);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].game, 'Game, One');
  assert.equal(rows[0].name, 'Hero "Gold"');
  assert.equal(rows[0].description, 'Line 1\nLine 2');
});

test('CSV supports semicolon-separated data and rejects wrong columns', () => {
  const parsed = context.parseInput('game;name;type;rarity\nGame A;First;bronze;9.2');
  assert.equal(parsed.rows.length, 1);
  assert.equal(parsed.rows[0].rarity, 9.2);
  assert.throws(() => context.parseInput('profile,rarity\nSomebody,5'), /CSV missing required columns/);
});

test('JSON PSN import normalizes identifiers, dates and flags', () => {
  const input = { trophies: [
    { game: 'Example', name: 'First', type: 'Gold', rarity: '0.8%', earned: '2026-11-02', platform: 'PS5', hidden: true, dlc: 'yes', gameId: 'NPWR001', trophyId: 0 },
    { game: 'Example', name: 'Broken', type: 'invalid' }
  ] };
  const result = context.parseInput(JSON.stringify(input));
  assert.equal(result.rows.length, 1);
  assert.equal(result.skipped, 1);
  const row = result.rows[0];
  assert.equal(row.game, 'Example');
  assert.equal(row.type, 'gold');
  assert.equal(row.rarity, 0.8);
  assert.equal(row.earned, '2026-11-02T00:00');
  assert.equal(row.platform, 'PS5');
  assert.equal(row.hidden, true);
  assert.equal(row.dlc, true);
  assert.equal(row.gid, 'NPWR001');
  assert.equal(row.tid, '0');
});

test('PSNProfiles rarity is optional and remains separate from PSN rarity', () => {
  const result = context.parseInput(JSON.stringify({ trophies: [
    { game: 'Example', name: 'Rare', type: 'silver', rarity: '12.1%', psnpRarity: '6.7%' },
    { game: 'Example', name: 'Unknown', type: 'bronze', rarity: 70 }
  ] }));
  assert.equal(result.rows[0].rarity, 12.1);
  assert.equal(result.rows[0].psnpRarity, 6.7);
  assert.equal(result.rows[1].psnpRarity, undefined);
});

test('backup parsing retains goal and import-history arrays', () => {
  const input = JSON.stringify({
    app: 'trophy-ledger', version: 1,
    trophies: [{ game: 'Example', name: 'Goal', type: 'platinum', rarity: 3 }],
    goals: [{ id: 'g1', title: 'Collect platinums' }],
    importHistory: [{ name: 'Old backup' }]
  });
  const parsed = context.parseInput(input);
  assert.equal(parsed.rows.length, 1);
  assert.equal(parsed.goals[0].id, 'g1');
  assert.equal(parsed.history[0].name, 'Old backup');
  assert.throws(() => context.parseInput('{bad'), /could not be opened/);
});

test('missing game/trophy name or invalid grade skips row', () => {
  const parsed = context.parseInput('game,name,type\nA,Good,bronze\nA,,gold\nA,Invalid,wood');
  assert.equal(parsed.rows.length, 1);
  assert.equal(parsed.skipped, 2);
});
