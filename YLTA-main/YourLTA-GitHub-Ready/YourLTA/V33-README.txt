YourLTA v33 - mobile import repair release

Based on v32 FIXED. Adds mobile viewport safeguards and actionable error messages for file:// origin and failed fetch. Existing import, exporter and mobile-server retained.

DEPLOY: On Cloudflare Pages, upload the website files from this archive with index.html at the root. Do not upload the entire ZIP as a nested directory.

BACKEND: Existing Render mobile-server deployment remains compatible; no redeploy needed for these front-end changes.

SECURITY: The mobile API is a beta and should not be offered publicly until authentication and rate limiting are implemented. NPSSO is a sensitive credential.

NOTE: Syntax checks passed; live PSN import and browser end-to-end behavior are not verified.
