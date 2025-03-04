import { ApplicationsChart } from '@/features/dashboard/components/ApplicationsChart'
import DashboardStatsWidget from '@/features/dashboard/components/DashboardStatsWidget'
import NewApplications from '@/features/dashboard/components/NewApplications'
import { RenewalsChart } from '@/features/dashboard/components/RenewalsChart'
import React from 'react'

export default function page() {
  return (
    <main className='px-4 grid gap-8'>
      <DashboardStatsWidget />
      <div className='grid lg:grid-cols-2 gap-6'>
        <ApplicationsChart />
        <RenewalsChart />
      </div>
      <NewApplications />
    </main>
  )
}
