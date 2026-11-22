/** 全站统一的日期写法：YYYY-MM-DD。比「2026年11月21日」在等宽字体里好扫，也与文章页一致。 */
export function editorialDate(date: string | Date): string {
  const value = new Date(date)
  if (Number.isNaN(value.getTime())) return ''
  return value.toLocaleDateString('sv-SE')
}

/** 阅读时长：不足一分钟按一分钟算，避免出现「0 分钟」；空值返回 null 由调用处决定是否渲染。 */
export function readingMinutes(minutes?: number | null): number | null {
  if (!minutes || minutes <= 0) return null
  return Math.max(1, Math.round(minutes))
}
