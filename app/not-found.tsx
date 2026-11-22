import Link from '@/components/Link'
import NotFoundTitle from '@/components/NotFoundTitle'
import SiteSearch from '@/components/SiteSearch'
import { allBlogs } from 'contentlayer/generated'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'

const recentPosts = allCoreContent(sortPosts(allBlogs.filter((post) => !post.draft))).slice(0, 3)

export default function NotFound() {
  return (
    <div className="nf-page">
      <div className="nf-body">
        <div className="nf-main">
          <NotFoundTitle />
          <p className="proj-kicker">404 · NOT FOUND</p>
          <h1 className="nf-code">这一页不在了</h1>
          <p className="nf-lede">链接可能改过名，或者这条路径从来没存在过。</p>
          <div className="nf-actions">
            <Link className="nf-btn nf-btn--primary" href="/">
              回首页 →
            </Link>
            <Link className="nf-btn" href="/projects">
              看作品
            </Link>
            <Link className="nf-btn" href="/blog">
              读文章
            </Link>
            <SiteSearch variant="inline" />
          </div>
          <p className="nf-note">LEONGAO.ME / ERROR 404</p>
        </div>

        {/* 右栏列最近三条真实文章，别让 404 页右半边空着 */}
        <aside className="nf-recent" aria-label="最近写的文章">
          <p className="nf-recent-head">最近写过</p>
          <ul className="nf-recent-list">
            {recentPosts.map((post) => (
              <li key={post.path}>
                <Link className="nf-recent-item" href={`/${post.path}`}>
                  <span className="nf-recent-date">
                    {new Date(post.date).toLocaleDateString('sv-SE')}
                  </span>
                  <span className="nf-recent-title">{post.title}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link className="nf-recent-all" href="/blog">
            全部文章 →
          </Link>
        </aside>
      </div>
    </div>
  )
}
