import Link from '@/components/Link'

type Entry = {
  href: string
  label: string
  count: string
  detail: string
  accent?: boolean
}

export default function EntryGrid({ entries }: { entries: Entry[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {entries.map((entry) => (
        <Link
          key={entry.href}
          href={entry.href}
          className="group hover:border-accent-500/50 relative overflow-hidden rounded-xl border border-[var(--home-border)] bg-[var(--home-card)] p-6 transition-colors hover:bg-[var(--home-card-hover)]"
        >
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold text-[var(--home-text)]">{entry.label}</span>
            <span className="font-mono text-[11px] tracking-wide text-[var(--home-accent)]">
              {entry.count}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--home-subtle)]">{entry.detail}</p>
          <span className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-[var(--home-muted)] transition-colors group-hover:text-[var(--home-accent)]">
            查看 →
          </span>
        </Link>
      ))}
    </div>
  )
}
