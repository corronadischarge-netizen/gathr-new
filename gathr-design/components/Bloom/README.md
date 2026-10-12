# Bloom

The gathr gradient, kept for **occasions**. A soft, grainy, **irregular** glow that rises from the bottom and fills up to half the frame. It's built from 3–5 overlapping lobes of the six lights, blended in oklab, so it never reads as a circle. There are no dots or small lights beside it, and it doesn't move. The dark top half keeps room for the headline.

**Only use a bloom when an occasion is specified.** By default, no screen, card or post has one.

| Occasion | Where the bloom may appear |
|---|---|
| gathr launches and campaigns | the hero of the landing page, app store art, the campaign's social covers |
| gathr-hosted nights | that event's poster, its hero card and its announcement post |
| Big nights in the city (NYE, Holi, Diwali weekend, festival weekends) | the Tonight hero on that night, and the matching social cover |
| Wrapped and recaps | the recap cover and share cards |
| First-run onboarding | the first onboarding screen, shown once |

**Provide:** `recipe` and `at` (`bottom`, `low`, `center` or `top`). The parent needs `position: relative; overflow: hidden`.

| recipe | ramp, outside to core |
|---|---|
| `peak` | blue-500 → violet-500 → pink-300 → red-300 → yellow-300 |
| `uv` | violet-500 → violet-300 → pink-300 |
| `sundowner` | pink-500 → red-300 → yellow-300 |
| `comedown` | violet-500 → blue-500 → blue-300 → green-300 |

- Use one bloom per screen and one per carousel (the cover only). Never use one on regular listings, feed headers, venue cards, rows, chips or avatars.
- White text on a bloom must be 24px+ at 600, and never over the core.
- Rendered 1080 × 1350 PNGs for social and print are in assets/Gradients.
