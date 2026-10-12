# TopBar

The screen header.

- **Home:** your photo on the left, glass icon buttons on the right.
- **Detail screens** (`glass`): one liquid-glass capsule holding back, title and actions.

**Provide:** `avatar` and `avatarImage`, or `back`; `title`; `glass`; `actions` (icon and label pairs).

- The glass uses the same recipe as the TabBar: a bright top edge, blur, saturation and a soft shadow. It's built to sit over photos.
- The title is 16px, weight 600. Icon buttons are 44px and always labelled.
- With neither `avatar` nor `back`, the wordmark shows.
- Use `glass` once content scrolls under the bar.
