---
title: 'What We Stripped From Chromium (and What Broke)'
description: 'A component-by-component breakdown of what we removed from Chromium to build Nav0 — telemetry, background sync, speculative pre-rendering, and the recommendation engine — and what users actually lose.'
date: 2026-06-05
author: Ketan Patil
category: privacy
lastReviewed: 2026-06-05
tldr: >-
  We forked Chromium and removed telemetry, the Background Sync APIs,
  speculative pre-rendering, and the new tab recommendation engine.
  Telemetry removal costs you nothing. Background Sync removal breaks a
  small handful of PWAs that retry failed actions while the tab is closed.
  Pre-rendering removal costs roughly 100 ms on next-page navigation for
  sites that hint at it. The recommendation engine just stops serving you
  suggestions you didn't ask for.
tags: [engineering, privacy, chromium, browsers]
head:
  - - meta
    - property: og:type
      content: article
  - - meta
    - property: article:published_time
      content: '2026-06-05'
  - - meta
    - property: article:author
      content: Ketan Patil
  - - meta
    - property: article:tag
      content: engineering
  - - meta
    - property: article:tag
      content: privacy
  - - meta
    - property: article:tag
      content: chromium
  - - meta
    - property: article:tag
      content: browsers
  - - meta
    - name: keywords
      content: 'chromium fork, stripped chromium, remove telemetry chromium, disable background sync, disable prerender chromium, ntp recommendation engine, chromium privacy fork, ungoogled chromium, nav0 engineering, browser engineering, what chromium does in the background, content suggestions service, prerender2, UMA UKM telemetry, variations finch seed'
  - - script
    - type: application/ld+json
    - |
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "What We Stripped From Chromium (and What Broke)",
        "description": "A component-by-component breakdown of what we removed from Chromium to build Nav0 — telemetry, background sync, speculative pre-rendering, and the recommendation engine — and what users actually lose.",
        "datePublished": "2026-06-05",
        "author": { "@type": "Person", "name": "Ketan Patil", "url": "https://nav0.org/about" },
        "publisher": {
          "@type": "Organization",
          "name": "Nav0",
          "url": "https://nav0.org",
          "logo": { "@type": "ImageObject", "url": "https://nav0.org/logo.svg" }
        },
        "mainEntityOfPage": "https://nav0.org/blog/what-we-stripped-from-chromium",
        "keywords": ["chromium fork", "stripped chromium", "remove telemetry", "background sync", "prerender", "content suggestions service", "browser engineering", "privacy browser"]
      }
---

# What We Stripped From Chromium (and What Broke)

<p style="color: var(--vp-c-text-2); font-size: 0.9rem;">By Ketan Patil &middot; June 5, 2026 &middot; 9 min read</p>

Nav0 is a Chromium fork. That sentence does a lot of work. It implies we kept the parts that make Chromium fast — V8, Blink, the network stack, the multi-process renderer model — and threw out the parts that make it Google's. This post is a concrete, component-by-component breakdown of the second half: what we removed, what each component was actually doing, and what users lose, if anything.

Short version: most of it, you won't notice. A few cuts trade observable behaviour for privacy. Those are the ones worth being honest about, because "we removed X" is easy to write on a marketing page and meaningless without "and here is what X did for you."

## 1. Telemetry

**What it does in Chromium.** Upstream Chromium ships several overlapping telemetry pipelines:

- **UMA** (User Metrics Analysis) — anonymous counters and histograms that record how almost every menu, button, feature, and keyboard shortcut gets used. `UMA_HISTOGRAM_*` macros are scattered through the codebase by the tens of thousands.
- **UKM** (URL-Keyed Metrics) — per-URL telemetry tied to a pseudonymous client ID, designed to study performance on a per-site basis. To study it, the browser has to log which sites you visit.
- **Crash reporting** — automatic upload of crash dumps to Google's Crashpad endpoints. Crash dumps can contain page contents from the moment of the crash.
- **Variations / Finch / field trials** — the live-experiment framework. The browser fetches a seed file on startup that decides which experimental features are on for your install, and reports back which buckets you fell into.

**What we cut.** All of it. The metrics service is excluded from the build. The variations seed fetcher is stubbed out — release builds ship with a fixed feature-flag state. The Crashpad uploader is replaced with a local-only collector that writes crash dumps to a folder you can inspect (and email us if you want to).

**What users lose.** Nothing the user can perceive. No feature stops working. No site stops loading. The browser just stops phoning home.

**What broke during the strip.** More than we expected, but only at compile time. A surprising number of UI components held silent dependencies on histogram macros, so excising the macros one by one took down build targets at random. The fix that stuck was a thin shim that turns every `UMA_HISTOGRAM_*` and `UKM_*` call into a no-op while keeping the call sites in place. Compile time went down. Binary size went down. The browser feels identical.

## 2. Background Sync

**What it does in Chromium.** The [Background Sync API](https://wicg.github.io/background-sync/spec/) lets a service worker register a `sync` event that the browser fires when it thinks the user has connectivity — even if the tab that registered it is long closed. There is also Periodic Background Sync, which fires every few hours on a schedule the browser decides.

The canonical use case is "you typed a comment while offline, we'll post it when you're back online." The actual majority use case, judging by what registers sync events on the average web page, is keeping advertising and analytics SDKs warm in the background.

**What we cut.** Both flavours — one-shot and periodic. Service workers can still call `registration.sync.register()` without throwing. The event just never fires. From the page's perspective, you are permanently offline for sync purposes.

**What users lose.** Real, but small:

- A handful of progressive web apps retry failed sends after you come back online. With Nav0, those retries happen the next time you open the tab, not while it's closed.
- A few news and reader PWAs use Periodic Sync to refresh feeds overnight. With us, the feed refreshes when you open the app.

The bug reports we've received about missing background sync, across the entire lifetime of the project, number in the single digits — and every one of them was resolvable with "open the tab once and the sync will run as a normal fetch." We think that's a fair trade for not letting arbitrary pages schedule background CPU and network on your machine after you've closed them.

## 3. Speculative Pre-rendering

**What it does in Chromium.** Chromium has accumulated several overlapping pre-loading systems over the years:

- **Prerender2** — fully renders a candidate next page off-screen, including running its JavaScript, before you click. When you navigate, the pre-rendered page is "swapped in" instantly.
- **NoState Prefetch** — fetches a page's sub-resources into the HTTP cache without running scripts. Cheaper, fewer side effects.
- **Loading Predictor** — uses a per-domain history of what loads alongside what to warm DNS, sockets, and TLS connections for resources you haven't requested yet.
- **Search prefetch** — the browser talks to the search engine and acts on hints in the results about which link you're most likely to click, fetching it before you do.

The privacy problem isn't that these features exist. It's that they cause your browser to silently fetch and execute pages you never explicitly asked for, and that the hint mechanism in search is a side channel where the search engine effectively decides what your browser loads next.

**What we cut.** Prerender2 and search-driven prefetch are gone. The Loading Predictor is gone — we don't keep the per-domain resource-graph database it needs to make guesses. Triggered NoState Prefetch is gone too. We still honour explicit `<link rel="prefetch">` and `<link rel="preload">` tags on pages you've actually opened, because at that point you the user have already visited the page asking for them.

**What users lose.** Roughly **80–150 ms** on next-page navigation for the small set of sites whose load patterns Chromium's predictor was good at modelling. You can measure it on a clean Speedometer run against a stripped build. In day-to-day use it's lost in the noise of network jitter on anything but a wired connection.

What you don't lose: first-page load time. Pre-rendering only ever sped up the *second* page, and only when the predictor guessed right.

## 4. The Recommendation Engine

**What it does in Chromium.** The "Articles for you" feed on the new tab page, the related-searches surface, the "you might like" tiles in some channels, and the Content Suggestions Service that powers all of it. Internally it's several components — the Feed library, the Discover API client, the NTP snippets infrastructure — but to the user it's one thing: stuff you didn't ask for, served to you when you open a new tab.

The recommendation engine is also the largest single source of per-user identifiers that leave the browser on a routine schedule, because personalised recommendations need a personalisation signal.

**What we cut.** The entire stack. The new tab page in Nav0 is a blank surface with a search box and your bookmarks. Nothing fetches in the background to populate it. Nothing scores or ranks content for you.

**What users lose.** The feed. If you actively used "Articles for you" in Chrome, you'll miss it. Most people we've asked turn it off in Chrome and Edge by reflex, which is why replacing it was never a priority. If you want a feed, install a feed reader and choose what's in it. We're not going to choose for you, and we don't want the infrastructure for choosing for you to exist in the browser.

## What we kept (and why)

Three things people assume we'd cut, that we didn't:

- **The Safe Browsing list.** We ship the list locally and check URLs against it on-device. We don't send URLs to Google's lookup service ("Enhanced Protection"). You still get phishing and malware warnings. Google still gets nothing.
- **Component Updater.** We use it to deliver the Safe Browsing list, the certificate revocation set, and the Widevine CDM if you opt into DRM. We don't use it to ship Finch seeds or experiments.
- **Feature flags as a concept.** We don't run live experiments on users, but `base::FeatureList` is still in the binary so we can gate work-in-progress builds during development. Release builds ship with a fixed flag state baked in at compile time.

## What the strip looks like, in shape

We don't publish the patch series as a marketing artefact, but the rough shape of it is: dozens of `BUILD.gn` targets excluded from the build graph, a small set of shims that replace Google-facing service implementations with local-only or no-op equivalents, and a handful of invasive UI changes — the new tab page, the omnibox suggestion provider, the settings dialogs — to remove dead surfaces that pointed at cut features.

The result, against an equivalent-channel Chrome build, is a smaller binary and noticeably less idle memory with a single blank tab open. The exact deltas move release to release; the [v0.1.2 performance update](/blog/nav0-v012-performance-update) has the most recent measured figures.

## Why "we removed it" matters more than "we blocked it"

You can write "privacy-focused browser" on a download page without doing any of this. Block third-party cookies, set a tracker list, ship a marketing page, you're done. Every browser does that now, including the ones whose parent companies sell ads.

The harder, less glamorous version is removing the components rather than configuring them off. A blocked feature is still a feature in the binary — it has a flag, the flag has a default, the default is one upstream patch away from flipping, and the code that implements it is still linked in and still ships to every user. A removed feature is not there to flip back on.

That's the strip. It breaks unexpected build targets, the user-visible payoff is mostly "nothing happens," and that's the point. The alternative is shipping Chrome's engine with a different paint job, and at that point you don't have a different browser. You have a re-skin. We didn't want to ship a re-skin.

For the broader case for why this matters, see [The Enshittification of Chrome](/blog/the-enshittification-of-chrome) and [Big Tech Owns Your Browser](/blog/big-tech-owns-your-browser). For what Nav0 deliberately doesn't do at the product level, see [/guide/un-features](/guide/un-features).

---

_Nav0 is a minimal, privacy-focused browser that collects zero data. It's open source, free, and built on the belief that your browser should do one thing well: let you browse the web. [Get started](/guide/getting-started)._
