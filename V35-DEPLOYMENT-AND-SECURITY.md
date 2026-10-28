# YourLTA v35 — Secure Mobile Import

## Deploy order (IMPORTANT)
1. Update the existing private GitHub `yourlta-mobile-api` repository: replace `mobile-api.mjs` with the version in `mobile-server/`. Keep `package.json` and `README.md`. Render should redeploy automatically; confirm `/health` returns `{"ok":true}`.
2. Upload the website files to your Cloudflare Pages `yourlta` production project, preserving `js/`, `_headers`, and `index.html` at the site root.
3. Hard refresh the site and test with your own account. Back up existing trophy data before testing.

## What changed
- Backend URL built in; users cannot select an arbitrary server from the import screen.
- NPSSO never intentionally saved in localStorage and input cleared after request.
- Server checks expected Origin, JSON content type, payload size, offset, and token format.
- Per-instance IP-based rate limiting (6 requests/minute by default), concurrency cap (3), request timeout, generic error messages, no request body logging.
- PSN operations only read titles/trophies; import still requires review before merge.

## Security limitations — read before public launch
- NPSSO is sent to the Render server. A compromised server or malicious operator could misuse it. HTTPS and not storing tokens do not remove this risk.
- The server does not implement user authentication. Origin is not authentication; non-browser clients can forge it. Rate limits are per instance and reset on restart; proxy/NAT clients may share one bucket. For public use, add upstream edge protection, durable distributed limits, monitoring, and an independent security review.
- Sony's unofficial endpoints may change or trigger restrictions. No guarantee against account sanctions.
- No verified production penetration test, load test, or live Sony API test was performed as part of this package.
- Do not paste NPSSO tokens in support messages, logs, or screenshots.
- If Render is configured to log HTTP request bodies, disable that logging.

## Suggested Render variables
YLTA_ORIGIN=https://yourlta.pages.dev
YLTA_RATE_LIMIT=6
YLTA_MAX_ACTIVE=3

No new npm dependencies were added.
