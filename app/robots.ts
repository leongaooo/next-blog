import { MetadataRoute } from 'next'
import siteMetadata from '@/data/siteMetadata'

const siteUrl = siteMetadata.siteUrl.replace(/\/$/, '')

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
