---
name: web-ui-standards
description: The team's standards for website UI work - accessibility, responsive layout, theming with tokens, content files and end-to-end evidence. Preloaded into the UI builder and the reviewer; use it whenever you build or review a section of the site.
---

# Website UI standards

- **Tokens only.** Every color comes from the CSS variables in `src/index.css` (`--color-brand-*`, `--color-ink-*`,
  surfaces). No hex values in components: that is what makes dark mode and rebranding a one-file change.
- **Content apart from layout.** Texts, lists and prices live in `src/content/*.ts`; rules and math in `src/lib/`;
  components only render. New sections go in `src/App.tsx`; sections with a navbar link are registered in
  `src/content/sections.ts`.
- **Accessible by default.** Every input has a visible `<label>`; errors are announced (`aria-live="polite"`) and
  tied to the field (`aria-describedby`); buttons are `<button>`, links are `<a>`; visible keyboard focus; text
  contrast at least 4.5:1 in both themes; nothing conveyed by color alone.
- **Responsive.** It must look finished at 390, 768, 1280, 1440 and 1920 px wide, with no horizontal scrolling and
  no text cut off. Shown on big screens: alignment and spacing are part of done.
- **Stable.** No layout shift when something updates; numbers use tabular figures; respect
  `prefers-reduced-motion`.
- **Evidence.** One spec per ticket in `e2e/<key>.spec.ts` with captions per step, a screenshot per acceptance
  criterion and the video. It must assert behaviour (values, messages, state), not only take pictures.
