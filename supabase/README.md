# gathr database (Supabase)

`migrations/` holds the database setup, in order:

1. `20261001090000_foundation.sql`: profiles, organisers and their team (owners, door staff), venues, nights, bookings, door check-ins.
2. `20261001090100_promoters.sql`: deals, agencies, promoters, private agency rates, per-night promoter codes, invites, link opens, payout lines.
3. `20261005090000_organiser_venues.sql`: organisers can look after several venues (the first is their main venue) and add a venue that isn’t listed; nights must be at one of their venues. Also adds the venues from District’s listings.
4. `20261005100000_posters.sql`: a public storage bucket for night posters; only an organiser's owners can add or remove posters, in their own folder.
5. `20261006090000_event_guests.sql`: lets a night's team (owners and door staff) see who's booked, with the name on each booking, while profiles stay private.
6. `20261006100000_guest_lists.sql`: guest lists (free entry for named people) from the host or a promoter, with caps; guests take free passes only if their sign-in email is on the list; promoters can be paid per guest-list person. Replaces event_guests() so the door also sees guest-list people.
7. `20261007090000_door_checkins.sql`: door check-ins for guest lists: people come in by name (some now, the rest later, never twice), promoters are credited for their guest-list people, a door phone can undo its own check-in for 10 minutes, and payout lines count guest-list people.
8. `20261007100000_notifications.sql`: notifications (in Updates and pushed to phones) when you're added to a guest list, your night goes live or is sent back, or you're verified. Needs the `push` Edge Function deployed first (see firebase/README.md).

Every table has row-level security, so each person only reads and changes what their role allows.

## Setting up a new Supabase project

1. At supabase.com, create a project named `gathr`. Pick the region **South Asia (Mumbai)**: there's no Pune region,
   and Mumbai is the closest, so it's just as fast for Pune users. Save the database password somewhere safe.
2. Open **SQL Editor** and paste in each migration file, oldest first. Click **Run** after each one.
3. In **Authentication → Providers**, make sure **Email** is on. The app signs people in with a 6-digit code, so in **Authentication → Email Templates → Magic Link**, the message must include `{{ .Token }}`.
4. In **Project Settings → API**, copy the **Project URL** and the **anon public** key. These are safe to put in the app.
   Never put the **service_role** key or the database password in the app.
5. After you've signed in to the app once, make yourself a gathr admin (admins approve organisers and nights):
   ```sql
   insert into app_admins (user_id) select id from auth.users where email = 'you@example.com';
   ```

## Changing the database later

Add a new file to `migrations/` (never edit one that has already been run) and run it the same way.
