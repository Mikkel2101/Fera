-- 049: Forenkler beskrivelsen på hoodie-tillegget (satt i 046) til bare
-- "Lanseringstilbud" — rabattprosenten vises nå som egen badge i
-- booking-skjemaet (ExtrasPicker), så den trenger ikke gjentas i teksten.

update public.trips
set extras = (
  select jsonb_agg(
    case
      when extra->>'name' = 'FERA Hoodie'
        then jsonb_set(extra, '{description}', '"Lanseringstilbud"')
      else extra
    end
  )
  from jsonb_array_elements(extras) as extra
)
where trip_type = 'Padelcamp' and start_date in ('2027-04-06', '2027-04-10', '2027-04-14', '2027-04-17');
