---
title: 'Who Really Invented Tabbed Browsing? The Messy, Forgotten History'
description: 'InternetWorks, NetCaptor, SimulBrowse — the real, messy history of tabbed browsing, and why the popular story that Opera invented the browser tab is a myth.'
date: 2026-05-25
author: Nav0 Team
tags: [indie-browsers, browsers, open-web, history]
head:
  - - meta
    - property: og:type
      content: article
  - - meta
    - property: article:published_time
      content: '2026-05-25'
  - - meta
    - property: article:author
      content: Nav0 Team
  - - meta
    - property: article:tag
      content: indie-browsers
  - - meta
    - property: article:tag
      content: browsers
  - - meta
    - property: article:tag
      content: open-web
  - - meta
    - property: article:tag
      content: history
  - - meta
    - name: keywords
      content: 'who invented tabbed browsing, who invented the browser tab, history of browser tabs, InternetWorks browser, BookLink Technologies, NetCaptor, SimulBrowse, Adam Stiles, did Opera invent tabs, Opera tabbed browsing myth, MDI vs tabs, MultiZilla, Mozilla tabs history, Firefox tabs, Internet Explorer 7 tabs, history of web browsers, tabbed browsing origin'
  - - script
    - type: application/ld+json
    - |
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Who Really Invented Tabbed Browsing? The Messy, Forgotten History",
        "description": "InternetWorks, NetCaptor, SimulBrowse — the real, messy history of tabbed browsing, and why the popular story that Opera invented the browser tab is a myth.",
        "datePublished": "2026-05-25",
        "author": { "@type": "Organization", "name": "Nav0" },
        "publisher": { "@type": "Organization", "name": "Nav0", "url": "https://nav0.org", "logo": { "@type": "ImageObject", "url": "https://nav0.org/logo.svg" } },
        "mainEntityOfPage": "https://nav0.org/blog/who-invented-tabbed-browsing",
        "keywords": ["who invented tabbed browsing", "browser tab history", "InternetWorks", "BookLink Technologies", "NetCaptor", "SimulBrowse", "Adam Stiles", "Opera tabs myth", "MultiZilla", "Mozilla tabs", "Firefox tabs", "Internet Explorer 7 tabs", "history of web browsers"]
      }
---

# Who Really Invented Tabbed Browsing? The Messy, Forgotten History

<p style="color: var(--vp-c-text-2); font-size: 0.9rem;">By Nav0 Team &middot; May 25, 2026 &middot; 12 min read</p>

There's a tidy version of this story that gets repeated everywhere: Opera invented tabbed browsing around 2000, and then everyone else copied it. It's clean, it's memorable, and it's wrong.

The real history of the browser tab is older, messier, and mostly belongs to a handful of tiny browsers almost nobody remembers. The feature you use to keep forty things open at once was not handed down by a major vendor. It was invented, lost, reinvented, and quietly perfected by small independent projects — some of them one-person operations — years before any of the browsers you've heard of shipped it. The giants arrived last and got the credit.

It's worth getting right, because the pattern repeats. The most useful thing your browser does was figured out by people building the browser _they_ wanted.

## The corrected timeline, at a glance

Before the stories, here's the actual order of events. Keep it handy the next time someone tells you Opera did it first.

| Year | Browser / project                       | What actually happened                                                                                  |
| ---- | --------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 1994 | InternetWorks — BookLink Technologies   | First browser with a tabbed interface. Acquired by AOL within months, then shelved.                     |
| 1997 | SimulBrowse → NetCaptor — Adam Stiles   | An Internet Explorer shell with the first tabs that look and behave like today's.                       |
| 2000 | Opera 4                                 | Introduced an MDI workspace often misremembered as the first browser tabs.                              |
| 2001 | MultiZilla, then Mozilla 0.9.5          | Tabs arrive in the open-source world — first as an add-on, then built in.                               |
| 2003 | Opera 7                                 | Opera's first true tab bar. It called them "pages."                                                     |
| 2003 | Safari                                  | Tabs come to the Mac.                                                                                    |
| 2004 | Firefox 1.0                             | The release that made tabs feel normal to everyone.                                                     |
| 2006 | Internet Explorer 7                     | Microsoft finally ships tabs — twelve years after InternetWorks.                                        |
| 2008 | Google Chrome                           | Tabs on top, one process per tab.                                                                       |

Now the messy part.

## 1994: InternetWorks gets there first

In June 1994, a company called BookLink Technologies shipped a browser for Windows named [InternetWorks](https://thehistoryoftheweb.com/milestones/internetworks/). It had tabs — a row of selectable headers along the interface that let you keep several pages open and switch between them in one window. This was the same year Netscape Navigator 1.0 appeared. Tabs were there at the very beginning of the commercial web, and then they vanished.

InternetWorks was genuinely ahead of its time in more ways than one. It used a progressive loading technique that painted a page's text first and pulled in images second, which made it feel fast on the modems of the era. It was built to be embeddable — the browsing component could be dropped into other applications, including email clients. It won "Rookie of the Year" recognition at the Comdex trade show. For a browser from 1994, the ambition was remarkable.

It didn't last. Within months, AOL acquired BookLink Technologies — a deal reported at roughly $30 million in stock, finalized in late 1994. AOL wanted browser technology for its walled garden, and InternetWorks got folded in. Then AOL signed a deal to use Netscape's engine instead, and the original browser — tabs and all — was sidelined. The first tabbed browser was effectively bought and shelved before most people ever touched the web.

So tabs were invented, and then they died, and the web spent the next several years without them.

## 1997: SimulBrowse, NetCaptor, and the actual DNA

The version of tabs you actually use traces back to one person.

In 1997, a developer named Adam Stiles built a browser he called SimulBrowse. It wasn't a browser engine — it was a _shell_ around Internet Explorer, using Microsoft's Trident rendering engine under the hood and wrapping it in a better interface. The headline feature was tabs: multiple pages open inside a single window, each with its own tab you could click between. Stiles disliked the name SimulBrowse and soon renamed the project [NetCaptor](https://en.wikipedia.org/wiki/NetCaptor).

The inspiration wasn't another browser. Stiles has said he got the idea from an HTML editor that let him flip between open documents using tabs, and he wanted that same ability while browsing the web. That small leap — applying a document-editing convenience to the act of browsing — is the moment the modern browser tab really starts.

NetCaptor's tabs are the ones that matter, because they're the ones that look and behave like the tabs in your browser right now. Stiles later called NetCaptor [the "DNA" of tabbed browsing](https://ajstiles.wordpress.com/2005/02/11/tabbed_browser_/), and he's frequently credited with coining the phrase "tabbed browsing" itself. BuzzFeed once ran a profile of him headlined ["Meet The Man Who Invented The Browser Tab."](https://www.buzzfeednews.com/article/josephbernstein/meet-the-man-who-invented-tabs) He didn't patent the idea. He shipped it as shareware and ran the project for years — the last release, 7.5.4, came out in February 2005, and Stiles formally declared "NetCaptor is dead" in 2008, ten years after he started.

Sit with the dates for a second. A hobbyist gave Windows users real tabbed browsing in 1997 — three years before Opera's much-cited 2000 release, and nearly a decade before Microsoft, whose own engine NetCaptor was built on top of, got around to it.

## The Internet Explorer shell underground

NetCaptor wasn't alone, and that's the part the tidy story erases completely.

For roughly a decade, Internet Explorer had no tabs. IE6, which an enormous share of the world used as its only browser, made you open a brand-new window for every page. So an entire underground of _IE shells_ grew up to fix it — browsers that reused IE's Trident engine but bolted a tabbed interface on top. NetCaptor was the pioneer, but it was joined by Avant Browser, by MyIE, and by MyIE2, which evolved into Maxthon. Millions of people got their first taste of tabbed browsing through one of these wrappers.

Think about what that means. The single most-requested improvement to the dominant browser of the era was already shipping — built by small independent developers, running on Microsoft's own rendering engine — for years before Microsoft shipped it themselves. The capability was sitting right there. The incumbent just didn't bother.

## The Opera myth, examined

So where does "Opera invented tabs" come from? Opera _was_ a real innovator — it popularized pop-up blocking, mouse gestures, and Speed Dial, and it deserves credit for those. But on tabs specifically, the popular story collapses the moment you look at what Opera actually shipped and when.

Early Opera used an **MDI** — a multiple-document interface. That's a desktop-software convention where you open child windows _inside_ one big parent window, and a taskbar-like strip shows you what's open. Opera 4, released in June 2000, is the version most often pointed to as "the first tabs." It wasn't tabs. It was an MDI workspace. Opera 6 (late 2001) let you choose between interface modes. Opera didn't ship a proper tab bar — the single-document-area-with-a-strip-of-tabs model everyone now means by "tabs" — until [Opera 7](https://en.wikipedia.org/wiki/History_of_the_Opera_web_browser) in January 2003 (with the feature appearing in a late-2002 beta). And even then, Opera called them "pages," not tabs.

The distinction between MDI and tabs isn't pedantry. An MDI gives you draggable, resizable, overlapping windows penned inside a frame. Tabs give you exactly one visible document and a clean row of selectors to swap which one it is. They _feel_ different, and the thing that won — the thing in every browser today — is the tab, not the MDI.

Line the dates up and the myth has nowhere to stand. Opera's true tabs (2003) arrived after NetCaptor (1997), after the open-source world had them (2001), and nine years after InternetWorks (1994). Opera was a latecomer to tabs that happened to be an early mover on a lot of other good ideas — and memory blurred the two together.

## 2001: tabs go open source

The next leap came from the Mozilla project, and again it started outside the official browser.

In 2001, a developer named HJ van Rantwijk released **MultiZilla**, an extension that added tabbed browsing to the Mozilla suite. It was popular enough to prove the demand, and that same year Mozilla baked tabs directly into the browser with version 0.9.5 in October 2001.

Here's the connective tissue that ties the whole story to the browsers you actually use: Dave Hyatt, a Mozilla engineer, tried MultiZilla, loved the tabbed browsing, and carried the feature forward into the projects he worked on — Chimera (which became Camino) and then Phoenix. Phoenix was renamed Firebird, then **Firefox**.

When Firefox 1.0 landed in 2004, tabs finally went mainstream. For a huge number of people, Firefox was the browser that taught them tabs existed. That's the kernel of truth buried inside the myth — a small, scrappy browser really did make tabbed browsing normal for the masses. It just wasn't Opera, and the feature was already a decade old when it happened.

## 2003–2008: the giants show up last

Once Firefox made tabs a baseline expectation, the big vendors fell in line — slowly.

Apple's Safari added tabs in 2003. Microsoft, whose Trident engine had quietly powered tabbed browsing in third-party shells since 1997, didn't ship tabs in Internet Explorer until **IE7 in October 2006** — twelve years after InternetWorks, and nearly a decade after NetCaptor. Google Chrome arrived in 2008 and made one genuine contribution to the form: it put tabs at the very top of the window and gave each tab its own operating-system process, so one crashed page couldn't take down the others. That was a real engineering advance. But the tab itself? Chrome inherited it, like everyone else.

The shape of the timeline is the whole point. Invention and refinement happened at the edges — tiny, independent, mostly-forgotten projects. The household-name browsers shipped tabs last and are remembered first.

## Where the tab came from in the first place

Worth a footnote: the _tab_ as an interface idea is older than the web. Tabbed dialog boxes — the little labeled cards in a settings window — were already a standard convention in Windows 3.x and Windows 95 "property sheets." Those, in turn, borrowed a metaphor from the physical world: the protruding tabs on file folders and index cards that let you flip to the section you want.

That lineage helps explain why the browser tab has so many parents. It wasn't a bolt-from-the-blue invention that one genius owned. It was an obvious, useful metaphor sitting in plain sight, waiting to be applied to browsing — which is exactly why several independent people arrived at it within a few years of each other, and why no single company can honestly claim to have thought of it.

## What the messy story actually tells us

Strip away the myth and a clearer picture emerges, and it's not a story about one heroic vendor.

**There is no single inventor.** There's a relay: InternetWorks ran first and dropped the baton; NetCaptor and the IE shells picked it up and refined it; MultiZilla and Mozilla carried it into open source; Firefox handed it to the world. The big names were the anchor leg, not the start.

**The incumbents were followers.** Microsoft sat on a decade of demand its own engine was already serving in third-party shells. Opera got remembered for a feature it shipped years after a hobbyist did. This is the recurring rhythm of browser history — small projects experiment, the giants copy once the risk is gone. We've written about [the same dynamic playing out today](/blog/the-indie-browser-renaissance), where a new wave of independent browsers is once again doing the experimenting. Pop-up blocking, tracker blocking, reader mode, real privacy defaults — the pattern is always the same.

**The best browser features come from people scratching their own itch.** Adam Stiles didn't build tabs to hit a quarterly engagement target. He built them because he wanted to flip between web pages the way he flipped between documents in his HTML editor. That's where good browser design tends to come from — not from a roadmap optimized to keep you "engaged," but from someone solving a real, specific annoyance in the tool they use every day.

## Nav0's take

We find this history clarifying, because it's a reminder of what a browser feature is supposed to be: a small, focused solution to a real problem. Tabs are arguably the best feature browsers ever got, and they came from the smallest, leanest corners of the ecosystem — not from a feature factory.

That's the bet Nav0 makes. We keep tabs, obviously. We keep the handful of other things that genuinely help you browse — bookmarks, history, an ad blocker, reader mode. And we stop there, because a browser that tries to be a VPN and an AI assistant and a news feed and a crypto wallet isn't innovating; it's just accumulating. The history of tabbed browsing is the opposite story: real progress was a clean, simple idea, shipped by people who wanted nothing more than a better way to browse. That's the only kind of feature we're interested in. [Everything we deliberately leave out](/guide/un-features) is in service of the few things we keep.

Browse. Nothing more. It turns out the most important feature in your browser was built by people who felt exactly the same way.

---

_Nav0 is a minimal, privacy-focused browser that collects zero data. It's open source, free, and built on the belief that your browser should do one thing well: let you browse the web. [Get started](/guide/getting-started)._
