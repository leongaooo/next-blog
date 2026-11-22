import Link from '@/components/Link'
import NotFoundTitle from '@/components/NotFoundTitle'
import SiteSearch from '@/components/SiteSearch'

export default function NotFound() {
  return (
    <div className="nf-page">
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
  )
}
