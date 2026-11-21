import Link from '@/components/Link'
import { genPageMetadata } from 'app/seo'
import WeChatCopy from '@/components/WeChatCopy'
import siteMetadata from '@/data/siteMetadata'

export const metadata = genPageMetadata({ title: '在线演示' })

const demos = [
  {
    title: 'obscura-ocr',
    description: 'PaddleOCR 工作台：上传图片，查看 OCR 识别出的文字与结构化结果。',
    instruction: '加微信获取当日口令，进入工作台后上传一张图片开始识别。',
    status: '可申请入口',
  },
  {
    title: 'SvgToThreeModel',
    description: 'Three.js 2.5D 建模：把 SVG 平面图转换成可旋转、可调整的空间模型。',
    instruction: '展台正在准备，在线入口开放后会在这里更新。',
    status: '即将开放',
  },
]

export default function DemoPage() {
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-3 pt-6 pb-8 md:space-y-5">
        <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
          在线演示
        </h1>
        <p className="max-w-2xl text-lg leading-7 text-gray-500 dark:text-gray-400">
          这里的服务跑在我自己运维的一台云主机上，按需开放口令，单次有效一小时。
        </p>
      </div>

      <div className="py-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {demos.map((demo) => (
            <article
              key={demo.title}
              className="flex h-full flex-col rounded-md border-2 border-gray-200/60 p-6 dark:border-gray-700/60"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <h2 className="text-2xl leading-8 font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  {demo.title}
                </h2>
                <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  {demo.status}
                </span>
              </div>
              <p className="prose mb-3 max-w-none text-gray-500 dark:text-gray-400">
                {demo.description}
              </p>
              <p className="mt-auto pt-4 text-sm leading-6 text-gray-500 dark:text-gray-400">
                {demo.instruction}
              </p>
            </article>
          ))}
        </div>

        <div className="border-primary-200 bg-primary-50 dark:border-primary-900 dark:bg-primary-950/40 mt-10 rounded-lg border p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">怎么拿到入口</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-600 dark:text-gray-300">
            口令按需生成、单次有效一小时，不公开挂在网上。加我微信说明要试哪个演示，我把入口和当日口令发你。
          </p>
          <div className="mt-5">
            <WeChatCopy withHint />
          </div>
          <Link
            href={`mailto:${siteMetadata.email}`}
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 mt-4 inline-block text-sm font-medium"
          >
            也可以发邮件给我 ↗
          </Link>
        </div>
      </div>
    </div>
  )
}
