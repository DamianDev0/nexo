import { PUBLIC_ROUTES, SITE_URL } from '@/shared/config/site'

import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    changeFrequency: 'monthly',
    priority: route === '/login' ? 1 : 0.8,
  }))
}
