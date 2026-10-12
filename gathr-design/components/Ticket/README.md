# Ticket

A collectible ticket built like gathr's social assets:
- the wordmark top left, with a vibe tag top right
- the event name
- a "day date → time" pill row, and the venue on its own row
- a stub with a centred code and "Admit one #number"

**Provide:**
- `hue`: one of the six, per event.
- `name`: the organiser's spelling.
- `kicker`: the vibe tag, such as the series or vibe.
- `day`, `date` and `time`: these become the pill row.
- `venue`.
- `number` and `code`.
- Gathr-hosted nights: add `hosted` for the yellow full stop, a black ground and a still `Bloom` in `recipe`.

**Colour pairs** (ground → pop, used for the vibe tag and arrow):

| Ground | Pop | Ink (name and code) |
|---|---|---|
| violet-500 | yellow-300 | white |
| blue-500 | yellow-300 | white |
| red-300 | yellow-300 | black |
| pink-300 | violet-500 | black |
| green-300 | violet-500 | black |
| yellow-300 | violet-500 | black |
| night (hosted) | event hue | white |

**The code:**
- It's printed straight on the ground in the ticket's ink, with no tile.
  - Black modules on the light grounds: red, pink, green and yellow.
  - White modules on violet, blue and night.
- Every pairing keeps at least 4.5:1 contrast. The stub stays flat, with no bloom or pattern behind the code, and the empty space around it is its quiet zone.
- It's 128px at scale 1 and centred.
- The real code comes from the ticketing backend; the preview pattern is a placeholder.
- Light-on-dark codes read in iOS Camera and Google Lens. Set door scanners to accept inverted codes.

**Rules:**
- **Minimum information:** name, day and date, time, venue and code. No images, no big date, no line-ups or prices.
- **No italics and no 3D stickers** on the ticket. The colour carries it.
- **Emoji** stay off the ticket; they live in friends' reactions around it.
