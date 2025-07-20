import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCheck, Loader2, X } from 'lucide-react'
import React, { ReactNode } from 'react'

const STATS: Record<string, number> = {
  approved: 53000,
  rejected: 2300,
  pending: 3052,
}

const ICONS: Record<string, ReactNode> = {
  approved: <CheckCheck className='size-5' strokeWidth={4} />,
  rejected: <X className='size-5' strokeWidth={4} />,
  pending: <Loader2 className='size-5' strokeWidth={4} />
}

export default function DashboardStatsWidget() {
  return (
    <div className='grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-8'>
      {Object.keys(STATS).map(status =>
        <Card key={status} >
          <CardHeader>
            <div className='flex justify-between'>
              <div className='grid gap-1'>
                <CardDescription className='font-medium capitalize'>{status}</CardDescription>
                <CardTitle className='text-2xl'>{STATS[status]}</CardTitle>
              </div>
              <div className={`text-white dark:text-gray-900 grid place-content-center size-12 self-center rounded-xl ${status === 'approved' ? 'bg-green-500 dark:bg-green-400' : status === 'rejected' ? 'bg-red-500 dark:bg-red-400' : 'bg-gray-500 dark:bg-gray-400'}`}>
                {ICONS[status]}
              </div>
            </div>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
