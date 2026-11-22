import Link from '@/components/Link'
import { genPageMetadata } from 'app/seo'
import WeChatCopy from '@/components/WeChatCopy'
import siteMetadata from '@/data/siteMetadata'

export const metadata = genPageMetadata({ title: '在线演示' })

const demos = [
  {
    no: '01',
    title: 'obscura-ocr',
    description: 'PaddleOCR 工作台：上传图片，查看 OCR 识别出的文字与结构化结果。',
    instruction: '加微信获取当日口令，进入工作台后上传一张图片开始识别。',
    status: '开放中',
    live: true,
  },
  {
    no: '02',
    title: 'SvgToThreeModel',
    description: 'Three.js 2.5D 建模：把 SVG 平面图转换成可旋转、可调整的空间模型。',
    instruction: '展台正在准备，在线入口开放后会在这里更新。',
    status: '即将开放',
    live: false,
  },
]

const openDemos = demos.filter((demo) => demo.live)
const queuedDemos = demos.filter((demo) => !demo.live)

export default function DemoPage() {
  return (
    <div className="demo-page">
      <section className="demo-hero">
        <p className="proj-kicker">SELF-HOSTED · 1 HOUR PASS</p>
        <h1 className="proj-h1">在线演示</h1>
        <p className="proj-lede">
          服务跑在我自己运维的一台云主机上，按需开放口令，单次有效一小时。不是录屏，是真能上传、真能点。
        </p>
      </section>

      <section
        className={openDemos.length === 1 ? 'demo-grid demo-grid--single' : 'demo-grid'}
        aria-label="演示项目"
      >
        {openDemos.map((demo) => (
          <article key={demo.title} className="demo-card demo-card--open">
            <div className="demo-card-top">
              <span className="demo-no">{demo.no}</span>
              <span className={demo.live ? 'demo-status demo-status--live' : 'demo-status'}>
                {demo.status}
              </span>
            </div>
            <h2 className="demo-title">{demo.title}</h2>
            <p className="demo-desc">{demo.description}</p>
            <p className="demo-instruction">{demo.instruction}</p>
            {demo.live ? (
              <Link href="#access" className="demo-cta">
                申请入口 ↓
              </Link>
            ) : null}
          </article>
        ))}
      </section>

      {/* 未开放的展台不占一个整列，收成一条候场记录，避免半张空卡 */}
      {queuedDemos.length > 0 && (
        <section className="demo-queue" aria-label="候场中的展台">
          <span className="demo-queue-label">候场</span>
          {queuedDemos.map((demo) => (
            <div key={demo.title} className="demo-queue-row">
              <span className="demo-no">{demo.no}</span>
              <span className="demo-queue-title">{demo.title}</span>
              <span className="demo-queue-note">{demo.description}</span>
              <span className="demo-status">{demo.status}</span>
            </div>
          ))}
        </section>
      )}

      <section className="demo-pass" id="access">
        <div className="demo-pass-text">
          <p className="demo-pass-kicker">怎么拿到入口</p>
          <h2>口令按需生成，不公开挂在网上</h2>
          <p>
            口令单次有效一小时。加我微信说明要试哪个演示，我把入口和当日口令发你；添加时备注
            「leongao.me」，通过更快。
          </p>
          <Link href={`mailto:${siteMetadata.email}`} className="demo-mail">
            也可以发邮件给我 ↗
          </Link>
        </div>
        <div className="demo-pass-side">
          <WeChatCopy variant="ink" />
        </div>
      </section>
    </div>
  )
}
