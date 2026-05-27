# Nav0 Website

Source for **[nav0.org](https://nav0.org)** — the public website for the Nav0
browser. It is a static documentation site built with
[VitePress](https://vitepress.dev) and deployed to GitHub Pages.

The Nav0 browser application itself lives in a separate repository,
[nav0-org/nav0-browser](https://github.com/nav0-org/nav0-browser). This repo
ships the marketing pages, user guide, blog posts, release notes, FAQ, and
legal pages.

- **Site**: https://nav0.org
- **Stack**: VitePress 1.5 + Vue 3 SFCs
- **License**: MIT

## Getting Started

```bash
npm ci                 # Install dependencies
npm run docs:dev       # Start the dev server with hot reload
npm run docs:build     # Build the static site into docs/.vitepress/dist
npm run docs:preview   # Preview the production build locally
```

There is no test or lint script. The deploy workflow simply runs
`docs:build` — if that succeeds, the site ships. Always run it locally before
opening a PR.

## Repository Layout

```
website/
├── CLAUDE.md                       # Contributor guide (read this before editing)
├── LICENSE.md
├── package.json                    # VitePress + marked + lucide
├── .github/workflows/docs.yml      # Build + deploy to GitHub Pages
└── docs/
    ├── index.md                    # Homepage
    ├── install.md                  # Downloads page
    ├── faq.md                      # FAQ
    ├── privacy-policy.md           # Legal
    ├── terms-of-use.md             # Legal
    ├── disclaimer.md               # Legal
    ├── public/                     # Static assets served at the site root
    ├── guide/                      # Feature & concept documentation
    ├── blog/                       # Long-form posts
    ├── releases/                   # Release notes, one file per version
    └── .vitepress/
        ├── config.ts               # Site config, nav, sidebars, JSON-LD, SEO
        └── theme/                  # Custom layout, styles, and Vue components
```

## Content

| Section       | Location          | Notes                                                        |
| ------------- | ----------------- | ------------------------------------------------------------ |
| Blog          | `docs/blog/`      | One markdown file per post; sidebar and listing auto-derived |
| Release notes | `docs/releases/`  | One file per version; remember to demote the previous "Latest" |
| Guides        | `docs/guide/`     | Register new pages in the sidebar in `config.ts`             |
| FAQ           | `docs/faq.md`     | Mirrors `docs/.vitepress/theme/faq-data.ts`                  |
| Legal         | `docs/*.md`       | Privacy policy, terms of use, disclaimer                     |

See [`CLAUDE.md`](./CLAUDE.md) for detailed conventions on frontmatter, the
content loaders, SEO/JSON-LD wiring, and the per-section shipping checklists.

## Deployment

`.github/workflows/docs.yml` builds and deploys to GitHub Pages on every push
to `main`. There is no preview or staging environment — the build is the gate.

## License

[MIT](./LICENSE.md) © Ketan Patil
