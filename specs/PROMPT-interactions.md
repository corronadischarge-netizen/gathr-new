# How to add the interactions with Claude Code

Two files go into your app folder:
- `specs/interactions-app.md` — what every screen and component does when touched, with the booking and group plan state machines
- this file — how to run it

**Order:** install the release 23 `gathr-design` package first, then build home v3, then run this. This spec adds behaviour to the home v3 screens, so they need to exist.

## Before you start

1. Copy the `specs` folder into your app folder (next to `src`). Say yes if Windows asks to replace.
2. Commit (Source Control → "before interactions" → Commit).
3. Have your Android phone ready on the same wifi. Each phase ends with a test on the phone, not just the browser: motion, haptics and swipes only feel right on a real device.

## How to run it

- One phase per session. Start each in **plan mode** (Shift+Tab).
- After each phase: test on the phone, then commit.
- If something feels wrong, describe the moment ("swiping the sheet down snaps back too early") and point to the section ("section 4, swipe threshold").

## Phases

| Phase | What gets built | How you check it |
|---|---|---|
| 0 | Nothing. Claude Code reads the code and returns a plan | Read the plan, answer its questions |
| 1 | Foundations: motion tokens and easing, haptics helper, press and focus styles, reduced motion, double-tap guard, optimistic-update helper, skeletons, Toast | Tap around: every press responds; turn on reduced motion in phone settings and check |
| 2 | Navigation and sheets (sections 3, 4) | Back by edge swipe, back button, Android back; open and swipe-close every sheet |
| 3 | Component states (section 5) and Home + All nights (6.2, 6.3) | Change Going as and watch the re-sort; swipe rails; pull to refresh |
| 4 | Event page, booking state machine, pass (6.4–6.6, section 7) | Book in test mode: double-tap Pay, fail a payment, wrong code, airplane mode mid-payment |
| 5 | Group plan, Plans, Updates, day after (6.7, 6.10–6.12, section 8) | Run a vote with two phones; decline and undo an update |
| 6 | Map, search, first run, profile (6.1, 6.8, 6.9, 6.13) | Map search stays on the map; logout clears the name |
| 7 | Host mode and scanner (6.14) | Scan in / check / no entry; feel the three haptics |
| 8 | Acceptance checklist (section 10) | Claude Code reports pass/fail per line; you re-test the fails |

---

## The prompt (paste first, in plan mode)

```
We're adding interactions across the gathr Seeker app. Read these first and don't change any files yet:

1. CLAUDE.md
2. gathr-design/rules.md, gathr-design/tokens.json (tempo), gathr-design/guides/02-surfaces.md (Depth and motion), and the READMEs for TabBar, Toast, Sheet, MoodTile, Sticker, Update, Button
3. specs/interactions-app.md — the interaction spec
4. specs/home-door-first.md — the home v3 screens these interactions apply to

Then explore the code (Step 0) and come back with a plan:

- What exists today: routing and screen transitions, any animation code or libraries, how sheets and toasts are built, whether Capacitor Haptics is installed, how state is stored (group, filters, scroll), and how booking and the group plan are modelled now.
- Whether home v3 is built. If not, stop and tell me.
- The motion and haptics helpers you'll create (one each), where they live, and how components will use them.
- Whether you need a library (Framer Motion or similar). Default is no: CSS transitions plus a small helper. Only propose one if the spec needs it (edge-swipe back, drag-to-close, shared-element moves), and say which parts.
- How you'll implement the booking and group plan state machines (sections 7 and 8), so impossible states can't happen.
- Map every section of the spec to files, grouped into the 8 phases in PROMPT-interactions.md.
- Questions: anything unclear, anything that conflicts with the design system or the current code, and anything that needs the backend (idempotent payments, real-time votes, offline guest list).

Rules for the whole job:
- Behaviour only. Don't change layout, colours, type or copy.
- Animate only transform and opacity. Use the tempo tokens. Never block a tap.
- Reduced motion: every movement becomes instant or a 120 ms fade.
- Nothing pulses, glows or shimmers. One bobbing sticker per screen at most. Skeletons are static.
- Undo instead of confirm for reversible actions. Confirm only paying, cancelling a paid booking and deleting the account.
- Every gesture also has a visible button.
- After each phase, stop. Tell me what changed (files), how to test it on my Android phone step by step, and confirm reduced motion works. Wait for my go-ahead.
```

## Prompts for each phase (after you approve the plan)

**Phase 1**
```
Phase 1 only: the foundations in section 2 of specs/interactions-app.md. Motion tokens and the three easing curves in one file, the haptics helper with the four patterns, press and focus styles applied through the design-system components (not per screen), reduced motion, the in-flight guard for buttons, the optimistic-update helper with rollback toast, static skeletons, and Toast exactly as its README says. Stop after phase 1 and tell me how to test on my phone.
```

**Phase 2**
```
Phase 2: navigation (section 3) and sheets (section 4). Screen push/pop with edge-swipe back that follows the finger, Android back closing sheets first, tab cross-fade with the TabBar spring, scroll position kept per tab, tap-active-tab to top, top bar turning glass on scroll. One Sheet implementation with swipe-to-close, scrim, ✕, focus trap and focus return. Stop after phase 2.
```

**Phase 3**
```
Phase 3: component states (section 5) and Home + All nights (6.2, 6.3). Changing Going as must re-rank the hero, cross-fade every DoorVerdict and re-sort the rails smoothly (FLIP), with the toast. Rails lock to horizontal after 10px. Pull to refresh without jumping. Stop after phase 3.
```

**Phase 4**
```
Phase 4: event page (6.4), booking (section 7) and pass (6.6). Build booking as an explicit state machine with every transition in the table, including pending after 20s, background/resume and the disabled state for a 'no' verdict. Pay must be impossible to double-charge. The success moment (tick, haptic, "You're in", pass rising, wristband sticker) plays once. Use test-mode payments. Stop after phase 4 and give me a test script that covers each row of the table.
```

**Phase 5**
```
Phase 5: group plan (6.7, section 8), Plans tab (6.10), Updates (6.11) and the day-after card (6.12). Votes update for everyone in real time if the backend supports it; if not, tell me what's needed and poll for now. Stop after phase 5.
```

**Phase 6**
```
Phase 6: first run (6.1), map (6.8), search (6.9) and profile logout (6.13). The map's search bar must stay on the map. Logging out must clear the previous user's name, group and cached passes everywhere. Stop after phase 6.
```

**Phase 7**
```
Phase 7: host mode switching and the door scanner (6.14), including the three full-screen results with their haptics and offline scanning from the downloaded list. Stop after phase 7.
```

**Phase 8**
```
Phase 8: go through the acceptance checklist in section 10 line by line on the code you've built. For each line say pass or fail and why, fix the fails, then list anything you couldn't do (for example, things that need backend support).
```

## If things go off track

- **Something pulses, glows or shimmers:** "Remove it. Nothing pulses, glows or shimmers (spec section 1)."
- **It changes how a screen looks:** "Behaviour only. Revert the visual change."
- **Animations feel slow:** "Use the tempo tokens: presses 120, chips 200, sheets 320, screens 360."
- **A tap waits for an animation:** "Never block input (rule 0.4). New taps interrupt animations."
- **It adds a big library for one effect:** "Do this with CSS and the motion helper instead."
- **Booking misbehaves:** "Show me the state machine and which transition is missing."
- **It gets confused after a long session:** commit, start a new session, paste the phase prompt again.

## After it's built

- Ask me to add the three easing tokens (and the haptics vocabulary as a guide note) to the live design system, so the system and the app match.
- Test the peak and the end with 3–4 people: "What do you remember about booking?" and "How did the night end in the app?" If they don't mention the tick or the recap, those moments need more weight.
