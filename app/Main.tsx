import Link from '@/components/Link'
import HeroStream from '@/components/home/HeroStream'
import GenerativeArt from '@/components/home/GenerativeArt'
import EntryGrid from '@/components/home/EntryGrid'
import FeaturedProjects from '@/components/home/FeaturedProjects'
import PostsRail from '@/components/home/PostsRail'
import ContactStrip from '@/components/home/ContactStrip'
import projectsData from '@/data/projectsData'

const MAX_DISPLAY = 3

export default function Home({ posts }) {
  const demoCount = projectsData.filter((project) => Boolean(project.demoHref)).length

  return (
    <div className="text-[var(--home-text)]">
      <section className="relative mt-6 overflow-hidden rounded-2xl border border-[var(--home-border)] bg-[var(--home-hero)] px-6 pt-10 pb-12 md:px-10 md:pt-14">
        <div
          className="hero-grid pointer-events-none absolute inset-0 opacity-60"
          aria-hidden="true"
        />
        <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative grid grid-cols-1 items-center gap-10 md:grid-cols-[1.05fr_0.95fr] md:gap-14">
          <div className="min-w-0">
            <HeroStream />
          </div>
          <div className="order-first min-w-0 md:order-last">
            <GenerativeArt />
          </div>
        </div>

        <dl className="border-mist-100 relative mt-10 grid grid-cols-2 gap-4 border-t pt-6 md:grid-cols-4">
          {[
            ['静态构建', '130 页'],
            ['首屏脚本', 'SSR 直出'],
            ['自运维服务', 'systemd 托管'],
            ['最近交付', '门禁 + OCR'],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-mist-500 font-mono text-[10px] tracking-[0.18em] uppercase">
                {k}
              </dt>
              <dd className="text-mist-100 mt-1 text-[13px] font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-4">
        <EntryGrid
          entries={[
            {
              href: '/projects',
              label: '作品',
              count: `${projectsData.length} 个项目`,
              detail: '3D 建模工具、OCR 工作台、Cesium 组件库 —— 能点开的优先。',
            },
            {
              href: '/demo',
              label: '演示',
              count: demoCount > 0 ? `${demoCount} 个在线` : '口令制',
              detail: '跑在自运维服务器上，口令按需发放，一小时有效。',
            },
            {
              href: '/blog',
              label: '文章',
              count: `${posts.length} 篇`,
              detail: '工程决策为主：为什么这么选、放弃了什么、代价在哪。',
            },
          ]}
        />
      </section>

      <section className="mt-16">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-[var(--home-strong)]">
            精选作品
          </h2>
          <Link
            href="/projects"
            className="text-xs font-medium text-[var(--home-subtle)] hover:text-[var(--home-accent)]"
          >
            全部作品 →
          </Link>
        </div>
        <FeaturedProjects />
      </section>

      <section className="mt-16">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-[var(--home-strong)]">
            最新写作
          </h2>
          <Link
            href="/blog"
            className="text-xs font-medium text-[var(--home-subtle)] hover:text-[var(--home-accent)]"
          >
            全部文章 →
          </Link>
        </div>
        <PostsRail posts={posts.slice(0, MAX_DISPLAY)} />
      </section>

      <section className="mt-16">
        <ContactStrip />
      </section>
    </div>
  )
}
