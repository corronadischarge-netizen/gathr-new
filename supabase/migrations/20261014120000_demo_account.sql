-- gathr: the demo account (specs/demo-data.md, section 5)
--
-- One yes/no on a profile. When it's on, the app fills that account with the demo: the demo friends, a guest's plans,
-- bookings, saves and past nights, and the host Afterhours Collective. The demo itself lives in the app's code
-- (src/data/demo.js), dated from today, so nothing else is stored here. Every other account sees only the feed.
-- Run this in the Supabase SQL Editor after the earlier migrations. Then turn the demo on for one account with the
-- line Claude Code gives you (it names the account by email, so the email stays out of this file).

alter table profiles add column demo boolean not null default false;

-- Only gathr turns it on or off (the SQL Editor, or a server job): a person editing their own profile in the app
-- can't change it, whatever they send.
create function profiles_keep_demo() returns trigger
language plpgsql as $$
begin
  if current_user in ('authenticated', 'anon') then
    new.demo := case when tg_op = 'UPDATE' then old.demo else false end;
  end if;
  return new;
end;
$$;

create trigger profiles_keep_demo before insert or update on profiles
  for each row execute function profiles_keep_demo();
