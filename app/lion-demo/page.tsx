import { genPageMetadata } from 'app/seo'
import LionMarkTrad from '@/components/layout/LionMarkTrad'

export const metadata = genPageMetadata({
  title: '狮纹标记演示',
  robots: { index: false, follow: false },
})

const sizes = [96, 144, 216, 288]
const inks = [
  { label: '墨蓝', value: '#1d3f72' },
  { label: '墨黑', value: '#14202b' },
  { label: '青绿', value: '#5be1c9' },
  { label: '鎏金', value: '#c9a15c' },
]

export default function LionDemoPage() {
  return (
    <div className="pt-6 pb-12">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">狮纹标记 · 静态版</h1>
      <p className="mt-2 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
        用户提供的传统狮纹线稿，potrace 矢量化，9 条
        path。这里只看形状与不同尺寸下的辨识度，不含动效。
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="text-xs tracking-widest text-gray-500">亮色背景</div>
          <div className="mt-6 flex flex-wrap items-end gap-6" style={{ color: '#1d3f72' }}>
            {sizes.map((s) => (
              <div key={s} className="text-center">
                <LionMarkTrad size={s} ink="#1d3f72" />
                <div className="mt-2 text-[11px] text-gray-500">{s}px</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#0b1620] p-6">
          <div className="text-xs tracking-widest text-gray-400">暗色背景</div>
          <div className="mt-6 flex flex-wrap items-end gap-6">
            {sizes.map((s) => (
              <div key={s} className="text-center">
                <LionMarkTrad size={s} ink="#5be1c9" />
                <div className="mt-2 text-[11px] text-gray-400">{s}px</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <h2 className="mt-10 text-lg font-semibold text-gray-900 dark:text-gray-100">
        配色候选（96px）
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {inks.map((c) => (
          <div
            key={c.label}
            className="flex flex-col items-center rounded-xl border border-gray-200 bg-white py-4 dark:border-gray-700 dark:bg-gray-800"
          >
            <LionMarkTrad size={96} ink={c.value} />
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {c.label} {c.value}
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Header 实际排布（96px）
      </h2>
      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
        <LionMarkTrad size={96} ink="#1d3f72" />
        <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
          LeonGao&apos;s Blog | 高立民的博客
        </span>
      </div>
    </div>
  )
}
