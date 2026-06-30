---
title: 'What chrome://flags Actually Does: The Privacy-Relevant Flags'
description: 'What the privacy-relevant chrome://flags actually do, their current defaults, and why flipping experimental flags usually hurts your privacy more than it helps.'
date: 2026-06-24
author: Ketan Patil
category: privacy
lastReviewed: 2026-06-24
tldr: >-
  chrome://flags is a registry of half-finished experiments, not a privacy
  control panel. The settings that actually protect you — Encrypted Client
  Hello, storage partitioning, WebRTC IP masking, a trimmed User-Agent — already
  graduated to defaults, so the flags are gone. The ones still labeled "Privacy
  Sandbox" are Google's ad-tech, now being removed. Flipping experimental flags
  mostly enlarges your fingerprint and runs less-audited code. Leave them on
  Default.
tags: [privacy, chrome, browsers]
head:
  - - meta
    - property: og:type
      content: article
  - - meta
    - property: article:published_time
      content: '2026-06-24'
  - - meta
    - property: article:author
      content: Ketan Patil
  - - meta
    - property: article:tag
      content: privacy
  - - meta
    - property: article:tag
      content: chrome
  - - meta
    - property: article:tag
      content: browsers
  - - meta
    - name: keywords
      content: 'chrome flags privacy, chrome://flags explained, best privacy chrome flags, are chrome flags safe, encrypted client hello flag, third-party storage partitioning, privacy sandbox flags removed, chrome flags fingerprinting, reduce user agent flag, test third-party cookie phaseout, enable-experimental-web-platform-features, what does chrome flags do'
  - - script
    - type: application/ld+json
    - |
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "What chrome://flags Actually Does: The Privacy-Relevant Flags",
        "description": "What the privacy-relevant chrome://flags actually do, their current defaults, and why flipping experimental flags usually hurts your privacy more than it helps.",
        "datePublished": "2026-06-24",
        "author": { "@type": "Person", "name": "Ketan Patil", "url": "https://nav0.org/about" },
        "publisher": {
          "@type": "Organization",
          "name": "Nav0",
          "url": "https://nav0.org",
          "logo": { "@type": "ImageObject", "url": "https://nav0.org/logo.svg" }
        },
        "mainEntityOfPage": "https://nav0.org/blog/what-chrome-flags-actually-does",
        "keywords": ["chrome flags", "chrome://flags", "privacy", "Privacy Sandbox", "Encrypted Client Hello", "storage partitioning", "browser fingerprinting", "experimental features"]
      }
  - - script
    - type: application/ld+json
    - |
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Can chrome://flags make Chrome more private?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Mostly no. The big privacy upgrades people associate with flags — Encrypted Client Hello, third-party storage partitioning, WebRTC local-IP masking, and the trimmed User-Agent — already graduated to defaults, so there is no flag left to flip. The experimental flags that remain are not privacy controls; turning them on usually expands your fingerprint and runs less-audited code."
            }
          },
          {
            "@type": "Question",
            "name": "Is it safe to change chrome://flags?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "They are explicitly experimental. Chrome warns at the top of the page that enabling them can lose data or compromise your security and privacy. Changes apply to every profile in that browser, Incognito included, can break sites, and may be silently reset or removed when Chrome updates. For almost everyone, leaving a flag on Default is the correct and safest setting."
            }
          },
          {
            "@type": "Question",
            "name": "What privacy flags should I enable in Chrome?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Almost none. Hardening lists that tell you to enable Encrypted Client Hello, WebRTC mDNS masking, storage partitioning, or User-Agent reduction are out of date — those protections are already on by default and their flags have been retired. Enabling additional experimental flags generally makes your browser more identifiable, not less."
            }
          },
          {
            "@type": "Question",
            "name": "Does changing chrome://flags affect browser fingerprinting?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Fingerprinting works by measuring how your browser differs from everyone else's. A default configuration blends into a large crowd of identical installs. A custom set of enabled flags makes your browser behave unusually — exposing APIs or quirks most users don't have — which is easier for a site to single out and track across visits."
            }
          },
          {
            "@type": "Question",
            "name": "What happened to the Privacy Sandbox flags?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Google reversed its plan to remove third-party cookies in 2024, then began deprecating the Privacy Sandbox advertising APIs — Topics, Protected Audience, and Attribution Reporting — in late 2025, with removal scheduled across subsequent Chrome releases. The flags and the chrome://settings/adPrivacy controls tied to those APIs are being wound down rather than expanded."
            }
          }
        ]
      }
---

# What chrome://flags Actually Does: The Privacy-Relevant Flags

<p style="color: var(--vp-c-text-2); font-size: 0.9rem;">By Ketan Patil &middot; June 24, 2026 &middot; 11 min read</p>

Type `chrome://flags` into the address bar and Chrome greets you with a warning in orange: **"WARNING: EXPERIMENTAL FEATURES AHEAD! By enabling these features, you could lose browser data or compromise your security or privacy. Enabled features apply to all users of this browser."**

People skim past that banner and start flipping toggles anyway, usually after pasting a "privacy hardening" list from a forum. This post is the honest version of what's actually on that page, what the privacy-relevant entries really do, and why the banner means exactly what it says.

The short version, which I'll spend the rest of the post defending: **chrome://flags is a staging area for unfinished engineering work, not a privacy control panel.** The handful of flags that genuinely improved privacy have already done their job and disappeared — the behavior shipped as a default. Most of what's left either does nothing for privacy or actively works against it.

## What chrome://flags actually is

It helps to know what the page is _for_, because it isn't for you.

`chrome://flags` is where Chromium engineers expose features that aren't finished. A flag is a runtime switch around a code path that's still being tested, measured, or rolled out gradually. It's how a feature gets shipped to 1% of users, then 10%, then everyone — and how it gets pulled if the metrics look bad. The page exists so engineers, testers, and web developers can force a feature on or off regardless of where it is in that rollout.

That origin explains every frustrating thing about it:

1. **Flags are temporary.** A flag's whole lifecycle is "appear, get tested, graduate to a default or get deleted." Any given flag is on its way out by design. The ones you read about in a two-year-old guide are frequently just _gone_.
2. **"Default" is not "off."** Every flag has three states: **Default**, **Enabled**, **Disabled**. Default means "whatever Chrome ships for your version right now" — which can flip from off to on under you on the next update. Enabled and Disabled _pin_ the value and stop tracking the default. This matters more than it sounds, and I'll come back to it.
3. **Changes apply to the whole browser.** That last line of the warning is literal: a flag applies to every profile in that install, **including Incognito**. There's no per-window, per-profile, or per-site scoping. Flip a flag and you've changed your "private" windows too.
4. **Enabling a flag runs less-finished code.** A feature behind a flag hasn't completed rollout precisely because it isn't done — it may be slower, buggier, or less hardened than the shipping path. You are opting into a beta of one specific subsystem.
5. **Chrome can reset them.** Flags get marked "will be removed soon," expire between milestones, and occasionally get wiped on update. A setting you rely on for privacy is not a setting you should trust to persist.

None of that describes a privacy dashboard. It describes a workbench. Keep that framing and the rest follows.

## The privacy flags that already won — and vanished

Here's the part most "best privacy flags" lists get wrong. The genuinely important privacy improvements of the last few years _did_ start life as flags. Then they worked, graduated to defaults, and the flags were removed. If a guide tells you to go enable them, the guide is describing a browser from 2021 — and you already have the protection.

- **WebRTC local-IP masking.** WebRTC could leak your machine's private LAN address (`192.168.x.x`) to any page via ICE candidates — a classic side-channel. The fix was `#enable-webrtc-hide-local-ips-with-mdns`, which replaces that address with a random `.local` mDNS hostname. It was **removed from chrome://flags back in Chrome 91 (2021)** because the masking became the default. There is no flag to flip; you already have it.
- **Encrypted Client Hello (ECH).** ECH encrypts the one part of the TLS handshake that still leaked the hostname you were visiting to your ISP. It rode `#encrypted-client-hello` through its origin trial and **graduated to on-by-default around Chrome 117 (2023)**. In current builds the flag is often gone entirely; where it lingers, it only lets you _disable_ a protection you already have. (For what ECH does and why it matters, see [HTTP/3, QUIC, and ECH explained](/blog/http3-quic-ech-explained).)
- **Third-party storage partitioning.** This is the big one for cross-site tracking: it gives every embedded third party a _separate_ storage jar per top-level site, so a tracker on `news.com` and the same tracker on `shop.com` can't share state. It **shipped on by default in Chrome 115**, along with CHIPS (partitioned cookies). The old `#third-party-storage-partitioning` and `#partitioned-cookies` flags are vestigial.
- **User-Agent reduction.** Chrome spent 2022–2023 freezing and trimming the User-Agent string to cut the entropy it handed out — the `#reduce-user-agent-*` family of flags. That work **completed and the flags retired**; the trimmed UA is just how Chrome behaves now.

Four of the most-recommended "privacy flags" on the internet are protections you can't enable because you can't un-have them. That's the healthiest possible outcome for a flag: it stops being a flag.

## The flags labeled "privacy" that are being removed

The flags that _are_ still filed under privacy in current Chrome are the **Privacy Sandbox** entries — and they're going the opposite direction.

Privacy Sandbox was Google's proposed replacement for third-party cookies: a set of browser APIs (Topics, Protected Audience, Attribution Reporting) that would let advertisers target and measure without third-party cookies, by moving some of that machinery into the browser itself. Whatever you think of the premise — Nav0's position on ad-tech-in-the-browser is [not subtle](/blog/the-enshittification-of-chrome) — it's now largely moot:

- Google **walked back third-party-cookie deprecation in July 2024**, then in **April 2025 dropped** the planned standalone choice prompt. Third-party cookies stayed.
- With cookies staying, the sandbox lost its reason to exist. In **late 2025 Google filed to deprecate and remove** the core advertising APIs — Topics, Protected Audience, and Attribution Reporting — with removal staged across subsequent releases (Topics is slated to be removed around Chrome 150).

So the flags and the `chrome://settings/adPrivacy` controls tied to those APIs aren't a privacy win you should go enable; they're scaffolding being torn down. A few narrower pieces survive — CHIPS (partitioned cookies), FedCM, Private State Tokens — but those are plumbing, not toggles you visit chrome://flags to manage. If you want third-party cookies off today, the real control is in **Settings → Privacy and security → Third-party cookies**, not on the experiments page.

<BlogAnimation scene="flags" />

## The flags that still change something

After you set aside the graduated protections and the dying ad APIs, a handful of flags genuinely still affect privacy-adjacent behavior. Here's what they do, their default, and what flipping them costs you. Exact availability shifts between Chrome versions — treat the flag IDs as "as of mid-2026."

### `#enable-quic`

**Default: Enabled.** QUIC is the encrypted, UDP-based transport under HTTP/3. Leaving it on means more of your connection setup is encrypted and harder for middleboxes to inspect. **Disabling it** forces Chrome back onto TCP+TLS, giving up QUIC's tighter handshake encryption — a net _loss_ for privacy. The only reason to disable it is to debug a network that mishandles UDP. This is a flag where the privacy-correct value is the default.

### `#test-third-party-cookie-phaseout`

**Default: Disabled.** Enabling it makes Chrome behave as if third-party cookies are blocked — the "Tracking Protection" behavior Google tested on a slice of users. It's a legitimate way to _preview_ a cookie-free web and see what breaks. But it's a developer testing switch, not a durable setting: the supported, persistent control is the third-party-cookie toggle in Settings. Use the flag to experiment; use Settings to actually live there.

### `#enable-experimental-web-platform-features`

**Default: Disabled — and leave it there.** This is the flag most often mistaken for an "unlock advanced privacy" switch. It does the opposite. It turns on a whole batch of unfinished, unshipped web APIs at once. Every additional API is more surface for a site to probe and more entropy for a fingerprint — you're _expanding_ what pages can detect about you, while running the least-tested code in the browser. If a "privacy" guide tells you to enable this, stop reading that guide.

### `#block-insecure-private-network-requests`

**Default: varies by version (rolling out).** Private Network Access stops a public website from quietly making requests to private or localhost addresses on your network — the kind of attack that probes your router's admin panel or a local service from a page you just opened. Enabling the stricter blocking is one of the few flags that leans _toward_ safety, by shrinking what a hostile page can reach on your LAN. Chrome has been rolling this out gradually in warn-then-block phases; the flag lets you opt into the stricter behavior early.

### `#scroll-to-text-fragment`

**Default: Enabled.** This powers `#:~:text=` deep links — the ones that scroll you to and highlight a specific quote on a page. There was an early concern that text fragments could be used as a side channel to confirm whether some text exists on a page; the spec added restrictions (no cross-origin leakage on most paths, user-gesture and noisiness limits) that largely close it. The residual privacy cost is minor. **Disabling it** just turns off text-fragment scrolling and highlighting. Reasonable to leave on.

### `#heavy-ad-intervention`

**Default: Enabled.** Unloads individual ads that burn egregious CPU, bandwidth, or main-thread time. Not a privacy feature in the tracking sense, but it cuts off some of the worst resource-abusing ad units, which is a small win for [data consumption](/blog/nav0-vs-chrome-data-consumption) and battery. Leave it on.

## A reference table

| Flag | Default | What changing it does | Worth touching? |
| --- | --- | --- | --- |
| `#enable-quic` | Enabled | Disable → drops to TCP+TLS, less encrypted setup | No — keep default |
| `#test-third-party-cookie-phaseout` | Disabled | Enable → previews a no-3p-cookie web (testing only) | Use Settings instead |
| `#enable-experimental-web-platform-features` | Disabled | Enable → turns on unfinished APIs, **grows fingerprint** | No — leave off |
| `#block-insecure-private-network-requests` | Rolling out | Enable → blocks public sites probing your LAN/localhost | Mild safety upside |
| `#scroll-to-text-fragment` | Enabled | Disable → no `#:~:text=` scroll-to/highlight | Optional, minor |
| `#heavy-ad-intervention` | Enabled | Disable → stops unloading resource-abusive ads | No — keep default |
| `#encrypted-client-hello` | Graduated | Where present, only lets you **disable** ECH | No — already default |
| `#third-party-storage-partitioning` | Graduated | Vestigial; partitioning is on by default | No — already default |
| Privacy Sandbox ads APIs | Being removed | Ad-tech experiment, deprecated late 2025 | No — going away |

The pattern across the whole table: the privacy-positive entries are either already the default or barely matter, and the one flag people are most tempted to enable for "more control" — experimental web platform features — is the one that hurts most.

## The fingerprinting trap

There's a deeper reason a hand-tuned flags list backfires, and it's worth stating plainly because it's counterintuitive.

Browser fingerprinting doesn't care whether your settings are "more private" in the abstract. It cares whether your browser is _unusual_. A fingerprint is built by measuring dozens of small behaviors — which APIs exist, how they respond, what your headers say — and combining them into an identifier. The defense isn't to make each behavior maximally locked-down; it's to look **identical to as many other people as possible**. That's the entire design principle behind Tor Browser's uniformity, and it's why [spoofing your User-Agent usually makes you _easier_ to track, not harder](/blog/honest-ua-vs-spoofed-ua-field-report).

Every flag you flip moves you off the default configuration that millions of other Chrome installs share. Enable a clutch of experimental APIs and your browser now answers a feature-detection probe in a way almost no one else does. Disable QUIC and your network behavior stands out. You haven't hardened yourself; you've handed trackers a more distinctive silhouette. A "privacy-optimized" flags profile is frequently a _more_ identifiable one.

The crowd is the protection. chrome://flags is a tool for leaving the crowd.

## So what should you actually do?

Short and unglamorous:

1. **Leave flags on Default.** Default isn't laziness — it's the audited, shipping configuration the rest of the population is running. That's both the safest code path and the best place to hide.
2. **Don't paste hardening lists.** Most are stale (recommending protections that are already default) or actively harmful (recommending experimental features that grow your fingerprint). A list that hasn't been re-checked against the current Chrome can't be trusted.
3. **Use real settings for real controls.** Third-party cookies, site permissions, and Secure DNS live in `chrome://settings`, are supported, and persist. That's where actual privacy choices belong — not on a page that warns you it might eat your data.
4. **Remember the page changes under you.** Flags expire, reset, and graduate. Anything you set there is provisional by design.

The honest conclusion is almost anticlimactic: there is no secret privacy menu hidden in chrome://flags. The web-privacy wins of the last few years already reached you as defaults, and the experiments that remain are mostly someone else's unfinished work.

## Where Nav0 fits

Our whole approach is the opposite of a flags page. Privacy you have to discover, paste in, and re-check after every update isn't privacy you actually have — it's a chore you'll eventually skip.

Nav0 ships the good defaults baked in and the bad ideas removed. The transport-layer protections that graduated to defaults in Chromium — QUIC, ECH, storage partitioning, the trimmed User-Agent, WebRTC IP masking — you simply get, because Nav0 is built on modern Chromium. The ad-tech experiments and phone-home machinery we [stripped out entirely](/blog/what-we-stripped-from-chromium), so there's no Privacy Sandbox to manage and no telemetry to disable. And the riskier experimental APIs sit on our [un-features list](/guide/un-features) — not exposed, not togglable, not a footgun.

There's no roulette wheel of toggles because there doesn't need to be one. A browser whose default state is already private is a browser you don't have to harden. That's the point of defaults — and the reason chrome://flags was never the answer.

## Frequently Asked Questions

### Can chrome://flags make Chrome more private?

Mostly no. The big privacy upgrades people associate with flags — Encrypted Client Hello, third-party storage partitioning, WebRTC local-IP masking, and the trimmed User-Agent — already graduated to defaults, so there's no flag left to flip. The experimental flags that remain aren't privacy controls; turning them on usually expands your fingerprint and runs less-audited code.

### Is it safe to change chrome://flags?

They're explicitly experimental. Chrome warns at the top of the page that enabling them can lose data or compromise your security and privacy. Changes apply to every profile in that browser, Incognito included, can break sites, and may be silently reset or removed when Chrome updates. For almost everyone, leaving a flag on Default is the correct and safest setting.

### What privacy flags should I enable in Chrome?

Almost none. Hardening lists that tell you to enable Encrypted Client Hello, WebRTC mDNS masking, storage partitioning, or User-Agent reduction are out of date — those protections are already on by default and their flags have been retired. Enabling additional experimental flags generally makes your browser more identifiable, not less.

### Does changing chrome://flags affect browser fingerprinting?

Yes. Fingerprinting works by measuring how your browser differs from everyone else's. A default configuration blends into a large crowd of identical installs. A custom set of enabled flags makes your browser behave unusually — exposing APIs or quirks most users don't have — which is easier for a site to single out and track across visits.

### What happened to the Privacy Sandbox flags?

Google reversed its plan to remove third-party cookies in 2024, then began deprecating the Privacy Sandbox advertising APIs — Topics, Protected Audience, and Attribution Reporting — in late 2025, with removal scheduled across subsequent Chrome releases. The flags and the `chrome://settings/adPrivacy` controls tied to those APIs are being wound down rather than expanded.

---

_Nav0 is a minimal, privacy-focused browser that collects zero data. It's open source, free, and built on the belief that your browser should do one thing well: let you browse the web. [Get started](/guide/getting-started)._
