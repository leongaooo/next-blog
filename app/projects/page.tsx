import projectsData, { FEATURED_PROJECTS } from '@/data/projectsData'
import ProjectCard from '@/components/projects/ProjectCard'
import WeChatCopy from '@/components/WeChatCopy'
import { genPageMetadata } from 'app/seo'
import LionMarkTrad from '@/components/layout/LionMarkTrad'

export const metadata = genPageMetadata({ title: '作品与服务交付', canonicalPath: '/projects' })

export default function Projects() {
  const featured = projectsData.filter((p) => FEATURED_PROJECTS.includes(p.title))
  const rest = projectsData.filter((p) => !FEATURED_PROJECTS.includes(p.title))
  // 双数列排满两列；奇数时最后一张落单，才改用整行卡片，避免半边留白
  const hasOdd = rest.length % 2 === 1
  const grid = hasOdd ? rest.slice(0, -1) : rest
  const tail = hasOdd ? rest[rest.length - 1] : undefined
  // 这两个数字都按「卡片上真实挂着什么链接」算，不从技术栈推断
  const demoCount = projectsData.filter((p) => p.demoHref).length
  const repoCount = projectsData.filter((p) => p.href).length

  return (
    <div className="proj-page">
      <section className="proj-hero">
        <div className="proj-seal" aria-hidden="true">
          <LionMarkTrad size={248} animate />
        </div>
        <p className="proj-kicker">EVIDENCE WALL · 2021 — 2026</p>
        <h1 className="proj-h1">作品与服务交付</h1>
        <p className="proj-lede">
          每个项目只写三件事：解决什么问题、我负责哪一段、最后能验证到什么。入口和源码都挂在卡片上，点得开、核得了。
        </p>
        <ul className="proj-stats">
          <li>
            <strong>{projectsData.length}</strong>
            <span>个项目</span>
          </li>
          <li>
            <strong>{demoCount}</strong>
            <span>个演示入口</span>
          </li>
          <li>
            <strong>{repoCount}</strong>
            <span>个开源仓库</span>
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
