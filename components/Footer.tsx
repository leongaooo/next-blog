import Link from './Link'
import siteMetadata from '@/data/siteMetadata'
import SocialIcon from '@/components/social-icons'

export default function Footer() {
  const socialIcons = [
    { kind: 'mail' as const, href: `mailto:${siteMetadata.email}` },
    { kind: 'github' as const, href: siteMetadata.github },
    { kind: 'linkedin' as const, href: siteMetadata.linkedin },
    { kind: 'x' as const, href: siteMetadata.x },
    { kind: 'juejin' as const, href: siteMetadata.juejin },
  ].filter((icon) => icon.href)

  return (
    <footer className="site-footer">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          {socialIcons.map((icon) => (
            <SocialIcon key={icon.kind} kind={icon.kind} href={icon.href} size={5} />
          ))}
        </div>
        <p className="site-footer-meta">
          {siteMetadata.author} · © {new Date().getFullYear()} · <Link href="/">leongao.me</Link>
        </p>
      </div>
      <p className="site-footer-note">
        Next.js · Vercel 部署 · <Link href="/feed.xml">RSS</Link> ·{' '}
        <Link href={siteMetadata.siteRepo}>源码</Link> <span aria-hidden="true">↗</span>
      </p>
    </footer>
  )
}
