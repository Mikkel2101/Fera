// E-postklienter støtter ikke CSS-variabler, så e-post trenger faste verdier.
// De speiler tokens i app/globals.css (en test passer på at de finnes der).
export const EMAIL_COLORS = {
  white: '#FFFFFF', // --color-bg
  page: '#E9F4F4', // --color-ice-light
  dark: '#420016', // --color-dark / --color-cta
  accent: '#7C0023', // --color-gold
  text: '#1C0008', // --color-text
  muted: '#9B7888', // --color-muted
  subtle: '#7A5868', // --color-subtle
  border: '#EDD8C8', // --color-border
} as const

export const EMAIL_FONTS = {
  serif: "'Playfair Display', Georgia, 'Times New Roman', serif",
  sans: "'DM Sans', Helvetica, Arial, sans-serif",
} as const
