# Toast

The app's **only** toast. Every short message uses it: "Removed from Plans", "Logged out", "Link copied", and every Undo ("Request declined. Ishaan won't be told · Undo").

**Provide:** the message as children, an optional `action` ("Undo") with `onAction`, and `onClose` to remove it when the time is up.

**Where (`docked`):** fixed near the bottom, centred, 16px from each side, **32px up** from the safe area. When the screen has the tab bar, add `aboveTabBar` and it sits **12px above the tab bar**. Never at the top, never over a button.

**How long:** **2.4 seconds**, or **5 seconds** when it has an action (`Toast.duration` = `{ plain: 2400, action: 5000 }`; override with `duration` only for a good reason).

**Look:** a light pill on night (night-50, night-950 text), message 13px 500, action 15px 600. It slides up 8px and fades in; reduced motion just shows it.

**Rules:**
- One line, no full stop, at most one action.
- One toast at a time: a new one replaces the old.
- It's `role="status"`, so screen readers announce it without moving focus.
- Not for errors that need fixing (put those next to the field) or for anything a person must read twice.
