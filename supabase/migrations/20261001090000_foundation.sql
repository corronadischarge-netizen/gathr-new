-- gathr: database foundation
-- Moves what the app keeps on the phone today into shared tables:
-- profiles, organisers and their team, venues, nights, bookings and door check-ins.
-- Every table has row-level security: each person can only read and change what their role allows.
--
-- Money is stored in whole rupees (integers). Times are stored with time zone (shown in IST by the app).

-- Random bytes for pass codes and invite links (Supabase keeps extensions in the "extensions" schema)
create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------- types
create type organiser_type as enum ('venue', 'promoter', 'collective');
create type organiser_status as enum ('pending', 'verified');
create type member_role as enum ('owner', 'door');
create type event_status as enum ('draft', 'review', 'live', 'removed');
create type entry_type as enum ('free', 'paid', 'door');
create type stag_policy as enum ('welcome', 'groups', 'none');
create type booking_status as enum ('booked', 'cancelled');
create type checkin_outcome as enum ('admitted', 'refused');
create type refusal_reason as enum ('dress', 'id', 'age', 'capacity', 'other');
create type attribution as enum ('link', 'door_assigned', 'none');

-- ---------------------------------------------------------------- people
-- One row per signed-in person. Private: only you can read or edit your own profile.
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null default '' check (char_length(first_name) <= 40),
  full_name text not null default '' check (char_length(full_name) <= 80),
  handle text unique check (handle ~ '^[a-z0-9._]{3,20}$'),
  phone text check (phone ~ '^[6-9][0-9]{9}$'),
  upi text,
  photo_url text,
  age_band text check (age_band in ('18 to 20', '21 to 24', '25 or older')),
  created_at timestamptz not null default now()
);

-- The gathr team: approves organisers and nights before they go live.
create table app_admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

-- ---------------------------------------------------------------- venues and organisers
create table venues (
  id text primary key check (id ~ '^[a-z0-9_]{2,40}$'),
  name text not null,
  area text not null,
  lat double precision not null,
  lng double precision not null,
  icon text not null default 'spotlight',
  hue text not null default 'violet',
  added_by uuid references auth.users (id) default auth.uid(),
  created_at timestamptz not null default now()
);

create table organisers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 40),
  type organiser_type not null default 'venue',
  venue_id text not null references venues (id),
  insta text not null check (insta ~ '^[A-Za-z0-9._]{2,30}$'),
  phone text check (phone ~ '^[6-9][0-9]{9}$'),
  status organiser_status not null default 'pending',
  created_by uuid not null references auth.users (id) default auth.uid(),
  created_at timestamptz not null default now()
);

-- An organiser's team. 'owner' runs the organiser; 'door' can only scan passes and check people in.
-- Removing someone sets removed_at; they lose access straight away but history is kept.
create table organiser_members (
  organiser_id uuid not null references organisers (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role member_role not null,
  added_by uuid references auth.users (id) default auth.uid(),
  created_at timestamptz not null default now(),
  removed_at timestamptz,
  primary key (organiser_id, user_id)
);

-- ---------------------------------------------------------------- nights
create table events (
  id uuid primary key default gen_random_uuid(),
  organiser_id uuid not null references organisers (id) on delete cascade,
  venue_id text not null references venues (id),
  title text not null check (char_length(title) between 3 and 48),
  kind text not null default 'club' check (kind in ('club', 'girls', 'themed', 'live')),
  sounds text[] not null default '{}' check (cardinality(sounds) <= 3),
  about text check (char_length(about) <= 90),
  poster_url text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  entry entry_type not null default 'free',
  price integer check (price >= 0),
  capacity integer check (capacity > 0),
  min_age integer not null default 18 check (min_age in (18, 21, 25)),
  stag_policy stag_policy not null,
  dress text check (char_length(dress) <= 40),
  status event_status not null default 'draft',
  live_at timestamptz,
  created_by uuid references auth.users (id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (entry <> 'paid' or price > 0),
  check (ends_at is null or ends_at > starts_at)
);
create index events_live_idx on events (starts_at) where status = 'live';

-- ---------------------------------------------------------------- bookings and check-ins
-- A booking is one person's booking for a night: how many couples, guys (stags) and girls.
-- Passes = 2 per couple + 1 per stag + 1 per girl. Bookings are created through create_booking()
-- (in the promoters migration), never written directly, so the night's rules are always checked.
create table bookings (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events (id) on delete cascade,
  user_id uuid not null references auth.users (id) default auth.uid(),
  code text not null unique check (code ~ '^G-[0-9A-Z]{6}$'),
  couples integer not null default 0 check (couples >= 0),
  stags integer not null default 0 check (stags >= 0),
  girls integer not null default 0 check (girls >= 0),
  passes integer generated always as (couples * 2 + stags + girls) stored,
  amount integer not null default 0 check (amount >= 0),
  payment_ref text,
  status booking_status not null default 'booked',
  created_at timestamptz not null default now(),
  check (couples * 2 + stags + girls between 1 and 20)
);
create index bookings_event_idx on bookings (event_id);
create index bookings_user_idx on bookings (user_id);

-- What the door confirmed. One 'admitted' row per booking at most (no double credit).
-- Walk-ins without a booking have booking_id null.
-- client_id is made on the door phone, so a check-in saved twice (e.g. after a bad connection) is stored once.
create table checkins (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique,
  event_id uuid not null references events (id) on delete cascade,
  booking_id uuid references bookings (id) on delete set null,
  outcome checkin_outcome not null,
  couples integer not null default 0 check (couples >= 0),
  stags integer not null default 0 check (stags >= 0),
  girls integer not null default 0 check (girls >= 0),
  stag_cover integer not null default 0 check (stag_cover >= 0),
  refused_reason refusal_reason,
  note text check (char_length(note) <= 140),
  scanned_by uuid not null references auth.users (id) default auth.uid(),
  scanned_at timestamptz not null default now(),
  check ((outcome = 'refused') = (refused_reason is not null))
);
create unique index checkins_one_admit_per_booking on checkins (booking_id) where outcome = 'admitted';
create index checkins_event_idx on checkins (event_id);

-- ---------------------------------------------------------------- helper checks used by the access rules
-- (security definer so they can look things up without tripping the rules they help enforce)
create function is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from app_admins where user_id = auth.uid());
$$;

create function org_role(org uuid) returns member_role language sql stable security definer set search_path = public as $$
  select role from organiser_members where organiser_id = org and user_id = auth.uid() and removed_at is null;
$$;

create function is_org_owner(org uuid) returns boolean language sql stable as $$
  select coalesce(org_role(org) = 'owner', false);
$$;

create function is_org_staff(org uuid) returns boolean language sql stable as $$
  select org_role(org) is not null;
$$;

create function event_organiser(ev uuid) returns uuid language sql stable security definer set search_path = public as $$
  select organiser_id from events where id = ev;
$$;

create function is_event_owner(ev uuid) returns boolean language sql stable as $$
  select is_org_owner(event_organiser(ev));
$$;

create function is_event_staff(ev uuid) returns boolean language sql stable as $$
  select is_org_staff(event_organiser(ev));
$$;

-- ---------------------------------------------------------------- automatic rules
-- Whoever creates an organiser becomes its owner.
create function organiser_add_owner() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into organiser_members (organiser_id, user_id, role, added_by) values (new.id, new.created_by, 'owner', new.created_by);
  return new;
end $$;
create trigger organisers_add_owner after insert on organisers for each row execute function organiser_add_owner();

-- Only the gathr team can verify an organiser.
create function organiser_guard() returns trigger language plpgsql set search_path = public as $$
begin
  if new.status is distinct from old.status and not is_admin() then
    raise exception 'Only gathr can verify an organiser';
  end if;
  return new;
end $$;
create trigger organisers_guard before update on organisers for each row execute function organiser_guard();

-- Only the gathr team can put a night live. Going live records the time.
create function event_guard() returns trigger language plpgsql set search_path = public as $$
begin
  if new.status = 'live' and (tg_op = 'INSERT' or old.status is distinct from 'live') then
    if not is_admin() then raise exception 'Only gathr can put a night live'; end if;
    new.live_at := now();
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger events_guard before insert or update on events for each row execute function event_guard();

-- ---------------------------------------------------------------- access rules
alter table profiles enable row level security;
alter table app_admins enable row level security;
alter table venues enable row level security;
alter table organisers enable row level security;
alter table organiser_members enable row level security;
alter table events enable row level security;
alter table bookings enable row level security;
alter table checkins enable row level security;

-- profiles: your own row only
create policy "own profile: read" on profiles for select using (id = auth.uid());
create policy "own profile: create" on profiles for insert with check (id = auth.uid());
create policy "own profile: edit" on profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- app_admins: admins can see the list; changes only from the Supabase dashboard
create policy "admins: read" on app_admins for select using (is_admin());

-- venues: everyone can read; any signed-in organiser can add one (for "a venue not listed")
create policy "venues: read" on venues for select using (true);
create policy "venues: add" on venues for insert to authenticated with check (added_by = auth.uid());

-- organisers: public can see verified ones; team members and gathr see their own
create policy "organisers: read" on organisers for select
  using (status = 'verified' or is_org_staff(id) or created_by = auth.uid() or is_admin());
create policy "organisers: create" on organisers for insert to authenticated with check (created_by = auth.uid());
create policy "organisers: owner edits" on organisers for update using (is_org_owner(id) or is_admin());

-- organiser_members: the team can see itself; owners add and remove people
create policy "members: read" on organiser_members for select using (is_org_staff(organiser_id) or user_id = auth.uid() or is_admin());
create policy "members: owner adds" on organiser_members for insert with check (is_org_owner(organiser_id));
create policy "members: owner edits" on organiser_members for update using (is_org_owner(organiser_id));

-- events: everyone sees live nights; the organiser's team sees all of theirs; owners create and edit
create policy "events: read" on events for select using (status = 'live' or is_org_staff(organiser_id) or is_admin());
create policy "events: owner creates" on events for insert with check (is_org_owner(organiser_id));
create policy "events: owner or gathr edits" on events for update using (is_org_owner(organiser_id) or is_admin());

-- bookings: you see your own; the night's team (owner and door) sees the night's bookings.
-- No direct inserts or edits: create_booking() and cancel_booking() do that with the rules checked.
create policy "bookings: read" on bookings for select using (user_id = auth.uid() or is_event_staff(event_id));

-- checkins: only the night's team (owner and door) can read or record them.
-- (The promoters migration adds who gets the credit, flags self-checked guests and limits inflated counts.)
create policy "checkins: staff read" on checkins for select using (is_event_staff(event_id));
create policy "checkins: staff record" on checkins for insert
  with check (is_event_staff(event_id) and scanned_by = auth.uid());

-- Column-level limits on top of the row rules
revoke update on organisers from authenticated, anon;
grant update (name, type, venue_id, insta, phone, status) on organisers to authenticated;  -- status still guarded by organiser_guard
revoke update on organiser_members from authenticated, anon;
grant update (removed_at) on organiser_members to authenticated;
revoke insert, update, delete on bookings from authenticated, anon;
revoke update, delete on checkins from authenticated, anon;

-- ---------------------------------------------------------------- starting data: the venues the app already knows
insert into venues (id, name, area, lat, lng, icon, hue, added_by) values
  ('kukoo', 'Kukoo', 'The Mills, Sangamwadi', 18.5362, 73.8764, 'discoball', 'pink', null),
  ('plunge', 'Plunge', 'Koregaon Park', 18.5388, 73.8934, 'cocktail', 'blue', null),
  ('fml', 'FML', 'Kalyani Nagar', 18.5475, 73.9025, 'headphones', 'green', null),
  ('opus', 'Opus Club & Lounge', 'Baner', 18.5635, 73.7780, 'champagne', 'violet', null),
  ('ozone', 'Ozone', 'Sinhgad Road', 18.4800, 73.8250, 'mic', 'yellow', null),
  ('kopa', 'KOPA Mall', 'Koregaon Park', 18.5352, 73.8988, 'speaker', 'red', null),
  ('epitome', 'Epitome', 'The Mills, Sangamwadi', 18.5346, 73.8779, 'vinyl', 'violet', null),
  ('palacio', 'The Game Palacio', 'The Mills, Sangamwadi', 18.5356, 73.8796, 'spotlight', 'yellow', null),
  ('antisocial', 'Anti Social', 'Shivaji Nagar', 18.5306, 73.8478, 'sunglasses', 'red', null);
