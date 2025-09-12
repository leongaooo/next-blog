![tailwind-nextjs-banner](/public/static/images/twitter-card.png)

# 我的个人博客

这个博客基于 [Next.js](https://nextjs.org/) 和 [Tailwind CSS](https://tailwindcss.com/) 构建。使用 Next App 目录和 [React Server Component](https://nextjs.org/docs/getting-started/react-essentials#server-components)，并借助 [Contentlayer](https://www.contentlayer.dev/) 管理 Markdown 内容。

## 技术架构

### 核心技术栈

- Next.js with Typescript
- [Contentlayer](https://www.contentlayer.dev/) 管理内容逻辑
- 支持使用 [Tailwind 3.0](https://tailwindcss.com/blog/tailwindcss-v3) 轻松自定义样式，可设置主色调
- [MDX](https://mdxjs.com/) - 支持在 Markdown 文档中编写 JSX

### 其他特性

- 接近完美的 Lighthouse 评分 - [Lighthouse 报告](https://www.webpagetest.org/result/230805_BiDcBQ_4H7)
- 轻量级，首次加载 JS 仅 85kB
- 响应式移动端视图
- 支持浅色和深色主题
- 使用 [next/font](https://nextjs.org/docs/app/api-reference/components/font) 进行字体优化
- 集成 [pliny](https://github.com/timlrx/pliny) 提供以下功能：
  - 多种分析选项，包括 [Umami](https://umami.is/)、[Plausible](https://plausible.io/)、[Simple Analytics](https://simpleanalytics.com/)、Posthog 和 Google Analytics
  - 通过 [Giscus](https://github.com/laymonage/giscus)、[Utterances](https://github.com/utterance/utterances) 或 Disqus 实现评论功能
  - 支持 Mailchimp、Buttondown、Convertkit、Klaviyo、Revue、Emailoctopus 和 Beehiiv 的新闻订阅 API 和组件
  - 使用 [Kbar](https://github.com/timc1/kbar) 或 Algolia 实现命令面板搜索
- 通过 [rehype-prism-plus](https://github.com/timlrx/rehype-prism-plus) 实现服务端语法高亮，支持行号和行高亮
- 通过 [KaTeX](https://katex.org/) 支持数学公式显示
- 通过 [rehype-citation](https://github.com/timlrx/rehype-citation) 支持引用和参考文献
- 通过 [remark-github-blockquote-alert](https://github.com/jaywcjlove/remark-github-blockquote-alert) 支持 [Github 提示框](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts)
- 通过 [next/image](https://nextjs.org/docs/basic-features/image-optimization) 实现自动图片优化
- 支持标签功能 - 每个唯一标签都会生成对应的页面
- 支持多作者
- 提供 3 种不同的博客布局
- 提供 2 种不同的博客列表布局
- 支持博客文章的嵌套路由
- 包含项目页面
- 预配置安全头部
- 支持 RSS 订阅、站点地图等 SEO 友好功能
