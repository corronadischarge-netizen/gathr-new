-- gathr: app notifications (step 6)
--
-- The database writes a notification when something happens to you:
--   * a host or promoter adds you to their guest list
--   * your night goes live, or is sent back to you
--   * your organiser profile is verified
-- Each one shows in the app's Updates, and is pushed to your phone by the "push" Edge Function (Firebase).
-- People added to a guest list before they join gathr get theirs (in the app) once they sign in with that email.
-- Run this in the Supabase SQL Editor after the earlier migrations, once the "push" function is deployed.

create extension if not exists pg_net with schema extensions;

-- ---------------------------------------------------------------- phones that can receive pushes
create table device_tokens (
  token text primary key,                               -- the phone's push address (from Firebase)
  user_id uuid not null references auth.users (id) on delete cascade,
  platform text not null check (platform in ('android', 'ios', 'web')),
  updated_at timestamptz not null default now()
);
create index device_tokens_by_user on device_tokens (user_id);

-- Save this phone for the signed-in user. A phone belongs to whoever signed in on it last.
create function save_device(tok text, plat text) returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  if char_length(tok) not between 20 and 4096 then raise exception 'That isn''t a push address'; end if;
  insert into device_tokens (token, user_id, platform) values (tok, auth.uid(), plat)
    on conflict (token) do update set user_id = auth.uid(), platform = excluded.platform, updated_at = now();
end $$;

-- ---------------------------------------------------------------- notifications
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  email text,                                           -- for someone not on gathr yet
  kind text not null,                                   -- guest_list | night_live | night_back | verified
  title text not null,
  body text not null,
  data jsonb not null default '{}',
  created_at timestamptz not null default now(),
  read_at timestamptz,
  pushed_at timestamptz,
  check (user_id is not null or email is not null)
);
create index notifications_by_user on notifications (user_id, created_at desc);
create index notifications_by_email on notifications (email) where user_id is null;

-- Write a notification and ask the push function to send it. Never gets in the way of what caused it.
create function notify(who uuid, who_email text, k text, t text, b text, d jsonb) returns void
language plpgsql security definer set search_path = public, extensions as $$
declare nid uuid;
begin
  insert into notifications (user_id, email, kind, title, body, data)
    values (who, lower(who_email), k, t, b, d) returning id into nid;
  if who is not null then
    begin
      perform net.http_post(
        url := 'https://unonmrglfewyapzbxacq.supabase.co/functions/v1/push',
        body := jsonb_build_object('id', nid),
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          -- the public anon key: the function only takes the id and reads everything else itself
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVub25tcmdsZmV3eWFwemJ4YWNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NTM0NzcsImV4cCI6MjEwNjQyOTQ3N30.miIUy2yBS5_TbxpDR-iZ3hM7RFv5w4pRdlColBZx7cY'
        )
      );
    exception when others then
      null; -- no push this time; the notification is still in Updates
    end;
  end if;
end $$;

create function night_owners(org uuid) returns setof uuid language sql stable security definer set search_path = public as $$
  select user_id from organiser_members where organiser_id = org and role = 'owner' and removed_at is null;
$$;

create function when_txt(t timestamptz) returns text language sql stable as $$
  select to_char(t at time zone 'Asia/Kolkata', 'FMDy FMDD Mon, FMHH12:MI am');
$$;

-- you're on a guest list
create function notify_guest_list() returns trigger language plpgsql security definer set search_path = public as $$
declare e events; l guest_lists; owner text; who uuid;
begin
  if new.removed_at is not null then return new; end if;
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
create trigger guest_list_entries_notify after insert on guest_list_entries
  for each row execute function notify_guest_list();

-- your night is live, or sent back to you
create function notify_night() returns trigger language plpgsql security definer set search_path = public as $$
declare who uuid;
begin
  if new.status = 'live' and old.status is distinct from 'live' then
    for who in select night_owners(new.organiser_id) loop
      perform notify(who, null, 'night_live', new.title || ' is live',
        'Guests can book it now. ' || when_txt(new.starts_at) || '.',
        jsonb_build_object('kind', 'night_live', 'event_id', new.id));
    end loop;
  elsif old.status = 'review' and new.status = 'draft' then
    for who in select night_owners(new.organiser_id) loop
      perform notify(who, null, 'night_back', new.title || ' was sent back',
        'gathr has a question about it. Check the details and send it again.',
        jsonb_build_object('kind', 'night_back', 'event_id', new.id));
    end loop;
  end if;
  return new;
end $$;
create trigger events_notify after update of status on events for each row execute function notify_night();

-- you're verified
create function notify_verified() returns trigger language plpgsql security definer set search_path = public as $$
declare who uuid;
begin
  if new.status = 'verified' and old.status is distinct from 'verified' then
    for who in select night_owners(new.id) loop
      perform notify(who, null, 'verified', 'You’re verified on gathr',
        new.name || ' can now send nights to go live.', jsonb_build_object('kind', 'verified'));
    end loop;
  end if;
  return new;
end $$;
create trigger organisers_notify after update of status on organisers for each row execute function notify_verified();

-- ---------------------------------------------------------------- access rules
alter table device_tokens enable row level security;
alter table notifications enable row level security;

-- your own phones; saving goes through save_device()
create policy "devices: your own" on device_tokens for select using (user_id = auth.uid());
create policy "devices: forget your own" on device_tokens for delete using (user_id = auth.uid());
revoke insert, update on device_tokens from authenticated, anon;

-- your own notifications (including ones sent to your email before you joined); you can mark them read
create policy "notifications: your own" on notifications for select
  using (user_id = auth.uid() or (user_id is null and email = lower(auth.email())));
create policy "notifications: mark read" on notifications for update
  using (user_id = auth.uid() or (user_id is null and email = lower(auth.email())));
revoke insert, update, delete on notifications from authenticated, anon;
grant update (read_at) on notifications to authenticated;

revoke execute on function save_device(text, text) from public, anon;
revoke execute on function notify(uuid, text, text, text, text, jsonb) from public, anon, authenticated;
revoke execute on function night_owners(uuid) from public, anon, authenticated;
grant execute on function save_device(text, text) to authenticated;
