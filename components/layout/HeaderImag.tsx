'use client'

import Loin2 from '@/data/lion2.png'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function HeaderImage() {
  const { theme } = useTheme()

  const [themeClass, setThemeClass] = useState('')

  useEffect(() => {
    setThemeClass(`invert-[${theme === 'dark' ? '.6' : '0'}]`)
  }, [theme])

  return (
    <>
      <Image src={Loin2} alt="logo" width={100} className={themeClass} />
    </>
  )
}
