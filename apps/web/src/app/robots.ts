import { PUBLIC_ROUTES, SITE_URL } from '@/shared/config/site'

import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: [...PUBLIC_ROUTES], disallow: '/' }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
