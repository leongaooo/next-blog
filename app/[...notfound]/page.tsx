import { notFound } from 'next/navigation'

export const metadata = {
  title: '页面不存在（404）',
  description: '这条路径不存在，可能是链接改过名。',
  robots: { index: false, follow: true },
}

export default function CatchAll() {
  notFound()
}
