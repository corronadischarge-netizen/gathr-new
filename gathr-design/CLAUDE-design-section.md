## Design system (gathr-design, release 25)

- The design system lives in `gathr-design/`. It wins over everything else on visual details. Read `gathr-design/rules.md` first, then the component README for anything you build.
- **Source of truth:** `gathr-design/tokens.json` for every value (colour, type, spacing, radius, shadow, motion). If `tokens.css` disagrees, tokens.json wins; regenerate with `python gathr-design/tools/regen_type_css.py gathr-design/tokens.json gathr-design/tokens.css`.
- **Props:** `gathr-design/components/index.d.ts` wins over any other prop list. `components/bundle.css` and `bundle.js` are the reference implementation: match their structure, class intent and behaviour in the app's React components.
- **Reuse before building.** Use the app's existing implementation of a design-system component. If it doesn't exist, build it from its README and index.d.ts, in the same folder as the app's other design-system components. Never inline a one-off look-alike.
- **Never:** colours outside tokens.json · type sizes off the ladder (32/20/16/15/13/11) · italics in the app · gradients except named occasions, functional fades and the screen glow · shine on selections or buttons · glass on cards · more than one violet booking button per screen · more than one bobbing sticker per screen · percentages for crowd · a full stop at the end of a UI message · `night-300` as a text colour.
- **Text levels:** `ink` for names, headlines and prices; `ink-muted` for venue, time and meta; `ink-faint` for timestamps and source lines.
- **Host mode** screens are wrapped in `.g-host` (yellow-300 selections and main buttons).
- **Every short message** is a `Toast`.
- **Door copy is short:** DoorVerdict text is 2–3 words (20 characters max) and never repeats the group; the GroupPill says who and what's next. Exact strings: `rules.md` › The home, and the DoorVerdict and GroupPill READMEs.
- When you change a design-system component, tell Shubh so the live design system can be updated to match.
