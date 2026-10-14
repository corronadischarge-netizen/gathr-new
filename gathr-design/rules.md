# gathr design rules (release 25)

One page. When anything here and `tokens.json` disagree on a value, tokens.json wins. For props, `components/index.d.ts` wins.

## The spine
Going out is an art form and most people are doing it wrong. **The promise: you'll know the room before you get there.** Every component answers one of these questions; if a piece doesn't help answer one, it doesn't ship.

| You want to know | gathr shows it as | Built with |
|---|---|---|
| Will they let us in? | the door rule for your group in two or three words ("Lets you in · 21+", "Formals only"), its source small under it ("Checked 3d ago") | DoorVerdict, NightTile, GroupPill |
| How full will it be? | booked so far against a cap verified by gathr: "Packed · 412 of 480", never a percentage | CrowdMeter, CrowdBlock, TonightSoFar |
| Who's going? | real faces on the card, "Riya, Dev + 2 friends booked" | FriendsGoing, RingAvatar |
| Is it on right now? | yellow means energy right now: live, or a buzzing room | Badge now |
| What will it cost? | the price in bold type, "₹499, all in" | VenueCard, VenueHero |

## Colour
- **Violet** = gathr's choice: selected states, gathr picks, the one booking button per screen, Accept.
- **Yellow** = energy right now: live, Buzzing, Packed, the logo's full stop. Host-only exceptions: the door scanner's amber "check", and host mode selections and main buttons (`.g-host`, yellow-300 with night-900 text).
- **Green** = booked, entry open, filling up. **Red** = limits only: Full, errors, no entry.
- Everything else black and night greys. Focus rings white. Pink, blue and the -500 steps are expression only.
- **Door verdicts:** yes green, if white (never yellow), unknown grey, no red words. Icon + words, never colour alone.
- Black first: 50%+ of a feed is `bg`. Photos, friends and 3D objects bring the colour.
- No colour value outside tokens.json. Reference images guide layout, never colour.

## Type
- Ladder: **32 / 20 / 16 / 15 / 13 / 11** only (exceptions: 1080 canvases, RankCard ghost numeral, Wrapped 120 numeral, avatar initials, emoji).
- `display` 32 Jakarta 700, one per screen, lowercase + yellow full stop (gathr's own headlines only) · `title` 20 (sheets, one name on a big media card) · `section` 16 Jakarta 600 (page headings) · `headline` 15/20 DM Sans 600 (names of things, every heading inside a card) · `body` 15 · `body-light` 15/20 300 (icon tips) · `body-sm` 13 (meta) · `caps` 11/600 · buttons 16, small buttons 15.
- No italics in the app. Sentence case. Organiser event names stay as the organiser wrote them, no gathr full stop.
- Price is type (Jakarta 700, 20 on cards and rows, 16 on tiles), never a pill.
- **Three text levels (r25):** `ink` (night-50) for names, headlines and prices · `ink-muted` (night-500) for venue, time, meta and supporting lines · `ink-faint` (night-400) for timestamps, counters and source lines. One white per block. Never `night-300` for text.

## Light and surfaces
- Selections, buttons and status badges are **flat**: one fill, no shine, no edge highlight, no glow.
- Shine only on expression fills (vibe tags, pill chains, stat bubbles, pill pattern, social, tickets), built from palette tokens.
- Liquid glass only for chrome over photos and sheets (tab bar, top bar on photos, sheets, crowd chip on photos). Never glass on glass. Cards (VenueHero card, Booked so far widget) are solid night-900.
- Gradients: blooms only on named occasions (first-run, recap/Wrapped). Always allowed: functional fades (under photos, behind the tab bar, behind pinned buttons) and the screen glow (`.g-page-depth`).
- Dots: the logo's full stop is the only decorative dot. Two functional dots: the live dot and the bell's "new" dot.
- One bobbing sticker per screen at most. Stickers on dark grounds, objects only in the app.

## The home (door-first, r24–25)
- `GroupPill` (who + what's next, never the group's make-up) → hero: `section` "Best for your group tonight", `DoorVerdict` pill + source under it, `VenueCard`, the one violet booking button → `NightRail`s of `NightTile`s → "Not feeling these?" `MoodTile`s → week rails → end card.
- **GroupPill copy:** "Friday plan" / "Waiting on Arjun · 8 pm" (or "Your vote · closes 8 pm") · "Bollywood Night · Fri" / "You're in with Riya, Dev + 2" · "You, Riya, Dev + 1" (counts only: "You + 3 guys") · "Who's going?" / "Add your group". Age only when it changes things: "1 under 21".
- **DoorVerdict copy:** 20 characters max, the group not repeated. yes "Lets you in" / "Lets you in · 21+" · if = one condition "Formals only", "Before 10:30", "Stags ₹500" · unknown "Stag rules unknown", "Age limit unknown" · no "Couples only", "21+ only", "No stags", "Mixed groups only". Source: "Set by host" · "Checked 3d ago" · "From 12 guests".
- **NightTile:** name → "{venue} · {time}" + price → the door line only for `if`/`unknown`. Rows show the door line always and keep price + crowd in a fixed 120px right column.
- One hero, then small tiles; never a stack of full-size cards on the home.

## Booked so far (crowd)
- Bookings on gathr against tonight's cap, verified by gathr. About people, never the vibe.
- Levels: Early (<25%, grey) · Filling up (25–59%, green) · Buzzing (60–84%, yellow) · Packed (85–99%, yellow, the high point) · Full (sold out, red).
- Lines: Early "Few booked yet. Plenty of room" · Filling up "Easy to get in" · Buzzing "Good crowd. Short wait at the door" · Packed "Peak night. Expect a queue" · Full "Sold out. Only list and pass holders get in".
- Show people: "412 of 480 spots booked". Never a percentage (host stats may use percentages).
- Widget: eyebrow "Booked so far", level word 20, 60-dot grid, the count; solid night-900. Under 50 bookings hide the count. No cap: "120 booked tonight", no level.
- Trust line: "Based on bookings on gathr. Cap of 480 verified by gathr. Packed means 85% or more is booked. Updated 6:40 pm".
- How we count (word for word): "How we count: Booked so far is bookings on gathr against tonight's cap, verified by gathr. Walk-ins aren't counted, so the room can feel a little fuller".

## Copy
- Short, dry, specific: the friend who's already inside. "Packed by 11" beats "amazing vibes".
- Buttons start with a verb. "Get on the list" (free) vs "Get passes" (paid). No exclamation marks.
- **No full stop at the end of a UI message.** Only gathr's display headlines take the yellow one.
- One slang word per screen at most. Hinglish only in social and pushes. Emoji only from people. Local names: KP, Baner, Kalyani Nagar.
- Copy library highlights: empty "Quiet night. Try another area" · booked "You're in" · friends "Riya + 2 friends going" · sold out "Sold out. 3 similar nights below" · age "This one's 21+. Here's an 18+ night" · error "That didn't go through. Try again".

## Updates (notifications)
- Two groups: "Needs you" (cards with actions) then "Earlier" (flat, muted, one line, opens what it's about).
- Lead: night → 3D object; person → photo or initials; gathr → tinted Lucide icon. Title `headline` 15/20 600, meta ≤ ~32 characters with the time at the end.
- Buttons are the real answers: task → white "Fix"; chance → violet "Book"; someone waiting → Decline ✕ + Accept ✓ (flat violet). Three answers on screen at most. Decline is quiet, with an Undo toast.

## Toast
- `Toast` is the only toast. 32px up, or 12px above the tab bar. 2.4 s, or 5 s with an action. One at a time, one line, no full stop, at most one action.

## Icons and motion
- Lucide outline, 1.75 stroke; filled only for "on". 24 inside icon buttons, 20 in rows, 16 in lines.
- Motion explains a change. Presses 120 ms, chips/tabs 200 ms, sheets 320 ms, screens 360 ms. Only stickers loop (bob). Everything stops under reduced motion.

## Fixed pieces
- StoryCard: the card for a night that's yours: right after booking ("You're in" + faces, then Show pass / Share), upcoming nights in Plans, the picture shared to the group chat.
- ProgressBar: a 2px hairline.
- Wordmark: "gathr." Plus Jakarta Sans Bold outlined, one circle after the r (yellow on dark, violet on light). Use the Wordmark component or the SVGs, never retype it.
- EchoPattern for end slides, share cards, merch, splash. Ticket colour pairs with QR in the ticket's ink (≥5:1).
- Photography: reference only until consented Pune shots exist. Organiser art keeps its own look with the gathr touch (4:5 crop, grain, fade to night-950, 1px light edge).
