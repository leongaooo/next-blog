import { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'

interface PageSEOProps {
  title: string
  description?: string
  image?: string
  canonicalPath?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export function genPageMetadata({
  title,
  description,
  image,
  canonicalPath,
  ...rest
}: PageSEOProps): Metadata {
  const siteUrl = siteMetadata.siteUrl.replace(/\/+$/, '')
  const canonicalUrl = canonicalPath
    ? `${siteUrl}${canonicalPath.startsWith('/') ? '' : '/'}${canonicalPath}`
    : siteUrl
  const bannerAlt = `${siteMetadata.headerTitle}｜${siteMetadata.description}`
  const ogImages = image
    ? [{ url: image, alt: `${title} | ${siteMetadata.headerTitle}` }]
    : [
        {
          url: siteMetadata.socialBanner,
          width: siteMetadata.socialBannerWidth,
          height: siteMetadata.socialBannerHeight,
          alt: bannerAlt,
        },
      ]
  return {
    title,
    alternates: { canonical: canonicalUrl },
    description: description || siteMetadata.description,
    openGraph: {
      title: `${title} | ${siteMetadata.title}`,
      description: description || siteMetadata.description,
      url: canonicalUrl,
      siteName: siteMetadata.title,
      images: ogImages,
      locale: 'zh_CN',
      type: 'website',
    },
    twitter: {
      title: `${title} | ${siteMetadata.title}`,
      card: 'summary_large_image',
      site: '@Leongaooo',
      creator: '@Leongaooo',
      images: image
        ? [{ url: image, alt: `${title} | ${siteMetadata.headerTitle}` }]
        : [{ url: siteMetadata.socialBanner, alt: bannerAlt }],
    },
    ...rest,
  }
}
