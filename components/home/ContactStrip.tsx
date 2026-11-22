import Link from '@/components/Link'
import siteMetadata from '@/data/siteMetadata'
import WeChatCopy from '@/components/WeChatCopy'

export default function ContactStrip() {
  return (
    <div className="rounded-xl border border-[var(--home-border)] bg-[var(--home-card)] p-6">
      <p className="max-w-2xl text-base leading-7 text-[var(--home-muted)]">
        想聊 AI Native 前端的机会，或者要一个演示口令，都可以直接找我。
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
        <Link
          href={siteMetadata.github}
          className="text-[var(--home-muted)] hover:text-[var(--home-accent)]"
        >
          GitHub ↗
        </Link>
        <Link
          href={`mailto:${siteMetadata.email}`}
          className="text-[var(--home-muted)] hover:text-[var(--home-accent)]"
        >
          邮箱 ↗
        </Link>
        <Link href="/about" className="text-[var(--home-muted)] hover:text-[var(--home-accent)]">
          关于我 →
        </Link>
        <WeChatCopy />
      </div>
    </div>
  )
}
