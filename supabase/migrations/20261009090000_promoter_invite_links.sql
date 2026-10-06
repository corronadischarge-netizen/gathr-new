-- gathr: promoter invites by link (step 10)
--
-- Hosts often don't know a promoter's email, and people answer WhatsApp faster than email. So a host invites a
-- promoter by sharing a link (or its code) wherever they like:
-- * The host makes an invite for one night, with an optional cap and a note to themselves ("for Riya"). It gets a
--   short code like KUK-7Q4M2X. The app shares a message with the link and the code.
-- * Whoever opens it sees the night and the cap before signing in. Once signed in they accept: the list becomes
--   theirs (a promoter profile is made the first time), and the host hears who joined.
-- * Each invite works once, until the night ends. The host can withdraw it before it's taken.
-- Invites by email (step 8) still work in the database; the app no longer makes them.
-- Run this in the Supabase SQL Editor after the earlier migrations.

-- ---------------------------------------------------------------- what's stored
alter table guest_lists add column invite_code text unique check (invite_code ~ '^[A-Z]{3}-[A-Z2-9]{6}$');

-- the host's own list is the one with no promoter and no invite of either kind
drop index guest_lists_one_host;
create unique index guest_lists_one_host on guest_lists (event_id)
  where promoter_id is null and invite_email is null and invite_code is null;

-- a list waiting for its promoter has no people yet (either kind of invite)
create or replace function guest_entry_rules() returns trigger language plpgsql security definer set search_path = public as $$
declare l guest_lists; used integer; digits text;
begin
  select * into l from guest_lists where id = new.list_id;
  if l.promoter_id is null and (l.invite_email is not null or l.invite_code is not null) then
    raise exception 'This list is waiting for its promoter';
  end if;
  new.event_id := l.event_id;
  new.email := nullif(lower(trim(new.email)), '');
  if new.phone is not null then
    digits := regexp_replace(new.phone, '[^0-9]', '', 'g');
    if char_length(digits) = 12 and left(digits, 2) = '91' then digits := substr(digits, 3); end if;
    if char_length(digits) = 11 and left(digits, 1) = '0' then digits := substr(digits, 2); end if;
    new.phone := nullif(digits, '');
  end if;
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

-- ---------------------------------------------------------------- actions
-- Host: make an invite link for one night. Returns the new list and its code.
create function create_promoter_invite(ev uuid, cap_n integer, note text)
returns table (list_id uuid, code text)
language plpgsql security definer set search_path = public, extensions as $$
declare org_name text; pre text; c text; abc text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; i integer; lid uuid;
begin
  if not is_event_owner(ev) then raise exception 'Only the night''s host can invite promoters'; end if;
  if cap_n is not null and (cap_n < 1 or cap_n > 500) then raise exception 'A cap is between 1 and 500 people'; end if;
  select o.name into org_name from events e join organisers o on o.id = e.organiser_id where e.id = ev;
  pre := left(upper(regexp_replace(coalesce(org_name, ''), '[^a-zA-Z]', '', 'g')) || 'GTR', 3);
  loop
    c := pre || '-';
    for i in 1..6 loop
      c := c || substr(abc, 1 + (get_byte(gen_random_bytes(1), 0) % 32), 1);
    end loop;
    exit when not exists (select 1 from guest_lists where invite_code = c);
  end loop;
  insert into guest_lists (event_id, cap, invite_code, invite_name)
    values (ev, cap_n, c, nullif(left(trim(coalesce(note, '')), 30), ''))
    returning id into lid;
  return query select lid, c;
end $$;

-- Anyone with the code: what the invite is for, before they sign in.
-- state: 'open' | 'taken' | 'ended' | 'withdrawn' (no such code)
create function promoter_invite_preview(code text)
returns table (state text, event_id uuid, title text, starts_at timestamptz, venue text, area text, host text,
               cap integer, poster_url text)
language plpgsql stable security definer set search_path = public as $$
declare l guest_lists; e events;
begin
  select * into l from guest_lists where invite_code = upper(trim(code));
  if l.id is null then
    -- a code that was accepted is cleared; anything else is unknown or withdrawn
    return query select 'withdrawn'::text, null::uuid, null::text, null::timestamptz, null::text, null::text, null::text, null::integer, null::text;
    return;
  end if;
  select * into e from events where id = l.event_id;
  return query
    select case when l.promoter_id is not null then 'taken'
                when e.status = 'removed' or coalesce(e.ends_at, e.starts_at + interval '8 hours') < now() then 'ended'
                else 'open' end,
           e.id, e.title, e.starts_at, v.name, v.area, o.name, l.cap, e.poster_url
      from venues v, organisers o
     where v.id = e.venue_id and o.id = e.organiser_id;
end $$;

-- A signed-in person accepts an invite: the list becomes theirs. Makes their promoter profile the first time.
-- Returns the night's id.
create function accept_promoter_invite(code text, display text)
returns uuid language plpgsql security definer set search_path = public as $$
declare l guest_lists; e events; pr uuid; nm text; base text; s text; who uuid; them text;
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  select * into l from guest_lists where invite_code = upper(trim(code)) for update;
  if l.id is null then raise exception 'This invite was withdrawn or has already been used'; end if;
  if l.promoter_id is not null then raise exception 'Someone has already accepted this invite'; end if;
  select * into e from events where id = l.event_id;
  if e.status = 'removed' or coalesce(e.ends_at, e.starts_at + interval '8 hours') < now() then
    raise exception 'This night has ended';
  end if;
  if is_event_owner(e.id) then raise exception 'That''s your own night. Share the invite with your promoter'; end if;
  pr := my_promoter_id();
  if pr is null then
    nm := left(trim(coalesce(display, '')), 30);
    if char_length(nm) < 2 then raise exception 'Add your name, as guests know you'; end if;
    base := trim(both '-' from left(lower(regexp_replace(nm, '[^a-zA-Z0-9]+', '-', 'g')), 24));
    if char_length(base) < 3 then base := 'promoter'; end if;
    s := base;
    while exists (select 1 from promoters where slug = s) loop
      s := base || '-' || substr(md5(random()::text), 1, 4);
    end loop;
    insert into promoters (user_id, display_name, slug) values (auth.uid(), nm, s) returning id into pr;
  end if;
  if exists (select 1 from guest_lists where event_id = e.id and promoter_id = pr) then
    raise exception 'You already have a list on this night';
  end if;
  insert into organiser_promoters (organiser_id, promoter_id) values (e.organiser_id, pr)
    on conflict (organiser_id, promoter_id) do update set removed_at = null;
  -- the code is spent: it can't be used again, and the list is now theirs
  update guest_lists set promoter_id = pr, invite_code = null where id = l.id;
  select display_name into them from promoters where id = pr;
  for who in select night_owners(e.organiser_id) loop
    perform notify(who, null, 'promoter_joined', them || ' is promoting ' || e.title,
      'They accepted your invite' || case when l.cap is not null then ' · up to ' || l.cap || ' people' else '' end
        || '. You''ll see who they add and who comes.',
      jsonb_build_object('kind', 'promoter_joined', 'event_id', e.id, 'list_id', l.id));
  end loop;
  return e.id;
end $$;

-- ---------------------------------------------------------------- what the host and guests read
-- Every list on a night, for its host. Now also the invite code of a link that hasn't been taken yet.
drop function event_list_summary(uuid);
create function event_list_summary(ev uuid)
returns table (list_id uuid, owner text, is_host boolean, waiting boolean, invite_email text, cap integer,
               people integer, came integer, invite_code text)
language plpgsql stable security definer set search_path = public as $$
begin
  if not (is_event_staff(ev) or is_admin()) then raise exception 'Only the night''s team can see its lists'; end if;
  return query
    select l.id,
           case when l.promoter_id is not null then p.display_name
                when l.invite_name is not null then l.invite_name
                when l.invite_email is not null then l.invite_email
                when l.invite_code is not null then 'Invite link'
                else o.name end,
           l.promoter_id is null and l.invite_email is null and l.invite_code is null,
           l.promoter_id is null and (l.invite_email is not null or l.invite_code is not null),
           l.invite_email,
           l.cap,
           (select coalesce(sum(g.people), 0)::int from guest_list_entries g where g.list_id = l.id and g.removed_at is null),
           (select coalesce(sum(c.guests), 0)::int from checkins c join guest_list_entries g on g.id = c.guest_entry_id
             where g.list_id = l.id and c.outcome = 'admitted'),
           l.invite_code
      from guest_lists l
      join events e on e.id = l.event_id
      join organisers o on o.id = e.organiser_id
      left join promoters p on p.id = l.promoter_id
     where l.event_id = ev
     order by (l.promoter_id is null and l.invite_email is null and l.invite_code is null) desc, l.created_at;
end $$;

-- the "Whose list?" choice when booking leaves out invites nobody has taken yet (either kind)
create or replace function event_guest_lists(ev uuid)
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
     and not (l.promoter_id is null and (l.invite_email is not null or l.invite_code is not null))
     and (l.promoter_id is null or promoter_works_for(e.organiser_id, l.promoter_id))
   order by l.promoter_id is not null, 2;
$$;

-- ---------------------------------------------------------------- access rules
-- invites are made through create_promoter_invite only (it makes the code), so the host can't set one by hand
revoke insert on guest_lists from authenticated;
grant insert (event_id, promoter_id, cap, invite_email, invite_name) on guest_lists to authenticated;

revoke execute on function create_promoter_invite(uuid, integer, text) from public, anon;
revoke execute on function accept_promoter_invite(text, text) from public, anon;
revoke execute on function event_list_summary(uuid) from public, anon;
revoke execute on function promoter_invite_preview(text) from public;
grant execute on function create_promoter_invite(uuid, integer, text) to authenticated;
grant execute on function accept_promoter_invite(text, text) to authenticated;
grant execute on function event_list_summary(uuid) to authenticated;
grant execute on function promoter_invite_preview(text) to anon, authenticated;
