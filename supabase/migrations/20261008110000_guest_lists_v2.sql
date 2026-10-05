-- gathr: guest lists, part 2 (step 8)
--
-- Still no open ends: nobody can ask to be put on a list. Only the host, or a promoter the host invited, adds names.
--
-- * A host (or promoter) adds a guest by name, with their email, their phone, or neither:
--     email     → they get a notification and free passes in the app (gathr checks the email they sign in with)
--     phone     → kept for the host and the door, and the app can WhatsApp them. A phone number alone can't
--                 claim passes in the app, because nobody has proven the number is theirs.
--     name only → the door finds them by name.
-- * The host invites a promoter to one night by email, with a cap. The promoter gets a notification; once they
--   sign in with that email the list is theirs, and they add their own people up to the cap. Promoters aren't
--   tied to a venue: any host can invite them to any night.
-- * The host sees every list on the night: how many people are on it, the cap, and how many turned up.
-- Run this in the Supabase SQL Editor after the earlier migrations.

-- ---------------------------------------------------------------- guests by email, phone or name only
alter table guest_list_entries alter column email drop not null;
alter table guest_list_entries add column phone text check (phone ~ '^[6-9][0-9]{9}$');
create unique index guest_list_entries_once_phone on guest_list_entries (list_id, phone)
  where removed_at is null and phone is not null;

-- ---------------------------------------------------------------- promoter invites, one list per night
alter table guest_lists
  add column invite_email text check (invite_email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  add column invite_name text check (char_length(btrim(invite_name)) between 2 and 30);
-- the host's own list is the one with no promoter and no invite
drop index guest_lists_one_host;
create unique index guest_lists_one_host on guest_lists (event_id) where promoter_id is null and invite_email is null;
create unique index guest_lists_one_invite on guest_lists (event_id, invite_email)
  where promoter_id is null and invite_email is not null;

-- tidy emails and phones; a list waiting for its promoter has no people yet; the list's cap
create or replace function guest_entry_rules() returns trigger language plpgsql security definer set search_path = public as $$
declare l guest_lists; used integer; digits text;
begin
  select * into l from guest_lists where id = new.list_id;
  if l.promoter_id is null and l.invite_email is not null then
    raise exception 'This list is waiting for its promoter to sign in';
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

-- invites are the host's: tidy the email, and a promoter can't be invited twice to the same night
create function promoter_invite_rules() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.invite_email is not null then
    new.invite_email := lower(trim(new.invite_email));
    new.invite_name := nullif(trim(new.invite_name), '');
    if new.promoter_id is not null then raise exception 'Invite a promoter by email'; end if;
    if exists (select 1 from guest_lists gl join promoters p on p.id = gl.promoter_id join auth.users u on u.id = p.user_id
               where gl.event_id = new.event_id and lower(u.email) = new.invite_email) then
      raise exception 'They already have a list on this night';
    end if;
    if lower(auth.email()) = new.invite_email then raise exception 'That''s you. Your own list is already here'; end if;
  end if;
  return new;
end $$;
create trigger guest_lists_invite_rules before insert on guest_lists for each row execute function promoter_invite_rules();

-- the promoter hears about it (in the app once they join, if they haven't yet)
create function notify_promoter_invite() returns trigger language plpgsql security definer set search_path = public as $$
declare e events; host text; who uuid;
begin
  if new.invite_email is null or new.promoter_id is not null then return new; end if;
  select * into e from events where id = new.event_id;
  select name into host from organisers where id = e.organiser_id;
  select id into who from auth.users where lower(email) = new.invite_email;
  perform notify(who, new.invite_email, 'promoter_invite',
    host || ' wants you on ' || e.title,
    when_txt(e.starts_at) || ' · your own guest list'
      || case when new.cap is not null then ' for up to ' || new.cap || ' people' else '' end
      || '. Open gathr to add your people.',
    jsonb_build_object('kind', 'promoter_invite', 'event_id', e.id, 'list_id', new.id));
  return new;
end $$;
create trigger guest_lists_notify_invite after insert on guest_lists for each row execute function notify_promoter_invite();

-- a guest added without an email has nobody to notify in the app
create or replace function notify_guest_list() returns trigger language plpgsql security definer set search_path = public as $$
declare e events; l guest_lists; owner text; who uuid;
begin
  if new.removed_at is not null or new.email is null then return new; end if;
  select * into e from events where id = new.event_id;
  select * into l from guest_lists where id = new.list_id;
  select case when l.promoter_id is null then o.name else p.display_name end into owner
    from organisers o left join promoters p on p.id = l.promoter_id where o.id = e.organiser_id;
  select id into who from auth.users where lower(email) = new.email;
  perform notify(who, new.email, 'guest_list',
    'You’re on ' || owner || (case when owner ~* 's$' then '’' else '’s' end) || ' guest list',
    e.title || ' · ' || when_txt(e.starts_at) || ' · free entry'
      || case when cardinality(new.plus_ones) > 0 then ' for you + ' || cardinality(new.plus_ones) else '' end
      || '. Tap to get your passes.',
    jsonb_build_object('kind', 'guest_list', 'event_id', e.id, 'list_id', l.id));
  return new;
end $$;

-- ---------------------------------------------------------------- actions
-- Take the promoter lists you were invited to (called when you sign in). Makes your promoter profile the
-- first time, links you to the host, and the list becomes yours. Returns how many lists you took.
create function accept_promoter_lists() returns integer language plpgsql security definer set search_path = public as $$
declare mail text := lower(auth.email()); pr uuid; l record; n integer := 0; nm text; base text; s text;
begin
  if auth.uid() is null or mail is null then return 0; end if;
  for l in select gl.id, gl.event_id, gl.invite_name, e.organiser_id
             from guest_lists gl join events e on e.id = gl.event_id
            where gl.promoter_id is null and gl.invite_email = mail for update of gl loop
    pr := my_promoter_id();
    if pr is null then
      nm := left(coalesce(l.invite_name, split_part(mail, '@', 1)), 30);
      if char_length(nm) < 2 then nm := nm || ' P'; end if;
      base := trim(both '-' from left(lower(regexp_replace(nm, '[^a-zA-Z0-9]+', '-', 'g')), 24));
      if char_length(base) < 3 then base := 'promoter'; end if;
      s := base;
      while exists (select 1 from promoters where slug = s) loop
        s := base || '-' || substr(md5(random()::text), 1, 4);
      end loop;
      insert into promoters (user_id, display_name, slug) values (auth.uid(), nm, s) returning id into pr;
    end if;
    insert into organiser_promoters (organiser_id, promoter_id) values (l.organiser_id, pr)
      on conflict (organiser_id, promoter_id) do update set removed_at = null;
    if exists (select 1 from guest_lists where event_id = l.event_id and promoter_id = pr) then
      delete from guest_lists where id = l.id;   -- they already have a list on that night
    else
      update guest_lists set promoter_id = pr where id = l.id;
    end if;
    n := n + 1;
  end loop;
  return n;
end $$;

-- The nights you're promoting: your list on each, its cap, how many you've added and how many came.
create function my_promoter_lists()
returns table (list_id uuid, event_id uuid, title text, starts_at timestamptz, venue text, host text,
               cap integer, people integer, came integer)
language sql stable security definer set search_path = public as $$
  select l.id, e.id, e.title, e.starts_at, v.name, o.name, l.cap,
         (select coalesce(sum(g.people), 0)::int from guest_list_entries g where g.list_id = l.id and g.removed_at is null),
         (select coalesce(sum(c.guests), 0)::int from checkins c join guest_list_entries g on g.id = c.guest_entry_id
           where g.list_id = l.id and c.outcome = 'admitted')
    from guest_lists l
    join events e on e.id = l.event_id and e.status in ('review', 'live')
    join organisers o on o.id = e.organiser_id
    join venues v on v.id = e.venue_id
   where l.promoter_id = my_promoter_id() and my_promoter_id() is not null
     and coalesce(e.ends_at, e.starts_at + interval '8 hours') > now() - interval '2 days'
     and promoter_works_for(e.organiser_id, l.promoter_id)
   order by e.starts_at;
$$;

-- Every list on a night, for its host: whose it is, waiting or not, the cap, people on it and how many came.
create function event_list_summary(ev uuid)
returns table (list_id uuid, owner text, is_host boolean, waiting boolean, invite_email text, cap integer,
               people integer, came integer)
language plpgsql stable security definer set search_path = public as $$
begin
  if not (is_event_staff(ev) or is_admin()) then raise exception 'Only the night''s team can see its lists'; end if;
  return query
    select l.id,
           case when l.promoter_id is not null then p.display_name
                when l.invite_email is not null then coalesce(l.invite_name, l.invite_email)
                else o.name end,
           l.promoter_id is null and l.invite_email is null,
           l.promoter_id is null and l.invite_email is not null,
           l.invite_email,
           l.cap,
           (select coalesce(sum(g.people), 0)::int from guest_list_entries g where g.list_id = l.id and g.removed_at is null),
           (select coalesce(sum(c.guests), 0)::int from checkins c join guest_list_entries g on g.id = c.guest_entry_id
             where g.list_id = l.id and c.outcome = 'admitted')
      from guest_lists l
      join events e on e.id = l.event_id
      join organisers o on o.id = e.organiser_id
      left join promoters p on p.id = l.promoter_id
     where l.event_id = ev
     order by (l.promoter_id is null and l.invite_email is null) desc, 2;
end $$;

-- the "Whose list?" choice when booking leaves out invites nobody has taken yet
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
     and not (l.promoter_id is null and l.invite_email is not null)
     and (l.promoter_id is null or promoter_works_for(e.organiser_id, l.promoter_id))
   order by l.promoter_id is not null, 2;
$$;

-- ---------------------------------------------------------------- access rules
-- the host invites by email and name, and sets caps; invites can be withdrawn (the list is deleted)
grant update (cap) on guest_lists to authenticated;
grant update (phone) on guest_list_entries to authenticated;

revoke execute on function accept_promoter_lists() from public, anon;
revoke execute on function my_promoter_lists() from public, anon;
revoke execute on function event_list_summary(uuid) from public, anon;
grant execute on function accept_promoter_lists() to authenticated;
grant execute on function my_promoter_lists() to authenticated;
grant execute on function event_list_summary(uuid) to authenticated;
