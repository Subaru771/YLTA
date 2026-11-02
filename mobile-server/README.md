# YourLTA phone/web import server — v1.0

This Node.js service is separate from the Cloudflare Pages frontend. The supplied frontend uses `https://yourlta-mobile-api.onrender.com`; there is no editable API-address field in that version's UI.

## Run

Use Node.js 20 or later as declared in package.json. Install with `npm install`, then start with `npm start`. The host must provide HTTPS for public use. `GET /health` returns a health response; imports use `POST /import`.

## Environment

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | HTTP listen port |
| `YLTA_ORIGIN` | `https://yourlta.pages.dev` | Allowed frontend origin |
| `YLTA_MAX_ACTIVE` | `3` | Maximum concurrent imports, bounded to 1–10 |
| `YLTA_RATE_LIMIT` | `6` | Requests per address per minute, bounded to 1–30 |
| `YLTA_TRUSTED_PROXY_HOPS` | `0` | Number of **verified, trusted** reverse proxies to trust when resolving `X-Forwarded-For`; keep `0` unless your hosting configuration is confirmed |

Configure these through your hosting settings. No NPSSO environment variable is needed: the request supplies it for that import. Never put credentials into the source or an example request committed to GitHub.

For a separate deployment, update the frontend's API base URL and the CSP `connect-src` directive alongside `YLTA_ORIGIN`. A different local origin will otherwise be rejected.

## Limits and trust

NPSSO is a sensitive bearer credential. The supplied implementation does not intentionally persist tokens or log request bodies. Hosting infrastructure is a separate trust consideration. Origin checks are not authentication. Rate limits are per observed IP, in memory, per server instance; a restart clears them. When behind a reverse proxy, `req.socket.remoteAddress` may be a shared proxy address. You may set `YLTA_TRUSTED_PROXY_HOPS` only after verifying the **exact number of proxies that add reliable IP addresses**. The resolver chooses from the right of `X-Forwarded-For`, not the user-spoofable left. An incorrectly configured proxy count can allow rate-limit bypasses. For multi-instance deployments, use a shared edge/Redis limit instead of relying on these in-memory buckets. Basic request/concurrency limits do not make this a hardened public service.

The application never intentionally logs the NPSSO token or request body. Review and disable **request-body, header, authentication-token and exception-payload logging** in Render, any proxy/CDN, APM tool, and error-tracking software; this cannot be verified from repository source alone. Use only aggregate operational metrics.

The service uses unofficial PSN access. Large collections can be slow, games may be skipped, and host timeouts or Sony limits can interrupt requests. Do not describe it as risk-free, audited or Sony approved.
