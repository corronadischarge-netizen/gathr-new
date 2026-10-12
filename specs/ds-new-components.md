# New design-system components for home v3

For: the live gathr design system (add as release 24) and the app (build once, reuse everywhere).
Used by: `specs/home-door-first.md`.
All values come from tokens.json. Type sizes only from the ladder (32 / 20 / 16 / 15 / 13 / 11). No colour outside the palette.

## Spine change (guide 01 and the README table)

Add a fifth question, placed first:

| You want to know | gathr shows it as | Built with |
|---|---|---|
| **Will they let us in?** | the door rule for your group, in words, with where it came from: "Lets 4 guys in · ID needed · Checked by gathr" | `DoorVerdict` |
| How full will it be? | (unchanged) | CrowdMeter, TonightSoFar |
| Who's going? | (unchanged) | FriendsGoing, RingAvatar |
| Is it on right now? | (unchanged) | Badge now |
| What will it cost? | (unchanged) | VenueCard, VenueHero |

Checklist (guide 07) gains: "Every night shows a DoorVerdict for the current group. Verdicts use icon + words, never colour alone. Red only for `no`."

---

## 1. DoorVerdict

**What:** answers "will they let us in?" for the group set in Going as. One component for cards, tiles, rows and the event page. The line always says why.

**Props**
```ts
interface DoorVerdictProps {
  state: 'yes' | 'if' | 'unknown' | 'no';
  text: string;                 // already composed by getDoorVerdict(), e.g. "Lets 4 guys in · ID needed"
  icon?: IconName;              // defaults by state; for 'if' pass the condition icon (shirt, clock, indian-rupee)
  look?: 'pill' | 'line';       // pill: hero card, event page. line: tiles and list rows
  source?: { kind: 'host' | 'gathr' | 'guests'; checkedAt?: string; count?: number };
  showSource?: boolean;         // pill only; tiles and rows never show the source
  onAsk?: () => void;           // unknown only: renders "Ask the venue" (Button subtle sm) on the right
  className?: string;
}
```

**States**
| State | Default icon | Pill look | Line look |
|---|---|---|---|
| yes | check | TagPill tone go (green fill, dark ink) | 13/18, 600, `go-text` |
| if | shirt / clock / indian-rupee (by condition) | TagPill tone light (white fill, dark ink) | 13/18, 600, `ink` |
| unknown | info | TagPill tone dark | 13/18, 600, `ink-muted` |
| no | x | dark pill with `limit-text` words and icon | 13/18, 600, `limit-text` |

**Anatomy (pill):** row, space-between. Left: the pill (icon 15 + text, TagPill sizing). Right: source line 11/14 `ink-faint` ("Set by the host", "Checked by gathr · 3 days ago", "From 12 guests"), or the "Ask the venue" button for unknown.
**Anatomy (line):** icon 16 + text, gap 4, one line, ellipsis.

**Rules**
- Words always carry the meaning; the colour only repeats it.
- `if` is white, never yellow (yellow means energy right now).
- At most two conditions in `if`.
- No full stop at the end.
- With no group set, use `unknown` styling for rule text ("Stags OK", "Couples only") so nothing claims "Lets you in" from group rules.

**Copy patterns:** yes "Lets {group} in · {bring-item}" · if "Lets {group} in · {cond1}, {cond2}" (line: "{Cond1}") · unknown "{Rule} unknown" · no "{Reason}".

**Accessibility:** the element's text is its accessible name; add a visually hidden "Door: " prefix. Icon `aria-hidden`.

---

## 2. NightTile

**What:** a small poster tile for browsing many nights in rails (and, as `layout="row"`, in the full list). Answers all five questions at a glance.

**Props**
```ts
interface NightTileProps {
  image?: string;               // organiser image; neutral placeholder when missing
  name: string;
  venue: string;
  time: string;                 // "8 pm"
  distance?: string;            // row layout only: "20 min"
  price?: string;               // "₹1,299", "Free"; omitted → "Price not listed"
  crowd?: Crowd;                // level from Booked so far
  verdict: Pick<DoorVerdictProps, 'state' | 'text' | 'icon'>;
  badge?: 'Promoted' | 'Live';  // one at most
  layout?: 'tile' | 'row';
  href?: string; onClick?: () => void;
}
```

**Tile layout (156 wide)**
1. Image 156 × 195 (4:5), radius 16, cover crop focused on the upper third, the gathr touch (grain 16%, 1px light edge). Neutral placeholder "Organiser image" when missing.
2. On the image, bottom-left 8/8: CrowdMeter `compact glass`. Top-left 8/8: Badge glass (Promoted) or Badge now with live dot (Live), one at most.
3. 8 below the image, text block (gap 2):
   - DoorVerdict `look="line"`
   - name: 15/20 600, one line, ellipsis
   - meta row, space-between: "{venue} · {time}" 13/18 `ink-muted` (ellipsis) on the left; price Jakarta 700 16 on the right ("Price not listed" 13 `ink-faint` when missing)

**Row layout (full list)**
Thumbnail 64 × 80 radius 10 · text column (DoorVerdict line, name 15/600, "{venue} · {distance} · {time}" 13 muted) · right column aligned end: price Jakarta 700 20, then CrowdMeter compact (not glass). Padding 12 0, divider `line` under each row.

**Rules**
- Solid; only the crowd chip and badge are glass (they sit on a photo).
- No buttons inside the tile; the whole tile is one link (no button inside a button).
- No friends' faces on tiles (that's the hero card's job); "{n} friends going" may replace the venue in the meta row when friends booked.
- Never a percentage.

**States:** default · pressed (scale 0.98, 120 ms) · focus (white ring) · loading (skeleton: image block + 3 bars) · sold out (CrowdMeter Full, verdict line unchanged, name 60% opacity).

**Accessibility:** one link; name = "{verdict text}. {name}, {venue}, {time}, {price}, {crowd level}".

---

## 3. NightRail

**What:** a titled horizontal row of NightTiles for one day.

**Props**
```ts
interface NightRailProps {
  title: string;                // "Tonight · 4 more", "Tomorrow · Sat", "Sunday"
  seeAllLabel?: string;         // "See all", "See all 6"
  onSeeAll?: () => void;
  children: React.ReactNode;    // NightTiles
  total?: number;               // when > shown tiles, append the See-all end tile
}
```

**Layout:** header row (title `section` Jakarta 16 left, Button subtle sm right), 12 below the tiles. Tiles in a horizontal scroller: left padding 16, gap 12, the next tile peeks from the right edge, scroll-snap to tile starts, no scrollbar. End tile when more exist: same size as a tile, `night-900`, radius 16, centred "See all {n}" (15/600) with arrow-right.

**Rules:** hide the rail when it has no tiles. At most 10 tiles before the end tile. Spacing between rails 36.

**Accessibility:** `role="list"` with `aria-label="{title}, {n} nights"`; tiles are list items; the scroller is focusable and scrolls with arrow keys.

---

## 4. GroupPill

**What:** the one place the home says who you're going with. Shows the active plan when there is one, otherwise the Going as group.

**Props**
```ts
interface GroupPillProps {
  state: 'plan-vote' | 'plan-booked' | 'group-set' | 'group-unset';
  people?: { name: string; image?: string }[];   // up to 4 faces
  title: string;
  line: string;
  onOpen: () => void;
}
```

**Layout:** full-width pill, min height 56, radius full, `night-900` with a 1px `line` border, padding 8 12 8 8. Left: up to 4 Avatars (32, initials when no photo) overlapping by 8 with a 2px `night-900` ring. Middle: title 15/20 600, line 13/18 `ink-muted`. Right: chevron-right 20 `ink-muted` (group-set shows the word "Change" 13/600 instead).

**States and copy**
| State | Faces | Title | Line |
|---|---|---|---|
| plan-vote | plan members | Friday plan · 4 guys, all 21+ | 3 of 4 voted · closes 8 pm |
| plan-booked | plan members | Friday · Bollywood Night | You're in · Show pass |
| group-set | you | Going as 4 guys, all 21+ | (shows "Change" on the right) |
| group-unset | user icon in a 32 circle | Who's going? | Add your group to check the door |

**Rules:** solid, never glass. Not violet (it's not a selection). One per screen, home only.

**Accessibility:** a single link/button; name = title + line.

---

## Patterns (compositions, no new component needed)

**HeroPick** — section title "Best for your group tonight" · DoorVerdict pill with source · VenueCard · Button brand lg block with the booking label. Gaps 10. The only violet button on the screen.

**GoingAsSheet** — Sheet + Chip row (Guys / Girls / Couple / Mixed group) + stepper rows (IconButton minus/plus around Jakarta 700 20 number on `night-800`) + under-21 Chips + note row + Button primary block + Button ghost block. Copy in the home spec, section 6.

**WeekEndCard** — `night-900` radius 24 card, centred: Sticker 96 with `bob` (the one floating sticker on the screen), title Jakarta 700 20 with the yellow full stop, line 15 `ink-muted`, Button primary with arrow-right.

---

## Existing components used unchanged

TopBar · TabBar · VenueCard · VenueHero (with `actionDisabled`) · CrowdMeter (row, compact, glass, widget) · CrowdBlock · TonightSoFar · TagPill · Chip · Button (brand, primary, subtle, ghost) · IconButton · Avatar · MoodTile · Sticker · Sheet · Badge · Toast · Icon.

New icons needed in the bundle if missing: `shirt`, `indian-rupee`, `id-card`, `info`, `minus`, `plus`, `chevron-right`, `ticket`, `message-circle` (all are in the release 23 list).
