# CrowdMeter

**Booked so far:** how full a night will be, from bookings on gathr against a cap **verified by gathr**. It's about people, never the vibe; the vibe lives in `FactList` ("The room").

**Provide:** `booked` and `cap` (the level is worked out for you), or `level` alone; `variant`, `updated`, `revealAt`, `compact`, `glass`.

| Level | Share of the cap booked | Colour | Line |
|---|---|---|---|
| Early | under 25% | grey | Few booked yet. Plenty of room |
| Filling up | 25–59% | green | Easy to get in |
| Buzzing | 60–84% | yellow | Good crowd. Short wait at the door |
| **Packed** | 85–99% | yellow | Peak night. Expect a queue |
| Full | sold out | red | Sold out. Only list and pass holders get in |

- **Packed is the high point**, so it's yellow (energy right now). Red is only for Full, the one real limit.
- **Widget** (`variant="widget"`): eyebrow "Booked so far", the level word (Jakarta 700, 20px), a 60-dot grid (1 dot = 1/60 of the cap, lit from the bottom), then "**412 of 480** spots booked". Add `updated` for the trust line.
- **Row** (default): five bars, the word and the line. Use it in lists, cards and sheets.
- **People, never a percentage.** The thresholds are internal.
- **Under 50 bookings** (`revealAt`), the count hides and the level line shows instead.
- **No cap** (walk-in venues): no level and no dots, just "120 booked tonight".
- **The cap** is checked against the venue's licensed capacity and locked 48 hours before doors. If a host lowers it later, levels keep using the original cap.
