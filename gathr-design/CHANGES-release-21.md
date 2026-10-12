# What changed since the last package (release 21, 12 Oct 2026)

The last package was release 20 (11 Oct). Release 21 was synced back from this app, so **some of these may already be in the code**. Check each one before changing anything, and skip what's already done.

Colours didn't change. Type tokens did, so `tokens.css` has been regenerated.

## 1. Type
- **`headline` is now 15/20, weight 600** (was 16/22). Use it for names of things (friends, nights, venues, settings rows, update titles) and **every heading inside a card** ("The room", "Tonight so far").
- **Headings by level:** `section` (Jakarta 16/600) for headings on the page ("Near you", "Listed nights"); `title` (Jakarta 20/600) for sheet titles and the one name on a big media card (VenueCard, FeatureCard); `headline` inside cards.
- **New `body-light`** (DM Sans 300, 15/20): single-line tips beside an icon, like the venue screen's "Before you go" (`.g-tip` in `bundle.css`).
- **`caps` is now weight 600** (was 700). Badges, day tags.
- **`accent` is no longer italic.** No italics anywhere.
- **IconButton icons are 24px.** Icons elsewhere stay 16, 20 or 24.
- The Wrapped card's 120px numeral is allowed off the ladder (it's a graphic).

## 2. Venue screen
- **Cover price** in the VenueHero card is Jakarta 700 at 20px (the price rule). The other facts stay 16/600. `FactList` rows take `strong: true` for this.
- **The VenueHero card and the Booked so far widget are solid night-900, never glass.**
- **`actionDisabled`:** when someone can't book (a 21+ night for an 18–20 year old), disable the booking button and say why in its label: "21+ only".
- **"How we count" note, word for word**, under TonightSoFar: "How we count: Booked so far is bookings on gathr against tonight's cap, verified by gathr. Walk-ins aren't counted, so the room can feel a little fuller".

## 3. New component: ActionBar
One row at the bottom of a detail screen: up to two round solid icon buttons (52px, 24px icons, each with an accessible label) beside one full-width main button. Use it when two text buttons won't fit at 16px, like "Get directions" + "Get on the list".
- Main button violet when it books, white otherwise.
- Icons: `navigation` (Get directions), `calendar-plus` (Add to calendar), `share-2` (Share).
- Props in `components/index.d.ts`; example in `components/ActionBar/preview.html`.

## 4. Rule exceptions, now written down
- **Door scanner:** the host's scanner keeps an amber (yellow) "check" state beside green (in) and red (no entry). The one non-"energy" use of yellow.
- **Wrapped card** stays solid violet inside the app.
- **Functional fades are allowed anywhere** and aren't a bloom: the fade under a photo, behind the tab bar, behind pinned bottom buttons. Any other gradient is a bloom (occasions only).
- **Percentages:** "never a percentage" covers crowd and Booked so far only. Host stats may use them ("83% checked in").

## Suggested order
1. Type: headline 15/20, caps 600, body-light, heading levels
2. Venue screen: cover price, solid card, actionDisabled, How we count copy
3. ActionBar where two text buttons are squeezed side by side
4. Run `guides/07-checklist.md` (two new lines: heading levels and functional fades)
