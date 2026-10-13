-- gathr: saved nights (the heart), so a save follows you to any phone
--
-- Tapping the heart on a night saves it at once on the phone and here in the background; if this fails, the app puts
-- the heart back and says "That didn't go through. Try again". Each person sees and changes only their own saves.
-- Night ids are text: listed nights use their listing id ("twin"), nights hosted on gathr their night id.
-- Run this in the Supabase SQL Editor after the earlier migrations.

create table saved_nights (
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  night_id text not null check (char_length(night_id) between 1 and 80),
  created_at timestamptz not null default now(),
  primary key (user_id, night_id)
);

-- ---------------------------------------------------------------- access rules
alter table saved_nights enable row level security;

-- your own saves: see them, add one, take one back
create policy "saved nights: your own" on saved_nights for select using (user_id = auth.uid());
create policy "saved nights: save" on saved_nights for insert with check (user_id = auth.uid());
create policy "saved nights: unsave" on saved_nights for delete using (user_id = auth.uid());
revoke update on saved_nights from authenticated, anon;
revoke all on saved_nights from anon;
