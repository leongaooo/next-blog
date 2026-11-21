import Link from '@/components/Link'
import siteMetadata from '@/data/siteMetadata'
import WeChatCopy from '@/components/WeChatCopy'

const IdentityLinks = () => (
  <nav
    aria-label="个人链接"
    className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400"
  >
    <Link href={siteMetadata.github} className="hover:text-primary-500 dark:hover:text-primary-400">
      GitHub ↗
    </Link>
    <Link
      href={siteMetadata.siteUrl}
      className="hover:text-primary-500 dark:hover:text-primary-400"
    >
      个人站 ↗
    </Link>
    <Link
      href={`mailto:${siteMetadata.email}`}
      className="hover:text-primary-500 dark:hover:text-primary-400"
    >
      邮箱 ↗
    </Link>
    <WeChatCopy />
  </nav>
)

export default IdentityLinks
