# StoryCard

A tall photo card for spotlighting one night: friends above a centred title, all on the fade.

**Provide:** `image` (real photo), `title` (the organiser's name for the night), `meta` (day · time), `place`, `people` (`{name, image}`, up to 4), `status` ("You're in", "Saved").

**Where it goes:** it's the card for a night that's **yours**: booked or saved, with the people going with you.
- **Right after booking** (the peak): the success screen shows the StoryCard with "You're in" and your group's faces, with "Show pass" and "Share" under it. It answers "who am I going with?" before the pass answers "how do I get in?".
- **Plans tab:** upcoming booked nights as StoryCards in a `CardDeck`, soonest first.
- **Sharing:** the same card is the picture sent to the group chat ("We're in. Kukoo, Thu 9 pm").

Not for browsing: the feed uses `EventCard`, rails use `NightTile`.
