# MapPin

A venue on the dark map, as a sticker pin: a neutral rounded tile with the venue's 3D sticker popping out of it, a small tail, and a dark label with the venue name and its crowd word.

**Provide:** `level`, `label`, `selected`, and `sticker` (the venue's 3D icon URL). Always pass a sticker; `icon` (a Lucide name) is only a fallback while the venue has no art. Pass `showLabel={false}` below zoom 14.

- Tiles are neutral night greys with a thin line. The 3D sticker brings the colour. Never tint a pin with a venue hue.
- **Selected:** the pin grows, the tile turns flat violet and the label turns white. No glow.
- Pins closer than 58px merge into one stacked group pin with a count; tapping it zooms in.
- The map has no heat blobs and no glows.
