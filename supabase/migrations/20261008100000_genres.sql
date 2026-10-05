-- gathr: what a night sounds like (genre family, exact genre, energy, sounds-like artists) and what kind of night it is
--
-- One fixed set of lists, the same ones the app uses in the host's listing, on the event page, in the filters and in
-- Tune your week:
--   * genre family (required for new nights): electronic, hiphop, desi, commercial, live, retro
--   * exact genre (optional): free text up to 40 characters, picked from the family's list in the app
--   * energy (optional): chill, groovy, high
--   * sounds like: up to 3 artists the night sounds like
--   * kind of night: 12 formats. A host who needs another one suggests it; the suggestion goes to gathr (no free tags).
-- Existing nights keep working: girls' nights become ladies nights and live gigs become gigs.
-- Run this in the Supabase SQL Editor after the earlier migrations.

-- ---------------------------------------------------------------- the night's sound
alter table events
  add column family text check (family in ('electronic', 'hiphop', 'desi', 'commercial', 'live', 'retro')),
  add column genre text check (char_length(genre) between 2 and 40),
  add column energy text check (energy in ('chill', 'groovy', 'high')),
  add column sounds_like text[] not null default '{}' check (cardinality(sounds_like) <= 3);

-- a night sent for review or put live must say its genre family (drafts can be unfinished)
create function event_needs_family() returns trigger language plpgsql set search_path = public as $$
begin
  if new.status in ('review', 'live') and new.family is null
     and (tg_op = 'INSERT' or old.status is distinct from new.status) then
    raise exception 'Pick the night''s genre family first';
  end if;
  if exists (select 1 from unnest(new.sounds_like) a where char_length(a) not between 2 and 40) then
    raise exception 'Artist names are 2 to 40 characters';
  end if;
  return new;
end $$;
create trigger events_needs_family before insert or update on events for each row execute function event_needs_family();

-- ---------------------------------------------------------------- kind of night: 12 formats
alter table events drop constraint events_kind_check;
update events set kind = 'ladies' where kind = 'girls';
update events set kind = 'gig' where kind = 'live';
alter table events add constraint events_kind_check check (kind in (
  'club', 'ladies', 'brunch', 'rooftop', 'gig', 'concert', 'karaoke', 'guestdj', 'themed', 'underground', 'silent', 'after'
));

-- ---------------------------------------------------------------- "Suggest a new kind" (goes to gathr, never onto a night)
create table kind_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  name text not null check (char_length(btrim(name)) between 3 and 40),
  example text check (char_length(example) <= 90),     -- a night it would fit, if they gave one
  status text not null default 'new' check (status in ('new', 'added', 'declined')),
  created_at timestamptz not null default now()
);

-- a few suggestions a day per person is plenty
create function kind_suggestion_limit() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from kind_suggestions where user_id = new.user_id and created_at > now() - interval '1 day') >= 5 then
    raise exception 'That''s enough suggestions for today. Thanks!';
  end if;
  new.status := 'new';
  return new;
end $$;
create trigger kind_suggestions_limit before insert on kind_suggestions for each row execute function kind_suggestion_limit();

-- ---------------------------------------------------------------- access rules
alter table kind_suggestions enable row level security;
create policy "kind suggestions: send" on kind_suggestions for insert with check (user_id = auth.uid());
create policy "kind suggestions: yours, or gathr sees all" on kind_suggestions for select
  using (user_id = auth.uid() or is_admin());
create policy "kind suggestions: gathr decides" on kind_suggestions for update using (is_admin());
revoke all on kind_suggestions from anon;
revoke update, delete on kind_suggestions from authenticated;
grant update (status) on kind_suggestions to authenticated;
