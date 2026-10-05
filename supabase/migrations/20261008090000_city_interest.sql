-- gathr: other cities, "Tell me when"
--
-- gathr is Pune only for now. The city chip on This week lists the next cities as "Coming soon"; a signed-in
-- person can tap "Tell me when" for any of them. Each tap is one row here, so we know where to open next and
-- who to tell. Nobody else can see who asked; admins see only the count per city.
-- Run this in the Supabase SQL Editor after the earlier migrations.

create table city_interest (
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  city text not null check (city in ('mumbai', 'bengaluru', 'delhi', 'goa', 'hyderabad')),
  created_at timestamptz not null default now(),
  primary key (user_id, city)
);

-- how many people asked for each city (admins only)
create function city_interest_counts() returns table (city text, people bigint)
  language sql stable security definer set search_path = public as $$
  select ci.city, count(*) from city_interest ci where is_admin() group by ci.city order by count(*) desc;
$$;

-- ---------------------------------------------------------------- access rules
alter table city_interest enable row level security;

-- your own asks: see them, add one, take one back
create policy "city interest: your own" on city_interest for select using (user_id = auth.uid());
create policy "city interest: ask" on city_interest for insert with check (user_id = auth.uid());
create policy "city interest: take back" on city_interest for delete using (user_id = auth.uid());
revoke update on city_interest from authenticated, anon;
revoke all on city_interest from anon;

revoke execute on function city_interest_counts() from public, anon;
grant execute on function city_interest_counts() to authenticated;
