# DoorVerdict

Answers "will they let us in?" for the group set in Going as, in two or three words, with where the rule came from in small type under it. One component for the hero card, the event page, tiles and list rows.

**Provide:** `state` (`yes`, `if`, `unknown`, `no`), `text` (the verdict, 20 characters at most), `look` (`pill` on the hero card and event page, `line` on tiles and rows), and for the pill a `source` (`{ kind: 'host' }`, `{ kind: 'gathr', checkedAt }`, `{ kind: 'guests', count }`). For `if`, pass the condition's icon: `shirt` (dress), `clock` (arrive by), `indian-rupee` (stag fee). For `unknown`, pass `onAsk` to show "Ask the venue" beside the pill.

## Copy (release 25: short)

The pill and the line use the same words. The group isn't repeated: the `GroupPill` already says who's going, and the verdict is always for that group.

| State | Say | Not |
|---|---|---|
| `yes` | **Lets you in** · with an age limit, **Lets you in · 21+** | ~~Lets 4 guys in · ID needed~~ |
| `if` | the one condition: **Formals only** · **Before 10:30** · **Stags ₹500** | ~~Lets 4 guys in · formals only, before 10:30~~ |
| `unknown` | **Stag rules unknown** · **Age limit unknown** | |
| `no` | the reason: **Couples only** · **21+ only** · **No stags** · **Mixed groups only** | ~~Couples only tonight~~ |

- 20 characters at most, sentence case, no full stop.
- One condition in the pill. A second condition, the ID reminder and the dress details live in the event page's "Who gets in" rows, where there's room.

**Source line** (pill only): beside the pill on the same row, right-aligned, 11/14 `ink-faint`; it truncates before the pill does. With `onAsk`, "Ask the venue" takes that spot. **Set by host** · **Checked 3d ago** (**Checked today**; **Checked by gathr** when there's no date) · **From 12 guests**. Tiles and rows never show it.

| State | Pill | Line |
|---|---|---|
| `yes` | green `TagPill` (go), check | 13/18 600 `go-text` |
| `if` | white `TagPill` (light), the condition's icon | 13/18 600 `ink` |
| `unknown` | dark `TagPill`, info | 13/18 600 `ink-muted` |
| `no` | dark pill, `limit-text` words and an x | 13/18 600 `limit-text` |

**Rules:**
- The words carry the meaning; the colour only repeats it. Never colour alone.
- `if` is white, never yellow (yellow means energy right now). Red only for `no`.
- With no group set, use `unknown` for the plain rule ("Stags OK", "Couples only"), so nothing claims "Lets you in" from group rules.

**Accessibility:** the text is the accessible name, with a visually hidden "Door: " in front. The icon is hidden from screen readers.
