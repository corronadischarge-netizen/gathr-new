# Badge

Short status labels in caps (11px, weight 600).

**Two looks, both flat** (no gradient, no gloss; badges are the one colour fill without the shine):
- **Solid** (default): one flat fill, the hue's fill step (yellow, green and red -300; violet -500). The text is night-950 on yellow, green and red, and white on violet.
- **Transparent** (`look="tint"`): a flat see-through wash of the hue (20%) with a 1px hue edge. The text is the hue's -100 step. Use it on dark cards when the solid looks too loud.

**Provide:** `tone`, `look`, `live` (adds the live dot, the one functional dot in the system) and a 1–2 word label.

| tone | hue | meaning | example |
|---|---|---|---|
| `now` | yellow | live right now | LIVE |
| `go` | green | booked, confirmed | ON THE LIST |
| `limit` | red | capacity, age, errors | SOLD OUT |
| `brand` | violet | gathr's pick, one per screen | GATHR PICK |
| `neutral` | flat night-800 with a night-700 edge | any other fact | 12 GOING · 21+ · FILLING FAST |
| `glass` | white on scrim | a fact on a photo | EPISODE 7 |

- Contrast is 4.9:1 or more on every hue, in both looks.
- Use one coloured badge per card at most.
