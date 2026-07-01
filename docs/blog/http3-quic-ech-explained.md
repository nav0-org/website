---
title: 'HTTP/3, QUIC, and ECH Explained for Curious Browser Users'
description: 'A plain-English explainer of HTTP/3, QUIC, and Encrypted Client Hello — what actually changed under the hood, and what it means for what your ISP can still see when you browse.'
date: 2026-06-15
author: Ketan Patil
category: privacy
lastReviewed: 2026-06-15
tldr: >-
  HTTP/3 moves the web off TCP onto QUIC, which encrypts almost the entire
  connection setup. ECH (Encrypted Client Hello) seals the last plaintext
  leak — the hostname your browser used to announce in the open. Together
  with encrypted DNS, they shrink what your ISP can see from "every site you
  visit" down to "a list of IP addresses," and on big CDNs even those reveal
  little. Your ISP still sees that you're online and roughly how much; it no
  longer gets a readable browsing history.
tags: [privacy, security, networking, browsers]
head:
  - - meta
    - property: og:type
      content: article
  - - meta
    - property: article:published_time
      content: '2026-06-15'
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
      content: networking
  - - meta
    - name: keywords
      content: 'http/3 explained, what is quic, encrypted client hello, ech browser, does isp see https, sni encryption, encrypted dns doh, quic vs tcp, isp tracking https, what can my isp see, http3 privacy, ech cloudflare, encrypted sni'
  - - script
    - type: application/ld+json
    - |
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "HTTP/3, QUIC, and ECH Explained for Curious Browser Users",
        "description": "A plain-English explainer of HTTP/3, QUIC, and Encrypted Client Hello — what actually changed under the hood, and what it means for what your ISP can still see when you browse.",
        "datePublished": "2026-06-15",
        "author": { "@type": "Person", "name": "Ketan Patil", "url": "https://nav0.org/about" },
        "publisher": {
          "@type": "Organization",
          "name": "Nav0",
          "url": "https://nav0.org",
          "logo": { "@type": "ImageObject", "url": "https://nav0.org/logo.svg" }
        },
        "mainEntityOfPage": "https://nav0.org/blog/http3-quic-ech-explained",
        "keywords": ["HTTP/3", "QUIC", "Encrypted Client Hello", "ECH", "SNI", "encrypted DNS", "ISP tracking", "privacy", "TLS 1.3"]
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
            "name": "Can my ISP see what websites I visit if I use HTTPS?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Historically yes, in part. Even with HTTPS, your ISP could read the hostname from two plaintext sources: your DNS lookups and the SNI field your browser sent at the start of every TLS connection. Encrypted DNS (DoH or DoT) closes the DNS leak, and Encrypted Client Hello (ECH) closes the SNI leak. With both enabled over HTTP/3, your ISP sees the destination IP address and traffic timing, but not a readable list of the sites you visit."
            }
          },
          {
            "@type": "Question",
            "name": "What is the difference between HTTP/3 and QUIC?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "QUIC is the transport protocol; HTTP/3 is HTTP running on top of it. Older HTTP versions ran over TCP and added TLS encryption on top. QUIC instead runs over UDP and builds TLS 1.3 encryption directly into the transport, so the connection handshake and most metadata are encrypted from the first packet. HTTP/3 is simply the version of HTTP designed to use QUIC."
            }
          },
          {
            "@type": "Question",
            "name": "What is Encrypted Client Hello (ECH)?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Encrypted Client Hello is a TLS extension that encrypts the first message your browser sends when starting a secure connection, including the Server Name Indication (SNI) that names the site you want. Before ECH, that hostname was sent in plaintext and visible to anyone on the network path, including your ISP. ECH encrypts it using a public key the site publishes in DNS, so on-path observers can no longer read which site you are connecting to."
            }
          },
          {
            "@type": "Question",
            "name": "Does ECH make me anonymous?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. ECH hides the hostname from your ISP and other on-path observers, but the website you connect to still sees your IP address, and your DNS resolver still sees your lookups. ECH protects against network-level surveillance of which sites you visit; it does not stop browser fingerprinting, tracking cookies, account-based tracking, or data collection by the site itself or by your browser vendor."
            }
          },
          {
            "@type": "Question",
            "name": "Do I need to do anything to use HTTP/3 and ECH?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "HTTP/3 is negotiated automatically when both your browser and the server support it. ECH usually requires that encrypted DNS is enabled in your browser, because the browser fetches the site's ECH key from a DNS record. Modern browsers expose a setting for secure DNS and for encrypted hostnames; once those are on, HTTP/3 and ECH are used transparently wherever the destination supports them."
            }
          }
        ]
      }
---

# HTTP/3, QUIC, and ECH Explained for Curious Browser Users

<p style="color: var(--vp-c-text-2); font-size: 0.9rem;">By Ketan Patil &middot; June 15, 2026 &middot; 9 min read</p>

For years, the standard advice was depressingly simple: your ISP can see every website you visit, even over HTTPS. The padlock encrypted what you _did_ on a site, but the address bar of your life — the list of domains — leaked out in the clear.

That's quietly stopped being true. Three changes — HTTP/3, QUIC, and Encrypted Client Hello — have reshaped what an observer sitting between you and the web can actually read. None of them got a marketing launch. They just shipped, got switched on by default, and changed the threat model underneath you.

This post is the plain-English version: what each piece is, what actually changed, and — the part that matters — what your ISP can and can't see now.

## The old model: HTTPS that still leaked your browsing history

Let's start with how things worked for most of the web's HTTPS era.

When you loaded a site, two things happened that your ISP could read:

1. **A DNS lookup.** Your browser asked "what's the IP address for `example.com`?" — and for most of internet history, that question went out in **plaintext UDP**. Anyone on the path, including your ISP, could log the hostname.
2. **The TLS handshake.** Once your browser had the IP, it opened a TLS connection. The very first message — the **ClientHello** — contained a field called **SNI** (Server Name Indication). SNI tells the server which site you want, because one IP address (think a CDN) hosts thousands of sites. The catch: SNI was sent **before** encryption was established, so it too was in the clear.

So even with a perfect padlock, your ISP had two independent ways to reconstruct your browsing history: your DNS queries and your SNI fields. HTTPS hid the _contents_ of pages. It did not hide _which sites_ you were visiting.

That's the leak these three technologies close.

## QUIC: a new foundation under the web

The first piece is the one with the strangest name. **QUIC** is a transport protocol — the same layer of the stack as TCP, the decades-old workhorse that almost all internet traffic has used.

QUIC makes two big moves:

- **It runs over UDP instead of TCP.** This sounds like trivia, but it lets QUIC do things TCP can't, like recovering from a single lost packet without stalling every other stream on the connection (TCP's infamous "head-of-line blocking").
- **It builds encryption in, not on top.** With the old stack, you opened a plaintext TCP connection and _then_ negotiated TLS encryption on top of it. QUIC bakes **TLS 1.3 directly into the transport**. From nearly the first packet, the connection is encrypted — including most of the handshake machinery that TCP exposed in the open.

The practical privacy effect: there's simply **less plaintext on the wire**. With TCP+TLS, a network observer could watch the connection get set up step by step. With QUIC, most of that setup is encrypted, so deep-packet-inspection boxes that used to parse your connections see a lot less structure to grab onto.

QUIC also makes connections harder to _tamper with_, not just read. Because the transport itself is authenticated and encrypted, middleboxes can't quietly inject, downgrade, or rewrite traffic the way they could with TCP.

## HTTP/3: HTTP that speaks QUIC

This one is the easiest. **HTTP/3 is just HTTP running on top of QUIC.**

- HTTP/1.1 and HTTP/2 ran over TCP.
- HTTP/3 runs over QUIC (which runs over UDP).

When your browser and a server both support it, they negotiate HTTP/3 automatically — you don't choose it, and you usually can't tell it happened. The site loads the same; it just rides on the encrypted, multiplexed QUIC foundation instead of TCP.

For our purposes, HTTP/3 matters because it's the vehicle that brought QUIC to the mainstream web. Most large sites and CDNs serve HTTP/3 today, which means most of your everyday browsing already benefits from QUIC's tighter encryption — quietly, by default.

But HTTP/3 and QUIC alone don't close the **biggest** leak. The SNI hostname was still being sent so the server knew which site to serve. That required one more piece.

<BlogAnimation scene="quic" />

## ECH: sealing the last plaintext leak

**Encrypted Client Hello (ECH)** is the change that closes the SNI hole — and it's the one that genuinely moves the needle on ISP-level tracking.

Remember the problem: the browser has to tell the server which site it wants, but it has to do that _before_ encryption is set up, because the server's certificate depends on which site you're asking for. Classic chicken-and-egg.

ECH solves it like this:

1. The site (or its CDN) publishes a **public key** in a DNS record — specifically the `HTTPS` resource record for the domain.
2. Your browser fetches that key, then **encrypts the inner ClientHello** — the part containing the real SNI — using it.
3. On the wire, the observer sees an _outer_ ClientHello pointing at a generic, shared name (for example, the CDN's front), with the real destination sealed inside.

The result: your ISP can no longer read which site you asked for from the TLS handshake. The hostname — the single most revealing piece of metadata in the old model — goes dark.

There's one critical dependency, though: **ECH only works if your DNS is also encrypted.** Otherwise you've encrypted the SNI, but your browser just announced the exact same hostname a moment earlier in a plaintext DNS query. That's why ECH and encrypted DNS travel together.

## The piece that ties it together: encrypted DNS

**DoH (DNS over HTTPS)** and **DoT (DNS over TLS)** encrypt the DNS lookups themselves. Instead of broadcasting "what's the IP for `example.com`?" in the clear, your browser sends that question over an encrypted channel to a DNS resolver.

This closes the _first_ of the two old leaks. Combined with ECH closing the _second_, the picture changes completely.

It comes with one honest caveat: encrypted DNS doesn't make your lookups vanish — it **moves** them. Your ISP no longer sees them, but your **DNS resolver** does. If your browser uses a third-party resolver, you've shifted that visibility from your ISP to whoever runs the resolver. That's usually a net win (a dedicated resolver isn't also selling you a broadband contract), but it's a trust _shift_, not trust _elimination_ — the same dynamic as [browser VPNs](/blog/your-browser-doesnt-need-a-vpn).

## So what can your ISP actually see now?

Here's the before-and-after, which is the whole point of this post.

| What's on the wire | Old stack (HTTPS over TCP, plaintext DNS) | HTTP/3 + ECH + encrypted DNS |
| --- | --- | --- |
| The fact that you're online | Visible | Visible |
| Destination **IP address** | Visible | Visible |
| **Hostname** via DNS | Visible (plaintext lookups) | Hidden (encrypted DNS) |
| **Hostname** via SNI | Visible (plaintext ClientHello) | Hidden (ECH) |
| Page contents / URLs / data | Hidden (TLS) | Hidden (TLS 1.3) |
| Traffic timing & volume | Visible | Visible |

The short version: your ISP goes from holding a **readable browsing history** to holding **a list of IP addresses you talked to, and how much**.

And that list of IPs is much weaker than it sounds, because of how the modern web is hosted. A huge share of sites sit behind a handful of CDNs (Cloudflare, Fastly, Google, Amazon). When thousands of sites share the same pool of IP addresses, knowing you connected to "a Cloudflare IP" tells an observer almost nothing about _which_ site. ECH leans on exactly this: the more sites hide behind a shared front, the less any individual connection stands out.

## What this does *not* fix

It's important to be precise, because the easy mistake is to over-read this as "the network can't track me anymore." That's not the claim. Here's what's still true:

- **Your IP is still visible to the destination.** The site you connect to still sees your address. ECH hides the hostname from the _network_, not your identity from the _server_.
- **Traffic analysis still exists.** Packet sizes and timing patterns can sometimes fingerprint which site you're loading even without the hostname. It's harder and noisier, but it's not impossible for a determined observer.
- **Dedicated IPs still leak.** If a site runs on its own dedicated IP rather than a shared CDN, the IP _is_ effectively the hostname. ECH's protection is strongest precisely when sites cluster together.
- **It says nothing about the browser itself.** This is the big one. HTTP/3, QUIC, and ECH protect data _in transit_ from _the network_. They do nothing about the browser phoning home, tracking cookies, [fingerprinting](/blog/your-browser-is-watching-you), or your browser vendor's own telemetry. A browser that encrypts the wire perfectly and then [reports your activity to its maker](/blog/the-enshittification-of-chrome) hasn't made you private — it's just changed who's holding the notebook.

That last point is the one we care most about. Network-layer privacy and browser-layer privacy are different problems, and solving one doesn't solve the other.

## How to check what you've got

Most of this is automatic in modern browsers, but two settings are worth confirming:

1. **Secure / encrypted DNS.** Look for a "Secure DNS," "DNS over HTTPS," or "Use secure DNS" toggle in your browser's privacy settings. ECH depends on it, so it's the one to verify first.
2. **Encrypted hostnames / ECH.** Some browsers expose this directly; others enable it automatically once secure DNS is on and the destination supports it.

HTTP/3 itself needs no setting — it's negotiated silently whenever both ends support it. You can confirm a given site served it over HTTP/3 in your browser's developer tools, under the network panel's protocol column (it'll show `h3`).

## Where Nav0 fits

Nav0 is built on Chromium, so it speaks HTTP/3 and QUIC, supports ECH, and supports encrypted DNS — you get the modern transport-layer protections the same way you would in any current Chromium-based browser. We're not reinventing the network stack; the IETF did that work and it's good.

What Nav0 changes is the _other_ half of the problem — the half these protocols don't touch. We [stripped the telemetry, the sync, and the phone-home machinery out of Chromium](/blog/what-we-stripped-from-chromium) so the browser itself isn't the thing watching you. Encrypted transport plus a browser that collects zero data is the combination that actually adds up to privacy. One without the other is half a story.

HTTP/3, QUIC, and ECH quietly fixed a leak the web carried for decades. That's worth understanding — and worth pairing with a browser that doesn't reopen the leak from the inside.

## Frequently Asked Questions

### Can my ISP see what websites I visit if I use HTTPS?

Historically, yes — in part. Even with HTTPS, your ISP could read the hostname from two plaintext sources: your DNS lookups and the SNI field your browser sent at the start of every TLS connection. Encrypted DNS (DoH or DoT) closes the DNS leak, and Encrypted Client Hello (ECH) closes the SNI leak. With both enabled over HTTP/3, your ISP sees the destination IP address and traffic timing, but not a readable list of the sites you visit.

### What is the difference between HTTP/3 and QUIC?

QUIC is the transport protocol; HTTP/3 is HTTP running on top of it. Older HTTP versions ran over TCP and layered TLS encryption on top. QUIC instead runs over UDP and builds TLS 1.3 encryption directly into the transport, so the connection handshake and most metadata are encrypted from the first packet. HTTP/3 is simply the version of HTTP designed to use QUIC.

### What is Encrypted Client Hello (ECH)?

ECH is a TLS extension that encrypts the first message your browser sends when starting a secure connection, including the SNI that names the site you want. Before ECH, that hostname was sent in plaintext and visible to anyone on the network path, including your ISP. ECH encrypts it using a public key the site publishes in DNS, so on-path observers can no longer read which site you're connecting to.

### Does ECH make me anonymous?

No. ECH hides the hostname from your ISP and other on-path observers, but the website you connect to still sees your IP address, and your DNS resolver still sees your lookups. ECH protects against network-level surveillance of which sites you visit; it doesn't stop browser fingerprinting, tracking cookies, account-based tracking, or data collection by the site itself or by your browser vendor.

### Do I need to do anything to use HTTP/3 and ECH?

HTTP/3 is negotiated automatically when both your browser and the server support it. ECH usually requires encrypted DNS to be enabled in your browser, because the browser fetches the site's ECH key from a DNS record. Once secure DNS is on, HTTP/3 and ECH are used transparently wherever the destination supports them.

---

_Nav0 is a minimal, privacy-focused browser that collects zero data. It's open source, free, and built on the belief that your browser should do one thing well: let you browse the web. [Get started](/guide/getting-started)._
