interface Project {
  title: string
  description: string
  href?: string
  imgSrc?: string
}

const projectsData: Project[] = [
  {
    title: 'svg-converter',
    description: `SVG to 2.5D Converter 是一个基于 Vue 3 和 Three.js 的工具，能够将 SVG 平面图转换为具有高度的 2.5D 墙体模型，并保留原始文本元素。该项目特别适用于建筑平面图的可视化展示。`,
    imgSrc: '/static/images/svg-converter.png',
    href: 'https://github.com/leongaooo/SvgToThreeModel',
  },
  {
    title: 'mind-pilot',
    description: ` MindPilot 🌟，全新一代AI驱动的任务清单与成长辅助系统，重新定义你的每一天！`,
    imgSrc: '/static/images/mind-pilot.png',
    href: 'https://github.com/Amzing-Ai/mind-pilot',
  },
  {
    title: 'cesium-kit',
    description: `cesium-kit 是一个开源的 Cesium 组件工具库，基于 TypeScript 开发，提供一系列即插即用的函数与工具，帮助开发者在 Cesium 场景中快速绘制、标注和交互。`,
    imgSrc: '/static/images/cesium-kit.png',
    href: 'https://github.com/leongaooo/cesium-kit',
  },
]

export default projectsData
