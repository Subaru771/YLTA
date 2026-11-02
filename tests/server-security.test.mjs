import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clientIp, originAllowed, createRateLimiter } from '../mobile-server/security.mjs';

function fakeRequest(peer, xff) {
  return { socket: { remoteAddress: peer }, headers: xff === undefined ? {} : { 'x-forwarded-for': xff } };
}

test('CORS origin accepts only exact configured origin', () => {
  assert.equal(originAllowed('https://yourlta.pages.dev','https://yourlta.pages.dev'),true);
  for(const origin of ['https://other.pages.dev','https://yourlta.pages.dev.attacker.example','http://yourlta.pages.dev',undefined,'null']) {
    assert.equal(originAllowed(origin,'https://yourlta.pages.dev'),false);
  }
});

test('untrusted X-Forwarded-For cannot spoof per-IP rate limits', () => {
  const req=fakeRequest('198.51.100.80','203.0.113.1, 203.0.113.2');
  assert.equal(clientIp(req), '198.51.100.80');
});

test('trusted proxy hop selection reads from right, not spoofable first entry', () => {
  const req=fakeRequest('10.0.0.1','192.0.2.200, 198.51.100.22, 203.0.113.4');
  assert.equal(clientIp(req,2),'198.51.100.22');
  assert.equal(clientIp(req,1),'203.0.113.4');
});

test('invalid proxy header or insufficient trusted hops falls back to socket IP', () => {
  assert.equal(clientIp(fakeRequest('10.0.0.2','not-an-ip'),1),'10.0.0.2');
  assert.equal(clientIp(fakeRequest('10.0.0.2','198.51.100.1'),2),'10.0.0.2');
  assert.equal(clientIp(fakeRequest('10.0.0.2'),3),'10.0.0.2');
});

test('rate limit is per IP, not shared across callers', () => {
  const rl=createRateLimiter({limit:2,windowMs:60_000});
  assert.equal(rl.check('198.51.100.10',1).allowed,true);
  assert.equal(rl.check('198.51.100.10',2).allowed,true);
  assert.equal(rl.check('198.51.100.10',3).allowed,false);
  assert.equal(rl.check('198.51.100.11',3).allowed,true);
});

test('rate-limit buckets reset on expiry and Retry-After is bounded', () => {
  const rl=createRateLimiter({limit:1,windowMs:1_000});
  assert.equal(rl.check('198.51.100.1',0).allowed,true);
  assert.equal(rl.check('198.51.100.1',200).retryAfter,1);
  assert.equal(rl.check('198.51.100.1',1_000).allowed,true);
});

test('bounded rate limiter refuses new clients when full, without evicting active IPs', () => {
  const rl=createRateLimiter({limit:1,windowMs:1_000,maxClients:2});
  assert.equal(rl.check('198.51.100.1',0).allowed,true);
  assert.equal(rl.check('198.51.100.2',0).allowed,true);
  assert.equal(rl.check('198.51.100.3',100).allowed,false);
  assert.equal(rl.size(),2);
  assert.equal(rl.check('198.51.100.3',1_000).allowed,true);
});
