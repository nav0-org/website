---
title: 'Privacy Policy — Nav0 Browser'
description: 'How Nav0 collects zero data, with links to the source code that proves it. No telemetry, no phoning home, fully verifiable.'
eyebrow: Legal
tagline: "What Nav0 does and doesn't do with your data — and the exact source code that proves each claim."
---

# Privacy Policy

_Last reviewed: May 29, 2026_

This page documents what Nav0 does and does not do with your data, and links to the specific source code that proves each claim. Nav0 collects nothing. Here is how to verify that.

## What Nav0 does not collect

I built Nav0 so there is no telemetry to switch off — there is none to begin with. None of the following is collected, logged, or transmitted, and because the browser is open source you can confirm each absence yourself with a code search that turns up no collection code:

- **Telemetry and usage analytics** — search the repository for [`telemetry`](https://github.com/search?q=repo%3Anav0-org%2Fnav0-browser+telemetry&type=code) and [`analytics`](https://github.com/search?q=repo%3Anav0-org%2Fnav0-browser+analytics&type=code). There is no event pipeline, no metrics, and no experiment identifiers.
- **Browsing data** — visited URLs, search queries, and navigation are never sent anywhere. The only history that exists is the local record in [`browsing-history-manager.ts`](https://github.com/nav0-org/nav0-browser/blob/main/src/main/browser/browsing-history-manager.ts), and it is skipped entirely in private mode.
- **Device and system fingerprints** — search for [`fingerprint`](https://github.com/search?q=repo%3Anav0-org%2Fnav0-browser+fingerprint&type=code). Nav0 has no code that catalogs your hardware, OS, fonts, or screen to build an identifier. The [user-agent switcher](https://github.com/nav0-org/nav0-browser/blob/main/src/main/browser/ua-switcher.ts) exists to reduce what *sites* can fingerprint, not to profile you.
- **Network identifiers** — your IP address, location, and connection details are never recorded by Nav0, because there is no server of mine for them to reach.
- **Crash reports** — search for [`crashReporter`](https://github.com/search?q=repo%3Anav0-org%2Fnav0-browser+crashReporter&type=code). There is no crash-reporting or error-tracking dependency in [`package.json`](https://github.com/nav0-org/nav0-browser/blob/main/package.json), and the reporter is never enabled.

## Where your data lives

Everything Nav0 stores stays on your machine, inside your operating system's per-user application-data directory:

- **Windows:** `%APPDATA%\Nav0\`
- **macOS:** `~/Library/Application Support/Nav0/`
- **Linux:** `~/.config/Nav0/`

| Data | Where it lives | Source |
| ---- | -------------- | ------ |
| Bookmarks | `database.db` (SQLite) | [`bookmark-manager.ts`](https://github.com/nav0-org/nav0-browser/blob/main/src/main/browser/bookmark-manager.ts) |
| History | `database.db` — held in memory only, never written to disk, in private mode | [`browsing-history-manager.ts`](https://github.com/nav0-org/nav0-browser/blob/main/src/main/browser/browsing-history-manager.ts) |
| Download records | `database.db`; the downloaded files go to the folder you choose | [`download-manager.ts`](https://github.com/nav0-org/nav0-browser/blob/main/src/main/browser/download-manager.ts) |
| Settings and preferences | `config.json` in the same directory | [`settings-enforcer.ts`](https://github.com/nav0-org/nav0-browser/blob/main/src/main/settings/settings-enforcer.ts) |

The database file is created with `better-sqlite3` at `path.join(app.getPath('userData'), 'database.db')` — see [`database-manager.ts`](https://github.com/nav0-org/nav0-browser/blob/main/src/main/database/database-manager.ts). Delete that folder and the data is gone, because it was never anywhere else.

## What network requests Nav0 makes

Apart from loading the pages you navigate to, Nav0 initiates no network requests of its own:

- **Ad and tracker blocking is fully local.** The blocklist is compiled into the app as a static list — Nav0 does *not* download or update filter lists from EasyList or anywhere else. See [`ad-block-lists.ts`](https://github.com/nav0-org/nav0-browser/blob/main/src/main/ad-blocker/ad-block-lists.ts).
- **No certificate phone-home from Nav0.** [`ssl-manager.ts`](https://github.com/nav0-org/nav0-browser/blob/main/src/main/browser/ssl-manager.ts) only renders a local warning page and remembers your choice; certificate validation for the sites you visit is handled by Chromium's native verifier, not by a Nav0 server.
- **Fewer background connections, not more.** On startup Nav0 disables Chromium's cast/mDNS discovery features (`MediaRouter`, `DialMediaRouteProvider`, `GlobalMediaControls`) — see [`index.ts`](https://github.com/nav0-org/nav0-browser/blob/main/src/main/index.ts) — so the browser does not chatter on your local network.

The only traffic is between you and the sites you choose to open.

## What Nav0 does not phone home for

- **No auto-update server.** There is no `electron-updater`, `update-electron-app`, or Electron `autoUpdater` in [`package.json`](https://github.com/nav0-org/nav0-browser/blob/main/package.json); Nav0 never checks for updates in the background. You update by downloading a new build when you choose to.
- **No analytics or telemetry endpoint.** Search the repo for [`analytics`](https://github.com/search?q=repo%3Anav0-org%2Fnav0-browser+analytics&type=code) or [`telemetry`](https://github.com/search?q=repo%3Anav0-org%2Fnav0-browser+telemetry&type=code) — there is no endpoint to send anything to.
- **No crash-reporting service.** No Sentry, no upload — search [`crashReporter`](https://github.com/search?q=repo%3Anav0-org%2Fnav0-browser+crashReporter&type=code).
- **No accounts or sync.** There is no sign-in, so there is no identity to transmit and nothing to synchronize to a server.

## How to verify this yourself

You do not have to take my word for any of it:

1. **Read the source** — every line is public at [github.com/nav0-org/nav0-browser](https://github.com/nav0-org/nav0-browser).
2. **Build it yourself** — reproduce the binaries from source by following [Build from source](/install#source).
3. **Watch the wire** — run Nav0 behind Wireshark (any OS) or Little Snitch (macOS) and confirm that, apart from the sites you open, nothing leaves your machine.

## What this means legally

Because Nav0 collects no personal data, it complies with the GDPR, CCPA/CPRA, and COPPA by construction rather than by policy. There is no data to access, delete, export, or sell, so there is nothing to request and nothing to hand to law enforcement. That is an architectural fact, not a promise I could quietly walk back.

## Changes and contact

All changes to this document are public in the Git history: [privacy-policy.md history](https://github.com/nav0-org/website/commits/main/docs/privacy-policy.md). Questions or concerns go to [GitHub Issues](https://github.com/nav0-org/nav0-browser/issues).
