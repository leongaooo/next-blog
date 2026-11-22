'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import headerNavLinks from '@/data/headerNavLinks'

const NavLinks = () => {
  const pathname = usePathname()

  return (
    <>
      {headerNavLinks
        .filter((link) => link.href !== '/')
        .map((link) => {
          // 子页面（/blog/xxx、/tags/ai）也算在这个栏目里，不然进去就看不出自己在哪
          const exact = pathname === link.href
          const inSection = exact || pathname.startsWith(`${link.href}/`)
          return (
            <Link
              key={link.title}
              href={link.href}
              aria-current={exact ? 'page' : inSection ? 'true' : undefined}
              className={inSection ? 'nav-link nav-link--on' : 'nav-link'}
            >
              {link.title}
            </Link>
          )
        })}
    </>
  )
}

export default NavLinks
