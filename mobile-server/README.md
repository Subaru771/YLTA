# YourLTA phone/web import server — beta

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

Configure these through your hosting settings. No NPSSO environment variable is needed: the request supplies it for that import. Never put credentials into the source or an example request committed to GitHub.

For a separate deployment, update the frontend's API base URL and the CSP `connect-src` directive alongside `YLTA_ORIGIN`. A different local origin will otherwise be rejected.

## Limits and trust

NPSSO is a sensitive bearer credential. The supplied implementation does not intentionally persist tokens or log request bodies. Hosting infrastructure is a separate trust consideration. Origin checks are not authentication. Rate limits are in memory, per server instance; a restart clears them. Basic request/concurrency limits do not make this a hardened public service.

The service uses unofficial PSN access. Large collections can be slow, games may be skipped, and host timeouts or Sony limits can interrupt requests. Do not describe it as risk-free, audited or Sony approved.
