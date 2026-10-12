# Checklist

Run before anything ships. First question: does this help someone know the room before they get there (how busy, who's going, is it on, what it costs)?

- [ ] Black is 50%+ of a feed. Photos and objects are the colour.
- [ ] The UI uses only violet, yellow, green and red, each for its one job. The main action is the white pill; violet only for the one booking button per screen.
- [ ] One display line per screen, lowercase with the yellow full stop. Everything else sentence case.
- [ ] Titles sit on the ladder (32 / 20 / 16); radii come from tokens; copy on photos centred, copy on surfaces left.
- [ ] At most one bobbing sticker on the screen.
- [ ] Every text passes 4.5:1 (3:1 at 24px+) on its real surface.
- [ ] Cards: a picture, a title, one meta line, one button.
- [ ] Photos are real and candid; organiser art untouched apart from the gathr touch.
- [ ] One 3D object per card; stickers stay out of app lists.
- [ ] No gradient unless an occasion is named (functional fades and the screen glow excepted); if there is one, it's irregular, still and has no dots.
- [ ] Glass only on photos and chrome; never glass on glass.
- [ ] Buttons start with a verb; no exclamation marks; no full stop at the end of a message; emoji only from people.
- [ ] Motion explains a change; nothing pulses; reduced motion stops it.
- [ ] Avatars are photos or centred initials, never silhouettes; a vibe sticker at most one per avatar.
- [ ] Photo frames have a thin glass edge, never a thick white stroke.
- [ ] Selections, buttons and status badges are flat (status badges: solid fill, or a transparent wash with a hue edge). The shine is only for expression fills: vibe tags, pill chains, stat bubbles, the pill pattern, social fields.
- [ ] Prices are type (Jakarta 700), never a pill or a fill.
- [ ] Crowd rows are bars only; the Booked so far widget and the VenueHero card are solid night-900, not glass.
- [ ] Social slides carry no 3D objects and no italics.
- [ ] Icons are Lucide; filled only for "on".
- [ ] No decorative dots besides the logo's full stop. Two functional dots: the live dot in badges and the bell's "something new" dot. Marquee separators are a dash.
- [ ] Yellow only for energy right now (live, buzzing, packed) and the full stop. Two host-only exceptions: the door scanner's amber "check" state, and host mode, where every selection (the selected tab and its sliding pill, chips, toggles, tick boxes, picked rows) and the main buttons ("List a night", "Submit for review") are yellow-300 with night-900 text (`.g-host`). Focus rings are white.
- [ ] No colour value outside tokens.json; expression tokens never in app UI.
- [ ] Booking buttons say "Get on the list" (free, guest list) or "Get passes" (paid).
- [ ] UI messages end without a full stop; only gathr's display headlines take the yellow one.
- [ ] Crowd levels come from bookings against the verified cap; Packed is yellow, only Full is red; counts as people, never percentages (host stats may use percentages).
- [ ] Vibe and crowd are separate: "Early" never stands in for a quiet vibe.
- [ ] Every UI text size is 32, 20, 16, 15, 13 or 11 (canvases, ghost numerals, initials and emoji excepted).
- [ ] Updates: buttons only in Needs you, three answers at most; anyone waiting on a yes or no gets Decline as well as Accept. A person with no photo shows initials; Earlier rows with a chevron open what they're about.
- [ ] Every short message is a `Toast`: 32px up (12px above the tab bar), 2.4 s, or 5 s with an action.
- [ ] Headings: `section` on the page, `title` for sheets, `headline` (15/20 600) inside cards.
- [ ] No gradients beyond blooms on occasions, the functional fades (photo, tab bar, pinned buttons) and the screen glow at the top of each screen.
