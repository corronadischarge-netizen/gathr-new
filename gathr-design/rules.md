# gathr rules (from the brand book and design system, release 21, 12 Oct 2026)

The short version of the brand book for building the app. When something here and a guide disagree, the guide in `guides/` wins; when a guide and `components/index.d.ts` disagree on props, the `.d.ts` wins.

## The spine
Going out is an art form and most people are doing it wrong. **The promise: you'll know the room before you get there.**
Every screen and component answers one of four questions. If it doesn't help answer one, it doesn't ship.

| You want to know | gathr shows it as | Built with |
|---|---|---|
| How full will it be? | "Packed · 412 of 480", never a percentage | CrowdMeter, CrowdBlock, TonightSoFar |
| Who's going? | real faces, "Riya, Dev + 2 friends booked" | FriendsGoing, RingAvatar |
| Is it on right now? | yellow = energy right now (live, buzzing room) | Badge tone="now" |
| What will it cost? | the price in bold type, "₹499, all in" | VenueCard, VenueHero |

## Colour
- Only values from `tokens.json` / `tokens.css`. Never type a hex code into a component.
- Tokens are tagged APP or EXPRESSION in `tokens.json`. Expression tokens (pink, blue, and the -500 steps of yellow, green and red) never go in app UI.
- **Violet** = gathr's choice: selected states, a gathr pick, and the **one** booking button per screen.
- **Yellow** = energy right now: live badges, the live dot, Buzzing and Packed crowd levels, the logo's full stop. One exception: the host's door scanner "check" state.
- **Green** = booked, Filling up, go.
- **Red** = limits only: sold out, Full, 21+, errors.
- Everything else is black and greys. Black is 50%+ of a feed; photos and 3D objects bring the colour.
- Focus rings are white.

## Buttons and actions
- The main action is the **white pill** (`Button variant="primary"`).
- Violet (`variant="brand"`) is only for the one booking button on a screen.
- Booking copy: **"Get on the list"** (free, guest list) or **"Get passes"** (paid).
- Two text buttons won't fit side by side: use `ActionBar` (up to two round icon buttons with labels + one full-width main button).
- Button text starts with a verb.
- Buttons and chips are flat: no sheen, no gradient, no glow.

## Light and surfaces
- Functional fades (under a photo, behind the tab bar, behind pinned buttons) are allowed anywhere and aren't a bloom.
- Three kinds of light: **shine** on colour fills (palette steps only), **echo** for brand surfaces, **bloom** for named occasions only (first-run onboarding, recap/Wrapped, gathr-hosted nights). No gradient anywhere else.
- One glow per screen at most. Nothing pulses.
- Liquid glass for chrome over photos (top bar, tab bar, sheets). Scrim glass for text pills on photos. Never glass on glass: buttons inside sheets are solid.
- Status badges are flat. The live dot is the one functional dot; no decorative dots.

## Type
- Ladder: 32 / 20 / 16 / 15 / 13 / 11. Every size of UI text is one of these: no 12, 14, 17, 18, 22 or 24. Plus Jakarta Sans for display and titles, DM Sans for UI.
- Labels: buttons 16; chips, small buttons and nav links 15; tags, map pins and captions 13.
- Off the ladder only: 1080px canvases (social, poster, ticket), the RankCard ghost numeral, avatar initials, emoji.
- One display line per screen. Only gathr's own headlines are lowercase with the yellow full stop ("tonight in kp."). Organiser and venue names keep their own spelling, no full stop.
- Sentence case everywhere else. **No italics anywhere.**
- Price is type, never a pill: Jakarta 700, 20px.
- Fact rows: labels 13px, values 16px.
- Badges and caps: weight 600.
- Headings by level: `section` (Jakarta 16/600) on the page; `title` (Jakarta 20/600) for sheets and the one name on a big media card; `headline` (DM Sans 15/20 600) for names of things and every heading inside a card.
- `body-light` (DM Sans 300, 15/20) for one-line tips beside an icon.
- IconButton icons 24px; other icons 16, 20 or 24.

## Booked so far (the crowd)
- Measures bookings on gathr against tonight's cap, **verified by gathr**. About people, never the vibe; the vibe is a separate "Vibe" row in "The room" (FactList).
- Levels (share of cap booked): Early (<25%, grey) · Filling up (25–59%, green) · Buzzing (60–84%, yellow) · **Packed (85–99%, yellow, the high point)** · Full (sold out, red).
- Lines: Early "Few booked yet. Plenty of room" · Filling up "Easy to get in" · Buzzing "Good crowd. Short wait at the door" · Packed "Peak night. Expect a queue" · Full "Sold out. Only list and pass holders get in".
- Show people: "412 of 480 spots booked". **Never a percentage** (host stats are the exception: "83% checked in"). The level word is 20px.
- Under 50 bookings: hide the count, show the level line.
- No cap (walk-in venues): "120 booked tonight", no level, no dots.
- The label is always "Booked so far" (booked is not "there now").
- Trust line: "Based on bookings on gathr. Cap of 480 verified by gathr. Packed means 85% or more is booked. Updated 6:40 pm".
- Crowd rows in lists are bars only. The Booked so far widget and the VenueHero card are solid night-900, never glass.
- "How we count" note, word for word: "How we count: Booked so far is bookings on gathr against tonight's cap, verified by gathr. Walk-ins aren't counted, so the room can feel a little fuller".
- Can't book (e.g. 21+ night for an 18–20 year old): disable the button and say why in it, "21+ only".

## Voice and copy
- Talks like the friend who's already inside: short, dry, specific.
- UI messages never end in a full stop. No exclamation marks.
- Emoji only from people, never from gathr.
- Slang light.
- Empty states say how to start. Confirmations name the consequence.

## Updates (notifications)
- Two groups: "Needs you", then "Earlier".
- Row: a lead (night's 3D object, a person's photo, or gathr's tinted icon), a title saying what happened, one meta line with the time at the end.
- task → one white button ("Fix"); chance → one violet button ("Book"); decide → Decline and Accept side by side; info → no button.
- Buttons only in Needs you; three answers on screen at most. One row per night.
- Declining is quiet, with an Undo toast for 5 seconds. Never show internal handles.

## Icons, stickers, avatars
- Lucide only: outline, 24px grid, 1.75 stroke. Sizes 16, 20 or 24px. Filled version means "on".
- Icon-only buttons need a label and a 44px hit area.
- One 3D object per card; at most one bobbing sticker per screen. Stickers stay out of app lists.
- Never alcohol, smoking or sex as the hero.
- Avatars are a real photo or centred initials, never silhouettes; at most one vibe sticker per avatar.

## Imagery
- Photos are real and candid. Organiser art untouched apart from the gathr touch (grain, fade).
- Photo frames have a thin glass edge, never a thick white stroke.

## Motion
- Every animation explains a change. Reduced motion stops all of it.

## Before anything ships
Run `guides/07-checklist.md`.
