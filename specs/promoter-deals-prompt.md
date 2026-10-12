# Feature: Promoter guestlists and payouts for gathr

## Who I am and how to work with me
I'm the founder and designer of **gathr**, a nightlife discovery and booking app for Pune. I don't write code. Please:
- Explain each change in plain language, saying what you're changing and why, before you make it.
- Work in small, reviewable steps, and stop after each one so I can try it.
- Ask me before large refactors, new dependencies, or changes to the database.
- If anything in this brief conflicts with how the app is actually built, stop and tell me. Don't guess.

## Step 0: Understand the codebase first (don't write code yet)
Explore the project, then reply with a short report:
1. **Stack:** framework, language, styling, state management, backend/database (Supabase or other), auth, payments, and how the app is run and deployed.
2. **What already exists for:**
   - events/nights
   - venues
   - users and roles (guest, host/organiser, door staff)
   - bookings/passes (and how the QR or pass code is generated)
   - the door scanner and check-ins
   - guestlists
   - payments
   - any existing promoter, referral or analytics code
3. **Where each of those lives:** files, components, tables and API routes.
4. **Your plan:** how you'll fit this feature in, including any database migrations, before you make changes.

Wait for my OK on the plan before starting step 1.

## The problem
In Pune nightlife, promoters bring guests to a night and get paid for them. Promoters can be independent, or part of a hosting agency. Today the counting happens on WhatsApp and Excel, which leads to end-of-night arguments ("I sent 40, you counted 25").

gathr should be the single, transparent record of who brought whom, based on **who actually walked in**. The venue or agency can then pay everyone from one statement.

## Roles (one account per person, never separate logins or apps)
- **Host:** the venue or organiser that lists the night and sets the promoter deal.
- **Agency:** a team of promoters with a manager. The venue pays the agency, and the agency pays its promoters at rates only the agency sees.
- **Promoter:** independent (paid by the host) or under an agency.
- **Door staff:** scans passes at the entrance and confirms who arrived.
- **Guest:** books a night. Nothing about promoters should add friction for guests.

Roles are modes on the same account. Reuse the existing guest/host mode switch, and add a promoter mode (and an agency view) the same way.

## Business rules (the deal)
- **The host sets a deal for each night** (with an option to reuse the last one):
  - **Couple:** a flat amount per couple who walks in (e.g. ₹300).
  - **Stag:** a commission on that stag's cover charge (e.g. 20% of ₹1,000 = ₹200). If the cover is collected at the door rather than on gathr, the host can set a flat stag rate instead (e.g. ₹150).
  - **Girls-only (optional):** off, the couple rate per pair, or a flat rate per girl.
  - **Optional cap** on paid guests per promoter.
- **Pay goes by what the door confirms, never by what was booked.**
- **Rates lock when the night goes live.** Later edits apply only to new bookings. Save the deal version on each booking.
- **Attribution:**
  - Each promoter has a personal link and a short door code for each night.
  - A booking is credited to the promoter link opened last before booking. A referral expires after 7 days.
  - Walk-ins with no link: door staff can choose "Whose list?", and the credit is marked as door-assigned.
- **A promoter can never check in their own guests.** Only door staff and the host can confirm arrivals.

## What to build (one step at a time)

### 1. Deal setup (host)
Add a "Promoters" section to the create/edit night flow with:
- a pay-promoters switch
- the couple rate
- the stag commission (%), or a flat stag rate when entry is paid at the door
- the optional girls rate
- the optional cap

Validate the inputs, and show the host a preview: "A couple earns the promoter ₹300 · a ₹1,000 stag earns ₹200".

### 2. Promoters and agencies (host and agency)
- **The host can:** invite or add independent promoters, add agencies, and see each promoter's link and code for a night. Each promoter has "Share on WhatsApp" and "Copy link".
- **An agency manager can:** add their own promoters and set private rates for each one.
- **Visibility:** the host sees the agency's total head counts, but never the agency's internal split.
- **Invites expire.** Access can be removed in one tap.

### 3. "Who's coming" in booking (guest)
- **Replace the plain pass count with three counters:** Couples, Guys (stags) and Girls. The total number of passes comes from these.
- **Respect the night's stag policy.** On a couples-only night, a booking that's only stags gets a clear message before payment, and no money is taken.
- **Save on the booking:**
  - the mix: couples, stags, girls
  - the referral (which promoter, or none)
  - the deal version
- **Add the mix and referral to the pass QR or code**, so the door sees them on scan.

### 4. Door confirmation (door staff)
- **On a valid scan, show** "Booked: 2 couples + 1 guy · via Rahul", with counters for what actually arrived. They start at the booked numbers.
  - If the cover was paid at the door, add a field for the stag's cover amount.
- **Buttons:**
  - **"Let them in":** saves the check-in with the confirmed mix, the stag cover, the promoter, the time, and who scanned it.
  - **"Refused":** with a reason (dress code, ID, age, capacity). It earns nothing, and the promoter can see it.
  - **"Whose list?":** for walk-ins with no link.
- **The same pass scanned twice** shows "Already in at 10:42 pm", with no double credit.

### 5. Payout statement (host, agency, promoter)
- **For each night, one row per independent promoter and one per agency,** with the agency's promoters nested under it:
  - couples in
  - stags in, with their total cover
  - girls in
  - refused
  - amount earned, and status
- **The amount is calculated** as `couples × couple rate + Σ(stag cover × stag %)`, or `stags × flat stag rate`, `+ girls × girls rate`, capped by the deal cap.
- **Statuses run:** Open (during the night) → In review (48 h after the night ends) → Locked → Paid.
  - During review, the host or the promoter/agency can tap "Question this line" and add a note.
  - "Mark paid" records a UPI or bank reference.
- **Who sees what:**
  - **Host:** everyone's head counts and amounts.
  - **Agency:** its own total, plus its private split per promoter.
  - **Promoter:** only their own counts, earnings and status, live during the night.
  - **Guest details:** promoters see first names and counts only. Protect guest privacy.
- **Exports:** a CSV download and a short WhatsApp summary for each promoter.
- **Funnel for each promoter:** link opens → bookings → check-ins.

## Data shape (adapt to the existing schema; propose the migration before applying it)
Suggested entities. If the app uses Supabase or another database, add row-level access rules so each role can only read what's listed above.

- `deals`: night, version, couple rate, stag %, flat stag rate, girls rate, cap, locked at
- `agencies`: name, manager (user)
- `promoters`: user, agency (nullable), slug/code, status
- `agency_rates`: agency, promoter, rates (visible to the agency only)
- `referrals`: promoter, night, opened at (for link opens and attribution)
- booking additions: couples, stags, girls, referral promoter, deal version
- `checkins`: booking, confirmed couples/stags/girls, stag cover, promoter, attribution (link / door-assigned), scanned by, at, refused reason
- `payout_lines`: night, promoter or agency, counts, amount, status, dispute note, paid reference, paid at

## Edge cases
- A booked couple arrives as one person: the door changes it to 1 stag, counted only if they pay cover.
- A free night with no stag cover: only the couple and girls rates apply.
- Cap reached: bookings still go through but are marked "over cap" and earn nothing.
- The host edits rates after the night goes live: earlier bookings keep their deal version.
- A promoter is removed mid-night: their existing guests stay credited, and their link stops working for new bookings.
- No connection at the door: if the app supports offline use, queue the check-ins and sync them later. If it doesn't, tell me.

## Not in scope yet
- Moving real money or automatic splits (e.g. Razorpay Route), promoter identity checks (KYC), and tax deductions (TDS). Statements and "Mark paid" only.
- A separate promoter app or login.

## Done when
1. A host can set ₹300 per couple and 20% per stag on a night, add an independent promoter and an agency, and share a promoter link.
2. Opening that link and booking "1 couple + 1 guy" credits the promoter, and the pass carries the mix.
3. Scanning the pass shows the booked mix and promoter. The door can adjust it, let them in, or refuse with a reason.
4. The statement shows the right counts and amounts, with the agency split visible only to the agency. "Mark paid" works, and the CSV exports.
5. A promoter in promoter mode sees only their own numbers. A guest's booking flow stays as simple as before.
6. Every existing flow still works, with no errors in the console or logs. Tested on a phone-sized screen.
7. Seed one clearly labelled sample night, with a deal, one independent promoter, one agency with two promoters, some check-ins and one refusal, so I can review the statement without making real bookings.

After each step, tell me what changed, which files changed, and exactly how to try it.
