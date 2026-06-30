---
title: 'Release Notes — Nav0 Browser'
description: "Release notes and changelog for Nav0 Browser. See what's new in every release — features, fixes, and improvements."
---

<div class="releases-page-head">

# Every <em>shipped</em> change, in one place.

  <p class="releases-page-sub">Nav0 ships small and often. No "AI-powered" features hidden in patch notes — just real changes you can read in under a minute each.</p>
</div>

<ReleasesStats />

<ReleasesLatestHero>
A release that refines the tab bar and toolbar — content-sized tabs, a hover-only close button, clearer scroll chevrons, and brand-red icon hovers — and fixes camera and microphone capture in packaged macOS builds.

<template #summary>

- Tabs now size to their content (min-width down to 72px) with tighter, symmetric favicon spacing, restoring the fill-the-bar model so the strip never looks sparse
- The tab close (×) button is now hover-only, the tab-strip scroll chevrons are larger and more prominent, and nav-bar and address-bar icon buttons tint Nav0 brand-red on hover
- Packaged macOS builds are now code-signed with hardened-runtime camera/microphone entitlements, so macOS can attribute capture requests to Nav0
- The app drives the native macOS camera/mic permission prompt itself for `getUserMedia` requests, so granting the in-app permission actually delivers frames and audio

</template>
</ReleasesLatestHero>

<div class="releases-timeline">

<div class="release-list-item">
  <a href="/releases/v0.4.0">
    <h2>v0.4.0</h2>
  </a>
  <div class="release-meta">June 30, 2026 <span class="release-badge latest">Latest</span></div>
  <p class="release-excerpt">Refines the tab bar and toolbar with content-sized tabs, a hover-only close button, larger scroll chevrons, and brand-red icon hovers, and fixes camera and microphone capture in packaged macOS builds by code-signing with hardened-runtime entitlements and driving the native capture prompt.</p>
</div>

<div class="release-list-item">
  <a href="/releases/v0.3.2">
    <h2>v0.3.2</h2>
  </a>
  <div class="release-meta">June 28, 2026</div>
  <p class="release-excerpt">Adds Chrome-style page zoom and drag-to-reorder tabs in Command-O, promotes "Search the web" to the top of every result list, opens page-spawned tabs next to their opener, and stops the macOS "Local Network" prompt while fixing third-party cookie handling on top-level navigations.</p>
</div>

<div class="release-list-item">
  <a href="/releases/v0.3.1">
    <h2>v0.3.1</h2>
  </a>
  <div class="release-meta">May 27, 2026</div>
  <p class="release-excerpt">A maintenance release fixing sub-frame address-bar updates and stray helper-frame tabs, preserving exact tab order and pinned tabs on session restore, applying the first-party ad-blocker exemption across all blocklists, and suffixing duplicate downloads.</p>
</div>

<div class="release-list-item">
  <a href="/releases/v0.3.0">
    <h2>v0.3.0</h2>
  </a>
  <div class="release-meta">May 24, 2026</div>
  <p class="release-excerpt">The Nav0 editorial redesign lands across every built-in page — tab strip, new tab, Bookmarks, History, Downloads, Settings, About, Command-K, and error pages — plus address-bar Enter fixes, coalesced getUserMedia prompts, and unblocked streaming sub-resources in private mode.</p>
</div>

<div class="release-list-item">
  <a href="/releases/v0.2.9">
    <h2>v0.2.9</h2>
  </a>
  <div class="release-meta">May 17, 2026</div>
  <p class="release-excerpt">A unified address bar autocomplete that ranks bookmarks above history, new Cmd/Ctrl+L and corrected Ctrl+W shortcuts, a fully in-memory private-mode database with startup cleanup, and fixes for ad blocker false positives and the empty About-page checksum row.</p>
</div>

<div class="release-list-item">
  <a href="/releases/v0.2.8">
    <h2>v0.2.8</h2>
  </a>
  <div class="release-meta">May 11, 2026</div>
  <p class="release-excerpt">Fixed macOS cookie persistence so users stop getting logged out of Gmail, LinkedIn, and other cookie-auth sites after every quit, plus a favicon fallback fix, a Linux packaging fix, and a cleaner dev workflow.</p>
</div>

<div class="release-list-item">
  <a href="/releases/v0.2.7">
    <h2>v0.2.7</h2>
  </a>
  <div class="release-meta">May 10, 2026</div>
  <p class="release-excerpt">A `nav0` CLI for launching from the terminal, audited keyboard shortcuts across platforms, a stop-loading button in the address bar, and fixes for Gmail PDF downloads, blurry favicons, and the macOS dock icon.</p>
</div>

<div class="release-list-item">
  <a href="/releases/v0.2.6">
    <h2>v0.2.6</h2>
  </a>
  <div class="release-meta">May 6, 2026</div>
  <p class="release-excerpt">Fixed packaging breakage from the Electron 41 upgrade, restored Google sign-in by refreshing Firefox UA cap and Chrome preset, and softened the new-tab gradient background.</p>
</div>

<div class="release-list-item">
  <a href="/releases/v0.2.5">
    <h2>v0.2.5</h2>
  </a>
  <div class="release-meta">May 5, 2026</div>
  <p class="release-excerpt">Time-based greetings and a pastel-gradient new-tab page, fixed WebContents cleanup on window close, a streamlined Command-K, the new compass logo across the app, and an Electron 41 upgrade.</p>
</div>

<div class="release-list-item">
  <a href="/releases/v0.2.4">
    <h2>v0.2.4</h2>
  </a>
  <div class="release-meta">April 23, 2026</div>
  <p class="release-excerpt">Settings page redesign, favicons next to origins in Site Permissions, and a new linting/formatting/pre-commit-hook tooling stack.</p>
</div>

<div class="release-list-item">
  <a href="/releases/v0.2.3">
    <h2>v0.2.3</h2>
  </a>
  <div class="release-meta">April 21, 2026</div>
  <p class="release-excerpt">Blocking alert/confirm/prompt and basic-auth overlays, getDisplayMedia screen sharing with a dedicated picker, localhost and .local-style URL handling, main-process crash hardening, and a graceful installer prompt when Nav0 is already running.</p>
</div>

<div class="release-list-item">
  <a href="/releases/v0.2.2">
    <h2>v0.2.2</h2>
  </a>
  <div class="release-meta">April 17, 2026</div>
  <p class="release-excerpt">Cloudflare Turnstile compatibility, Chrome version pinning to Electron's real Chromium, and Google sign-in and Gmail fixes via Firefox UA swap and a minimal window.chrome.runtime stub.</p>
</div>

<div class="release-list-item">
  <a href="/releases/v0.2.1">
    <h2>v0.2.1</h2>
  </a>
  <div class="release-meta">April 14, 2026</div>
  <p class="release-excerpt">Permissions settings page, configurable downloads location, "On startup" options, session restore for non-private windows, expanded website categories, and assorted settings and startup bug fixes.</p>
</div>

<div class="release-list-item">
  <a href="/releases/v0.2.0">
    <h2>v0.2.0</h2>
  </a>
  <div class="release-meta">April 12, 2026</div>
  <p class="release-excerpt">Downloads page redesign with cross-session resume, history page with time tracking and analytics, bookmarks page with reading queue/reference split, favicon fetching via net.fetch, and Chrome default user agent.</p>
</div>

<div class="release-list-item">
  <a href="/releases/v0.1.2">
    <h2>v0.1.2</h2>
  </a>
  <div class="release-meta">April 4, 2026</div>
  <p class="release-excerpt">Renamed application from nav0-browser to Nav0 across package identity, installers, CI pipeline, download page, performance tests, and documentation.</p>
</div>

<div class="release-list-item">
  <a href="/releases/v0.1.1">
    <h2>v0.1.1</h2>
  </a>
  <div class="release-meta">April 3, 2026</div>
  <p class="release-excerpt">Browser notifications, Firefox user agent default, built-in Developer Tools, streaming site compatibility fixes, external protocol handlers, and hard reload fix.</p>
</div>

<div class="release-list-item">
  <a href="/releases/v0.1.0">
    <h2>v0.1.0</h2>
  </a>
  <div class="release-meta">March 29, 2026</div>
  <p class="release-excerpt">Renderer process consolidation (8→2 views), tab hibernation, per-tab find-in-page state, Web Share API support, merged title bar, and UI polish across the board.</p>
</div>

<div class="release-list-item">
  <a href="/releases/v0.0.9">
    <h2>v0.0.9</h2>
  </a>
  <div class="release-meta">March 19, 2026</div>
  <p class="release-excerpt">SSL certificate indicator overlay, fullscreen exit fixes, drag-and-drop tabs between windows, and installer graceful quit prompt.</p>
</div>

<div class="release-list-item">
  <a href="/releases/v0.0.8">
    <h2>v0.0.8</h2>
  </a>
  <div class="release-meta">March 15, 2026</div>
  <p class="release-excerpt">Tab context menu, pinning, Cmd+O switcher, popup blocking, hard reload, SSL warning page, offline page, in-app issue reporting, customizable user agent, print support, and HTTPS enforcement.</p>
</div>

<div class="release-list-item">
  <a href="/releases/v0.0.7">
    <h2>v0.0.7</h2>
  </a>
  <div class="release-meta">March 7, 2026</div>
  <p class="release-excerpt">Dark mode toggle for any website, recently closed tabs with full window restoration, stability fixes for tab/window lifecycle crashes, and navbar FOUC resolution.</p>
</div>

<div class="release-list-item">
  <a href="/releases/v0.0.6">
    <h2>v0.0.6</h2>
  </a>
  <div class="release-meta">March 3, 2026</div>
  <p class="release-excerpt">Ad blocker, download manager with pause/resume, Find in Page, Reader Mode, PDF Reader, browser settings engine, and site permissions.</p>
</div>

<div class="release-list-item">
  <a href="/releases/v0.0.5-alpha">
    <h2>v0.0.5-alpha</h2>
  </a>
  <div class="release-meta">March 1, 2026 <span class="release-badge alpha">Alpha</span></div>
  <p class="release-excerpt">New Nav0 compass logo and rebrand. Bug fixes for fullscreen, Command+K overlay, and auto-launch after macOS install.</p>
</div>

<div class="release-list-item">
  <a href="/releases/v0.0.4">
    <h2>v0.0.4</h2>
  </a>
  <div class="release-meta">March 1, 2026</div>
  <p class="release-excerpt">macOS curl install script, Gatekeeper bypass, and startup crash fix.</p>
</div>

<div class="release-list-item">
  <a href="/releases/v0.0.3-alpha">
    <h2>v0.0.3-alpha</h2>
  </a>
  <div class="release-meta">February 25, 2026 <span class="release-badge alpha">Alpha</span></div>
  <p class="release-excerpt">Sync package.json version with release input before building.</p>
</div>

<div class="release-list-item">
  <a href="/releases/v0.0.2-alpha">
    <h2>v0.0.2-alpha</h2>
  </a>
  <div class="release-meta">February 25, 2026 <span class="release-badge alpha">Alpha</span></div>
  <p class="release-excerpt">macOS stability fixes and Homebrew Cask distribution.</p>
</div>

<div class="release-list-item">
  <a href="/releases/v0.0.1-alpha">
    <h2>v0.0.1-alpha</h2>
  </a>
  <div class="release-meta">February 12, 2026 <span class="release-badge alpha">Alpha</span></div>
  <p class="release-excerpt">First alpha release — Electron-based browser with Chromium engine, Command-K search, tab management, bookmarks, and download manager.</p>
</div>

</div>
