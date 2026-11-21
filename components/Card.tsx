import Image from './Image'
import Link from './Link'
import { HoverScale } from './animations'

interface CardProps {
  title: string
  description: string
  href?: string
  demoHref?: string
  imgSrc?: string
  stack?: string[]
  highlight?: string
  year?: string
}

const Card = ({
  title,
  description,
  imgSrc,
  href,
  demoHref,
  stack,
  highlight,
  year,
}: CardProps) => {
  const previewHref = demoHref || href

  return (
    <HoverScale scale={1.02}>
      <div
        className={`${
          imgSrc && 'h-full'
        } flex h-full flex-col overflow-hidden rounded-md border-2 border-gray-200/60 transition-shadow duration-300 hover:shadow-lg dark:border-gray-700/60`}
      >
        {imgSrc &&
          (previewHref ? (
            <Link href={previewHref} aria-label={`Open ${title}`}>
              <Image
                alt={title}
                src={imgSrc}
                className="object-cover object-center md:h-36 lg:h-48"
                width={544}
                height={306}
              />
            </Link>
          ) : (
            <Image
              alt={title}
              src={imgSrc}
              className="object-cover object-center md:h-36 lg:h-48"
              width={544}
              height={306}
            />
          ))}
        <div className="flex flex-1 flex-col p-6">
          <div className="mb-3 flex items-start justify-between gap-3">
            <h2 className="text-2xl leading-8 font-bold tracking-tight">
              {previewHref ? (
                <Link href={previewHref} aria-label={`Open ${title}`}>
                  {title}
                </Link>
              ) : (
                title
              )}
            </h2>
            {year && (
              <span className="shrink-0 text-sm text-gray-500 dark:text-gray-400">{year}</span>
            )}
          </div>
          {highlight && (
            <p className="text-primary-500 dark:text-primary-400 mb-3 text-base leading-6 font-medium">
              {highlight}
            </p>
          )}
          <p className="prose mb-4 max-w-none text-gray-500 dark:text-gray-400">{description}</p>
          {stack && stack.length > 0 && (
            <ul className="mb-6 flex flex-wrap gap-2" aria-label={`${title} technology stack`}>
              {stack.map((item) => (
                <li
                  key={item}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
          {(demoHref || href) && (
            <div className="mt-auto flex flex-wrap gap-3">
              {demoHref && (
                <Link
                  href={demoHref}
                  className="bg-primary-500 hover:bg-primary-600 rounded-md px-4 py-2 text-sm leading-5 font-medium text-white transition-colors"
                  aria-label={`在线体验 ${title}`}
                >
                  在线体验 ↗
                </Link>
              )}
              {href && (
                <Link
                  href={href}
                  className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 rounded-md border border-gray-300 px-4 py-2 text-sm leading-5 font-medium transition-colors dark:border-gray-600"
                  aria-label={`查看 ${title} 源码`}
                >
                  源码 ↗
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </HoverScale>
  )
}

export default Card
