import Link from '@/components/Link'
import { formatDate } from 'pliny/utils/formatDate'
import siteMetadata from '@/data/siteMetadata'

type PostItem = {
  slug: string
  title: string
  date: string
  readingTime?: { minutes: number }
}

export default function PostsRail({ posts }: { posts: PostItem[] }) {
  return (
    <ul className="divide-y divide-[var(--home-border)] border-y border-[var(--home-border)]">
      {posts.map((post) => (
        <li key={post.slug}>
          <Link
            href={`/blog/${post.slug}`}
            className="group flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4"
          >
            <span className="text-base font-medium text-[var(--home-text)] transition-colors group-hover:text-[var(--home-accent)]">
              {post.title}
            </span>
            <span className="flex items-center gap-3 font-mono text-[11px] text-[var(--home-subtle)] tabular-nums">
              <time dateTime={post.date}>{formatDate(post.date, siteMetadata.locale)}</time>
              {post.readingTime?.minutes ? (
                <span>{Math.round(post.readingTime.minutes)} 分钟</span>
              ) : null}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
