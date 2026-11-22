import Link from '@/components/Link'
import { slug } from 'github-slugger'
import { allBlogs } from 'contentlayer/generated'
import tagData from 'app/tag-data.json'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({ title: '标签', description: '按标签浏览文章' })

export default async function Page() {
  const tagCounts = tagData as Record<string, number>
  const sortedTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a])
  const totalPosts = allBlogs.filter((post) => !post.draft).length

  return (
    <div className="tags-page">
      <section className="tags-hero">
        <p className="proj-kicker">INDEX · {sortedTags.length} TAGS</p>
        <h1 className="proj-h1">标签</h1>
        <p className="proj-lede">
          按主题翻：部署与交付、前端与 3D、AI 产品，还有一路踩过的自动化。
        </p>
      </section>

      <ul className="tag-list">
        <li className="tag-row tag-row-all">
          <Link href="/blog" className="tag-row-link" aria-label={`全部文章，共 ${totalPosts} 篇`}>
            <span className="tag-row-name">全部文章</span>
            <span className="tag-row-dots" aria-hidden="true" />
            <span className="tag-row-count">{totalPosts}</span>
          </Link>
        </li>
        {sortedTags.map((t) => (
          <li key={t} className="tag-row">
            <Link
              href={`/tags/${slug(t)}`}
              className="tag-row-link"
              aria-label={`${t}，${tagCounts[t]} 篇文章`}
            >
              <span className="tag-row-name">{t}</span>
              <span className="tag-row-dots" aria-hidden="true" />
              <span className="tag-row-count">{tagCounts[t]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
