# PillChain

Event info as a chain of pills, from the festival-poster reference: name, date, arrow, time and venue, with an "echo" of small overlapping pills fading out (never dots).

**Provide:** `rows`, an array of rows. Each segment is `{label, tone}` (tone is `white`, `outline` or a hue), `{arrow: true, tone}`, or `{echo: hue}`. Also `scale`, where 1 = 16px.

- Use it for posters, event headers, social covers and web heroes.
- Labels are sentence case; names keep their own spelling.
- Use no more than 3 rows and 2 hues plus white.
- **v14:**
  - Every pill uses the same face and weight (Jakarta 600).
  - The arrow is a Lucide icon centred in its circle, not a text glyph.
