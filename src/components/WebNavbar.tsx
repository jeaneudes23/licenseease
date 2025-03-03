import { Lock, KeyRound, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import ApplicationLogo from './ApplicationLogo'
import { Button, buttonVariants } from './ui/button'

export default function WebNavbar() {
  return (
    <nav>
      <div className='container py-4 flex justify-between items-center'>
        <ApplicationLogo />
        <div className='flex items-center gap-4'>
          <Link href={'/check-license-validity'} className={'font-medium text-sm hover:underline p-2'}>Check validity</Link>
          <Link href={'/register'} className='px-3 py-2 rounded-md text-sm inline-flex gap-2 items-center bg-primary/10 text-primary font-medium tracking-wide' ><KeyRound className="size-4" /> Register </Link>
          <Link href={'/login'} className='px-3 py-2 rounded-md text-sm inline-flex gap-2 items-center bg-primary text-primary-foreground font-medium tracking-wide'><Lock className="size-4" /> Login</Link>
          <div className='relative group'>
            <button className=''><User className='size-6'/></button>
            <div className='absolute whitespace-pre top-10 grid right-0 bg-white py-2 rounded-md shadow-md w-40 pointer-events-none opacity-0 transition-all group-focus-within:opacity-100 group-focus-within:pointer-events-auto'>
              <Link href={'/profile'} className={'font-medium text-sm p-4 py-2 hover:bg-secondary'}>Customer name</Link>
              <Link href={'/applications'} className={'font-medium text-sm p-4 py-2 hover:bg-secondary'}>My applications</Link>
              <Link href={'/companies'} className={'font-medium text-sm p-4 py-2 hover:bg-secondary'}>My companies</Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
