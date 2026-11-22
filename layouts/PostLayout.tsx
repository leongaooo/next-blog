import { ReactNode } from 'react'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog, Authors } from 'contentlayer/generated'
import Comments from '@/components/Comments'
import Link from '@/components/Link'
import SectionContainer from '@/components/SectionContainer'
import siteMetadata from '@/data/siteMetadata'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'
import GithubSlugger from 'github-slugger'

const editUrl = (path) => `${siteMetadata.siteRepo}/blob/main/data/${path}`
const discussUrl = (path) =>
  `https://mobile.twitter.com/search?q=${encodeURIComponent(`${siteMetadata.siteUrl}/${path}`)}`

interface LayoutProps {
  content: CoreContent<Blog>
  authorDetails: CoreContent<Authors>[]
  next?: { path: string; title: string }
  prev?: { path: string; title: string }
  children: ReactNode
}

export default function PostLayout({ content, authorDetails, next, prev, children }: LayoutProps) {
  const { filePath, path, slug, date, title, tags, summary, readingTime } = content
  const toc = (content as { toc?: { value: string; url: string; depth: number }[] }).toc ?? []
  const tocItems = toc.filter((item) => item.depth <= 2).slice(0, 12)
  const slugger = new GithubSlugger()
  const basePath = path.split('/')[0]

  const renderTocList = () => (
    <ul>
      {tocItems.map((item, index) => (
        <li key={item.url}>
          <a href={item.url}>
            <span className="post-toc-no">{String(index + 1).padStart(2, '0')}</span>
            {item.value}
          </a>
        </li>
      ))}
    </ul>
  )

  return (
    <SectionContainer>
      <ScrollTopAndComment />
      <article className="post-page">
        <header className="post-head">
          <time dateTime={date} className="post-date">
            {new Date(date).toLocaleDateString('sv-SE')}
          </time>
          <h1 className="post-h1">{title}</h1>
          {summary ? <p className="post-lede">{summary}</p> : null}
          <div className="post-meta">
            <span>{authorDetails.map((a) => a.name).join(' · ')}</span>
            {readingTime?.minutes ? (
              <>
                <span className="post-meta-dot">·</span>
                <span>{Math.round(readingTime.minutes)} 分钟阅读</span>
              </>
            ) : null}
          </div>
        </header>

        {tocItems.length >= 3 ? (
          <>
            <nav className="post-toc post-toc-d" aria-label="本页目录">
              <p className="post-toc-label">ON THIS PAGE · {tocItems.length}</p>
              {renderTocList()}
            </nav>
            <details className="post-toc post-toc-m">
              <summary>
                <span className="post-toc-label">本页目录 · {tocItems.length} 条</span>
              </summary>
              {renderTocList()}
            </details>
          </>
        ) : null}

        <div className="post-copy prose dark:prose-invert max-w-none">{children}</div>

        <footer className="post-foot">
          {tags?.length ? (
            <div className="post-tags">
              {tags.map((tag) => (
                <Link key={tag} className="blog-tag" href={`/tags/${slugger.slug(tag)}`}>
                  {tag}
                </Link>
              ))}
            </div>
          ) : null}

          {(next || prev) && (
            <div className="post-nav">
              {prev?.path ? (
                <Link className="post-nav-item" href={`/${prev.path}`}>
                  <span className="post-nav-label">← 上一篇</span>
                  <span className="post-nav-title">{prev.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {next?.path ? (
                <Link className="post-nav-item post-nav-item--next" href={`/${next.path}`}>
                  <span className="post-nav-label">下一篇 →</span>
                  <span className="post-nav-title">{next.title}</span>
                </Link>
              ) : (
                <span />
              )}
            </div>
          )}

          <div className="post-actions">
            <Link href={`/${basePath}`}>← 回到文章列表</Link>
            <span className="post-meta-dot">·</span>
            <Link href={discussUrl(path)} rel="nofollow">
              在 X 上讨论
            </Link>
            <span className="post-meta-dot">·</span>
            <Link href={editUrl(filePath)}>在 GitHub 看源文</Link>
          </div>

          {siteMetadata.comments && (
            <div className="pt-6" id="comment">
              <Comments slug={slug} />
            </div>
          )}
        </footer>
      </article>
    </SectionContainer>
  )
}
