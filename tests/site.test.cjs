'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { existsSync, readFileSync, readdirSync, statSync } = require('node:fs');
const { join } = require('node:path');

const root = join(__dirname, '..');
const file = p => readFileSync(join(root, p), 'utf8');
const html = file('index.html');

test('required static hosting files stay at the web root', () => {
  for (const p of ['index.html', 'robots.txt', 'sitemap.xml', 'manifest.webmanifest', '_headers', 'favicon.png', 'privacy.html', 'feedback.html']) {
    assert(existsSync(join(root, p)), 'Missing deployment file: ' + p);
  }
  const google = readdirSync(root).filter(x => /^google[a-z0-9]+\.html$/i.test(x));
  assert(google.length > 0, 'Google Search Console verification file is missing');
});

test('the app loads its five JavaScript files in order', () => {
  const scripts = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/g)].map(m => m[1]);
  assert.deepEqual(scripts, [1, 2, 3, 4, 5].map(n => 'js/ylta-' + n + '.js?v=1.0'));
});

test('static HTML resource paths resolve to real files', () => {
  for (const match of html.matchAll(/\b(?:href|src|poster)=["']([^"']+)["']/g)) {
    const raw = match[1];
    if (/^(?:https?:|mailto:|data:|blob:|javascript:|#)/i.test(raw)) continue;
    const path = raw.split(/[?#]/)[0].replace(/^\.?\//, '');
    if (!path) continue;
    assert(existsSync(join(root, path)), 'Broken local link: ' + raw);
    assert(statSync(join(root, path)).isFile(), 'Resource is not a file: ' + raw);
  }
});

test('the first public release does not ship development changelog clutter', () => {
  const entries = readdirSync(root);
  assert.equal(entries.filter(x => /^(?:CHANGELOG-v\d+|V\d+-(?:CHANGES|README)|V\d+-DEPLOYMENT)/i.test(x)).length, 0);
  assert.equal(existsSync(join(root, 'downloads/yourlta-source-v56.zip')), false);
  assert.equal(existsSync(join(root, 'CHANGELOG.md')), false);
});

test('manifest and companion metadata are parseable JSON', () => {
  for (const p of ['manifest.webmanifest', 'tools/psnprofiles-helper/manifest.json', 'tools/windows-exporter/package.json', 'mobile-server/package.json']) {
    assert(JSON.parse(file(p)), 'Invalid JSON in ' + p);
  }
});

test('version and privacy language agrees with the public release', () => {
  assert.match(html, /YOURLTA\s*<span class="launch-version">v1\.0<\/span>/);
  assert.match(file('README.md'), /(?:Open|Launch) YourLTA v1\.0/);
  assert.match(file('SECURITY.md'), /not been independently security audited/);
  assert.doesNotMatch(html, /yourlta-source-v56\.zip/);
  assert.doesNotMatch(html, /js\/ylta-\d\.js\?v=56/);
});

test('existing browser storage keys remain stable across cosmetic releases', () => {
  const js = file('js/ylta-1.js');
  for (const key of ['trophyLedger.v1', 'trophyLedger.appearance.v3', 'trophyLedger.card.v2', 'ylta.guideMetadata.v15']) {
    assert(js.includes(key), 'Storage migration needed before changing: ' + key);
  }
});


test('self-hosted WOFF2 fonts have local CSS, assets and OFL notices', () => {
  const css = file('assets/fonts/fonts.css');
  assert.match(html, /href="assets\/fonts\/fonts\.css"/);
  assert.doesNotMatch(html, /fonts\.googleapis\.com|fonts\.gstatic\.com/);
  assert.doesNotMatch(file('_headers'), /fonts\.googleapis\.com|fonts\.gstatic\.com/);
  for (const font of ['barlow-regular', 'barlow-medium', 'barlow-semibold', 'barlow-condensed-medium', 'barlow-condensed-semibold', 'barlow-condensed-bold', 'jetbrains-mono-variable']) {
    assert(css.includes(font + '.woff2'), 'CSS missing font: ' + font);
    const path = 'assets/fonts/' + font + '.woff2';
    assert(existsSync(join(root, path)), 'Missing self-hosted font: ' + path);
    assert(statSync(join(root, path)).size > 2000, 'Font is truncated: ' + font);
  }
  for (const path of ['assets/fonts/licenses/barlow-OFL.txt', 'assets/fonts/licenses/jetbrainsmono-OFL.txt']) {
    assert.match(file(path), /SIL OPEN FONT LICENSE/);
  }
});
