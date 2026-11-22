import Link from '@/components/Link'
import projectsData from '@/data/projectsData'

export default function FeaturedProjects() {
  const featured = projectsData.slice(0, 2)

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {featured.map((project) => {
        const live = Boolean(project.demoHref)
        return (
          <article
            key={project.title}
            className="relative overflow-hidden rounded-xl border border-[var(--home-border)] bg-[var(--home-card)] p-6 transition-colors duration-200 hover:border-[var(--home-accent)]"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl font-bold tracking-tight text-[var(--home-strong)]">
                {project.title}
              </h3>
              {live ? (
                <span className="live-ring live-badge shrink-0 rounded-full px-2.5 py-1 font-mono text-[10px] tracking-wider">
                  LIVE
                </span>
              ) : (
                <span className="shrink-0 rounded-full border border-[var(--home-border)] px-2.5 py-1 font-mono text-[10px] tracking-wider text-[var(--home-subtle)]">
                  SOON
                </span>
              )}
            </div>

            {project.highlight && (
              <p className="mt-3 text-sm leading-6 text-[var(--home-accent)]/90">
                {project.highlight}
              </p>
            )}
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--home-subtle)]">
              {project.description}
            </p>

            {project.stack && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {project.stack.map((item) => (
                  <span
                    key={item}
                    className="rounded border border-[var(--home-border)] px-2 py-0.5 font-mono text-[10px] text-[var(--home-muted)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-5 flex items-center gap-4 text-xs font-medium">
              {project.demoHref && (
                <Link
                  href={project.demoHref}
                  className="tap-inline hover:text-accent-300 text-[var(--home-accent)]"
                  aria-label={`${project.title}：在线体验`}
                >
                  在线体验 →
                </Link>
              )}
              {project.href && (
                <Link
                  href={project.href}
                  className="tap-inline text-[var(--home-muted)] hover:text-[var(--home-text)]"
                  aria-label={`${project.title}：源码仓库`}
                >
                  源码 ↗
                </Link>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}
