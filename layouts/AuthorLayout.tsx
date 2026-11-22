import { ReactNode } from 'react'
import type { Authors } from 'contentlayer/generated'
import SocialIcon from '@/components/social-icons'
import Image from '@/components/Image'
import IdentityLinks from '@/components/IdentityLinks'

interface Props {
  children: ReactNode
  content: Omit<Authors, '_id' | '_raw' | 'body'>
}

export default function AuthorLayout({ children, content }: Props) {
  const { name, avatar, occupation, company, email, twitter, linkedin, github } = content
  const roleLines = occupation ? occupation.split('/').map((line) => line.trim()) : []

  return (
    <div className="about-page">
      <section className="about-hero">
        <p className="proj-kicker">PROFILE · 前端 / 3D / 全栈</p>
        <h1 className="proj-h1">关于</h1>
        <p className="proj-lede">
          做过的东西都尽量留了可点开的入口。这里是我现在在做什么、怎么联系。
        </p>
      </section>

      <div className="about-body">
        <aside className="about-side">
          {avatar && (
            <Image src={avatar} alt="Leon Gao" width={192} height={192} className="about-avatar" />
          )}
          <h2 className="about-name">{name}</h2>
          {roleLines.length > 0 && (
            <p className="about-role">
              {roleLines.map((line) => (
                <span key={line} className="about-role-line">
                  {line}
                </span>
              ))}
            </p>
          )}
          {company && <p className="about-org">{company}</p>}
          <div className="about-icons">
            {email && <SocialIcon kind="mail" href={`mailto:${email}`} />}
            {github && <SocialIcon kind="github" href={github} />}
            {linkedin && <SocialIcon kind="linkedin" href={linkedin} />}
            {twitter && <SocialIcon kind="x" href={twitter} />}
          </div>
          <div className="about-links">
            <IdentityLinks />
          </div>
        </aside>
        <div className="about-copy">{children}</div>
      </div>
    </div>
  )
}
