const PHOTOS = 'https://dbvnuoayzevtoaolhqxd.supabase.co/storage/v1/object/public/photos'

export type Author = {
  name: string
  role: string
  photo: string
}

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
  author: Author
}

const PETTER: Author = { name: 'Petter Skimmeland', role: 'Reiseleder, Fera Travel', photo: '/Petter_Skimmeland.jpg' }

export const posts: BlogPost[] = [
  {
    slug: 'en-uke-i-albir',
    category: 'Reiser',
    title: 'En uke i Albir — slik var det',
    excerpt: 'Femten padel-entusiaster fra Oslo. Sju dager med sol, padel og gode minner. Her er alt som skjedde.',
    date: '20. mai 2026',
    readTime: '7 min',
    image: `${PHOTOS}/action-evening.jpg`,
    imageAlt: 'Spillere i aksjon på padelbane i Albir',
    metaDescription: 'Reiserapport fra Fera Padels tur til Albir, Costa Blanca. Sju dager med coaching, sol og padel — les hva som venter deg på en padelreise til Spania.',
    author: PETTER,
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
    author: PETTER,
  },
  {
    slug: 'derfor-elsker-vi-costa-blanca',
    category: 'Reiser',
    title: 'FERA - padel, sol og folk du vil møte igjen',
    excerpt: 'Det er morgen på Costa Blanca, og padelbanene venter. Dette er historien om hvorfor FERA finnes, og hvorfor vi fortsatt får gåsehud på avreisedagen.',
    date: '3. mai 2026',
    readTime: '6 min',
    image: `${PHOTOS}/palm-sunset.jpg`,
    imageAlt: 'Padelbane med palmer og solnedgang i Costa Blanca',
    metaDescription: 'Les historien bak FERA — hvordan det startet, hvorfor vi elsker Costa Blanca, og fellesskapet vi ønsker å bygge rundt padel og reise.',
    author: PETTER,
  },
]

export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug)
}
