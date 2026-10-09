-- 027: Nyhetsbrev-lister (fiks fra code review av PR #9)
--
-- 1. Ventelista for FERA-kolleksjonen (/kolleksjon) ligger i samme tabell som
--    nyhetsbrevet, med brands = ['kolleksjon']. newsletter_recipients() tok med
--    alle rader, så de på ventelista ville fått artikkel-nyhetsbrev de ikke har
--    meldt seg på. Nå er 'nyhetsbrev' en egen liste i brands, og bare den
--    får utsendingene. Eksisterende rader uten liste var vanlige påmeldinger.
-- 2. Avmelding fjerner bare 'nyhetsbrev'-lista (ventelista beholdes), og
--    sammenligner med trim() slik newsletter_recipients() gjør.
--
-- Trygg å kjøre flere ganger.

update public.newsletter_subscribers
   set brands = array['nyhetsbrev']
 where brands = '{}';

create or replace function public.newsletter_recipients()
returns table (email text)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  return query
    select distinct lower(trim(source.address)) as email
    from (
      select s.email as address
      from public.newsletter_subscribers s
      where 'nyhetsbrev' = any(s.brands)
      union all
      select au.email::text as address
      from public.users u
      join auth.users au on au.id = u.id
      where u.newsletter_consent
    ) as source
    where source.address is not null and trim(source.address) <> ''
    order by 1;
end;
$$;

create or replace function public.newsletter_unsubscribe(p_email text)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_email text := lower(trim(p_email));
begin
  update public.newsletter_subscribers
     set brands = array_remove(brands, 'nyhetsbrev')
   where lower(trim(email)) = v_email;
  delete from public.newsletter_subscribers
   where lower(trim(email)) = v_email and brands = '{}';
  update public.users
     set newsletter_consent = false
   where id in (select au.id from auth.users au where lower(trim(au.email)) = v_email);
end;
$$;

-- create or replace beholder tilgangene fra 026 (newsletter_unsubscribe kun service_role).

-- ── Verifisering (kjør som admin etterpå) ───────────────────────────────────
-- select brands, count(*) from public.newsletter_subscribers group by brands;
-- select public.newsletter_recipient_count();
