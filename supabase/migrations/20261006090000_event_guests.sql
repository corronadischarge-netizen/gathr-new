-- gathr: who's coming, for the night's team (step 3: bookings in Supabase)
--
-- Bookings come in through create_booking() (promoters migration). Profiles stay private to their owner;
-- a night's team (owners and door staff) sees only the name on each booking for their own nights, here.
-- Run this in the Supabase SQL Editor after the earlier migrations.

create function event_guests(ev uuid)
returns table (
  booking_id uuid,
  code text,
  name text,
  couples integer,
  stags integer,
  girls integer,
  passes integer,
  booked_at timestamptz,
  via_promoter boolean
)
language plpgsql stable security definer set search_path = public as $$
begin
  if not (is_event_staff(ev) or is_admin()) then
    raise exception 'Only the night''s team can see who''s coming';
  end if;
  return query
    select b.id, b.code,
           coalesce(nullif(p.full_name, ''), nullif(p.first_name, ''), 'Guest'),
           b.couples, b.stags, b.girls, b.passes, b.created_at, b.promoter_id is not null
      from bookings b
      left join profiles p on p.id = b.user_id
     where b.event_id = ev and b.status = 'booked'
     order by b.created_at;
end $$;

revoke execute on function event_guests(uuid) from public, anon, authenticated;
grant execute on function event_guests(uuid) to authenticated;
