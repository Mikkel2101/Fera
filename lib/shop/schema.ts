import { z } from 'zod'

export const cartItemSchema = z.object({
  product_id:      z.string().min(1),
  name:            z.string().min(1),
  brand:           z.string().min(1),
  price_eur:       z.number().positive(),
  image:           z.string().optional().default(''),
  quantity:        z.number().int().positive(),
  padelpoint_url:  z.string().url().optional(),
})

export const shopCheckoutSchema = z.object({
  items:          z.array(cartItemSchema).min(1, 'Handlekurven er tom'),
  first_name:     z.string().min(1, 'Fornavn er påkrevd'),
  last_name:      z.string().min(1, 'Etternavn er påkrevd'),
  email:          z.string().email('Ugyldig e-postadresse'),
  phone:          z.string().optional(),
  terms_accepted: z.boolean().refine(v => v, 'Du må godta vilkårene'),
})

export type ShopCheckoutData = z.infer<typeof shopCheckoutSchema>
export type CartItemData = z.infer<typeof cartItemSchema>
