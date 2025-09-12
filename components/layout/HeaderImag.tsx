'use client'

import Loin2 from '@/data/lion2.png'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function HeaderImage() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <>
      <Image
        src={Loin2}
        alt="logo"
        width={100}
        style={{ filter: `invert(${theme === 'dark' ? '.6' : '0'})` }}
      />
    </>
  )
}
