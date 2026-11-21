/**
 * 首页生成式插画的场景定义。
 *
 * 先声明数据（色板 + 等距体块 + 扫描线），再由 SVG fallback 和 Three.js 场景共同渲染。
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
  blockTop: '#3d4a56',
  blockLeft: '#2b3741',
  blockRight: '#202b34',
  accentTop: '#5be1c9',
  accentLeft: '#2fc3aa',
  accentRight: '#1f9c88',
  mutedTop: '#465560',
  mutedLeft: '#303e49',
  mutedRight: '#25323b',
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
      { x: 0.6, y: 7.8, w: 0.9, d: 0.9, h: 0.45, tone: 'muted' },
      { x: 8.8, y: 7.4, w: 1.1, d: 1.1, h: 0.8, tone: 'base' },
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
      { x: 0.8, y: 4.4, w: 0.9, d: 0.9, h: 0.5, tone: 'muted' },
      { x: 8.8, y: 7.1, w: 1, d: 1, h: 0.7, tone: 'base' },
      { x: 6.1, y: 7.9, w: 0.8, d: 0.8, h: 0.9, tone: 'accent' },
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
      { x: 0.8, y: 5.2, w: 0.9, d: 0.9, h: 0.5, tone: 'muted' },
      { x: 7.8, y: 4.6, w: 1, d: 1, h: 0.8, tone: 'base' },
      { x: 8.7, y: 7.8, w: 0.8, d: 0.8, h: 0.6, tone: 'muted' },
      { x: 2.8, y: 1.6, w: 0.9, d: 0.9, h: 0.5, tone: 'base' },
      { x: 5.9, y: 2.1, w: 0.8, d: 0.8, h: 0.7, tone: 'accent' },
    ],
    scans: [0.36, 0.72],
  },
]
