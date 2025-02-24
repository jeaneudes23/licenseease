import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ApplicationsDataTable from '@/features/applications/components/ApplicationsDataTable'
import React from 'react'

export default function page() {
  return (
    <main className='grid gap-6 px-4'>
      <div>
        <h2 className='text-2xl capitalize font-bold'>Applications</h2>
      </div>
      <div>
        <Card>
          <CardHeader>
          </CardHeader>
          <CardContent>
            <ApplicationsDataTable />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
