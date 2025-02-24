import DashboardStatsWidget from '@/features/dashboard/components/DashboardStatsWidget'
import NewApplications from '@/features/dashboard/components/NewApplications'
import React from 'react'

export default function page() {
  return (
    <main className='px-4 grid gap-8'>
      <DashboardStatsWidget />
      <NewApplications />
    </main>
  )
}
