import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function ApplicationLogo() {
  return (
    <Link href={'/'} className='font-semibold text-xl text-primary inline-flex items-center gap-3'>
      <Image width={0} height={0} alt='logo' src={'/logo.svg'} className='w-8 h-auto' />
      {process.env.APP_NAME}
    </Link>
  )
}
