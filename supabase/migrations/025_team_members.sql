-- 025: Navn på teamet (admin-brukere) som forslag i forfatterfeltet for artikler.
-- Security definer fordi rollen ligger i auth.users; returnerer ingenting for ikke-admin.

create or replace function public.team_members()
returns table (full_name text)
language sql
stable
security definer
set search_path = ''
as $$
  select distinct p.full_name
  from auth.users u
  join public.users p on p.id = u.id
  where public.is_admin()
    and (u.raw_app_meta_data ->> 'role') = 'admin'
    and coalesce(trim(p.full_name), '') <> ''
  order by p.full_name;
$$;

revoke all on function public.team_members() from public, anon;
grant execute on function public.team_members() to authenticated;
