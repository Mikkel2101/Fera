import { formatBookedExtra, type BookedExtra } from '@/lib/booking/extras'
import type { PriceBreakdown } from '@/lib/booking/pricing'

type Props = {
  price:  PriceBreakdown
  extras: BookedExtra[]
}

function Row({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex justify-between gap-4 text-sm text-(--color-subtle)">
      <span>{label}</span>
      <span className="whitespace-nowrap">{amount} EUR</span>
    </div>
  )
}

export default function PriceSummary({ price, extras }: Props) {
  return (
    <div className="bg-(--color-beige) rounded-xl p-5 space-y-2">
      <p className="text-sm font-medium text-(--color-text) mb-3">Prisoversikt per person</p>
      <Row label="Grunnpris i delt dobbeltrom" amount={price.base} />
      {price.single_supplement > 0 && <Row label="Enkeltromstillegg" amount={price.single_supplement} />}
      {extras.map(extra => (
        <Row
          key={`${extra.name}|${extra.size ?? ''}`}
          label={formatBookedExtra(extra)}
          amount={extra.unit_price_eur * extra.quantity}
        />
      ))}
      <div className="border-t border-(--color-border) pt-2 flex justify-between font-bold text-(--color-gold)">
        <span>Totalpris</span>
        <span>{price.total} EUR</span>
      </div>
      <Row label="Depositum" amount={price.deposit} />
      <Row label="Restbeløp" amount={price.rest} />
      <p className="text-xs text-(--color-subtle) pt-1">
        Ingen betaling nå. Vi tar kontakt med betalingsinformasjon og frister før reservasjonen blir bindende.
      </p>
    </div>
  )
}
