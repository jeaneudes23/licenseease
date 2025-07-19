import DashboardNavbar from '@/features/dashboard/components/DashboardNavbar'
import DashboardSidebar from '@/features/dashboard/components/DashboardSidebar'
import React, { PropsWithChildren } from 'react'

export default function layout({children}: PropsWithChildren) {
  return (
    <div className='grid grid-cols-[256px,1fr] items-start bg-background text-foreground min-h-screen'>
      <DashboardSidebar />
      <div className='h-dvh flex flex-col bg-gray-50 dark:bg-gray-900'>
        <DashboardNavbar />
        <div className='flex-grow overflow-y-auto pb-12'>
          {children}
        </div>
      </div>
    </div>
  )
}
