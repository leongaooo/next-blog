/**
 * 首页生成式插画的场景定义。
 *
 * 思路沿用 ai-graph 的 SceneSpec：先声明数据（色板 + 等距体块 + 扫描线），
 * 再由组件渲染为分层 SVG，而不是直接给一张位图。
 * 这里不放任何 API 调用，全部是常量，保证零网络请求、可复现。
 */

export type SceneBlock = {
  /** 网格坐标，x 向右、y 向纵深 */
  x: number
  y: number
  /** 底面尺寸 */
  w: number
  d: number
  /** 高度 */
  h: number
  tone: 'base' | 'accent' | 'muted'
}

export type Scene = {
  id: string
  name: string
  palette: {
    blockTop: string
    blockLeft: string
    blockRight: string
    accentTop: string
    accentLeft: string
    accentRight: string
    mutedTop: string
    mutedLeft: string
    mutedRight: string
    line: string
    scan: string
  }
  blocks: SceneBlock[]
  /** 前景扫描线的纵向位置（0-1） */
  scans: number[]
}

const basePalette = {
  blockTop: '#35434f',
  blockLeft: '#232e38',
  blockRight: '#18212a',
  accentTop: '#5be1c9',
  accentLeft: '#2fc3aa',
  accentRight: '#1f9c88',
  mutedTop: '#3a4854',
  mutedLeft: '#28333d',
  mutedRight: '#1c2530',
  line: 'rgba(91,225,201,0.55)',
  scan: 'rgba(91,225,201,0.25)',
}

export const scenes: Scene[] = [
  {
    id: 'atlas',
    name: 'Atlas',
    palette: basePalette,
    blocks: [
      { x: 1, y: 5, w: 1.4, d: 1.4, h: 1.2, tone: 'muted' },
      { x: 3.2, y: 4.2, w: 2, d: 2, h: 2.4, tone: 'base' },
      { x: 3.6, y: 4.6, w: 1.2, d: 1.2, h: 3.1, tone: 'accent' },
      { x: 6, y: 3.2, w: 1.8, d: 1.8, h: 1.6, tone: 'base' },
      { x: 8.2, y: 2.4, w: 1.2, d: 1.2, h: 0.9, tone: 'muted' },
      { x: 2, y: 7.4, w: 2.4, d: 1.2, h: 0.7, tone: 'base' },
      { x: 5.4, y: 6.8, w: 1.4, d: 1.4, h: 1.9, tone: 'base' },
      { x: 7.2, y: 6, w: 1.6, d: 1.6, h: 1.1, tone: 'accent' },
      { x: 1.6, y: 2.2, w: 1, d: 1, h: 0.6, tone: 'muted' },
      { x: 9, y: 5, w: 0.9, d: 0.9, h: 0.5, tone: 'muted' },
    ],
    scans: [0.42, 0.68],
  },
  {
    id: 'foundry',
    name: 'Foundry',
    palette: {
      ...basePalette,
      accentTop: '#ffb86b',
      accentLeft: '#e09b52',
      accentRight: '#b87b3c',
      line: 'rgba(255,184,107,0.32)',
      scan: 'rgba(255,184,107,0.22)',
    },
    blocks: [
      { x: 2.4, y: 3.6, w: 2.6, d: 1.6, h: 1.4, tone: 'base' },
      { x: 3, y: 3.9, w: 1.4, d: 1, h: 2.6, tone: 'accent' },
      { x: 5.6, y: 2.8, w: 1.6, d: 1.6, h: 2, tone: 'base' },
      { x: 7.4, y: 2.2, w: 1.1, d: 1.1, h: 1, tone: 'muted' },
      { x: 1.4, y: 6.2, w: 1.8, d: 1.8, h: 0.8, tone: 'muted' },
      { x: 4.2, y: 6.4, w: 2.2, d: 1.4, h: 1.7, tone: 'base' },
      { x: 6.8, y: 5.6, w: 1.4, d: 1.4, h: 2.2, tone: 'base' },
      { x: 8.4, y: 5.2, w: 0.9, d: 0.9, h: 0.6, tone: 'muted' },
      { x: 4.8, y: 4.6, w: 0.8, d: 0.8, h: 3.2, tone: 'accent' },
    ],
    scans: [0.55],
  },
  {
    id: 'quiet',
    name: 'Quiet',
    palette: {
      ...basePalette,
      accentTop: '#bcc5d1',
      accentLeft: '#9aa4b2',
      accentRight: '#66707e',
      line: 'rgba(188,197,209,0.28)',
      scan: 'rgba(188,197,209,0.18)',
    },
    blocks: [
      { x: 3, y: 5, w: 3, d: 3, h: 1.6, tone: 'base' },
      { x: 4.2, y: 5.4, w: 1.6, d: 1.6, h: 2.8, tone: 'muted' },
      { x: 1.6, y: 3, w: 1.2, d: 1.2, h: 0.8, tone: 'muted' },
      { x: 6.6, y: 3.4, w: 1.4, d: 1.4, h: 1.1, tone: 'base' },
      { x: 7.6, y: 6.4, w: 1.8, d: 1.2, h: 0.9, tone: 'base' },
      { x: 2, y: 7.2, w: 1.4, d: 1.4, h: 0.7, tone: 'muted' },
      { x: 5.2, y: 7.6, w: 1, d: 1, h: 1.4, tone: 'accent' },
    ],
    scans: [0.36, 0.72],
  },
]
