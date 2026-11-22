import {
  Mail,
  Github,
  Facebook,
  Youtube,
  Linkedin,
  Twitter,
  X,
  Mastodon,
  Threads,
  Instagram,
  Medium,
  Bluesky,
  WeChat,
  JueJin,
} from './icons'

const components = {
  mail: Mail,
  github: Github,
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
  twitter: Twitter,
  x: X,
  mastodon: Mastodon,
  threads: Threads,
  instagram: Instagram,
  medium: Medium,
  bluesky: Bluesky,
  wechat: WeChat,
  juejin: JueJin,
}

type SocialIconProps = {
  kind: keyof typeof components
  href: string | undefined
  size?: number
  /** 读屏与悬浮提示用的中文名称，缺省时按 kind 映射 */
  label?: string
}

const LABELS: Partial<Record<keyof typeof components, string>> = {
  mail: '邮箱',
  github: 'GitHub',
  linkedin: 'LinkedIn',
  x: 'X',
  twitter: 'Twitter',
  wechat: '微信',
  juejin: '掘金',
  youtube: 'YouTube',
  instagram: 'Instagram',
  medium: 'Medium',
  threads: 'Threads',
  mastodon: 'Mastodon',
  bluesky: 'Bluesky',
  facebook: 'Facebook',
}

const SocialIcon = ({ kind, href, size = 8, label }: SocialIconProps) => {
  if (
    !href ||
    (kind === 'mail' && !/^mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(href))
  )
    return null

  const SocialSvg = components[kind]

  return (
    <a
      className="site-social-icon text-sm text-gray-500 transition hover:text-gray-600"
      target="_blank"
      rel="noopener noreferrer"
      href={href}
      aria-label={label ?? LABELS[kind] ?? kind}
      title={label ?? LABELS[kind] ?? kind}
    >
      <SocialSvg
        aria-hidden="true"
        className={`fill-current text-gray-700 hover:text-[var(--home-accent)] dark:text-gray-200 h-${size} w-${size}`}
      />
    </a>
  )
}

export default SocialIcon
