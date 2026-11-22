'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'

const COLORS = { light: '#ffffff', dark: '#030712' }

/**
 * 移动端浏览器地址栏配色跟随站点主题。
 * 站点支持手动切换主题，静态的 prefers-color-scheme media 查询跟不上手动选择，
 * 因此这里在主题变化时直接改写那一条 theme-color。
 */
export default function ThemeColorSync() {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]:not([media])')
    if (!meta) return
    meta.setAttribute('content', resolvedTheme === 'dark' ? COLORS.dark : COLORS.light)
  }, [resolvedTheme])

  return null
}
