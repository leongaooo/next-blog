import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import MobileNav from './MobileNav'
import ThemeSwitch from './ThemeSwitch'
import SearchButton from './SearchButton'
import HeaderImage from './layout/HeaderImag'
import Link from 'next/link'
import { SlideInFromLeft, SlideInFromRight, FadeInUp } from './animations'

const Header = () => {
  let headerClass = 'flex items-center w-full bg-white dark:bg-gray-950 justify-between py-10'
  if (siteMetadata.stickyNav) {
    headerClass += ' sticky top-0 z-50'
  }

  return (
    <header className={headerClass}>
      <SlideInFromLeft delay={0.1}>
        <Link href="/" aria-label={siteMetadata.headerTitle}>
          <div className="flex items-center justify-between">
            <div className="mr-3">
              <HeaderImage />
            </div>
            {typeof siteMetadata.headerTitle === 'string' ? (
              <div className="hidden h-6 text-2xl font-semibold sm:block">
                {siteMetadata.headerTitle}
              </div>
            ) : (
              siteMetadata.headerTitle
            )}
          </div>
        </Link>
      </SlideInFromLeft>
      <SlideInFromRight delay={0.2}>
        <div className="flex items-center space-x-4 leading-5 sm:-mr-6 sm:space-x-6">
          <FadeInUp delay={0.3}>
            <div className="no-scrollbar hidden max-w-40 items-center gap-x-4 overflow-x-auto sm:flex md:max-w-72 lg:max-w-96">
              {headerNavLinks
                .filter((link) => link.href !== '/')
                .map((link) => (
                  <Link
                    key={link.title}
                    href={link.href}
                    className="hover:text-primary-500 dark:hover:text-primary-400 m-1 font-medium text-gray-900 transition-colors duration-200 dark:text-gray-100"
                  >
                    {link.title}
                  </Link>
                ))}
            </div>
          </FadeInUp>
          <FadeInUp delay={0.4}>
            <SearchButton />
          </FadeInUp>
          <FadeInUp delay={0.5}>
            <ThemeSwitch />
          </FadeInUp>
          <FadeInUp delay={0.6}>
            <MobileNav />
          </FadeInUp>
        </div>
      </SlideInFromRight>
    </header>
  )
}

export default Header
