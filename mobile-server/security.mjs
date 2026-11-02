import { isIP } from 'node:net';

/**
 * Only read proxy headers if the deployment owner explicitly configures the
 * number of trusted reverse-proxy hops. Never use the spoofable leftmost
 * X-Forwarded-For address by default.
 */
export function clientIp(req, trustedProxyHops = 0) {
  const peer = String(req?.socket?.remoteAddress || 'unknown');
  if (!Number.isSafeInteger(trustedProxyHops) || trustedProxyHops < 1) return peer;
  const forwarded = req?.headers?.['x-forwarded-for'];
  if (typeof forwarded !== 'string') return peer;
  const chain = forwarded.split(',').map(value => value.trim());
  if (chain.length < trustedProxyHops) return peer;
  const candidate = chain[chain.length - trustedProxyHops];
  return isIP(candidate) ? candidate : peer;
}

export function originAllowed(origin, expected) {
  return typeof origin === 'string' && origin === expected;
}

export function createRateLimiter({ limit = 6, windowMs = 60_000, maxClients = 5_000 } = {}) {
  const buckets = new Map();
  function check(ip, now = Date.now()) {
    const key = String(ip || 'unknown');
    // Bound memory use even when many source addresses are encountered.
    if (buckets.size >= maxClients) {
      for (const [address, item] of buckets) {
        if (now - item.start >= windowMs) buckets.delete(address);
      }
    }
    const old = buckets.get(key);
    if (!old && buckets.size >= maxClients) return { allowed: false, retryAfter: Math.ceil(windowMs / 1_000) };
    const item = !old || now - old.start >= windowMs ? { start: now, count: 0 } : old;
    item.count += 1;
    buckets.set(key, item);
    if (item.count > limit) return { allowed: false, retryAfter: Math.max(1, Math.ceil((windowMs - (now - item.start)) / 1000)) };
    return { allowed: true, retryAfter: 0 };
  }
  return { check, size: () => buckets.size };
}
