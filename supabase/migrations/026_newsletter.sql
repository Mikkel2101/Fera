-- 026: Artikkel som nyhetsbrev — utsendingslogg, frosne mottakerlister og avmelding.
-- Kjøres i Supabase SQL Editor som postgres-rollen.
--
-- Mottakere = alle i newsletter_subscribers + alle brukere med newsletter_consent,
-- deduplisert på lowercase e-post. Mottakerlisten fryses i newsletter_deliveries når
-- utsendingen starter, så en avbrutt utsending kan fortsettes uten duplikater.

-- ── Tabeller ────────────────────────────────────────────────────────────────

create table public.newsletter_sends (
  id              uuid primary key default gen_random_uuid(),
  -- unique: samme artikkel kan ikke sendes to ganger ved et uhell
  article_id      uuid unique references public.articles(id) on delete set null,
  subject         text not null,
  sent_by         uuid references auth.users(id) on delete set null,
  status          text not null default 'sending' check (status in ('sending', 'sent')),
  recipient_count integer not null default 0,
  sent_count      integer not null default 0,
  failed_count    integer not null default 0,
  -- hindrer at to sendeløkker kjører samtidig for samme utsending
  locked_until    timestamptz,
  created_at      timestamptz not null default now(),
  completed_at    timestamptz
);

create table public.newsletter_deliveries (
  send_id    uuid not null references public.newsletter_sends(id) on delete cascade,
  email      text not null check (email = lower(email)),
  status     text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  resend_id  text,
  error      text,
  updated_at timestamptz not null default now(),
  primary key (send_id, email)
);

create index newsletter_deliveries_pending
  on public.newsletter_deliveries (send_id, email)
  where status = 'pending';

alter table public.newsletter_sends enable row level security;
alter table public.newsletter_deliveries enable row level security;

-- Admin leser. Ingen skrivepolicyer: alle skrivinger går via funksjonene under.
create policy "newsletter_sends: admin leser" on public.newsletter_sends
  for select using (public.is_admin());
create policy "newsletter_deliveries: admin leser" on public.newsletter_deliveries
  for select using (public.is_admin());

-- ── Mottakere ───────────────────────────────────────────────────────────────

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
      select s.email as address from public.newsletter_subscribers s
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

create or replace function public.newsletter_recipient_count()
returns integer
language sql stable security definer set search_path = ''
as $$
  select count(*)::integer from public.newsletter_recipients();
$$;

-- ── Utsending ───────────────────────────────────────────────────────────────

create or replace function public.start_newsletter_send(p_article_id uuid)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_title   text;
  v_send_id uuid;
  v_count   integer;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select a.title into v_title
  from public.articles a
  where a.id = p_article_id and a.status = 'published';
  if v_title is null then
    raise exception 'not_published' using errcode = 'P0001';
  end if;

  begin
    insert into public.newsletter_sends (article_id, subject, sent_by)
    values (p_article_id, v_title, auth.uid())
    returning id into v_send_id;
  exception when unique_violation then
    raise exception 'already_sent' using errcode = 'P0001';
  end;

  insert into public.newsletter_deliveries (send_id, email)
  select v_send_id, r.email from public.newsletter_recipients() r;
  get diagnostics v_count = row_count;

  -- Kaster → hele transaksjonen rulles tilbake, ingen tom utsending blir liggende.
  if v_count = 0 then
    raise exception 'no_recipients' using errcode = 'P0001';
  end if;

  update public.newsletter_sends set recipient_count = v_count where id = v_send_id;
  return v_send_id;
end;
$$;

create or replace function public.claim_newsletter_send(p_send_id uuid)
returns boolean
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  update public.newsletter_sends
     set locked_until = now() + interval '5 minutes'
   where id = p_send_id
     and status = 'sending'
     and (locked_until is null or locked_until < now());
  return found;
end;
$$;

-- p_results: [{ "email", "status": "sent" | "failed", "resend_id", "error" }]
create or replace function public.record_newsletter_batch(p_send_id uuid, p_results jsonb)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  update public.newsletter_deliveries d
     set status = r.status, resend_id = r.resend_id, error = r.error, updated_at = now()
    from jsonb_to_recordset(p_results) as r(email text, status text, resend_id text, error text)
   where d.send_id = p_send_id
     and d.email = lower(r.email)
     and d.status = 'pending'
     and r.status in ('sent', 'failed');

  update public.newsletter_sends s
     set sent_count   = c.sent,
         failed_count = c.failed,
         status       = case when c.pending = 0 then 'sent' else 'sending' end,
         completed_at = case when c.pending = 0 then now() end,
         locked_until = case when c.pending = 0 then null else now() + interval '5 minutes' end
    from (
      select count(*) filter (where d.status = 'sent')    as sent,
             count(*) filter (where d.status = 'failed')  as failed,
             count(*) filter (where d.status = 'pending') as pending
      from public.newsletter_deliveries d
      where d.send_id = p_send_id
    ) as c
   where s.id = p_send_id;
end;
$$;

create or replace function public.release_newsletter_send(p_send_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  update public.newsletter_sends set locked_until = null where id = p_send_id;
end;
$$;

-- ── Avmelding ───────────────────────────────────────────────────────────────
-- Kalles bare av appen med service role, etter at HMAC-lenken er verifisert.

create or replace function public.newsletter_unsubscribe(p_email text)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_email text := lower(trim(p_email));
begin
  delete from public.newsletter_subscribers where lower(email) = v_email;
  update public.users
     set newsletter_consent = false
   where id in (select au.id from auth.users au where lower(au.email) = v_email);
end;
$$;

-- ── Tilganger ───────────────────────────────────────────────────────────────

revoke all on function public.newsletter_recipients()                  from public, anon;
revoke all on function public.newsletter_recipient_count()             from public, anon;
revoke all on function public.start_newsletter_send(uuid)              from public, anon;
revoke all on function public.claim_newsletter_send(uuid)              from public, anon;
revoke all on function public.record_newsletter_batch(uuid, jsonb)     from public, anon;
revoke all on function public.release_newsletter_send(uuid)            from public, anon;
grant execute on function public.newsletter_recipients()               to authenticated;
grant execute on function public.newsletter_recipient_count()          to authenticated;
grant execute on function public.start_newsletter_send(uuid)           to authenticated;
grant execute on function public.claim_newsletter_send(uuid)           to authenticated;
grant execute on function public.record_newsletter_batch(uuid, jsonb)  to authenticated;
grant execute on function public.release_newsletter_send(uuid)         to authenticated;

revoke all on function public.newsletter_unsubscribe(text) from public, anon, authenticated;
grant execute on function public.newsletter_unsubscribe(text) to service_role;

-- ── Verifisering (kjør som admin etterpå) ───────────────────────────────────
-- select public.newsletter_recipient_count();
-- select * from public.newsletter_sends;
