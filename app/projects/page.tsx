import projectsData from '@/data/projectsData'
import Card from '@/components/Card'
import { genPageMetadata } from 'app/seo'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/animations'

export const metadata = genPageMetadata({ title: 'Projects' })

export default function Projects() {
  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <FadeInUp delay={0.1}>
          <div className="space-y-2 pt-6 pb-8 md:space-y-5">
            <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
              Projects
            </h1>
            <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
              Here are some of the works I have created in the past. If you have any questions or
              issues regarding development or collaboration, please feel free to contact me. My
              WeChat is: Mintopia_.
            </p>
          </div>
        </FadeInUp>
        <FadeInUp delay={0.2}>
          <div className="py-12">
            <StaggerContainer>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {projectsData.map((d, index) => (
                  <StaggerItem key={d.title} delay={index * 0.1}>
                    <Card
                      title={d.title}
                      description={d.description}
                      imgSrc={d.imgSrc}
                      href={d.href}
                    />
                  </StaggerItem>
                ))}
              </div>
            </StaggerContainer>
          </div>
        </FadeInUp>
      </div>
    </>
  )
}
