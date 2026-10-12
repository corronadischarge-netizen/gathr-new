# What changed in the design system since the app was built

The React app was built from the design system around late September / early October. These are the changes from v13 to release 18 (10 Oct 2026) that the app may not have yet. Check each item against the code before changing anything: some may already be in.

## 1. Crowd is now "Booked so far" (biggest change)
- Replace any crowd meter or crowd percentage with **Booked so far**: bookings on gathr against a cap verified by gathr.
- New levels and colours: Early (grey) · Filling up (green) · Buzzing (yellow) · **Packed (yellow, not red)** · Full (red). Full rules in `rules.md` and `components/CrowdMeter/README.md`.
- `CrowdMeter` now takes `booked` + `cap` and works out the level itself. `variant="widget"` gives the 60-dot grid card; the default row is five bars.
- Token change: `crowd-packed` now points to yellow-300.
- Never show a percentage. Under 50 bookings, hide the count. No cap: "120 booked tonight".
- Sample data: give each sample venue a `booked` and `cap` so the levels can be computed (keep the "sample" label).

## 2. Venue screen (VenueHero rebuilt, option A)
- Photo, venue name, then **one card**: Booked so far on the left (`CrowdBlock`, 124px column), four facts on the right (cover, open till, music, distance) as a bare `FactList`, the trust line underneath, and **"Get passes"** in violet at the bottom.
- Below the fold: `TonightSoFar` (booked, saved, +N in the last hour, friends who booked), then a `FactList` titled **"The room"** (Vibe, Music, Dress code, Entry), then a one-line "How we count" note.
- See `components/VenueHero/README.md` and `components/VenueHero/preview.html`.

## 3. New components
- **CrowdBlock**: the Booked so far block used inside VenueHero.
- **FactList**: icon circle, 13px label, 16px value on the right edge.
- **TonightSoFar**: social proof under the venue hero.
- **FriendsGoing** has `verb: 'booked'` → "Riya, Dev + 2 friends booked". Use it wherever the friends shown have actually booked.

## 4. VenueCard body (v17)
Three aligned rows: name + price (20px, right edge) · where · friends + door time (13px).

## 5. Colour discipline (release 15–16)
- White pill = main action. Violet = only the one booking button per screen.
- Yellow only for energy right now (live, Buzzing, Packed) and the logo full stop. Focus rings are white, not yellow or violet.
- Expression tokens (pink, blue, -500 steps) out of app UI.
- The live dot is back in live badges (the one functional dot).

## 6. Layout pass (v14)
- Liquid glass chrome (top bar, tab bar), tab spring motion, Sheet rebuilt, VenueHero at 375 × 812.
- **No italics anywhere.**
- Status badges flat. Price as type, never a pill.

## 7. Icons (v13)
Lucide outline icons, 1.75 stroke, with 30 filled versions for "on" states. The names that ship are listed in `components/index.d.ts` (`IconName`).

## 8. tokens.css regenerated (11 Oct)
The live system's `tokens.css` had not been rebuilt since before release 15: it still had Packed as pink, Early as blue, a yellow/violet focus ring, and the old `--people` (pink) and `--after` (blue) tokens. The one in this package is regenerated from `tokens.json`, so it now matches release 18.
- `--people`, `--people-text`, `--after` and `--after-text` no longer exist (pink and blue are expression only since release 16). Anything in the app using them should move to the release-18 meaning: friends text in `--ink`, info and directions in `--ink-muted` with an icon.
- `bundle.css` still references those four in the old `.g-badge-people`, `.g-badge-after` and `.g-friends-text` rules. Ignore the badge rules (those tones were removed from `Badge`); FriendsGoing text should use `--ink`.

## Suggested order
1. Tokens and fonts (so every colour and size comes from one place)
2. CrowdMeter / Booked so far
3. Venue screen
4. Event cards and VenueCard
5. Colour and copy sweep across all screens (run `guides/07-checklist.md`)
