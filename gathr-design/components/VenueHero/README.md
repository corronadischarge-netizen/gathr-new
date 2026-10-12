# VenueHero

The venue screen, 375 × 812. Photo on top (or a bloom for an `occasion`), the venue name, then **one card**: Booked so far on the left, up to four facts on the right, and a trust line. The booking button sits at the bottom.

**Provide:** `image`, `name`, `area`, `vibe`, `booked`, `cap`, `cover`, `actionDisabled` (`coverNote` such as "early bird" replaces the Cover label), `doorTime`, `music`, `distance`, `updated`, `action`, `saved`. Use `occasion` + `recipe` only for gathr-hosted nights.

- **Card layout:** left column 124px with `CrowdBlock`; right column a bare `FactList` (cover, open till, music, distance). Labels 13px, values 16px; the level word 20px.
- **Trust line:** "Based on bookings on gathr. Cap of 480 verified by gathr. Packed means 85% or more is booked. Updated 6:40 pm".
- **Button:** violet `brand` "Get passes" (the one booking action on the screen). "Get on the list" for free guest lists.
- **`actionDisabled`:** disables the booking button when someone can't book (a 21+ night for an 18–20 year old); put the reason in `action`, e.g. "21+ only".
- **Cover:** the cover value follows the price rule, Jakarta 700 at 20px; the other facts stay 16/600.
- **The card is solid** night-900, never glass.
- The venue name keeps its own spelling with no yellow full stop; the stop appears only on `occasion` heroes.
- Below the fold, follow with `TonightSoFar` and a `FactList` titled "The room".
