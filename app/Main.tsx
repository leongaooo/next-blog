import { Suspense } from 'react'
import Link from '@/components/Link'
import HeroStream from '@/components/home/HeroStream'
import HeroScene from '@/components/home/HeroScene'
import HeroSceneV2, { HeroScenePoster, HeroSceneVersion } from '@/components/home/HeroSceneV2'
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
      <section className="relative mt-6 overflow-hidden rounded-2xl border border-[var(--home-border)] bg-[var(--home-hero)] px-4 pt-10 pb-12 sm:px-6 md:px-10 md:pt-14">
        <div
          className="hero-grid pointer-events-none absolute inset-0 opacity-60"
          aria-hidden="true"
        />
        <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="hero2-layout relative grid grid-cols-1 items-center gap-10 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:gap-14">
          <div className="hero2-copy max-w-[560px] min-w-0">
            <HeroStream />
          </div>
          <div className="hero2-view min-w-0 md:order-last">
            <Suspense fallback={<HeroScenePoster />}>
              <HeroSceneVersion v1={<HeroScene />} v2={<HeroSceneV2 />} />
            </Suspense>
          </div>
        </div>

        <dl className="relative mt-10 grid grid-cols-2 gap-4 border-t border-[var(--home-border)] pt-6 md:grid-cols-4">
          {[
            ['交付形态', '静态构建 + SSR'],
            ['首屏脚本', 'SSR 直出'],
            ['运行环境', 'Vercel · 托管'],
            ['最近交付', '门禁 + OCR'],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="font-mono text-[10px] tracking-[0.18em] text-[var(--home-muted)] uppercase">
                {k}
              </dt>
              <dd className="mt-1 text-[13px] font-medium text-[var(--home-strong)]">{v}</dd>
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
              count: demoCount > 0 ? `${demoCount} 个入口` : '口令制',
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
            className="section-head-link tap-inline text-xs font-medium text-[var(--home-subtle)] hover:text-[var(--home-accent)]"
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
            className="section-head-link tap-inline text-xs font-medium text-[var(--home-subtle)] hover:text-[var(--home-accent)]"
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
