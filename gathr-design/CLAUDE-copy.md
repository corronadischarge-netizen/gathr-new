# gathr Seeker app

gathr is Pune's going-out app for 18–30s. The promise: you'll know the room before you get there.

The owner, Shubh, is a designer with no coding background. When you explain a change, say in plain words what you changed, why, and how to check it in the browser.

## Design system (read before any UI work)
The design system lives in `gathr-design/`. Release 18, 10 Oct 2026.

- `gathr-design/rules.md`: the brand and UI rules. Read this first, every session that touches UI.
- `gathr-design/CHANGES-release-18.md`: what changed since the app was built, and the order to update in.
- `gathr-design/tokens.json` and `gathr-design/tokens.css`: every colour, size, radius, spacing and motion value. Each token says whether it's for the APP or EXPRESSION only.
  - `tokens.json` is the source. `tokens.css` was regenerated from it on 11 Oct 2026 (the live system's copy was stale). If the two ever disagree, `tokens.json` wins: say so instead of guessing.
- `gathr-design/components/index.d.ts`: the component names and their props. This is the source of truth for props.
- `gathr-design/components/<Name>/README.md`: how and when to use each component. `preview.html` next to it shows example markup.
- `gathr-design/components/bundle.css` and `bundle.js`: the reference implementation (class names, styles, markup).
- `gathr-design/guides/`: the long-form guides (01 colour and type, 02 surfaces, 03 imagery, 04 voice, 05 app, 06 brand moments, 07 checklist).
- `gathr-design/fonts/` and `gathr-design/assets/`: fonts, logo SVGs and the occasion gradients.

## Rules for working in this app
- Never invent a colour, size or spacing value. Use the tokens (as CSS variables from `tokens.css`).
- Match component props and behaviour to `index.d.ts` and the component READMEs. If the app has its own version of a component, update it to match rather than adding a second one.
- `bundle.js` expects React as a global (`window.React`) and puts components on `window.Gathr`. Don't load it as-is into the app; use it and `bundle.css` as the reference when building or updating the app's own React components.
- Ignore `gathr-design/api/components/*.md` where it disagrees with `index.d.ts`. Those pages are auto-generated and some are out of date (for example CrowdMeter's).
- Work one screen at a time. After each screen, stop, say what changed and how to check it, and wait for a go-ahead before the next.
- Keep sample data labelled "sample" in the UI.
- Run `gathr-design/guides/07-checklist.md` against a screen before calling it done.
- Never edit files inside `gathr-design/`. They're a copy of the live design system; changes to the system happen there first.
