# EventCard

An image-first card for carousels. The image is always the organiser's real event image (flyer art, artist press photo or venue photo), and gathr adds a light, consistent touch on top.

**Provide:** `image` (the organiser's event image), `title`, `kicker`, `meta`, `badge` with `badgeTone` and `live`, and `action` (the CTA label, default "Get on the list").

**The gathr touch** is added automatically to every image:
1. A 4:5 cover crop, focused on the upper third.
2. A brand grain film at 16%.
3. A fade into night-950 over the bottom 60%, so gathr's type and CTA always sit on black.
4. A 1px light edge and 24px corners.

We never recolour, filter or crop out the organiser's own look. Their art stays theirs.

- Show cards in a horizontal carousel, 272px wide with `space-3` gaps. The next card always peeks in from the right edge.
- Until an image is uploaded, the card shows a neutral dark placeholder labelled "Organiser image · 4:5". The previews use this on purpose.
- Use one badge at most, top left. Don't add crowd meters, avatars or extra buttons.
- The upload rules for organisers are in the ImageSpec card and the Organiser imagery guide.
