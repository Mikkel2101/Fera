-- 033: Forfatterrolle (vises i mindre font under navnet på artikkelsiden).

alter table public.articles add column author_role text;

update public.articles
set author_role = 'Grunnlegger av FERA'
where slug = 'derfor-elsker-vi-costa-blanca';
