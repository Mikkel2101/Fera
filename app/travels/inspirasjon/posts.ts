const PHOTOS = 'https://dbvnuoayzevtoaolhqxd.supabase.co/storage/v1/object/public/photos'

export type BlogPost = {
  slug: string
  category: string
  title: string
  excerpt: string
  date: string
  readTime: string
  image: string
  imageAlt: string
  metaDescription: string
}

export const posts: BlogPost[] = [
  {
    slug: 'en-uke-i-albir',
    category: 'Reiserapport',
    title: 'En uke i Albir — slik var det',
    excerpt: 'Femten padel-entusiaster fra Oslo. Sju dager med sol, padel og gode minner. Her er alt som skjedde.',
    date: '20. mai 2026',
    readTime: '7 min',
    image: `${PHOTOS}/action-evening.jpg`,
    imageAlt: 'Spillere i aksjon på padelbane i Albir',
    metaDescription: 'Reiserapport fra Fera Padels tur til Albir, Costa Blanca. Sju dager med coaching, sol og padel — les hva som venter deg på en padelreise til Spania.',
  },
  {
    slug: 'coaching-med-andre',
    category: 'Coaching',
    title: 'Hva skjer egentlig på en coaching-økt med André?',
    excerpt: 'André Schlyter er ikke en vanlig trener. Vi tok med kamera på banen for å vise deg hva du kan forvente.',
    date: '12. mai 2026',
    readTime: '5 min',
    image: `${PHOTOS}/coach-bullpadel.jpg`,
    imageAlt: 'André Schlyter klar på padelbane',
    metaDescription: 'Hvordan er det å trene padel med André Schlyter? Vi beskriver coaching-metodikken, hva du lærer og hvorfor deltakerne på Fera Padels turer alltid kommer hjem som bedre spillere.',
  },
  {
    slug: 'derfor-elsker-vi-costa-blanca',
    category: 'Destinasjon',
    title: 'Derfor elsker vi Costa Blanca',
    excerpt: '300 soldager i året, fantastiske padelsentre og mat som slår alt. Vi forteller deg hvorfor Costa Blanca er det perfekte padelreisemålet.',
    date: '3. mai 2026',
    readTime: '6 min',
    image: `${PHOTOS}/palm-sunset.jpg`,
    imageAlt: 'Padelbane med palmer og solnedgang i Costa Blanca',
    metaDescription: 'Costa Blanca er Europas padel-hovedstad. Her er de viktigste grunnene til at vi alltid kommer tilbake — og hvorfor du bør booke en padelreise til Spania.',
  },
]

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug)
}
