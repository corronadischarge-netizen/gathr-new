# Changes since release 23

Your app's last package was release 23 (+ proposed 24), 13 Oct. This package is release 25, 14 Oct.
Release 24 moved the four home v3 components into the live system, copied from the versions the app already built. Release 25 is Shubh's feedback pass on them.
Work through these one area at a time. Check each in the browser at 390 wide before the next.

## Release 24 · the door (already built in the app)

1. **DoorVerdict, NightTile, NightRail, GroupPill are now live components.** `proposed/` is no longer the source: use `components/<Name>/README.md`, `index.d.ts` and `bundle.css`/`bundle.js`. The app's versions in `src/design-system/` are the starting point; only the release 25 changes below are new.
2. **Spine:** "Will they let us in?" is the first of five questions (rules.md, DESIGN-SYSTEM-README.md).
3. **Fix: the hidden "Door: " label leaks out of rails.** `.g-sr` is absolutely positioned; inside a NightRail it escapes the scroll box and makes the page scroll sideways. Add `.g-dv { position: relative; }` (bundle.css has it).

## Release 25 · feedback pass

4. **DoorVerdict copy is short.** 20 characters max; the group is never repeated (the GroupPill already says who).
   - yes: "Lets you in", or "Lets you in · 21+" when there's an age limit (was "Lets 4 guys in · ID needed")
   - if: one condition only: "Formals only", "Before 10:30", "Stags ₹500"
   - unknown: "Stag rules unknown", "Age limit unknown"
   - no: the reason: "Couples only", "21+ only", "No stags", "Mixed groups only" (was "Couples only tonight")
   - The ID reminder and any second condition move to the event page's "Who gets in" rows.
   - Pill and line now use the same words.
5. **DoorVerdict source line is short and sits beside the pill (25.1: back on one row, as before release 25):** "Set by host" · "Checked 3d ago" ("Checked today", "Checked by gathr" with no date) · "From 12 guests". 11/14 `ink-faint`, right-aligned on the pill's row; it truncates before the pill does. "Ask the venue" takes that spot for unknown.
6. **GroupPill shows who and what's next, not the group's make-up.** See components/GroupPill/README.md for every state:
   - plan, you haven't voted: "Friday plan" / "Your vote · closes 8 pm"
   - plan, waiting: "Friday plan" / "Waiting on Arjun · 8 pm" ("Waiting on 2" for more)
   - booked: "Bollywood Night · Fri" / "You're in with Riya, Dev + 2"
   - group with friends picked: "You, Riya, Dev + 1"; counts only: "You + 3 guys"; both show "Change"
   - not set: "Who's going?" / "Add your group"
   - Age only when it changes things: line "1 under 21". "4 guys, all 21+" moves into the Going as sheet.
7. **Going as: an optional "Add friends" row** picks people from your friends, so the GroupPill can show names. Counts stay for people who aren't on gathr. A plan fills names in by itself. (New UI and a small data change: the group keeps an optional list of friend ids/names.)
8. **NightTile leads with the night's name.** Tile order: name (`ink`) → "{venue} · {time}" (`ink-muted`) with the price → the door line **only** for `if` and `unknown`. A `yes` shows nothing on a tile (rails only hold nights you can get into). The accessible name still includes the verdict.
9. **All nights rows: fixed right column.** Price over the compact CrowdMeter in a 120px column, both left-aligned, so the crowd bars start at the same place on every row. Rows always show the door line.
10. **Three text levels.** `ink-muted` is now night-500 #9d9992 (was night-300 #b5b1aa); `ink-faint` is the new night-400 #8a867f (was night-500). tokens.css in this package is regenerated. Anywhere the app sets `color: var(--night-300)` (or another grey directly) for text, switch it to `ink-muted`/`ink-faint`. night-300 is no longer a text colour.
11. **SocialSlide:** the pillar VibeTag on the 1080 canvas is 34px again (`.g-slide .g-slide-tag`; a later `.g-vibe` size rule had been shrinking it).
12. **ProgressBar:** 2px (was 4px).
13. **StoryCard (not in the app yet):** the card for a night that's yours. Place it on the success screen right after booking ("You're in" + your group's faces, then "Show pass" and "Share"), in Plans for upcoming booked nights, and as the image shared to the group chat. Ask Shubh before adding it to a screen.

## Note on stickers

Shubh removed three stickers from the live system (vinyl-sleeve, vip-tape, wristband). This package doesn't touch `assets/Stickers/`, so `wristband.png` is still in the app and still used on the pass after booking. Don't remove it until Shubh decides what replaces it.
