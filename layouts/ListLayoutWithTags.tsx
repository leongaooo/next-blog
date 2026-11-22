'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { slug } from 'github-slugger'
import { editorialDate, readingMinutes } from '@/utils/editorial'
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
  totalPostCount?: number
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
    <nav aria-label="文章分页" className="blog-pager">
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
  totalPostCount,
}: ListLayoutProps) {
  const pathname = usePathname()
  const tagCounts = tagData as Record<string, number>
  const sortedTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a])
  const displayPosts = initialDisplayPosts.length > 0 ? initialDisplayPosts : posts
  const onBlogIndex = pathname === '/blog' || pathname === '/blog/'
  const activeTag = decodeURI(pathname.split('/tags/')[1] ?? '')
  const isPaged = /\/blog\/page\/\d+/.test(pathname)
  const pageNo = isPaged ? Number(pathname.match(/\/page\/(\d+)/)?.[1] ?? 1) : 0

  const kicker = isPaged
    ? `WRITING · ARCHIVE · ${pageNo} / ${pagination?.totalPages ?? pageNo}`
    : onBlogIndex
      ? 'WRITING · 长期记录'
      : activeTag
        ? `TAGGED · ${posts.length} 篇`
        : 'WRITING'

  // 移动端标签条是横向滚动：进入某个标签页时把当前标签滚进视口，
  // 否则 15 个标签里靠后的 active 项落在遮罩渐隐之外，看不出当前在哪。
  const navRef = useRef<HTMLElement | null>(null)
  useEffect(() => {
    const aside = navRef.current
    const list = aside?.querySelector('ul') as HTMLElement | null
    const item = aside?.querySelector('.blog-nav-item-on') as HTMLElement | null
    if (!aside || !list || !item) return
    if (list.scrollWidth <= list.clientWidth + 2) return

    const align = () => {
      if (!aside.isConnected || !item.isConnected) return
      if (list.scrollWidth <= list.clientWidth + 2) return
      const listBox = list.getBoundingClientRect()
      const itemBox = item.getBoundingClientRect()
      const itemLeft = list.scrollLeft + itemBox.left - listBox.left
      const itemRight = itemLeft + itemBox.width
      // 短标签在初始位置已完整可见时保持不动，把「全部」留在视口里；
      // 字体加载后当前项若仍偏离左缘，则再校正一次。
      if (itemLeft >= list.scrollLeft && itemRight <= list.scrollLeft + list.clientWidth - 48) {
        if (list.scrollLeft === 0) return
      }
      // 最后一项没有后继标签，靠左后右侧只剩留白；此时保留前一项作为上下文，
      // 仍按整项左缘对齐，避免把邻项计数切在视口边缘。
      const previous = item.parentElement?.previousElementSibling?.querySelector(
        '.blog-nav-item'
      ) as HTMLElement | null
      const target = !item.parentElement?.nextElementSibling && previous ? previous : item
      const targetBox = target.getBoundingClientRect()
      const targetLeft = list.scrollLeft + targetBox.left - listBox.left
      list.scrollLeft = Math.max(0, Math.min(targetLeft, list.scrollWidth - list.clientWidth))
    }

    // 首次渲染时字体和标签宽度还没稳定，滚完会把当前项留在邻项计数上；
    // 等一帧和字体就绪后再对齐一次。
    const raf = requestAnimationFrame(align)
    document.fonts?.ready.then(align)
    return () => cancelAnimationFrame(raf)
  }, [pathname])

  return (
    <div className="blog-page">
      <section className="blog-hero">
        <p className="proj-kicker">{kicker}</p>
        <h1 className="proj-h1">
          {onBlogIndex || isPaged ? (
            '文章'
          ) : activeTag ? (
            <>
              <span aria-hidden="true">#</span>
              <span className="sr-only">标签 </span>
              {activeTag}
            </>
          ) : (
            title
          )}
        </h1>
        <p className="proj-lede">
          {activeTag
            ? `按 #${activeTag} 归档的文章。`
            : '写工程取舍、交付复盘和踩过的坑。先在本地跑通，再写成一页能被人验证的记录。'}
        </p>
      </section>

      <div className="blog-body">
        <aside className="blog-nav" aria-label="标签导航" ref={navRef}>
          <p className="blog-nav-head">TAGS · {sortedTags.length}</p>
          <ul>
            <li>
              {onBlogIndex ? (
                <span className="blog-nav-item blog-nav-item-on" aria-current="true">
                  全部 <em>{totalPostCount ?? posts.length}</em>
                </span>
              ) : (
                <Link className="blog-nav-item" href="/blog">
                  全部 <em>{totalPostCount ?? posts.length}</em>
                </Link>
              )}
            </li>
            {sortedTags.map((t) => (
              <li key={t}>
                {activeTag === slug(t) ? (
                  <span className="blog-nav-item blog-nav-item-on" aria-current="true">
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

        <div className="blog-list">
          {displayPosts.length === 0 ? (
            <div className="blog-empty">
              <p>这个标签下还没有文章。</p>
              <Link className="tap-inline" href="/blog">
                看全部文章 →
              </Link>
            </div>
          ) : null}
          <ul>
            {displayPosts.map((post) => {
              const { path, date, title: postTitle, summary, tags, readingTime } = post
              const isLead = onBlogIndex && displayPosts.indexOf(post) === 0
              return (
                <li key={path} className={isLead ? 'blog-item blog-item--lead' : 'blog-item'}>
                  <dl>
                    <dt className="sr-only">发布于</dt>
                    <dd className="blog-meta">
                      <time dateTime={date} className="blog-date" suppressHydrationWarning>
                        {editorialDate(date)}
                      </time>
                      {readingTime?.minutes ? (
                        <span className="blog-read">
                          · 约 {readingMinutes(readingTime.minutes)} 分钟
                        </span>
                      ) : null}
                      {isLead ? <span className="blog-flag">最新</span> : null}
                    </dd>
                  </dl>
                  <h2 className="blog-title">
                    <Link href={`/${path}`}>{postTitle}</Link>
                  </h2>
                  {summary ? <p className="blog-summary">{summary}</p> : null}
                  {tags?.length ? (
                    <div className="blog-tags">
                      {tags.map((tag) => (
                        <Link key={tag} className="blog-tag" href={`/tags/${slug(tag)}`}>
                          {tag}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
          {pagination && pagination.totalPages > 1 && (
            <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
          )}
        </div>
      </div>
    </div>
  )
}
