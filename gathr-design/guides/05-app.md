# App

*(Image: Home and onboarding screens. See the live design system.)*

**Why:** every screen should answer the four promise questions (how busy, who's going, is it on, what it costs) before anything else.

Designed at 390 × 844, night theme. See TonightScreen and OnboardingScreen for full compositions.

## The home recipe

1. `TopBar`: your photo left, glass icon buttons right.
2. Eyebrow (13, muted) over one `display` line.
3. `MoodTile` row: pick a vibe. The selected tile turns violet.
4. "Near you" + subtle "See all".
5. `EventCard` or `StoryCard` carousel, the next card peeking in (`CardDeck`).
6. Floating glass `TabBar`, 120px bottom padding.

Detail screens swap the tab bar for one full-width button: white for the main action, violet when that action is booking.

**The venue screen:** `VenueHero` (photo, name, one card with Booked so far + four facts + the trust line, "Get passes"), then on scroll `TonightSoFar`, `FactList` "The room" and the "How we count" note: "How we count: Booked so far is bookings on gathr against tonight's cap, verified by gathr. Walk-ins aren't counted, so the room can feel a little fuller". When someone can't book (a 21+ night for an 18–20 year old), set `actionDisabled` and say why in the label: "21+ only".

**Main action plus icon buttons (`ActionBar`):** at 16px two text buttons don't fit side by side ("Get directions" + "Get on the list"). Use one row: up to two round solid icon buttons, each with an accessible label, beside one full-width main button.

## Which component

| Need | Use |
|---|---|
| Pick a vibe or category | `MoodTile` |
| A night, photo-first | `EventCard` (feed), `StoryCard` (spotlight, plans) |
| Browse a few big cards | `CardDeck` |
| Who's going | `FriendsGoing`, `RingAvatar` |
| A fact on a photo | `TagPill` |
| Friends' moments, recaps | `PhotoStack`, `ReactionBubble`, `CommentBubble` |
| How full it'll be | `CrowdMeter` (booked + verified cap); `widget` on venue screens |
| Venue facts | `FactList` (bare inside `VenueHero`; titled "The room" below) |
| Social proof below the fold | `TonightSoFar` (booked, saved, pace, friends who booked) |
| Notifications | `UpdateGroup` + `Update` (task, chance, decide, info) + `Toast` for undo |
| A place on the map | `MapPin` with its object sticker |
| Status | `Badge` (now, go, limit, brand, neutral) |
| Main action | `Button primary` (white pill); the booking action is `Button brand` (violet), once per screen. In host mode `Button brand` turns yellow-300 |

## Flow

- Onboarding: Welcome → Vibe → Areas → Age → Phone → This week, one question per screen. Feed first: age only for 21+ nights, phone inside booking.
- Every screen has a way forward and back. Pop-ups never cover buttons. Empty states say how to start.
- Hit areas 44px+. Icon-only buttons have labels.
- **Icons:** Lucide only (lucide.dev), outline at 1.75 stroke, sized 16, 20 or 24px. Filled versions (built from the same Lucide shapes) mean "on": active tab, saved, liked, booked, selected. If the bundle doesn't have one, add it by its Lucide name; never draw or mix sets. 3D stickers are for expression, not UI.

## Host mode

Hosts run the door and their nights from the same app, so their screens look different at a glance.

- Wrap every host screen in `.g-host`. Selections (the selected tab and its sliding pill, chips, toggles, tick boxes, picked rows with `.is-picked`) and the host's main buttons (`Button brand`: "List a night", "Submit for review") become yellow-300 with night-900 text, flat like every selection.
- Status stays as it is: green in, red no entry, the scanner's amber check.
- Never mix: no violet on a host screen, no host yellow on a guest screen.

## Updates

Notifications are for a quick glance and a strong action.

- **Two groups:** "Needs you", then "Earlier". No filters, no trackers.
- **The buttons are the real answers:** a task gets one white button ("Fix"), a chance one violet button ("Book"), someone waiting on you gets Decline and Accept side by side, news gets none. Three answers on screen at most.
- **What leads the row:** a night's 3D object, a person's photo, or gathr's icon tinted by meaning.
- **One row per night:** the latest status replaces the earlier ones.
- **Declining is quiet**, with an Undo toast for 5 seconds.
- **No photo, initials:** pass `name` and, with no `image`, the lead shows the person's initials. Never a silhouette.
- **Earlier rows open what they're about:** give an `info` row `onOpen` and the whole row becomes a button (Enter and Space work); the chevron says it goes somewhere.

## Toast

`Toast` is the app's only toast: every short message ("Removed from Plans", "Logged out") and every Undo.

- **Where:** near the bottom, 32px up; 12px above the tab bar when there is one (`docked`, `aboveTabBar`). Never at the top, never over a button.
- **How long:** 2.4 seconds, or 5 seconds when it has an action (`onClose` fires when the time is up).
- **What:** one short line, no full stop, at most one action ("Undo"). One toast at a time; a new one replaces the old.
- **Breathable:** row padding 16, lead → text 16, rows 8 apart, groups 32 apart, page title → first group 24.
