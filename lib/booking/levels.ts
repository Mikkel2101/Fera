// Padelnivå og mål for turen. Verdiene lagres i bookings og users
// (migrasjon 029) og deles av booking, profil, admin og e-post.

export const PADEL_LEVELS = [
  { value: 'nybegynner',    label: 'Nybegynner',  description: 'Har lite erfaring og lærer grunnslagene og reglene.' },
  { value: 'middels_minus', label: 'Middels −',   description: 'Kan spille kamper, men er fortsatt ustabil og øver på veggspill og plassering.' },
  { value: 'middels_pluss', label: 'Middels +',   description: 'Spiller jevnlig, bruker veggene og mestrer mye av det taktiske.' },
  { value: 'hoyt',          label: 'Høyt nivå',   description: 'Har god kontroll, tåler høyt tempo og spiller gjerne konkurranser.' },
  { value: 'usikker',       label: 'Usikker – hjelp meg å finne rett nivå', description: 'Trenerne justerer gruppene etter første økt.' },
] as const

// Foretrukket banehalvdel. Lagres i profilen (users), ikke per booking
export const COURT_SIDES = [
  { value: 'venstre', label: 'Venstre' },
  { value: 'hoyre',   label: 'Høyre' },
  { value: 'begge',   label: 'Begge går fint' },
] as const

export const TRIP_GOALS = [
  { value: 'utvikling',    label: 'Utvikle spillet mitt' },
  { value: 'jevne_kamper', label: 'Jevne kamper' },
  { value: 'sosialt',      label: 'Det sosiale' },
  { value: 'kombinasjon',  label: 'Litt av alt' },
] as const

export type PadelLevel = (typeof PADEL_LEVELS)[number]['value']
export type TripGoal   = (typeof TRIP_GOALS)[number]['value']
export type CourtSide  = (typeof COURT_SIDES)[number]['value']

export const PADEL_LEVEL_VALUES = PADEL_LEVELS.map(l => l.value) as [PadelLevel, ...PadelLevel[]]
export const TRIP_GOAL_VALUES   = TRIP_GOALS.map(g => g.value) as [TripGoal, ...TripGoal[]]
export const COURT_SIDE_VALUES  = COURT_SIDES.map(s => s.value) as [CourtSide, ...CourtSide[]]

function labelFrom(options: ReadonlyArray<{ value: string; label: string }>, value: string | null): string {
  if (!value) return ''
  return options.find(o => o.value === value)?.label ?? value
}

export function padelLevelLabel(value: string | null): string {
  return labelFrom(PADEL_LEVELS, value)
}

export function courtSideLabel(value: string | null): string {
  return labelFrom(COURT_SIDES, value)
}

export function tripGoalLabel(value: string | null): string {
  return labelFrom(TRIP_GOALS, value)
}
