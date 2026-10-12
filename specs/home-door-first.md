# Spec: Home, built around the door (home v3)

Status: ready to build · 13 Oct 2026 · owner: Shubh
Replaces the layout in `specs/home-time-first.md`. Keeps its time logic, demo clock, logging and test switches unless this file says otherwise.
Companion files: `specs/ds-new-components.md` (the new design-system components) and `PROMPT-home-door-first.md` (how to run this with Claude Code).
Design reference: the gathr Seeker canvas, boards 01 Home, 02 All nights, 03 Event, 04 Going as, 05 Night card anatomy, 06 DoorVerdict. Claude Code cannot open the canvas; Shubh pastes screenshots of the boards when asked.

---

## 0. Ground rules for building this

1. **The design system wins.** Use `gathr-design/` (rules.md, tokens.json, component docs, guides) for every colour, size, radius, font, icon and component. If this spec and the design system disagree on a visual detail, follow the design system and list the conflict in your report.
2. **Reuse before building.** Every part below names a design-system component. Use the app's existing implementation of it. If the app doesn't have it yet, build it from the design-system docs, in the same place the app keeps its other design-system components.
3. **The four new components** (DoorVerdict, NightTile, NightRail, GroupPill) are defined in `specs/ds-new-components.md`. Build each once and reuse it. Never inline a one-off version.
4. **No new colours, sizes or fonts.** Only token values. Type sizes only from the ladder: 32, 20, 16, 15, 13, 11.
5. **Copy is exact.** Use the strings in section 8 word for word. No full stop at the end of any UI line. Sentence case. Buttons start with a verb.
6. **Don't touch other screens** except the ones listed in section 1.
7. **Sample data stays labelled** "Sample data" (one label per screen), as today.

---

## 1. What changes, at a glance

| Area | Change |
|---|---|
| Home (Tonight tab) | New layout: group pill, one hero night with a booking button, day rails of small tiles, sound tiles, end card. Time chips and stacked full-size cards leave the home |
| All nights (new screen) | The full list. Opened from any rail's "See all" and the end card. Holds the time chips and filters |
| Going as (sheet) | New sheet for who's going. Opened from the group pill and the event page |
| Event page | Booking button names the group ("Get 4 passes"); "Who gets in" card uses DoorVerdict for the group; disabled with a reason when the group can't get in |
| Booking sheet | Pass count prefilled from the group; shows the verdict's condition if there is one |
| Data | New: group (Going as), structured door rules, verdict function, hero ranking |
| Logging | New events (section 10) |
| Test switches | New layout is the default. `?home=timefirst` keeps the time-first home, `?home=classic` keeps the old one, for the comparison test |

---

## 2. The strategy, so decisions in the gaps go the right way

- **The home has one job:** answer "can my group get in, and can we afford it, tonight", then get them booked in as few taps as possible. It also lets people browse many nights without a long scroll.
- **Why the door:** in the five Pune journeys, getting refused at the door (age, stag group, dress) is the worst moment of the night for 3 of 5 personas, and they blame the app that sent them. Rallying the group is the other low.
- **North Star:** nights booked through gathr per week.
- **Two sizes only:** one big hero (the night we're most confident about), then small tiles. Never stack full-size cards in a list on the home.
- **One violet booking button per screen:** the hero's. Everything else taps through.
- **When in doubt:** clearer door information beats more content; fewer taps to book beats more choice on screen.

---

## 3. Home layout, top to bottom

Screen: 390 wide reference, dark theme, `bg` background with the screen glow (`.g-page-depth`), side gutter 16, floating TabBar at the bottom with the functional fade behind it. Content scrolls; the tab bar never covers the last item (bottom padding 140).

### 3.1 Top bar
- Component: **TopBar** with the user's avatar (photo or initials), title "Pune · {Fri 16 Oct}", actions Search and Notifications (bell, with its "new" dot when there are unread updates).
- Spacing: 48 top safe area, then the bar.

### 3.2 Group pill
- Component: **GroupPill** (new). 16 below the top bar. Full width.
- States and copy: see `ds-new-components.md` › GroupPill. In short:
  - Active plan, vote open: faces of plan members · "Friday plan · 4 guys, all 21+" · "3 of 4 voted · closes 8 pm" → opens the plan.
  - Plan booked: "Friday · Bollywood Night" · "You're in · Show pass" → opens the pass.
  - Group set, no plan: "Going as 4 guys, all 21+" · "Change" → opens Going as.
  - Group not set: "Who's going?" · "Add your group to check the door" → opens Going as.

### 3.3 Hero: "Best for your group tonight"
- 24 below the pill. Section title (`section` style, Jakarta 16): "Best for your group tonight". Right of it, the "Sample data" label (11, `ink-faint`) while data is sample.
- 10 below: **DoorVerdict** `look="pill"` with the source line on the right (11, `ink-faint`).
- 10 below: **VenueCard**, tapping it opens the event page. Props: name, area (venue, area), distance (from the user's home area), vibes (the night's sound), crowd (level from Booked so far), cover (price), doorTime, image (organiser image), friendsPeople + friendsTotal (friends who booked; omit when none).
- 10 below: **Button** `variant="brand" size="lg" block icon="ticket"`. Label by entry type (section 8). Tap → booking sheet with passes prefilled.
- Which night: section 5.2. If nothing qualifies, see 3.9 (empty states).
- When the window rolls to tomorrow (2 am to 6 am rule from `home-time-first`), the title says "Best for your group tomorrow".

### 3.4 Rail: Tonight
- 40 below the hero. Component: **NightRail** (new) with title "Tonight · {n} more" (n = tonight's rail items, excluding the hero) and a "See all" Button (`subtle sm`) → All nights scrolled to Tonight.
- Tiles: **NightTile** (new), 156 wide, gap 12, the next tile peeking from the right edge, scroll-snap to tile starts. Tap a tile → event page.
- Contents and order: section 5.3. Hidden if empty.

### 3.5 Rail: Tomorrow
- 36 below. Title "Tomorrow · {Sat}". Button "See all {n}" (n = all nights that day, every verdict).

### 3.6 Sound tiles: "Not feeling these?"
- 44 below. Title "Not feeling these?" and line "Pick a sound, see the week" (13, `ink-muted`).
- Row of **MoodTile** (design system): 140 wide, min height 168, 64 top padding for the sticker to break out, sticker size 64, gap 12, horizontal scroll, next tile peeking. Kicker "I'm feeling", title the sound, action "{n} this week".
- Only sounds with at least one night this week, most nights first, at most 6.
- Sound → sticker: Bollywood → disco-ball · Live gigs → mic · Commercial → speaker · Techno → headphones · House → vinyl · Hip-hop → boombox · Rooftop → sunglasses · anything else → spotlight. (Object stickers only; never lighter, cash or bottles.)
- No tile is selected on the home, so no tile bobs. Tap → All nights filtered to that sound for this week.

### 3.7 Rails: rest of the week
- 40 below. One NightRail per remaining day in the next 7 days, titled by weekday ("Sunday"), each with "See all {n}". After day 7, one rail "Next week". Hide empty rails. At most 5 rails on the home after Tomorrow; the rest live in All nights.

### 3.8 End card
- 44 below the last rail. Card: `night-900`, radius 24, padding 28/20/24, centred.
- **Sticker** disco-ball, size 96, tilt −8, `bob` (the one floating sticker on the home).
- Title (Jakarta 700, 20) "{n} nights this week" + the yellow full stop (display headline, allowed). Line (15, `ink-muted`) "{m} let your group in" (or "{n} nights on" when no group is set).
- Button `primary` with arrow-right: "See them all" → All nights.

### 3.9 Empty and edge states
| Case | What shows |
|---|---|
| No night tonight lets the group in, but some exist | Hero replaced by a card: title "Nothing tonight lets your group in", line "{n} tonight have rules that don't fit", buttons "See tomorrow" (primary) and "Change group" (subtle) |
| No nights tonight at all | Hero hidden; Tomorrow rail moves up and its title becomes "Tomorrow · {Sat}"; hero picks from tomorrow with "Best for your group tomorrow" |
| Whole week empty | Copy library: "Quiet week. Try another area" + "Change area" |
| Group not set | Verdicts show the rule plainly without a tick (see DoorVerdict › no group). Hero still picks, ranking ignores group fit except age |
| Loading | GroupPill skeleton, hero skeleton (card shape), 2 rails of 3 tile skeletons. No spinners |
| Offline | Last loaded nights with a Toast "You're offline. Showing what we had" |
| Image missing | NightTile and VenueCard show the neutral placeholder (never a gradient) |
| Long names | One line, ellipsis, on tiles and rows; two lines max on the hero card |

---

## 4. All nights screen (the full list)

Opened from "See all" (scrolled to that day), a sound tile (filtered), the end card, or the compact-list icon.
- Header row: back IconButton (→ home), title "All nights · {n}", line "Going as {group label}" (13, `ink-muted`), filters IconButton (sliders).
- Time chips (**Chip**): Tonight · Tomorrow · Weekend · Later, with counts. Tapping jumps to that day group. Selected chip = flat violet.
- Quick filter chips: "Under ₹500", "Friends going", then the week's sounds. Selected = flat violet. "Clear" appears when any filter is on.
- Day groups with sticky headings: "Tonight · {n}", "Tomorrow · {Sat 17}", weekday names. Right side of heading: "{n} nights".
- Rows (composition, see ds-new-components › NightTile `layout="row"`): 64×80 thumbnail radius 10 · DoorVerdict `look="line"` · name (15/600, one line) · "{venue} · {distance} · {time}" (13, muted) · right column: price (Jakarta 700, 20) and **CrowdMeter** `compact`. Divider `line` between rows. Tap → event page.
- Order in a day: same as rails (5.3). At the end of each day, nights that are not for the group collapse into one row: "Not for your group · {n}" with the main reason of the first ("Couples only tonight"); tap expands them.

---

## 5. Logic

### 5.1 The group ("Going as")
```
group = {
  type: 'guys' | 'girls' | 'mixed' | 'couple' | null,   // null = not set
  size: 1..10,                                          // couple = 2
  women: number, men: number,                           // mixed only; women + men = size
  under21: boolean,                                     // anyone in the group under 21
  under25: boolean,                                     // optional, only asked when a 25+ night is opened
  source: 'manual' | 'plan'                             // plan = filled from an active group plan
}
```
- Stored on the device (localStorage, as the app does today) and on the user's profile once accounts are live.
- From a plan: size = members who joined; type and the split come from the planner's choice in the plan (asked once when the plan is started). The user can still override in Going as.
- Derived numbers: `stags` = guys: size · girls: 0 · couple: 0 · mixed: max(0, men − women). `couples` = couple: 1 · mixed: min(women, men).
- Group label (used in copy): guys → "{n} guys" ("you" if n = 1) · girls → "{n} girls" ("you" if 1) · couple → "a couple" · mixed → "{couples} couples + {extra} guys/girls" or "{n} friends" when the split isn't set · null → "you".
- Age phrase: under21 false → "all 21+" · true → "someone under 21".

### 5.2 Door rules per night
```
door = {
  minAge: 18 | 21 | 25 | null,
  stag: 'allowed' | 'fee' | 'couples_only' | 'not_allowed' | null,
  stagFee: number | null,                // when stag = 'fee'
  mixedOnly: boolean | null,             // all-male groups refused
  dress: string | null,                  // e.g. "formals"; null = not listed
  dressStrict: boolean,                  // true = they turn people away for it
  arriveBy: 'HH:MM' | null,              // entry closes or list ends
  source: 'host' | 'gathr' | 'guests' | null,
  checkedAt: date | null,                // for source = gathr
  guestAnswers: number                   // for source = guests
}
```
- Host-listed nights: from the night form (age and stag policy are already required; add mixedOnly, dressStrict, arriveBy as optional fields in the host form).
- Listed nights (District, Sort My Scene): mostly null today. gathr fills them by calling venues (source gathr) or from guests' morning-after answers (source guests).
- A gathr check older than 30 days counts as null for the verdict. Guest answers count from 5 answers.

### 5.3 The verdict function (one function, used everywhere)
`getDoorVerdict(door, group, profileAge) → { state, reasons[], source }`, where state is `yes | if | unknown | no`.

Check in this order and stop at the first that applies:
1. **no**, if any:
   - minAge known and (group.under21 and minAge ≥ 21, or group.under25 and minAge = 25) → reason "{minAge}+ only"
   - stag = not_allowed and stags > 0 → "No stag entry"
   - stag = couples_only and stags > 0 → "Couples only tonight"
   - mixedOnly and type = guys → "Mixed groups only"
2. **unknown**, if a rule that matters for this group is missing:
   - stags > 0 and stag = null → "Stag rules not listed"
   - minAge = null and group.under21 → "Age limit not listed"
3. **if**, if the group fits but something is on them (at most two reasons, most important first):
   - dressStrict and dress → "{dress} only" (e.g. "formals only")
   - arriveBy → "before {time}" (e.g. "before 10:30")
   - stag = fee and stags > 0 → "stags ₹{fee}"
4. **yes** otherwise. One bring-item reason: minAge ≥ 21 → "21+ with ID", else "ID needed" (government ID is mandatory in Pune).

Group not set (type null): never return yes/no on group rules. Return the rule plainly with state `unknown` styling but rule text: "Stags OK", "Couples only", "Mixed groups only", "Stag rules not listed". Age rules still apply from the profile age if known.

Write unit tests for every branch (guys / girls / couple / mixed with stags / mixed without stags / under 21 / group not set / stale gathr check / guest answers under 5).

### 5.4 Verdict copy
| State | Pill or line text | Icon | Colour (design system) |
|---|---|---|---|
| yes | "Lets {group label} in · {bring-item}" (tiles and rows: "Lets you in" + " · 18+" when minAge = 18) | check | go (green) |
| if | "Lets {group label} in · {reason1}, {reason2}" (tiles and rows: "{Reason1}", e.g. "Formals only") | shirt (dress) · clock (arrive by) · indian-rupee (stag fee) | light (white pill) / ink line |
| unknown | "{Missing rule}" e.g. "Stag rules not listed" + "Ask the venue" button where there's room | info | dark pill / ink-muted line |
| no | "{Reason}" e.g. "Couples only tonight" | x | limit (red) text |

Source line (shown next to the pill on hero, event page; hidden on tiles and rows):
- host → "Set by the host" · gathr → "Checked by gathr · {3 days ago}" ("Checked by gathr" when space is tight) · guests → "From {12} guests" · null → nothing.

### 5.5 Hero ranking
Candidates: tonight's nights (or tomorrow's per the window rule) that are not over, not sold out, with verdict `yes` or `if`. Promoted nights are never the hero (they keep their one labelled slot inside a rail, per `home-time-first`).

Score (higher wins):
- +3 per friend who booked (count up to 3)
- +2 if verdict is `yes` (0 if `if`)
- +1 if crowd level is Buzzing or Packed, +0.5 if Filling up (Full is excluded as sold out)
- +1 if the night's sound matches the user's picked sounds
- −1 if distance from the user's area is over 40 min
Ties: soonest start, then lower price. Log the chosen night id and score (section 10).

### 5.6 Rail contents and order
- Tonight rail: tonight's nights minus the hero. Other rails: that day's nights.
- Include verdicts `yes`, `if`, `unknown`. Exclude `no` (they appear only in All nights, collapsed).
- Order: `yes` first, then `if`, then `unknown`; inside each group, friends booked first, then soonest start.
- At most 10 tiles; if the day has more, the 11th position is a "See all {n}" end tile (same size as a tile, `night-900`, centred label and arrow) → All nights at that day.
- One promoted night at most per window, in its natural position, labelled "Promoted" (Badge glass, top left of the image).

### 5.7 Crowd (Booked so far)
- Level from bookings on gathr against the cap verified by gathr: Early under 25% · Filling up 25–59% · Buzzing 60–84% · Packed 85–99% · Full sold out. Never show a percentage.
- Tiles, rows and the hero card show the level only (CrowdMeter compact; glass on photos). The count ("412 of 480 spots booked"), the 60-dot widget and the trust line live on the event page (VenueHero / CrowdBlock).
- Under 50 bookings: no count, the level line instead (event page). No cap: no level on tiles; event page shows "{n} booked tonight".

### 5.8 Booking from home
- Hero button → booking sheet with passes = group size (capped at the host's per-booking limit; if capped, a line "Max {n} passes per booking").
- If verdict is `if`, the sheet shows the condition line above the pay button: "{Formals only}. Make sure everyone's sorted".
- Not signed in: the sheet asks for the phone and code as today.
- Free RSVP nights: "Get on the list · {n}" and no payment step.
- Pay-at-door nights: "Get on the list" and a line "Cover ₹{x} at the door".

---

## 6. Going as sheet

Component: **Sheet** (strong glass) over the dimmed home. Title "Who's going?", subtitle "We'll check the door rules for you".
1. Caps label "Your group" (11/600 caps, `ink-faint`). **Chip** row: Guys · Girls · Couple · Mixed group. One selected (flat violet).
2. "How many of you?" row on `night-800`, radius 16: label (15/600) + "Including you" (13, muted); **IconButton** minus / plus (solid, 44) around the number (Jakarta 700, 20). Range 1 to 10. Hidden for Couple.
3. Mixed only: "Girls" and "Guys" steppers the same way, totalling the size.
4. Caps label "Anyone under 21?" Chips: "No, all 21+" · "Someone is". Line under: "One person under 21 changes what lets you in".
5. Note row (outline card): calendar icon + "Started a plan? It fills this in for you".
6. Button `primary lg block`: "Show nights for {group label}" → saves, closes, re-ranks the home with a short cross-fade.
7. Button `ghost block`: "Just me tonight" → sets size 1, keeps the type chip, saves.
- Save writes `group.source = 'manual'`. Log `going_as_save`.

---

## 7. Event page changes

- **VenueHero**: booked + cap (CrowdBlock with the dot grid and trust line, as the design system has it), cover, door time, distance, updated time. `action` = the same label as the hero button for this group ("Get 4 passes"). When the verdict is `no`: `actionDisabled` with the reason as the label ("Couples only tonight") and the lock icon.
- **"Who gets in"** section (section title), card `night-900` radius 16 padding 16, the whole card opens Going as:
  - DoorVerdict pill + source line
  - rule rows (15, icon 20 `ink-muted`): group rule ("Stag groups OK", "Couples only", "Mixed groups only", "Stag rules not listed"), age ("21+, bring a government ID"), dress ("Dress code: formals" or "Dress code: not listed"), arrive by when set
  - last line (13, muted) "Going as {group label} · {age phrase}" + chevron
  - unknown state adds Button `subtle sm` "Ask the venue" (opens WhatsApp or call; logs `verdict_ask_venue`)
- **TonightSoFar** (booked, saved, last hour, friends), then the "How we count" note word for word.
- When the verdict is `no`, under the hero add a row "Not for your group? Try {night}" pointing to the best `yes` night that day (or tomorrow).

---

## 8. Copy (exact strings)

| Where | String |
|---|---|
| Top bar title | Pune · {Fri 16 Oct} |
| GroupPill, plan vote | Friday plan · {4 guys}, {all 21+} / {3} of {4} voted · closes {8 pm} |
| GroupPill, plan booked | {Friday} · {Bollywood Night} / You're in · Show pass |
| GroupPill, group set | Going as {4 guys}, {all 21+} / Change |
| GroupPill, not set | Who's going? / Add your group to check the door |
| Hero title | Best for your group tonight (tomorrow: Best for your group tomorrow) |
| Hero button, paid | Get {4} passes · ₹{2,400} |
| Hero button, free | Get on the list · {4} |
| Hero button, pay at door | Get on the list |
| Rail titles | Tonight · {4} more / Tomorrow · {Sat} / {Sunday} / Next week |
| Rail button | See all / See all {6} |
| Sound section | Not feeling these? / Pick a sound, see the week |
| MoodTile | I'm feeling / {Bollywood} / {5} this week |
| End card | {30} nights this week. / {22} let your group in / See them all |
| All nights title | All nights · {30} |
| Not-for-you row | Not for your group · {n} / {Couples only tonight} |
| Unknown | Stag rules not listed / Age limit not listed / Ask the venue |
| Price missing | Price not listed |
| Free | Free |
| Nothing fits tonight | Nothing tonight lets your group in / {5} tonight have rules that don't fit / See tomorrow / Change group |
| Empty week | Quiet week. Try another area / Change area |
| Offline toast | You're offline. Showing what we had |
| Booking condition | {Formals only}. Make sure everyone's sorted |
| Booking cap | Max {6} passes per booking |
| Going as | see section 6 |

---

## 9. Design definition

- **Spacing:** gutter 16 · top bar → pill 16 · pill → hero title 24 · inside hero 10 · hero → first rail 40 · between rails 36 · rail title → tiles 12 · tile gap 12 · rail → sound tiles 44 · sound tiles top padding 64 (sticker room) · → next rail 40 · → end card 44 · bottom 140.
- **Type:** section titles `section` (Jakarta 16) · names `headline` (15/20 DM Sans 600) · meta `body-sm` 13 · caps labels 11/600 caps · prices Jakarta 700 20 (rows, hero card) and 16 on tiles (see NightTile) · end card title Jakarta 700 20.
- **Colour:** violet only for selected chips and the one booking button · green for yes verdicts and booked · yellow only for crowd Buzzing/Packed and the logo/headline full stop · red only for `no` verdicts and Full · everything else night greys. No gradients except the functional fades and the screen glow.
- **Light:** tiles and cards solid; glass only for the crowd chip on photos, the tab bar and the sheet.
- **Radius:** tile image 16 · cards 24 (end card) and 16 (Who gets in, rows thumbnails 10) · pills full.
- **Icons:** Lucide outline 1.75, 16 in lines, 20 in rows, 24 in icon buttons.
- **Motion:** rails scroll-snap; tile press scales to 0.98 in 120 ms; Going as save cross-fades the home 200 ms; booking draws a tick; the end card sticker is the one looping motion. Everything stops with reduced motion.
- **Touch targets:** 44 minimum (tiles are larger; the GroupPill is 56 tall).

---

## 10. Logging (add to `gathr.log`)

`home_view` {layout: 'door-first'} · `hero_view` {nightId, score, verdict} · `hero_cta_tap` {nightId, passes} · `rail_view` {railId} · `rail_scroll` {railId, maxIndex} · `rail_see_all` {railId} · `tile_tap` {railId, index, nightId, verdict} · `mood_tap` {sound} · `end_card_tap` · `going_as_open` {from} · `going_as_save` {type, size, under21} · `verdict_ask_venue` {nightId} · `not_for_you_expand` {day}. Keep the existing time-first events for `?home=timefirst`.

---

## 11. Accessibility

- Tiles and rows are single links; their accessible name reads verdict, name, venue, time, price, crowd: "Lets you in. Twin Strings: Karwaan Tour, Epitome, 8 pm, ₹1,299, Buzzing".
- Rails are lists with a label ("Tonight, 4 nights"); horizontal scrolling works with keyboard focus and doesn't trap it.
- Verdicts never rely on colour alone (icon + words).
- Contrast 4.5:1 for text; focus rings white per the design system.
- Reduced motion: no sticker bob, no cross-fade, instant scroll.

---

## 12. Acceptance checklist (compare with the canvas screenshots)

- [ ] First screen at 390 × 844 shows: top bar, group pill, hero title, verdict pill, the hero card's photo and name. The booking button is reachable with one short scroll at most.
- [ ] Only one violet button on the home.
- [ ] Every tile shows: crowd chip on the photo, verdict line, one-line name, venue · time, price.
- [ ] Rails scroll sideways with the next tile peeking; "See all" opens All nights at the right day.
- [ ] Nights that don't fit the group never appear in rails; they're collapsed in All nights.
- [ ] Changing Going as re-ranks the hero and changes every verdict without a reload.
- [ ] Group not set: verdicts show rules plainly, nothing claims "Lets you in" from group rules.
- [ ] Event page button reads "Get {n} passes" and is disabled with the reason for `no`.
- [ ] All strings match section 8; no UI line ends with a full stop.
- [ ] Only token colours and ladder sizes in the new code.
- [ ] All verdict unit tests pass.
- [ ] `?home=timefirst` and `?home=classic` still work.
- [ ] Logging events fire (check `gathr.log` in localStorage).
