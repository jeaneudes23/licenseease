import { CheckCheck, Loader2, X } from 'lucide-react'
import React, { ReactNode } from 'react'

const STATS: Record<string,number> = {
  approved: 53000,
  rejected: 2300,
  pending: 3052,
}

const ICONS: Record<string,ReactNode> = {
  approved: <CheckCheck className='size-5' strokeWidth={4}/>,
  rejected: <X className='size-5' strokeWidth={4}/>,
  pending: <Loader2 className='size-5' strokeWidth={4}/>
}

export default function DashboardStatsWidget() {
  return (
    <div className='grid grid-cols-3 gap-8'>
      {Object.keys(STATS).map(status => 
        <div key={status} className='flex justify-between p-4 bg-white rounded-xl shadow-lg border'>
          <div className='grid gap-1'>
            <span className='font-semibold text-muted-foreground capitalize'>{status}</span>
            <span className='text-2xl font-bold'>{STATS[status]}</span>
          </div>
          <div className={`text-white grid place-content-center size-12 self-center rounded-xl ${status === 'approved' ? 'bg-accent' : status === 'rejected' ? 'bg-red-600' : 'bg-gray-400'}`}>
            {ICONS[status]}
          </div>
        </div>
      )}
    </div>
  )
}
