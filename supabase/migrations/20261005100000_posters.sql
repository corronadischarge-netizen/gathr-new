-- gathr: night posters (step 2: organisers and nights in Supabase)
--
-- Posters live in a public storage bucket, so anyone can see them in the feed. Only an organiser's owners
-- can add, replace or delete posters, and only in their own folder: posters/<organiser id>/<file>.
-- The app shrinks every poster to 720 × 900 JPEG before upload; the 2 MB limit is a safety net.
-- Run this in the Supabase SQL Editor after the earlier migrations.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('posters', 'posters', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- is this file in a folder that belongs to an organiser you own?
create function public.owns_poster_folder(path text) returns boolean language plpgsql stable security definer
set search_path = public as $$
declare
  folder text := (storage.foldername(path))[1];
begin
  if folder !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return false;
  end if;
  return is_org_owner(folder::uuid);
end $$;
revoke execute on function public.owns_poster_folder(text) from public, anon;
grant execute on function public.owns_poster_folder(text) to authenticated;

create policy "posters: owners list" on storage.objects for select to authenticated
  using (bucket_id = 'posters' and public.owns_poster_folder(name));
create policy "posters: owners add" on storage.objects for insert to authenticated
  with check (bucket_id = 'posters' and public.owns_poster_folder(name));
create policy "posters: owners replace" on storage.objects for update to authenticated
  using (bucket_id = 'posters' and public.owns_poster_folder(name));
create policy "posters: owners delete" on storage.objects for delete to authenticated
  using (bucket_id = 'posters' and public.owns_poster_folder(name));
