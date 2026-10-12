# gathr-design · release 23 package (+ proposed release 24)

Packaged 13 Oct 2026 from the live design system (https://claude.ai/artifact/C3h92QP7c3goZfeh6pEmBV).
Replaces the release 21 package in your app.

## Install (5 minutes)

1. **Commit first.** In VS Code: Source Control → message "before gathr-design r23" → Commit. You can always go back.
2. **Replace the folder.** In File Explorer, open your app folder (the one with `src` and `package.json`). Delete the old `gathr-design` folder, then copy this `gathr-design` folder in its place.
   - If Windows won't let you delete it (a file is in use), close VS Code, delete, copy, reopen.
   - Don't merge the folders: old files from release 21 would stay behind and confuse Claude Code.
3. **Update CLAUDE.md** (in the app folder root). Open `gathr-design/CLAUDE-design-section.md`, copy everything in it, and replace the design-system section of your CLAUDE.md with it. If you're not sure which part that is, paste the prompt below and let Claude Code do it.
4. **Tell Claude Code** (paste this in plan mode, Shift+Tab):

```
I replaced gathr-design/ with the release 23 package. Read gathr-design/START-HERE.md, CHANGES-since-release-21.md and rules.md. Then:
1. Update the design-system section of CLAUDE.md with gathr-design/CLAUDE-design-section.md.
2. Check the app against CHANGES-since-release-21.md and list, per item, whether the app already does it, partly does it, or doesn't. Some release 21 items were synced back from the app, so verify before changing anything.
3. Propose the order to apply what's missing, one screen or area at a time. Don't change code until I approve.
Note: gathr-design/proposed/ holds release 24 components (DoorVerdict, NightTile, NightRail, GroupPill) that aren't in the live design system yet. They're specified in specs/ds-new-components.md for the home v3 build; treat them as the source for those components.
```

5. **Apply in small steps.** Approve one area at a time, check it in the browser at phone width (F12 → phone icon → 390 wide), commit, then the next.

## What's in here

| Path | What it is |
|---|---|
| `START-HERE.md` | This file |
| `CHANGES-since-release-21.md` | Everything that changed since your last package, as a numbered list |
| `rules.md` | The rules in one page: the spine, colour, type, light, copy, crowd, updates, toast |
| `CLAUDE-design-section.md` | The design-system section for your app's CLAUDE.md |
| `DESIGN-SYSTEM-README.md` | The live system's own README (images removed) |
| `tokens.json` | **Source of truth** for every colour, size, radius, font, spacing and motion value |
| `tokens.css` | The same tokens as CSS variables and type classes, plus `@font-face`. Type section regenerated from tokens.json in this package |
| `components/bundle.css`, `bundle.js` | The live system's reference implementation (classes, structure, behaviour) |
| `components/index.d.ts` | Every component's props. Wins over any other prop list |
| `components/<Name>/README.md` | How and when to use each component |
| `guides/01–07` | Colour & type, surfaces, imagery, voice, app recipes, brand moments, checklist |
| `fonts/` | Plus Jakarta Sans 600/700, DM Sans 300–700 (+ italics, expression only) |
| `assets/Logos` | Wordmark SVGs (light, dark, mono white) |
| `assets/Gradients` | Bloom references (peak, uv, sundowner, comedown). Occasions only |
| `assets/Stickers` | The 16 object stickers the app uses (no slogan stickers, no lighter) |
| `proposed/release-24-new-components.md` | DoorVerdict, NightTile, NightRail, GroupPill + spine change. Not live yet |
| `tools/regen_type_css.py` | Rebuilds the type section of tokens.css from tokens.json if they drift again |

## If tokens.css and tokens.json ever disagree

tokens.json wins. Run `python gathr-design/tools/regen_type_css.py gathr-design/tokens.json gathr-design/tokens.css` (or ask Claude Code to). The live system's generated tokens.css lagged behind tokens.json again in this release (headline was still 16/22 there; the real value is 15/20), which is why this package regenerates it.
