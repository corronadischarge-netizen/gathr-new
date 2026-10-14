# gathr-design · release 25 package

Packaged 14 Oct 2026 from the live design system (https://claude.ai/artifact/C3h92QP7c3goZfeh6pEmBV), version 73.
Written straight into this folder by Claude (Cowork), over the release 23 package. Nothing was deleted: `proposed/` and `CHANGES-since-release-21.md` now just point here, and you can delete them.

## What to do now

1. **Commit first.** In VS Code: Source Control → message "gathr-design r25" → Commit. You can always go back.
2. **Run the prompt** in `specs/PROMPT-release-25.md` with Claude Code, one phase at a time. It updates CLAUDE.md, then brings the app's components in line with release 25.

## What's in here

| Path | What it is |
|---|---|
| `START-HERE.md` | This file |
| `CHANGES-since-release-23.md` | Everything that changed since your last package (releases 24 and 25), as a numbered list |
| `rules.md` | The rules in one page: the spine, colour, type and text levels, light, the door-first home, copy, crowd, updates, toast |
| `CLAUDE-design-section.md` | The design-system section for your app's CLAUDE.md |
| `DESIGN-SYSTEM-README.md` | The live system's own README (images removed) |
| `tokens.json` | **Source of truth** for every colour, size, radius, font, spacing and motion value |
| `tokens.css` | The same tokens as CSS variables and type classes, plus `@font-face`. Regenerated from tokens.json in this package (the release 23 copy had older greys) |
| `components/bundle.css`, `bundle.js` | The live system's reference implementation (classes, structure, behaviour) |
| `components/index.d.ts` | Every component's props. Wins over any other prop list |
| `components/<Name>/README.md` | How and when to use each component |
| `guides/01–07` | Colour & type, surfaces, imagery, voice, app recipes, brand moments, checklist |
| `fonts/` | Plus Jakarta Sans 600/700, DM Sans 300–700 (+ italics, expression only) |
| `assets/Logos` | Wordmark SVGs (light, dark, mono white) |
| `assets/Gradients` | Bloom references (peak, uv, sundowner, comedown). Occasions only |
| `assets/Stickers` | The object stickers the app uses. Not changed in this package (wristband is still here; it's no longer in the live system) |
| `proposed/` | Empty note: the release 24 components are live now. Safe to delete |
| `tools/regen_type_css.py` | Rebuilds the type section of tokens.css from tokens.json if they drift again |

## If tokens.css and tokens.json ever disagree

tokens.json wins. Run `python gathr-design/tools/regen_type_css.py gathr-design/tokens.json gathr-design/tokens.css` (or ask Claude Code to). That script rebuilds the type section only; for colours, ask for a fresh package.
