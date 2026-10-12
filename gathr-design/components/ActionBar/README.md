# ActionBar

One row at the bottom of a detail screen: up to two round **solid** icon buttons beside one **full-width main button**.

**Provide:** `icons` ([{icon, label, onClick}], at most two; every icon button needs its `label`), `main` ({label, icon, variant, disabled, onClick}).

- Use it when two text buttons won't fit at 16px ("Get directions" + "Get on the list").
- The main button is violet when it books, white otherwise. Icon buttons are 52px circles with 24px Lucide icons.
- Icons for the secondary actions: `navigation` (Get directions), `calendar-plus` (Add to calendar), `share-2` (Share).
