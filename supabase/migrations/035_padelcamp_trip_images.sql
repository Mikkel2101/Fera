-- 035: Sett hovedbilde for de fire Padelcamp-turene til Albir april 2027 (se 034).
-- Matcher på start_date + trip_type siden turnavnene er endret i admin siden 034.

update public.trips
set main_image = '/Bilder%20fra%20tur/DSC06722.JPG'
where trip_type = 'Padelcamp' and start_date = '2027-04-06';

update public.trips
set main_image = '/Bilder%20fra%20tur/DSC05300.JPG'
where trip_type = 'Padelcamp' and start_date = '2027-04-10';

update public.trips
set main_image = '/Bilder%20fra%20tur/IMG_5414.JPG'
where trip_type = 'Padelcamp' and start_date = '2027-04-14';

update public.trips
set main_image = '/Bilder%20fra%20tur/DSC00767.JPG'
where trip_type = 'Padelcamp' and start_date = '2027-04-17';

-- ── Verifisering (kjør etterpå) ─────────────────────────────────────────────
-- select name, start_date, main_image from public.trips where trip_type = 'Padelcamp' order by start_date;
