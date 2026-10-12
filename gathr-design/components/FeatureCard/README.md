# FeatureCard

The hero card at the top of a feed, used for tonight's pick or a curated collection.

**By default it's image-led.** It shows the collection's lead image (a venue or event photo), fading into black, with the copy and a small white pill on the fade. Add `occasion` on specified occasions only (a gathr-hosted night, NYE, a launch), and the image is replaced by a grainy bloom in `recipe`.

**Provide:** `image`, `kicker` and `kickerIcon`, `title`, `body`, `action` and `actionIcon`, and optionally `occasion` with `recipe`.

- Use one per screen. The title is 22px at most.
- The default preview shows the image placeholder. The second card shows the occasion version.
