-- gathr: the venues an organiser looks after (step 1 of the guest-list plan)
--
-- An organiser can now look after several venues, found by search, and can add a venue that isn't listed yet.
-- Which venues an organiser runs is between them and the venue, so gathr doesn't approve these links.
-- organisers.venue_id stays as their main venue, and is always one of the venues they look after.
-- Run this in the Supabase SQL Editor after the two earlier migrations.

-- ---------------------------------------------------------------- venues
-- one listing per name and area, so search never shows two Kukoos
create unique index venues_name_area on venues (lower(name), lower(area));

-- the venues from District's Pune listings (4 Oct 2026), so search finds them
insert into venues (id, name, area, lat, lng, icon, hue, added_by) values
  ('shisha', 'Shisha Jazz Cafe', 'The Mills, Bund Garden Road', 18.5338, 73.8706, 'cd', 'blue', null),
  ('sinonna', 'Si Nonna’s', 'FC Road', 18.5260, 73.8419, 'megaphone', 'yellow', null),
  ('fcsocial', 'FC Road Social', 'FC Road, Shivaji Nagar', 18.5291, 73.8437, 'mic', 'green', null),
  ('dimora', 'Di Mora', 'The Mills, Bund Garden Road', 18.5340, 73.8712, 'champagne', 'pink', null),
  ('cobbler', 'Cobbler & Crew', 'Kalyani Nagar', 18.5495, 73.9027, 'cocktail', 'violet', null),
  ('themills', 'The Mills', 'Sangamwadi', 18.5313, 73.8709, 'spotlight', 'yellow', null),
  ('kurryleaf', 'Kurry Leaf', 'Erandwane', 18.5036, 73.8356, 'memories', 'pink', null),
  ('mahalaxmi', 'Mahalaxmi Lawns', 'Karve Nagar', 18.4872, 73.8261, 'discoball', 'red', null)
on conflict do nothing;

-- ---------------------------------------------------------------- the venues an organiser looks after
create table organiser_venues (
  organiser_id uuid not null references organisers (id) on delete cascade,
  venue_id text not null references venues (id),
  added_by uuid references auth.users (id) default auth.uid(),
  created_at timestamptz not null default now(),
  primary key (organiser_id, venue_id)
);
create index organiser_venues_by_venue on organiser_venues (venue_id);

-- organisers made before this migration: their one venue becomes the first they look after
insert into organiser_venues (organiser_id, venue_id, added_by)
  select id, venue_id, created_by from organisers
on conflict do nothing;

-- the main venue is always on the list (a new organiser, or a different main venue)
create function organiser_main_venue() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into organiser_venues (organiser_id, venue_id, added_by)
    values (new.id, new.venue_id, auth.uid())
  on conflict do nothing;
  return new;
end $$;
create trigger organisers_main_venue after insert or update of venue_id on organisers
  for each row execute function organiser_main_venue();

-- the main venue can't be taken off the list (pick another main venue first)
create function organiser_venue_guard() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from organisers where id = old.organiser_id and venue_id = old.venue_id) then
    raise exception 'This is your main venue. Choose a different main venue before removing it.';
  end if;
  return old;
end $$;
create trigger organiser_venues_guard before delete on organiser_venues
  for each row execute function organiser_venue_guard();

-- a night is always at one of its organiser's venues
create function event_venue_guard() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from organiser_venues where organiser_id = new.organiser_id and venue_id = new.venue_id) then
    raise exception 'Pick one of your venues for this night.';
  end if;
  return new;
end $$;
create trigger events_venue_guard before insert or update of venue_id, organiser_id on events
  for each row execute function event_venue_guard();

-- ---------------------------------------------------------------- access rules
alter table organiser_venues enable row level security;

-- you can see which venues an organiser looks after whenever you can see the organiser
create policy "organiser venues: read" on organiser_venues for select
  using (exists (select 1 from organisers o where o.id = organiser_id));
-- the organiser's owners add and remove venues
create policy "organiser venues: owner adds" on organiser_venues for insert to authenticated
  with check (is_org_owner(organiser_id) and added_by = auth.uid());
create policy "organiser venues: owner removes" on organiser_venues for delete to authenticated
  using (is_org_owner(organiser_id));

revoke update on organiser_venues from authenticated, anon;
revoke insert, delete on organiser_venues from anon;
