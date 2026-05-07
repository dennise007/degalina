import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://diecastsatis.com'

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/giris`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/kayit`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  try {
    const supabase = await createClient()
    const { data: listings } = await supabase
      .from('listings')
      .select('id, updated_at')
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(1000)

    const listingPages: MetadataRoute.Sitemap = (listings || []).map((listing) => ({
      url: `${baseUrl}/ilan/${listing.id}`,
      lastModified: new Date(listing.updated_at || new Date()),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    return [...staticPages, ...listingPages]
  } catch (err) {
    return staticPages
  }
}