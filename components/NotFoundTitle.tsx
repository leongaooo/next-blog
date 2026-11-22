'use client'

import { useEffect } from 'react'

const TITLE = '页面不存在（404） | 高立民 Leon Gao | 前端工程师 · AI Native'

export default function NotFoundTitle() {
  useEffect(() => {
    document.title = TITLE
  }, [])

  return null
}
