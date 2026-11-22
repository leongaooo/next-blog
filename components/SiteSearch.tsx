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
}

const STATIC_PAGES: Doc[] = [
  { title: '作品与服务交付', path: 'projects', tags: ['页面'] },
  { title: '在线演示 · 口令入口', path: 'demo', tags: ['页面'] },
  { title: '关于高立民', path: 'about', tags: ['页面'] },
  { title: '文章列表', path: 'blog', tags: ['页面'] },
  { title: '标签索引', path: 'tags', tags: ['页面'] },
]

const resultsFor = (docs: Doc[], query: string) => {
  const q = query.trim().toLowerCase()
  if (!q) return docs.slice(0, 6)
  return docs
    .filter((doc) =>
      [doc.title, doc.summary, (doc.tags ?? []).join(' ')].join(' ').toLowerCase().includes(q)
    )
    .slice(0, 8)
}

export default function SiteSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [docs, setDocs] = useState<Doc[]>([])
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    if (docs.length) return
    try {
      const res = await fetch('/search.json')
      const data = (await res.json()) as Doc[]
      setDocs([...STATIC_PAGES, ...data.filter((doc) => doc.path)])
    } catch {
      setDocs([])
    }
  }, [docs.length])

  const toggle = useCallback(() => {
    setOpen((prev) => {
      if (!prev) void load()
      return !prev
    })
  }, [load])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
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
      setQuery('')
      setActive(0)
      const timer = window.setTimeout(() => inputRef.current?.focus(), 60)
      document.body.style.overflow = 'hidden'
      return () => {
        window.clearTimeout(timer)
        document.body.style.overflow = ''
      }
    }
    document.body.style.overflow = ''
  }, [open])

  const results = useMemo(() => resultsFor(docs, query), [docs, query])

  const go = (doc?: Doc) => {
    if (!doc?.path) return
    setOpen(false)
    router.push(`/${doc.path}`)
  }

  return (
    <>
      <button type="button" aria-label="搜索" onClick={toggle} className="site-search-trigger">
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
      </button>

      {open && (
        <div className="search-root" role="dialog" aria-modal="true" aria-label="站内搜索">
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
            </div>

            <div className="search-list">
              {results.length === 0 ? (
                <p className="search-empty">没有匹配的内容。换个词，或者去文章列表翻。</p>
              ) : (
                <ul>
                  {results.map((doc, index) => (
                    <li key={doc.path}>
                      <button
                        type="button"
                        className={index === active ? 'search-item search-item-on' : 'search-item'}
                        onMouseEnter={() => setActive(index)}
                        onClick={() => go(doc)}
                      >
                        <span className="search-item-title">{doc.title}</span>
                        <span className="search-item-meta">
                          {(doc.tags ?? []).slice(0, 3).join(' · ')}
                          {doc.date ? ` · ${doc.date.slice(0, 10)}` : ''}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="search-foot">
              <span>↑↓ 选择</span>
              <span>↵ 打开</span>
              <span>⌘K 开关</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
