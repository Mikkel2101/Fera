// FeraShop er skjult til den er klar for lansering. Slå på med
// NEXT_PUBLIC_SHOP_ENABLED=true i Vercel (krever ny build — NEXT_PUBLIC_*
// bakes inn i klient-bundelen). Mangler variabelen, er shop skjult.
export const SHOP_ENABLED = process.env.NEXT_PUBLIC_SHOP_ENABLED === 'true'
