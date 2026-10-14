# NightRail

A titled horizontal row of `NightTile`s for one day: "Tonight · 4 more", "Tomorrow · Sat", "Sunday".

**Provide:** `title`, the tiles as children, and optionally `seeAllLabel` + `onSeeAll` ("See all", "See all 6") and `total` (all nights that day).

**Layout:** the title (`section`, Jakarta 16) on the left and a subtle small "See all" button on the right, 16 from the edges; the tiles 12 below, starting at x = 16 with a 12 gap. The next tile peeks from the right edge and tiles snap to their start; no scrollbar. When `total` is more than the tiles shown, a "See all {n}" end tile (same size as a tile, `night-900`, 15/600 with an arrow) closes the row.

**Rules:**
- Hidden when it has no tiles.
- At most 10 tiles before the end tile.
- Rails sit 36 apart on a screen.
- A sideways swipe never scrolls the page or triggers back.

**Accessibility:** a list labelled "{title}, {n} nights"; tiles are list items; the row takes keyboard focus and scrolls with the arrow keys.
