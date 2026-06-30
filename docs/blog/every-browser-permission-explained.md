---
title: 'Every Browser Permission, Explained: What You Grant When You Click "Allow"'
description: 'A long-form reference for every browser permission prompt: camera, mic, geolocation, sensors, storage, notifications, USB, MIDI, and more. What each one means and what gets sent.'
date: 2026-05-23
author: Ketan Patil
category: security
lastReviewed: 2026-05-27
tldr: >-
  Every browser permission gates the moment an API hands a page access, not how that data is used afterward. A grant goes to the whole origin, persists indefinitely in Chrome and Edge, and the browser never sees what JavaScript uploads. This reference covers geolocation, camera, microphone, notifications, sensors, clipboard, USB, MIDI, and more. Default to Block, do not grant on first visit, and prefer per-session grants like Nav0 uses.
tags: [privacy, security, browsers]
head:
  - - meta
    - property: og:type
      content: article
  - - meta
    - property: article:published_time
      content: '2026-05-23'
  - - meta
    - property: article:author
      content: Ketan Patil
  - - meta
    - property: article:tag
      content: privacy
  - - meta
    - property: article:tag
      content: security
  - - meta
    - property: article:tag
      content: browsers
  - - meta
    - name: keywords
      content: 'browser permissions explained, what does allow camera do, what does allow microphone do, geolocation permission, persistent storage permission, web notifications permission, webusb permission, web midi permission, motion sensor permission, browser permission reference, what gets sent when i grant browser permission, revoke browser permissions, browser permission guide, browser security permissions'
  - - script
    - type: application/ld+json
    - |
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Every Browser Permission, Explained: What You Grant When You Click \"Allow\"",
        "description": "A long-form reference for every browser permission prompt: camera, mic, geolocation, sensors, storage, notifications, USB, MIDI, and more. What each one means and what gets sent.",
        "datePublished": "2026-05-23",
        "author": { "@type": "Person", "name": "Ketan Patil", "url": "https://nav0.org/about" },
        "publisher": {
          "@type": "Organization",
          "name": "Nav0",
          "url": "https://nav0.org",
          "logo": { "@type": "ImageObject", "url": "https://nav0.org/logo.svg" }
        },
        "mainEntityOfPage": "https://nav0.org/blog/every-browser-permission-explained",
        "keywords": ["browser permissions", "web permissions", "privacy", "security", "geolocation", "camera", "microphone", "notifications", "webusb", "web midi", "persistent storage", "motion sensors"]
      }
---

# Every Browser Permission, Explained: What You Grant When You Click "Allow"

<p style="color: var(--vp-c-text-2); font-size: 0.9rem;">By Ketan Patil &middot; May 23, 2026 &middot; 15 min read</p>

Modern browsers ship with around two dozen permission prompts. Most users click "Allow" or "Block" without reading, because the prompt itself doesn't tell you what the page can actually do once the permission is granted. The prompt says "this site wants to know your location" — it doesn't say "this site can now poll your coordinates every 200 milliseconds in the background while the tab is open."

This post is the reference we wish existed. One section per permission. For each one: what the underlying Web API is, what the page can read or do once you grant it, what gets sent over the network (which is almost always the part the prompt leaves out), how long the grant lasts, and how to revoke it.

We'll cover the ones you asked about — camera, microphone, motion sensors, persistent storage, notifications, USB, MIDI, geolocation — plus the rest of the permission surface, because the picture isn't complete without them.

## How browser permissions actually work

Before the per-permission breakdown, a few mechanics worth knowing, because they apply across the board:

1. **A permission grant is to an origin, not a page.** "Allow" on `example.com/landing` grants the permission for every page on `example.com`, including ad iframes hosted on that origin, every script that origin loads, and every subsequent visit. The prompt rarely makes this clear.
2. **Permissions are sticky by default in Chrome and Edge.** Once granted, they persist until you manually revoke them. Firefox and Safari default to one-time grants for several permissions (notably camera and microphone). Nav0 defaults to per-session grants — the permission is forgotten when you close the tab.
3. **The permission is to the API, not to the data.** Granting camera access doesn't mean "the site can take a photo." It means "the site can open a live video stream and read frames at up to 60fps for as long as the tab is alive." What the page does with those frames is entirely up to the page's JavaScript, and that code can change between visits.
4. **The browser does not see what the page sends.** Once the data is in JavaScript, it can be uploaded to any server the page chooses, encoded into any format, and combined with any other data the page has. The permission gate is a one-time yes/no — there is no ongoing audit.
5. **Permissions Policy headers can disable them sitewide.** A site can opt _out_ of permissions for itself or its iframes via the `Permissions-Policy` HTTP header. This is the only mechanism that prevents a third-party script from even asking. Most sites don't set it.

With that out of the way, here's what each prompt actually means.

## Geolocation

**API:** `navigator.geolocation`
**Prompt wording (Chrome):** "example.com wants to know your location"

What the page can do once granted:

- Call `getCurrentPosition()` to read a single fix.
- Call `watchPosition()` to receive a continuous stream of updates, as fast as the underlying source can supply them, for as long as the tab is alive.
- Read latitude, longitude, accuracy radius (in meters), altitude, altitude accuracy, heading, and speed.

What "your location" actually means depends on what your OS can tell the browser:

| Source                | Typical accuracy   | When it's used                                                  |
| --------------------- | ------------------ | --------------------------------------------------------------- |
| GPS (mobile)          | 5–20 meters        | When the device has a GPS chip and a fix is available           |
| Wi-Fi triangulation   | 20–100 meters      | Desktop and laptop default — your visible SSIDs are matched against a database |
| Cell tower            | 200m–several km    | Mobile fallback when GPS isn't available                        |
| IP geolocation        | City-level         | Final fallback, with the worst accuracy                         |

There is no "approximate" toggle in the standard API. Chrome, Edge, and Firefox return the most accurate fix the OS will give them. Safari on iOS has a coarse-location toggle on the prompt; Chrome on Android added one in 2024. On desktop, the page gets the precise fix or nothing.

**What gets sent:** Whatever the page's JavaScript decides to send. The `Geolocation` object exists entirely client-side, but in practice almost every site that asks for it ships the coordinates to a server — for routing, for "find stores near me," for ad targeting, or for logging. The accuracy field is part of that payload, which is useful to attackers because it tells them whether you're on Wi-Fi or GPS.

**Persistence:** Sticky in Chromium-based browsers. Firefox prompts each session by default. Nav0 prompts each session.

**Revoke:** Site settings → Location, or click the lock icon in the address bar.

## Camera

**API:** `navigator.mediaDevices.getUserMedia({ video: true })`
**Prompt wording:** "example.com wants to use your camera"

What the page can do once granted:

- Open a live video stream from any camera attached to the device — built-in webcam, external USB camera, virtual cameras installed by other apps.
- Read individual frames at up to the camera's native frame rate (usually 30 or 60fps).
- Process frames through `<canvas>`, WebGL, or WebGPU to run face detection, OCR, barcode scanning, or anything else.
- Switch between front and rear cameras on mobile without re-prompting.
- Read the camera's capability list — resolution, frame rate, focus modes, torch (flash) support.

The page does _not_ get raw filesystem access to your camera roll. It only gets the live feed.

**What gets sent:** Whatever the JavaScript chooses to upload. Video calling apps stream the feed in real time via WebRTC. Photo-upload sites typically grab a single frame, JPEG-encode it, and POST it. Sites that promise "in-browser background blur" often still upload the raw stream because the model runs server-side.

Two things the prompt does not warn you about:

1. **Device enumeration leaks even without the grant.** `navigator.mediaDevices.enumerateDevices()` returns the list of camera and microphone _labels_ once you've granted permission to any of them — historically, on any site, not just the current one. The list of attached hardware is a fingerprinting vector.
2. **The grant is to the origin, not the tab.** A site you granted camera access to a year ago can re-open the camera the next time you visit, with no new prompt, in Chrome's default configuration. The on-air indicator (the small dot in the tab) is your only signal.

**Persistence:** Sticky in Chrome and Edge. Per-session in Firefox and Safari by default. Per-session in Nav0.

**Revoke:** Site settings → Camera. On macOS and Windows, the OS-level camera permission for the browser process is a separate, second gate.

## Microphone

**API:** `navigator.mediaDevices.getUserMedia({ audio: true })`
**Prompt wording:** "example.com wants to use your microphone"

What the page can do once granted:

- Open a live audio stream from any microphone attached to the device.
- Sample raw PCM audio at up to 48kHz.
- Run the stream through the Web Audio API for FFT analysis, voice activity detection, transcription, or anything else.
- Continue recording while the tab is in the background — there is no foreground-only restriction on the audio API.

**What gets sent:** Same shape as camera. Voice calls stream PCM over WebRTC. Dictation sites upload chunks to a speech-to-text server. The stream can be encoded as opus, mp3, raw PCM, or anything else, and the upload can happen as a single POST after recording stops or as a continuous WebSocket. The browser doesn't distinguish between "voice memo" and "ambient room audio recorded for 40 minutes."

The microphone is the permission most often abused by sites that don't visibly use it. A page that asks for the mic to "enable voice search" can keep the stream open and never visibly use it. The recording indicator is the only tell.

**Persistence:** Same as camera.

**Revoke:** Site settings → Microphone, plus the OS-level mic permission for the browser.

## Notifications

**API:** `Notification.requestPermission()` and the Push API for server-initiated pushes.
**Prompt wording:** "example.com wants to send you notifications"

What the page can do once granted:

- Display OS-level notifications outside the browser window, even when the tab is closed.
- Subscribe to a push service (FCM on Chrome/Edge, Mozilla autopush on Firefox, APNs on Safari) so the page's _server_ can push notifications without the tab being open.
- Read the notification's interaction state — whether you clicked it, dismissed it, or it timed out — and use that as a signal back to the server.

The Notifications permission is conceptually two permissions in one. The first is "show me a banner from this site"; the second is "let this site's server keep a persistent push channel open through Google or Apple to my device." Most users don't realize granting the first one enables the second.

**What gets sent:** When you grant push, the browser generates a unique endpoint URL and a pair of cryptographic keys, and ships the endpoint to the page's server. From that moment on, the server can deliver messages to your device by POSTing to that endpoint — without you having to visit the site again. Each notification delivery typically reports back to the server whether it was shown, clicked, or dismissed.

The cumulative result: a site you visited once in 2023 to read an article can deliver a notification to your locked phone in 2026, and learn whether you tapped it.

**Persistence:** Sticky. Notification grants almost never expire on their own.

**Revoke:** Site settings → Notifications. Chrome added a "quieter" UI in 2020 and an auto-revoke for unused permissions in 2024, but the default for explicitly granted notifications is still indefinite.

## Persistent storage

**API:** `navigator.storage.persist()`
**Prompt wording:** "example.com wants to store data on this device" (Firefox) — Chrome usually doesn't prompt at all, granting it heuristically.

What the page can do once granted:

- Mark its origin's storage (IndexedDB, the Cache API, Service Worker registrations, OPFS) as **persistent**, which means the browser will not evict it under storage pressure.
- Use up to its share of the global quota — historically up to ~60% of free disk on Chrome, varying by platform.

What it does _not_ grant:

- It does not grant access to your filesystem. That's the File System Access API, which is a different prompt.
- It does not grant unlimited storage. The quota cap still applies.

**What gets sent:** Nothing, directly. Persistent storage is local-only. The privacy cost is that data the site stores about you — analytics IDs, a cached fingerprint, an offline copy of your interaction history — is now durable across cache clears that target "temporary" data, and survives the kinds of cleanup most users assume will wipe everything.

A site that has been granted persistent storage and is also using a Service Worker has an effectively permanent footprint on your device. Clearing cookies will not remove it. You have to explicitly clear site data.

**Persistence:** Indefinite once granted. The user has to explicitly remove site data to evict.

**Revoke:** Site settings → On-device site data → Clear.

## Web Push (separate from notifications, sometimes)

On modern browsers, Web Push is bundled into the Notifications prompt and granted as one. On older browsers (and on Safari pre-16.4) Push and Notifications were separate prompts. If you encounter a site that asks for one without the other, treat it like Notifications above — the privacy implication is the same.

## USB (WebUSB)

**API:** `navigator.usb.requestDevice()`
**Prompt wording:** "example.com wants to connect to a USB device"

WebUSB lets a webpage talk to a USB device directly, bypassing the OS's normal driver layer for that device. It exists so that hardware vendors can ship a web-based setup tool instead of a downloadable installer — Yubico's key manager, Arduino's IDE, firmware updaters for keyboards and mice, and so on.

What the page can do once granted (for the specific device you pick from the chooser):

- Send arbitrary control transfers to the device.
- Read from and write to bulk and interrupt endpoints.
- Read the device's descriptors — vendor ID, product ID, serial number, firmware revision.

What it cannot do:

- It cannot enumerate every USB device on your system. The browser shows a chooser, and only the device you explicitly pick is exposed. WebUSB respects an OS-level allowlist; storage devices, HID, and audio class devices are blocked, because handing a webpage raw access to a keyboard would let it log keystrokes.
- It cannot reach devices that are claimed by an OS driver, on most platforms.

**What gets sent:** Whatever the page's JavaScript sends to the server. Device serial numbers are a strong identifier, and the page can absolutely upload them. For a hardware setup tool talking to the vendor's server, that's the intended behavior; for a random site, there's no reason to grant.

**Persistence:** Per-device, per-origin. Sticky in Chrome — once you've authorized your YubiKey for `account.example.com`, that origin can reconnect to that specific device without a new prompt.

**Revoke:** Site settings → USB devices.

WebUSB is not implemented in Firefox or Safari. It's a Chromium-only API. That alone has been controversial since it launched.

## MIDI (Web MIDI)

**API:** `navigator.requestMIDIAccess()`
**Prompt wording:** "example.com wants to use your MIDI devices" — and, importantly, for `sysex: true` access, "example.com wants control of your MIDI devices including the ability to send and receive system messages."

What the page can do once granted (without sysex):

- Read MIDI input from every connected MIDI device — keyboards, controllers, drum pads — in real time.
- Send MIDI output to every connected device.
- Enumerate the full list of connected MIDI devices, with names, manufacturers, and IDs.

With sysex, the page can additionally send system-exclusive messages, which are device-specific and can include firmware updates and configuration changes. Granting sysex to a malicious site is, in principle, "let this page brick or reflash my hardware synthesizer."

**What gets sent:** Same pattern as USB. The page can stream MIDI events to a server (this is what web-based DAWs and collaborative music tools do), and it can ship the device list.

The privacy edge is the device enumeration: MIDI device names are unusual and high-entropy. A page that asks for MIDI without sysex and never plays a note is probably fingerprinting.

**Persistence:** Sticky in Chrome and Edge. Not implemented in Safari. Firefox shipped it in 2022.

**Revoke:** Site settings → MIDI devices.

<BlogAnimation scene="permissions" />

## Motion sensors

**API:** `DeviceMotionEvent`, `DeviceOrientationEvent`, plus the newer Generic Sensor API (`Accelerometer`, `Gyroscope`, `Magnetometer`, `LinearAccelerationSensor`, `GravitySensor`, `AbsoluteOrientationSensor`).
**Prompt wording (iOS Safari):** "example.com wants to access motion and orientation" — Chrome on Android grants this without a prompt by default for low-frequency events, and prompts only for the high-frequency sensor API.

What the page can do once granted:

- Read the accelerometer at up to 60Hz — the three-axis force on the device, including gravity.
- Read the gyroscope — angular velocity around three axes.
- Read the magnetometer — the local magnetic field vector, which is how the device knows which way is north.
- Compute the device's orientation, motion, and rotational state.

The risks here are not obvious:

1. **Keystroke inference.** Multiple research papers have demonstrated that gyroscope and accelerometer data from a phone is enough to recover what was typed on the phone's on-screen keyboard, with accuracy well above chance. The browser does not warn about this.
2. **Audio reconstruction.** A 2014 paper ("Gyrophone") showed that the gyroscope on Android devices was sensitive enough to act as a crude microphone, picking up speech in the same room. Newer phones have mitigations.
3. **Cross-device tracking via magnetometer fingerprint.** The magnetic anomaly map around a fixed location (a desk, a bedroom) is reasonably unique.
4. **Step counting / walking gait.** Distinctive enough to identify individuals across sessions.

**What gets sent:** Whatever the page chooses to upload. The Generic Sensor API can stream at 60Hz, which is more than enough for any of the above attacks.

**Persistence:** On iOS, the prompt is per-session for the new sensor API. On Android, the legacy `DeviceMotionEvent` is enabled by default with no prompt — Chrome only prompts for the new `Accelerometer`/`Gyroscope` interfaces.

**Revoke:** Site settings → Motion sensors (on browsers that expose it). On iOS, you can disable the legacy events sitewide in Settings → Safari → Motion & Orientation Access.

## Clipboard

**API:** `navigator.clipboard.readText()` / `writeText()` / `read()` / `write()`
**Prompt wording (read):** "example.com wants to see text and images copied to the clipboard" — Chrome usually prompts only for `read()`, not `write()`.

What the page can do once granted:

- Read whatever is currently on your clipboard, in full, including text, images, and arbitrary MIME types.
- Read updates as the clipboard changes (Chrome only, behind a recently-added API).

What "whatever is on your clipboard" means in practice: passwords you just copied from a password manager, the API token you copied from a terminal, the credit card number you copied from a billing page in another tab. The clipboard is shared across every app on your device.

**What gets sent:** Whatever the JavaScript decides. There is no built-in throttling — once granted, the page can read the clipboard on every focus event or on a polling timer.

`writeText()` (writing to the clipboard) does _not_ require a prompt in any major browser, only a user gesture. That's why "Copy" buttons on the web work without ever asking.

**Persistence:** Sticky for `read()` in Chrome. Per-gesture in Safari and Firefox.

**Revoke:** Site settings → Clipboard. The safer default is to never grant clipboard read to a site.

## Screen capture

**API:** `navigator.mediaDevices.getDisplayMedia()`
**Prompt wording:** A chooser dialog asking which screen, window, or tab to share, plus a checkbox for audio.

What the page can do once granted:

- Capture a live video stream of the screen, window, or tab you selected.
- Optionally capture system or tab audio along with the video.
- Process the frames identically to a camera stream.

The chooser is the protection: the page does not get to pick which surface; you do. Once selected, though, the page receives full-resolution frames at up to the display's refresh rate, indistinguishable from a camera stream in API terms.

**What gets sent:** Streamed to wherever the page is configured to send it. Conference apps stream in real time. Screenshot tools may upload a single frame.

The main gotcha: if you choose to share an entire screen, every notification, popup, and other window that appears on that screen is captured too. A Slack DM that pops up during a "share my browser window" demo ends up in the recording.

**Persistence:** Per-gesture in all browsers — you have to re-pick the surface every time. There is no sticky grant.

**Revoke:** N/A. The grant doesn't persist.

## Bluetooth (Web Bluetooth)

**API:** `navigator.bluetooth.requestDevice()`
**Prompt wording:** A chooser of nearby Bluetooth devices matching the page's filter.

Similar shape to WebUSB. The page declares which device services it cares about, the browser shows a chooser of matching devices, you pick one, and the page can then read characteristics from and write characteristics to that device.

Used for: fitness trackers, heart rate monitors, smart locks, LED light controllers, some embedded device setup flows.

**What gets sent:** Whatever the page sends. Device MAC addresses are usually masked by the browser (replaced with an opaque ID) but device names and service UUIDs are exposed.

**Persistence:** Sticky per-device, per-origin in Chrome.

Not implemented in Firefox or Safari.

**Revoke:** Site settings → Bluetooth devices.

## Serial (Web Serial)

**API:** `navigator.serial.requestPort()`

Same shape as WebUSB but for serial ports — typically USB-to-serial adapters, the kind used to flash microcontrollers and talk to embedded boards. Chromium only.

**What gets sent:** Raw bytes; anything the page wants.

**Persistence:** Sticky per-port, per-origin.

**Revoke:** Site settings → Serial ports.

## HID (WebHID)

**API:** `navigator.hid.requestDevice()`

For human interface devices that aren't normal keyboards or mice — gaming controllers, exotic input devices, some assistive tech. The chooser excludes standard keyboards to prevent keystroke logging.

Chromium only.

## NFC (Web NFC)

**API:** `NDEFReader` for reading and writing NFC tags.
**Prompt wording:** "example.com wants to read NFC tags"

Android Chrome only. Allows the page to read NFC tags brought near the device and to write to writable tags.

**Persistence:** Per-session by default.

## File System Access

**API:** `window.showOpenFilePicker()`, `window.showDirectoryPicker()`, `window.showSaveFilePicker()`
**Prompt wording:** A native file picker, plus a follow-up prompt for write access to a chosen directory: "Let example.com edit files in this folder?"

What the page can do once granted:

- For a file picker: read or write that specific file.
- For a directory picker with write access: read every file in that directory tree, write to existing files, create new files. The grant is recursive.

**What gets sent:** Anything the page reads from the chosen file or directory. The grant is to "this folder," not "the contents of this folder remain local."

The directory picker is one of the more dangerous prompts when granted casually. A site asking "open a folder to back up" can read every file in that folder, including hidden dotfiles. Granting access to your home directory grants access to your shell history, SSH keys, browser profile, and source code.

**Persistence:** Per-tab in most current implementations, with optional permanent grant via `requestPermission()`.

**Revoke:** Site settings → File editing / File system.

## Idle detection

**API:** `IdleDetector`

Allows the page to know whether you are interacting with your device or have been idle for a configurable threshold (minimum 60 seconds). The page can react when you walk away from the keyboard and when you come back.

**What gets sent:** A boolean (active vs idle) and a screen-locked status. Useful for productivity-tracking sites and chat apps, and equally useful for analytics.

Chromium only. Not implemented in Firefox or Safari, on principle.

## Screen wake lock

**API:** `navigator.wakeLock.request('screen')`

Keeps the screen from dimming and sleeping while the tab holds the lock. Used by recipe sites, navigation, presentation tools.

**What gets sent:** Nothing directly. The privacy cost is small; the battery cost is the more practical concern.

**Persistence:** Held until the tab is hidden, the page releases it, or the device is locked.

## Background sync / Background fetch / Periodic background sync

**APIs:** `SyncManager`, `BackgroundFetchManager`, `PeriodicSyncManager` (the last is gated by an additional permission).

Periodic background sync, in particular, allows a registered service worker to wake up on a regular schedule (typically once per day, minimum 12-hour interval) and run code while the tab is closed. Chromium only.

**What gets sent:** Whatever the service worker does. In practice this means a site you visited weeks ago can fetch updates, refresh analytics, and re-establish a push subscription without you ever returning to the tab.

**Persistence:** Sticky once granted.

## Payment handler

**API:** Payment Request API + Payment Handler registration.

Allows a site to register itself as a payment app. The browser may then offer it as a payment option on other sites. Used by Google Pay, Apple Pay's web bridge, and a handful of bank-issued web wallets.

**What gets sent:** A site-to-site interaction that the user explicitly confirms. The browser mediates; the payment handler site only receives the data the user agrees to share.

## A quick reference table

| Permission           | What the page reads / does                          | Cross-origin sticky? | Implemented in                  |
| -------------------- | --------------------------------------------------- | -------------------- | ------------------------------- |
| Geolocation          | Coordinates, accuracy, altitude, heading, speed     | Sticky in Chrome     | All                             |
| Camera               | Live video stream up to native FPS                  | Sticky in Chrome     | All                             |
| Microphone           | Live audio stream up to 48kHz                       | Sticky in Chrome     | All                             |
| Notifications + Push | OS-level notifications and server-initiated push    | Sticky               | All                             |
| Persistent storage   | Eviction-resistant local storage                    | Sticky               | All                             |
| Motion sensors       | Accelerometer, gyroscope, magnetometer at up to 60Hz | Sticky on Android   | All (varies)                    |
| Clipboard read       | Full clipboard contents on demand                   | Sticky in Chrome     | All                             |
| Screen capture       | Live screen, window, or tab feed                    | Per-gesture          | All                             |
| Web USB              | Raw USB traffic to chosen device                    | Sticky per-device    | Chromium only                   |
| Web MIDI             | MIDI input/output, device list, optional sysex      | Sticky               | Chrome, Edge, Firefox           |
| Web Bluetooth        | GATT services on chosen device                      | Sticky per-device    | Chromium only                   |
| Web Serial           | Raw serial bytes to chosen port                     | Sticky per-port      | Chromium only                   |
| Web HID              | Raw HID reports from chosen device                  | Sticky per-device    | Chromium only                   |
| Web NFC              | NFC tag read/write                                  | Per-session          | Android Chrome only             |
| File System Access   | Read/write specific file or folder recursively      | Optional permanent   | Chromium-derived                |
| Idle detection       | Active/idle/locked status                           | Sticky               | Chromium only                   |
| Screen wake lock     | Prevent screen sleep                                | Per-lock             | All                             |
| Periodic bg sync     | Scheduled background code execution                 | Sticky               | Chromium only                   |
| Payment handler      | Mediated payment flow                               | Per-registration     | All                             |

## A rule of thumb

The browser's permission model is designed to gate the _open_ — the moment the API hands the page access to a stream of data or a capability. It is not designed to gate the _use_. The page can sit on the granted permission indefinitely, in Chrome's default config, and you have no idea when it is being exercised unless the browser shows a UI indicator (which only happens for camera, microphone, screen capture, location, and notifications — not for sensors, clipboard, USB, MIDI, storage, or sync).

If you've taken nothing else away, the practical guidance is short:

1. **Default to "Block."** You can always grant later. Revoking after the fact is too easy for sites to circumvent by re-prompting.
2. **Don't grant on first visit.** Wait until you actually try to use the feature the permission gates.
3. **Prefer browsers that don't make permissions sticky.** A per-session grant cannot be silently re-used a year later.
4. **Audit periodically.** Every browser has a site-settings page. Most users have permissions granted to sites they don't remember visiting.

Nav0 takes the position that permissions are per-session by default, that no permission grants survive a tab close, and that the [un-features list](/guide/un-features) extends to APIs we don't expose at all — WebUSB, Web Bluetooth, Web Serial, Web HID, WebMIDI, periodic background sync, idle detection. If you didn't know your browser could connect to a USB device or read your clipboard while you're not looking, the simplest fix is to use a browser that can't.

---

_Nav0 is a minimal, privacy-focused browser that collects zero data. It's open source, free, and built on the belief that your browser should do one thing well: let you browse the web. [Get started](/guide/getting-started)._
