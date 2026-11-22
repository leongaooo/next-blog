'use client'

/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- 横向滚动容器需要键盘焦点 */
import { useEffect, useRef, useState } from 'react'

const TableWrapper = ({ children }) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollable, setScrollable] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const update = () => setScrollable(el.scrollWidth > el.clientWidth + 1)
    update()
    const resizeObserver = new ResizeObserver(update)
    resizeObserver.observe(el)
    return () => resizeObserver.disconnect()
  }, [])

  return (
    <div className="table-scroll">
      {/* 横向滚动区域必须可聚焦，键盘才能用方向键滚动；这是 WCAG 的滚动容器例外 */}
      <div
        ref={scrollRef}
        className="table-scroll-body w-full overflow-x-auto"
        role="region"
        aria-label="表格内容，可横向滚动"
        tabIndex={0}
      >
        <table>{children}</table>
      </div>
      {scrollable ? <p className="table-scroll-hint">左右滑动查看完整表格</p> : null}
    </div>
  )
}

export default TableWrapper
