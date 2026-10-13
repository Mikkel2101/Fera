-- 023: Artikler (inspirasjon/blogg) redigeres i /admin. Innhold er Tiptap-JSON.

create table public.articles (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique
                   check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  title            text not null check (char_length(title) between 1 and 150),
  excerpt          text not null default '' check (char_length(excerpt) <= 300),
  category         text not null default 'Reiserapport'
                   check (category in ('Reiserapport','Coaching','Destinasjon','Tips','Nyheter')),
  cover_image      text,
  cover_image_alt  text,
  meta_description text check (meta_description is null or char_length(meta_description) <= 200),
  content          jsonb not null default '{"type":"doc","content":[]}'::jsonb,
  status           text not null default 'draft' check (status in ('draft','published')),
  published_at     timestamptz,
  author_id        uuid references auth.users(id) on delete set null,
  author_name      text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint articles_published_has_date check (status = 'draft' or published_at is not null)
);

create index articles_status_published_at_idx on public.articles (status, published_at desc);

create or replace function public.articles_touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger articles_touch_updated_at
  before update on public.articles
  for each row execute function public.articles_touch_updated_at();

-- RLS: alle leser publiserte, admin gjør alt
alter table public.articles enable row level security;

create policy "articles: les publiserte" on public.articles
  for select to anon, authenticated
  using (status = 'published');

create policy "articles: admin alt" on public.articles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Storage: offentlig bøtte (public URL-er virker uten select-policy).
-- Listing/skriving kun for admin.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('articles', 'articles', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "articles-bilder: admin les" on storage.objects;
create policy "articles-bilder: admin les" on storage.objects
  for select to authenticated
  using (bucket_id = 'articles' and public.is_admin());

drop policy if exists "articles-bilder: admin last opp" on storage.objects;
create policy "articles-bilder: admin last opp" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'articles' and public.is_admin());

drop policy if exists "articles-bilder: admin oppdater" on storage.objects;
create policy "articles-bilder: admin oppdater" on storage.objects
  for update to authenticated
  using (bucket_id = 'articles' and public.is_admin());

drop policy if exists "articles-bilder: admin slett" on storage.objects;
create policy "articles-bilder: admin slett" on storage.objects
  for delete to authenticated
  using (bucket_id = 'articles' and public.is_admin());
