import type { Project } from '@/data/projectsData'

type Props = {
  project: Project
  index: number
  featured?: boolean
  wide?: boolean
}

export default function ProjectCard({ project, index, featured = false, wide = false }: Props) {
  const no = String(index + 1).padStart(2, '0')

  return (
    <article
      className={[
        'proj-card',
        featured || wide ? 'proj-card--wide' : '',
        wide ? 'proj-card--wide--tail' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className={project.imgSrc ? 'proj-media proj-media--img' : 'proj-media'}
        style={
          project.imgSrc
            ? {
                backgroundImage: `url(${project.imgSrc})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        {project.imgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.imgSrc} alt="" loading="lazy" />
        ) : (
          <div className="proj-cover" aria-hidden="true">
            <span className="proj-cover-no" aria-hidden="true">
              {no}
            </span>
            <span className="proj-cover-word">{project.title}</span>
          </div>
        )}
      </div>

      <div className="proj-body">
        <div className="proj-meta">
          <span aria-hidden="true">{no}</span>
          {project.year && <span>{project.year}</span>}
        </div>

        <h2 className="proj-title">{project.title}</h2>

        {project.highlight && <p className="proj-highlight">{project.highlight}</p>}

        <p className="proj-desc">{project.description}</p>

        {project.stack && project.stack.length > 0 && (
          <ul className="proj-stack" aria-label="技术栈">
            {project.stack.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        )}

        <div className="proj-actions">
          {project.demoHref && (
            <a
              className="proj-link proj-link--primary"
              href={project.demoHref}
              aria-label={`${project.title}：在线体验`}
            >
              在线体验 <span aria-hidden="true">↗</span>
            </a>
          )}
          {project.href && (
            <a className="proj-link" href={project.href} aria-label={`${project.title}：源码仓库`}>
              源码 <span aria-hidden="true">↗</span>
            </a>
          )}
          {project.caseHref && (
            <a
              className="proj-link"
              href={project.caseHref}
              aria-label={`${project.title}：交付复盘`}
            >
              {project.caseLabel ?? '复盘'} <span aria-hidden="true">→</span>
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
