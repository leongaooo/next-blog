'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { lionTradPaths, lionTradTransform } from '@/data/lionTradPaths'

type Props = {
  size?: number
  className?: string
  /** 演示用：覆盖墨色，不传则跟随主题 token */
  ink?: string
  /** 是否播放一次落墨显影（首次挂载 + 每次主题切换） */
  animate?: boolean
}

/**
 * 传统狮纹标记。
 * 静态层永远完整可见；动效层只在显影过程中存在，播完即隐藏。
 * 颜色走 CSS 变量 --lion-ink / --lion-glow，主题切换时不需要重建 SVG。
 */
export default function LionMarkTrad({ size = 96, className = '', ink, animate = false }: Props) {
  const { resolvedTheme } = useTheme()
  const [play, setPlay] = useState(0)
  const svgRef = useRef<SVGSVGElement | null>(null)

  // 首次挂载与每次主题变化都播一次
  useEffect(() => {
    if (!animate) return
    setPlay((n) => n + 1)
  }, [resolvedTheme, animate])

  // 靠移除再添加 class 重启动画，不重建 DOM
  useEffect(() => {
    const el = svgRef.current
    if (!el || play === 0) return
    el.classList.remove('lion-play')
    void el.getBoundingClientRect()
    el.classList.add('lion-play')
  }, [play])

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="0 0 1013 1013"
      aria-hidden="true"
      focusable="false"
      className={`lion-trad ${className}`}
      style={ink ? { color: ink, display: 'block' } : { display: 'block' }}
      shapeRendering="geometricPrecision"
    >
      <g className={animate ? 'lion-ink' : undefined}>
        <g transform={lionTradTransform} fill="currentColor" stroke="none">
          {lionTradPaths.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      </g>
      {animate && <></>}
    </svg>
  )
}
