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
        .map((link) => (
          <Link
            key={link.title}
            href={link.href}
            aria-current={pathname === link.href ? 'page' : undefined}
            className="m-1 inline-flex min-h-6 items-center font-medium text-gray-900 transition-colors duration-200 hover:text-[var(--home-accent)] dark:text-gray-100"
          >
            {link.title}
          </Link>
        ))}
    </>
  )
}

export default NavLinks
