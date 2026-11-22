'use client'
/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- 横向滚动的代码块需要键盘焦点 */

import { useCallback, useEffect, useRef, useState } from 'react'

type Props = { children?: React.ReactNode }

/**
 * 文章代码块：
 * - 复制按钮在桌面端仍随 hover 出现，触屏（hover:none）常驻且命中区 44px；
 * - 代码横向溢出时右侧给一层渐隐，滑到底后自动消失，避免"看起来像被截断"。
 */
export default function CodeBlock({ children }: Props) {
  const preRef = useRef<HTMLPreElement>(null)
  const [copyState, setCopyState] = useState<'idle' | 'ok' | 'fail'>('idle')
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
    if (copyState === 'idle') return
    const t = setTimeout(() => setCopyState('idle'), 1600)
    return () => clearTimeout(t)
  }, [copyState])

  const onCopy = async () => {
    const pre = preRef.current
    if (!pre) return
    try {
      await navigator.clipboard.writeText(pre.textContent ?? '')
      setCopyState('ok')
    } catch {
      setCopyState('fail')
    }
  }

  return (
    <div className="code-block">
      <div className="code-pre">
        <pre
          ref={preRef}
          onScroll={measure}
          tabIndex={overflow ? 0 : undefined}
          aria-label={overflow ? '代码块，可横向滚动查看完整内容' : undefined}
        >
          {children}
        </pre>
        {overflow && !atEnd ? <span className="code-fade" aria-hidden="true" /> : null}
      </div>
      <button
        type="button"
        className="code-copy"
        aria-label={
          copyState === 'ok'
            ? '代码已复制'
            : copyState === 'fail'
              ? '代码复制失败，可重试'
              : '复制这段代码'
        }
        onClick={onCopy}
      >
        {copyState === 'ok' ? '已复制 ✓' : copyState === 'fail' ? '复制失败' : '复制代码'}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {copyState === 'ok'
          ? '代码已复制到剪贴板'
          : copyState === 'fail'
            ? '代码复制失败，请手动选择复制'
            : ''}
      </span>
    </div>
  )
}
