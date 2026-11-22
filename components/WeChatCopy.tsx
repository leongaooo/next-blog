'use client'

import { useState } from 'react'

const WECHAT_ID = 'Mintopia_'

/**
 * 微信联系入口：一键复制微信号，避免访客只看到一串字符却不知道如何添加。
 */
export default function WeChatCopy({
  withHint = false,
  variant = 'default',
}: {
  withHint?: boolean
  /** ink：深底面板用（黑底 + 青色描边） */
  variant?: 'default' | 'ink' | 'plain'
}) {
  const ink = variant === 'ink'
  const plain = variant === 'plain'
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
    <div
      className={plain ? 'flex flex-col items-start gap-1.5' : 'flex flex-col items-center gap-2'}
    >
      <div
        className={
          plain
            ? 'flex flex-wrap items-center gap-2'
            : 'flex flex-wrap items-center justify-center gap-2'
        }
      >
        <span
          className={
            plain
              ? 'text-[13px] text-[var(--home-subtle)]'
              : ink
                ? 'text-sm text-white/60'
                : 'text-sm text-gray-600 dark:text-gray-300'
          }
        >
          微信
        </span>
        <code
          className={
            plain
              ? 'font-mono text-[13px] font-semibold text-[var(--home-strong)]'
              : ink
                ? 'rounded-md border border-white/15 bg-white/5 px-3 py-1 font-mono text-base font-semibold text-white'
                : 'rounded-md bg-white px-3 py-1 font-mono text-base font-semibold text-gray-900 shadow-sm dark:bg-gray-900 dark:text-gray-100'
          }
        >
          {WECHAT_ID}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className={
            plain
              ? 'text-[12.5px] text-[var(--home-accent)] hover:underline'
              : ink
                ? 'rounded-md border border-[#5be1c9] px-3 py-1 text-sm font-medium text-[#5be1c9] transition-colors hover:bg-[#5be1c9] hover:text-[#07110f]'
                : 'rounded-md border border-[#0f6b5e] px-3 py-1 text-sm font-medium text-[#0f6b5e] transition-colors hover:bg-[#0f6b5e] hover:text-white dark:border-[#5be1c9] dark:text-[#5be1c9] dark:hover:bg-[#5be1c9] dark:hover:text-[#07110f]'
          }
        >
          {copied ? '已复制' : '复制微信号'}
        </button>
      </div>
      {withHint && (
        <p className={ink ? 'text-xs text-white/50' : 'text-xs text-gray-500 dark:text-gray-400'}>
          添加时请备注「leongao.me」，我会把入口与当日口令发给你。
        </p>
      )}
    </div>
  )
}
