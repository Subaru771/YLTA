<div align="center">

<img src="assets/ylta-brand.png" alt="YourLTA trophy analytics logo" width="160">

# YourLTA — Your Local Trophy Analyzer

**Your trophies. Your next challenge.**

A free browser app for PlayStation trophy hunters: explore collection statistics, compare trophy rarity, set personal goals and create shareable hunter cards.

[**Open YourLTA v1.0**](https://yourlta.pages.dev/) · [Official release](https://github.com/Subaru771/YLTA/releases/tag/v1.0) · [Privacy](https://yourlta.pages.dev/privacy.html) · [Security](SECURITY.md) · [Contributing](CONTRIBUTING.md)

[![YLTA checks](https://github.com/Subaru771/YLTA/actions/workflows/ci.yml/badge.svg)](https://github.com/Subaru771/YLTA/actions/workflows/ci.yml)

</div>

> [!NOTE]
 > Built with AI assistance. Independent project, not affiliated with Sony, PlayStation or PSNProfiles.

## Screenshots

Actual browser screenshots of YourLTA v1.0 using the app's **fictional example trophies**. These are not mockups or captures of anyone's PSN account.

| Dashboard · desktop | Analytics · desktop |
| --- | --- |
| ![Real YLTA desktop dashboard](assets/screenshots/dashboard-desktop.png) | ![Real YLTA trophy analytics dashboard](assets/screenshots/analytics-desktop.png) |

**Mobile layout**

<img src="assets/screenshots/dashboard-mobile.png" width="320" alt="Real YLTA dashboard displayed at mobile viewport size">



## Features

- **Overview:** collection summary, completion progress and trophy statistics
- **Explore:** search, sorting, rarity filters, platform filters and starred trophy targets
- **Rarity:** PSN rarity, plus optional PSNProfiles rarity from separately imported data
- **Goals:** personal goals, checklists and collection-based progress
- **Share:** custom hunter cards with PNG export
- **Your data:** JSON backup/restore and CSV export
- **Import:** phone/web import, or an alternative local Windows exporter

## Importing your collection

| Method | Where your NPSSO goes | Where the collection is saved |
| --- | --- | --- |
| **Phone / web import** | Sent over HTTPS to the YourLTA-operated import server on Render, which communicates with Sony | This browser, after you review and apply |
| **Local Windows exporter** | Used by the exporter on your PC to talk to Sony. Not sent to the YourLTA import server | Exported JSON on your PC, then this browser when imported |
| **Existing JSON / CSV file** | Not required | This browser |

> [!CAUTION]
> **NPSSO is a sensitive account credential.** Never put it in issues, screenshots, messages or commits.
>
> Both PSN retrieval methods use unofficial PSN access. Availability and account safety are not guaranteed, and Sony changes or request limits can interrupt imports.

### Privacy and storage

- The supplied import-server code does not intentionally persist NPSSO or log request bodies. That describes this source, not an independent audit or proof of what is deployed. Hosting infrastructure may process technical information.
- Trophies, goals and preferences are saved with IndexedDB, with a localStorage fallback.
- There is no automatic cross-device cloud sync. Export a JSON backup before clearing browser storage or changing domains.
- External fonts and hosting involve third parties.
- This source includes no visitor-analytics script. Dashboard-configured injection on a deployed host is separate and should be disclosed if enabled.

## Rarity: two different sources

PSN percentages and PSNProfiles percentages come from different populations. The app labels them separately, and they should not be treated as interchangeable.

PSNProfiles rarity is an optional enhancement, imported from saved pages or with the browser helper. It is not included automatically with every PSN import, and missing values are never fabricated.

## Run it locally

No frontend build is required. From the repository root:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`. JSON/CSV import, local storage and most frontend features work locally.

> [!NOTE]
> Phone/web import cannot run from a `file:` URL, and the production import server only accepts its configured origin. A local frontend therefore cannot use it without a separately configured server.

## Automated tests

Node.js 22+ is required for the development checks. No dependency installation or account login is needed:

```bash
node --test
```

[GitHub Actions CI](https://github.com/Subaru771/YLTA/actions/workflows/ci.yml) runs JavaScript syntax checks and the regression suite for every push and pull request targeting `main`. Coverage includes trophy rarity tiers, import parsing, backup metadata and static deployment integrity. **These are regression checks, not a live PSN import test or a security audit.**

The [screenshot workflow](https://github.com/Subaru771/YLTA/actions/workflows/screenshots.yml) is manually triggered and captures real Chromium renders using fictional sample data. It commits generated desktop and mobile PNGs to `assets/screenshots/`.

## Deployment

The public site is hosted on Cloudflare Pages. Keep `index.html`, `js/`, `assets/`, `downloads/` and `_headers` at the deployment root. Keep `robots.txt`, `sitemap.xml` and the `google*.html` verification file there as well; moving them into a documentation directory would disrupt search-engine discovery or site verification. Static deployment does not deploy the Node server, and there is no need to move to GitHub Pages.

**For your own instance**, these three must agree with your deployment:

1. The frontend API address in `js/ylta-1.js`
2. The `connect-src` policy in `_headers`
3. The server's `YLTA_ORIGIN`

Also update canonical URLs, metadata and documentation for your own domain.

## Import server

Details are in [mobile-server/README.md](mobile-server/README.md). Install and start it separately:

```bash
cd mobile-server
npm install
npm start
```

Configure the environment through your host, and never commit credentials. The server has basic origin checks, per-IP request limits and concurrency limits, but these are not user authentication. These safeguards are not a security certification.

## Companion tools

| Tool | Source | Download |
| --- | --- | --- |
| Windows exporter | [`tools/windows-exporter`](tools/windows-exporter) | `downloads/ylta-psn-sync-kit.zip` |
| PSNProfiles browser helper | [`tools/psnprofiles-helper`](tools/psnprofiles-helper) | `downloads/ylta-psnprofiles-browser-helper.zip` |

Other code to inspect: the [frontend JavaScript](js) and the [import-server source](mobile-server/mobile-api.mjs).

## Feedback and limitations

Use the Issues tab for ordinary bugs and feature requests. Include your device/browser, import method, reproduction steps and the error wording, with private data removed. The site's feedback page only generates a local text report and does not submit it automatically.

For potential vulnerabilities, read [SECURITY.md](SECURITY.md) before opening an issue.

**Known limitations**
- Phone imports depend on the external server and unofficial Sony endpoints.
- Large accounts may hit rate limits, skipped games or hosting timeouts.
- Browser data can be lost if site storage is cleared. Backups are your responsibility.
- There is no automatic cloud sync or guarantee of complete trophy coverage.
- Rarity values depend on the source and on when the data was retrieved.
- Live PSN imports and complete cross-browser compatibility have not been independently verified.

## For maintainers

Rebuild the matching companion-tool ZIP after changing a tool, so the downloadable copy doesn't drift from its source. The complete current source is available directly through GitHub.

## License

The original YLTA application and companion-tool source code is available under the [MIT License](LICENSE). This permits use and modification, including proprietary forks; it does **not** require network-operated modifications to be published. YLTA logos, brand artwork, and promotional imagery are **not** covered by the MIT source-code license. Third-party fonts and dependencies remain subject to their own license terms. See [assets/README.md](assets/README.md) for asset licensing.
