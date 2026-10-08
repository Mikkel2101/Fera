import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { FC } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { generateJSON } from '@tiptap/html/server'
import { articleExtensions } from '../lib/articles/extensions'
import { sanitizeDoc } from '../lib/articles/content'
import { posts } from '../app/travels/inspirasjon/posts'
import EnUkeIAlbir from '../app/travels/inspirasjon/content/en-uke-i-albir'
import CoachingMedAndre from '../app/travels/inspirasjon/content/coaching-med-andre'
import DerforElskerViCostaBlanca from '../app/travels/inspirasjon/content/derfor-elsker-vi-costa-blanca'

const OUTPUT = 'supabase/migrations/024_seed_articles.sql'
const IMAGE_PREFIX = 'https://dbvnuoayzevtoaolhqxd.supabase.co/storage/v1/object/public/'
const AUTHOR = 'Fera Padel'

const CONTENT: Record<string, FC> = {
  'en-uke-i-albir': EnUkeIAlbir,
  'coaching-med-andre': CoachingMedAndre,
  'derfor-elsker-vi-costa-blanca': DerforElskerViCostaBlanca,
}

const MONTHS: Record<string, number> = {
  januar: 1, februar: 2, mars: 3, april: 4, mai: 5, juni: 6,
  juli: 7, august: 8, september: 9, oktober: 10, november: 11, desember: 12,
}

export function parseNorwegianDate(value: string): string {
  const match = value.match(/^(\d{1,2})\. (\p{L}+) (\d{4})$/u)
  const month = match ? MONTHS[match[2].toLowerCase()] : undefined
  if (!match || !month) throw new Error(`Ukjent dato: ${value}`)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${match[3]}-${pad(month)}-${pad(Number(match[1]))}T12:00:00.000Z`
}

export function sqlText(value: string | null): string {
  return value === null ? 'null' : `'${value.replaceAll("'", "''")}'`
}

function buildRow(post: (typeof posts)[number]): string {
  const Content = CONTENT[post.slug]
  if (!Content) throw new Error(`Mangler innhold for ${post.slug}`)
  const html = renderToStaticMarkup(<Content />)
  const doc = sanitizeDoc(generateJSON(html, articleExtensions), IMAGE_PREFIX)
  if (doc.content.length === 0) throw new Error(`Tomt innhold etter konvertering: ${post.slug}`)
  const json = JSON.stringify(doc)
  if (json.includes('$json$')) throw new Error('Innholdet inneholder $json$')

  return `(${[
    sqlText(post.slug),
    sqlText(post.title),
    sqlText(post.excerpt),
    sqlText(post.category),
    sqlText(post.image),
    sqlText(post.imageAlt),
    sqlText(post.metaDescription),
    `$json$${json}$json$::jsonb`,
    `'published'`,
    sqlText(parseNorwegianDate(post.date)),
    sqlText(AUTHOR),
  ].join(', ')})`
}

function main() {
  const rows = posts.map(buildRow)
  const sql = [
    '-- 024: De tre opprinnelige inspirasjonsartiklene, flyttet fra kode til databasen.',
    '-- Generert av scripts/generate-article-seed.tsx (slettet etterpå, se git-historikk).',
    'insert into public.articles',
    '  (slug, title, excerpt, category, cover_image, cover_image_alt, meta_description, content, status, published_at, author_name)',
    'values',
    rows.join(',\n'),
    'on conflict (slug) do nothing;',
    '',
  ].join('\n')
  writeFileSync(OUTPUT, sql)
  console.info(`Skrev ${rows.length} artikler til ${OUTPUT}`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
