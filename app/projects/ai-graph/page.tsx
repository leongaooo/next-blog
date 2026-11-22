import Link from 'next/link'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({
  title: 'ai-graph：把文案画成可复现的插画',
  description:
    'ai-graph 用脚本把一段 Brief 渲染成静态 SVG 场景：纸白、墨、青绿、琥珀六色，−30°/−15° 轴测，纸底加六层合成，同一 seed 重跑逐字节一致。',
})

const SCENES = [
  {
    no: '01',
    title: '落笔之前，位置已经算好',
    file: '/static/images/ai-graph/spec-to-scene.svg',
    alt: '制图室场景：作者坐在桌前在草图纸上落笔，同一张图纸由草稿、网格校样进入墨线成品的观测亭，左侧是标题与编号。',
    facts: ['79,191 B', '433 条路径', 'seed 306041', 'sha1 70326423'],
    note: '草稿、网格、成品三张纸其实是同一座观测亭的三种状态。人物在左，成品在右下三分区，琥珀日轮是画面里唯一的暖色。',
  },
  {
    no: '02',
    title: '平面图能被读出高度',
    file: '/static/images/ai-graph/iso-rebuild.svg',
    alt: '轴测重建场景：一面面墙体从平面轮廓立起来，分层切片堆叠，标注线标出尺寸，成品立在画面中间。',
    facts: ['65,693 B', '412 条路径', '428 个节点', 'seed 412907', 'sha1 56a1a0e3'],
    note: '21 面墙、4 层切片由同一份轮廓推导，先在平面里排好，再沿高度轴立起。笔迹数量写在图内，出图后可以逐项回查。',
  },
  {
    no: '03',
    title: '推理链画成等轴测的场',
    file: '/static/images/ai-graph/inference-field.svg',
    alt: '推理场场景：四层平台沿轴测方向错落排布，四个门禁节点立在通道上，连线表示一次推理的走向。',
    facts: ['50,338 B', '268 条路径', '284 个节点', 'seed 731109', 'sha1 dd84c9d0'],
    note: '4 层平台对应一次推理的四段，4 个门禁对应出图前必须通过的检查。连线不做发光，靠线宽与墨色区分主次。',
  },
]

const PALETTE = [
  { name: '纸白', hex: '#F7F6F1' },
  { name: '墨', hex: '#141A1F' },
  { name: '灰绿', hex: '#3D4A47' },
  { name: '雾', hex: '#8A948E' },
  { name: '青绿', hex: '#0F6B5E' },
  { name: '琥珀', hex: '#B4761F' },
]

const LAYERS = [
  ['paper', '纸底', '颗粒与边缘，先铺满整张画布'],
  ['grid', '网格', '轴测地面线，只做定位参考'],
  ['env', '环境', '桌、墙、地，先立空间'],
  ['subject', '主体', '图纸、观测亭、人物，画面的论点'],
  ['prop', '道具', '显示器、灯、笔、纸卷，补足现场'],
  ['type', '文字', '编号、标题、尺寸标注，最后落'],
  ['texture', '肌理', '半调与墨点，压住整体色调'],
]

export default function AiGraphCase() {
  return (
    <div className="ag-page">
      <header className="ag-hero">
        <p className="ag-kicker">CASE · 制图室 01—03</p>
        <h1 className="ag-h1">把文案变成可复现的插画</h1>
        <p className="ag-lede">
          同一份 Brief、同一个 seed，重跑得到逐字节相同的 SVG。人物、文字、装饰在画出来之前，
          位置就已经由坐标和门禁定好——不是抽卡，是制图。
        </p>
        <ul className="ag-meta">
          <li>1200 × 675</li>
          <li>−30° / −15° 轴测</li>
          <li>静态 SVG，无运行时 JS</li>
          <li>seed 306041</li>
        </ul>
      </header>

      <section className="ag-figure ag-figure--lead" aria-label="场景 01 落笔之前">
        <img
          src="/static/images/ai-graph/spec-to-scene.svg"
          alt="制图室场景：作者坐在桌前在草图纸上落笔，同一张图纸由草稿、网格校样进入墨线成品的观测亭，左侧是标题与编号。"
          width={1200}
          height={675}
        />
        <a
          className="ag-orig"
          href="/static/images/ai-graph/spec-to-scene.svg"
          target="_blank"
          rel="noreferrer"
        >
          原图 · 1200 × 675 ↗
        </a>
        <div className="ag-caption">
          <div className="ag-caption-head">
            <span className="ag-no">01</span>
            <h2>落笔之前，位置已经算好</h2>
          </div>
          <p>
            草稿、网格、成品三张纸，其实是同一座观测亭的三种状态。人物在左，成品落在右下三分区，
            琥珀日轮是整张图唯一的暖色。
          </p>
          <dl className="ag-facts">
            <div>
              <dt>体积</dt>
              <dd>79,191 B</dd>
            </div>
            <div>
              <dt>笔迹</dt>
              <dd>433 条</dd>
            </div>
            <div>
              <dt>主体包围盒</dt>
              <dd>38.28%</dd>
            </div>
            <div>
              <dt>文字溢出</dt>
              <dd>0 处</dd>
            </div>
            <div>
              <dt>半调覆盖</dt>
              <dd>0.7%</dd>
            </div>
            <div>
              <dt>琥珀面积</dt>
              <dd>0.04%</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="ag-section" aria-labelledby="ag-why">
        <p className="ag-kicker">WHY THIS WAY</p>
        <h2 className="ag-h2" id="ag-why">
          三条约束，决定了它长这样
        </h2>
        <ul className="ag-rules">
          <li>
            <h3>可复现</h3>
            <p>
              抖动、半调、笔触偏移全部来自确定性随机数，seed 写进产物。本轮把 01 重跑一次， sha1
              仍是 <code>70326423…</code>，与入库版本逐字节一致。
            </p>
          </li>
          <li>
            <h3>可审</h3>
            <p>
              出图前先跑 <code>scene-visual-lint</code>：装饰不得压在主体与前景文字上，accent
              有安全区，装饰预算不超过 10，主体顶边不许被裁。几何问题在提交前就该被拦下。
            </p>
          </li>
          <li>
            <h3>可交付</h3>
            <p>
              产物就是单个 SVG，不依赖运行时脚本，最大一张 79
              KB。放进博客、项目卡、演示页都不用再转格式。
            </p>
          </li>
        </ul>
      </section>

      <section className="ag-section ag-system" aria-labelledby="ag-system">
        <p className="ag-kicker">SYSTEM</p>
        <h2 className="ag-h2" id="ag-system">
          六色、一台相机、七层
        </h2>
        <div className="ag-system-grid">
          <div>
            <h3 className="ag-sub">色板</h3>
            <ul className="ag-palette">
              {PALETTE.map((c) => (
                <li key={c.hex}>
                  <span className="ag-swatch" style={{ background: c.hex }} aria-hidden="true" />
                  <strong>{c.name}</strong>
                  <code>{c.hex}</code>
                </li>
              ))}
            </ul>
            <p className="ag-hint">全图只用这六色，不叠渐变，不加发光。</p>
          </div>
          <div>
            <h3 className="ag-sub">相机</h3>
            <p className="ag-body">
              固定 −30° / −15° 两台旋转角，等价于 30° 轴测。所有对象先落在同一套三维坐标里， 再由{' '}
              <code>project3d</code> 投到 1200 × 675 的画布，安全边距 10。
            </p>
            <h3 className="ag-sub">图层</h3>
            <ul className="ag-layers">
              {LAYERS.map(([id, name, desc]) => (
                <li key={id}>
                  <code>{id}</code>
                  <span>{name}</span>
                  <p>{desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="ag-grid" aria-label="场景 02 与 03">
        {SCENES.slice(1).map((s) => (
          <article className="ag-figure" key={s.no}>
            <img src={s.file} alt={s.alt} width={1200} height={675} />
            <a className="ag-orig" href={s.file} target="_blank" rel="noreferrer">
              原图 · 1200 × 675 ↗
            </a>
            <div className="ag-caption">
              <div className="ag-caption-head">
                <span className="ag-no">{s.no}</span>
                <h2>{s.title}</h2>
              </div>
              <p>{s.note}</p>
              <ul className="ag-tags">
                {s.facts.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="ag-section" aria-labelledby="ag-gate">
        <p className="ag-kicker">GATES</p>
        <h2 className="ag-h2" id="ag-gate">
          出图前先过门禁
        </h2>
        <div className="ag-gate-grid">
          <ul className="ag-gate-list">
            <li>装饰节点的 z 序不得晚于文字</li>
            <li>装饰与主体、前景文字的重叠面积有阈值</li>
            <li>accent 装饰与主体/道具保持安全区</li>
            <li>非满版装饰不超过 10 个</li>
            <li>主体顶边不得被裁切</li>
            <li>尺寸、色数、文字溢出、琥珀占比逐项记账</li>
          </ul>
          <pre className="ag-code">
            <code>{`# 渲染 01 场景（同 seed 得到同一份 SVG）
node tools/build-scene.mjs art/spec-to-scene.art.json

# 出图前检查装饰遮挡与预算
node tools/scene-visual-lint.mjs out/spec-to-scene.scene.json

# 核对体积、色数、主体占比、文字溢出
node tools/art-lint.mjs art/spec-to-scene.art.json`}</code>
          </pre>
        </div>
      </section>

      <section className="ag-section ag-bounds" aria-labelledby="ag-bounds">
        <p className="ag-kicker">BOUNDARIES</p>
        <h2 className="ag-h2" id="ag-bounds">
          它不做什么
        </h2>
        <ul className="ag-rules">
          <li>
            <h3>不是生成模型出图</h3>
            <p>没有像素或栅格环节，每一笔都由脚本按坐标绘制，所以才能谈逐字节复现。</p>
          </li>
          <li>
            <h3>不承担文案</h3>
            <p>标题、编号、尺寸标注是文字节点，内容仍要人工定稿；脚本只负责摆放与断行。</p>
          </li>
          <li>
            <h3>不替代审美判断</h3>
            <p>门禁只拦几何问题：遮挡、裁切、预算、溢出。构图好不好看，仍然要人看图说话。</p>
          </li>
        </ul>
      </section>

      <section className="ag-foot" aria-label="入口">
        <p>
          三张场景都来自同一套生成链。源码、场景 JSON 与门禁脚本都在仓库里，换个 seed
          就是另一版制图。
        </p>
        <div className="ag-actions">
          <a className="proj-link proj-link--primary" href="http://154.8.178.202/ai-graph/">
            在线演示 <span aria-hidden="true">↗</span>
          </a>
          <a className="proj-link" href="https://github.com/leongaooo/ai-graph">
            源码仓库 <span aria-hidden="true">↗</span>
          </a>
          <Link className="proj-link" href="/projects">
            回到作品墙 <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </div>
  )
}
