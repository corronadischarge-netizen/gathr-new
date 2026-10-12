# Surfaces

*(Image: Black first, glass on photos, gradient for occasions. See the live design system.)*

**Why:** black first keeps the signals readable at 11 pm on a dim phone. Light comes in three kinds, shine, echo and bloom, each with one job ([brand book](https://claude.ai/artifact/UpE3wvgwzYqppeY1gwwVGk) §05).

## Black first

| Surface | Feeds | Detail screens | Onboarding |
|---|---|---|---|
| Black (`bg`) | 50%+ | 45%+ | 45%+ |
| Photos | ≤35% | ≤40% | ≤25% |
| Solids | ≤12% | ≤15% | ≤10% |
| Colour fills | ≤5% | ≤5% | ≤12% |
| Bloom | 0 (≤15% on an occasion) | 0 (≤35% on an occasion) | first run only |

32–44px between sections, 8–14px inside a group, five groups max in the first viewport.

## Glass

Glass floats **over** photos and content; it is never the content.

- **Liquid glass recipe:** a white top-edge highlight, a 1px white edge, 24px blur at 180% saturation and a soft drop shadow. It's used for the TopBar, the TabBar, glass buttons and sheets, always over photos or colour, never glass on glass.
- **Always glass:** tab bar, top bar on scroll, icon buttons, search, sheets, and anything on a photo (`TagPill tone="glass"`, the `StoryCard` status).
- **Never glass:** card bodies (including the VenueHero card and the Booked so far widget, which are solid night-900), list rows, forms, tickets.
- **Two glasses:** liquid glass (above) for chrome. Scrim glass (dark, 60%+, white text only) for small text pills on busy photos (`TagPill`, `Badge tone="glass"`). Never stack glass on glass.

## Three kinds of light

| Kind | What | Where |
|---|---|---|
| **Shine** | the finish on colour fills, from the hue's own steps (`--shine-<hue>`) | expression fills only: vibe tags, pill chains, stat bubbles, the pill pattern, social fields. Never on selections, buttons or status badges, which are flat |
| **Echo** | the brand pattern (`EchoPattern`) | brand surfaces: end slides, share cards, merch, splash |
| **Bloom** | heat rising from the bottom (`Bloom`) | occasions only, below |

### The bloom is for occasions

Off by default. **Functional fades are allowed everywhere** and don't count as a bloom: the fade to black under a photo, behind the tab bar, and behind pinned bottom buttons, plus the **screen glow**, the faint radial light at the top of each screen's background (`.g-page-depth`). Anything else is a bloom, only for launches, gathr-hosted nights, big city nights (NYE, Holi, Diwali, festival weekends), recaps and the first onboarding screen. One per screen.

- **Shape:** irregular, rising from the bottom, up to half the frame. Never a circle, never a dot beside it, never animated.
- Recipes: `peak`, `uv`, `sundowner`, `comedown` (`Bloom`, assets/Gradients).

## Depth and motion

- Big surfaces carry a faint light top-left and grain. **Expression fills (vibe tags, pill chains, stat bubbles) carry the hue's shine. Selections, buttons, status badges and grey surfaces stay flat. Nothing glows** (the screen glow is light on the background, not on an element).
- Every animation explains a change: screens slide, selections settle, a booking draws a tick. Nothing pulses. **One sticker per screen may bob** (`bob`, or the selected MoodTile); every other sticker is still. Reduced motion stops all of it.
