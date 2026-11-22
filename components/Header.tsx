import siteMetadata from '@/data/siteMetadata'
import MobileNav from './MobileNav'
import NavLinks from './NavLinks'
import ThemeSwitch from './ThemeSwitch'
import SiteSearch from './SiteSearch'
import Link from 'next/link'
import { SlideInFromLeft, SlideInFromRight, FadeInUp } from './animations'

const Header = () => {
  let headerClass =
    'relative flex items-center w-full bg-[var(--home-bg)] justify-between py-6 sm:py-8'
  if (siteMetadata.stickyNav) {
    headerClass += ' sticky top-0 z-50'
  }

  return (
    <header className={headerClass}>
      <SlideInFromLeft delay={0.1}>
        <Link href="/" aria-label={siteMetadata.headerTitle}>
          <div className="flex items-center justify-between">
            {typeof siteMetadata.headerTitle === 'string' ? (
              <>
                <div className="text-lg font-semibold sm:hidden">高立民</div>
                <div className="hidden h-6 text-2xl font-semibold sm:block">
                  {siteMetadata.headerTitle}
                </div>
              </>
            ) : (
              siteMetadata.headerTitle
            )}
          </div>
        </Link>
      </SlideInFromLeft>
      <SlideInFromRight delay={0.2}>
        <div className="flex items-center space-x-4 leading-5 sm:-mr-6 sm:space-x-6">
          <FadeInUp delay={0.3}>
            <nav aria-label="主导航" className="hidden items-center gap-x-3 md:flex">
              <NavLinks />
            </nav>
          </FadeInUp>
          <FadeInUp delay={0.4}>
            <SiteSearch />
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
