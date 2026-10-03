import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SHOP_ENABLED } from '@/lib/flags'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ferabrand.com'
  const supabase = await createClient()

  const [{ data: trips }, { data: products }] = await Promise.all([
    supabase.from('trips').select('id, start_date').eq('published', true),
    SHOP_ENABLED
      ? supabase.from('products').select('id, updated_at').eq('published', true)
      : Promise.resolve({ data: [] as Array<{ id: string; updated_at: string | null }> }),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    ...(SHOP_ENABLED ? [{ url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1 }] : []),
    { url: `${baseUrl}/travels`, lastModified: new Date(), changeFrequency: 'weekly', priority: SHOP_ENABLED ? 0.9 : 1 },
    ...(SHOP_ENABLED ? [{ url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 }] : []),
    { url: `${baseUrl}/travels/om-oss`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/travels/for-klubber`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/travels/for-bedrifter`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/travels/inspirasjon`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/travels/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]

  const tripPages: MetadataRoute.Sitemap = (trips ?? []).map((trip) => ({
    url: `${baseUrl}/travels/${trip.id}`,
    lastModified: trip.start_date ? new Date(trip.start_date) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const productPages: MetadataRoute.Sitemap = (products ?? []).map((product) => ({
    url: `${baseUrl}/shop/${product.id}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...tripPages, ...productPages]
}
