# Feature: Time-first home screen for gathr

## Who I am and how to work with me
I'm the founder and designer of **gathr**, a nightlife discovery and booking app for Pune. I don't write code. Please:
- Explain each change in plain language, saying what you're changing and why, before you make it.
- Work in small, reviewable steps, and stop after each one so I can try it.
- Ask me before large refactors, new dependencies, or changes to the database.
- If anything here conflicts with how the app is actually built, stop and tell me. Don't guess.

## Step 0: Understand the current home screen first (don't write code yet)
Explore the project and reply with a short report:
1. **Stack:** framework, language, styling, state, data source, and how the app runs.
2. **The home screen today:**
   - which file or component renders it
   - every section on it, in order
   - where each section's data comes from
3. **Where the following live:** the event/night data (start time, venue, area, price, age limit, door rules, poster), friends going, bookings and saves counts, the user's age, the promoted flag, group plans, and the "host a night" and "tune your week" cards.
4. **Reusable pieces:** the existing components and styles I can reuse (cards, chips, tabs, badges, the design-system tokens).
5. **Your plan,** step by step, before you change anything.

Wait for my OK on the plan before starting step 1.

## The problem
People open gathr to answer one question: *"Where do I go tonight, or this weekend?"*

Today the home screen makes them decide **where to look** before they can decide **where to go**. It has a mood filter row, a big promoted card, a sideways carousel for each day, a group plan card, a "tune your week" card and a "host a night" card. Each one is another choice, and that clutter makes picking a night feel like work.

## The decision
Organise the home screen by **time**. People have already decided *when*, so that comes first. Everything else helps them choose within that window. "Trending" and "where people are going" become signals on the cards, not extra sections.

The job the screen does: *"When I'm deciding about going out, I want to find a night that fits my plans and will let me in, so I can commit without second-guessing."*

## Target layout

```
Pune · Tue 6 Oct                     🔍  🔔
─────────────────────────────────────────
[ Your night: Almost Illegal Thu · pass ]   ← only if the user has a booking
─────────────────────────────────────────
 Tonight │ Tomorrow │ This weekend │ Later   ← sticky when scrolling
 [Lets me in ✓] [Free] [Music ▾]              ← 3 quick filters, no more

 Where people are going tonight
  1  Kukoo · Gossip Gurl        64 going ↑
  2  Plunge · Dear Wednesday    41 going
  3  Opus · Lavish Friday       Friends: Zoya +2

 All tonight · 6 nights
 ┌───────────────────────────────┐
 │ [poster]  Gossip Gurl         │
 │           Kukoo · Mills · 8 pm│
 │           ₹285 · ✓ lets you in│
 │           Zoya + 2 going      │  ← ONE social signal only
 └───────────────────────────────┘
 ...
 ▸ Not for you tonight (2)                    ← collapsed
```

## What to build (one step at a time)

### 1. Time switch
A segmented switch: **Tonight · Tomorrow · This weekend · Later**. It stays at the top when scrolling.

What each window holds:
- **Tonight:** nights starting today, plus anything still running until 2 am.
- **Tomorrow:** the next calendar day.
- **This weekend:** the coming Friday to Sunday. If today is Friday to Sunday, it means the rest of this weekend.
- **Later:** everything after that.

Which tab it opens on:
- Tonight, if any nights are on.
- Otherwise, the first tab that has nights.
- Between 2 am and 6 am, Tomorrow.

Other behaviour:
- Remember the last tab during the session, but go back to these defaults on a fresh open.
- Show a count on each tab, e.g. "Tonight 6". Grey out empty tabs, but keep them tappable, with an empty state.
- Use real dates and the user's time zone (Asia/Kolkata). Past nights must never show.

### 2. Quick filters (max three)
- **Lets me in:** hides nights the user can't enter (age limit, couples-only for a stag group if known).
- **Free:** free entry or free RSVP only.
- **Music ▾:** a single picker sheet listing the genres present in the current window.

Filters apply to the current time window. Show "Clear filters" whenever a filter is on. Move the mood tiles and genre carousels from the home screen to **Search**.

### 3. "Where people are going" (top 3)
- Three numbered rows: venue · night name · signal. Tapping a row opens that night.
- **Ranking:** bookings in the last 24 hours, plus saves at half weight, within the current window. Promoted nights get no boost here.
- **Signal per row, in priority order:**
  - friends going: "Friends: Zoya +2"
  - otherwise the count: "64 going", with ↑ if it rose in the last 24 h
- **Honesty threshold:** only show counts of 15 or more. If fewer than 3 nights qualify, rename the section **"New this week"**. In that case, list the most recently added nights with no counts. Never invent numbers.
- Add a small "ⓘ" that explains: "Most booked in the last 24 hours".

### 4. One vertical list per time window
- **Heading:** "All tonight · 6 nights".
- **Sorting:** start time, then name.
- **The card's information budget is fixed.** Show these and nothing else:
  - poster (fixed ratio, never stretched)
  - night name
  - venue · area · start time
  - price, or "Free" / "Free RSVP"
  - door verdict: "✓ Lets you in", or "⚠ Check rules" when rules are unknown or the user's details aren't set
  - **one** social signal, chosen in priority order: friends going → "Filling fast" (over 80% of capacity, if capacity is known) → "New"
- **Not for you:** nights that won't let this user in go into a collapsed section, "Not for you tonight (N)", at the end. The "Lets me in" filter removes them entirely.
- **Promoted:** at most **one** promoted night per window, in the list at its natural time position, with a visible "Promoted" label. It's never at the top unless it's genuinely first by start time.
- **Empty state per window:** "Nothing listed for tonight yet. See tomorrow →", with a button to the next window that has nights.

### 5. What leaves the home screen
| Element | New home | Rule |
|---|---|---|
| Big promoted feature card | One labelled slot inside the list | Max 1 per window |
| Group plan card | Plans tab | Show on home only while a plan is actively voting or booked for this window |
| "Hosting a night?" card | You tab | Never on home |
| "Tune your week" card | Home, once | Dismissible. Never shown again after dismissal or completion |
| Sideways carousel per day | Removed | Replaced by the time switch |

### 6. Variant for testing (behind a simple setting)
Add a switch that is easy to flip for testing, such as a URL parameter `?home=posters` or a dev setting. It shows the **top 3 as a single sideways strip of large posters**, instead of numbered rows. Everything below it stays the same. I'll compare both with users before choosing.

### 7. Measurement
Log these events, using the app's existing analytics. If there isn't any, use a simple local log I can read later:
- `home_view`: the window shown, and how the default was chosen
- `window_change`: from and to
- `filter_toggle`: which filter, on or off
- `top3_tap` and `list_card_tap`: night id, position, window
- `event_open`: the time since the home screen opened
- `save` and `book_start`: from the home screen

The main measure is the time from opening the home screen to opening a night's page.

## Accessibility and polish
- The time switch is a proper tab control: arrow-key navigation, a selected state screen readers announce, and visible focus.
- Every card is one tap target with a clear spoken label, e.g. "Gossip Gurl, Kukoo, The Mills, 8 pm, ₹285, lets you in, Zoya and 2 friends going". No buttons inside buttons.
- Text contrast meets WCAG AA. Tap targets are at least 44 px.
- Respect reduced motion. Switching tabs cross-fades, with no sliding when reduced motion is on.
- Test on a 390 × 844 phone screen and a small 360 px-wide screen.

## Not in scope
- Changing the event page, booking, or Search beyond receiving the mood tiles.
- Personalised ranking beyond the rules above.
- Any backend changes beyond reading counts that already exist. If counts don't exist yet, tell me and use the "New this week" fallback.

## Done when
1. The home screen opens on the right tab by the rules above, and switching tabs never shows past nights.
2. The three filters work, and "Clear filters" resets them.
3. The top 3 uses real counts above the threshold, or falls back to "New this week" with no fake numbers.
4. Each card shows exactly the fixed information budget, with one social signal.
5. "Not for you" nights are collapsed at the end, and the "Lets me in" filter removes them.
6. There's at most one promoted night per window, clearly labelled.
7. The plan, host, tune and carousel elements are moved as listed.
8. `?home=posters` shows the poster-strip variant.
9. Every existing flow still works (event page, booking, Search, Plans, You), with no console errors.

After each step, tell me what changed, which files changed, and exactly how to try it.
