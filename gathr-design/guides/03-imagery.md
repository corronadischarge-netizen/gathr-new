# Imagery

*(Image: Real flash photos, 3D objects and the sticker pack. See the live design system.)*

**Why:** real faces and real rooms are the proof behind "who's going" and "what's it like". Nothing staged ([brand book](https://claude.ai/artifact/UpE3wvgwzYqppeY1gwwVGk) §08).

## Photos

Real Pune nights: candid, flash-lit, friends mid-moment. Never stock, never posed, never AI crowds.

- **Show the night, not the bottle.** Pick shots of people and the room over shots of pouring drinks.
- Crop into `PhotoFrame`s (tilted ±8°, a thin glass edge, never a thick white stroke), `PhotoStack`s and `StoryCard`s.
- Text on a photo sits on scrim glass or the fade to black.

## 3D objects and the sticker pack

Two families in assets/Stickers:

| Family | Looks like | Use in |
|---|---|---|
| **Objects** (disco ball, headphones, cocktail, vinyl, ticket…) | clean, glossy, no text | the app: `MoodTile`, `MapPin`, event and plan cards, empty states |
| **Sticker pack** (red cup, CLUB ticket, late night bites, see you tonight pager…) | gathr marks, labels, slogans | social, posters, merch, onboarding collage |

**gathr marks on the pack.** Two marks replace the generic smileys and globe stamps:

- **Dot sticker:** a yellow disc with a black `g`. It's the logo's yellow full stop, blown up into a sticker.
- **Stamp:** a thin ring printed in the object's own ink. It holds the `gathr.` wordmark on larger surfaces (ticket, keytag, record sleeve) and a `g` on small ones.

Use one mark per object. Never a smiley face or a generic globe.

- One object per card in the app; two or three in a collage. Objects sit on dark tiles, never on colour fields in the app.
- Skip stickers that point at smoking or sex, and avoid making alcohol the hero.

## Organiser images

Event cards show the organiser's own 4:5 image (≥1080 × 1350, no text, logos or QR codes; subject in the upper half). gathr adds the same touch to everyone: crop, 16% grain, fade to black over the bottom 60%, 24px corners. gathr never recolours, filters or stickers an organiser's art. `ImageSpec` is the upload guide.

- No clean image yet: use a venue photo and show the text-heavy flyer as the Poster on the event page.
- Under 1080 px or heavily compressed: block publishing and ask for a re-upload.

## Avatars

The person's real photo, or centred initials on a grey disc. Never a silhouette.

- **Vibe sticker:** each person can pick one 3D object (disco ball, headphones, vinyl…) that sits on their avatar's corner (`Avatar sticker`). It's how gathr avatars look different from every other app.
- A shiny ring (`RingAvatar`) means something new (violet) or going (green).
- Shape-cut avatars (flower, arch) are retired.
