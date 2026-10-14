# How to bring the app up to gathr-design release 25 with Claude Code

The new design system package is already in `gathr-design/` (written there by Claude on 14 Oct), and the design-system section of `CLAUDE.md` is already updated. This file is how to make the app's own components and screens match it.

**What changes on screen:** shorter door verdicts with the source under the pill; a GroupPill that says who you're going with and what's next; night tiles that lead with the night's name; a fixed crowd column in All nights; darker grey for supporting text; a thinner onboarding progress line.

**Why it runs in phases:** each phase touches one thing, so if something looks wrong you know exactly which change caused it, and it's one commit to undo.

## Before you start

1. **Commit.** VS Code → Source Control → message "gathr-design r25 package" → Commit. This saves the new design files on their own, before any app code changes.
2. Have the app running (`npm run dev`) and the browser at phone width (F12 → phone icon → 390 wide).

## How it runs

| Phase | What gets changed | How you check it |
|---|---|---|
| 0 | Nothing. Claude Code reads the package and reports what's already done | Read the report |
| 1 | Greys, the rail overflow fix, progress bar, social slide tag | Home and onboarding: supporting text is darker grey; nothing scrolls sideways |
| 2 | DoorVerdict words and source line | Home hero, event page, tiles, All nights |
| 3 | NightTile order and the All nights right column | Home rails and All nights |
| 4 | GroupPill words | The pill on the home in each state (`?group=none` for "Who's going?") |
| 5 | Going as "Add friends" (optional, ask first: it changes saved data) | Pick friends, see their names in the pill |
| 6 | Checklist pass | Claude Code's pass/fail list |

Commit after each phase you're happy with.

---

## The prompt (paste first, in plan mode, Shift+Tab)

```
We're bringing the gathr Seeker app up to gathr-design release 25. The new package is already in gathr-design/ and CLAUDE.md is already updated. Read these and don't change any files yet:

1. CLAUDE.md
2. gathr-design/START-HERE.md, gathr-design/CHANGES-since-release-23.md, gathr-design/rules.md
3. gathr-design/components/DoorVerdict/README.md, GroupPill/README.md, NightTile/README.md, NightRail/README.md, ProgressBar/README.md, StoryCard/README.md
4. gathr-design/guides/01-colour-type.md (the "Three text levels" section) and gathr-design/guides/05-app.md (the home recipe)

Then, for each numbered item in CHANGES-since-release-23.md, tell me in plain words whether the app already does it, partly does it, or doesn't, and which files it touches. In particular:
- where the verdict words are built today (src/lib/door.js: getDoorVerdict, verdictText, formatSource, doorRows) and which tests in src/lib/door.test.js will need new expected strings
- where GroupPill gets its title and line (src/screens/HomeDoor.jsx, src/data/group.js)
- how many places in src/ set a grey directly (var(--night-300), var(--night-500) or a hex grey) for text, instead of ink-muted / ink-faint
- whether src/main.jsx imports gathr-design/tokens.css (it should; the new tokens.css carries the new greys)

Then propose the plan in phases 1 to 6 from specs/PROMPT-release-25.md. Don't change code until I approve.

Rules for the whole job:
- Don't edit anything inside gathr-design/.
- Only token values; type sizes only from the ladder.
- Keep sample data labelled.
- After each phase: run npm test, tell me in plain words what changed, why, and exactly where to look in the browser. Then stop and wait.
```

## Prompts for each phase

**Phase 1: greys and small fixes**
```
Phase 1. Make these changes, nothing else:
1. Text greys: everywhere in src/ that sets a text colour to var(--night-300) (or another grey directly), use var(--ink-muted) for supporting text and var(--ink-faint) for timestamps, counters and source lines. Don't change backgrounds, borders or the crowd bars. In src/design-system/design-system.css, any scope that redefines --ink-muted or --ink-faint should match tokens.css: --ink-muted night-500, --ink-faint night-400.
2. Add .g-dv { position: relative; } to the DoorVerdict styles, so the hidden "Door: " label can't widen the page inside rails.
3. ProgressBar track height 2px (was 4px).
4. If the app has SocialSlide: the pillar VibeTag on the slide keeps its 34px canvas size (.g-slide .g-slide-tag), as in gathr-design/components/bundle.css.
Then tell me where to look: home rails (venue · time lines should be a darker grey than the night names), onboarding (thin progress line), and confirm nothing on the home scrolls sideways at 390 wide.
```

**Phase 2: DoorVerdict words and source**
```
Phase 2: the door verdict copy from gathr-design/components/DoorVerdict/README.md. Pill and line use the same short words, 20 characters at most, and never repeat the group:
- yes: "Lets you in", plus " · {minAge}+" when the night has an age limit (e.g. "Lets you in · 21+")
- if: the first condition only, capitalised: "Formals only", "Before 10:30", "Stags ₹500"
- unknown: "Stag rules unknown", "Age limit unknown" (today they say "not listed")
- no: "Couples only", "21+ only", "No stags", "Mixed groups only"
The ID reminder and any second condition stay in the event page's "Who gets in" rows (doorRows), which keep their longer wording.
Source line (formatSource): "Set by host", "Checked 3d ago" ("Checked today", "Checked by gathr" when there's no date), "From 12 guests". In DoorVerdict's pill look, put the source under the pill (4px gap, 11/14 ink-faint, left-aligned) instead of on the right; "Ask the venue" stays on the right of the pill for unknown.
Update the expected strings in src/lib/door.test.js to match and run npm test. Then tell me where to look: the home hero, an event page, and All nights.
```

**Phase 3: NightTile and All nights**
```
Phase 3: NightTile from gathr-design/components/NightTile/README.md.
- Tile layout order: the night's name (ink) → "{venue} · {time}" (ink-muted) with the price on the right → the door line, but only when the verdict is "if" or "unknown". A "yes" shows no line on tiles. Keep the verdict in the tile's accessible name.
- Row layout (All nights): the price and the compact CrowdMeter sit in a fixed 120px column on the right, both left-aligned, so the crowd bars start at the same place on every row. Rows keep the door line for every verdict.
Then tell me where to look: a home rail and All nights.
```

**Phase 4: GroupPill words**
```
Phase 4: GroupPill copy from gathr-design/components/GroupPill/README.md. The pill says who and what's next; the group's make-up ("4 guys, all 21+") leaves the pill.
- plan voting, I haven't voted: "Friday plan" / "Your vote · closes 8 pm"
- plan voting, I have: "Friday plan" / "Waiting on {name} · 8 pm", or "Waiting on {n}" for two or more
- plan booked: "{night name} · {day}" / "You're in with {name}, {name} + {n}"
- group set (counts only, for now): "You + 3 guys" (girls / friends / "You and your date" for a couple), with "Change" on the right; line "1 under 21" only when someone is under 21, otherwise no line
- group not set: "Who's going?" / "Add your group"
First names, at most two, then "+ n". Use the plan's member names (lib/plan.js). Then tell me how to see each state (including ?group=none).
```

**Phase 5: "Add friends" in Going as (ask before building)**
```
Phase 5 (plan only first): Going as gets an optional "Add friends" row that picks people from my friends list, so the GroupPill can show names ("You, Riya, Dev + 1"). Counts stay for people who aren't on gathr; the type and size still drive the door verdicts. Tell me the smallest way to do this: what you'd add to the saved group (e.g. a list of friend ids and first names), where it's stored, and how it reaches the GroupPill. Don't change anything until I approve.
```

**Phase 6: checklist**
```
Phase 6: run gathr-design/guides/07-checklist.md against the home, All nights, an event page and the Going as sheet. For each line say pass or fail and why. Fix the fails using tokens and the READMEs only, then list anything you couldn't fix.
```

## Not in this pass

- **StoryCard** isn't in the app yet. The design system suggests it for the success screen right after booking, upcoming nights in Plans, and the picture shared to the group chat. Decide where you want it first, then ask Claude Code to build it from `gathr-design/components/StoryCard/README.md`.
- **The wristband sticker** was removed from the live system but the app still uses it on the pass after booking. It's still in `gathr-design/assets/Stickers/`, so nothing breaks; pick a replacement when you're ready.

## If things go off track

- **It edits gathr-design/:** "Don't edit gathr-design. Revert that and change the app's own files."
- **It invents a grey or a size:** "Which token is that? Use ink, ink-muted or ink-faint."
- **The words don't match the README:** "Use the exact strings from the DoorVerdict / GroupPill README."
- **Tests fail after phase 2:** "Update the expected strings in door.test.js to the release 25 copy, don't change the verdict logic."
