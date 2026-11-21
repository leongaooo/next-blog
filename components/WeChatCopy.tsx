'use client'

import { useState } from 'react'

const WECHAT_ID = 'Mintopia_'

/**
 * 微信联系入口：一键复制微信号，避免访客只看到一串字符却不知道如何添加。
 */
export default function WeChatCopy({ withHint = false }: { withHint?: boolean }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(WECHAT_ID)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-300">微信</span>
        <code className="rounded-md bg-white px-3 py-1 font-mono text-base font-semibold text-gray-900 shadow-sm dark:bg-gray-900 dark:text-gray-100">
          {WECHAT_ID}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className="border-primary-500 text-primary-600 hover:bg-primary-500 dark:border-primary-400 dark:text-primary-300 dark:hover:bg-primary-500 rounded-md border px-3 py-1 text-sm font-medium transition-colors hover:text-white dark:hover:text-white"
        >
          {copied ? '已复制' : '复制微信号'}
        </button>
      </div>
      {withHint && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          添加时请备注「leongao.me」，我会把入口与当日口令发给你。
        </p>
      )}
    </div>
  )
}
