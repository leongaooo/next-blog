'use client'

import { useEffect } from 'react'

/**
 * 文章目录跟随滚动位置标记当前章节（宽屏目录改成右侧粘性栏后才真正可见）。
 * 不改变服务端输出：只在浏览器里给当前条加 aria-current="location"。
 */
export default function TocHighlight() {
  useEffect(() => {
    const heads = Array.from(
      document.querySelectorAll<HTMLElement>('.post-copy h2[id], .post-copy h3[id]')
    )
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.post-toc a[href^="#"]'))
    if (!heads.length || !links.length) return

    let frame = 0
    const update = () => {
      frame = 0
      const line = 150
      let index = 0
      for (let i = 0; i < heads.length; i += 1) {
        if (heads[i].getBoundingClientRect().top <= line) index = i
      }
      const nearBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 140
      if (nearBottom) index = heads.length - 1

      // 目录只有一级条目：落在没进目录的小节里时，继续向上找最近的目录条目
      const hrefs = new Set(links.map((link) => link.getAttribute('href')))
      let current = heads[index].id
      for (let i = index; i >= 0; i -= 1) {
        if (hrefs.has(`#${heads[i].id}`)) {
          current = heads[i].id
          break
        }
      }

      for (const link of links) {
        if (link.getAttribute('href') === `#${current}`) {
          link.setAttribute('aria-current', 'location')
        } else {
          link.removeAttribute('aria-current')
        }
      }
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return null
}
