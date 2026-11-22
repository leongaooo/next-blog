import Link from '@/components/Link'
import { slug } from 'github-slugger'
import tagData from 'app/tag-data.json'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({ title: '标签', description: '按标签浏览文章' })

export default async function Page() {
  const tagCounts = tagData as Record<string, number>
  const sortedTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a])

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
        {sortedTags.map((t) => (
          <li key={t} className="tag-row">
            <Link href={`/tags/${slug(t)}`} className="tag-row-name">
              {t}
            </Link>
            <span className="tag-row-dots" aria-hidden="true" />
            <span className="tag-row-count">{tagCounts[t]}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
