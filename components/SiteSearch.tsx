'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Doc {
  title: string
  summary?: string
  tags?: string[]
  date?: string
  type?: string
  path?: string
  note?: string
}

// 每个固定页给一句不同的说明，避免六行都是「页面」这种噪声
const STATIC_PAGES: Doc[] = [
  { title: '作品与服务交付', path: 'projects', note: '证据墙：问题 / 我负责的部分 / 可验证结果' },
  {
    title: 'ai-graph 成果页',
    path: 'projects/ai-graph',
    note: '一份 Brief + seed 可复现的 SVG 场景',
    summary: '把文案画成可复现的 SVG 场景：seed、门禁与复现命令。',
  },
  { title: '在线演示 · 口令入口', path: 'demo', note: '自托管工作台，口令按需发放' },
  { title: '关于高立民', path: 'about', note: '在做什么、怎么做、怎么联系' },
  { title: '文章列表', path: 'blog', note: '按时间倒序的全部文章' },
  { title: '标签索引', path: 'tags', note: '按主题找到对应的文章' },
]

const MAX_RESULTS = 8

const resultsFor = (docs: Doc[], query: string) => {
  const q = query.trim().toLowerCase()
  if (!q) return { items: docs.slice(0, 6), total: 0 }
  const matched = docs.filter((doc) =>
    [doc.title, doc.summary, doc.note, (doc.tags ?? []).join(' ')]
      .join(' ')
      .toLowerCase()
      .includes(q)
  )
  return { items: matched.slice(0, MAX_RESULTS), total: matched.length }
}

export default function SiteSearch({ variant = 'icon' }: { variant?: 'icon' | 'inline' } = {}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  // 固定页面直接可搜，不等索引；文章索引另行加载
  const [docs, setDocs] = useState<Doc[]>(STATIC_PAGES)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  // 服务端不知道用户平台；先按非 Mac 渲染，挂载后再按真实平台换成 ⌘K，避免 hydration 不一致。
  const [isMac, setIsMac] = useState(false)
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const restoreRef = useRef<Element | null>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const loadedRef = useRef(false)

  useEffect(() => {
    const platform = navigator.platform || navigator.userAgent
    setIsMac(/Mac|iPhone|iPad|iPod/i.test(platform))
  }, [])

  const load = useCallback(async () => {
    if (loadedRef.current) return
    setStatus('loading')
    try {
      const res = await fetch('/search.json')
      if (!res.ok) throw new Error(`search index ${res.status}`)
      const data = (await res.json()) as Doc[]
      setDocs([...STATIC_PAGES, ...data.filter((doc) => doc.path)])
      loadedRef.current = true
      setStatus('ready')
    } catch {
      setDocs(STATIC_PAGES)
      setStatus('error')
    }
  }, [])

  const retry = useCallback(() => {
    loadedRef.current = false
    setStatus('idle')
    void load()
  }, [load])

  const toggle = useCallback(() => {
    setOpen((prev) => {
      if (!prev) void load()
      return !prev
    })
  }, [load])

  useEffect(() => {
    const onKey = (event: KeyboardEvent & { __searchSeen?: boolean }) => {
      // 中文输入法组词时，Esc 先用于取消候选词，不能被页面当成关闭搜索。
      if (event.isComposing || event.keyCode === 229) return
      // 404 这类页面同时有页头和正文两个搜索实例，同一个快捷键只能响应一次
      if (event.__searchSeen) return
      event.__searchSeen = true
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        toggle()
      }
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle])

  useEffect(() => {
    if (open) {
      restoreRef.current = document.activeElement
      setQuery('')
      setActive(0)
      const timer = window.setTimeout(() => inputRef.current?.focus(), 60)
      document.body.style.overflow = 'hidden'
      return () => {
        window.clearTimeout(timer)
        document.body.style.overflow = ''
      }
    }
    const restoreTo = restoreRef.current
    document.body.style.overflow = ''
    if (restoreTo instanceof HTMLElement && restoreTo.isConnected) restoreTo.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const panel = dialogRef.current?.querySelector('.search-panel')
      if (!panel) return
      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button, input, [href], [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute('disabled') && el.getClientRects().length > 0)
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const current = document.activeElement
      if (event.shiftKey) {
        if (current === first || !panel.contains(current)) {
          event.preventDefault()
          last.focus()
        }
      } else if (current === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onTab)
    return () => window.removeEventListener('keydown', onTab)
  }, [open])

  const { items: results, total } = useMemo(() => resultsFor(docs, query), [docs, query])
  const shortcutLabel = isMac ? '⌘K' : 'Ctrl K'

  // 键盘翻到列表下方的条目时，把它滚进可视区，不然高亮会落在看不见的地方
  useEffect(() => {
    if (!open) return
    const item = listRef.current?.children[active] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  const go = (doc?: Doc) => {
    if (!doc?.path) return
    setOpen(false)
    router.push(`/${doc.path}`)
  }

  const goIndex = (path: string) => {
    setOpen(false)
    router.push(path)
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={variant === 'icon' ? '搜索站内内容' : undefined}
        aria-keyshortcuts={isMac ? 'Meta+K' : 'Control+K'}
        onClick={toggle}
        className={
          variant === 'inline'
            ? 'site-search-trigger site-search-trigger--inline'
            : 'site-search-trigger'
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        {variant === 'inline' && <span>搜索站内文章</span>}
      </button>

      {open && (
        <div
          ref={dialogRef}
          className="search-root"
          role="dialog"
          aria-modal="true"
          aria-label="站内搜索"
        >
          <button
            type="button"
            className="search-backdrop"
            aria-label="关闭搜索"
            onClick={() => setOpen(false)}
          />
          <div className="search-panel">
            <div className="search-input-row">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                className="search-icon"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.6-3.6" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                className="search-input"
                placeholder="搜索文章、标签、项目…"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setActive(0)
                }}
                onKeyDown={(event) => {
                  // 中文输入法还在选词时，方向键和回车先交给输入法，不要当成翻列表
                  if (event.nativeEvent.isComposing) return
                  if (event.key === 'ArrowDown') {
                    event.preventDefault()
                    setActive((prev) => Math.min(prev + 1, results.length - 1))
                  }
                  if (event.key === 'ArrowUp') {
                    event.preventDefault()
                    setActive((prev) => Math.max(prev - 1, 0))
                  }
                  if (event.key === 'Enter') go(results[active])
                }}
              />
              <span className="search-kbd">ESC</span>
              <button
                type="button"
                className="search-close"
                aria-label="关闭搜索"
                onClick={() => setOpen(false)}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                >
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <p className="sr-only" role="status" aria-live="polite">
              {query.trim()
                ? `搜索「${query.trim()}」得到 ${total} 条结果`
                : `${results.length} 条建议`}
            </p>

            <div className="search-list">
              {status === 'loading' ? <p className="search-note">正在载入文章索引…</p> : null}
              {status === 'error' ? (
                <p className="search-note">
                  文章索引没加载出来，现在只能搜到固定页面。
                  <button type="button" className="search-note-btn" onClick={retry}>
                    重试
                  </button>
                </p>
              ) : null}
              {results.length === 0 && status !== 'loading' ? (
                <div className="search-empty">
                  <p>
                    {status === 'error'
                      ? '固定页面里没有匹配。索引恢复后可以再试一次。'
                      : '没有匹配的内容。换个词，或者按时间、按主题翻。'}
                  </p>
                  <div className="search-empty-acts">
                    <button
                      type="button"
                      className="search-note-btn"
                      onClick={() => goIndex('/blog')}
                    >
                      去文章列表 →
                    </button>
                    <button
                      type="button"
                      className="search-note-btn"
                      onClick={() => goIndex('/tags')}
                    >
                      按标签找 →
                    </button>
                  </div>
                </div>
              ) : (
                <ul ref={listRef}>
                  {results.map((doc, index) => (
                    <li key={doc.path}>
                      <button
                        type="button"
                        className={index === active ? 'search-item search-item-on' : 'search-item'}
                        onMouseEnter={() => setActive(index)}
                        onClick={() => go(doc)}
                      >
                        <span className="search-item-title">{doc.title}</span>
                        {doc.note ? (
                          <span className="search-item-note">{doc.note}</span>
                        ) : (
                          <span className="search-item-meta">
                            {(doc.tags ?? []).slice(0, 3).join(' · ')}
                            {doc.date ? (
                              <>
                                {' · '}
                                <span className="search-item-date">{doc.date.slice(0, 10)}</span>
                              </>
                            ) : null}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div
              className={['search-foot', total > results.length ? 'search-foot--count' : '']
                .filter(Boolean)
                .join(' ')}
            >
              {total > results.length ? (
                <span className="search-foot-count">
                  共 {total} 条 · 只列前 {results.length}
                </span>
              ) : null}
              <span className="search-foot-hints">
                {results.length > 1 ? <span>↑↓ 选择</span> : null}
                {results.length > 0 ? <span>↵ 打开</span> : <span>Esc 关闭</span>}
                <span>{shortcutLabel} 开关</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
