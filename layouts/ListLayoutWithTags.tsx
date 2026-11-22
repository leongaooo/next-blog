'use client'

import { usePathname } from 'next/navigation'
import { slug } from 'github-slugger'
import { formatDate } from 'pliny/utils/formatDate'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Link from '@/components/Link'
import siteMetadata from '@/data/siteMetadata'
import tagData from 'app/tag-data.json'

interface PaginationProps {
  totalPages: number
  currentPage: number
}
interface ListLayoutProps {
  posts: CoreContent<Blog>[]
  title: string
  initialDisplayPosts?: CoreContent<Blog>[]
  pagination?: PaginationProps
}

function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname()
  const basePath = pathname
    .replace(/^\//, '')
    .replace(/\/page\/\d+\/?$/, '')
    .replace(/\/$/, '')
  const prevPage = currentPage - 1 > 0
  const nextPage = currentPage + 1 <= totalPages

  return (
    <nav className="blog-pager">
      {prevPage ? (
        <Link
          href={currentPage - 1 === 1 ? `/${basePath}/` : `/${basePath}/page/${currentPage - 1}`}
          rel="prev"
        >
          ← 上一页
        </Link>
      ) : (
        <span className="blog-pager-off">← 上一页</span>
      )}
      <span className="blog-pager-num">
        {currentPage} / {totalPages}
      </span>
      {nextPage ? (
        <Link href={`/${basePath}/page/${currentPage + 1}`} rel="next">
          下一页 →
        </Link>
      ) : (
        <span className="blog-pager-off">下一页 →</span>
      )}
    </nav>
  )
}

export default function ListLayoutWithTags({
  posts,
  title,
  initialDisplayPosts = [],
  pagination,
}: ListLayoutProps) {
  const pathname = usePathname()
  const tagCounts = tagData as Record<string, number>
  const sortedTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a])
  const displayPosts = initialDisplayPosts.length > 0 ? initialDisplayPosts : posts
  const onBlogIndex = pathname === '/blog' || pathname === '/blog/'
  const activeTag = decodeURI(pathname.split('/tags/')[1] ?? '')
  const isPaged = /\/blog\/page\/\d+/.test(pathname)

  const kicker = isPaged
    ? 'WRITING · ARCHIVE'
    : onBlogIndex
      ? 'WRITING · 长期记录'
      : activeTag
        ? `TAGGED · ${posts.length} 篇`
        : 'WRITING'

  return (
    <div className="blog-page">
      <section className="blog-hero">
        <p className="proj-kicker">{kicker}</p>
        <h1 className="proj-h1">
          {onBlogIndex || isPaged ? '文章' : activeTag ? `#${activeTag}` : title}
        </h1>
        <p className="proj-lede">
          {activeTag
            ? `按 #${activeTag} 归档的文章。`
            : '写工程取舍、交付复盘和踩过的坑。先在本地跑通，再写成一页能被人验证的记录。'}
        </p>
      </section>

      <div className="blog-body">
        <aside className="blog-nav" aria-label="标签导航">
          <p className="blog-nav-head">TAGS · {sortedTags.length}</p>
          <ul>
            <li>
              {onBlogIndex ? (
                <span className="blog-nav-item blog-nav-item-on">
                  全部 <em>{posts.length}</em>
                </span>
              ) : (
                <Link className="blog-nav-item" href="/blog">
                  全部 <em>{onBlogIndex || isPaged ? posts.length : ''}</em>
                </Link>
              )}
            </li>
            {sortedTags.map((t) => (
              <li key={t}>
                {activeTag === slug(t) ? (
                  <span className="blog-nav-item blog-nav-item-on">
                    {t} <em>{tagCounts[t]}</em>
                  </span>
                ) : (
                  <Link className="blog-nav-item" href={`/tags/${slug(t)}`}>
                    {t} <em>{tagCounts[t]}</em>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </aside>

        <main className="blog-list">
          <ul>
            {displayPosts.map((post) => {
              const { path, date, title: postTitle, summary, tags, readingTime } = post
              return (
                <li key={path} className="blog-item">
                  <dl>
                    <dt className="sr-only">发布于</dt>
                    <dd className="blog-meta">
                      <time dateTime={date} className="blog-date" suppressHydrationWarning>
                        {formatDate(date, siteMetadata.locale)}
                      </time>
                      {readingTime?.minutes ? (
                        <span className="blog-read">
                          · 约 {Math.max(1, Math.round(readingTime.minutes))} 分钟
                        </span>
                      ) : null}
                    </dd>
                  </dl>
                  <h2 className="blog-title">
                    <Link href={`/${path}`}>{postTitle}</Link>
                  </h2>
                  {tags?.length ? (
                    <div className="blog-tags">
                      {tags.map((tag) => (
                        <Link key={tag} className="blog-tag" href={`/tags/${slug(tag)}`}>
                          {tag}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                  {summary ? <p className="blog-summary">{summary}</p> : null}
                </li>
              )
            })}
          </ul>
          {pagination && pagination.totalPages > 1 && (
            <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
          )}
        </main>
      </div>
    </div>
  )
}
