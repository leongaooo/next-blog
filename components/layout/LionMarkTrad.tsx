'use client'

import { useEffect, useId, useRef, useState } from 'react'
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
  const uid = useId().replace(/[:]/g, '')
  const bandId = `lion-band-${uid}`
  const bandMaskId = `lion-band-mask-${uid}`
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
      {animate && (
        <defs>
          <linearGradient id={bandId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.32" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="0.52" stopColor="#fff" stopOpacity="1" />
            <stop offset="0.72" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask
            id={bandMaskId}
            maskUnits="userSpaceOnUse"
            x="-200"
            y="-200"
            width="1413"
            height="1413"
          >
            <rect
              className="lion-band"
              x="-520"
              y="0"
              width="520"
              height="1013"
              fill={`url(#${bandId})`}
            />
          </mask>
        </defs>
      )}
      <g className={animate ? 'lion-ink' : undefined}>
        <g transform={lionTradTransform} fill="currentColor" stroke="none">
          {lionTradPaths.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      </g>
      {animate && (
        <g className="lion-lit" mask={`url(#${bandMaskId})`}>
          <g transform={lionTradTransform} fill="currentColor" stroke="none">
            {lionTradPaths.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
        </g>
      )}
    </svg>
  )
}
