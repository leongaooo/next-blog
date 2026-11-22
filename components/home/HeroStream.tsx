'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from '@/components/Link'

type StreamLine = {
  kind: 'cmd' | 'out' | 'done'
  text: string
  meta?: string
}

const LINES: StreamLine[] = [
  { kind: 'cmd', text: 'svg2three --input floorplan.svg' },
  { kind: 'out', text: 'parse   paths=2431', meta: '41ms' },
  { kind: 'out', text: 'extrude depth=42  walls=118', meta: '182ms' },
  { kind: 'out', text: 'render  60fps  tris=312k' },
  { kind: 'done', text: 'ready  → 可交互，拖拽旋转试试' },
]

const TOTAL_CHARS = LINES.reduce((sum, line) => sum + line.text.length, 0)

export default function HeroStream() {
  const [typed, setTyped] = useState(TOTAL_CHARS)
  const reduced = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  useEffect(() => {
    if (reduced) return
    setTyped(0)
    const step = window.matchMedia('(max-width: 767px)').matches ? 3 : 2
    const timer = window.setInterval(() => {
      setTyped((prev) => {
        if (prev >= TOTAL_CHARS) {
          window.clearInterval(timer)
          return prev
        }
        return Math.min(TOTAL_CHARS, prev + step)
      })
    }, 38)
    return () => window.clearInterval(timer)
  }, [reduced])

  let cursor = 0

  return (
    <div className="relative">
      <p className="font-mono text-[11px] tracking-[0.22em] text-[var(--home-accent)] uppercase">
        AI Native · Design Engineer
      </p>

      <h1 className="mt-4 text-[1.7rem] leading-[1.16] font-extrabold tracking-tight text-[var(--home-strong)] sm:text-5xl sm:leading-[1.08] md:text-[clamp(2.7rem,4.1vw,3.9rem)]">
        把设计意图，
        <br />
        <span>
          直接变成
          <br className="hidden xl:inline" />
          <span className="text-[var(--home-accent)]">能跑的东西</span>。
        </span>
      </h1>

      <p className="mt-5 max-w-xl text-base leading-7 text-[var(--home-muted)]">
        前端体验、3D 交互、AI 编排、自运维交付 —— 从画出来到跑起来，一个人闭环。
      </p>

      <div className="bg-ink-950/80 mt-7 overflow-hidden rounded-xl border border-white/10 shadow-[0_0_0_1px_rgba(91,225,201,0.06)]">
        <div className="flex items-center gap-2 border-b border-white/8 px-4 py-2">
          <span className="bg-accent-500/70 h-2 w-2 rounded-full" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-white/10" />
          <span className="text-mist-500 ml-2 font-mono text-[11px]">delivery.log</span>
        </div>
        <div className="px-4 py-3 font-mono text-[12.5px] leading-6">
          {LINES.map((line, index) => {
            const start = cursor
            cursor += line.text.length
            const shown = Math.max(0, Math.min(line.text.length, typed - start))
            if (shown <= 0 && line.kind === 'cmd' && index > 0) return null
            const visible = line.text.slice(0, shown)
            const complete = shown >= line.text.length
            return (
              <div key={index} className="flex items-baseline gap-2">
                {line.kind === 'cmd' ? (
                  <span className="text-accent-500">$</span>
                ) : (
                  <span className="text-mist-600">›</span>
                )}
                <span
                  className={
                    line.kind === 'done'
                      ? 'text-accent-400'
                      : line.kind === 'cmd'
                        ? 'text-mist-200'
                        : 'text-mist-400'
                  }
                >
                  {visible}
                  {!complete && <span className="stream-caret ml-0.5" aria-hidden="true" />}
                </span>
                {complete && line.meta && (
                  <span className="text-mist-600 ml-auto font-mono text-[11px] tabular-nums">
                    {line.meta}
                  </span>
                )}
              </div>
            )
          })}
        </div>
        <div className="border-t border-white/5 px-4 py-2">
          <p className="text-mist-600 text-[11px]">示意动画 · 数据取自一次真实的构建与交付记录</p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          href="/projects"
          className="hero-cta rounded-full bg-[var(--cta-bg)] px-6 py-2.5 text-sm font-semibold text-[var(--cta-fg)] transition-transform hover:-translate-y-0.5"
        >
          进入作品墙 →
        </Link>
        <Link
          href="/demo"
          className="hero-cta rounded-full border border-[var(--home-border)] px-6 py-2.5 text-sm font-medium text-[var(--home-text)] transition-colors hover:border-[var(--home-accent)] hover:text-[var(--home-accent)]"
        >
          看在线 Demo
        </Link>
      </div>
    </div>
  )
}
