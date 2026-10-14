# Colour & type

*(Image: The four app colours, the shine and the type ladder. See the live design system.)*

**Why:** colour is a signal, not decoration. Yellow only ever means *energy right now* (live, or a buzzing room), so a glance answers "is it on?" ([brand book](https://claude.ai/artifact/UpE3wvgwzYqppeY1gwwVGk) §03).

## Four colours, one job each

| Colour | Token | Only for |
|---|---|---|
| Violet | `brand` | **gathr's choice**: selected chip, tile, active tab, map pin, gathr pick, and the one booking button |
| Yellow | `now` | **energy right now**: live, the live dot, the Buzzing and Packed levels, and the logo's full stop. Nothing else is yellow; keyboard focus is white. Two exceptions, both host-only: the door scanner keeps an amber (yellow) "check" state next to green (in) and red (no entry), and **host mode** draws every selection and the main buttons in yellow-300 (see below) |
| Green | `go` | **booked**, on the list, entry open; also the Filling up level (green reads as good in both) |
| Red | `limit` | **limits**: sold out, at capacity, age, errors, and the Full level |

Everything else is black and greys (`bg`, `surface`, `surface-raised`, `line`, `ink`, `ink-muted`, `ink-faint`). The 3D objects bring the rest of the colour. Pink and blue live outside the app only (social, posters, recaps, blooms).

**App or expression.** Every colour token is tagged in tokens.json. **App:** yellow-100/300, red-100/300, green-100/300, violet-100/300/500 and the greys. **Expression only:** yellow-500, red-500, green-500, all of pink and all of blue (posters, social, blooms, and the ends of the shine). If a UI needs an expression token, the design is wrong, not the rule.

- **Host mode:** on host screens (wrap them in `.g-host`), yellow-300 with night-900 text replaces violet for every selection (the selected tab and its sliding pill, chips, toggles, tick boxes, picked rows) and the host's main buttons ("List a night", "Submit for review"). It tells a host at a glance which side of gathr they're on. Status colours don't change: green in, red no entry, the scanner's amber check. Violet never appears in host mode.
- **Buttons:** the white pill (`ink` on `on-ink`) is the main action on any screen. The violet `brand` button is kept for the one booking action, once per screen. Never colour a button with a venue hue.
- **Selections and buttons are flat:** one flat fill, no shine, no edge highlight, no glow. That covers the selected chip, tile and pin, the selected tab and its sliding pill, rings, the brand button and Update's Accept.
- **Shine is expression only:** a same-hue gloss built **only** from the hue's own -100/-300/-500 steps (the deepest violet and blue are mixed with night-950), for vibe tags, pill chains, stat bubbles, the pill pattern and social fields. It isn't a colour token: `--shine-<hue>` in bundle.css is a recipe made only of palette tokens plus a white highlight, so "no colour value outside tokens.json" still holds.
- **Status badges:** flat, the one exception to the shine. Solid badges are one flat fill of the hue's fill step (night-950 text on yellow, green and red; white on violet). Transparent badges are a flat 20% wash of the hue with a 1px hue edge and the -100 step as text. Neutral badges are flat night-800 with a night-700 edge. The colours are still only the four above, plus grey.
- **Door verdict (`DoorVerdict`):** green `go` for **yes** (the group gets in), white for **if** (gets in with a condition: dress, arrive by, stag fee), dark grey for **unknown** (a rule isn't listed), and `limit-text` red words for **no**. The words always carry the meaning and the colour repeats it. `if` is never yellow (yellow means energy right now) and red is only for `no`.
- **Booked so far:** grey Early → green Filling up → yellow Buzzing → **yellow Packed** → red Full. Packed is the high point, so it's yellow (energy right now); red is only for Full, the one real limit. Always with its word, and counts as people ("412 of 480"), never a percentage.

## Type ladder

| Style | Size | Face | Use |
|---|---|---|---|
| `display` | 32 | Jakarta 700 | one per screen; gathr's own line, lowercase + yellow full stop |
| `title` | 20 | Jakarta 600 | sheet titles; the one name on a big media card (VenueCard, FeatureCard) |
| `section` | 16 | Jakarta 600 | page-level headings: "Near you", "Listed nights" |
| `headline` | 15 / 20 | DM Sans 600 | names of things (friends, nights, venues, settings rows, update titles) and **every heading inside a card** ("The room", "Tonight so far") |
| `body` | 15 | DM Sans 400 | everything you read |
| `body-light` | 15 / 20 | DM Sans 300 | single-line tips beside an icon, e.g. VenueHero "Before you go" (`.g-tip`) |
| `body-sm` | 13 | DM Sans 400 | meta in `ink-muted` |
| `caps` | 11 | DM Sans 600 | badges |
| `label` | 16 / 15 / 13 | DM Sans 500–600 | buttons 16; chips, small buttons and nav links 15; tags, map pins and captions 13 |

**Headings by level:** `section` for headings on the page, `title` for sheet titles, `headline` for headings inside a card. Icons inside IconButton are 24px; icons elsewhere 16, 20 or 24.

**One ladder, no in-betweens.** Every size of UI text is 32, 20, 16, 15, 13 or 11. No 12, 14, 17, 18, 22 or 24. Release 19 snapped the strays: Chip, FeatureCard body, RankCard button, CommentBubble and SiteHeader links 14 → 15; TagPill, MapPin labels, the media label and ShapeAvatar captions 12 → 13; VibeTag 17 → 16; the DotGrid number 48 → 32; ReactionBubble 22 → 20.

**Not UI text, so not on the ladder:** canvases drawn at 1080px and scaled down (SocialSlide, EventPoster, Ticket, which keep their own sizes in proportion), the RankCard ghost numeral and the Wrapped card's 120px numeral (graphics), avatar initials (40% of the avatar) and emoji glyphs.

**Alignment:** copy on a photo or bloom is centred (EventCard, FeatureCard, StoryCard, VenueHero, Cover). Copy on a surface is left-aligned (VenueCard, RankCard, EventRow, MoodTile, Sheet, lists).

**No italics anywhere.** Accents are DM Sans 500 in a hue.

**Casing:** sentence case everywhere: buttons, chips, body, messages. Only gathr's own display headlines go lowercase with the yellow full stop. Names keep their own spelling and never get the yellow full stop ("Almost Illegal Thursday", "F Bar"). Dates and places in pills are sentence case: "Sat 04.10", "F Bar, Pune".

## Three text levels (release 25)

Hierarchy comes from a clear step in brightness, not only size and weight. Muted text used to be night-300, so close to `ink` (2.0:1 between them) that headlines and supporting lines read as one white. It's now one step darker.

| Level | Token (night) | Use | Against `ink` |
|---|---|---|---|
| 1 | `ink` (night-50) | names, headlines, prices, the main line | — |
| 2 | `ink-muted` (night-500) | venue and time, meta, supporting lines, labels | 2.6:1 darker |
| 3 | `ink-faint` (night-400) | timestamps, counters, source lines ("Checked 3d ago") | 3.3:1 darker |

- One white per block: the name (and the price) are `ink`; everything under them is `ink-muted`.
- Don't use `night-300` for text any more; it's kept for tints and badge highlights.
- Day theme is unchanged (`ink-muted` and `ink-faint` are night-600 on paper).

## Readable on every surface

4.5:1 for text, 3:1 at 24px+. Every component passes in both themes.

| Text | on `bg` | on `surface` | on `surface-raised` |
|---|---|---|---|
| `ink` | 18.2 | 15.6 | 14.0 |
| `ink-muted` (night-500) | 7.0 | 6.0 | 5.4 |
| `ink-faint` (night-400) | 5.5 | 4.7 | 4.2: use `ink-muted` |
| `brand-text` | 16.4 | 14.1 | 12.7 |

Never as text: violet-500 on dark (2.8), night-600 (3.0), green, red or pink -500 on paper. Dark-only panels on light pages take the `g-night` class.
