import { ReactNode } from 'react'
import type { Authors } from 'contentlayer/generated'
import SocialIcon from '@/components/social-icons'
import Image from '@/components/Image'
import {
  FadeInUp,
  StaggerContainer,
  StaggerItem,
  HoverScale,
  SlideInFromLeft,
  SlideInFromRight,
} from '@/components/animations'

interface Props {
  children: ReactNode
  content: Omit<Authors, '_id' | '_raw' | 'body'>
}

export default function AuthorLayout({ children, content }: Props) {
  const { name, avatar, occupation, company, email, twitter, bluesky, linkedin, github } = content

  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <FadeInUp delay={0.1}>
          <div className="space-y-2 pt-6 pb-8 md:space-y-5">
            <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
              About
            </h1>
          </div>
        </FadeInUp>
        <div className="items-start space-y-2 xl:grid xl:grid-cols-[1fr_2fr] xl:space-y-0 xl:gap-x-8">
          <SlideInFromLeft delay={0.2}>
            <div className="flex flex-col items-center space-x-2 pt-8">
              {avatar && (
                <HoverScale scale={1.05}>
                  <Image
                    src={avatar}
                    alt="avatar"
                    width={192}
                    height={192}
                    className="h-48 w-48 rounded-full"
                  />
                </HoverScale>
              )}
              <FadeInUp delay={0.3}>
                <h3 className="pt-4 pb-2 text-2xl leading-8 font-bold tracking-tight">{name}</h3>
              </FadeInUp>
              <FadeInUp delay={0.4}>
                <div className="text-gray-500 dark:text-gray-400">{occupation}</div>
              </FadeInUp>
              <FadeInUp delay={0.5}>
                <div className="text-gray-500 dark:text-gray-400">{company}</div>
              </FadeInUp>
              <StaggerContainer>
                <div className="flex space-x-3 pt-6">
                  {email && (
                    <StaggerItem delay={0.6}>
                      <SocialIcon kind="mail" href={`mailto:${email}`} />
                    </StaggerItem>
                  )}
                  {github && (
                    <StaggerItem delay={0.7}>
                      <SocialIcon kind="github" href={github} />
                    </StaggerItem>
                  )}
                  {linkedin && (
                    <StaggerItem delay={0.8}>
                      <SocialIcon kind="linkedin" href={linkedin} />
                    </StaggerItem>
                  )}
                  {twitter && (
                    <StaggerItem delay={0.9}>
                      <SocialIcon kind="x" href={twitter} />
                    </StaggerItem>
                  )}
                  {bluesky && (
                    <StaggerItem delay={1.0}>
                      <SocialIcon kind="bluesky" href={bluesky} />
                    </StaggerItem>
                  )}
                </div>
              </StaggerContainer>
            </div>
          </SlideInFromLeft>
          <SlideInFromRight delay={0.3}>
            <div className="prose dark:prose-invert max-w-none pt-8 pb-8">
              <FadeInUp delay={0.4}>{children}</FadeInUp>
            </div>
          </SlideInFromRight>
        </div>
      </div>
    </>
  )
}
