# NightTile

A small poster tile for browsing many nights in a rail, or, with `layout="row"`, a row in the full list. It answers all five questions at a glance: will they let us in, how full, what, where and when, what it costs.

**Provide:** `name`, `venue`, `time` ("8 pm"), `image` (the organiser image; a neutral placeholder holds the space when missing), `price` ("₹1,299", "Free"; omitted shows "Price not listed"), `crowd` (the Booked so far level), `verdict` (`{ state, text, icon }` from the door verdict), and `onClick` or `href`. Optional: `badge` (`Promoted` or `Live`, one at most), `distance` (row only, "20 min"), `loading` (skeleton in the real shape).

**Tile (156 wide), release 25:** a tile is read in one glance, so it answers three things in order: **what is it** (the night's name), **where and when, and what it costs**, and only then **anything the door asks of you**.
1. Image 156 × 195 (4:5), `radius-md`, cropped to the upper third, with the gathr touch (grain, a 1px light edge, a functional fade at the bottom). On it: `CrowdMeter` compact glass bottom-left; the badge top-left.
2. 8 below: **the name** (15/20 600, `ink`, one line). It leads: organisers sell the night, and the venue sits right under it.
3. "{venue} · {time}" (13 `ink-muted`) with the price on the right (Jakarta 700, 16, `ink`).
4. **The door line only when it asks something of you** (`if` or `unknown`): "Formals only", "Stag rules unknown". A `yes` shows nothing on a tile: rails only hold nights your group can get into, so a green line on every tile is noise. Nights that say `no` never reach a rail.

That's three lines of text at most, with one white name and one white price.

**Row (`layout="row"`):** 64 × 80 thumbnail (`radius-sm`) · verdict line, name, "{venue} · {distance} · {time}" · on the right a **fixed 120px column**: the price (Jakarta 700, 20) over a compact `CrowdMeter` (not glass), both left-aligned in it, so the crowd bars start at the same place on every row whatever the price or crowd word. Rows always show the door line, `yes` included, because the full list mixes every verdict. A `line` divider under each row.

**Rules:**
- Solid. Only the crowd chip and the badge are glass (they sit on a photo).
- The whole tile is one link; never a button inside it.
- No friends' faces on tiles (that's the hero card's job).
- Never a percentage. Sold out: Full on the crowd chip, the name at 60%.
- Pressed scales to 0.98; focus shows the white ring.

**Accessibility:** one link whose name reads "{verdict}. {name}, {venue}, {time}, {price}, {crowd level}".
