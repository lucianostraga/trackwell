# Trackwell website

The public marketing site of **Trackwell**, real-time equipment tracking for hospitals ("find any piece of hospital
equipment in seconds"). Trackwell is a fictional company, made for a demo.

One page, light theme: navbar, hero with the product screenshot, trust bar, how it works, features, customer results
and quote, what's new, final call to action, contact (`#contact`, where every "Book a demo" button lands) and footer.

Stack: Vite, React, TypeScript (strict), Tailwind CSS v4, Inter, lucide icons. Same tooling and pipelines as the
Trackwell app (CI with preview per pull request, deploy to GitHub Pages).

## Commands

```bash
npm ci
npm run dev          # local server
npm run typecheck
npm test             # unit tests (Vitest)
npm run build        # BASE_PATH=/trackwell/ npm run build for the production path
npm run evidence     # end-to-end walkthrough (Playwright): screenshots and video in evidence/
```

## Where things live

- `src/content/*.ts`: all page copy as typed data (hero, steps, features, logos, metrics, quote, footer, section ids
  and navbar links). Components in `src/components/` only render it.
- `src/data/releases.json`: the "What's new" timeline. Every feature adds `{ "key", "title", "pr", "date" }` at the
  top; keys link to Jira.
- `src/lib/`: pure helpers, each with `tests/unit/<module>.test.ts`.
- `src/index.css`: design tokens. Every color is a CSS variable (brand teal, ink, page surfaces).
- `public/product-floorplan.png`: the hero screenshot (the Trackwell app at 1600 px wide).
- `e2e/home.spec.ts`: the captioned walkthrough that produces `evidence/`.
