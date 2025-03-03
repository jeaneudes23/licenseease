import { buttonVariants } from '@/components/ui/button'
import AccountEditForm from '@/features/accounts/components/AccountEditForm'
import ProfileEditForm from '@/features/accounts/components/ProfileEditForm'
import Link from 'next/link'
import React from 'react'


const validTabs = ['account','profile'] as const
type ValidTab = typeof validTabs[number]

interface Props {
  searchParams: {
    tab: string
  }
}

export default function page({searchParams}: Props) {

  const current  = validTabs.includes(searchParams.tab as any) ? searchParams.tab as ValidTab : "account" as ValidTab

  return (
    <div className='container grid grid-cols-[200px,1fr] items-start py-12'>
      <div className='grid gap-2 text-sm lg:pr-4'>
        <Link href={'/profile?tab=account'} className={`p-2 rounded-md font-medium tracking-wide ${current == 'account' ? 'bg-primary text-primary-foreground': ''}`}>Account</Link>
        <Link href={'/profile?tab=profile'} className={`p-2 rounded-md font-medium tracking-wide ${current == 'profile' ? 'bg-primary text-primary-foreground': ''}`}>Profile</Link>
      </div>
      <main className='lg:pl-8 lg:border-l-2'>
        <div>
          {current === 'account' && <AccountEditForm />}
          {current === 'profile' && <ProfileEditForm />}
        </div>
      </main>
    </div>
  )
}
