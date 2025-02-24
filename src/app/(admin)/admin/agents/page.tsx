import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AgentsDataTable from '@/features/agents/components/AgentsDataTable'
import Link from 'next/link'

import React from 'react'

export default function page() {
  return (
    <main className='grid gap-6 px-4'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl capitalize font-bold'>Agents</h2>
        <Link href={'/admin/agents/create'} className={buttonVariants()}>New Agent</Link>
      </div>
      <div>
        <Card>
          <CardHeader>
          </CardHeader>
          <CardContent>
            <AgentsDataTable />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
