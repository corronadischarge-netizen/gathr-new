# Icon · filled

Lucide only ships outline icons, so gathr builds the solid versions from the same Lucide geometry. The outline shape is filled, and its inner details (the door of the house, the hole in the pin, the tick in the check) are cut out as true holes, so they work on any background. The stroke weight, corners and proportions match the outline set exactly.

**Use:** `<Icon name="heart" filled />`. The components already switch automatically: the active tab in `TabBar`, an `IconButton` with `active` (save or like), and the like button in `PhotoStack`.

**Filled versions available (30):** bell, bookmark, calendar, calendar-check, camera, circle-check, compass, eye, flame, heart, house, image, lock, map, map-pin, martini, message-circle, mic, moon, music-2, send, settings, shield-check, sparkles, star, tag, ticket, user, users, zap.

**Rules:**
- **Filled means on.** Use it for the active tab, saved, liked, booked, going and the selected pin. Everything else stays outline.
- **Same name, same size.** Switch the `filled` prop; never swap in a different icon for the on state.
- **Need a filled version that isn't here?** It's built from the Lucide icon in the bundle: the body is filled, details are cut, and any outer strokes stay as lines. Don't draw a new shape.
