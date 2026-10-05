-- gathr: guest lists (step 4)
--
-- A guest list is free entry for named people, given by the night's host or by a promoter working it.
-- Nobody asks to be on one: the host or promoter adds each guest (by the email they sign in to gathr with)
-- with their named plus-ones. When booking, the guest picks "Guest list" and whose list it is; if they're
-- on it they get free passes, otherwise they're told to ask. Each list can have a cap in people; the host
-- sets the cap on each promoter's list. Promoters can be paid per guest-list person who gets in.
-- Run this in the Supabase SQL Editor after the earlier migrations.

-- ---------------------------------------------------------------- lists and the people on them
create table guest_lists (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events (id) on delete cascade,
  promoter_id uuid references promoters (id),        -- empty = the host's own list
  cap integer check (cap > 0),                          -- in people (guest + plus-ones); empty = no cap
  created_by uuid references auth.users (id) default auth.uid(),
  created_at timestamptz not null default now()
);
create unique index guest_lists_one_host on guest_lists (event_id) where promoter_id is null;
create unique index guest_lists_one_per_promoter on guest_lists (event_id, promoter_id) where promoter_id is not null;

create table guest_list_entries (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references guest_lists (id) on delete cascade,
  event_id uuid not null references events (id) on delete cascade,   -- filled in from the list
  name text not null check (char_length(name) between 2 and 60),
  email text not null check (email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  plus_ones text[] not null default '{}' check (cardinality(plus_ones) <= 10),
  people integer generated always as (1 + cardinality(plus_ones)) stored,
  note text check (char_length(note) <= 80),
  booking_id uuid,                                      -- set when the guest takes their free passes
  added_by uuid not null references auth.users (id) default auth.uid(),
  created_at timestamptz not null default now(),
  removed_at timestamptz
);
create unique index guest_list_entries_once on guest_list_entries (list_id, email) where removed_at is null;
create index guest_list_entries_by_email on guest_list_entries (email) where removed_at is null;

-- the list's night, a tidy email, named plus-ones, and the list's cap
create function guest_entry_rules() returns trigger language plpgsql security definer set search_path = public as $$
declare l guest_lists; used integer;
begin
  select * into l from guest_lists where id = new.list_id;
  new.event_id := l.event_id;
  new.email := lower(trim(new.email));
  new.name := trim(new.name);
  if exists (select 1 from unnest(new.plus_ones) n where char_length(trim(n)) < 2) then
    raise exception 'Give every plus-one a name';
  end if;
  if new.removed_at is null and l.cap is not null then
    select coalesce(sum(people), 0) into used from guest_list_entries
      where list_id = l.id and removed_at is null and id <> new.id;
    if used + 1 + cardinality(new.plus_ones) > l.cap then
      raise exception 'This guest list is full (% people)', l.cap;
    end if;
  end if;
  return new;
end $$;
create trigger guest_list_entries_rules before insert or update on guest_list_entries
  for each row execute function guest_entry_rules();

-- who can add, change and remove people on a list: the host on their own list, a promoter on theirs
create function can_edit_guest_list(list uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from guest_lists l
    where l.id = list and (
      (l.promoter_id is null and is_event_owner(l.event_id))
      or (l.promoter_id = my_promoter_id() and promoter_works_for(event_organiser(l.event_id), l.promoter_id))
    )
  );
$$;

-- ---------------------------------------------------------------- guest-list passes are free bookings
-- They count towards the night's capacity like any pass. passes now counts guest-list people too.
alter table bookings
  add column guests integer not null default 0 check (guests >= 0),
  add column guest_entry_id uuid references guest_list_entries (id);
do $$
declare c text;
begin
  for c in select conname from pg_constraint
    where conrelid = 'bookings'::regclass and contype = 'c' and pg_get_constraintdef(oid) like '%couples * 2%' and pg_get_constraintdef(oid) like '%20%'
  loop
    execute format('alter table bookings drop constraint %I', c);
  end loop;
end $$;
alter table bookings drop column passes;
alter table bookings add column passes integer generated always as (couples * 2 + stags + girls + guests) stored;
alter table bookings add constraint bookings_size check (couples * 2 + stags + girls + guests between 1 and 20);
alter table guest_list_entries add foreign key (booking_id) references bookings (id) on delete set null;

-- promoters can be paid per guest-list person who gets in
alter table deals add column guest_rate integer check (guest_rate >= 0);   -- ₹ per guest-list person (empty = not paid)
grant update (guest_rate) on deals to authenticated;

-- ---------------------------------------------------------------- actions
-- The lists on a live night, by whose they are (for the "Whose list?" choice when booking).
create function event_guest_lists(ev uuid)
returns table (list_id uuid, owner text, is_host boolean)
language sql stable security definer set search_path = public as $$
  select l.id,
         case when l.promoter_id is null then o.name else p.display_name end,
         l.promoter_id is null
    from guest_lists l
    join events e on e.id = l.event_id and e.status = 'live'
    join organisers o on o.id = e.organiser_id
    left join promoters p on p.id = l.promoter_id
   where l.event_id = ev
     and (l.promoter_id is null or promoter_works_for(e.organiser_id, l.promoter_id))
   order by l.promoter_id is not null, 2;
$$;

-- The guest lists you're on, for nights still to come (so the app can tell you, and pre-select them).
create function my_guest_lists()
returns table (entry_id uuid, event_id uuid, list_id uuid, owner text, plus_ones text[], booking_id uuid, added_at timestamptz)
language sql stable security definer set search_path = public as $$
  select g.id, g.event_id, g.list_id,
         case when l.promoter_id is null then o.name else p.display_name end,
         g.plus_ones,
         (select b.id from bookings b where b.id = g.booking_id and b.status = 'booked'),
         g.created_at
    from guest_list_entries g
    join guest_lists l on l.id = g.list_id
    join events e on e.id = g.event_id and e.status = 'live' and coalesce(e.ends_at, e.starts_at + interval '8 hours') > now()
    join organisers o on o.id = e.organiser_id
    left join promoters p on p.id = l.promoter_id
   where g.removed_at is null and auth.uid() is not null and g.email = lower(auth.email())
   order by e.starts_at;
$$;

-- Take your free passes from a guest list. Only works if the email you're signed in with is on the list.
-- Asking again gives the same passes back.
create function claim_guest_list(ev uuid, list uuid) returns bookings language plpgsql security definer set search_path = public as $$
declare e events; l guest_lists; g guest_list_entries; b bookings; d deals; taken integer; new_code text;
begin
  if auth.uid() is null then raise exception 'Sign in to get your passes'; end if;
  select * into e from events where id = ev;
  if e.id is null or e.status <> 'live' then raise exception 'This night isn''t open for booking'; end if;
  if coalesce(e.ends_at, e.starts_at + interval '8 hours') < now() then raise exception 'This night has ended'; end if;
  select * into l from guest_lists where id = list and event_id = ev;
  if l.id is null then raise exception 'That guest list isn''t on this night'; end if;
  if l.promoter_id is not null and not promoter_works_for(e.organiser_id, l.promoter_id) then
    raise exception 'That promoter isn''t working this night';
  end if;
  select * into g from guest_list_entries
    where list_id = l.id and email = lower(auth.email()) and removed_at is null for update;
  if g.id is null then raise exception 'You''re not on this guest list'; end if;
  if g.booking_id is not null then
    select * into b from bookings where id = g.booking_id and status = 'booked';
    if b.id is not null then return b; end if;
  end if;
  if e.capacity is not null then
    select coalesce(sum(passes), 0) into taken from bookings where event_id = ev and status = 'booked';
    if taken + g.people > e.capacity then raise exception 'The night is full'; end if;
  end if;
  select * into d from deals where event_id = ev order by version desc limit 1;
  loop
    new_code := 'G-' || upper(substr(translate(encode(extensions.gen_random_bytes(8), 'base64'), '+/=lIO0', ''), 1, 6));
    exit when new_code ~ '^G-[0-9A-Z]{6}$' and not exists (select 1 from bookings where code = new_code);
  end loop;
  insert into bookings (event_id, user_id, code, guests, amount, promoter_id, deal_id, guest_entry_id)
  values (ev, auth.uid(), new_code, g.people, 0, l.promoter_id,
          case when l.promoter_id is not null and d.enabled then d.id end, g.id)
  returning * into b;
  update guest_list_entries set booking_id = b.id where id = g.id;
  return b;
end $$;

-- Who's coming, for the night's team: bookings (paid and guest list) and guest-list people who haven't
-- taken their passes yet, so the door can find them by name. (Replaces the step 3 version.)
drop function event_guests(uuid);
create function event_guests(ev uuid)
returns table (
  booking_id uuid,
  code text,
  name text,
  couples integer,
  stags integer,
  girls integer,
  guests integer,
  passes integer,
  booked_at timestamptz,
  via_promoter boolean,
  guest_list text,        -- whose guest list (empty for a paid booking)
  plus_ones text[]
)
language plpgsql stable security definer set search_path = public as $$
begin
  if not (is_event_staff(ev) or is_admin()) then
    raise exception 'Only the night''s team can see who''s coming';
  end if;
  return query
    select b.id, b.code,
           coalesce(g.name, nullif(p.full_name, ''), nullif(p.first_name, ''), 'Guest'),
           b.couples, b.stags, b.girls, b.guests, b.passes, b.created_at, b.promoter_id is not null,
           case when g.id is null then null when l.promoter_id is null then o.name else pr.display_name end,
           coalesce(g.plus_ones, '{}')
      from bookings b
      join events e on e.id = b.event_id
      join organisers o on o.id = e.organiser_id
      left join profiles p on p.id = b.user_id
      left join guest_list_entries g on g.id = b.guest_entry_id
      left join guest_lists l on l.id = g.list_id
      left join promoters pr on pr.id = l.promoter_id
     where b.event_id = ev and b.status = 'booked'
    union all
    select null, null, g.name, 0, 0, 0, g.people, g.people, g.created_at, l.promoter_id is not null,
           case when l.promoter_id is null then o.name else pr.display_name end,
           g.plus_ones
      from guest_list_entries g
      join guest_lists l on l.id = g.list_id
      join events e on e.id = g.event_id
      join organisers o on o.id = e.organiser_id
      left join promoters pr on pr.id = l.promoter_id
     where g.event_id = ev and g.removed_at is null
       and not exists (select 1 from bookings b where b.id = g.booking_id and b.status = 'booked')
    order by 9;
end $$;

-- ---------------------------------------------------------------- access rules
alter table guest_lists enable row level security;
alter table guest_list_entries enable row level security;

-- lists: the night's team and the list's promoter can see them; the host makes and caps every list
create policy "guest lists: read" on guest_lists for select
  using (is_event_staff(event_id) or promoter_id = my_promoter_id() or is_admin());
create policy "guest lists: host creates" on guest_lists for insert to authenticated
  with check (is_event_owner(event_id)
              and (promoter_id is null or promoter_works_for(event_organiser(event_id), promoter_id)));
create policy "guest lists: host sets caps" on guest_lists for update to authenticated using (is_event_owner(event_id));
create policy "guest lists: host removes" on guest_lists for delete to authenticated using (is_event_owner(event_id));
revoke update on guest_lists from authenticated, anon;
grant update (cap) on guest_lists to authenticated;

-- people: the night's team sees everyone; a promoter sees their own list; a guest sees their own entries
create policy "guest list people: read" on guest_list_entries for select
  using (is_event_staff(event_id)
         or exists (select 1 from guest_lists l where l.id = list_id and l.promoter_id = my_promoter_id())
         or email = lower(auth.email())
         or is_admin());
create policy "guest list people: list owner adds" on guest_list_entries for insert to authenticated
  with check (added_by = auth.uid() and booking_id is null and can_edit_guest_list(list_id));
-- the list's owner changes names and plus-ones; the host can also take anyone off a list on their night
create policy "guest list people: owner edits" on guest_list_entries for update to authenticated
  using (can_edit_guest_list(list_id) or is_event_owner(event_id));
revoke update, delete on guest_list_entries from authenticated, anon;
grant update (name, plus_ones, note, removed_at) on guest_list_entries to authenticated;

revoke execute on function event_guest_lists(uuid) from public;
revoke execute on function my_guest_lists() from public, anon;
revoke execute on function claim_guest_list(uuid, uuid) from public, anon;
revoke execute on function event_guests(uuid) from public, anon, authenticated;
revoke execute on function can_edit_guest_list(uuid) from public, anon;
grant execute on function event_guest_lists(uuid) to anon, authenticated;
grant execute on function my_guest_lists() to authenticated;
grant execute on function claim_guest_list(uuid, uuid) to authenticated;
grant execute on function event_guests(uuid) to authenticated;
grant execute on function can_edit_guest_list(uuid) to authenticated;
