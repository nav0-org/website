---
title: 'Honest UA vs Spoofed UA: A Field Report on What Actually Breaks'
description: 'A concrete list of what breaks when an indie browser lies about being Chromium — Client Hints, bot defenses, passkeys, DRM, Web Push, store installs, analytics, and more — written for other indie browser teams.'
date: 2026-05-28
author: Ketan Patil
category: open-web
lastReviewed: 2026-05-28
tldr: >-
  Spoofing your User-Agent as Chrome looks like a free compatibility win and isn't. Sec-CH-UA Client Hints, JA4 TLS fingerprints, Sec-Fetch headers, Widevine version checks, FCM endpoint shapes, passkey UI paths, Chrome Web Store installs, and at least a dozen other surfaces compare the UA against a second signal you cannot easily fake. When the two disagree, sites break in confusing ways. The honest UA — `Nav0/X.Y.Z Chrome/N.N.N.N` — costs almost nothing and survives every cross-check.
tags: [indie-browsers, engineering, open-web, browsers]
head:
  - - meta
    - property: og:type
      content: article
  - - meta
    - property: article:published_time
      content: '2026-05-28'
  - - meta
    - property: article:author
      content: Ketan Patil
  - - meta
    - property: article:tag
      content: indie-browsers
  - - meta
    - property: article:tag
      content: engineering
  - - meta
    - property: article:tag
      content: open-web
  - - meta
    - property: article:tag
      content: browsers
  - - meta
    - name: keywords
      content: 'user agent spoofing, browser user agent, sec-ch-ua client hints, indie browser engineering, electron browser user agent, chromium user agent, bot detection, cloudflare browser fingerprint, JA4 TLS fingerprint, widevine drm chrome, web push FCM endpoint, chrome web store install, passkey webauthn user agent, browser identity, honest user agent, nav0 user agent'
  - - script
    - type: application/ld+json
    - |
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Honest UA vs Spoofed UA: A Field Report on What Actually Breaks",
        "description": "A concrete list of what breaks when an indie browser lies about being Chromium — Client Hints, bot defenses, passkeys, DRM, Web Push, store installs, analytics, and more — written for other indie browser teams.",
        "datePublished": "2026-05-28",
        "author": { "@type": "Person", "name": "Ketan Patil", "url": "https://nav0.org/about" },
        "publisher": {
          "@type": "Organization",
          "name": "Nav0",
          "url": "https://nav0.org",
          "logo": { "@type": "ImageObject", "url": "https://nav0.org/logo.svg" }
        },
        "mainEntityOfPage": "https://nav0.org/blog/honest-ua-vs-spoofed-ua-field-report",
        "keywords": ["user agent spoofing", "sec-ch-ua client hints", "indie browser engineering", "electron user agent", "bot detection", "JA4 TLS fingerprint", "widevine DRM", "web push FCM", "Chrome Web Store install", "passkey webauthn", "honest user agent"]
      }
---

# Honest UA vs Spoofed UA: A Field Report on What Actually Breaks

<p style="color: var(--vp-c-text-2); font-size: 0.9rem;">By Ketan Patil &middot; May 28, 2026 &middot; 12 min read</p>

Every indie browser team eventually has the same argument. Should our User-Agent string be honest — naming the product the user actually installed — or should it pretend to be Chrome to make sites work?

The case for lying is easy to write on a whiteboard. "Sites sniff for Chrome. If we don't say Chrome, things break. We can fix that with one line of code." The case for honesty is harder to argue in the abstract, because it lives in the long tail of things that quietly stop working once the UA and the rest of the browser stop matching.

Nav0 ships an honest UA. We have for every release. What follows is the field report — the concrete list of what breaks when you lie about being Chromium, drawn from the surfaces we hit while building and shipping the browser, and from issues other indie teams have run into in the wild. Some of these are obvious. Some of them are not. Together they're the reason we stopped considering UA spoofing as a real option.

## What "honest" and "spoofed" actually mean

For the rest of this post, two shapes of `User-Agent` header. Both are real strings a Chromium-based browser might send today.

**Honest UA** — names the product, then declares Chromium ancestry so version-aware sniffing still works:

```
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36
(KHTML, like Gecko) Nav0/0.3.0 Chrome/130.0.0.0 Safari/537.36
```

**Spoofed UA** — strips the product name out so the string is byte-for-byte indistinguishable from upstream Chrome:

```
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36
(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36
```

The honest UA is what Edge, Brave, Vivaldi, Opera, and Samsung Internet all ship — every Chromium downstream that has any self-respect declares itself. The spoofed UA is the path of least resistance some Electron apps and some smaller forks have taken, on the theory that "Chrome works everywhere."

The premise of this post is that the second string is more expensive to ship than the first, even though it looks free. Here is where the cost shows up.

## The cross-check problem

Every item below is a variant of the same underlying problem. The User-Agent header is no longer the only signal sites have. It is one signal in a set that, on a real Chrome install, all agree with each other. When you ship a UA that doesn't match the rest of the set, something is going to notice — and the something is rarely the one you predicted.

Modern fingerprinting and modern feature detection both depend on cross-checking. The UA is the easiest part of that to fake. Everything else is much harder.

<BlogAnimation scene="fingerprint" />

## What breaks

### 1. Sec-CH-UA Client Hints

This is the big one. Chromium sends a set of low-entropy User-Agent Client Hints by default on every navigation:

```
Sec-CH-UA: "Chromium";v="130", "Nav0";v="0.3", "Not?A_Brand";v="99"
Sec-CH-UA-Mobile: ?0
Sec-CH-UA-Platform: "macOS"
```

The `Sec-CH-UA` brand list is constructed by Chromium itself, from the embedder's branding configuration. If you spoof the UA string but don't also override the brand list, your `Sec-CH-UA` header will still announce your real product. The two headers will tell different stories on the same request, and any backend that reads both — Cloudflare, Akamai, Datadome, PerimeterX, every bot defense vendor — will flag the mismatch.

The fix isn't "override the brand list too." Brand reduction is a deliberate Chromium design: the brand list is the canonical structured identity, and the legacy UA string is meant to fade out. Lying in both is twice the surface area to keep in sync, every Chromium update.

The honest UA matches the brand list out of the box. There is nothing to keep in sync.

### 2. TLS fingerprints (JA3, JA4)

Bot defenses don't trust the UA string on its own; they pair it with a fingerprint of the TLS ClientHello. JA3 was the original; JA4 is the current standard and is much more discriminative. Chrome, Edge, Brave, and other Chromium browsers each have slightly different JA4 fingerprints because of their network stack configuration, the ALPN order, the GREASE values they pick, and post-quantum key share rollouts that ship on different schedules.

If you spoof the UA but your JA4 is the standard Chromium fingerprint plus your own customizations, you don't look like Chrome. You look like a thing pretending to be Chrome — which is exactly the bucket Cloudflare's bot management is trained to flag. The honest UA matches whatever your network stack actually looks like, and bot defenses will recognize you as "Chromium-derived, not standard Chrome, probably fine." Lying makes you look like a scraper.

### 3. Sec-Fetch-* metadata

`Sec-Fetch-Site`, `Sec-Fetch-Mode`, `Sec-Fetch-Dest`, and `Sec-Fetch-User` are sent on every fetch and describe the navigation's provenance. They were designed in part as a defense-in-depth signal: a real browser sends them, a scraper rarely does. If your UA claims to be Chrome 130 but the request is missing `Sec-Fetch-User` on a top-level navigation (because some embedder layer stripped it), you are visibly not Chrome. Honest UA, honest fetch metadata, no inconsistency.

### 4. Cloudflare, Datadome, and the bot-management tier

Every major bot defense fuses the signals above with JavaScript-side checks: `navigator.userAgent`, `navigator.userAgentData`, the `Sec-CH-UA` headers, the order of headers, the TLS fingerprint, the WebGL renderer string, the canvas fingerprint, the audio context fingerprint, and the timing of all of the above. They are explicitly looking for headless or spoofed clients.

The empirical result is consistent across our testing and reports from other indie teams: a browser shipping an honest UA gets the "real browser" treatment from these vendors. A browser shipping a spoofed UA gets challenged more often, hits more CAPTCHAs, and has more transactions interrupted. The reason isn't that the vendor has a list of indie browsers and is being mean to them. It is that the spoofed UA produces a signature that statistically looks like a scraper, and the bot defense is doing its job.

### 5. Chrome Web Store and other Chrome-only install flows

The Chrome Web Store explicitly checks `navigator.userAgent` and refuses to install extensions on non-Chrome UAs. If you spoof, you can install — and then the extension breaks in your shell because you don't ship the full Chrome extension surface. If you ship an honest UA, the store refuses, and your users see a clean "this browser isn't supported" message instead of an extension that half-works.

This generalizes. "Add to Chrome", "Open in Chrome", and "Update Chrome" prompts all run UA-driven copy. If your UA says Chrome, your users get prompts to perform actions that aren't applicable to them and won't work. If your UA names your browser, the same prompts gate themselves out automatically, or the site shows a generic "your browser" path.

### 6. WebAuthn and passkeys

WebAuthn flows can vary their UI based on UA. Sites do this for legitimate reasons — Chrome on Windows has a different platform authenticator path than Chrome on macOS, and the in-page copy adapts. A spoofed UA will land you in the wrong copy path on at least some flows, and on a handful of identity providers we tested, the WebAuthn ceremony itself fails or stalls because the page expects a specific browser-side affordance (the Chrome inline UI, the iCloud Keychain prompt, the Windows Hello dialog) and yours doesn't match.

Worse, some identity vendors maintain UA allowlists for passkey enrollment. A non-Chrome UA gets routed to the "use a security key" path automatically. A spoofed Chrome UA on a non-Chrome browser hits the "use Chrome's built-in passkey UI" path, the page calls a Chrome-specific affordance that isn't there, and the flow dies silently.

### 7. Widevine and DRM

Streaming services check the UA against their Widevine entitlement table. Netflix, Spotify Web Player, Hulu, Disney+, and the BBC iPlayer all do some flavor of this. The check isn't only "do you have Widevine" — it's "are you the specific UA + CDM version combination we've licensed."

If you ship Widevine L3 but spoof a Chrome UA, the service believes you are Chrome and expects the Chrome CDM behavior. Subtle behavioral differences (output protection negotiation, key rotation cadence, hardware-binding signals) lead to failed playback or downgraded resolution. The honest UA tells the service "Chromium-derived, here is my Widevine version, please serve me what you serve other downstreams" — and we generally get clean L3 SD playback, which is what we offer anyway.

There are streaming services that simply won't serve a non-Chrome UA. That's their call, not ours. We'd rather have a "your browser is not supported" message than a half-broken playback experience.

### 8. Web Push and the FCM endpoint shape

Web Push subscriptions hand the application server an endpoint URL. On Chrome, that endpoint is on `fcm.googleapis.com`. On Firefox it's on Mozilla autopush. On Safari it's on Apple's push service. Application servers — especially older ones — sometimes hard-code the FCM endpoint shape based on the browser's UA.

If you spoof as Chrome, the application server expects an FCM endpoint and may construct payloads accordingly. If your push provider is different, or if you (correctly) decline to ship Google's push service in an indie browser, the server's expectations break in a way that surfaces as "notifications don't arrive" rather than as a clean error. The honest UA gives the server a chance to route correctly or to gracefully degrade.

Nav0 doesn't ship Web Push at all — it's on the [un-features list](/guide/un-features) — but the issue applies to any indie browser that does.

### 9. CDN edge variants

Several large CDNs serve different JavaScript bundles depending on the UA. The official line is "we polyfill for older browsers." The practical line is that the modern bundle is tested against Chrome and assumes Chrome-specific timings, event ordering, or APIs that may or may not exist in your downstream. Spoofing the UA forces you onto the modern bundle even when you don't actually match the assumptions baked into it; an honest UA lets the CDN pick the right bundle, or gives you a fallback path if you don't match anything.

The clearest version of this we've seen: a CDN bundle that called `navigator.scheduling.isInputPending()` — a Chromium-only API that Chrome ships and at least one Chromium downstream had compiled out. With a spoofed UA the bundle was served, the call threw, and an unrelated UI broke. With an honest UA the CDN fell back to the safe path and everything worked.

### 10. CORS preflight and origin-check heuristics

Some origins check the UA in their CORS preflight handler. The legitimate use case is "deny preflight from known scrapers." The practical effect on indie browsers is unpredictable: an origin we ran into would 403 preflight if the UA contained Chrome but didn't match a specific Chrome version range, presumably because they'd hardcoded a workaround for a Chrome bug that no longer applied. An honest UA wasn't on their list at all, so the preflight succeeded under the default policy.

You will hit cases like this. They are bugs in the origin, not in your browser. But they are bugs you trigger by spoofing, not by being honest.

### 11. A/B test bucketing

Sites that A/B test variants by UA bucket spoofed indie browsers into the Chrome bucket, where they don't actually belong. The user gets a variant designed for and validated against Chrome, and any UI that depended on a Chrome-only feature (custom scrollbars, view transitions, scroll-driven animations on a version range we don't yet match) gets rendered into an environment where it doesn't quite work.

This is mostly invisible. The site looks weird, the user shrugs, and your support ticket count goes up because users blame your browser. The honest UA puts you outside the bucketed cohort and either lands you in the control or gives you a clean "unknown browser, serve the default" path.

### 12. Analytics, telemetry, and your own support funnel

This one is on us, not the user.

When a user files a bug report against an indie browser shipping a spoofed UA, the support team has nothing to go on. The HAR file says Chrome. The site's logs say Chrome. The user says "Nav0." If a bug is browser-specific (and most of the long-tail ones are), the team is now triaging a ghost.

With an honest UA, your name is in every server log on every site the user visited. You can search for it in HAR captures. Site operators can identify your browser as the source of unusual behavior and reach out. When a CDN sees a request pattern they don't understand, they can grep for `Nav0` and find you. The cost of being identifiable as an indie browser is greatly outweighed by the value of being identifiable at all.

### 13. Site-operator goodwill

A non-trivial number of sites that "didn't support Brave" or "didn't support Edge" started supporting them once the site operators noticed real traffic from a recognizable UA in their logs. None of those operators would have noticed traffic that looked exactly like Chrome.

The single most effective lobbying for indie browsers is showing up in server logs. Spoofing makes you invisible. Honesty puts you on the dashboard.

## What honest UA does not fix

Honest UA is not a cure-all. It is the floor, not the ceiling. A few things it does not solve:

- **Sites that hard-block non-Chrome UAs.** A small number of corporate, banking, and government portals refuse anything that doesn't match a specific Chrome version. Honest UA won't get you in. Neither will spoofing, reliably — the next check (Client Hints, Widevine version, an installed extension's existence) will catch the lie. The right move here is to surface the block clearly to the user and let them choose to open the site in another browser.
- **Sites that test Chrome-only Web APIs without sniffing the UA.** If a site uses File System Access API and you don't ship it, no UA string changes the outcome. You either ship the API or you don't.
- **Sites that fingerprint aggressively.** Fingerprinting doesn't care about the UA at all; it cares about canvas, WebGL, audio, fonts, and timing. UA honesty doesn't help here; what helps is shipping the kinds of anti-fingerprinting defaults that browsers like Tor and LibreWolf have invested in.

Those are real limitations. The point of an honest UA isn't to fix everything. It's to stop creating problems that don't otherwise exist.

## The pattern that ties it together

If you read the list with a slightly squinted eye, every one of those failure modes has the same shape:

1. A site or platform compares the UA against a second signal.
2. The second signal is not something you can spoof without forking Chromium itself.
3. The mismatch surfaces as a failure that doesn't name the UA as the cause.

This is the reason spoofing never feels like a clear win. The benefits show up in the first week: "the site loads now, look how easy that was." The costs show up later, scattered across support tickets, half-broken passkey flows, mystery streaming downgrades, more CAPTCHAs than peers, and an operations team that can't reproduce anything. Each individual cost is small. The aggregate is the difference between an indie browser that feels like an indie browser and one that feels broken.

## What we'd tell another indie browser team

1. **Ship the honest UA from day one.** Add your product token, keep the Chromium ancestry. Brave's, Edge's, Vivaldi's, and Samsung Internet's strings are good shapes to copy.
2. **Make the brand-list and the UA agree.** If you're on Chromium, set your `Sec-CH-UA` brand to match the product token in your UA. They are a unit; treat them as one.
3. **Don't strip `Sec-Fetch-*` or reorder TLS extensions to "look more like Chrome."** You will look less like Chrome, not more.
4. **Resist the temptation to ship a "compatibility mode" that flips the UA to Chrome.** It will be enabled by the first user who hits any of the issues above, and then every other issue above lands silently in their lap.
5. **Log your name in your CDN's logs, your support tool, and your crash reporter.** If you're going to be honest in the UA, lean into it everywhere.

The honest UA is one of those decisions that costs almost nothing on the day you make it and quietly compounds in your favor for the lifetime of the browser. The spoofed UA is the opposite — it saves one bug report on launch day and pays for it with a long tail of mysteries.

## Nav0's position

We ship `Nav0/X.Y.Z` as part of our UA, our brand list matches, and we don't have a "say I'm Chrome" toggle. We don't plan to ship one.

The web has too many silent cross-checks. Lying about which browser you are is no longer a free move, even if it ever was. The path that actually scales — for us, and for the rest of the indie browser scene — is to ship the honest string, name yourself in the logs, and fix the genuine compatibility issues that surface, one at a time, with the operators who can do something about them.

If you're building an indie browser and you're still on the fence: we'd love to see your token in our server logs too.

---

_Nav0 is a minimal, privacy-focused browser that collects zero data. It's open source, free, and built on the belief that your browser should do one thing well: let you browse the web. [Get started](/guide/getting-started)._
