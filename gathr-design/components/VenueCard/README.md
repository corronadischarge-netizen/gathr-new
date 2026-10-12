# VenueCard

The core card: a photo with glass overlays (live badge, save and crowd), then solid details below.

**Provide:** `name`, `area`, `distance`, `vibes`, `crowd`, `friends` (names) or `friendsPeople` ({name, image, sticker}) and `friendsTotal`, `doorTime`, `cover`, `live`, `badge`, `image` (a URL), `saved`, and `hue` (the tint of the placeholder when there's no photo).

- Glass lives on the photo. The card body stays solid so it's easy to read.
- Until a real venue photo is supplied, the media block shows a neutral dark placeholder with a small image icon. It never shows a gradient; blooms are for heroes and feature cards.
- Keep it to two lights: brand plus one functional hue beyond the crowd meter.
- **Body: three rows, each a left/right pair at one size, both edges aligned to the card padding:**
  1. **What + how much:** the name (Jakarta 600, 20px) on the left, the `cover` price (Jakarta 700, 20px, no fill) on the right edge.
  2. **Where:** area · distance · vibes (13px, muted).
  3. **Who + when:** FriendsGoing on the left, a clock icon and `doorTime` on the right edge (both 13px, 500).
