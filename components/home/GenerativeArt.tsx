'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { scenes, type Scene, type SceneBlock } from '@/data/sceneSpecs'

const K = 46
const COS = 0.866

/** 等距投影：网格坐标 → SVG 坐标 */
function project(x: number, y: number, z: number, ox: number, oy: number) {
  return {
    x: ox + (x - y) * COS * K,
    y: oy + (x + y) * 0.5 * K - z * K,
  }
}

function facePath(points: Array<{ x: number; y: number }>) {
  return points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
}

function Block({
  block,
  scene,
  ox,
  oy,
}: {
  block: SceneBlock
  scene: Scene
  ox: number
  oy: number
}) {
  const { x, y, w, d, h, tone } = block
  const p = scene.palette
  const colors =
    tone === 'accent'
      ? { top: p.accentTop, left: p.accentLeft, right: p.accentRight }
      : tone === 'muted'
        ? { top: p.mutedTop, left: p.mutedLeft, right: p.mutedRight }
        : { top: p.blockTop, left: p.blockLeft, right: p.blockRight }

  const topFace = [
    project(x, y, h, ox, oy),
    project(x + w, y, h, ox, oy),
    project(x + w, y + d, h, ox, oy),
    project(x, y + d, h, ox, oy),
  ]
  const leftFace = [
    project(x + w, y, h, ox, oy),
    project(x + w, y + d, h, ox, oy),
    project(x + w, y + d, 0, ox, oy),
    project(x + w, y, 0, ox, oy),
  ]
  const rightFace = [
    project(x, y + d, h, ox, oy),
    project(x + w, y + d, h, ox, oy),
    project(x + w, y + d, 0, ox, oy),
    project(x, y + d, 0, ox, oy),
  ]

  return (
    <g>
      <polygon points={facePath(leftFace)} fill={colors.left} stroke={p.line} strokeWidth={0.6} />
      <polygon points={facePath(rightFace)} fill={colors.right} stroke={p.line} strokeWidth={0.6} />
      <polygon points={facePath(topFace)} fill={colors.top} stroke={p.line} strokeWidth={0.7} />
    </g>
  )
}

export default function GenerativeArt() {
  const [index, setIndex] = useState(0)
  const [ready, setReady] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const scene = scenes[index]

  useEffect(() => {
    // 首屏随机一版，避免每次刷新都一模一样；SSR 固定用第 0 版保证一致
    setIndex(Math.floor(Math.random() * 2))
    setReady(true)
  }, [])

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const node = wrapRef.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(max-width: 767px)').matches) return
    const rect = node.getBoundingClientRect()
    const px = ((event.clientX - rect.left) / rect.width - 0.5) * 18
    const py = ((event.clientY - rect.top) / rect.height - 0.5) * 14
    node.style.setProperty('--art-px', `${px.toFixed(1)}px`)
    node.style.setProperty('--art-py', `${py.toFixed(1)}px`)
  }, [])

  const resetPointer = useCallback(() => {
    const node = wrapRef.current
    if (!node) return
    node.style.setProperty('--art-px', '0px')
    node.style.setProperty('--art-py', '0px')
  }, [])

  const ox = 280
  const oy = 168

  return (
    <div
      ref={wrapRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      className="bg-ink-950/60 relative h-[210px] w-full overflow-hidden rounded-2xl border border-white/10 md:h-[480px]"
      style={{ ['--art-px' as string]: '0px', ['--art-py' as string]: '0px' }}
    >
      <div className="hero-grid absolute inset-0 opacity-50" aria-hidden="true" />

      {/* 视口四角刻度，让它更像一个正在渲染的取景框 */}
      <div className="pointer-events-none absolute inset-4" aria-hidden="true">
        {[
          'top-0 left-0 border-t border-l',
          'top-0 right-0 border-t border-r',
          'bottom-0 left-0 border-b border-l',
          'bottom-0 right-0 border-b border-r',
        ].map((pos) => (
          <span key={pos} className={`border-accent-500/40 absolute h-4 w-4 ${pos}`} />
        ))}
      </div>

      <svg
        viewBox="0 0 560 480"
        className="absolute inset-0 h-full w-full scale-[1.08]"
        role="img"
        aria-label={`示意插画：等距视角的 2.5D 体块场景（${scene.name}）`}
      >
        <g
          className="art-layer"
          style={{
            transform: 'translate3d(calc(var(--art-px) * 0.6), calc(var(--art-py) * 0.6), 0)',
          }}
        >
          {Array.from({ length: 11 }).map((_, i) => {
            const a = project(i, 0, 0, ox, oy)
            const b = project(i, 10, 0, ox, oy)
            const c = project(0, i, 0, ox, oy)
            const d = project(10, i, 0, ox, oy)
            return (
              <g key={`grid-${i}`} stroke="rgba(154,164,178,0.16)" strokeWidth={0.8}>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
                <line x1={c.x} y1={c.y} x2={d.x} y2={d.y} />
              </g>
            )
          })}
        </g>

        <g
          className="art-layer"
          style={{
            transform: 'translate3d(calc(var(--art-px) * 1.2), calc(var(--art-py) * 1.2), 0)',
          }}
        >
          {scene.blocks
            .slice()
            .sort((m, n) => m.x + m.y - (n.x + n.y))
            .map((block, i) => (
              <Block key={i} block={block} scene={scene} ox={ox} oy={oy} />
            ))}
        </g>

        <g
          className="art-layer"
          style={{
            transform: 'translate3d(calc(var(--art-px) * 2), calc(var(--art-py) * 2), 0)',
          }}
        >
          {scene.scans.map((pos, i) => (
            <rect
              key={`scan-${i}`}
              x={40}
              y={80 + pos * 320}
              width={480}
              height={1.4}
              fill={scene.palette.scan}
            />
          ))}
          {scene.blocks.slice(0, 5).map((block, i) => {
            const p = project(block.x + block.w / 2, block.y + block.d / 2, block.h, ox, oy)
            return (
              <circle
                key={`dot-${i}`}
                cx={p.x}
                cy={p.y - 6}
                r={i % 2 === 0 ? 2.2 : 1.4}
                fill={scene.palette.line}
              />
            )
          })}
        </g>
      </svg>

      <div className="absolute top-3 right-3 flex items-center gap-2">
        <span className="text-mist-400 text-[11px] tracking-wide">
          示意动画 · 场景 {scene.name}
        </span>
        <button
          type="button"
          onClick={() => setIndex((prev) => (prev + 1) % scenes.length)}
          className="text-mist-300 hover:border-accent-500 hover:text-accent-400 rounded-full border border-white/15 px-3 py-1 text-[11px] font-medium transition-colors"
          aria-label="切换插画场景"
        >
          {ready ? '换一版' : '换一版'}
        </button>
      </div>
    </div>
  )
}
