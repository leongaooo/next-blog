'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type Props = { children?: React.ReactNode }

/**
 * 文章代码块：
 * - 复制按钮在桌面端仍随 hover 出现，触屏（hover:none）常驻且命中区 44px；
 * - 代码横向溢出时右侧给一层渐隐，滑到底后自动消失，避免"看起来像被截断"。
 */
export default function CodeBlock({ children }: Props) {
  const preRef = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)
  const [overflow, setOverflow] = useState(false)
  const [atEnd, setAtEnd] = useState(true)

  const measure = useCallback(() => {
    const pre = preRef.current
    if (!pre) return
    const has = pre.scrollWidth > pre.clientWidth + 2
    setOverflow(has)
    setAtEnd(!has || pre.scrollLeft + pre.clientWidth >= pre.scrollWidth - 2)
  }, [])

  useEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure])

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1600)
    return () => clearTimeout(t)
  }, [copied])

  const onCopy = async () => {
    const pre = preRef.current
    if (!pre) return
    try {
      await navigator.clipboard.writeText(pre.textContent ?? '')
      setCopied(true)
    } catch {
      /* 复制失败时保持按钮原样，不做假成功提示 */
    }
  }

  return (
    <div className="code-block">
      <div className="code-pre">
        <pre ref={preRef} onScroll={measure}>
          {children}
        </pre>
        {overflow && !atEnd ? <span className="code-fade" aria-hidden="true" /> : null}
      </div>
      <button type="button" className="code-copy" aria-label="复制这段代码" onClick={onCopy}>
        {copied ? '已复制 ✓' : '复制代码'}
      </button>
    </div>
  )
}
