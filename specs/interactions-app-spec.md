# Spec: Interactions across the gathr Seeker app

Status: ready to build · 13 Oct 2026 · owner: Shubh
Applies to: every Seeker screen, plus host mode and the door scanner.
Build after: home v3 (`specs/home-door-first.md`). If home v3 isn't built yet, do its phases first; this spec adds behaviour to those screens, it doesn't redesign them.
Design system: `gathr-design/` release 23 (+ proposed release 24 components).

---

## 0. Ground rules

1. **Behaviour only.** Don't change layout, colours, type or copy. Where this spec names a string, it's already in the design system or the home spec.
2. **The design system wins.** Timings come from the tempo tokens. Motion rules come from `guides/02-surfaces.md` (Depth and motion) and the component READMEs (TabBar, Toast, Sheet, MoodTile, Update).
3. **Only `transform` and `opacity` animate.** Never animate width, height, top, left, margin, colour fills or blur. Target 60 fps on a mid-range Android phone.
4. **Never block input.** No animation stops a tap. A new tap interrupts a running animation.
5. **Reduced motion:** with `prefers-reduced-motion: reduce`, every movement becomes an instant change or a 120 ms fade. Haptics stay (they aren't motion).
6. **Reuse.** One motion helper, one haptics helper, one sheet, one toast, one press style. No per-screen one-offs.
7. **Library:** use what the app already has. If nothing, CSS transitions + a tiny helper are enough. Add Framer Motion only if Step 0 shows a real need (gestures, shared-element moves), and say why.

---

## 1. Principles (why things behave the way they do)

- **The user is the hero of a night out.** The flow builds to one peak: **you're in** (the booking tick and the pass). The end is the **day after** (the one-tap recap). Spend the most care on those two.
- **Feedback in under 100 ms.** Every tap visibly responds at once, even if the result takes longer.
- **Nothing silent for more than 1 s.** Show a skeleton or a state change immediately; after 1 s, say what's happening.
- **Undo, don't ask.** Reversible actions (save, remove, decline, leave a plan before anyone booked) happen at once with an Undo toast. Confirm only for the irreversible: paying, cancelling a paid booking, deleting the account.
- **Remember, don't re-ask.** Group (Going as), area, picked sounds, last filters, scroll position per tab, and form input survive navigation, errors and app restarts.
- **Every gesture has a button.** Swipe-to-close sheets also have ✕; edge-swipe back also has the back button; pull-to-refresh also refreshes on return to the tab.
- **Nothing pulses, glows or shimmers.** One sticker per screen may bob. Skeletons are static grey shapes, not shimmer.
- **Errors never lose work.** Keep everything entered, say what happened in plain words ("That didn't go through. Try again"), give one way forward.

---

## 2. Foundations (build once)

### 2.1 Motion tokens
From `tokens.json` (tempo):

| Token | Value | Use |
|---|---|---|
| `dur-fast` | 120 ms | presses, small state flips |
| `dur-base` | 200 ms | chips, tabs, toggles, cross-fades |
| `dur-slow` | 320 ms | sheets, cards entering, list re-sorts |
| `dur-screen` | 360 ms | screen push/pop, tab cross-fade |
| `bob` | 3200 ms | the one floating sticker (±4 px) |
| TabBar pill | 460 ms spring | defined in the TabBar README |

**Proposed easing tokens** (add to the design system as release 24 if you agree; until then define them once in the app's motion file):
- `ease-standard` `cubic-bezier(0.2, 0, 0, 1)` — things moving on screen
- `ease-enter` `cubic-bezier(0, 0, 0, 1)` — things arriving (sheets, toasts, screens in)
- `ease-exit` `cubic-bezier(0.3, 0, 1, 1)` — things leaving (faster than entering: exit = 0.8 × enter duration)

### 2.2 Haptics (app layer, Capacitor Haptics or the Vibration API)
A small vocabulary, used consistently:

| Name | Pattern | When |
|---|---|---|
| `tap` | light impact | selecting a chip, a tab, a vote, a stepper step |
| `success` | success notification | booking done, on the list, scan "in" |
| `warning` | warning notification | scan "check", a limit hit (max passes) |
| `error` | error notification | wrong code, payment failed, scan "no entry" |
Never on scroll or on every tile tap. Respect the phone's settings.

### 2.3 Press and focus
- Everything tappable: pressed = scale 0.98 (cards, tiles) or 0.96 (buttons, chips, icon buttons) over `dur-fast`, back on release. No colour flash.
- Touch targets ≥ 44 px (tap-min); expand small hit areas with padding, not visual size.
- Focus: the design system's ring (white). Visible on keyboard focus only (`:focus-visible`).
- Disabled: 40% opacity and no press; if a reason exists, it's in the label ("Couples only tonight") or a line under it, never only a greyed button.

### 2.4 Double-tap and in-flight guard
- Any button that starts a network action switches to its loading state on the first tap and ignores further taps until it resolves. Width stays fixed while the label changes.
- Pay, book, send code, vote, accept: idempotent on the server too (send a request id).

### 2.5 Optimistic updates
Save (heart), vote, accept/decline, mark read, "Let them in": update the UI at once, sync in the background. If the sync fails, roll back and show a Toast: "That didn't go through. Try again" with "Retry".

### 2.6 Loading, empty, offline
- Data screens show skeletons in the real layout immediately (static, no shimmer). Replace in place, no jump: skeletons have the real heights.
- Images fade in over `dur-base` when loaded; the neutral placeholder holds the space.
- Empty states always say how to start and give one button (copy from the design system's copy library).
- Offline: keep what's loaded, Toast "You're offline. Showing what we had"; actions that need the network are disabled with "Offline" in their line; when back online, refresh quietly.

### 2.7 Toast
Exactly as the Toast README: one at a time (a new one replaces the old), 32 px up or 12 px above the tab bar, slides up 8 px and fades in over `dur-base`, 2.4 s or 5 s with an action, one line, no full stop.

---

## 3. Navigation

| Trigger | Behaviour |
|---|---|
| Open a screen (event page, All nights, plan, pass) | new screen slides in from the right, `dur-screen`, `ease-enter`; the old one shifts 30% left and dims slightly |
| Back button / edge swipe from the left | the reverse; the screen follows the finger during the swipe; release past 35% width or with a fast flick completes, otherwise it springs back |
| Android hardware back | closes, in order: open toast action? no → open sheet → open expanded section → screen. Never exits the app from a non-root screen |
| Tab change | content cross-fades `dur-screen`; TabBar pill slides with its 460 ms spring; new icon fills; `tap` haptic |
| Tap the active tab | scroll to top over `dur-slow`; if already at top on Tonight, refresh |
| Return to a tab | restore its scroll position and filters exactly |
| Deep link / push open | open the target screen with the home underneath, so back lands on the home |
| Top bar on scroll | over a photo the bar is clear; once the photo scrolls under it, it becomes glass over `dur-base` (as the design system's "top bar on scroll") |

---

## 4. Sheets (Sheet component: Going as, booking, venue preview from the map, filters, Who gets in details)

- Opens: scrim fades in, sheet rises from the bottom over `dur-slow`, `ease-enter`. Focus moves into the sheet (to its title). Background stops scrolling.
- Closes: ✕, tap on the scrim, swipe down on the grabber or header, or Android back. Swipe follows the finger; past 30% height or a fast flick closes; otherwise it springs back.
- Snap points: content height up to 90% of the screen; taller content scrolls inside the sheet; the sheet only drags down when its content is scrolled to the top.
- Keyboard (code entry): the sheet rises with the keyboard, the focused field stays visible.
- One sheet at a time. A sheet that opens another (booking → sign in) swaps content inside the same sheet with a horizontal slide, `dur-base`.
- On close, focus returns to what opened it.

---

## 5. Component states (each needs every state that applies)

| Component | States and behaviour |
|---|---|
| **Button** | default · pressed · focus · loading (label → "Paying", "Sending code", width fixed, no spinner over the label) · disabled with reason · success (booking only: tick) |
| **Chip** | default · pressed · selected (flat violet; host mode yellow) · disabled. Select/deselect `dur-base`, `tap` haptic |
| **IconButton** (save) | outline → filled heart with a small 1.0→1.15→1.0 scale over `dur-base`; optimistic; Toast "Saved" only the first time ever, then silent |
| **NightTile** | default · pressed (0.98) · focus · loading skeleton · sold out (name 60%, CrowdMeter Full). Image fades in |
| **NightRail** | horizontal scroll with scroll-snap to tile starts; momentum native; the next tile peeks; end tile "See all {n}" |
| **DoorVerdict** | when the group changes: the line/pill cross-fades to its new state over `dur-base` (icon and words together). Never animates colour alone |
| **GroupPill** | state changes cross-fade; vote count ticks up as a number change (no counter animation longer than `dur-base`) |
| **VenueCard / hero** | pressed 0.98; image fades in; crowd chip and badge never move |
| **CrowdMeter** | bars fill to the level once on first view (`dur-slow`, left to right), then static; no live ticking |
| **Booked so far widget** | dots light from the bottom once on first view (`dur-slow` total, staggered ≤ 8 ms per dot), then static |
| **MoodTile** | selected turns violet and its sticker starts the bob; deselect stops it |
| **Sticker** | still by default; only the one `bob` sticker per screen loops |
| **Stepper** (passes, group size) | number changes as a quick vertical roll (`dur-fast`); hitting a limit: no change, `warning` haptic, line "Max {n} passes per booking" |
| **Code input** | 6 boxes; auto-advance; paste fills all; backspace goes back; wrong code: horizontal shake (3 small moves, 400 ms), boxes clear, focus stays, `error` haptic |
| **Update row** | Accept: row turns to its done state, `success` haptic; Decline: row leaves (collapse `dur-slow`) with Undo toast 5 s; info rows open their target |
| **Toast** | see 2.7 |
| **Collapsed group** ("Not for your group · 3") | chevron rotates 90° and rows expand (`dur-slow`); state remembered per day |

---

## 6. Screens

### 6.1 First run (welcome, pick your nights, area, age)
- Steps slide horizontally; the ProgressBar fills to the next step over `dur-slow`.
- "Next" is enabled as soon as the step is valid; "Skip" never loses earlier picks.
- The welcome screen's bloom is still (occasion). One sticker bobs.
- Location permission is asked only when the user taps "Use my location", never on launch.

### 6.2 Home (door-first)
- **First paint:** GroupPill, hero and two rails as skeletons immediately; content swaps in place.
- **Pull to refresh** on the whole feed: a small spinner under the top bar (not a bouncing logo), `tap` haptic when the pull passes the threshold; content updates in place without jumping the scroll.
- **GroupPill:** tap opens the plan (vote open), the pass (booked) or the Going as sheet (no plan).
- **Changing Going as:** on save, the sheet closes, then the hero cross-fades to its new night, every verdict cross-fades, and rails re-sort with items moving to their new positions (FLIP, `dur-slow`). A Toast confirms: "Showing nights for 4 guys".
- **Hero:** tap the card → event page; tap "Get 4 passes" → booking sheet prefilled (section 7).
- **Rails:** swipe sideways; "See all" → All nights scrolled to that day; tile → event page. Horizontal swipes never trigger vertical scroll or back navigation (lock direction after 10 px).
- **Sound tiles:** tap → All nights filtered to that sound for the week (the tile shows its selected state briefly before the screen slides).
- **End card:** the disco ball is the screen's one bob; "See them all" → All nights.
- **Window rolls at 2 am:** the home updates on next focus, not while someone is looking at it.

### 6.3 All nights
- Day headings stick to the top while their day scrolls.
- Time chips jump to a day (smooth scroll `dur-slow`) and the chip for the day in view highlights as you scroll (scroll-spy).
- Filter chips apply instantly, with the count in the title updating; "Clear" appears when any filter is on and resets with an Undo toast.
- The filters sheet (sliders icon) applies live as you pick; no "Apply" button.
- "Not for your group · n" expands in place.

### 6.4 Event page
- VenueHero photo stays fixed while the card scrolls over it (no parallax tilt, no zoom).
- Back and Save sit on the photo; the top bar becomes glass once the photo is gone.
- "Who gets in" card → Going as sheet; on save, the verdict on this page and the booking button label update in place.
- "Ask the venue" opens WhatsApp (or the dialer) with a prefilled message: "Hi, is stag entry allowed tonight at {venue}? Asking via gathr"; logs the tap.
- Share: native share sheet with the night's link and a one-line message.
- The booking button stays pinned at the bottom (ActionBar) once the hero's own button scrolls away; the functional fade sits behind it.

### 6.5 Booking (the peak) — see the state machine in section 7.

### 6.6 Pass
- Opens from the success screen, GroupPill, Plans, or a push.
- Screen brightness goes up while the QR is visible (restored on leave), where the platform allows.
- The ticket can be swiped between passes in a group booking (one per person), with a page indicator.
- "Add to wallet" / "Share pass to {name}" give a Toast on success.
- At the door: no network needed to show the QR (cached).

### 6.7 Group plan
State machine (section 8). Interactions:
- Start a plan: pick 2–4 nights (from the home's tiles via long-press "Add to plan" or the plan screen) → pick who's going → share link to WhatsApp (native share).
- Voting: tap a night to vote; bars grow to their new share (`dur-slow`); your vote shows your face on the bar; `tap` haptic. Changing a vote moves the face.
- Leader changes: "Leading" label slides to the new bar.
- Countdown: shown as text ("closes 8 pm", then "closes in 20 min" in the last hour). No ticking seconds, no pulsing.
- Close the vote (planner, or automatically at the deadline) → booking sheet with the winning night and passes = members who joined.
- Members' status (voted, paid, in) updates in place.

### 6.8 Map
- Pins: tap → pin grows and turns selected (flat violet), the map eases to centre it (`dur-slow`), the venue sheet rises; the previous pin shrinks back.
- Clusters: tap zooms in until pins separate.
- "Locate me" eases to the user; first tap asks for permission with a line saying why.
- The map's search bar searches places on the map in place. It never jumps to the Search tab.
- Panning hides the sheet to its peek height; tapping the map closes it.

### 6.9 Search
- Results update as you type (debounce 250 ms); recent searches show on focus; "Clear" empties the field and keeps focus.
- No results: "Nothing for '{query}'. Try an artist or an area" with suggested chips.

### 6.10 Plans tab
- Upcoming first, then past. Swipe a past item left to remove it, with Undo toast; the same action exists in its "…" menu.

### 6.11 Updates (notifications)
- As the Update README: Needs you, then Earlier. Accept/Decline optimistic; Decline leaves with Undo; opening the screen marks Earlier rows read after 1 s on screen; the bell's dot clears when everything is read.

### 6.12 The day after (recap)
- A push in the morning ("How was {night}? One tap") opens a single card, not a form:
  - "Did they let your group in?" Yes / No, because… (No reveals 4 reason chips: age, stag, dress, list)
  - Optional second step: "Sound" great / fine / bad · "Crowd" chill / packed
- Each answer saves on tap with a small tick and `tap` haptic; the card moves to the next question; after the last, "Thanks. That helps the next group" and it closes itself after 1.5 s.
- These answers feed the door verdict source "From {n} guests".

### 6.13 You (profile)
- Log out: clears the user's name, group and cached passes immediately (fixes the "previous user's name persists" bug), Toast "Logged out".

### 6.14 Host mode and the door scanner
- Switching modes ("Switch to hosting" / "Switch to going out"): a full-screen cross-fade over `dur-screen` so the change can't be missed; the tab bar swaps; host selections are yellow (`.g-host`).
- Scanner results fill the screen in their colour, each with its own haptic: in = green + `success`; check = amber + `warning`; no entry = red + `error`. The result stays until the next scan or a tap; it never auto-clears in under 2 s.
- "Let them in" adds the guest to "Just in" with the row sliding in at the top.
- Works offline with the downloaded guest list; syncs when back online.

---

## 7. Booking state machine

States: `idle → (signIn) → selecting → (codeSent → codeEntry) → paying → success | failed | pending`.

| From | Event | To | What the user sees |
|---|---|---|---|
| idle | tap "Get {n} passes" | selecting | sheet rises with passes prefilled from the group, price total, the verdict condition line if `if` ("Formals only. Make sure everyone's sorted") |
| selecting | change passes | selecting | number rolls, total updates; limit → warning haptic + "Max {n} passes per booking" |
| selecting | tap Pay, not signed in | codeSent | sheet content slides to phone entry; "Send code" → loading "Sending code" |
| codeSent | code arrives / user types | codeEntry | 6 boxes; paste/autofill fills all |
| codeEntry | wrong code | codeEntry | shake, clear, error haptic, "Wrong code. Try again" · after 3 wrong tries: "Send a new code" |
| codeEntry | right code | selecting (signed in) | slides back with everything kept |
| selecting | tap Pay (signed in) | paying | button "Paying", width fixed, sheet can't be dismissed by swipe (✕ still asks "Stop paying?") |
| paying | success | success | tick draws itself (450 ms), success haptic, "You're in", then the pass rises into place and the wristband sticker drops onto it (the screen's one sticker moment) |
| paying | declined / failed | failed | all choices kept, "That didn't go through. Try again", Try again → paying |
| paying | no answer in 20 s | pending | "Checking with your bank". Polls; resolves to success or failed; never charges twice |
| any | app goes to background | same | state kept; returning resumes it |
| success | "Share passes" | — | native share; GroupPill becomes "You're in · Show pass" |
| verdict = `no` | — | — | Pay is disabled with the reason; "Try {night}" link instead |

Free list nights: same machine without `paying`; the button reads "Get on the list · {n}" and success says "You're on the list".

---

## 8. Group plan state machine

`draft → voting → closed → booking → booked` (plus `cancelled`).

| From | Event | To |
|---|---|---|
| draft | share link | voting (deadline set, default 8 pm or 2 h before the earliest night) |
| voting | vote / change vote | voting (bars update for everyone in real time) |
| voting | deadline or planner closes | closed (winner = most votes; tie → planner picks from the tied nights) |
| closed | planner taps "Book {n} passes" | booking (booking machine, passes = members in) |
| booking | success | booked (members get "You're in" and their own pass) |
| voting | planner cancels | cancelled (Undo toast 5 s; members notified only after the undo window) |
| any | a member leaves | same, with the count updated; leaving is undoable for 5 s |

---

## 9. Accessibility

- Every motion has a reduced-motion version (instant or 120 ms fade).
- Screen readers: announce state changes politely (toasts, verdict changes, "Booked. You're in"), and move focus to the result after booking.
- Sheets trap focus and return it on close. Rails are lists with labels. All controls have names (icon buttons use their `label`).
- No information by colour alone (verdicts and scan results pair colour with words and icons).
- Text scaling up to 200% doesn't break buttons or hide prices.

---

## 10. Acceptance checklist (run on an Android phone)

- [ ] Every tap responds visibly in under 100 ms; nothing goes silent for over 1 s.
- [ ] Back works everywhere: edge swipe, back button, Android back (sheet first).
- [ ] Each tab keeps its scroll and filters; tapping the active tab scrolls to top.
- [ ] Sheets open, swipe closed, close on scrim and ✕, and return focus.
- [ ] Changing Going as re-ranks the home and updates verdicts with a smooth re-sort and a toast.
- [ ] Booking: double-tapping Pay never charges twice; a failed payment keeps everything; the tick and pass moment plays once.
- [ ] Wrong code shakes and clears; paste fills all six boxes.
- [ ] Save, vote, decline and remove are instant, with Undo where reversible, and roll back with a toast if offline.
- [ ] Only one bobbing sticker per screen; nothing pulses, glows or shimmers.
- [ ] Reduced motion on: no movement, everything still works.
- [ ] Offline: last data shows, network actions explain why they're off, refresh on reconnect.
- [ ] Scanner results are readable at arm's length and have distinct haptics.
- [ ] Logging out clears the previous user's name everywhere.
- [ ] Scrolling the home and All nights stays smooth (no stutter) on a mid-range phone.
