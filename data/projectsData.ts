export interface Project {
  title: string
  description: string
  href?: string
  demoHref?: string
  imgSrc?: string
  stack?: string[]
  highlight?: string
  year?: string
  caseHref?: string
}

const projectsData: Project[] = [
  {
    title: 'SvgToThreeModel',
    description: `SVG to 2.5D Converter 是一个基于 Vue 3 和 Three.js 的工具，能够将 SVG 平面图转换为具有高度的 2.5D 墙体模型，并保留原始文本元素。该项目特别适用于建筑平面图的可视化展示。`,
    imgSrc: '/static/images/svg-converter.png',
    href: 'https://github.com/leongaooo/SvgToThreeModel',
    stack: ['Vue 3', 'Three.js'],
    highlight: 'SVG 转 2.5D 拉伸模型，Three.js 参数化生成。',
    // Demo 待部署，暂不挂未验证地址。
  },
  {
    title: 'obscura-ocr',
    description: `PaddleOCR 工作台，自托管部署、口令制访问。演示入口与当日口令请加微信 Mintopia_ 获取。`,
    demoHref: '/demo',
    href: 'https://github.com/leongaooo/obscura-ocr',
    stack: ['PaddleOCR', 'systemd', 'HTTP API'],
    highlight: '把 OCR 能力做成可控、可交付的在线工作台。',
    caseHref: '/blog/agent-delivered-gate-service',
  },
  {
    title: 'cesium-kit',
    description: `cesium-kit 是一个开源的 Cesium 组件工具库，基于 TypeScript 开发，提供一系列即插即用的函数与工具，帮助开发者在 Cesium 场景中快速绘制、标注和交互。`,
    imgSrc: '/static/images/cesium-kit.png',
    href: 'https://github.com/leongaooo/cesium-kit',
    stack: ['TypeScript', 'Cesium'],
    highlight: 'Cesium 能力封装，已发 npm。',
  },
  {
    title: 'ai-graph',
    description: `面向 AI/团队的前端动效方法论与素材。`,
    href: 'https://github.com/leongaooo/ai-graph',
    stack: ['JavaScript'],
    highlight: '把 AI 场景里的视觉表达沉淀为可复用的前端素材。',
  },
  {
    title: 'LexiLoop（词回环）',
    description: `取自 Lexis (词汇) + Loop (循环)，寓意为一个循环记忆的文字练习伴侣。技术栈：Electron + React + TypeScript + Vite。主要功能目标：极简、专注文本轮播记忆工具，可记忆单词、句子、短语或语料。`,
    href: 'https://github.com/leongaooo/LexiLoop',
    stack: ['Electron', 'React', 'TypeScript', 'Vite'],
    highlight: '循环记忆的文字练习伴侣。',
  },
  {
    title: 'mind-pilot',
    description: ` MindPilot 🌟，全新一代AI驱动的任务清单与成长辅助系统，重新定义你的每一天！`,
    imgSrc: '/static/images/mind-pilot.png',
    href: 'https://github.com/Amzing-Ai/mind-pilot',
    highlight: 'AI 驱动的任务清单与成长辅助系统。',
  },
]

export default projectsData
