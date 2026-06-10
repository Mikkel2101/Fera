import type { PadelpointAdapter } from './types'

// NOTE: stub — live scraping av racketstore.com (engelsk Padelpoint-storefront,
// samme backend som tiendapadelpoint.com) implementeres i fase 2.
// PADELPOINT_SYNC_ENABLED=true aktiverer cron-endepunktet, men dette stubet returnerer
// alltid tom liste for å hindre utilsiktede nettverkskall.
export const scraperStubAdapter: PadelpointAdapter = {
  async fetchProducts() {
    return []
  },
}
