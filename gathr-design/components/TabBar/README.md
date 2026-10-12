# TabBar

The floating main navigation, made of **liquid glass**: a bright top edge, 24px blur, extra saturation and a soft shadow, so it reads over any photo.

**Provide:** `active` (`tonight`, `map`, `search`, `plans`, `you`) and `onChange`.

- **Motion:** when the tab changes, a violet shine pill slides to the new tab with a slight spring (460ms), and the new icon pops in filled. The old icon turns back to outline. Reduced motion turns both off.
- Five equal slots, 68px tall, with 52px targets.
- The preview cycles through the tabs on its own to show the motion.
- It floats `space-4` above the safe area and never docks flat to the bottom.
- Tabs are icon-only with accessible labels; no badges or counts.
