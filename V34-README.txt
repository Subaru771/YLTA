YourLTA v34 — CSP repair

Fixed blocked inline application scripts by extracting five scripts to js/ylta-1.js through ylta-5.js, preserving execution order. Updated _headers CSP to allow same-origin scripts and Render API fetch. No unsafe-inline script policy.

Deploy ALL website files including js/ and _headers at site root to Cloudflare Pages. Avoid extracting and running file:// locally. Test with browser console and network. The Render backend is unchanged.

Note: This repairs CSP-related application startup, not a guarantee of successful PSN sync. Back up trophy data before major changes.
