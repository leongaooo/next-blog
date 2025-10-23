import Link from './Link'
import siteMetadata from '@/data/siteMetadata'
import SocialIcon from '@/components/social-icons'
import { FadeInUp, StaggerContainer, StaggerItem } from './animations'

export default function Footer() {
  const socialIcons = [
    { kind: 'mail' as const, href: `mailto:${siteMetadata.email}` },
    { kind: 'github' as const, href: siteMetadata.github },
    { kind: 'linkedin' as const, href: siteMetadata.linkedin },
    { kind: 'x' as const, href: siteMetadata.x },
    { kind: 'wechat' as const, href: siteMetadata.wechat },
    { kind: 'juejin' as const, href: siteMetadata.juejin },
  ].filter((icon) => icon.href)

  return (
    <footer>
      <FadeInUp delay={0.1}>
        <div className="mt-16 flex flex-col items-center">
          <StaggerContainer>
            <div className="mb-3 flex space-x-4">
              {socialIcons.map((icon, index) => (
                <StaggerItem key={icon.kind} delay={index * 0.1}>
                  <SocialIcon kind={icon.kind} href={icon.href} size={6} />
                </StaggerItem>
              ))}
            </div>
          </StaggerContainer>
          <FadeInUp delay={0.3}>
            <div className="mb-2 flex space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <div>{siteMetadata.author}</div>
              <div>{` • `}</div>
              <div>{`© ${new Date().getFullYear()}`}</div>
              <div>{` • `}</div>
              <Link href="/">{siteMetadata.title}</Link>
            </div>
          </FadeInUp>
          <FadeInUp delay={0.4}>
            <div className="mb-8 text-sm text-gray-500 dark:text-gray-400">
              <Link href="https://github.com/timlrx/tailwind-nextjs-starter-blog">
                Tailwind Nextjs Theme
              </Link>
            </div>
          </FadeInUp>
        </div>
      </FadeInUp>
    </footer>
  )
}
