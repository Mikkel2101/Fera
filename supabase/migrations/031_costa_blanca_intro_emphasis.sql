-- 031: Gjør innledningsavsnittet i «Derfor elsker vi Costa Blanca» tykkere og i mørk rød.

update public.articles
set content = jsonb_set(
  content,
  '{content,0,content,0,marks}',
  '[{"type":"bold"},{"type":"textColor","attrs":{"token":"dark-mid"}}]'::jsonb
)
where slug = 'derfor-elsker-vi-costa-blanca';

-- ── Verifisering (kjør som admin etterpå) ───────────────────────────────────
-- select content->'content'->0->'content'->0->'marks' from public.articles where slug = 'derfor-elsker-vi-costa-blanca';
