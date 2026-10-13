import { z } from 'zod'
import { normalizePhone } from './phone'
import { COURT_SIDE_VALUES, PADEL_LEVEL_VALUES, TRIP_GOAL_VALUES } from './levels'
import { ROOM_PREFERENCE_VALUES, ROOM_SHARE_GENDER_VALUES } from './rooms'

const MAX_WISHES_LENGTH = 1000
const MAX_NAME_LENGTH   = 120
const MAX_EXTRA_COUNT   = 20

const phoneSchema = z.string().trim().transform((value, ctx) => {
  const normalized = normalizePhone(value)
  if (!normalized) {
    ctx.addIssue({ code: 'custom', message: 'Skriv inn mobilnummer med landskode, f.eks. +47 912 34 567' })
    return z.NEVER
  }
  return normalized
})

export const step1Schema = z.object({
  first_name:       z.string().trim().min(1, 'Fornavn er påkrevd').max(MAX_NAME_LENGTH),
  last_name:        z.string().trim().min(1, 'Etternavn er påkrevd').max(MAX_NAME_LENGTH),
  email:            z.string().email('Ugyldig e-post'),
  phone:            phoneSchema,
  padel_level:      z.enum(PADEL_LEVEL_VALUES, { error: 'Velg padelnivå' }),
  preferred_side:   z.enum(COURT_SIDE_VALUES).optional(),
  trip_goal:        z.enum(TRIP_GOAL_VALUES).optional(),
  special_requests: z.string().trim().max(MAX_WISHES_LENGTH, `Maks ${MAX_WISHES_LENGTH} tegn`).optional(),
})

export const extraSelectionSchema = z.object({
  name:     z.string().min(1),
  size:     z.string().optional(),
  quantity: z.number().int().min(1).max(MAX_EXTRA_COUNT),
})

export const step2Schema = z.object({
  room_preference:   z.enum(ROOM_PREFERENCE_VALUES, { error: 'Velg romønske' }),
  roommate_name:     z.string().trim().max(MAX_NAME_LENGTH).optional(),
  room_share_gender: z.enum(ROOM_SHARE_GENDER_VALUES).optional(),
  extras:            z.array(extraSelectionSchema).max(MAX_EXTRA_COUNT).default([]),
}).superRefine((data, ctx) => {
  if (data.room_preference === 'partner' && !data.roommate_name) {
    ctx.addIssue({ code: 'custom', path: ['roommate_name'], message: 'Skriv navnet på reisepartneren din' })
  }
  if (data.room_preference === 'match' && !data.room_share_gender) {
    ctx.addIssue({ code: 'custom', path: ['room_share_gender'], message: 'Velg kjønn, så vi kan finne en romkamerat' })
  }
})

export const bookingSchema = z.object({
  ...step1Schema.shape,
  trip_id:            z.string().uuid(),
  room_preference:    step2Schema.shape.room_preference,
  roommate_name:      step2Schema.shape.roommate_name,
  room_share_gender:  step2Schema.shape.room_share_gender,
  extras:             step2Schema.shape.extras,
  gdpr_consent:       z.boolean().refine(v => v, 'GDPR-samtykke er påkrevd'),
  terms_accepted:     z.boolean().refine(v => v, 'Vilkår må aksepteres'),
  newsletter_consent: z.boolean().default(false),
})

export type Step1Input  = z.input<typeof step1Schema>
export type Step1Data   = z.infer<typeof step1Schema>
export type Step2Data   = z.infer<typeof step2Schema>
export type BookingData = z.infer<typeof bookingSchema>
