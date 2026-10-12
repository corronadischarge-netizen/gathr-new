# Changes since release 21

Your app's last package was release 21 (12 Oct). This package is release 23 (12 Oct), with release 24 proposed.
Work through these one area at a time. Check each in the browser before the next.

## Release 22 · host mode colour

1. **Host mode is yellow.** Wrap every host screen in `.g-host`. Superseded in detail by item 2 below; apply release 23's version.
2. **Green no longer means host mode.** Remove any green used for the host tab bar, the "Switch to hosting" card or host selections.

## Release 23 · from the Seeker app

3. **Host mode selections and main buttons (decided).** In host mode, every selection is yellow-300 with night-900 text: the selected tab and its sliding pill, chips, toggles, tick boxes, picked rows. The host's main buttons ("List a night", "Submit for review") are yellow-300 too. Status colours are unchanged: green in, red no entry, scanner amber "check". Code: `.g-host` wrapper (see `components/bundle.css`, "r22 — Host mode").
4. **Selected states are flat (decided).** Chips, the tab pill, tiles, map pins, rings, the brand button and Update's Accept are one flat fill: no shine, no edge highlight, no glow. The shine is only for expression pieces (vibe tags, pill chains, stat bubbles, the pill pattern, social, tickets).
5. **Screen glow (decided).** The faint radial glow at the top of each screen's background (`.g-page-depth`) is allowed, alongside the functional fades (under photos, behind the tab bar, behind pinned bottom buttons).
6. **The bell's dot.** The bell's "something new" dot is the second functional dot, beside the live dot. No other decorative dots.
7. **Update component:** new `name` prop on `Update` and `UpdateLead` (shows initials when there's no photo); new `onOpen` on info rows (the whole row becomes a native button; Enter and Space work).
8. **Toast is the only toast.** Every short message ("Removed from Plans", "Logged out") and every Undo uses `Toast`. Placement: 32px up from the bottom, or 12px above the tab bar (`aboveTabBar`). Timing: 2.4 s, or 5 s with an action. One at a time, one line, no full stop, at most one action.
9. **Fix:** small button labels are 15px (the Button README used to say 13).

## Already in release 21, now consistent everywhere

10. **Type:** `headline` 15/20 DM Sans 600 for names of things and every heading inside a card; `section` for page headings; `title` for sheet titles and the one name on a big media card; `body-light` 15/20 300 for single-line tips beside an icon; `caps` 11/600. Only 32, 20, 16, 15, 13, 11 in the UI.
11. **tokens.css regenerated** in this package so it matches tokens.json (it still said headline 16/22 and caps 700 in the live export).

## Components in the live system your release 21 package didn't document

Check whether the app has each; build any that are missing from its README and `index.d.ts`:

12. **MoodTile:** dark tile with a 3D object breaking out of the top, for picking a vibe or category. Selected turns violet and its sticker bobs.
13. **Sticker:** a 3D object from `assets/Stickers`. One per card in the app; one bobbing sticker per screen at most.
14. **TagPill:** small pill with an icon (tones light, glass, dark, go, brand). Used for the door verdict until DoorVerdict exists.
15. **RingAvatar, StoryCard, PhotoStack, ReactionBubble, CommentBubble, CardDeck, EchoPattern, Ticket (+ TicketColours, TicketWall), IconFilled:** expression and social pieces. Only needed when a screen calls for them.
16. **ActionBar** (from release 21): up to two round solid icon buttons beside one full-width main button.

## Proposed · release 24 (for home v3)

Not in the live design system yet. Specified in `proposed/release-24-new-components.md` (same as `specs/ds-new-components.md`):

17. **Spine:** a fifth question, first: "Will they let us in?", answered by `DoorVerdict`.
18. **DoorVerdict:** yes / if / unknown / no, pill and line looks, source line, "Ask the venue".
19. **NightTile:** 156-wide poster tile (and a row layout for the full list).
20. **NightRail:** titled horizontal row of NightTiles with "See all".
21. **GroupPill:** the group/plan pill at the top of the home.
22. **Checklist line:** every night shows a DoorVerdict for the current group; icon + words, never colour alone; red only for `no`.
