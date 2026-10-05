-- gathr: reviewing nights at scale (step 9)
--
-- * Trust: a new host's nights are checked by gathr. A verified host whose nights gathr has put live 3 times is
--   trusted: their nights go live straight away, unless something looks off (the flags below). gathr can trust or
--   untrust a host by hand.
-- * Flags, worked out when a night is sent for review:
--     new_host      the host isn't trusted yet
--     new_venue     the venue was added by a host in the last 14 days (gathr hasn't seen it before)
--     duplicate     another night at the same venue within 3 hours of this one
--     odd_price     a paid night under ₹100 or over ₹5,000
--     reported      guests reported this night
--     low_checkins  fewer than 3 in 10 people with passes turned up at the host's recent nights
--   (Checking the poster against the form needs the poster-reading step, which is parked.)
-- * Guests can report a night. Three reports on a host's nights take their trust away and tell gathr.
-- * Notifications: the host hears their night was submitted, put live, sent back (with gathr's note) or
--   rejected; gathr's admins hear when a night needs review.
-- Run this in the Supabase SQL Editor after the earlier migrations.

-- ---------------------------------------------------------------- what's stored
alter table organisers add column trusted boolean not null default false;
alter table events
  add column flags text[] not null default '{}',
  add column review_note text check (char_length(review_note) <= 200);

create table night_reports (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  reason text not null check (reason in ('fake', 'wrong_info', 'unsafe', 'cancelled', 'other')),
  note text check (char_length(note) <= 200),
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

-- ---------------------------------------------------------------- the checks
-- Of the people with passes at a host's nights that ended in the last 60 days, how many came in (null = too few to tell)
create function host_turnout(org uuid) returns numeric language sql stable security definer set search_path = public as $$
  with nights as (
    select e.id from events e
     where e.organiser_id = org and e.status = 'live'
       and coalesce(e.ends_at, e.starts_at + interval '8 hours') between now() - interval '60 days' and now()
  ), passes as (
    select coalesce(sum(b.passes), 0) as n from bookings b where b.event_id in (select id from nights) and b.status = 'booked'
  ), came as (
    select coalesce(sum(c.couples * 2 + c.stags + c.girls + c.guests), 0) as n
      from checkins c where c.event_id in (select id from nights) and c.outcome = 'admitted'
  )
  select case when (select n from passes) < 20 then null else round((select n from came)::numeric / (select n from passes), 2) end;
$$;

create function night_flags(e events) returns text[] language plpgsql stable security definer set search_path = public as $$
declare f text[] := '{}'; o organisers; v venues; t numeric;
begin
  select * into o from organisers where id = e.organiser_id;
  select * into v from venues where id = e.venue_id;
  if not o.trusted then f := array_append(f, 'new_host'); end if;
  if v.added_by is not null and v.created_at > now() - interval '14 days'
     and not exists (select 1 from app_admins a where a.user_id = v.added_by) then
    f := array_append(f, 'new_venue');
  end if;
  if exists (select 1 from events x
              where x.id <> e.id and x.venue_id = e.venue_id and x.status in ('review', 'live')
                and abs(extract(epoch from (x.starts_at - e.starts_at))) < 3 * 3600) then
    f := array_append(f, 'duplicate');
  end if;
  if e.entry in ('paid', 'door') and e.price is not null and (e.price < 100 or e.price > 5000) then
    f := array_append(f, 'odd_price');
  end if;
  if exists (select 1 from night_reports r where r.event_id = e.id) then f := array_append(f, 'reported'); end if;
  t := host_turnout(e.organiser_id);
  if t is not null and t < 0.3 then f := array_append(f, 'low_checkins'); end if;
  return f;
end $$;

-- Sending a night for review works out its flags. A trusted host's night with no flags goes live straight away.
-- Only gathr puts a night live otherwise, and only gathr writes flags and review notes.
create or replace function event_guard() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then
    new.flags := case when tg_op = 'UPDATE' then old.flags else '{}' end;
    new.review_note := case when tg_op = 'UPDATE' then old.review_note else null end;
  end if;
  if new.status = 'review' and (tg_op = 'INSERT' or old.status is distinct from 'review') then
    new.flags := night_flags(new);
    new.review_note := null;
    if cardinality(new.flags) = 0 then
      new.status := 'live';   -- a trusted host, nothing odd: no need to wait for gathr
      new.live_at := now();
    end if;
  elsif new.status = 'live' and (tg_op = 'INSERT' or old.status is distinct from 'live') then
    if not is_admin() then raise exception 'Only gathr can put a night live'; end if;
    new.live_at := now();
  end if;
  new.updated_at := now();
  return new;
end $$;

-- After gathr puts a verified host's third night live, the host is trusted.
create function trust_after_three() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'live' and (tg_op = 'INSERT' or old.status is distinct from 'live') then
    update organisers o set trusted = true
     where o.id = new.organiser_id and not o.trusted and o.status = 'verified'
       and (select count(*) from events e where e.organiser_id = o.id and e.live_at is not null) >= 3
       and (select count(*) from night_reports r join events e on e.id = r.event_id where e.organiser_id = o.id) < 3;
  end if;
  return new;
end $$;
create trigger events_trust after insert or update of status on events for each row execute function trust_after_three();

-- gathr trusts or untrusts a host by hand
create function set_trusted(org uuid, yes boolean) returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'Only gathr can change who''s trusted'; end if;
  update organisers set trusted = yes where id = org;
end $$;

-- a guest reports a night: three reports across a host's nights take their trust away, and gathr hears about it
create function report_rules() returns trigger language plpgsql security definer set search_path = public as $$
declare e events; n integer; who uuid;
begin
  select * into e from events where id = new.event_id;
  if e.id is null or e.status <> 'live' then raise exception 'You can only report a night that''s on gathr'; end if;
  select count(*) into n from night_reports r join events x on x.id = r.event_id where x.organiser_id = e.organiser_id;
  if n >= 3 then
    update organisers set trusted = false where id = e.organiser_id and trusted;
  end if;
  for who in select user_id from app_admins loop
    perform notify(who, null, 'night_reported', e.title || ' was reported',
      'Reason: ' || replace(new.reason, '_', ' ') || coalesce(' · ' || new.note, '') || '.',
      jsonb_build_object('kind', 'night_reported', 'event_id', e.id));
  end loop;
  return new;
end $$;
create trigger night_reports_rules after insert on night_reports for each row execute function report_rules();

-- ---------------------------------------------------------------- notifications for the host and for gathr
create or replace function notify_night() returns trigger language plpgsql security definer set search_path = public as $$
declare who uuid; was event_status := case when tg_op = 'UPDATE' then old.status end;
begin
  if new.status is not distinct from was then return new; end if;
  if new.status = 'live' then
    for who in select night_owners(new.organiser_id) loop
      perform notify(who, null, 'night_live', new.title || ' is live',
        'Guests can book it now. ' || when_txt(new.starts_at) || '.',
        jsonb_build_object('kind', 'night_live', 'event_id', new.id));
    end loop;
  elsif new.status = 'review' then
    for who in select night_owners(new.organiser_id) loop
      perform notify(who, null, 'night_submitted', 'We got ' || new.title,
        'gathr checks it before it goes live, usually within a day.',
        jsonb_build_object('kind', 'night_submitted', 'event_id', new.id));
    end loop;
    for who in select user_id from app_admins loop
      perform notify(who, null, 'night_review', new.title || ' needs a check',
        coalesce(nullif(array_to_string(new.flags, ', '), ''), 'nothing flagged') || ' · ' || when_txt(new.starts_at),
        jsonb_build_object('kind', 'night_review', 'event_id', new.id));
    end loop;
  elsif was = 'review' and new.status = 'draft' then
    for who in select night_owners(new.organiser_id) loop
      perform notify(who, null, 'night_back', new.title || ' was sent back',
        coalesce(new.review_note, 'gathr has a question about it.') || ' Check the details and send it again.',
        jsonb_build_object('kind', 'night_back', 'event_id', new.id));
    end loop;
  elsif was = 'review' and new.status = 'removed' then
    for who in select night_owners(new.organiser_id) loop
      perform notify(who, null, 'night_rejected', new.title || ' wasn’t approved',
        coalesce(new.review_note, 'It doesn’t fit gathr’s rules.'),
        jsonb_build_object('kind', 'night_rejected', 'event_id', new.id));
    end loop;
  end if;
  return new;
end $$;
drop trigger events_notify on events;
create trigger events_notify after insert or update of status on events for each row execute function notify_night();

-- ---------------------------------------------------------------- what gathr's review screen reads
-- Nights waiting for a check, with their flags and the host's record.
create function review_queue()
returns table (event_id uuid, title text, starts_at timestamptz, venue text, host text, host_id uuid, insta text,
               host_verified boolean, host_trusted boolean, host_nights integer, turnout numeric, reports integer,
               flags text[], entry entry_type, price integer, min_age integer, stag_policy stag_policy,
               poster_url text, about text, family text, kind text)
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'Only gathr can see the review queue'; end if;
  return query
    select e.id, e.title, e.starts_at, v.name, o.name, o.id, o.insta, o.status = 'verified', o.trusted,
           (select count(*)::int from events x where x.organiser_id = o.id and x.live_at is not null),
           host_turnout(o.id),
           (select count(*)::int from night_reports r join events x on x.id = r.event_id where x.organiser_id = o.id),
           e.flags, e.entry, e.price, e.min_age, e.stag_policy, e.poster_url, e.about, e.family, e.kind
      from events e join organisers o on o.id = e.organiser_id join venues v on v.id = e.venue_id
     where e.status = 'review'
     order by cardinality(e.flags) desc, e.starts_at;
end $$;

-- ---------------------------------------------------------------- access rules
alter table night_reports enable row level security;
create policy "reports: send" on night_reports for insert to authenticated with check (user_id = auth.uid());
create policy "reports: yours, or gathr sees all" on night_reports for select using (user_id = auth.uid() or is_admin());
revoke update, delete on night_reports from authenticated, anon;
revoke all on night_reports from anon;

revoke execute on function host_turnout(uuid) from public, anon, authenticated;
revoke execute on function night_flags(events) from public, anon, authenticated;
revoke execute on function set_trusted(uuid, boolean) from public, anon;
revoke execute on function review_queue() from public, anon;
grant execute on function set_trusted(uuid, boolean) to authenticated;
grant execute on function review_queue() to authenticated;
