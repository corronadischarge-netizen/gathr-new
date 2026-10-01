-- gathr: promoter guestlists and payouts
-- Deals per night, promoters and agencies, per-night links and door codes, link opens (referrals),
-- who brought each booking, door check-ins credited to promoters, and payout lines.
-- Pay always follows what the door confirmed, never what was booked.

-- ---------------------------------------------------------------- types
create type person_status as enum ('active', 'removed');
create type invite_kind as enum ('door', 'promoter', 'agency', 'agency_promoter');
create type payer_type as enum ('host', 'agency');

-- ---------------------------------------------------------------- the deal for a night
-- Versioned: version 1, 2, 3… Once the night is live its versions are locked; a change after that
-- is a new version, used only by bookings made from then on. Each booking stores the version it got.
create table deals (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events (id) on delete cascade,
  version integer not null,
  enabled boolean not null default true,
  couple_rate integer not null default 0 check (couple_rate >= 0),          -- ₹ per couple who walks in
  stag_pct numeric(5, 2) check (stag_pct between 0 and 100),               -- % of a stag's cover charge…
  stag_flat integer check (stag_flat >= 0),                                 -- …or a flat ₹ per stag (cover paid at the door)
  girls_rate integer check (girls_rate >= 0),                               -- ₹ per girl, counted one by one (empty = girls not paid)
  cap integer check (cap > 0),                                              -- max paid guests per promoter, in people (a couple = 2; empty = no cap)
  created_by uuid references auth.users (id) default auth.uid(),
  created_at timestamptz not null default now(),
  locked_at timestamptz,
  unique (event_id, version),
  check (stag_pct is null or stag_flat is null)
);

-- ---------------------------------------------------------------- agencies and promoters
create table agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 40),
  manager_id uuid not null references auth.users (id) default auth.uid(),
  created_at timestamptz not null default now(),
  removed_at timestamptz
);

-- One promoter profile per person. agency_id empty = independent (paid by the host).
create table promoters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 30),
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,30}$'),             -- used in their links
  agency_id uuid references agencies (id),
  status person_status not null default 'active',
  created_at timestamptz not null default now()
);

-- Which hosts work with which independent promoters and agencies. Removing sets removed_at.
create table organiser_promoters (
  organiser_id uuid not null references organisers (id) on delete cascade,
  promoter_id uuid not null references promoters (id) on delete cascade,
  added_by uuid references auth.users (id) default auth.uid(),
  created_at timestamptz not null default now(),
  removed_at timestamptz,
  primary key (organiser_id, promoter_id)
);

create table organiser_agencies (
  organiser_id uuid not null references organisers (id) on delete cascade,
  agency_id uuid not null references agencies (id) on delete cascade,
  added_by uuid references auth.users (id) default auth.uid(),
  created_at timestamptz not null default now(),
  removed_at timestamptz,
  primary key (organiser_id, agency_id)
);

-- What an agency pays each of its promoters. Only the agency manager can see it
-- (each promoter sees just their own earnings, worked out by the statement).
create table agency_rates (
  agency_id uuid not null references agencies (id) on delete cascade,
  promoter_id uuid not null references promoters (id) on delete cascade,
  couple_rate integer not null default 0 check (couple_rate >= 0),
  stag_pct numeric(5, 2) check (stag_pct between 0 and 100),
  stag_flat integer check (stag_flat >= 0),
  girls_rate integer check (girls_rate >= 0),
  updated_at timestamptz not null default now(),
  primary key (agency_id, promoter_id),
  check (stag_pct is null or stag_flat is null)
);

-- A promoter's short door code for one night (e.g. RAHUL7). Their link is …#e=<night>&p=<code>.
create table event_promoter_codes (
  event_id uuid not null references events (id) on delete cascade,
  promoter_id uuid not null references promoters (id) on delete cascade,
  code text not null check (code ~ '^[A-Z0-9]{4,8}$'),
  created_at timestamptz not null default now(),
  primary key (event_id, promoter_id),
  unique (event_id, code)
);

-- Invites expire (7 days by default) and can be withdrawn in one tap.
create table invites (
  id uuid primary key default gen_random_uuid(),
  token text not null unique default encode(extensions.gen_random_bytes(16), 'hex'),
  kind invite_kind not null,
  organiser_id uuid references organisers (id) on delete cascade,
  agency_id uuid references agencies (id) on delete cascade,
  created_by uuid not null references auth.users (id) default auth.uid(),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  accepted_by uuid references auth.users (id),
  accepted_at timestamptz,
  revoked_at timestamptz,
  check ((kind = 'agency_promoter') = (agency_id is not null and organiser_id is null)),
  check ((kind <> 'agency_promoter') = (organiser_id is not null and agency_id is null))
);

-- Every time someone opens a promoter's link (signed in or not). Used for attribution and the funnel.
create table referrals (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events (id) on delete cascade,
  promoter_id uuid not null references promoters (id) on delete cascade,
  opened_at timestamptz not null default now()
);
create index referrals_promoter_idx on referrals (promoter_id, event_id);

-- ---------------------------------------------------------------- additions to bookings and check-ins
alter table bookings
  add column referral_id uuid references referrals (id),
  add column promoter_id uuid references promoters (id),
  add column deal_id uuid references deals (id),
  add column over_cap boolean not null default false;
create index bookings_promoter_idx on bookings (promoter_id, event_id);

alter table checkins
  add column promoter_id uuid references promoters (id),
  add column attribution attribution not null default 'none',
  add column self_checked boolean not null default false;   -- the promoter credited is the one who scanned (flagged on the statement)

-- ---------------------------------------------------------------- payout lines
-- One line per payee per night. payer 'host': the host pays an independent promoter or an agency.
-- payer 'agency': an agency pays one of its promoters (its private split).
-- Counts and amounts are filled in by the statement (a later step); lines are frozen when locked.
create table payout_lines (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events (id) on delete cascade,
  payer payer_type not null,
  promoter_id uuid references promoters (id),
  agency_id uuid references agencies (id),
  couples integer not null default 0,
  stags integer not null default 0,
  stag_cover integer not null default 0,
  girls integer not null default 0,
  refused integer not null default 0,
  amount integer not null default 0,
  locked_at timestamptz,
  disputed_note text check (char_length(disputed_note) <= 280),
  disputed_by uuid references auth.users (id),
  disputed_at timestamptz,
  paid_ref text check (char_length(paid_ref) <= 60),
  paid_at timestamptz,
  paid_by uuid references auth.users (id),
  check (payer <> 'host' or ((promoter_id is null) <> (agency_id is null))),
  check (payer <> 'agency' or (promoter_id is not null and agency_id is not null))
);
create unique index payout_lines_one_per_payee on payout_lines
  (event_id, payer, coalesce(promoter_id, '00000000-0000-0000-0000-000000000000'), coalesce(agency_id, '00000000-0000-0000-0000-000000000000'));

-- ---------------------------------------------------------------- helper checks
create function my_promoter_id() returns uuid language sql stable security definer set search_path = public as $$
  select id from promoters where user_id = auth.uid();
$$;

create function is_agency_manager(ag uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from agencies where id = ag and manager_id = auth.uid() and removed_at is null);
$$;

-- Does this promoter currently work for this host (directly, or through an agency the host works with)?
create function promoter_works_for(org uuid, pr uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from promoters p
    where p.id = pr and p.status = 'active' and (
      exists (select 1 from organiser_promoters op where op.organiser_id = org and op.promoter_id = p.id and op.removed_at is null)
      or exists (select 1 from organiser_agencies oa join agencies a on a.id = oa.agency_id
                 where oa.organiser_id = org and oa.agency_id = p.agency_id and oa.removed_at is null and a.removed_at is null)
    )
  );
$$;

-- Can the current user see this night's deal? The host, gathr, independent promoters working for the host
-- (the host pays them by this deal) and agency managers. Agency promoters can't: their agency sets their rate,
-- and they only see their own earnings.
create function can_see_deal(ev uuid) returns boolean language sql stable security definer set search_path = public as $$
  select is_event_owner(ev) or is_admin()
    or exists (select 1 from organiser_promoters op join promoters p on p.id = op.promoter_id
               where op.organiser_id = event_organiser(ev) and op.removed_at is null
                 and p.user_id = auth.uid() and p.agency_id is null and p.status = 'active')
    or exists (select 1 from organiser_agencies oa join agencies a on a.id = oa.agency_id
               where oa.organiser_id = event_organiser(ev) and oa.removed_at is null and a.manager_id = auth.uid());
$$;

-- ---------------------------------------------------------------- automatic rules: deals
-- New deals get the next version number for that night.
create function deal_number() returns trigger language plpgsql security definer set search_path = public as $$
begin
  select coalesce(max(version), 0) + 1 into new.version from deals where event_id = new.event_id;
  new.locked_at := case when exists (select 1 from events where id = new.event_id and status = 'live') then now() end;
  return new;
end $$;
create trigger deals_number before insert on deals for each row execute function deal_number();

-- A locked deal can't be changed or deleted; add a new version instead.
create function deal_guard() returns trigger language plpgsql set search_path = public as $$
begin
  if old.locked_at is not null then
    raise exception 'This deal is locked because the night is live. Save a new version instead.';
  end if;
  return coalesce(new, old);
end $$;
create trigger deals_guard before update or delete on deals for each row execute function deal_guard();

-- When a night goes live, lock its deals.
create function lock_deals_when_live() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'live' and old.status is distinct from 'live' then
    update deals set locked_at = now() where event_id = new.id and locked_at is null;
  end if;
  return new;
end $$;
create trigger events_lock_deals after update on events for each row execute function lock_deals_when_live();

-- ---------------------------------------------------------------- automatic rules: check-ins
-- Who gets the credit:
--   · a booking made through a promoter's link stays theirs (attribution 'link'); the door can't change it
--   · a walk-in or a booking with no link can be given to a promoter at the door ("Whose list?" → 'door_assigned')
-- A promoter who also works the door may check in their own guests, but those check-ins are marked
-- self_checked so the host sees them on the statement and can question them.
-- Safeguards against inflated numbers, whoever is scanning:
--   · for a booking, the door can't record more couples, or more people, than were booked
--     (a couple arriving as one person can still be recorded as 1 stag or 1 girl)
--   · stag cover can't be more than the night's cover price × the stags let in
create function checkin_rules() returns trigger language plpgsql security definer set search_path = public as $$
declare b bookings; cover integer;
begin
  -- the credit is always worked out here, never taken from what the door phone sends
  if new.booking_id is not null then
    select * into b from bookings where id = new.booking_id;
    if b.event_id <> new.event_id then raise exception 'This pass is for a different night'; end if;
    if b.status <> 'booked' then raise exception 'This booking was cancelled'; end if;
    if new.couples > b.couples or new.couples * 2 + new.stags + new.girls > b.passes then
      raise exception 'More people than this booking has (% booked)', b.passes;
    end if;
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
  new.self_checked := new.promoter_id is not null and new.promoter_id is not distinct from my_promoter_id();
  return new;
end $$;
create trigger checkins_rules before insert on checkins for each row execute function checkin_rules();

-- ---------------------------------------------------------------- actions (the only way to do these)
-- Someone opened a promoter's link. Works without signing in. Returns the referral id, or null if the
-- link isn't valid any more (promoter removed, night not live).
create function open_referral(ev uuid, promo_code text) returns uuid language plpgsql security definer set search_path = public as $$
declare pr uuid; rid uuid;
begin
  select c.promoter_id into pr from event_promoter_codes c join events e on e.id = c.event_id
    where c.event_id = ev and c.code = upper(promo_code) and e.status = 'live';
  if pr is null or not promoter_works_for(event_organiser(ev), pr) then return null; end if;
  insert into referrals (event_id, promoter_id) values (ev, pr) returning id into rid;
  return rid;
end $$;

-- Book a night. Checks the night's rules, the stag policy and capacity, credits the promoter whose link
-- was opened last (if within 7 days and they still work for the host), and stores the deal version.
-- payment_ref is recorded as given; real payment checks (Razorpay) come in a later step.
create function create_booking(ev uuid, n_couples integer, n_stags integer, n_girls integer,
                               ref uuid default null, pay_ref text default null)
returns bookings language plpgsql security definer set search_path = public as $$
declare e events; r referrals; d deals; b bookings; pr uuid; taken integer; new_code text; credited integer;
begin
  if auth.uid() is null then raise exception 'Sign in to book'; end if;
  select * into e from events where id = ev;
  if e.id is null or e.status <> 'live' then raise exception 'This night isn''t open for booking'; end if;
  if coalesce(e.ends_at, e.starts_at + interval '8 hours') < now() then raise exception 'This night has ended'; end if;
  if e.stag_policy = 'none' and n_stags > 0 then
    raise exception 'This night has no stag entry. Book as couples or girls.';
  end if;
  if e.stag_policy = 'groups' and n_stags > 0 and n_couples = 0 and n_girls = 0 then
    raise exception 'This night is couples and mixed groups only. Add a couple or a girl to the booking.';
  end if;
  if e.capacity is not null then
    select coalesce(sum(passes), 0) into taken from bookings where event_id = ev and status = 'booked';
    if taken + n_couples * 2 + n_stags + n_girls > e.capacity then raise exception 'The guestlist is full'; end if;
  end if;

  if ref is not null then
    select * into r from referrals where id = ref;
    if r.event_id = ev and r.opened_at > now() - interval '7 days' and promoter_works_for(e.organiser_id, r.promoter_id) then
      pr := r.promoter_id;
    end if;
  end if;
  select * into d from deals where event_id = ev order by version desc limit 1;

  loop
    new_code := 'G-' || upper(substr(translate(encode(extensions.gen_random_bytes(8), 'base64'), '+/=lIO0', ''), 1, 6));
    exit when new_code ~ '^G-[0-9A-Z]{6}$' and not exists (select 1 from bookings where code = new_code);
  end loop;

  insert into bookings (event_id, user_id, code, couples, stags, girls, amount, payment_ref, referral_id, promoter_id, deal_id)
  values (ev, auth.uid(), new_code, n_couples, n_stags, n_girls,
          case when e.entry = 'paid' then e.price * (n_couples * 2 + n_stags + n_girls) else 0 end,
          pay_ref, case when pr is not null then ref end, pr, case when d.enabled then d.id end)
  returning * into b;

  -- Past the promoter's cap: the booking still goes through, marked so it earns nothing.
  if pr is not null and d.enabled and d.cap is not null then
    select coalesce(sum(passes), 0) into credited from bookings
      where event_id = ev and promoter_id = pr and status = 'booked' and not over_cap and id <> b.id;
    if credited + b.passes > d.cap then
      update bookings set over_cap = true where id = b.id returning * into b;
    end if;
  end if;
  return b;
end $$;

create function cancel_booking(bk uuid) returns void language plpgsql security definer set search_path = public as $$
begin
  -- check it's yours first, so nothing is revealed about other people's bookings
  if not exists (select 1 from bookings where id = bk and user_id = auth.uid() and status = 'booked') then
    raise exception 'Booking not found';
  end if;
  if exists (select 1 from checkins where booking_id = bk and outcome = 'admitted') then
    raise exception 'You''re already checked in';
  end if;
  update bookings set status = 'cancelled' where id = bk;
end $$;

-- Accept an invite. agency: the agency joining a host (for kind 'agency', the caller's agency).
create function accept_invite(tok text, my_agency uuid default null) returns void language plpgsql security definer set search_path = public as $$
declare i invites; pr uuid;
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  select * into i from invites where token = tok for update;
  if i.id is null or i.revoked_at is not null or i.accepted_at is not null or i.expires_at < now() then
    raise exception 'This invite has expired or was withdrawn';
  end if;
  pr := my_promoter_id();
  if i.kind = 'door' then
    insert into organiser_members (organiser_id, user_id, role, added_by) values (i.organiser_id, auth.uid(), 'door', i.created_by)
      on conflict (organiser_id, user_id) do update set removed_at = null
      where organiser_members.role = 'door';
  elsif i.kind = 'promoter' then
    if pr is null then raise exception 'Set up your promoter profile first'; end if;
    insert into organiser_promoters (organiser_id, promoter_id, added_by) values (i.organiser_id, pr, i.created_by)
      on conflict (organiser_id, promoter_id) do update set removed_at = null;
  elsif i.kind = 'agency' then
    if my_agency is null or not is_agency_manager(my_agency) then raise exception 'Only an agency manager can accept this'; end if;
    insert into organiser_agencies (organiser_id, agency_id, added_by) values (i.organiser_id, my_agency, i.created_by)
      on conflict (organiser_id, agency_id) do update set removed_at = null;
  elsif i.kind = 'agency_promoter' then
    if pr is null then raise exception 'Set up your promoter profile first'; end if;
    update promoters set agency_id = i.agency_id where id = pr;
  end if;
  update invites set accepted_by = auth.uid(), accepted_at = now() where id = i.id;
end $$;

-- An agency manager takes a promoter off their team (their past credits stay where they are).
create function remove_from_agency(pr uuid) returns void language plpgsql security definer set search_path = public as $$
begin
  update promoters set agency_id = null where id = pr and is_agency_manager(agency_id);
  if not found then raise exception 'Not one of your promoters'; end if;
end $$;

-- Supabase lets everyone (even signed-out visitors) run new functions by default, so close that first
revoke execute on function open_referral(uuid, text) from public, anon, authenticated;
revoke execute on function create_booking(uuid, integer, integer, integer, uuid, text) from public, anon, authenticated;
revoke execute on function cancel_booking(uuid) from public, anon, authenticated;
revoke execute on function accept_invite(text, uuid) from public, anon, authenticated;
revoke execute on function remove_from_agency(uuid) from public, anon, authenticated;
grant execute on function open_referral(uuid, text) to anon, authenticated;
grant execute on function create_booking(uuid, integer, integer, integer, uuid, text) to authenticated;
grant execute on function cancel_booking(uuid) to authenticated;
grant execute on function accept_invite(text, uuid) to authenticated;
grant execute on function remove_from_agency(uuid) to authenticated;

-- ---------------------------------------------------------------- access rules
alter table deals enable row level security;
alter table agencies enable row level security;
alter table promoters enable row level security;
alter table organiser_promoters enable row level security;
alter table organiser_agencies enable row level security;
alter table agency_rates enable row level security;
alter table event_promoter_codes enable row level security;
alter table invites enable row level security;
alter table referrals enable row level security;
alter table payout_lines enable row level security;

-- deals: the host writes; the host, gathr and promoters/agencies working the night can read
create policy "deals: read" on deals for select using (can_see_deal(event_id));
create policy "deals: owner adds" on deals for insert with check (is_event_owner(event_id));
create policy "deals: owner edits" on deals for update using (is_event_owner(event_id));
create policy "deals: owner deletes" on deals for delete using (is_event_owner(event_id));

-- agencies: the manager, its promoters, hosts it works with and gathr can see it
create policy "agencies: read" on agencies for select using (
  manager_id = auth.uid() or is_admin()
  or exists (select 1 from promoters p where p.agency_id = agencies.id and p.user_id = auth.uid())
  or exists (select 1 from organiser_agencies oa where oa.agency_id = agencies.id and oa.removed_at is null and is_org_staff(oa.organiser_id)));
create policy "agencies: create" on agencies for insert to authenticated with check (manager_id = auth.uid());
create policy "agencies: manager edits" on agencies for update using (manager_id = auth.uid());

-- promoters: themselves, their agency manager, hosts they work for (incl. door staff, for "Whose list?") and gathr
create policy "promoters: read" on promoters for select using (
  user_id = auth.uid() or is_admin() or is_agency_manager(agency_id)
  or exists (select 1 from organiser_promoters op where op.promoter_id = promoters.id and op.removed_at is null and is_org_staff(op.organiser_id))
  or exists (select 1 from organiser_agencies oa where oa.agency_id = promoters.agency_id and oa.removed_at is null and is_org_staff(oa.organiser_id)));
create policy "promoters: create own" on promoters for insert to authenticated
  with check (user_id = auth.uid() and agency_id is null and status = 'active');
create policy "promoters: edit own" on promoters for update using (user_id = auth.uid());

-- host ↔ promoter and host ↔ agency links: the host team, and the promoter / agency manager concerned
create policy "org promoters: read" on organiser_promoters for select using (
  is_org_staff(organiser_id) or promoter_id = my_promoter_id() or is_admin());
create policy "org promoters: owner adds" on organiser_promoters for insert with check (is_org_owner(organiser_id));
create policy "org promoters: owner removes" on organiser_promoters for update using (is_org_owner(organiser_id));
create policy "org agencies: read" on organiser_agencies for select using (
  is_org_staff(organiser_id) or is_agency_manager(agency_id) or is_admin());
create policy "org agencies: owner adds" on organiser_agencies for insert with check (is_org_owner(organiser_id));
create policy "org agencies: owner removes" on organiser_agencies for update using (is_org_owner(organiser_id));

-- agency rates: the agency manager only (and each promoter sees their own rate). Never the host.
create policy "agency rates: read" on agency_rates for select using (is_agency_manager(agency_id));
create policy "agency rates: manager adds" on agency_rates for insert with check (
  is_agency_manager(agency_id) and exists (select 1 from promoters p where p.id = promoter_id and p.agency_id = agency_rates.agency_id));
create policy "agency rates: manager edits" on agency_rates for update using (is_agency_manager(agency_id));

-- per-night promoter codes: the night's team, the promoter, and their agency manager
create policy "codes: read" on event_promoter_codes for select using (
  is_event_staff(event_id) or promoter_id = my_promoter_id()
  or exists (select 1 from promoters p where p.id = promoter_id and is_agency_manager(p.agency_id)));
create policy "codes: owner adds" on event_promoter_codes for insert with check (
  is_event_owner(event_id) and promoter_works_for(event_organiser(event_id), promoter_id));

-- invites: made by a host owner (door staff, promoters, agencies) or an agency manager (their promoters)
create policy "invites: own" on invites for select using (created_by = auth.uid());
create policy "invites: create" on invites for insert with check (
  created_by = auth.uid() and (
    (kind <> 'agency_promoter' and is_org_owner(organiser_id))
    or (kind = 'agency_promoter' and is_agency_manager(agency_id))));
create policy "invites: withdraw" on invites for update using (created_by = auth.uid());

-- referrals: written only by open_referral(); read through the funnel (a later step)

-- payout lines: who sees what
--   host's lines → the host owner (not door staff), and the payee (that promoter, or that agency's manager)
--   an agency's private split → the agency manager, and that promoter
create policy "payouts: read" on payout_lines for select using (
  case payer
    when 'host' then is_event_owner(event_id)
                     or (promoter_id is not null and promoter_id = my_promoter_id())
                     or (agency_id is not null and is_agency_manager(agency_id))
    else is_agency_manager(agency_id) or promoter_id = my_promoter_id()
  end);

-- Column-level limits
revoke update on promoters from authenticated, anon;
grant update (display_name) on promoters to authenticated;            -- agency and status change only through actions
revoke update on agencies from authenticated, anon;
grant update (name, removed_at) on agencies to authenticated;
revoke update on organiser_promoters, organiser_agencies from authenticated, anon;
grant update (removed_at) on organiser_promoters, organiser_agencies to authenticated;
revoke update on invites from authenticated, anon;
grant update (revoked_at) on invites to authenticated;
revoke insert, update, delete on referrals, payout_lines from authenticated, anon;
revoke update on deals from authenticated, anon;
grant update (enabled, couple_rate, stag_pct, stag_flat, girls_rate, cap) on deals to authenticated;
