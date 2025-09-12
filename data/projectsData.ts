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
]

export default projectsData
