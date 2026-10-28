YourLTA PSN EXPORTER (not an EXE)
=========================================
This is Node.js export code using the same community psn-api package.
1. Install Node.js if necessary.
2. Extract the entire ZIP.
3. Double-click START-EXPORT.cmd.
4. Sign in on the PlayStation website opened automatically. Return to the CMD window and press a key.
5. The Sony NPSSO page opens automatically; refresh it if needed and copy the npsso value.
6. Paste the token into the terminal (never send it to anyone).
7. Wait for the JSON to be saved in this folder.
8. YourLTA -> Import -> PlayStation Network -> choose trophy-ledger-export.json.

No pairing server. No automatic browser transfer. No EXE.
Windows may still warn about downloaded CMD scripts. This cannot be eliminated by changing JavaScript code.
If the CMD launcher is blocked, open CMD in the folder and run:
npm.cmd install
node.exe export.mjs

Notes:
- Keeps separate PS4/PS5 trophy lists using their Sony trophy-set IDs.
- JSON format is compatible with the previous exporter.
- Requires internet and unofficial PlayStation endpoints; Sony may change them.
- Do not publish or share NPSSO tokens.
