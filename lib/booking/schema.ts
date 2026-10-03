import { z } from 'zod'

export const step1Schema = z.object({
  first_name:   z.string().min(1, 'Fornavn er påkrevd'),
  last_name:    z.string().min(1, 'Etternavn er påkrevd'),
  email:        z.string().email('Ugyldig e-post'),
  phone:        z.string().optional(),
  padel_level:  z.enum(['beginner', 'intermediate', 'advanced', 'elite']).optional(),
})

export const step2Schema = z.object({
  room_type:       z.enum(['Dobbel', 'Single']),
  roommate_name:   z.string().optional(),
  selected_extras: z.array(z.string()).default([]),
})

export const bookingSchema = step1Schema.merge(step2Schema).extend({
  trip_id:        z.string().uuid(),
  gdpr_consent:   z.boolean().refine(v => v, 'GDPR-samtykke er påkrevd'),
  terms_accepted: z.boolean().refine(v => v, 'Vilkår må aksepteres'),
  newsletter_consent: z.boolean().default(false),
})

export type Step1Data = z.infer<typeof step1Schema>
export type Step2Data = z.infer<typeof step2Schema>
export type BookingData = z.infer<typeof bookingSchema>
