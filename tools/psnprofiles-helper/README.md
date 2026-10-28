# YLTA PSNProfiles Tab Collector (for Brave / Chrome desktop)

**Unofficial independent helper. Not associated with PSNProfiles or Sony.**

This optional extension reads **only pages already open in your browser**, when you click Capture. It does not crawl, bypass blocks, fetch pages, log in, retrieve passwords or NPSSO, or send data to a server. It stores collected trophy names and rarity percentages locally in extension storage and exports a JSON file to your PC.

## Installation (developer mode; no browser store account)
1. Extract the ZIP into a permanent folder (do not run it from inside the ZIP).
2. Open `brave://extensions` in Brave or `chrome://extensions` in Chrome.
3. Turn on **Developer mode**.
4. Click **Load unpacked** and select the extracted folder containing `manifest.json`.
5. Optionally pin YLTA Tab Collector to the toolbar.

## Capture several games in one file
1. Open multiple PSNProfiles **game trophy list** pages in browser tabs (not your general profile or an individual trophy detail page).
2. Click the YLTA extension icon → **Capture all open trophy tabs**. This reads only the pages you opened yourself.
3. Open another set of game pages and click Capture again. Captured pages persist until you clear them.
4. Click **Export YLTA import file (.json)**.
5. In YLTA → Import / Export → PSNProfiles percentages, select that JSON file, **Analyze**, review game matches, and **Apply**.

If your browser or PSNProfiles will not display a page, the helper cannot retrieve it. This is **not a one-click downloader for an entire account**. Do not use automation to evade rate limits, CAPTCHAs or site access rules. Only extract content you are permitted to access.

Data is stored in browser extension storage. Removing or resetting the extension deletes this cached collection. It does not change your YLTA trophy database until you explicitly import the JSON.
