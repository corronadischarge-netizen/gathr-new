# GroupPill

The one place the home says who you're going with and what's next. It shows the active group plan when there is one, otherwise your Going as group. Tapping it opens the plan, the pass, or the Going as sheet.

**Provide:** `state`, `title`, `line`, `people` (up to 4: `{ name, image }`) and `onOpen`.

## What goes in it (release 25)

At a glance people look for **who** and **what's next**, not the group's make-up. "4 guys, all 21+" is what the app needs to check the door; it lives in the Going as sheet and stays out of the pill. Names beat counts: "Riya, Dev + 2" is recognised faster than "4 guys".

| State | Faces | Title | Line | Opens |
|---|---|---|---|---|
| `plan-vote`, you haven't voted | plan members | Friday plan | Your vote · closes 8 pm | the plan |
| `plan-vote`, waiting on others | plan members | Friday plan | Waiting on Arjun · 8 pm | the plan |
| `plan-booked` | plan members | Bollywood Night · Fri | You're in with Riya, Dev + 2 | the pass |
| `group-set`, with friends picked | them | You, Riya, Dev + 1 | (shows "Change" on the right) | Going as |
| `group-set`, counts only | you | You + 3 guys | (shows "Change") | Going as |
| `group-unset` | a user icon | Who's going? | Add your group | Going as |

- **Names:** first names, at most two, then "+ n". Never a full list.
- **Age:** say it only when it changes things: line "1 under 21". "All 21+" is the default and goes unsaid.
- **Waiting on:** name one person ("Waiting on Arjun"); with two or more, "Waiting on 2".
- Title and line are one line each, about 28 characters; no full stop.

**Layout:** a full-width pill, at least 56 tall, `night-900` with a 1px `line` edge. Left: up to four 32px avatars (initials when there's no photo) overlapping by 8, each ringed in `night-900`. Middle: the title (15/20 600, `ink`) and the line (13/18 `ink-muted`). Right: a chevron, or the word "Change" for `group-set`.

**Rules:**
- Solid, never glass. Never violet: it isn't a selection.
- One per screen, on the home only, 16 below the top bar.

**Accessibility:** one button whose name is the title and the line.
