import projectsData, { FEATURED_PROJECTS } from '@/data/projectsData'
import ProjectCard from '@/components/projects/ProjectCard'
import WeChatCopy from '@/components/WeChatCopy'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({ title: '作品与服务交付' })

export default function Projects() {
  const featured = projectsData.filter((p) => FEATURED_PROJECTS.includes(p.title))
  const rest = projectsData.filter((p) => !FEATURED_PROJECTS.includes(p.title))
  const tail = rest[rest.length - 1]
  const grid = rest.slice(0, -1)
  const demoCount = projectsData.filter((p) => p.demoHref).length
  const npmCount = projectsData.filter((p) => p.stack?.includes('Cesium')).length

  return (
    <div className="proj-page">
      <section className="proj-hero">
        <p className="proj-kicker">EVIDENCE WALL · 2021 — 2026</p>
        <h1 className="proj-h1">作品与服务交付</h1>
        <p className="proj-lede">
          每个项目只写三件事：解决什么问题、我负责哪一段、最后能验证到什么。线上入口都在跑，源码都能打开。
        </p>
        <ul className="proj-stats">
          <li>
            <strong>{projectsData.length}</strong>
            <span>个项目</span>
          </li>
          <li>
            <strong>{demoCount}</strong>
            <span>个在线演示</span>
          </li>
          <li>
            <strong>{npmCount}</strong>
            <span>个 npm 包</span>
          </li>
          <li>
            <strong>2021</strong>
            <span>起持续交付</span>
          </li>
        </ul>
      </section>

      {featured.length > 0 && (
        <section className="proj-featured" aria-label="主推项目">
          {featured.map((p, i) => (
            <ProjectCard key={p.title} project={p} index={i} featured />
          ))}
        </section>
      )}

      <section className="proj-grid" aria-label="其他项目">
        {grid.map((p, i) => (
          <ProjectCard key={p.title} project={p} index={i + featured.length} />
        ))}
      </section>

      {tail && (
        <section className="proj-tail" aria-label="最近项目">
          <ProjectCard project={tail} index={featured.length + rest.length - 1} wide />
        </section>
      )}

      <section className="proj-foot">
        <div className="proj-foot-text">
          <p className="proj-kicker">需要看现场</p>
          <p>在线演示带口令，加微信拿当日入口；也可以直接约一次 20 分钟的代码走查。</p>
        </div>
        <WeChatCopy />
      </section>
    </div>
  )
}
