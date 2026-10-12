# Update

One row on the Updates screen. Built for a quick glance and one strong action. Use with `UpdateGroup` ("Needs you", then "Earlier") and `Toast` for undo.

**Provide:** `kind`, `title`, `meta`, `time`, `action`, and one lead: `object` (a night's 3D object), `image` (a person's photo; add `name` and with no photo the lead shows their initials, never a silhouette) or `icon` + `tone` (`go`, `limit`, `brand`, `wait`). Handlers: `onAction`, `onAccept`, `onDecline`, and `onOpen` for `info` rows.

**The buttons are the real answers:**

| kind | When | End of the row |
|---|---|---|
| `task` | You must do something: night sent back, booking needs payment | one white button: "Fix", "Pay" |
| `chance` | Time-sensitive and optional: few tickets left on a night you saved | one violet button: "Book" |
| `decide` | Someone is waiting on a yes or no: friend request, plan invite | Decline (✕) and Accept (✓), equal size, side by side |
| `info` | Just news: live, in review, verified | nothing but a chevron; one muted line in Earlier. With `onOpen` the whole row is a button that opens what it's about (Enter and Space work) |

**Lead:** a night → its 3D object on a dark tile; a person → their photo; gathr → a Lucide icon tinted by meaning (green done, red needs fixing, violet from gathr, grey waiting).

**Text:** title 15/600 says what happened; one meta line 13px with the time at the end ("Fri 9 Oct · ₹1,299 · 5h"). Keep the meta under about 32 characters so the time never wraps. No full stops.

**Spacing (4px grid):** row padding 16 · lead → text 16 · title → meta 4 · text → action 16 · rows 8 apart · group head → rows 12 · groups 32 apart · screen gutter 16 · page title → first group 24. Earlier rows use 8/12 padding and a 36px lead.

**Rules:**
- Only "Needs you" rows carry an action; three on screen at most (a Decline/Accept pair counts as one).
- Same night, one row: sent, checked and live replace each other.
- Decline is quiet: the other person isn't told. Show a `Toast` "Request declined. Ishaan won't be told · Undo" for 5 seconds (see Toast). Block and report live on the profile.
- More than two requests collapse into "3 friend requests".
- Unread "Needs you" rows sit on a card; Earlier rows are flat and muted.
- Accept (✓) is flat violet (flat yellow in host mode), like every selection and button.
