import Link from '@/components/Link'
import siteMetadata from '@/data/siteMetadata'
import WeChatCopy from '@/components/WeChatCopy'

const IdentityLinks = () => (
  <nav
    aria-label="个人链接"
    className="flex flex-col items-start gap-y-2 text-[13px] text-[var(--home-muted)]"
  >
    <Link href={siteMetadata.github} className="hover:text-[var(--home-accent)]">
      GitHub ↗
    </Link>
    <Link href={`mailto:${siteMetadata.email}`} className="hover:text-[var(--home-accent)]">
      邮箱 ↗
    </Link>
    <WeChatCopy variant="plain" />
  </nav>
)

export default IdentityLinks
