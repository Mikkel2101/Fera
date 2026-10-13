// Telefonnummer lagres med landskode (+4791234567) så hotell, transfer og
// trenere kan ringe uansett hvor gjesten bor. Norske 8-sifrede nummer
// uten landskode får +47, fordi nesten alle kundene er norske.

const NORWEGIAN_LOCAL = /^\d{8}$/
const INTERNATIONAL   = /^\+\d{8,15}$/

export function normalizePhone(input: string): string | null {
  const compact = input.replace(/[\s\-().]/g, '')
  const withPlus = compact.startsWith('00') ? `+${compact.slice(2)}` : compact

  if (NORWEGIAN_LOCAL.test(withPlus)) return `+47${withPlus}`
  return INTERNATIONAL.test(withPlus) ? withPlus : null
}
