-- gathr: door check-ins for guest lists (step 5)
--
-- Door phones record check-ins in the database (the checkins table from the foundation migration), so every
-- door phone and the host see the same list. This adds what guest lists need: their people come in by name,
-- one or a few at a time (two of a party of four now, the rest later), never twice, and a promoter is
-- credited for their own guest-list people. A paid booking still comes in once. A door phone can undo its own
-- check-in for 10 minutes. Payout lines get a count of guest-list people for promoters' statements.
-- Run this in the Supabase SQL Editor after the earlier migrations.

alter type attribution add value if not exists 'guest_list';   -- credited because they came on a promoter's guest list

alter table checkins
  add column guest_entry_id uuid references guest_list_entries (id),
  add column guest_names text[] not null default '{}',
  add column guests integer not null default 0 check (guests >= 0);

-- a paid booking comes in once; guest-list people come in name by name (checked in checkin_rules)
drop index if exists checkins_one_admit_per_booking;
create unique index checkins_one_admit_per_paid_booking on checkins (booking_id)
  where outcome = 'admitted' and guest_entry_id is null;
create index checkins_by_guest_entry on checkins (guest_entry_id) where guest_entry_id is not null;

alter table payout_lines add column guests integer not null default 0;   -- guest-list people let in

-- The door's rules. The credit is always worked out here, never taken from what the door phone sends.
create or replace function checkin_rules() returns trigger language plpgsql security definer set search_path = public as $$
declare b bookings; g guest_list_entries; l guest_lists; cover integer; allowed text[]; inside text[];
begin
  -- only the night's team records check-ins (said first, so nothing about the guests leaks to anyone else)
  if not is_event_staff(new.event_id) then raise exception 'Only the night''s team can check people in'; end if;
  if new.booking_id is not null then
    select * into b from bookings where id = new.booking_id;
    if b.event_id <> new.event_id then raise exception 'This pass is for a different night'; end if;
    if b.status <> 'booked' then raise exception 'This booking was cancelled'; end if;
    if b.guest_entry_id is not null then new.guest_entry_id := b.guest_entry_id; end if;
  end if;

  if new.guest_entry_id is not null then
    -- guest list: named people, let in one or a few at a time
    select * into g from guest_list_entries where id = new.guest_entry_id;
    if g.id is null or g.event_id <> new.event_id then raise exception 'This guest isn''t on a list for this night'; end if;
    if g.removed_at is not null then raise exception 'This guest was taken off the list'; end if;
    if new.couples + new.stags + new.girls > 0 or new.stag_cover > 0 then
      raise exception 'Guest-list people are checked in by name';
    end if;
    if cardinality(new.guest_names) = 0 then raise exception 'Pick who''s here'; end if;
    allowed := array[g.name] || g.plus_ones;
    if exists (select 1 from unnest(new.guest_names) n where not (n = any (allowed))) then
      raise exception 'Only the people named on the list can come in on it';
    end if;
    if (select count(distinct n) from unnest(new.guest_names) n) <> cardinality(new.guest_names) then
      raise exception 'Each person once';
    end if;
    if new.outcome = 'admitted' then
      select coalesce(array_agg(n), '{}') into inside
        from checkins c, unnest(c.guest_names) n
       where c.guest_entry_id = g.id and c.outcome = 'admitted';
      if exists (select 1 from unnest(new.guest_names) n where n = any (inside)) then
        raise exception 'Already in: %', (select string_agg(n, ', ') from unnest(new.guest_names) n where n = any (inside));
      end if;
    end if;
    new.guests := cardinality(new.guest_names);
    select * into l from guest_lists where id = g.list_id;
    new.promoter_id := l.promoter_id;
    new.attribution := case when l.promoter_id is null then 'none' else 'guest_list' end::attribution;
  else
    -- a paid booking (or someone without one): couples, guys and girls, as before
    if cardinality(new.guest_names) > 0 or new.guests > 0 then raise exception 'Names are only for guest lists'; end if;
    if b.id is not null and (new.couples > b.couples or new.couples * 2 + new.stags + new.girls > b.passes) then
      raise exception 'More people than this booking has (% booked)', b.passes;
    end if;
    if new.stag_cover > 0 then
      if new.stags = 0 then raise exception 'Stag cover needs at least one stag'; end if;
      select price into cover from events where id = new.event_id;
      if cover is not null and new.stag_cover > cover * new.stags then
        raise exception 'Stag cover can''t be more than ₹% per stag', cover;
      end if;
    end if;
    if b.promoter_id is not null then
      new.promoter_id := b.promoter_id;
      new.attribution := 'link';
    elsif new.promoter_id is null then
      new.attribution := 'none';
    else
      if not promoter_works_for(event_organiser(new.event_id), new.promoter_id) then
        raise exception 'That promoter isn''t working this night';
      end if;
      new.attribution := 'door_assigned';
    end if;
  end if;
  new.self_checked := new.promoter_id is not null and new.promoter_id is not distinct from my_promoter_id();
  return new;
end $$;

-- a door phone can take back its own check-in for 10 minutes (a mis-tap), never someone else's
create policy "checkins: undo your own, briefly" on checkins for delete to authenticated
  using (is_event_staff(event_id) and scanned_by = auth.uid() and scanned_at > now() - interval '10 minutes');
grant delete on checkins to authenticated;

-- Who's coming now also says which guest-list entry each row is, so the door can let in people who
-- haven't taken their passes yet. (Replaces the step 4 version.)
drop function event_guests(uuid);
create function event_guests(ev uuid)
returns table (
  booking_id uuid,
  entry_id uuid,
  code text,
  name text,
  couples integer,
  stags integer,
  girls integer,
  guests integer,
  passes integer,
  booked_at timestamptz,
  via_promoter boolean,
  guest_list text,
  plus_ones text[]
)
language plpgsql stable security definer set search_path = public as $$
begin
  if not (is_event_staff(ev) or is_admin()) then
    raise exception 'Only the night''s team can see who''s coming';
  end if;
  return query
    select b.id, g.id, b.code,
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
    select null, g.id, null, g.name, 0, 0, 0, g.people, g.people, g.created_at, l.promoter_id is not null,
           case when l.promoter_id is null then o.name else pr.display_name end,
           g.plus_ones
      from guest_list_entries g
      join guest_lists l on l.id = g.list_id
      join events e on e.id = g.event_id
      join organisers o on o.id = e.organiser_id
      left join promoters pr on pr.id = l.promoter_id
     where g.event_id = ev and g.removed_at is null
       and not exists (select 1 from bookings b where b.id = g.booking_id and b.status = 'booked')
    order by 10;
end $$;
revoke execute on function event_guests(uuid) from public, anon, authenticated;
grant execute on function event_guests(uuid) to authenticated;
