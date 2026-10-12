# Sheet

A bottom sheet in strong glass for quick venue actions.

**Provide:** `title`, `subtitle`, `onClose` and children.

**The standard venue sheet, top to bottom:**
1. Badges (Live, Filling fast, 21+)
2. A CrowdMeter row
3. FriendsGoing with faces
4. An action row: the price (Jakarta 700, no fill), a glass directions button, and the brand CTA filling the rest

- Always build it from the current components; don't restyle them inside the sheet.
- `radius-xl` top corners, always with the grabber. One primary action at most.
