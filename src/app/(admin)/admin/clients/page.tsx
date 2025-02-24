import { Card, CardContent, CardHeader } from '@/components/ui/card'
import ClientsDataTable from '@/features/clients/components/ClientsDataTable'
import React from 'react'

export default function page() {
  return (
    <main className='grid gap-6 px-4'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl capitalize font-bold'>Clients</h2>
      </div>
      <div>
        <Card>
          <CardHeader>
          </CardHeader>
          <CardContent>
            <ClientsDataTable />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
