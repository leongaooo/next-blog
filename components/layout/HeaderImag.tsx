'use client'

import Loin2 from '@/data/lion2.png'
import Image from 'next/image'

export default function HeaderImage() {
  return (
    <>
      <Image src={Loin2} alt="logo" width={100} className="dark:invert" />
    </>
  )
}
