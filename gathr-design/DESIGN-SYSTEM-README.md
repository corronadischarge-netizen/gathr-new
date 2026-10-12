*(Image: gathr at a glance: photo stack, mood tiles, stickers on black. See the live design system.)*

**gathr is Pune's going-out app for 18–30s.** Going out is an art form and most people are doing it wrong. **The promise: you'll know the room before you get there.** The why, the logo and the story live in the [brand book](https://claude.ai/artifact/UpE3wvgwzYqppeY1gwwVGk); this system is how it gets built.

## How the promise shows up

Every component answers one of four questions before you leave the house. If a piece doesn't help answer one, it doesn't ship.

| You want to know | gathr shows it as | Built with |
|---|---|---|
| How full will it be? | booked so far against a cap verified by gathr: "Packed · 412 of 480", never a percentage | `CrowdMeter`, `TonightSoFar` |
| Who's going? | real faces on the card, "Riya + 2 friends going" | `FriendsGoing`, `RingAvatar` |
| Is it on right now? | yellow means energy right now: live, or a buzzing room | `Badge tone="now"` |
| What will it cost? | the price in bold type, "₹499, all in" | `VenueCard`, `VenueHero` |

## The feel in five

| | Rule | In practice |
|---|---|---|
| 1 | **Black first** | 50%+ of every feed is `bg`. Photos, friends and objects are the lights. |
| 2 | **Real over polished** | Candid, flash-lit photos. Never stock. Organiser art keeps its own style. |
| 3 | **Faces are proof** | Who's going sits on the card itself: `RingAvatar`, `FriendsGoing`, `StoryCard`. |
| 4 | **Objects bring the colour** | Dark tiles, 3D `Sticker`s on top. The UI itself uses four colours. |
| 5 | **Say less** | A title, one meta line, one button. Short, specific, sentence case. |

## Where to look

| Section | What's in it |
|---|---|
| Colour & type | the four app colours, the type ladder, contrast |
| Surfaces | black, glass, gradients (occasions only), depth, motion |
| Imagery | photos, the 3D objects and sticker pack, collage, organiser images |
| Voice | how gathr talks to Gen Z, plus the copy library |
| App | screen recipes and which component to use |
| Brand moments | social, print, web and occasions |
| Checklist | run it before anything ships |

## Logo

**gathr.** (option J76): Plus Jakarta Sans Bold, lowercase, outlined, tracked −6%, with **one** circle after the r. It's the only decorative dot: no round bullets or dot separators (the marquee uses a short dash). There are two functional dots: the live dot inside a badge and the bell's "something new" dot. The the typed middle dot (·) in meta lines is punctuation.

- The dot is yellow-300 on dark, violet-500 on light (`logo-dot`). Its diameter is 1.25 × the stem.
- Clear space = the x-height. Minimum 16px on screen, 5 mm in print.
- Use `Wordmark` in UI and the SVGs in assets/Logos elsewhere. Never retype it.


---

## Consuming this system (generated — do not edit)

Every path named below is under `project/` in this design system: read `project/api/tokens.md`, not `api/tokens.md`.

`components/bundle.js` defines `window.Gathr` (32 components); `components/bundle.css` is its stylesheet; `tokens.css` is every token as a CSS variable plus `@font-face` for the fonts. `components/bundle.css` reads its variables from `tokens.css`. The bundle needs react 18 (not packed in this system: bring your own copy) (`window.React`), react-dom 18 (not packed in this system: bring your own copy) (`window.ReactDOM`), loaded before it. Build any UI by mounting these components; never hand-build a control or draw an icon the system provides.

- **Standalone page:** inline `tokens.css` and `components/bundle.css` in a `<style>`, then the library files and `components/bundle.js` as classic scripts (a file containing `</style`, `</script` or `<!--` breaks an inline element: write the sequence `<\/style`, `<\/script` or `\x3C!--` in your copy, or load that file by URL).
- **Design canvas:** bring `components/bundle.css`, `components/bundle.js` and `components/index.d.ts` (for the editor’s props panel) onto the canvas in full, as the canvas type’s design-system components reference says (a server-side copy first where it offers one); load the stylesheet before the script; skip the library files (the artboard supplies React); mount with `<x-import component-from-global-scope="Gathr.<Comp>" …>`.
- **Slides deck, or any surface that cannot run the bundle:** tokens and fonts — the values are on `api/tokens.md`; the deck takes `tokens.json` by file path for its colour pickers, and fonts as “Fonts” below says.

Fonts: `tokens.css` loads each font from its file, by path.

- **Design canvas:** copy `tokens.css`, `fonts/plus-jakarta-sans-latin-600-normal.woff2`, `fonts/plus-jakarta-sans-latin-700-normal.woff2`, `fonts/dm-sans-latin-300-normal.woff2`, `fonts/dm-sans-latin-400-normal.woff2`, `fonts/dm-sans-latin-500-normal.woff2`, `fonts/dm-sans-latin-600-normal.woff2`, `fonts/dm-sans-latin-700-normal.woff2`, `fonts/dm-sans-latin-300-italic.woff2` and `fonts/dm-sans-latin-400-italic.woff2` to the same paths under the canvas’s `project/ds/<folder>/` (`<folder>` is the folder you install this system under; `fonts/plus-jakarta-sans-latin-600-normal.woff2` lands on `project/ds/<folder>/fonts/plus-jakarta-sans-latin-600-normal.woff2`), in the same call that installs this system. Link that copy of `tokens.css` in the artboard’s `<head>` as `ds/<folder>/tokens.css`, or as Design’s instructions say for an artboard in a folder. If the install’s reply leaves a font out, bring that font in as for any other page.
- **Slides deck:** for each family you use in the deck (`faces` holds at most the number of typefaces Slides’ `deck-files.md` gives), install its file with the system and name the path it lands on as that family’s `src` in `project/deck.json` `faces`, under the key in the Slides column. A deck takes a font as a file only under the rule in Slides’ `fonts.md` (no space or leading underscore in its path, for two): any other font, or one kept by id, is uploaded as `fonts.md` says.
- **Any other page:** one file per family is enough (below: the upright face nearest regular weight; bold and italic synthesize). Fetch it as the fetch column says (Artifact tool `read`, that id or path as `path`), upload it as an asset (`publish`, `file_path`, `asset:true`) and declare it with an `@font-face { font-family: "<family>"; src: url(<uploaded>) }` rule.

| family | file | fetch | CSS | Slides `faces` key |
| --- | --- | --- | --- | --- |
| Plus Jakarta Sans | `fonts/plus-jakarta-sans-latin-600-normal.woff2` (weight 600) | `read` the file with `project/` in front | `var(--font-display)` | `plus-jakarta-sans` |
| DM Sans | `fonts/dm-sans-latin-400-normal.woff2` (weight 400) | `read` the file with `project/` in front | `var(--font-display)` | `dm-sans` |

**Read, per thing:** a component’s props, parts and examples: `api/components/<Comp>.md`; token values: `api/tokens.md`; stored assets and their paths: `api/assets/<Group>.md`. After this README, fetch the cards and fonts you need in ONE message as parallel calls — none depends on another.

**Two rules.** Before you use a thing — a component, a token group, an icon, an asset — read its card from the index below; a value you did not read from a card is a guess. `tokens.json`, `manifest.json`, `components/index.d.ts` and `design-system.json` are sources for tools: hand them over. `components/<Comp>/README.md` and `assets/<Group>/README.md` are the long-form second read a card links to; `SKILL.md` and `artifact-type/` beside them are authoring guidance, not needed to consume the system.

## Index (generated — do not edit)

**Tokens**

- `api/tokens.md` — Every token: surface, text, fill, palette, type, spacing, radius, shadow, size, breakpoint, blur, opacity, tempo. (18.3k)

**Icons and assets**

- `api/assets/Logos.md` — 3 files, by asset id. (1.4k)
- `api/assets/Gradients.md` — 5 files, by asset id. (1.8k)

**Components** (`api/components/<Comp>.md`, 36; 4 of them showcase pages)

- **Brand**: `Wordmark` — The gathr logo: gathr. in Plus Jakarta Sans Bold (option J76), converted to vector outlines, with one true circle after the r · `Icon` — Lucide outline icons at a 1.75 stroke
- **Actions**: `Button` — Flat pill buttons: no sheen, gradient or glow · `IconButton` — A round 48px icon button, like the search and heart buttons in the music-app reference · `Chip` — Filter chips: filled dark pills that turn violet when selected · `SearchField` — A glass search pill
- **Status**: `Badge` — Short UPPERCASE status labels · `CrowdMeter` — The crowd indicator: how busy a place is, in human words · `Avatar` — A person's display picture in a circle, or their initials on a neutral disc when they haven't added one · `FriendsGoing` — A stack of friends' display pictures and a pink count of friends going · `ProgressBar` — The onboarding progress line: a white fill on a dark pill track · `PageIndicator` — Thin segments under a hero carousel
- **Gradient**: `Bloom` — The gathr gradient, kept for occasions
- **Glass**: `TopBar` — The screen header: an avatar, wordmark or back button on the left and round glass buttons on the right · `TabBar` — The floating glass tab bar: five icons in a frosted pill that floats space-4 above the safe area · `Sheet` — A bottom sheet in strong glass, used for venue previews from the map, filters and quick actions
- **Content**: `VenueHero` — The venue detail header · `VenueCard` — The core card: a photo with glass overlays (live badge, save and crowd), then solid details below · `FeatureCard` — The hero card at the top of a feed, used for tonight's pick or a curated collection · `RankCard` — A ranked card with a giant ghost numeral, from the App Store "Top played" reference · `EventCard` — An image-first card for carousels · `EventRow` — A listing row with a rounded thumbnail, title, meta and a status badge or chevron button · `MapPin` — A venue on the dark map, as a sticker pin: a neutral rounded tile with the venue's 3D sticker popping out of it, a small tail, and a dark label with the venue…
- **Expression**: `VibeTag` — A speech-bubble sticker from the onboarding screen ("guestlists", "sundowners", "goodtime") · `PhotoFrame` — A collage photo with a thin glass edge, a radius-md corner and a slight tilt, for onboarding and social collages · `ShapeAvatar` — A person or DJ cut into a playful shape (circle, arch, flower or pill) on a colour field, from the "Featured members" reference · `PillChain` — Event info as a chain of pills, from the festival-poster reference: name, date, arrow, time and venue, with an "echo" of fading circles
- **Data**: `StatBubbles` — Numbers as circles sized by value, from the bubble data-viz reference · `DotGrid` — A 10 × 10 waffle of dots showing one percentage, with a big numeral
- **Social**: `SocialSlide` — The Instagram and Threads carousel template, authored at 1080 × 1350 (or 1080 × 1920 for stories) and scaled for preview
- **Print**: `EventPoster` — The event poster at A-series proportion (1080 × 1527 on screen, or A3/A2 in print)
- **Web**: `SiteHeader` — The website's top bar: a floating glass pill with the wordmark, up to three links and one white CTA
- **Screens**: `ImageSpec` (showcase page) — ImageSpec · `OnboardingScreen` (showcase page) — OnboardingScreen · `TonightOccasion` (showcase page) — TonightOccasion · `TonightScreen` (showcase page) — TonightScreen
