# YourLTA — Your Local Trophy Analyzer

![YourLTA trophy analytics logo](assets/ylta-brand.png)

**Your trophies. Your next challenge.**

A free browser app for PlayStation trophy hunters: explore collection statistics, compare trophy rarity, set personal goals and create shareable hunter cards.

**[Try the public beta](https://yourlta.pages.dev/)** · **[Privacy policy](https://yourlta.pages.dev/privacy.html)** · [Contributing](CONTRIBUTING.md)

Created by **Hassan Al-Khafaji**. Built with AI assistance and undergoing beta testing. Independent project; not affiliated with Sony, PlayStation or PSNProfiles.

## Features

- Collection overview, completion progress and trophy statistics.
- Search, sorting, rarity filters, platform filters and starred trophy targets.
- PSN rarity, with optional PSNProfiles rarity from separately imported data.
- Personal goals, checklists and collection-based progress.
- Custom hunter cards with PNG export.
- JSON backup/restore and CSV export.
- Phone/web import and an alternative local Windows exporter.

![YourLTA public beta graphic](assets/promo/yourlta-social.png)

The graphic is promotional artwork, not an application screenshot. The feature video uses sample data and illustrative visuals.

## Import methods and privacy

| Method | Where NPSSO goes | Where the collection is saved |
|---|---|---|
| Phone / web import | Sent over HTTPS to the YourLTA-operated import server on Render, which communicates with Sony | This browser after reviewing and applying |
| Local Windows exporter | Used by the exporter running on your PC to communicate with Sony; not sent to the YourLTA import server | Exported JSON on your PC, then this browser when imported |
| Existing JSON / CSV file | The browser file import does not require NPSSO | This browser |

**NPSSO is a sensitive account credential. Never put it in issues, screenshots, messages or commits.** Both PSN retrieval methods use unofficial PSN access; availability and account safety are not guaranteed. Sony changes or request limits can interrupt imports.

The supplied import-server code does not intentionally persist NPSSO or log request bodies. That statement describes this source, not an independent audit or proof of what is deployed. Hosting infrastructure may process technical information.

The app saves trophies, goals and preferences using IndexedDB with a localStorage fallback. There is no automatic cross-device cloud sync. Export a JSON backup before clearing browser storage or changing domains. External fonts and hosting involve third parties. This source does not include a visitor-analytics script; dashboard-configured injection on a deployed host is separate and should be disclosed if enabled.

## Rarity: two different sources

PSN percentages and PSNProfiles percentages represent different populations. They are labeled separately in the app and should not be treated as interchangeable. PSNProfiles rarity is an optional enhancement imported using saved pages or the browser helper; it is not automatically included with every PSN import and missing values are not fabricated.

## Run the frontend locally

No frontend build is required. From the repository root, run:

```sh
python -m http.server 8000
```

Open `http://localhost:8000`. JSON/CSV file import, local storage and most frontend features can be explored locally. Phone/web import cannot run from a `file:` URL, and the production import server only accepts its configured origin; a local frontend therefore cannot use it without a separately configured server.

## Deploy the website

The current public website is hosted on Cloudflare Pages. Keep `index.html`, `js/`, `assets/`, `downloads/` and `_headers` at the deployment root. Static deployment does not deploy the Node server. There is no need to move hosting to GitHub Pages to publish this repository.

For a separate instance, the frontend API address in `js/ylta-1.js`, the `connect-src` policy in `_headers`, and the server's `YLTA_ORIGIN` must agree with your deployment. Update canonical URLs, metadata and documentation for your own domain.

## Import server

See [mobile-server/README.md](mobile-server/README.md). Install dependencies and start it separately:

```sh
cd mobile-server
npm install
npm start
```

Configure the environment through your host; never commit credentials. The server has basic origin checks, request limits and concurrency limits, but these are not user authentication. This beta is not a production security certification.

## Inspect the companion tools

- [Windows exporter source](tools/windows-exporter/) — also distributed in `downloads/ylta-psn-sync-kit.zip`.
- [PSNProfiles browser helper source](tools/psnprofiles-helper/) — also distributed in `downloads/ylta-psnprofiles-browser-helper.zip`.
- [Frontend JavaScript](js/).
- [Import-server source](mobile-server/mobile-api.mjs).

Editable tool source is included for inspection. Rebuild the corresponding download ZIP after changing a tool so the downloadable copy does not drift from its source. Likewise, regenerate the versioned source-download ZIP when updating the app.

## Feedback and known limitations

Use this repository's Issues tab for ordinary bugs and feature requests once it is published. Include device/browser, import method, reproduction steps and error wording with private data removed. The site's feedback page only generates a local text report; it does not submit it automatically.

- Phone imports depend on the external server and unofficial Sony endpoints.
- Large accounts may encounter rate limits, skipped games or hosting timeouts.
- Browser data can be lost if site storage is cleared; backups are your responsibility.
- There is no automatic cloud sync or guarantee of complete trophy coverage.
- Rarity values depend on the source and when the data was retrieved.
- Live PSN imports and complete cross-browser layout were not verified in the packaging environment. Targeted import-review, delete-confirmation and summary logic checks passed during development.

For potential vulnerabilities, read [SECURITY.md](SECURITY.md) before opening an issue.

## Licensing

No project license has been selected yet. Publishing this repository does not itself grant a general license to reuse or redistribute its original code or artwork. Third-party libraries retain their own licenses. A license can be added after the owner chooses one and reviews the included third-party material.
