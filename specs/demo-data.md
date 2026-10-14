# Demo data: new Pune nights, hosts and guest history

Status: ready to run · 14 Oct 2026 · owner: Shubh
Goal: replace every current event in the app with a fresh demo set at 13 real Pune venues, so a demo shows the app in every state: live, upcoming, pending and past, on the guest side and the host side.

Put this file in `specs/` as `specs/demo-data.md`, then paste the prompt at the bottom into Claude Code in plan mode.

---

## 1. Where the posters go

Put the poster images in **`public/posters/`** inside the app folder (create the folder if it isn't there):

```
E:\gathr-app\gathr-new-1\public\posters\
```

Vite copies everything in `public/` into the built app as it is, so a file at `public/posters/bollywood-bash.jpg` loads in the app as `/posters/bollywood-bash.jpg`, on the web and inside the Android and iOS builds. Claude Code checks this in step 0. If the app already keeps images somewhere else, it will tell you and you move them.

**Poster rules**
- Shape: 4:5 portrait. Best size is 1080 × 1350. Square posters get cropped at the top and bottom.
- Format: JPG (or WebP), under about 400 KB each, so the app stays fast.
- Names: lower case, words joined with hyphens, matching the **Poster file** column in section 4 (for example `kiki-after-dark.jpg`). If you name a file differently, tell Claude Code and it will match it up.
- A night with no poster yet shows the design system's neutral "Organiser image" placeholder. Nothing breaks, so you can add posters any time.

---

## 2. What gets deleted

- **All current events:** the 10 Sort My Scene / District listings from 29 Sep, plus any other sample nights in the code.
- **Their sample bookings, saves, plans, recaps and check-ins.**
- **Never deleted:** real accounts, real Supabase tables, the design system, the app's screens. Anything in Supabase is deleted only if it's marked as sample or demo. Claude Code lists what it would delete and waits for your yes first.

---

## 3. How the demo stays fresh

All dates are **relative to the day the app is opened** (day 0 = today, +1 = tomorrow, −3 = three days ago). The demo never goes stale, so you can show it next week without changing anything.

**`?demo` switch (new):** sets the app's clock to **today at 10:30 pm**, so tonight's 9 pm nights show as **Live**. Use it for demos in the daytime. Without `?demo`, the real clock is used. It works together with the existing `?date=` / `?time=` switches, which win if both are set.

Times follow Pune rules: most nights end at 1:30 am. Bastian Empire ends at 3 am (it has a late licence).

---

## 4. The venues

| Venue | Area | Map position |
|---|---|---|
| The Game Palacio | **Confirm** | Shubh to confirm |
| Kiki | **Confirm** | Shubh to confirm |
| Acai | Raja Bahadur Mills, Sangamwadi | Mills cluster, behind Sheraton Grand |
| Bailamos | **Confirm** | Shubh to confirm |
| 2BHK Diner & Key Club | Sassoon Road area | Confirm exact spot |
| The Millers | **Confirm** | Shubh to confirm |
| Toyroom | Sheraton Grand, Bund Garden Rd, Sangamwadi | Mills cluster |
| Bastian Empire | The Westin, Mundhwa Rd, Koregaon Park Annexe | |
| Anti Social | Shivaji Nagar (from earlier notes) | Confirm |
| Dimora Dance & Kitchen | The Mills, Raja Bahadur Mill Rd, Sangamwadi | Mills cluster |
| High Spirits | Koregaon Park | Confirm exact spot |
| Xclusive Superclub | **Confirm** | Shubh to confirm |
| Epitome | **Confirm** | Shubh to confirm |

Acai, Toyroom and Dimora sit close together at the Mills, so the map should show them as one group pin that splits when you zoom in.

**For Claude Code:** don't guess a venue's position. For rows marked "Confirm", ask Shubh for the area (or a Google Maps link) and use the area's centre until then.

---

## 5. The demo account

All of this demo data belongs to Shubh's real login: **corronadischarge@gmail.com**. One login plays both sides, using the app's existing host-mode switch:
- **Guest:** Shubh's own profile (his name and photo as set on the account). Wherever the spec says "Riya" or "the guest", it means this account.
- **Host:** an organiser profile, **Afterhours Collective** (type: promoter collective, verified), owned by this account and hosting nights at several venues.

Opening the app shows the guest side. "Switch to hosting" on You opens Afterhours Collective.

### 5.1 Friends already on the account

When Shubh signs in with corronadischarge@gmail.com, these friends are **already there**: on You → Friends, in group plans, in "Friends going" on night pages, and in Updates. They're demo profiles (no login of their own), saved against his account, so they show on every device he signs in from, not just one browser.

| Friend | Display picture file | Used in |
|---|---|---|
| Dev | `dev.jpg` | Tonight's booking (E1), Friday vote, Retro Rewind (P1) |
| Arjun | `arjun.jpg` | Tonight's booking (E1), Friday vote, Retro Rewind (P1); sends the friend request in Updates until accepted, then becomes a friend |
| Meera | `meera.jpg` | Friday vote, Sunday Sundowner (E10) |
| Riya | `riya.jpg` | Kiki Fridays (P4), saved Empire Saturdays (E8) |
| Kabir | `kabir.jpg` | Reggaeton Sundays (P2), going to Desi Drop (E9) |
| Tanvi | `tanvi.jpg` | Kiki Fridays (P4), going to Epitome Live (E11) |

Note: Arjun is both a friend and the sender of a pending request, which doesn't add up. Use **Neha** (`neha.jpg`) for the pending friend request in Updates instead, and keep Arjun as a friend.

**Display pictures** go in **`public/avatars/`**, named as in the table. Square, 400 × 400, JPG under 100 KB. A friend without a picture shows the existing initials avatar. Use photos people have agreed to, or stock / AI-generated faces. Don't use real people's pictures without asking.

Friends show the "Sample data" note like the rest of the demo social data. Signing in with any other account shows no demo friends.

---

## 6. The nights

Day = days from today. "Listed" nights came from outside gathr (shown as "Listed"); "Hosted" nights belong to a host and show "Hosted by … · listed on gathr".

### 6.1 Afterhours Collective (host side)

| # | Night | Venue | Day | Time | Entry | Door rules | Host status | Numbers to show | Poster file |
|---|---|---|---|---|---|---|---|---|---|
| H1 | Afterhours: Mills Edition | Dimora | 0 | 9 pm – 1:30 am | Paid ₹799 | 21+, stags ₹500 extra, no dress code | **Live** | 186 of 240 passes booked, 142 checked in, "Just in" list with the last 5 arrivals | `afterhours-mills-edition.jpg` |
| H2 | Bass Theory | Toyroom | +8 | 10 pm – 1:30 am | Paid ₹999 | 21+, no stags | **In review** (pending) | none yet | `bass-theory.jpg` |
| H3 | Sundowner Sessions | High Spirits | +10 | 5 pm – 11 pm | Free RSVP, cap 150 | 21+, stags OK | **In review** (pending) | none yet | `sundowner-sessions.jpg` |
| H4 | Afterhours: After Midnight | Bastian Empire | +15 | 10 pm – 3 am | Paid ₹1,499 | 25+, formals (strict) | **Draft** (poster missing, so it lists what's still needed) | none | — |
| H5 | Afterhours: Launch Night | Acai | −6 | 9 pm – 1:30 am | Paid ₹699 | 21+, stags OK | **Past** | 212 booked, 184 checked in, 22 walk-ins; funnel 1,840 viewed → 410 interested → 212 booked → 184 in | `afterhours-launch-night.jpg` |
| H6 | Disco Inferno | Anti Social | −13 | 9 pm – 1:30 am | Pay at door, ₹500 cover | 21+, couples only | **Past** | 160 on the list, 131 checked in | `disco-inferno.jpg` |

Only H1 is live. H2 and H3 stay "In review" and must **not** auto-approve in this demo (turn off the 2.6-second demo approval for these two). Live and past nights appear in the guest feed too; pending and draft nights never do.

### 6.2 Everything else in the guest feed

| # | Night | Venue | Day | Time | Entry | Door rules (gives this verdict for "4 guys, all 21+") | Sounds | Source | Poster file |
|---|---|---|---|---|---|---|---|---|---|
| E1 | Bollywood Bash | The Game Palacio | 0 | 9 pm | Paid ₹499 | 18+, stags OK → **yes** | Bollywood, Commercial | Hosted by The Game Palacio | `bollywood-bash.jpg` |
| E2 | Kiki After Dark | Kiki | 0 | 9:30 pm | Paid ₹999 | 21+, couples only → **no** | Commercial, Hip-hop | Listed | `kiki-after-dark.jpg` |
| E3 | House of Acai | Acai | +1 | 9 pm | Paid ₹799 | 21+, stags ₹1,000 extra → **if** ("Stags ₹1,000") | House | Listed | `house-of-acai.jpg` |
| E4 | Reggaeton Thursdays | Bailamos | +1 | 8:30 pm | Paid ₹399 | 21+, stag policy not listed → **unknown** | Latin, Reggaeton | Listed | `reggaeton-thursdays.jpg` |
| E5 | Key Club Fridays | 2BHK Diner & Key Club | +2 | 9 pm | Paid ₹1,499 | 25+, formals (strict) → **no** for under-25 groups, **if** ("Formals only") for 25+ | Commercial, House | Hosted by 2BHK | `key-club-fridays.jpg` |
| E6 | Hip-hop Hooray | Toyroom | +2 | 10 pm | Paid ₹999 | 21+, stags OK, entry closes 10:30 → **if** ("Before 10:30") | Hip-hop | Listed | `hip-hop-hooray.jpg` |
| E7 | Indie Live: The Millers Sessions | The Millers | +3 | 8 pm | Paid ₹599 | 18+, stags OK → **yes** | Live gigs, Indie | Hosted by The Millers | `millers-sessions.jpg` |
| E8 | Empire Saturdays | Bastian Empire | +3 | 10 pm – 3 am | Paid ₹1,999 | 25+, couples only → **no** | Commercial, House | Listed | `empire-saturdays.jpg` |
| E9 | Desi Drop | Xclusive Superclub | +3 | 9 pm | Paid ₹799 | 21+, stags ₹500 extra → **if** | Marathi, Bollywood | Hosted by Xclusive | `desi-drop.jpg` |
| E10 | Sunday Sundowner | High Spirits | +4 | 5 pm | Free RSVP | 21+, stags OK → **yes** | Live gigs, Rooftop | Listed | `sunday-sundowner.jpg` |
| E11 | Epitome Live: Strings & Stories | Epitome | +4 | 8 pm | Paid ₹1,299 | 21+, stags OK → **yes** | Live gigs | Listed | `epitome-live.jpg` |
| E12 | Ladies Night | Dimora | +5 | 9 pm | Free RSVP | 21+, no stags → **no** for guys | Commercial, Bollywood | Listed | `dimora-ladies-night.jpg` |
| E13 | Techno Tuesday | Anti Social | +6 | 9 pm | Paid ₹699 | 21+, stag policy not listed → **unknown** | Techno | Listed | `techno-tuesday.jpg` |
| E14 | Game Night Retro | The Game Palacio | +9 | 9 pm | Paid ₹349 | 18+, stags OK → **yes** | Retro, Bollywood | Listed | `game-night-retro.jpg` |

Together with H1 that gives 3 nights tonight, 2 tomorrow, a full weekend, and a "Next week" rail: enough for the hero, every rail, the sound tiles and the end card. All four door verdicts show up at least twice, so the demo shows the door working.

**Crowd levels (sample, labelled):** E1 Packed, H1 Buzzing, E2 Filling up, E6 Buzzing, E9 Filling up, the rest Early. E8 is **Full** (sold out) to show that state.

### 6.3 Past nights for the guest

| # | Night | Venue | Day | What the guest did |
|---|---|---|---|---|
| P1 | Retro Rewind | The Millers | −2 | Went with Dev and Arjun. **Day-after card is waiting** ("How was Retro Rewind? One tap") |
| P2 | Reggaeton Sundays | Bailamos | −5 | Went, answered the day-after card ("Let us in: yes", sound great), rated the venue |
| P3 | Afterhours: Launch Night (H5) | Acai | −6 | Went (checked in 10:42 pm), rated it |
| P4 | Kiki Fridays | Kiki | −12 | Went with a couple of friends, checked in |

Poster files: `retro-rewind.jpg`, `reggaeton-sundays.jpg`, `kiki-fridays.jpg` (P3 uses H5's poster).

---

## 7. The guest's own plans

| State | Night | What it shows |
|---|---|---|
| **Live (in now)** | E1 Bollywood Bash, tonight | Booked 4 passes; with `?demo` it's Live. Pass shows "Door confirmed", Get ready shows "On now". GroupPill: "Bollywood Night · Fri"-style booked state with Dev, Arjun + 1 |
| **Upcoming, voting** | Friday group plan: E5, E6, E9 | Plan with Dev, Arjun, Meera; 2 of 4 voted, closes 8 pm on day +2. You haven't voted, so the GroupPill reads "Your vote · closes 8 pm" when no booking is active |
| **Upcoming, booked** | E10 Sunday Sundowner (free list), day +4 | "You're on the list", 2 passes |
| **Saved** | E8 Empire Saturdays, E11 Epitome Live | In Plans → Saved, each with its Book button (E8 shows sold out) |
| **Past** | P1–P4 | In Plans → Past; P1 has the waiting day-after card; the venue ratings feed the scores |

Updates (bell) should have: "Dev voted for Hip-hop Hooray" (Needs you: "Vote"), "Neha wants to add you as a friend" (Accept/Decline), "Bass Theory is in review" (host side), "How was Retro Rewind?" and a few Earlier rows from the past nights.

---

## 8. Rules

- Labelled sample data stays labelled: crowd, friends, votes and host numbers show the "Sample data" note (one per screen), as today.
- No new colours, sizes or components. This is data only, plus the `?demo` clock switch and turning off auto-approval for H2/H3.
- Copy follows release 25: short door verdicts ("Lets you in · 21+", "Formals only", "Stag rules unknown", "Couples only").
- Organiser night names have no gathr full stop.
- Keep all existing test switches working (`?home=classic`, `?loading`, `?offline`, `?group=none`, `?date=`, `?time=`, `?review`).

---

## 9. Done means

- [ ] None of the old 10 listings (Gossip Gurl, Dear Wednesday, Lavish Friday…) appear anywhere: feed, map, search, Plans, Updates, host mode.
- [ ] With `?demo`, home shows tonight's hero, 3 nights tonight (Bollywood Bash and Afterhours: Mills Edition live), rails through next week, and every verdict state.
- [ ] Map shows all 13 venues; Acai, Toyroom and Dimora group at the Mills.
- [ ] Posters load from `public/posters/`; missing ones show the neutral placeholder.
- [ ] Plans shows a live booking, a vote, an upcoming list booking, saved nights and 4 past nights; the day-after card for Retro Rewind is waiting.
- [ ] Host mode (Afterhours Collective) shows 1 live, 2 in review, 1 draft, 2 past, with numbers; the Door tab works on H1.
- [ ] Signing in as corronadischarge@gmail.com shows the 6 friends with their pictures on You → Friends, in plans and on night pages, on a second device too; Neha's request is waiting in Updates. Another account shows no demo friends.
- [ ] Opening the app next week still shows the same states (dates are relative).
- [ ] `npm test` passes; tests that used the old listing names use the new ones.

---

## The prompt (paste in Claude Code, plan mode: Shift+Tab)

```
We're replacing all events in the gathr Seeker app with a new demo set. Read specs/demo-data.md and CLAUDE.md. Don't change any files yet.

Then come back with a plan that says, in plain words:
1. Where the current events live: which files hold the 10 sample listings (Sort My Scene / District), their sample bookings, saves, plans, recaps, updates and host numbers, and whether any of them are rows in Supabase.
2. Exactly what you'd delete, file by file and table by table. For Supabase, only rows marked as sample or demo. List them and wait for my yes. Never drop a table or touch real accounts.
3. Where posters should go. Confirm public/posters/ works for both the web build and the Capacitor build, or tell me the right folder. List the poster file names you'll expect (section 6).
4. How you'll build the demo data so all dates are relative to today, and how the new ?demo switch sets the clock to today 10:30 pm without breaking ?date= and ?time=.
5. Where the demo host (Afterhours Collective) and its nights will live, so host mode shows 1 live, 2 in review (no auto-approve), 1 draft, 2 past.
6. How the friends in section 5.1 get attached to my account corronadischarge@gmail.com so they show on every device I sign in from: which Supabase tables (profiles, friendships) you'd use or need to add, and how their pictures load from public/avatars/ with the initials avatar as fallback.
7. Which tests use the old listing names and need updating.
8. Questions for me. In particular, ask me for the area of every venue marked "Confirm" in section 4. Don't guess their map positions.

Rules:
- Data only, plus the ?demo switch and turning off auto-approval for H2 and H3. No visual changes.
- Copy follows gathr-design release 25. Keep sample data labelled.
- Keep every existing ?test switch working.
- After building, run npm test, then tell me how to check each line of section 9 in the browser.
```
